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

async function main() {
  const client = await pool.connect();
  try {
    const profs = await client.query(`
      SELECT id, full_name, email, role, phone_number, account_status 
      FROM public.profiles 
      ORDER BY role, full_name;
    `);
    console.log('=== PROFILES IN DB ===');
    console.table(profs.rows);

    const logs = await client.query(`
      SELECT 
        l.id,
        l.staff_id,
        COALESCE(p.full_name, 'No Profile Linked') as staff_name,
        l.equipment_id,
        a.name as equipment_name,
        l.start_meter,
        l.end_meter,
        (l.end_meter - l.start_meter) as hours,
        l.fuel_amount,
        l.date_submitted,
        l.verification_status
      FROM public.staff_logs l
      LEFT JOIN public.profiles p ON l.staff_id = p.id
      LEFT JOIN public.physical_assets a ON l.equipment_id = a.id
      ORDER BY l.date_submitted DESC;
    `);
    console.log('\n=== STAFF LOGS PER OPERATOR IN DB ===');
    console.table(logs.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
