import { Request, Response } from 'express';
import db from '../config/db';
import { generateOperationalAIInsights } from '../services/ai';

export async function getCommandOverview(req: Request, res: Response) {
  try {
    // 1. Total Fleet Count & Active Machines
    const fleetRes = await db.query(`
      SELECT 
        count(*) as total_fleet,
        count(*) FILTER (WHERE status = 'AVAILABLE') as available_count,
        count(*) FILTER (WHERE status = 'BOOKED') as booked_count,
        count(*) FILTER (WHERE status = 'MAINTENANCE') as maintenance_count
      FROM public.physical_assets;
    `);

    // 2. Pending Inquiries
    const inqRes = await db.query(`
      SELECT 
        count(*) as total_inquiries,
        count(*) FILTER (WHERE status = 'PENDING') as pending_count,
        count(*) FILTER (WHERE status = 'CONFIRMED') as confirmed_count
      FROM public.reservations;
    `);

    // 3. Today's Active Staff Logs
    const staffRes = await db.query(`
      SELECT 
        count(DISTINCT staff_id) as active_staff_today,
        COALESCE(SUM(end_meter - start_meter), 0) as total_hours_today,
        COALESCE(SUM(fuel_amount), 0) as total_fuel_today
      FROM public.staff_logs
      WHERE date_submitted >= CURRENT_DATE;
    `);

    // 4. Financial & Revenue Metrics (Estimated based on confirmed reservations & daily rates)
    const revRes = await db.query(`
      SELECT 
        COALESCE(SUM(daily_rate), 0) as total_projected_revenue
      FROM public.reservations
      WHERE status = 'CONFIRMED';
    `);

    const totalFleet = parseInt(fleetRes.rows[0].total_fleet || '0', 10);
    const bookedCount = parseInt(fleetRes.rows[0].booked_count || '0', 10);
    const utilizationRate = totalFleet > 0 ? ((bookedCount / totalFleet) * 100).toFixed(1) : '0.0';

    return res.status(200).json({
      success: true,
      data: {
        fleet: fleetRes.rows[0],
        inquiries: inqRes.rows[0],
        todayOperations: staffRes.rows[0],
        financials: {
          projectedRevenueKES: parseFloat(revRes.rows[0].total_projected_revenue),
          utilizationPercentage: parseFloat(utilizationRate),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching command overview:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getFinancialAndFuelAnalytics(req: Request, res: Response) {
  try {
    const logsRes = await db.query(`
      SELECT 
        a.name as machine_name,
        a.category,
        COALESCE(SUM(l.end_meter - l.start_meter), 0) as total_hours,
        COALESCE(SUM(l.fuel_amount), 0) as total_fuel_litres,
        COALESCE(SUM(l.fuel_amount * 180.0), 0) as total_fuel_cost_kes,
        CASE 
          WHEN SUM(l.end_meter - l.start_meter) > 0 
          THEN (SUM(l.fuel_amount * 180.0) / SUM(l.end_meter - l.start_meter))
          ELSE 0 
        END as cost_per_hour_kes
      FROM public.physical_assets a
      LEFT JOIN public.staff_logs l ON a.id = l.equipment_id
      GROUP BY a.id, a.name, a.category
      ORDER BY total_fuel_cost_kes DESC;
    `);

    // Time-series data for Recharts area/bar charts (past 7 days)
    const timelineRes = await db.query(`
      SELECT 
        to_char(date_trunc('day', date_submitted), 'Dy DD') as day_label,
        COALESCE(SUM(end_meter - start_meter), 0) as hours_yield,
        COALESCE(SUM(fuel_amount), 0) as fuel_litres,
        COALESCE(SUM(fuel_amount * 180.0), 0) as fuel_cost_kes
      FROM public.staff_logs
      WHERE date_submitted >= (NOW() - INTERVAL '7 days')
      GROUP BY date_trunc('day', date_submitted)
      ORDER BY date_trunc('day', date_submitted) ASC;
    `);

    return res.status(200).json({
      success: true,
      data: {
        machineBreakdown: logsRes.rows,
        dailyTimeline: timelineRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Error fetching financial analytics:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAIInsightsEndpoint(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string || '7', 10);
    const insights = await generateOperationalAIInsights(days);
    return res.status(200).json({ success: true, data: insights });
  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getClientCRM(req: Request, res: Response) {
  try {
    const result = await db.query(`
      SELECT 
        client_email,
        client_name,
        client_phone,
        preferred_contact,
        count(*) as total_bookings,
        count(*) FILTER (WHERE status = 'CONFIRMED') as confirmed_bookings,
        COALESCE(SUM(daily_rate), 0) as estimated_spend_kes,
        MAX(created_at) as last_booking_date
      FROM public.reservations
      GROUP BY client_email, client_name, client_phone, preferred_contact
      ORDER BY estimated_spend_kes DESC;
    `);

    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching Client CRM:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getDocumentAuditGallery(req: Request, res: Response) {
  try {
    const result = await db.query(`
      SELECT 
        l.id as log_id,
        l.date_submitted,
        l.fuel_amount,
        l.fuel_proof_image,
        l.materials_received,
        l.materials_proof_image,
        p.full_name as operator_name,
        a.name as machine_name,
        a.model as machine_model
      FROM public.staff_logs l
      LEFT JOIN public.profiles p ON l.staff_id = p.id
      JOIN public.physical_assets a ON l.equipment_id = a.id
      WHERE l.fuel_proof_image IS NOT NULL OR l.materials_proof_image IS NOT NULL
      ORDER BY l.date_submitted DESC;
    `);

    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching audit gallery:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
