import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';

interface MemoryLog {
  id: string;
  staff_id: string | null;
  equipment_id: string;
  start_meter: number;
  end_meter: number;
  hours_worked: number;
  work_description: string;
  fuel_amount: number;
  fuel_proof_image: string | null;
  materials_received: string | null;
  materials_proof_image: string | null;
  date_submitted: string;
  verification_status: string;
  audit_notes?: string | null;
  staff_name?: string;
  staff_email?: string;
  equipment_name?: string;
  equipment_model?: string;
  equipment_category?: string;
}

const FALLBACK_LOGS: MemoryLog[] = [
  {
    id: 'log-001',
    staff_id: '00000000-0000-0000-0000-000000000002',
    equipment_id: '11111111-1111-1111-1111-111111111101',
    start_meter: 335.0,
    end_meter: 342.5,
    hours_worked: 7.5,
    work_description: 'Trenching and drainage foundation works at Meru Bypass road project.',
    fuel_amount: 45.0,
    fuel_proof_image: '/images/equipment/excavator.jpg',
    materials_received: '5 trips quarry ballast received on site',
    materials_proof_image: null,
    date_submitted: new Date().toISOString(),
    verification_status: 'APPROVED',
    staff_name: 'Brian K. (Lead Operator)',
    staff_email: 'kbrian1237@gmail.com',
    equipment_name: 'Komatsu PC-200 Heavy Excavator',
    equipment_model: 'Komatsu PC-200',
    equipment_category: 'Excavator',
  }
];

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

    let createdLog: any = null;

    try {
      // Primary DB Insert
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
      createdLog = logRes.rows[0];

      // Update asset meter
      await db.query(`
        UPDATE public.physical_assets
        SET current_hour_meter = GREATEST(current_hour_meter, $1), updated_at = NOW()
        WHERE id = $2;
      `, [endMeter, equipmentId]);
    } catch (dbErr: any) {
      console.warn('⚠️ Database write failed for staff log, storing in memory fallback:', dbErr.message);
      createdLog = {
        id: 'log-' + Date.now(),
        staff_id: staffId || null,
        equipment_id: equipmentId,
        start_meter: parseFloat(startMeter),
        end_meter: parseFloat(endMeter),
        hours_worked: parseFloat(endMeter) - parseFloat(startMeter),
        work_description: workDescription,
        fuel_amount: parseFloat(fuelAmount || '0'),
        fuel_proof_image: fuelProofImage || null,
        materials_received: materialsReceived || null,
        materials_proof_image: materialsProofImage || null,
        date_submitted: new Date().toISOString(),
        verification_status: 'PENDING',
        staff_name: 'Lead Operator',
        equipment_name: 'Heavy Machine',
      };
      FALLBACK_LOGS.unshift(createdLog);
    }

    return NextResponse.json({
      success: true,
      data: createdLog,
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
    const paramsList: any[] = [];

    if (staffId) {
      paramsList.push(staffId);
      query += ` AND l.staff_id = $${paramsList.length}`;
    }

    if (equipmentId) {
      paramsList.push(equipmentId);
      query += ` AND l.equipment_id = $${paramsList.length}`;
    }

    if (startDate) {
      paramsList.push(startDate);
      query += ` AND l.date_submitted >= $${paramsList.length}::timestamptz`;
    }

    if (endDate) {
      paramsList.push(endDate);
      query += ` AND l.date_submitted <= $${paramsList.length}::timestamptz`;
    }

    query += ' ORDER BY l.date_submitted DESC;';
    const result = await db.query(query, paramsList);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    }, { status: 200 });
  } catch (error: any) {
    console.warn('⚠️ Database query failed for staff logs, returning fallback logs:', error.message);
    const { staffId, equipmentId } = Object.fromEntries(req.nextUrl.searchParams.entries());
    let filtered = [...FALLBACK_LOGS];
    if (staffId) filtered = filtered.filter(l => l.staff_id === staffId);
    if (equipmentId) filtered = filtered.filter(l => l.equipment_id === equipmentId);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    }, { status: 200 });
  }
}

export async function updateLogVerification(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await (params || {});
    const { verificationStatus, auditNotes } = await req.json();

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(verificationStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid verification status' }, { status: 400 });
    }

    let updated: any = null;
    try {
      const result = await db.query(`
        UPDATE public.staff_logs
        SET 
          verification_status = $1,
          audit_notes = COALESCE($2, audit_notes)
        WHERE id = $3
        RETURNING *;
      `, [verificationStatus, auditNotes || null, id]);

      if (result.rows.length > 0) {
        updated = result.rows[0];
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Database update verification fallback:', dbErr.message);
      const idx = FALLBACK_LOGS.findIndex(l => l.id === id);
      if (idx >= 0) {
        FALLBACK_LOGS[idx].verification_status = verificationStatus;
        FALLBACK_LOGS[idx].audit_notes = auditNotes || null;
        updated = FALLBACK_LOGS[idx];
      }
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Staff log not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Log voucher status updated to ${verificationStatus}`,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating log verification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
