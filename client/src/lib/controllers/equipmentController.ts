import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';

export async function getAllEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { category, status } = Object.fromEntries(req.nextUrl.searchParams.entries());
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

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function getEquipmentById(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const result = await db.query('SELECT * FROM public.physical_assets WHERE id = $1;', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Equipment not found' }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      data: {
        ...result.rows[0],
        reservations: resResult.rows,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching equipment by id:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function checkEquipmentAvailability(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const { startDate, endDate } = Object.fromEntries(req.nextUrl.searchParams.entries());

    if (!startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'startDate and endDate query parameters are required' }, { status: 400 });
    }

    const overlapResult = await db.query(`
      SELECT id, client_name, lower(booking_period) as start_date, upper(booking_period) as end_date, status
      FROM public.reservations
      WHERE physical_asset_id = $1
        AND status != 'CANCELLED'
        AND booking_period && tstzrange($2, $3, '[)');
    `, [id, startDate, endDate]);

    const isAvailable = overlapResult.rows.length === 0;

    return NextResponse.json({
      success: true,
      isAvailable,
      conflicts: overlapResult.rows,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function createEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { name, category, model, dailyRate, imageUrl, specs, telemetryApiId } = await req.json();
    const result = await db.query(`
      INSERT INTO public.physical_assets (
        name, category, model, daily_rate, image_url, specs, telemetry_api_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [name, category, model, dailyRate, imageUrl, JSON.stringify(specs || {}), telemetryApiId]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function updateEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const { name, category, model, dailyRate, status, imageUrl, currentHourMeter, specs } = await req.json();

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
      return NextResponse.json({ success: false, error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function deleteEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const result = await db.query('DELETE FROM public.physical_assets WHERE id = $1 RETURNING id;', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Equipment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Equipment deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
