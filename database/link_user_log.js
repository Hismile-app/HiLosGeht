const { list, put, get } = require('@vercel/blob');
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

process.env.BLOB_READ_WRITE_TOKEN = envVars.BLOB_READ_WRITE_TOKEN;

const pool = new Pool({
  host: envVars.DB_HOST || '127.0.0.1',
  port: parseInt(envVars.DB_PORT || '5433', 10),
  database: envVars.DB_NAME || 'postgres',
  user: envVars.DB_USER || 'postgres',
  password: envVars.DB_PASSWORD || 'postgres',
});

async function linkLogs() {
  // 1. Fetch staff_logs from Vercel Blob
  const listRes = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
  const blobInfo = listRes.blobs.find(b => b.pathname === 'system/staff_logs.json');
  if (!blobInfo) {
    console.error('system/staff_logs.json not found in Blob!');
    return;
  }

  const res = await fetch(blobInfo.url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
  });
  const logs = await res.json();
  console.log(`Fetched ${logs.length} logs from Vercel Blob.`);

  // Find the recent unlinked log submitted by the user
  let updatedCount = 0;
  for (const log of logs) {
    if (log.id === 'log-muxybarz' || (log.work_description && log.work_description.includes('6 trips') && log.staff_id === null)) {
      console.log('Found unlinked log:', log.id, log.work_description);
      log.staff_id = 'usr_muws1i52gcay';
      log.staff_name = 'kb 1445 testor operator';
      log.staff_email = 'kbrian1445@gmail.com';
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    console.log(`Updating ${updatedCount} logs in Vercel Blob...`);
    await put('system/staff_logs.json', JSON.stringify(logs, null, 2), {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log('Successfully updated system/staff_logs.json in Vercel Blob!');
  }

  // 2. Also insert or link in PostgreSQL
  const client = await pool.connect();
  try {
    const profRes = await client.query("SELECT id FROM public.profiles WHERE LOWER(email) = 'kbrian1445@gmail.com';");
    if (profRes.rows.length === 0) {
      console.error('kbrian1445@gmail.com profile not found in DB!');
      return;
    }
    const staffDbUuid = profRes.rows[0].id;

    // Check if log already in DB or insert it
    const checkLog = await client.query("SELECT id FROM public.staff_logs WHERE work_description = '6 trips';");
    if (checkLog.rows.length === 0) {
      console.log('Inserting log-muxybarz into PostgreSQL public.staff_logs...');
      await client.query(`
        INSERT INTO public.staff_logs (
          staff_id,
          equipment_id,
          start_meter,
          end_meter,
          work_description,
          fuel_amount,
          start_meter_proof_image,
          end_meter_proof_image,
          meter_proof_image,
          date_submitted,
          verification_status
        ) VALUES (
          $1, '11111111-1111-1111-1111-111111111101', 342.5, 345.0, '6 trips', 20.0,
          '/api/v1/storage/view?url=https%3A%2F%2Fztkxbo3sajazo5zi.private.blob.vercel-storage.com%2Fproofs%2F1791368060298-Gemini_Generated_Image_nr7r9bnr7r9bnr7r.jfif',
          '/api/v1/storage/view?url=https%3A%2F%2Fztkxbo3sajazo5zi.private.blob.vercel-storage.com%2Fproofs%2F1791368069414-Screenshot_2026-09-29_145554.jpg',
          '/api/v1/storage/view?url=https%3A%2F%2Fztkxbo3sajazo5zi.private.blob.vercel-storage.com%2Fproofs%2F1791368069414-Screenshot_2026-09-29_145554.jpg',
          NOW(), 'PENDING'
        );
      `, [staffDbUuid]);
      console.log('Inserted log into PostgreSQL!');
    } else {
      console.log('Updating existing log in PostgreSQL with staff_id...');
      await client.query("UPDATE public.staff_logs SET staff_id = $1 WHERE work_description = '6 trips';", [staffDbUuid]);
      console.log('Updated log in PostgreSQL!');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

linkLogs().catch(console.error);
