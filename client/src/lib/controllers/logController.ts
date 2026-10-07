import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';
import {
  getStaffLogsRegistry,
  saveStaffLog,
  batchUpdateStaffLogs,
  OperationalStaffLog,
  SEED_FLEET_LOGS
} from '@/lib/services/logsRegistry';

export async function submitStaffLog(req: NextRequest, { params }: { params: any }) {
  try {
    const {
      staffId,
      equipmentId,
      startMeter,
      endMeter,
      workDescription,
      fuelAmount,
      startFuelReading,
      endFuelReading,
      fuelProofImage,
      startFuelProofImage,
      endFuelProofImage,
      materialsReceived,
      materialsProofImage,
      startMeterProofImage,
      endMeterProofImage,
      meterProofImage,
      staffName,
      staffEmail,
      equipmentName,
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

    const hoursWorked = parseFloat(endMeter) - parseFloat(startMeter);
    const resolvedMeterProof = meterProofImage || endMeterProofImage || startMeterProofImage || null;
    let createdLog: any = null;

    // Resolve valid UUID for PostgreSQL foreign key if staffId is a string or email provided
    let resolvedStaffUuid: string | null = null;
    const isUuid = staffId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(staffId);
    if (isUuid) {
      resolvedStaffUuid = staffId;
    } else if (staffEmail || staffId) {
      try {
        const pRes = await db.query(
          `SELECT id FROM public.profiles WHERE LOWER(email) = LOWER($1) OR id::text = $2;`,
          [staffEmail || '', staffId || '']
        );
        if (pRes.rows.length > 0) {
          resolvedStaffUuid = pRes.rows[0].id;
        }
      } catch (e: any) {
        console.warn('Operator UUID lookup warning:', e.message);
      }
    }

    const parsedStartFuel = startFuelReading !== undefined && startFuelReading !== '' ? parseFloat(startFuelReading) : null;
    const parsedEndFuel = endFuelReading !== undefined && endFuelReading !== '' ? parseFloat(endFuelReading) : null;

    // 1. Attempt Database Insert
    try {
      const logRes = await db.query(`
        INSERT INTO public.staff_logs (
          staff_id,
          equipment_id,
          start_meter,
          end_meter,
          work_description,
          fuel_amount,
          start_fuel_reading,
          end_fuel_reading,
          fuel_proof_image,
          start_fuel_proof_image,
          end_fuel_proof_image,
          materials_received,
          materials_proof_image,
          start_meter_proof_image,
          end_meter_proof_image,
          meter_proof_image,
          date_submitted
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
        ) RETURNING *;
      `, [
        resolvedStaffUuid,
        equipmentId,
        startMeter,
        endMeter,
        workDescription,
        fuelAmount || 0.0,
        parsedStartFuel,
        parsedEndFuel,
        fuelProofImage || null,
        startFuelProofImage || null,
        endFuelProofImage || null,
        materialsReceived || null,
        materialsProofImage || null,
        startMeterProofImage || null,
        endMeterProofImage || null,
        resolvedMeterProof,
      ]);
      createdLog = logRes.rows[0];

      // Update asset meter
      await db.query(`
        UPDATE public.physical_assets
        SET current_hour_meter = GREATEST(current_hour_meter, $1), updated_at = NOW()
        WHERE id = $2;
      `, [endMeter, equipmentId]);
    } catch (dbErr: any) {
      console.warn('⚠️ Database write failed for staff log, using persistent Blob store:', dbErr.message);
    }

    // 2. Persist to Vercel Blob store
    const logEntry: OperationalStaffLog = {
      id: createdLog?.id || 'log-' + Date.now().toString(36),
      staff_id: staffId || resolvedStaffUuid || null,
      staff_email: staffEmail || null,
      equipment_id: equipmentId,
      start_meter: parseFloat(startMeter),
      end_meter: parseFloat(endMeter),
      hours_worked: hoursWorked,
      work_description: workDescription,
      fuel_amount: parseFloat(fuelAmount || '0'),
      start_fuel_reading: parsedStartFuel,
      end_fuel_reading: parsedEndFuel,
      fuel_proof_image: fuelProofImage || null,
      start_fuel_proof_image: startFuelProofImage || null,
      end_fuel_proof_image: endFuelProofImage || null,
      materials_received: materialsReceived || null,
      materials_proof_image: materialsProofImage || null,
      start_meter_proof_image: startMeterProofImage || null,
      end_meter_proof_image: endMeterProofImage || null,
      meter_proof_image: resolvedMeterProof,
      date_submitted: new Date().toISOString(),
      verification_status: 'PENDING',
      staff_name: staffName || 'Certified Operator',
      equipment_name: equipmentName || 'Heavy Machine',
      equipment_model: equipmentName || 'Industrial Plant',
      equipment_category: 'Heavy Equipment',
    };

    const saved = await saveStaffLog(logEntry);
    if (!createdLog) {
      createdLog = saved;
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
    let logs: OperationalStaffLog[] = [];

    try {
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
          l.start_fuel_reading,
          l.end_fuel_reading,
          l.fuel_proof_image,
          l.start_fuel_proof_image,
          l.end_fuel_proof_image,
          l.materials_received,
          l.materials_proof_image,
          l.start_meter_proof_image,
          l.end_meter_proof_image,
          l.meter_proof_image,
          l.date_submitted,
          l.verification_status,
          l.audit_notes,
          COALESCE(p.full_name, 'Operator') as staff_name,
          COALESCE(p.full_name, 'Operator') as operator_name,
          COALESCE(p.email, 'operator@hilosgeht.co.ke') as staff_email,
          COALESCE(p.email, 'operator@hilosgeht.co.ke') as operator_email,
          p.avatar_url as operator_avatar,
          p.avatar_url as staff_avatar,
          l.work_description as yield_description,
          COALESCE(a.name, 'Equipment') as equipment_name,
          COALESCE(a.model, 'Asset') as equipment_model,
          COALESCE(a.category, 'Fleet') as equipment_category
        FROM public.staff_logs l
        LEFT JOIN public.profiles p ON l.staff_id = p.id
        LEFT JOIN public.physical_assets a ON l.equipment_id = a.id
        WHERE 1=1
      `;
      const paramsList: any[] = [];

      if (staffId) {
        paramsList.push(staffId);
        query += ` AND l.staff_id::text = $${paramsList.length}`;
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
      if (result.rows.length > 0) {
        logs = result.rows;
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Database query failed for staff logs, loading from persistent Blob registry:', dbErr.message);
    }

    // Fallback to persistent Blob registry if DB is empty or offline
    if (logs.length === 0) {
      const blobLogs = await getStaffLogsRegistry();
      if (staffId) {
        logs = blobLogs.filter((l) => l.staff_id === staffId);
      } else if (equipmentId) {
        logs = blobLogs.filter((l) => l.equipment_id === equipmentId);
      } else {
        logs = blobLogs;
      }
    }

    const normalizedLogs = logs.map((l: any) => ({
      ...l,
      staff_name: l.staff_name || l.operator_name || 'Certified Operator',
      operator_name: l.operator_name || l.staff_name || 'Certified Operator',
      staff_email: l.staff_email || l.operator_email || 'operator@hilosgeht.co.ke',
      operator_email: l.operator_email || l.staff_email || 'operator@hilosgeht.co.ke',
      operator_avatar: l.operator_avatar || l.staff_avatar || null,
      staff_avatar: l.staff_avatar || l.operator_avatar || null,
      start_fuel_reading: l.start_fuel_reading !== null && l.start_fuel_reading !== undefined ? parseFloat(l.start_fuel_reading) : null,
      end_fuel_reading: l.end_fuel_reading !== null && l.end_fuel_reading !== undefined ? parseFloat(l.end_fuel_reading) : null,
      start_fuel_proof_image: l.start_fuel_proof_image || null,
      end_fuel_proof_image: l.end_fuel_proof_image || null,
      yield_description: l.yield_description || l.work_description || '',
      work_description: l.work_description || l.yield_description || '',
    }));

    return NextResponse.json({
      success: true,
      count: normalizedLogs.length,
      data: normalizedLogs,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in getAllStaffLogs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
        WHERE id::text = $3
        RETURNING *;
      `, [verificationStatus, auditNotes || null, id]);

      if (result.rows.length > 0) {
        updated = result.rows[0];
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Database update verification fallback:', dbErr.message);
    }

    // Update in Vercel Blob registry as well
    const registry = await getStaffLogsRegistry();
    const idx = registry.findIndex((l) => l.id === id);
    if (idx >= 0) {
      registry[idx].verification_status = verificationStatus;
      if (auditNotes !== undefined) registry[idx].audit_notes = auditNotes;
      await saveStaffLog(registry[idx]);
      if (!updated) {
        updated = registry[idx];
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

export async function batchUpdateLogVerification(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, verificationStatus, auditNotes, approveAllPending } = body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(verificationStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid verification status' }, { status: 400 });
    }

    let targetIds: string[] = Array.isArray(ids) ? [...ids] : [];

    if (approveAllPending) {
      const allBlobLogs = await getStaffLogsRegistry();
      const pendingBlobIds = allBlobLogs
        .filter((l) => l.verification_status === 'PENDING')
        .map((l) => l.id);
      targetIds = Array.from(new Set([...targetIds, ...pendingBlobIds]));

      try {
        const dbPending = await db.query(`SELECT id::text FROM public.staff_logs WHERE verification_status = 'PENDING';`);
        for (const row of dbPending.rows) {
          if (!targetIds.includes(row.id)) {
            targetIds.push(row.id);
          }
        }
      } catch (e: any) {
        console.warn('DB pending query notice:', e.message);
      }
    }

    if (targetIds.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No pending logs found to update.',
      }, { status: 200 });
    }

    // 1. Update in Database
    try {
      await db.query(`
        UPDATE public.staff_logs
        SET 
          verification_status = $1,
          audit_notes = COALESCE($2, audit_notes)
        WHERE id::text = ANY($3::text[]);
      `, [verificationStatus, auditNotes || null, targetIds]);
    } catch (dbErr: any) {
      console.warn('⚠️ Database batch update verification fallback:', dbErr.message);
    }

    // 2. Update in Vercel Blob registry
    const updatedLogs = await batchUpdateStaffLogs(targetIds, verificationStatus, auditNotes);

    return NextResponse.json({
      success: true,
      count: targetIds.length,
      updatedIds: targetIds,
      message: `Successfully set ${targetIds.length} logs to ${verificationStatus}`,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in batchUpdateLogVerification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
