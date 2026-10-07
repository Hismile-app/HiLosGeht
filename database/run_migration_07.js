const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../client/.env.local') });

async function runMigration() {
  const pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'HiLosGeht123',
    database: process.env.DB_NAME || 'postgres',
  });

  try {
    const sqlPath = path.join(__dirname, '07_meter_proof_images.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running migration: 07_meter_proof_images.sql...');
    await pool.query(sql);
    console.log('✓ Migration executed successfully.');

    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'staff_logs' 
        AND column_name IN ('start_meter_proof_image', 'end_meter_proof_image', 'meter_proof_image');
    `);
    console.log('Verified columns in public.staff_logs:');
    console.table(res.rows);

    const sampleRes = await pool.query('SELECT id, equipment_id, start_meter, end_meter, meter_proof_image, end_meter_proof_image FROM public.staff_logs LIMIT 3;');
    console.log('Sample rows:');
    console.table(sampleRes.rows);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
