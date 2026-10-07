const { Pool } = require('pg');
const { list, get } = require('@vercel/blob');
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

process.env.BLOB_READ_WRITE_TOKEN = envVars.BLOB_READ_WRITE_TOKEN;

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
    // 1. Fetch from blob
    let blobProfiles = [];
    const listRes = await list();
    const staffBlob = listRes.blobs.find(b => b.pathname === 'system/staff_registry.json');
    if (staffBlob) {
      const res = await fetch(staffBlob.url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      blobProfiles = await res.json();
    }
    console.log(`Found ${blobProfiles.length} profiles in Vercel Blob registry.`);

    // 2. Check each blob profile against PostgreSQL
    for (const p of blobProfiles) {
      const checkRes = await client.query('SELECT id, email FROM public.profiles WHERE LOWER(email) = LOWER($1);', [p.email]);
      if (checkRes.rows.length === 0) {
        console.log(`Profile ${p.email} (${p.full_name}) missing from DB. Inserting...`);
        // Assign deterministic UUID for database
        await client.query(`
          INSERT INTO public.profiles (
            id, full_name, email, phone_number, role, account_status, password_hash
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6
          );
        `, [
          p.full_name,
          p.email.toLowerCase().trim(),
          p.phone_number,
          p.role || 'OPERATOR',
          p.account_status || 'ACTIVE',
          p.password_hash || ''
        ]);
        console.log(`Inserted ${p.email} into public.profiles.`);
      } else {
        console.log(`Profile ${p.email} already exists in DB with id ${checkRes.rows[0].id}.`);
      }
    }

    const allDb = await client.query('SELECT id, full_name, email, role FROM public.profiles ORDER BY role, full_name;');
    console.log('\n=== CURRENT DB PROFILES ===');
    console.table(allDb.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
