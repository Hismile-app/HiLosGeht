import db from '../config/db';

export interface AnomalyReport {
  machine: string;
  issue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  fuelPerHour?: number;
  date?: string;
  operator?: string;
}

export interface MaintenanceForecast {
  machine: string;
  currentHours: number;
  threshold: number;
  hoursRemaining: number;
  status: 'NORMAL' | 'UPCOMING' | 'OVERDUE';
  serviceDescription: string;
}

export interface AISummaryResult {
  weeklySummary: string;
  totalHoursWorked: number;
  totalFuelLiters: number;
  totalTripsLogged: number;
  costPerHourAverageKES: number;
  anomalies: AnomalyReport[];
  maintenanceForecasts: MaintenanceForecast[];
}

export async function generateOperationalAIInsights(days: number = 7): Promise<AISummaryResult> {
  // 1. Fetch recent staff logs
  const logsRes = await db.query(`
    SELECT 
      l.id,
      l.start_meter,
      l.end_meter,
      (l.end_meter - l.start_meter) as hours_worked,
      l.fuel_amount,
      l.work_description,
      l.date_submitted,
      a.name as machine_name,
      a.model as machine_model,
      a.category as machine_category,
      p.full_name as operator_name
    FROM public.staff_logs l
    JOIN public.physical_assets a ON l.equipment_id = a.id
    LEFT JOIN public.profiles p ON l.staff_id = p.id
    WHERE l.date_submitted >= (NOW() - ($1 || ' days')::interval)
    ORDER BY l.date_submitted DESC;
  `, [days]);

  const logs = logsRes.rows;

  let totalHours = 0;
  let totalFuel = 0;
  let totalTrips = 0;
  const anomalies: AnomalyReport[] = [];

  for (const log of logs) {
    const hours = parseFloat(log.hours_worked) || 0;
    const fuel = parseFloat(log.fuel_amount) || 0;

    totalHours += hours;
    totalFuel += fuel;

    // Detect trips from text
    const tripsMatch = log.work_description?.match(/(\d+)\s*trips?/i);
    if (tripsMatch) {
      totalTrips += parseInt(tripsMatch[1], 10);
    }

    // Anomaly Rule 1: High Fuel Consumption per Hour (e.g. > 45L/hr)
    if (hours > 0 && fuel > 0) {
      const fuelPerHour = fuel / hours;
      if (fuelPerHour > 45.0) {
        anomalies.push({
          machine: log.machine_name || log.machine_model,
          issue: `Unusually High Fuel Consumption: ${fuel} Litres consumed for ${hours.toFixed(1)} engine hours (${fuelPerHour.toFixed(1)} L/hr). Normal expected range: 18-30 L/hr.`,
          severity: fuelPerHour > 60 ? 'CRITICAL' : 'HIGH',
          recommendation: 'Inspect fuel injectors, check for physical tank leakage or unmetered auxiliary idling.',
          fuelPerHour: parseFloat(fuelPerHour.toFixed(2)),
          date: log.date_submitted,
          operator: log.operator_name,
        });
      }
    }

    // Anomaly Rule 2: Fuel with zero/negligible hours
    if (hours < 0.5 && fuel > 20.0) {
      anomalies.push({
        machine: log.machine_name || log.machine_model,
        issue: `Fuel Purchase without Working Hours: ${fuel} Litres logged for only ${hours.toFixed(1)} engine hours.`,
        severity: 'CRITICAL',
        recommendation: 'Audit fuel transaction receipt and verify operator M-Pesa submission.',
        date: log.date_submitted,
        operator: log.operator_name,
      });
    }

    // Anomaly Rule 3: Excessive daily shift
    if (hours > 14.0) {
      anomalies.push({
        machine: log.machine_name || log.machine_model,
        issue: `Excessive Daily Shift Duration: ${hours.toFixed(1)} continuous hours logged in a single submission.`,
        severity: 'MEDIUM',
        recommendation: 'Enforce operator rest intervals to maintain jobsite safety in Meru.',
        date: log.date_submitted,
        operator: log.operator_name,
      });
    }
  }

  // 2. Fetch Maintenance Forecasts
  const maintRes = await db.query(`
    SELECT 
      a.name as machine_name,
      a.current_hour_meter,
      m.threshold_hours,
      m.service_description
    FROM public.physical_assets a
    JOIN public.maintenance_triggers m ON a.id = m.equipment_id;
  `);

  const maintenanceForecasts: MaintenanceForecast[] = maintRes.rows.map((m: any) => {
    const current = parseFloat(m.current_hour_meter) || 0;
    const threshold = parseFloat(m.threshold_hours) || 0;
    const diff = threshold - current;

    let status: 'NORMAL' | 'UPCOMING' | 'OVERDUE' = 'NORMAL';
    if (diff <= 0) {
      status = 'OVERDUE';
    } else if (diff <= 30) {
      status = 'UPCOMING';
    }

    return {
      machine: m.machine_name,
      currentHours: current,
      threshold,
      hoursRemaining: diff,
      status,
      serviceDescription: m.service_description,
    };
  });

  const fuelCostPerLiterKES = 180.0;
  const totalFuelCostKES = totalFuel * fuelCostPerLiterKES;
  const costPerHourAvg = totalHours > 0 ? (totalFuelCostKES / totalHours) : 0;

  const weeklySummary = `Operations Summary (Past ${days} Days): Fleet logged ${totalHours.toFixed(1)} aggregate operational hours and consumed ${totalFuel.toFixed(1)} Litres of fuel across active jobsites in Meru County. Total recorded haulage throughput reached ${totalTrips} material trips. Average fuel operational cost calculated at KES ${costPerHourAvg.toFixed(2)}/hour. ${anomalies.length > 0 ? `🚨 ${anomalies.length} operational anomalies detected and flagged for administrative inspection.` : '✅ All machinery operating within nominal parameters.'}`;

  return {
    weeklySummary,
    totalHoursWorked: parseFloat(totalHours.toFixed(1)),
    totalFuelLiters: parseFloat(totalFuel.toFixed(1)),
    totalTripsLogged: totalTrips,
    costPerHourAverageKES: parseFloat(costPerHourAvg.toFixed(2)),
    anomalies,
    maintenanceForecasts,
  };
}

export default { generateOperationalAIInsights };
