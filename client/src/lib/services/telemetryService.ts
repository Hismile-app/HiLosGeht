import db from '@/lib/server-config/db';

export interface AEMP20TelemetryPayload {
  version?: string;
  Equipment: {
    EquipmentHeader: {
      Make: string;
      Model: string;
      EquipmentSerialNumber: string;
      PIN?: string;
      AssetId?: string;
    };
    CumulativeOperatingHours?: {
      Hour: number;
      Datetime: string;
    };
    FuelRemaining?: {
      Percent: number;
      Datetime: string;
    };
    Location?: {
      Latitude: number;
      Longitude: number;
      Altitude?: number;
      Datetime: string;
    };
    DiagnosticTroubleCodes?: Array<{
      Code: string;
      Description: string;
      Severity: string;
    }>;
  };
}

export async function processAEMPTelemetry(payload: AEMP20TelemetryPayload) {
  const header = payload.Equipment?.EquipmentHeader;
  if (!header) {
    throw new Error('Invalid AEMP 2.0 Payload: Missing EquipmentHeader');
  }

  const serial = header.EquipmentSerialNumber || header.PIN || header.AssetId || '';
  const make = header.Make || '';
  const model = header.Model || '';
  const newHours = payload.Equipment.CumulativeOperatingHours?.Hour;

  console.log(`📡 Ingesting ISO 15143-3 / AEMP 2.0 Telematics for: ${make} ${model} [Serial: ${serial}]`);

  // 1. Resolve matching equipment in HLG fleet
  let assetRes = await db.query(`
    SELECT * FROM public.physical_assets
    WHERE telemetry_api_id = $1 
       OR model ILIKE $2
       OR name ILIKE $2
    LIMIT 1;
  `, [serial, `%${model}%`]);

  if (assetRes.rows.length === 0) {
    // Try matching make & model
    assetRes = await db.query(`
      SELECT * FROM public.physical_assets
      WHERE model ILIKE $1 OR category ILIKE $1
      LIMIT 1;
    `, [`%${make}%`]);
  }

  if (assetRes.rows.length === 0) {
    throw new Error(`No matching HLG physical asset registered for telematics ID: ${serial} (${make} ${model})`);
  }

  const asset = assetRes.rows[0];
  const oldHours = parseFloat(asset.current_hour_meter);

  let updatedAsset = asset;
  if (newHours !== undefined && newHours > oldHours) {
    // Updating current_hour_meter fires DB Trigger trg_evaluate_maintenance_limits
    const updateRes = await db.query(`
      UPDATE public.physical_assets
      SET 
        current_hour_meter = $1,
        telemetry_api_id = COALESCE(telemetry_api_id, $2),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `, [newHours, serial, asset.id]);

    updatedAsset = updateRes.rows[0];
  }

  // Check if new maintenance tasks were generated for this asset
  const tasksRes = await db.query(`
    SELECT * FROM public.staff_tasks
    WHERE equipment_id = $1
    ORDER BY created_at DESC
    LIMIT 3;
  `, [asset.id]);

  return {
    success: true,
    equipmentId: asset.id,
    equipmentName: asset.name,
    telemetrySerial: serial,
    previousHours: oldHours,
    updatedHours: newHours || oldHours,
    maintenanceTasksTriggered: tasksRes.rows,
  };
}

export default { processAEMPTelemetry };
