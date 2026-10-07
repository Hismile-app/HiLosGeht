import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';

const FALLBACK_FLEET = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Komatsu PC-200 Heavy Excavator',
    category: 'Excavator',
    model: 'Komatsu PC-200',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/excavator.jpg',
    current_hour_meter: 342.5,
    telemetry_api_id: 'KOM-PC200-KE-001',
    specs: {
      engine_power: '110 kW / 148 HP',
      operating_weight: '20,500 kg',
      bucket_capacity: '1.0 m³',
      max_dig_depth: '6.62 m',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Komatsu D155AX-8 Crawler Dozer',
    category: 'Dozer',
    model: 'Komatsu D155AX-8',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/dozer.jpg',
    current_hour_meter: 490.0,
    telemetry_api_id: 'KOM-D155-KE-002',
    specs: {
      engine_power: '268 kW / 360 HP',
      operating_weight: '41,200 kg',
      blade_capacity: '9.4 m³',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'JCB 3DX Backhoe Loader (Machine A)',
    category: 'Backhoe',
    model: 'JCB 3DX - 3654401',
    serial_number: '3654401',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/backhoe.jpg',
    current_hour_meter: 291.7,
    telemetry_api_id: 'JCB-3654401',
    specs: {
      engine_power: '55 kW / 74 HP',
      operating_weight: '7,460 kg',
      loader_capacity: '1.1 m³',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111109',
    name: 'JCB 3DX Backhoe Loader (Machine B)',
    category: 'Backhoe',
    model: 'JCB 3DX - 3654406',
    serial_number: '3654406',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/backhoe.jpg',
    current_hour_meter: 201.0,
    telemetry_api_id: 'JCB-3654406',
    specs: {
      engine_power: '55 kW / 74 HP',
      operating_weight: '7,460 kg',
      loader_capacity: '1.1 m³',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Shantui SL60W-2 Heavy Wheel Loader',
    category: 'Wheel Loader',
    model: 'Shantui SL60W-2',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/wheel_loader.jpg',
    current_hour_meter: 215.4,
    telemetry_api_id: 'SHN-SL60-KE-004',
    specs: {
      rated_load: '6,000 kg',
      operating_weight: '21,000 kg',
      bucket_capacity: '3.5 m³',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Shantui SG18-3 Motor Grader',
    category: 'Grader',
    model: 'Shantui SG18-3',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/grader.jpg',
    current_hour_meter: 310.2,
    telemetry_api_id: 'SHN-SG18-KE-005',
    specs: {
      engine_power: '132 kW / 177 HP',
      operating_weight: '16,200 kg',
      blade_length: '3.66 m',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'Hamm 311 Compactor Roller',
    category: 'Roller',
    model: 'Hamm 311',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/roller.jpg',
    current_hour_meter: 185.0,
    telemetry_api_id: 'HAMM-311-KE-006',
    specs: {
      operating_weight: '11,300 kg',
      drum_width: '2,140 mm',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'Mercedes-Benz Actros 3340 Tipper',
    category: 'Tipper',
    model: 'Actros 3340',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/tipper.jpg',
    current_hour_meter: 540.0,
    telemetry_api_id: 'MB-ACTR-KE-007',
    specs: {
      payload_capacity: '20 m³ / 30,000 kg',
      engine_power: '290 kW / 394 HP',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'Heavy Lowbed Equipment Trailer',
    category: 'Transport',
    model: '3-Axle Lowbed 60T',
    daily_rate: 0,
    status: 'AVAILABLE',
    image_url: '/images/equipment/lowbed.jpg',
    current_hour_meter: 420.0,
    telemetry_api_id: 'HLG-LOWB-KE-008',
    specs: {
      haulage_capacity: '60,000 kg (60 Ton)',
      deck_length: '12.5 m',
    }
  }
];

export async function getAllEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { category, status } = Object.fromEntries(req.nextUrl.searchParams.entries());
    let query = 'SELECT * FROM public.physical_assets WHERE 1=1';
    const paramsList: any[] = [];

    if (category) {
      paramsList.push(category);
      query += ` AND category = $${paramsList.length}`;
    }

    if (status) {
      paramsList.push(status);
      query += ` AND status = $${paramsList.length}`;
    }

    query += ' ORDER BY name ASC;';
    const result = await db.query(query, paramsList);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    }, { status: 200 });
  } catch (error: any) {
    console.warn('⚠️ Database query failed for equipment, returning fallback fleet:', error.message);
    const { category, status } = Object.fromEntries(req.nextUrl.searchParams.entries());
    let filtered = [...FALLBACK_FLEET];
    if (category) {
      filtered = filtered.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }
    if (status) {
      filtered = filtered.filter(f => f.status.toUpperCase() === status.toUpperCase());
    }
    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    }, { status: 200 });
  }
}

