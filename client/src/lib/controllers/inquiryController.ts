import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';
import { sendContactInquiryEmail, sendClientThankYouEmail } from '@/lib/services/nodemailer';
import { 
  getInquiriesRegistry, 
  saveInquiryRecord, 
  updateInquiryStatusRecord, 
  InquiryRecord 
} from '@/lib/services/inquiriesRegistry';

export async function createInquiry(req: NextRequest, { params }: { params: any }) {
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
    } = await req.json();

    if (!clientName || !clientEmail || !clientPhone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required inquiry parameters (clientName, clientEmail, clientPhone)',
      }, { status: 400 });
    }

    let assetId = equipmentId;
    let dailyRate = 0;
    let assetName = serviceCategory || 'General Heavy Machinery Inquiry';

    // If equipmentId provided, fetch its rate & name
    try {
      if (assetId) {
        const assetRes = await db.query('SELECT id, daily_rate, name FROM public.physical_assets WHERE id = $1;', [assetId]);
        if (assetRes.rows.length > 0) {
          dailyRate = parseFloat(assetRes.rows[0].daily_rate) || 0;
          assetName = assetRes.rows[0].name;
        }
      } else {
        const fallbackRes = await db.query('SELECT id, daily_rate, name FROM public.physical_assets LIMIT 1;');
        if (fallbackRes.rows.length > 0) {
          assetId = fallbackRes.rows[0].id;
          dailyRate = parseFloat(fallbackRes.rows[0].daily_rate) || 0;
          assetName = fallbackRes.rows[0].name;
        }
      }
    } catch (e: any) {
      console.warn('Physical asset lookup fallback:', e.message);
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const compiledNotes = [
      serviceCategory ? `Service / Machinery Needed: ${serviceCategory}` : null,
      location ? `Project Location: ${location}` : null,
      notes ? `Requirements: ${notes}` : null,
    ].filter(Boolean).join(' | ');

    const inqId = 'inq_' + Date.now();
    let savedRecord: InquiryRecord = {
      id: inqId,
      physical_asset_id: assetId || undefined,
      customer_id: customerId || null,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      service_category: serviceCategory || assetName,
      location: location || 'Meru County / Mt. Kenya Region',
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      daily_rate: dailyRate || 45000,
      total_amount: (dailyRate || 45000) * 3,
      status: 'PENDING',
      preferred_contact: preferredContact || 'WHATSAPP',
      notes: compiledNotes || notes || '',
      created_at: new Date().toISOString(),
      equipment_name: assetName,
      equipment_category: serviceCategory || 'Heavy Equipment',
      equipment_model: assetName,
    };

    // 1. Always persist to Vercel Blob / memory store first so it's NEVER lost
    try {
      savedRecord = await saveInquiryRecord(savedRecord);
    } catch (saveErr: any) {
      console.warn('Registry save warning:', saveErr.message);
    }

    // 2. Attempt Database Insert to public.reservations
    try {
      if (assetId) {
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

        if (insertRes.rows.length > 0) {
          savedRecord.id = insertRes.rows[0].id;
        }
      }
    } catch (dbErr: any) {
      console.warn('Database reservation insert warning (falling back to blob persistence):', dbErr.message);
    }

    // 3. Trigger Nodemailer email notification
    sendContactInquiryEmail({
      clientName,
      clientEmail,
      clientPhone,
      serviceCategory: serviceCategory || assetName,
      location: location || 'Meru County / Mt. Kenya Region',
      startDate: startDate || new Date().toISOString().split('T')[0],
      notes: compiledNotes || notes || '',
    }).catch(err => console.error('Nodemailer async dispatch error:', err));

    sendClientThankYouEmail(clientEmail, clientName)
      .catch(err => console.error('Nodemailer client thank you email error:', err));

    return NextResponse.json({
      success: true,
      data: savedRecord,
      message: 'Inquiry registered and dispatch notification dispatched.',
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === '23P01') {
      return NextResponse.json({
        success: false,
        error: 'The selected machine is already booked for these dates. Please choose another date range or equipment.',
      }, { status: 409 });
    }
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function getAllInquiries(req: NextRequest, { params }: { params: any }) {
  try {
    const { status } = Object.fromEntries(req.nextUrl.searchParams.entries());
    let dbInquiries: any[] = [];

    try {
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
      const paramsList: any[] = [];

      if (status) {
        paramsList.push(status);
        query += ` AND r.status = $${paramsList.length}`;
      }

      query += ' ORDER BY r.created_at DESC;';
      const result = await db.query(query, paramsList);
      dbInquiries = result.rows || [];
    } catch (dbErr: any) {
      console.warn('Database inquiries query fallback:', dbErr.message);
    }

    // Load persistent Vercel Blob registry inquiries
    const registryInquiries = await getInquiriesRegistry();

    // Merge DB records and registry records (registry takes precedence for recent submissions)
    const mergedMap = new Map<string, any>();

    // Add registry first
    for (const reg of registryInquiries) {
      mergedMap.set(reg.id, {
        ...reg,
        start_date: reg.start_date,
        end_date: reg.end_date,
      });
    }

    // Add DB records (if not already mapped by client_email + start_date)
    for (const dbItem of dbInquiries) {
      if (!mergedMap.has(dbItem.id)) {
        mergedMap.set(dbItem.id, dbItem);
      }
    }

    let finalInquiries = Array.from(mergedMap.values());

    if (status) {
      finalInquiries = finalInquiries.filter((i) => i.status === status);
    }

    // Sort by created_at DESC
    finalInquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      count: finalInquiries.length,
      data: finalInquiries,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    const fallback = await getInquiriesRegistry();
    return NextResponse.json({ success: true, count: fallback.length, data: fallback }, { status: 200 });
  }
}

export async function updateInquiryStatus(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid reservation status' }, { status: 400 });
    }

    // 1. Update in Vercel Blob persistent store
    const updatedRecord = await updateInquiryStatusRecord(id, status);

    // 2. Update in PostgreSQL
    try {
      await db.query(`
        UPDATE public.reservations
        SET status = $1, updated_at = NOW()
        WHERE id = $2;
      `, [status, id]);
    } catch (dbErr: any) {
      console.warn('Database status update warning:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      data: updatedRecord || { id, status },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
