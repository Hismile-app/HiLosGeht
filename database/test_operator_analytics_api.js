const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../client/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[match[1]] = value.trim();
  }
}

const pool = new Pool({
  host: envVars.DB_HOST || '127.0.0.1',
  port: parseInt(envVars.DB_PORT || '5433', 10),
  database: envVars.DB_NAME || 'postgres',
  user: envVars.DB_USER || 'postgres',
  password: envVars.DB_PASSWORD || 'postgres',
});

async function testOperatorAnalytics() {
  const client = await pool.connect();
  try {
    console.log('=== TEST 1: Querying Operator Telematics Aggregates ===');
    const logsRes = await client.query(`
      SELECT 
        l.id,
        l.staff_id,
        l.equipment_id,
        l.start_meter,
        l.end_meter,
        (l.end_meter - l.start_meter) as hours_worked,
        l.work_description,
        l.fuel_amount,
        l.start_meter_proof_image,
        l.end_meter_proof_image,
        l.meter_proof_image,
        l.date_submitted,
        l.verification_status,
        COALESCE(p.full_name, 'Lead Operator') as staff_name,
        COALESCE(a.name, 'Equipment') as equipment_name,
        COALESCE(a.category, 'Heavy Equipment') as equipment_category
      FROM public.staff_logs l
      LEFT JOIN public.profiles p ON l.staff_id = p.id
      LEFT JOIN public.physical_assets a ON l.equipment_id = a.id
      ORDER BY l.date_submitted DESC;
    `);

    console.log(`Retrieved ${logsRes.rows.length} operational shift records from live database.`);
    if (logsRes.rows.length === 0) {
      throw new Error('No staff logs found in database');
    }

    // Verify metrics computation
    let totalHours = 0;
    let totalFuel = 0;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    const machines = {};

    for (const r of logsRes.rows) {
      const h = parseFloat(r.hours_worked || 0);
      const f = parseFloat(r.fuel_amount || 0);
      totalHours += h;
      totalFuel += f;
      if (r.verification_status === 'APPROVED') approved++;
      else if (r.verification_status === 'REJECTED') rejected++;
      else pending++;

      machines[r.equipment_name] = (machines[r.equipment_name] || 0) + h;
    }

    console.log('\n=== COMPUTED OPERATOR ANALYTICS METRICS ===');
    console.log(`Total Engine Hours:  ${totalHours.toFixed(1)} hrs`);
    console.log(`Total Fuel Logged:   ${totalFuel.toFixed(1)} L`);
    console.log(`Average Burn Rate:   ${totalHours > 0 ? (totalFuel / totalHours).toFixed(2) : 0} L/hr`);
    console.log(`Approved Shifts:     ${approved}`);
    console.log(`Pending Review:      ${pending}`);
    console.log(`Machines Commanded:  ${Object.keys(machines).length}`);
    console.log('Hours by Machinery:', machines);

    console.log('\n=== TEST 2: Inspecting Sample Record for Chart Binding ===');
    const sample = logsRes.rows[0];
    console.log({
      shift_date: sample.date_submitted,
      machine: sample.equipment_name,
      hours: sample.hours_worked,
      start_meter: sample.start_meter,
      end_meter: sample.end_meter,
      fuel: sample.fuel_amount,
      status: sample.verification_status,
      start_proof: sample.start_meter_proof_image ? 'YES' : 'NONE',
      end_proof: sample.end_meter_proof_image ? 'YES' : 'NONE',
    });

    console.log('\n>>> OPERATOR ANALYTICS DATA PIPELINE VERIFIED SUCCESSFULLY! <<<');
  } finally {
    client.release();
    await pool.end();
  }
}

testOperatorAnalytics().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
