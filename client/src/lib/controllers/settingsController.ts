import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/server-config/db';

const DEFAULT_SETTINGS: Record<string, any> = {
  dispatch_hotlines: {
    primary: '+254717186396',
    backup: '+254748866823',
    meru_quarry_lead: '+254748866823',
    emergency_ops: '+254717186396',
  },
  notification_channels: {
    dispatch_email: 'hilosgehtinfo@gmail.com',
    test_target_email: 'kbrian1237@gmail.com',
  },
  operational_parameters: {
    diesel_price_kes: 180,
    maintenance_interval_hours: 250,
  },
  service_categories: [
    'Excavation & Earthmoving',
    'Quarry Material Supply',
    'Road Grading & Compaction',
    'Demolition & Site Clearance',
    'Equipment Logistics & Transport'
  ],
  operational_regions: [
    'Meru Central & Town',
    'Maua & Nyambene',
    'Timau & Nanyuki',
    'Isiolo Corridor',
    'Embu & Tharaka Nithi'
  ],
  quarry_materials: [
    'Ballast (1/2", 3/4", 1")',
    'Hardcore & Foundation Stone',
    'Quarry Dust & Manufactured Sand',
    'Murram & Sub-base Material'
  ],
};

let cachedSettings = { ...DEFAULT_SETTINGS };

export async function getSystemSettings(req: NextRequest, { params }: { params: any }) {
  try {
    const result = await db.query(`
      SELECT key, value, description, updated_at
      FROM public.system_settings;
    `);

    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };
    for (const row of result.rows) {
      settingsMap[row.key] = row.value;
    }
    cachedSettings = settingsMap;

    return NextResponse.json({
      success: true,
      data: settingsMap,
    }, { status: 200 });
  } catch (error: any) {
    console.warn('⚠️ Database query failed for system settings, returning cached defaults:', error.message);
    return NextResponse.json({
      success: true,
      data: cachedSettings,
    }, { status: 200 });
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

    if (dispatch_hotlines) cachedSettings.dispatch_hotlines = dispatch_hotlines;
    if (notification_channels) cachedSettings.notification_channels = notification_channels;
    if (operational_parameters) cachedSettings.operational_parameters = operational_parameters;
    if (service_categories) cachedSettings.service_categories = service_categories;
    if (operational_regions) cachedSettings.operational_regions = operational_regions;
    if (quarry_materials) cachedSettings.quarry_materials = quarry_materials;

    try {
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
    } catch (dbErr: any) {
      console.warn('⚠️ Database settings write skipped/offline:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'System settings successfully updated',
      data: cachedSettings,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