export async function getEquipmentById(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await (params || {});
    let equipmentRow: any = null;
    let reservations: any[] = [];

    try {
      const result = await db.query('SELECT * FROM public.physical_assets WHERE id = $1;', [id]);
      if (result.rows.length > 0) {
        equipmentRow = result.rows[0];
      }

      if (equipmentRow) {
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
        reservations = resResult.rows;
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Database query failed for machine details:', dbErr.message);
    }

    if (!equipmentRow) {
      equipmentRow = FALLBACK_FLEET.find(f => f.id === id);
    }

    if (!equipmentRow) {
      return NextResponse.json({ success: false, error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...equipmentRow,
        reservations,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching equipment by id:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function checkEquipmentAvailability(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await (params || {});
    const { startDate, endDate } = Object.fromEntries(req.nextUrl.searchParams.entries());

    if (!startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'startDate and endDate query parameters are required' }, { status: 400 });
    }

    let conflicts: any[] = [];
    try {
      const overlapResult = await db.query(`
        SELECT id, client_name, lower(booking_period) as start_date, upper(booking_period) as end_date, status
        FROM public.reservations
        WHERE physical_asset_id = $1
          AND status != 'CANCELLED'
          AND booking_period && tstzrange($2, $3, '[)');
      `, [id, startDate, endDate]);
      conflicts = overlapResult.rows;
    } catch (dbErr: any) {
      console.warn('⚠️ Availability check fallback:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      isAvailable: conflicts.length === 0,
      conflicts,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function createEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { name, category, model, dailyRate, imageUrl, specs, telemetryApiId } = await req.json();
    let newEquipment: any = null;

    try {
      const result = await db.query(`
        INSERT INTO public.physical_assets (
          name, category, model, daily_rate, image_url, specs, telemetry_api_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `, [name, category, model, dailyRate, imageUrl, JSON.stringify(specs || {}), telemetryApiId]);
      newEquipment = result.rows[0];
    } catch (dbErr: any) {
      console.warn('⚠️ Database write failed, adding to fallback fleet:', dbErr.message);
      newEquipment = {
        id: '11111111-1111-1111-1111-' + String(Date.now()).slice(-12),
        name,
        category,
        model,
        daily_rate: dailyRate || 0,
        status: 'AVAILABLE',
        image_url: imageUrl || '/images/equipment/excavator.jpg',
        current_hour_meter: 0,
        telemetry_api_id: telemetryApiId || 'HLG-CUSTOM-001',
        specs: specs || {},
      };
      FALLBACK_FLEET.unshift(newEquipment);
    }

    return NextResponse.json({ success: true, data: newEquipment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function updateEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await (params || {});
    const { name, category, model, dailyRate, status, imageUrl, currentHourMeter, specs } = await req.json();
    let updatedItem: any = null;

    try {
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
      if (result.rows.length > 0) {
        updatedItem = result.rows[0];
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Database update failed, updating fallback fleet:', dbErr.message);
      const idx = FALLBACK_FLEET.findIndex(f => f.id === id);
      if (idx >= 0) {
        FALLBACK_FLEET[idx] = {
          ...FALLBACK_FLEET[idx],
          ...(name ? { name } : {}),
          ...(category ? { category } : {}),
          ...(model ? { model } : {}),
          ...(status ? { status } : {}),
          ...(imageUrl ? { image_url: imageUrl } : {}),
          ...(currentHourMeter !== undefined ? { current_hour_meter: currentHourMeter } : {}),
        };
        updatedItem = FALLBACK_FLEET[idx];
      }
    }

    if (!updatedItem) {
      return NextResponse.json({ success: false, error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function deleteEquipment(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await (params || {});
    let deleted = false;

    try {
      const result = await db.query('DELETE FROM public.physical_assets WHERE id = $1 RETURNING id;', [id]);
      deleted = result.rows.length > 0;
    } catch (dbErr: any) {
      console.warn('⚠️ Database delete failed, removing from fallback fleet:', dbErr.message);
      const idx = FALLBACK_FLEET.findIndex(f => f.id === id);
      if (idx >= 0) {
        FALLBACK_FLEET.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Equipment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Equipment deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
