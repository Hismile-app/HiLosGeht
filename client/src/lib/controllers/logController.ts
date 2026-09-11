import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';

export async function submitStaffLog(req: NextRequest, { params }: { params: any }) {
  try {
    const {
      staffId,
      equipmentId,
      startMeter,
      endMeter,
      workDescription,
      fuelAmount,
      fuelProofImage,
      materialsReceived,
      materialsProofImage,
    } = await req.json();

    if (!equipmentId || startMeter === undefined || endMeter === undefined || !workDescription) {
      return NextResponse.json({
        success: false,
        error: 'Missing required log fields (equipmentId, startMeter, endMeter, workDescription)',
      }, { status: 400 });
    }

    if (parseFloat(endMeter) < parseFloat(startMeter)) {
      return NextResponse.json({
        success: false,
        error: 'End hour meter cannot be less than start hour meter',
      }, { status: 400 });
    }

    // Insert staff log
    const logRes = await db.query(`
      INSERT INTO public.staff_logs (
        staff_id,
        equipment_id,
        start_meter,
        end_meter,
        work_description,
        fuel_amount,
        fuel_proof_image,
        materials_received,
        materials_proof_image,
        date_submitted
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
      ) RETURNING *;
    `, [
      staffId || null,
      equipmentId,
      startMeter,
      endMeter,
      workDescription,
      fuelAmount || 0.0,
      fuelProofImage || null,
      materialsReceived || null,
      materialsProofImage || null,
    ]);

    // Update the physical asset current_hour_meter (will trigger maintenance threshold if exceeded)
    await db.query(`
      UPDATE public.physical_assets
      SET current_hour_meter = GREATEST(current_hour_meter, $1), updated_at = NOW()
      WHERE id = $2;
    `, [endMeter, equipmentId]);

    return NextResponse.json({
      success: true,
      data: logRes.rows[0],
      message: 'Daily operational log submitted and hour meter updated.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting staff log:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function getAllStaffLogs(req: NextRequest, { params }: { params: any }) {
  try {
    const { staffId, equipmentId, startDate, endDate } = Object.fromEntries(req.nextUrl.searchParams.entries());
    let query = `
      SELECT 
        l.id,
        l.staff_id,
        l.equipment_id,
        l.start_meter,
        l.end_meter,
        (l.end_meter - l.start_meter) as hours_worked,
        l.work_description,
        l.fuel_amount,
        l.fuel_proof_image,
        l.materials_received,
        l.materials_proof_image,
        l.date_submitted,
        p.full_name as staff_name,
        p.email as staff_email,
        a.name as equipment_name,
        a.model as equipment_model,
        a.category as equipment_category
      FROM public.staff_logs l
      LEFT JOIN public.profiles p ON l.staff_id = p.id
      JOIN public.physical_assets a ON l.equipment_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (staffId) {
      params.push(staffId);
      query += ` AND l.staff_id = $${params.length}`;
    }

    if (equipmentId) {
      params.push(equipmentId);
      query += ` AND l.equipment_id = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      query += ` AND l.date_submitted >= $${params.length}::timestamptz`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND l.date_submitted <= $${params.length}::timestamptz`;
    }

    query += ' ORDER BY l.date_submitted DESC;';
    const result = await db.query(query, params);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching staff logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
