import { Request, Response } from 'express';
import { processAEMPTelemetry } from '../services/telemetryService';
import db from '../config/db';

export async function ingestTelemetry(req: Request, res: Response) {
  try {
    const payload = req.body;
    const result = await processAEMPTelemetry(payload);
    return res.status(200).json({
      success: true,
      message: 'ISO 15143-3 Telematics frame processed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Telematics Ingestion Error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function getStaffTasks(req: Request, res: Response) {
  try {
    const { status, priority, equipmentId } = req.query;
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

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching staff tasks:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateStaffTaskStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

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
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
