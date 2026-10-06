import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';

export async function getSystemSettings(req: NextRequest, { params }: { params: any }) {
  try {
    const result = await db.query(`
      SELECT key, value, description, updated_at
      FROM public.system_settings;
    `);

    const settingsMap: Record<string, any> = {};
    for (const row of result.rows) {
      settingsMap[row.key] = row.value;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function updateSystemSettings(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const { 
      dispatch_hotlines, 
      notification_channels, 
      operational_parameters,
      service_categories,
      operational_regions,
      quarry_materials
    } = body;

    if (dispatch_hotlines) {
      await db.query(`
        INSERT INTO public.system_settings (key, value, description, updated_at)
        VALUES ('dispatch_hotlines', $1, 'Central quarry operations and emergency dispatch phone numbers in Meru', NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(dispatch_hotlines)]);
    }

    if (notification_channels) {
      await db.query(`
        INSERT INTO public.system_settings (key, value, description, updated_at)
        VALUES ('notification_channels', $1, 'Administrative email channels for fleet breakdown alerts and client inquiries', NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(notification_channels)]);
    }

    if (operational_parameters) {
      await db.query(`
        INSERT INTO public.system_settings (key, value, description, updated_at)
        VALUES ('operational_parameters', $1, 'Commercial diesel pricing and baseline telematics service trigger parameters', NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(operational_parameters)]);
    }

    if (service_categories) {
      await db.query(`
        INSERT INTO public.system_settings (key, value, description, updated_at)
        VALUES ('service_categories', $1, 'Configurable operational scopes and service inquiry categories', NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(service_categories)]);
    }

    if (operational_regions) {
      await db.query(`
        INSERT INTO public.system_settings (key, value, description, updated_at)
        VALUES ('operational_regions', $1, 'Geographic deployment zones and quarry logistics regions across Mount Kenya & East Africa', NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(operational_regions)]);
    }

    if (quarry_materials) {
      await db.query(`
        INSERT INTO public.system_settings (key, value, description, updated_at)
        VALUES ('quarry_materials', $1, 'Verified quarry yield materials and site dispatch stock', NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(quarry_materials)]);
    }

    return NextResponse.json({
      success: true,
      message: 'System settings successfully updated in database',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
