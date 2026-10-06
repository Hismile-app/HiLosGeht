import db from '@/lib/server-config/db';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'qwen/qwen3.8-27b';

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

/**
 * Executes a resilient LLM chat completion against Groq
 * Tries the 120B reasoning model first, falling back to 27B if needed.
 */
export async function callGroqChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  maxTokens: number = 1000
): Promise<string> {
  const models = [GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL];

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && typeof content === 'string' && content.trim().length > 0) {
          return content.trim();
        }
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn(`Groq model ${model} failed with status ${res.status}:`, errJson?.error?.message);
      }
    } catch (err: any) {
      console.warn(`Groq network error on ${model}:`, err.message);
    }
  }

  return '';
}

/**
 * Generates operational intelligence & anomaly analysis backed by Groq AI and database telemetry
 */
export async function generateOperationalAIInsights(days: number = 7): Promise<AISummaryResult> {
  // 1. Fetch recent staff logs from real database
  let logs: any[] = [];
  try {
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
    logs = logsRes.rows;
  } catch (err: any) {
    console.warn('Database staff_logs query error:', err.message);
  }

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

    // Anomaly Rule 1: High Fuel Consumption per Hour (> 45L/hr)
    if (hours > 0 && fuel > 0) {
      const fuelPerHour = fuel / hours;
      if (fuelPerHour > 45.0) {
        anomalies.push({
          machine: log.machine_name || log.machine_model,
          issue: `Excessive Fuel Burn Rate: ${fuel} Litres consumed across ${hours.toFixed(1)} engine hours (${fuelPerHour.toFixed(1)} L/hr). Standard benchmark is 18–30 L/hr.`,
          severity: fuelPerHour > 60 ? 'CRITICAL' : 'HIGH',
          recommendation: 'Inspect fuel injectors, verify mechanical load factors, and check for leakage or excessive auxiliary idling.',
          fuelPerHour: parseFloat(fuelPerHour.toFixed(2)),
          date: log.date_submitted,
          operator: log.operator_name,
        });
      }
    }

    // Anomaly Rule 2: Fuel with negligible hours
    if (hours < 0.5 && fuel > 20.0) {
      anomalies.push({
        machine: log.machine_name || log.machine_model,
        issue: `Disproportionate Fuel Refueling: ${fuel} Litres logged with only ${hours.toFixed(1)} recorded engine hours.`,
        severity: 'CRITICAL',
        recommendation: 'Audit fuel transaction receipt, cross-check fuel bowser logs, and confirm operator M-Pesa voucher submission.',
        date: log.date_submitted,
        operator: log.operator_name,
      });
    }

    // Anomaly Rule 3: Excessive daily shift duration
    if (hours > 14.0) {
      anomalies.push({
        machine: log.machine_name || log.machine_model,
        issue: `Extended Single-Shift Operation: ${hours.toFixed(1)} continuous hours logged in one shift report.`,
        severity: 'MEDIUM',
        recommendation: 'Enforce statutory operator rest periods to maintain jobsite safety standards in Meru.',
        date: log.date_submitted,
        operator: log.operator_name,
      });
    }
  }

  // 2. Fetch Maintenance Forecasts
  let maintenanceForecasts: MaintenanceForecast[] = [];
  try {
    const maintRes = await db.query(`
      SELECT 
        a.name as machine_name,
        a.current_hour_meter,
        m.threshold_hours,
        m.service_description
      FROM public.physical_assets a
      JOIN public.maintenance_triggers m ON a.id = m.equipment_id;
    `);

    maintenanceForecasts = maintRes.rows.map((m: any) => {
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
  } catch (err: any) {
    console.warn('Maintenance triggers query error:', err.message);
  }

  const fuelCostPerLiterKES = 180.0;
  const totalFuelCostKES = totalFuel * fuelCostPerLiterKES;
  const costPerHourAvg = totalHours > 0 ? totalFuelCostKES / totalHours : 0;

  // 3. Generate High-Level AI Executive Summary via Groq
  let weeklySummary = '';
  try {
    const prompt = `You are the Lead Heavy Plant Fleet & Quarry AI Operations Director for Hi Los Geht in Meru, Kenya.
Review the following active fleet performance data over the past ${days} days:

- Total Recorded Engine Hours: ${totalHours.toFixed(1)} hrs
- Total Diesel Fuel Consumed: ${totalFuel.toFixed(1)} Litres (Est. KES ${totalFuelCostKES.toLocaleString()})
- Material Haulage Trips: ${totalTrips} trips
- Average Fuel Cost Per Engine Hour: KES ${costPerHourAvg.toFixed(2)}/hr
- Operational Anomalies Flagged: ${anomalies.length}
- Upcoming/Overdue Maintenance Triggers: ${maintenanceForecasts.filter(m => m.status !== 'NORMAL').length}

Please generate an authoritative, highly professional **Executive Operational Briefing** in GitHub Flavored Markdown format.
Include:
1. **Executive Operational Assessment** (High-level summary of equipment productivity and fuel economy).
2. **Key Metric Breakdown** (Table of hours, fuel, cost/hr, and anomalies).
3. **Dispatch & Field Action Recommendations** (Concrete directives for Meru quarry site managers and operators).
Keep the tone professional, concise, and focused on Kenyan heavy plant operations without generic buzzwords.`;

    const groqResponse = await callGroqChat([
      { role: 'system', content: 'You are the Chief Heavy Plant Fleet Director for Hi Los Geht in Meru, Kenya. Always reply in structured GitHub Markdown with clean headings, markdown tables, and bullet points.' },
      { role: 'user', content: prompt }
    ], 1200);

    if (groqResponse) {
      weeklySummary = groqResponse;
    }
  } catch (err: any) {
    console.warn('Groq executive summary error:', err.message);
  }

  // Deterministic fallback if Groq is unreachable
  if (!weeklySummary) {
    weeklySummary = `### Operational Executive Summary (${days}-Day Lookback)

**Location:** Meru County & Mt. Kenya East Region  
**Reporting Window:** Past ${days} Days  

| Operational Dimension | Value | Operational Status |
| :--- | :--- | :--- |
| **Total Engine Hours** | **${totalHours.toFixed(1)} hrs** | Active Fleet Deployment |
| **Total Diesel Consumed** | **${totalFuel.toFixed(1)} L** | Est. Fuel Value: KES ${totalFuelCostKES.toLocaleString()} |
| **Average Cost / Hour** | **KES ${costPerHourAvg.toFixed(2)}** | Nominal Baseline Target |
| **Haulage Trips Completed** | **${totalTrips} Trips** | Quarry & Site Materials |
| **Flagged Anomalies** | **${anomalies.length} Alerts** | ${anomalies.length > 0 ? 'Requires Administrative Inspection' : 'All Units Nominal'} |

#### Field Recommendations
- **Fuel Economy:** Maintain strict daily log verification against physical bowser meters.
- **Preventive Maintenance:** Prioritize upcoming 500-hour hydraulic service schedules.
- **Safety Protocol:** Verify certified operator logs prior to heavy excavation shifts.`;
  }

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

/**
 * Intelligent Machinery Recommender & Project Estimator Consultant
 */
export async function consultMachineryAI(userQuery: string, jobDetails?: any): Promise<string> {
  const systemPrompt = `You are the Hi Los Geht Machinery Deployment AI Consultant based in Meru, Kenya.
Hi Los Geht operates heavy machinery:
1. Komatsu PC-200 Hydraulic Excavator (Mass excavation, quarry blasting, foundation trenching)
2. Komatsu D155AX-8 Crawler Dozer (Bush clearing, road sub-base grading, dam construction)
3. JCB 3DXPLUS Backhoe Loader (Urban trenching, pipe-laying, drainage maintenance)
4. Shantui SL60W-2 Heavy Wheel Loader (Quarry ballast loading, bulk aggregate stockpiling)
5. Shantui SG18-3 Motor Grader (Murram road shaping, crown cambering, leveling)
6. Isuzu FVZ 34 15-Ton Tipper Truck (Ballast, hardcore, quarry dust haulage)
7. Heavy Lowbed 60-Ton Semi-Trailer (Equipment site-to-site relocation)

Primary Service Regions: Meru Town, Nkubu, Maua, Timau, Buuri, Isiolo, Chuka, Embu, Mt. Kenya East.
Helpline: 0717 186396 | 0748866823.

Always format your response in clean Markdown with:
- Recommended Equipment
- Estimated Daily Work Capacity / Fuel Burn
- Logistics & Ground Conditions advice (e.g. volcanic soils, murram compaction, rainy season)
- Direct Call-to-Action to book on WhatsApp or call dispatch.`;

  const response = await callGroqChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userQuery + (jobDetails ? `\nProject Context: ${JSON.stringify(jobDetails)}` : '') }
  ], 1200);

  return response || 'Our dispatch consultants are standing by. Please call **0717 186396** or WhatsApp us for instant heavy machinery consultation.';
}

export default {
  generateOperationalAIInsights,
  consultMachineryAI,
  callGroqChat,
};
