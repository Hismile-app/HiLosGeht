import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';
import { 
  sendContactInquiryEmail, 
  sendClientThankYouEmail, 
  sendOrderChangeNotificationEmail 
} from '@/lib/services/nodemailer';
import { 
  getInquiriesRegistry, 
  saveInquiryRecord, 
  updateInquiryStatusRecord, 
  updateInquiryDetailsRecord,
  resolveEquipmentForInquiry,
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

    // Resolve machine from equipmentId or text
    const matchedFleet = resolveEquipmentForInquiry({
      equipment_id: equipmentId,
      physical_asset_id: equipmentId,
      service_category: serviceCategory,
      notes,
    });

    const assetId = equipmentId || matchedFleet.id;
    const dailyRate = matchedFleet.dailyRate || 45000;
    const assetName = matchedFleet.name;

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
      physical_asset_id: assetId,
      equipment_id: assetId,
      customer_id: customerId || null,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      service_category: serviceCategory || assetName,
      location: location || 'Meru County / Mt. Kenya Region',
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      daily_rate: dailyRate,
      total_amount: dailyRate * 3,
      status: 'PENDING',
      preferred_contact: preferredContact || 'WHATSAPP',
      notes: compiledNotes || notes || '',
      created_at: new Date().toISOString(),
      equipment_name: assetName,
      equipment_category: matchedFleet.category,
      equipment_model: matchedFleet.model,
      equipment_image: matchedFleet.image,
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
          r.physical_asset_id as equipment_id,
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
        equipment_id: reg.equipment_id || reg.physical_asset_id,
        physical_asset_id: reg.physical_asset_id || reg.equipment_id,
        start_date: reg.start_date,
        end_date: reg.end_date,
      });
    }

    // Add DB records
    for (const dbItem of dbInquiries) {
      if (!mergedMap.has(dbItem.id)) {
        mergedMap.set(dbItem.id, {
          ...dbItem,
          equipment_id: dbItem.equipment_id || dbItem.physical_asset_id,
          physical_asset_id: dbItem.physical_asset_id || dbItem.equipment_id,
        });
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
    const resolvedParams = await Promise.resolve(params || {});
    const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
    const idFromPath = pathParts[pathParts.length - 2];
    const id = resolvedParams.id || idFromPath;

    const { status } = await req.json();

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid reservation status' }, { status: 400 });
    }

    // Retrieve previous record before update
    const currentRegistry = await getInquiriesRegistry();
    const existing = currentRegistry.find((i) => i.id === id);
    const previousStatus = existing?.status || 'PENDING';

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

    // 3. Dispatch Client Notification Email
    const targetRecord = updatedRecord || existing;
    if (targetRecord && targetRecord.client_email) {
      const clientEmail = targetRecord.client_email;
      const clientName = targetRecord.client_name || 'Valued Client';
      const equipmentName = targetRecord.equipment_name || targetRecord.service_category || 'Heavy Machinery';

      let changeDesc = `Booking status updated from ${previousStatus} to ${status}.`;
      if (status === 'CONFIRMED') {
        changeDesc = `Your heavy machinery reservation for ${equipmentName} has been officially approved and locked on the HLG Master Fleet Calendar.`;
      } else if (status === 'CANCELLED') {
        changeDesc = `Your reservation hold for ${equipmentName} has been released and marked as cancelled.`;
      }

      sendOrderChangeNotificationEmail({
        clientName,
        clientEmail,
        clientPhone: targetRecord.client_phone,
        orderId: targetRecord.id,
        equipmentName,
        equipmentModel: targetRecord.equipment_model,
        equipmentCategory: targetRecord.equipment_category,
        startDate: targetRecord.start_date,
        endDate: targetRecord.end_date,
        status,
        previousStatus,
        changeType: 'STATUS_CHANGE',
        changeDescription: changeDesc,
        location: targetRecord.location,
        dailyRate: targetRecord.daily_rate,
        notes: targetRecord.notes || undefined,
      }).catch((emailErr) => console.error('Failed to dispatch status change email:', emailErr));
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

export async function updateInquiry(req: NextRequest, { params }: { params: any }) {
  try {
    const resolvedParams = await Promise.resolve(params || {});
    const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
    const idFromPath = pathParts[pathParts.length - 1];
    const id = resolvedParams.id || idFromPath;

    const body = await req.json();
    const { startDate, endDate, equipmentId, status, notes } = body;

    // Retrieve previous state before update
    const currentRegistry = await getInquiriesRegistry();
    const existing = currentRegistry.find((i) => i.id === id);
    const prevStartDate = existing?.start_date;
    const prevEndDate = existing?.end_date;
    const prevStatus = existing?.status || 'PENDING';
    const prevEquipmentName = existing?.equipment_name;

    const result = await updateInquiryDetailsRecord(id, {
      ...(startDate ? { start_date: new Date(startDate).toISOString() } : {}),
      ...(endDate ? { end_date: new Date(endDate).toISOString() } : {}),
      ...(equipmentId ? { physical_asset_id: equipmentId, equipment_id: equipmentId } : {}),
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        conflict: result.conflict,
      }, { status: 409 });
    }

    // Also update in PostgreSQL
    try {
      if (startDate && endDate) {
        await db.query(`
          UPDATE public.reservations
          SET booking_period = tstzrange($1::timestamptz, $2::timestamptz, '[)'),
              ${status ? 'status = $3,' : ''}
              ${equipmentId ? 'physical_asset_id = $4,' : ''}
              updated_at = NOW()
          WHERE id = $5;
        `, [
          new Date(startDate).toISOString(),
          new Date(endDate).toISOString(),
          ...(status ? [status] : []),
          ...(equipmentId ? [equipmentId] : []),
          id
        ]);
      }
    } catch (dbErr: any) {
      console.warn('Postgres reservation update fallback:', dbErr.message);
    }

    // Dispatch Client Notification Email for Date Change / Extension / Machinery Update
    const updated = result.data;
    if (updated && updated.client_email) {
      const clientEmail = updated.client_email;
      const clientName = updated.client_name || 'Valued Client';
      const equipmentName = updated.equipment_name || updated.service_category || 'Heavy Machinery';

      const isDateExtended = Boolean(
        prevEndDate && updated.end_date &&
        new Date(updated.end_date).getTime() > new Date(prevEndDate).getTime()
      );
      const isDateChanged = Boolean(
        (prevStartDate && updated.start_date && new Date(updated.start_date).getTime() !== new Date(prevStartDate).getTime()) ||
        (prevEndDate && updated.end_date && new Date(updated.end_date).getTime() !== new Date(prevEndDate).getTime())
      );
      const isStatusChanged = Boolean(prevStatus && updated.status && prevStatus !== updated.status);
      const isEquipmentChanged = Boolean(prevEquipmentName && updated.equipment_name && prevEquipmentName !== updated.equipment_name);

      let changeType: 'STATUS_CHANGE' | 'DATE_CHANGE' | 'EXTENSION' | 'EQUIPMENT_REALLOCATION' | 'ORDER_MODIFIED' = 'ORDER_MODIFIED';
      let changeDesc = 'Project schedule and machinery allocation updated by HLG Fleet Dispatch.';

      if (isDateExtended) {
        changeType = 'EXTENSION';
        const daysAdded = Math.round((new Date(updated.end_date).getTime() - new Date(prevEndDate!).getTime()) / (1000 * 60 * 60 * 24));
        changeDesc = `Project duration extended by ${daysAdded} day${daysAdded > 1 ? 's' : ''}. New scheduled completion date: ${new Date(updated.end_date).toLocaleDateString('en-GB')}.`;
      } else if (isDateChanged) {
        changeType = 'DATE_CHANGE';
        changeDesc = `Project schedule dates updated. Start: ${new Date(updated.start_date).toLocaleDateString('en-GB')}, End: ${new Date(updated.end_date).toLocaleDateString('en-GB')}.`;
      } else if (isStatusChanged) {
        changeType = 'STATUS_CHANGE';
        changeDesc = `Booking status updated from ${prevStatus} to ${updated.status}.`;
      } else if (isEquipmentChanged) {
        changeType = 'EQUIPMENT_REALLOCATION';
        changeDesc = `Assigned equipment reallocated to ${updated.equipment_name}.`;
      }

      sendOrderChangeNotificationEmail({
        clientName,
        clientEmail,
        clientPhone: updated.client_phone,
        orderId: updated.id,
        equipmentName,
        equipmentModel: updated.equipment_model,
        equipmentCategory: updated.equipment_category,
        startDate: updated.start_date,
        endDate: updated.end_date,
        previousStartDate: isDateChanged ? prevStartDate : undefined,
        previousEndDate: isDateChanged ? prevEndDate : undefined,
        status: updated.status,
        previousStatus: prevStatus,
        changeType,
        changeDescription: changeDesc,
        location: updated.location,
        dailyRate: updated.daily_rate,
        notes: updated.notes || undefined,
      }).catch((emailErr) => console.error('Failed to dispatch order change email:', emailErr));
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Project schedule and machinery allocation updated successfully.',
    }, { status: 200 });
  } catch (err: any) {
    console.error('Error updating inquiry details:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
