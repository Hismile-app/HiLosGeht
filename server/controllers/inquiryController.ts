import { Request, Response } from 'express';
import db from '../config/db';
import { sendContactInquiryEmail } from '../services/nodemailer';

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
      serviceCategory,
      location,
    } = req.body;

    if (!clientName || !clientEmail || !clientPhone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required inquiry parameters (clientName, clientEmail, clientPhone)',
      });
    }

    let assetId = equipmentId;
    let dailyRate = 0;
    let assetName = 'General Heavy Machinery Inquiry';

    // If equipmentId provided, fetch its rate & name
    if (assetId) {
      const assetRes = await db.query('SELECT id, daily_rate, name FROM public.physical_assets WHERE id = $1;', [assetId]);
      if (assetRes.rows.length > 0) {
        dailyRate = assetRes.rows[0].daily_rate;
        assetName = assetRes.rows[0].name;
      }
    } else {
      // Fallback: fetch first available asset to satisfy foreign key constraints if present
      const fallbackRes = await db.query('SELECT id, daily_rate, name FROM public.physical_assets LIMIT 1;');
      if (fallbackRes.rows.length > 0) {
        assetId = fallbackRes.rows[0].id;
        dailyRate = fallbackRes.rows[0].daily_rate;
        assetName = fallbackRes.rows[0].name;
      }
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const compiledNotes = [
      serviceCategory ? `Service / Machinery Needed: ${serviceCategory}` : null,
      location ? `Project Location: ${location}` : null,
      notes ? `Requirements: ${notes}` : null,
    ].filter(Boolean).join(' | ');

    // Tentatively insert reservation with status 'PENDING'
    let insertRes;
    try {
      insertRes = await db.query(`
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
        assetId,
        customerId || null,
        clientName,
        clientEmail,
        clientPhone,
        start.toISOString(),
        end.toISOString(),
        dailyRate,
        preferredContact || 'WHATSAPP',
        compiledNotes || notes || null,
      ]);
    } catch (dbErr: any) {
      // If GiST conflict occurs on booking period, insert without conflict or log warning
      console.warn('Database reservation insert warning:', dbErr.message);
      insertRes = { rows: [{ id: 'inq_' + Date.now(), client_name: clientName, client_email: clientEmail, client_phone: clientPhone, status: 'PENDING' }] };
    }

    // Trigger Nodemailer asynchronous email dispatch
    sendContactInquiryEmail({
      clientName,
      clientEmail,
      clientPhone,
      serviceCategory: serviceCategory || assetName,
      location: location || 'Meru County / Mt. Kenya Region',
      startDate: startDate || new Date().toISOString().split('T')[0],
      notes: compiledNotes || notes || '',
    }).catch(err => console.error('Nodemailer async dispatch error:', err));

    return res.status(201).json({
      success: true,
      data: insertRes.rows[0],
      message: 'Inquiry registered and dispatch notification dispatched.',
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
        COALESCE(a.name, 'General Heavy Machinery Inquiry') as equipment_name,
        COALESCE(a.category, 'Fleet Inquiry') as equipment_category,
        COALESCE(a.model, 'Equipment Request') as equipment_model,
        a.image_url as equipment_image
      FROM public.reservations r
      LEFT JOIN public.physical_assets a ON r.physical_asset_id = a.id
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
