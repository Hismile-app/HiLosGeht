import { Request, Response } from 'express';
import db from '../config/db';

export async function getAllEquipment(req: Request, res: Response) {
  try {
    const { category, status } = req.query;
    let query = 'SELECT * FROM public.physical_assets WHERE 1=1';
    const params: any[] = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY name ASC;';
    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching equipment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getEquipmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM public.physical_assets WHERE id = $1;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }

    // Also fetch upcoming reservations for this machine
    const resResult = await db.query(`
      SELECT 
        id, 
        lower(booking_period) as start_date, 
        upper(booking_period) as end_date, 
        status
      FROM public.reservations
      WHERE physical_asset_id = $1 AND status != 'CANCELLED'
      ORDER BY lower(booking_period) ASC;
    `, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...result.rows[0],
        reservations: resResult.rows,
      },
    });
  } catch (error: any) {
    console.error('Error fetching equipment by id:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function checkEquipmentAvailability(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'startDate and endDate query parameters are required' });
    }

    const overlapResult = await db.query(`
      SELECT id, client_name, lower(booking_period) as start_date, upper(booking_period) as end_date, status
      FROM public.reservations
      WHERE physical_asset_id = $1
        AND status != 'CANCELLED'
        AND booking_period && tstzrange($2, $3, '[)');
    `, [id, startDate, endDate]);

    const isAvailable = overlapResult.rows.length === 0;

    return res.status(200).json({
      success: true,
      isAvailable,
      conflicts: overlapResult.rows,
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createEquipment(req: Request, res: Response) {
  try {
    const { name, category, model, dailyRate, imageUrl, specs, telemetryApiId } = req.body;
    const result = await db.query(`
      INSERT INTO public.physical_assets (
        name, category, model, daily_rate, image_url, specs, telemetry_api_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [name, category, model, dailyRate, imageUrl, JSON.stringify(specs || {}), telemetryApiId]);

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateEquipment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, category, model, dailyRate, status, imageUrl, currentHourMeter, specs } = req.body;

    const result = await db.query(`
      UPDATE public.physical_assets SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        model = COALESCE($3, model),
        daily_rate = COALESCE($4, daily_rate),
        status = COALESCE($5, status),
        image_url = COALESCE($6, image_url),
        current_hour_meter = COALESCE($7, current_hour_meter),
        specs = COALESCE($8, specs),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `, [
      name,
      category,
      model,
      dailyRate,
      status,
      imageUrl,
      currentHourMeter,
      specs ? JSON.stringify(specs) : null,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteEquipment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM public.physical_assets WHERE id = $1 RETURNING id;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }
    return res.status(200).json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
