const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const targetPath = path.resolve(__dirname, '../client/src/lib/services/logsRegistry.ts');
let content = fs.readFileSync(targetPath, 'utf8');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'postgres',
  password: 'HiLosGeht123',
  database: 'postgres',
});

async function updateFile() {
  const res = await pool.query(`
    SELECT 
      l.id, l.staff_id, l.equipment_id, l.start_meter, l.end_meter,
      (l.end_meter - l.start_meter) as hours_worked,
      l.work_description, l.fuel_amount, l.start_fuel_reading, l.end_fuel_reading,
      l.fuel_proof_image, l.materials_received, l.date_submitted, l.verification_status,
      COALESCE(p.full_name, 'Certified Operator') as staff_name,
      COALESCE(p.full_name, 'Certified Operator') as operator_name,
      COALESCE(p.email, 'operator@hilosgeht.co.ke') as staff_email,
      COALESCE(p.email, 'operator@hilosgeht.co.ke') as operator_email,
      p.avatar_url as operator_avatar,
      p.avatar_url as staff_avatar,
      COALESCE(a.name, 'Heavy Machinery') as equipment_name,
      COALESCE(a.model, 'Asset') as equipment_model,
      COALESCE(a.category, 'Heavy Equipment') as equipment_category
    FROM public.staff_logs l
    LEFT JOIN public.profiles p ON l.staff_id = p.id
    LEFT JOIN public.physical_assets a ON l.equipment_id = a.id
    ORDER BY l.date_submitted ASC;
  `);

  const allLogs = res.rows.map((r) => ({
    id: r.id,
    staff_id: r.staff_id,
    equipment_id: r.equipment_id,
    start_meter: parseFloat(r.start_meter),
    end_meter: parseFloat(r.end_meter),
    hours_worked: parseFloat(r.hours_worked),
    work_description: r.work_description,
    fuel_amount: parseFloat(r.fuel_amount || 0),
    start_fuel_reading: r.start_fuel_reading !== null ? parseFloat(r.start_fuel_reading) : null,
    end_fuel_reading: r.end_fuel_reading !== null ? parseFloat(r.end_fuel_reading) : null,
    fuel_proof_image: r.fuel_proof_image || null,
    materials_received: r.materials_received || null,
    materials_proof_image: null,
    start_meter_proof_image: null,
    end_meter_proof_image: null,
    meter_proof_image: null,
    date_submitted: r.date_submitted instanceof Date ? r.date_submitted.toISOString() : r.date_submitted,
    verification_status: r.verification_status,
    staff_name: r.staff_name,
    operator_name: r.operator_name,
    staff_email: r.staff_email,
    operator_email: r.operator_email,
    operator_avatar: r.operator_avatar,
    staff_avatar: r.staff_avatar,
    equipment_name: r.equipment_name,
    equipment_model: r.equipment_model,
    equipment_category: r.equipment_category,
  }));

  console.log('Total logs fetched from DB:', allLogs.length);

  const markerStart = 'export const SEED_FLEET_LOGS: OperationalStaffLog[] = [';
  const markerEnd = "const LOGS_PATHNAME = 'system/staff_logs.json';";

  const startIdx = content.indexOf(markerStart);
  const endIdx = content.indexOf(markerEnd);

  if (startIdx !== -1 && endIdx !== -1) {
    const formattedJson = JSON.stringify(allLogs, null, 2);
    const newContent =
      content.slice(0, startIdx) +
      'export const SEED_FLEET_LOGS: OperationalStaffLog[] = ' +
      formattedJson +
      ';\n\n' +
      content.slice(endIdx);
    fs.writeFileSync(targetPath, newContent, 'utf8');
    console.log('Successfully updated logsRegistry.ts with all', allLogs.length, 'logs!');
  } else {
    console.error('Could not find markers in logsRegistry.ts:', { startIdx, endIdx });
  }

  await pool.end();
}

updateFile().catch(console.error);
