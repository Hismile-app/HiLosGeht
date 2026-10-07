const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { put, list, get } = require('@vercel/blob');

dotenv.config({ path: path.resolve(__dirname, '../client/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'HiLosGeht123',
  database: process.env.DB_NAME || 'postgres',
});

async function fixAdminPhone() {
  console.log('--- 1. UPDATING ADMIN PHONE IN POSTGRESQL ---');
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE public.profiles
      SET phone_number = '+254748866823'
      WHERE id = '00000000-0000-0000-0000-000000000001' OR role = 'ADMIN';
    `);
    console.log('✅ Admin phone updated in DB to +254748866823');

    // Verify all 5 profiles in DB
    const res = await client.query('SELECT id, full_name, email, phone_number, role FROM public.profiles ORDER BY role ASC, full_name ASC');
    console.log('DB PROFILES:');
    console.table(res.rows);

    // 2. Update Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      console.log('--- 2. UPDATING VERCEL BLOB REGISTRY ---');
      const listRes = await list({ token, prefix: 'system/staff_registry.json' });
      const found = listRes.blobs.find(b => b.pathname === 'system/staff_registry.json');
      let registry = [];
      if (found) {
        const blob = await get(found.url, { token, access: 'private' });
        const text = await new Response(blob.stream).text();
        registry = JSON.parse(text);
      }
      
      registry = registry.map(u => {
        if (u.role === 'ADMIN' || u.email === 'hilosgehtinfo@gmail.com') {
          return { ...u, phone_number: '+254748866823' };
        }
        return u;
      });

      await put('system/staff_registry.json', JSON.stringify(registry, null, 2), {
        access: 'private',
        token,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      console.log('✅ Vercel Blob system/staff_registry.json updated!');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

fixAdminPhone().catch(console.error);
