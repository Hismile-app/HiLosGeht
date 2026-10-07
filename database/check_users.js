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
    const res = await client.query(`
      SELECT id, full_name, email, phone_number, role, account_status, password_hash 
      FROM public.profiles;
    `);
    console.log('Profiles in DB count:', res.rows.length);
    for (const r of res.rows) {
      console.log('USER:', r.email, '| PHONE:', r.phone_number, '| HASH:', r.password_hash);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
