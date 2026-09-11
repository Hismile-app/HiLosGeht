import { NextRequest, NextResponse } from 'next/server';
import { processAEMPTelemetry } from '@/lib/services/telemetryService';
import db from '@/lib/server-config/db';

export async function ingestTelemetry(req: NextRequest, { params }: { params: any }) {
  try {
    const payload = await req.json();
    const result = await processAEMPTelemetry(payload);
    return NextResponse.json({
      success: true,
      message: 'ISO 15143-3 Telematics frame processed successfully',
      data: result,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Telematics Ingestion Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function getStaffTasks(req: NextRequest, { params }: { params: any }) {
  try {
    const { status, priority, equipmentId } = Object.fromEntries(req.nextUrl.searchParams.entries());
    let query = `
      SELECT 
        t.id,
        t.assigned_to,
        t.equipment_id,
        t.task_type,
        t.priority,
        t.status,
        t.description,
        t.created_at,
        t.completed_at,
        a.name as equipment_name,
        a.model as equipment_model,
        p.full_name as assignee_name
      FROM public.staff_tasks t
      JOIN public.physical_assets a ON t.equipment_id = a.id
      LEFT JOIN public.profiles p ON t.assigned_to = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      query += ` AND t.priority = $${params.length}`;
    }

    if (equipmentId) {
      params.push(equipmentId);
      query += ` AND t.equipment_id = $${params.length}`;
    }

    query += ' ORDER BY t.created_at DESC;';
    const result = await db.query(query, params);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching staff tasks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function updateStaffTaskStatus(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const { status, assignedTo } = await req.json();

    const result = await db.query(`
      UPDATE public.staff_tasks
      SET 
        status = COALESCE($1, status),
        assigned_to = COALESCE($2, assigned_to),
        completed_at = CASE WHEN $1 = 'COMPLETED' THEN NOW() ELSE completed_at END
      WHERE id = $3
      RETURNING *;
    `, [status, assignedTo, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
