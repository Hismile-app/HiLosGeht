import { Request, Response } from 'express';
import db from '../config/db';

export async function createInquiry(req: Request, res: Response) {
  try {
    const {
      equipmentId,
      customerId,
      clientName,
      clientEmail,
      clientPhone,
      startDate,
      endDate,
      preferredContact,
      notes,
    } = req.body;

    if (!equipmentId || !clientName || !clientEmail || !clientPhone || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required inquiry parameters (equipmentId, clientName, clientEmail, clientPhone, startDate, endDate)',
      });
    }

    // Check if machine exists and get daily rate
    const assetRes = await db.query('SELECT daily_rate, name FROM public.physical_assets WHERE id = $1;', [equipmentId]);
    if (assetRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }
    const dailyRate = assetRes.rows[0].daily_rate;

    // Tentatively insert reservation with status 'PENDING'
    const insertRes = await db.query(`
      INSERT INTO public.reservations (
        physical_asset_id,
        customer_id,
        client_name,
        client_email,
        client_phone,
        booking_period,
        daily_rate,
        status,
        preferred_contact,
        notes
      ) VALUES (
        $1, $2, $3, $4, $5,
        tstzrange($6::timestamptz, $7::timestamptz, '[)'),
        $8, 'PENDING', $9, $10
      ) RETURNING *;
    `, [
      equipmentId,
      customerId || null,
      clientName,
      clientEmail,
      clientPhone,
      startDate,
      endDate,
      dailyRate,
      preferredContact || 'WHATSAPP',
      notes || null,
    ]);

    return res.status(201).json({
      success: true,
      data: insertRes.rows[0],
      message: 'Inquiry registered and tentative calendar hold created.',
    });
  } catch (error: any) {
    if (error.code === '23P01') {
      return res.status(409).json({
        success: false,
        error: 'The selected machine is already booked for these dates. Please choose another date range or equipment.',
      });
    }
    console.error('Error creating inquiry:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllInquiries(req: Request, res: Response) {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        r.id,
        r.physical_asset_id,
        r.customer_id,
        r.client_name,
        r.client_email,
        r.client_phone,
        lower(r.booking_period) as start_date,
        upper(r.booking_period) as end_date,
        r.daily_rate,
        r.total_amount,
        r.status,
        r.preferred_contact,
        r.notes,
        r.created_at,
        a.name as equipment_name,
        a.category as equipment_category,
        a.model as equipment_model,
        a.image_url as equipment_image
      FROM public.reservations r
      JOIN public.physical_assets a ON r.physical_asset_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }

    query += ' ORDER BY r.created_at DESC;';
    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateInquiryStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid reservation status' });
    }

    const result = await db.query(`
      UPDATE public.reservations
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23P01') {
      return res.status(409).json({
        success: false,
        error: 'Cannot confirm booking: conflicts with an existing reservation.',
      });
    }
    console.error('Error updating inquiry status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
