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
    await client.query(`
      ALTER TABLE public.staff_logs
      ADD COLUMN IF NOT EXISTS start_fuel_reading numeric,
      ADD COLUMN IF NOT EXISTS end_fuel_reading numeric,
      ADD COLUMN IF NOT EXISTS start_fuel_proof_image text,
      ADD COLUMN IF NOT EXISTS end_fuel_proof_image text;
    `);
    console.log('Successfully added fuel reading columns to public.staff_logs!');

    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'staff_logs'
      ORDER BY ordinal_position;
    `);
    console.table(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
