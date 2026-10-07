const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../client/.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'HiLosGeht123',
  database: process.env.DB_NAME || 'postgres',
});

async function testMeterLogs() {
  console.log('--- 1. Querying staff_logs table structure for meter fields ---');
  const cols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'staff_logs' 
      AND column_name LIKE '%meter%';
  `);
  console.table(cols.rows);

  console.log('--- 2. Inserting a test log with start and end meter photos ---');
  const eqRes = await pool.query('SELECT id, name, current_hour_meter FROM public.physical_assets LIMIT 1;');
  const eq = eqRes.rows[0];
  console.log('Selected equipment for test:', eq.name, 'current meter:', eq.current_hour_meter);

  const startM = parseFloat(eq.current_hour_meter || 340);
  const endM = startM + 4.5;
  const insertRes = await pool.query(`
    INSERT INTO public.staff_logs (
      equipment_id,
      start_meter,
      end_meter,
      work_description,
      fuel_amount,
      start_meter_proof_image,
      end_meter_proof_image,
      meter_proof_image,
      date_submitted
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    ) RETURNING *;
  `, [
    eq.id,
    startM,
    endM,
    'Site rock excavation with verified gauge proof photos',
    35.0,
    'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/meter-start-test.jpg',
    'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/meter-end-test.jpg',
    'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/meter-end-test.jpg'
  ]);

  const inserted = insertRes.rows[0];
  console.log('✓ Inserted log successfully. ID:', inserted.id);
  console.log('start_meter_proof_image:', inserted.start_meter_proof_image);
  console.log('end_meter_proof_image:', inserted.end_meter_proof_image);
  console.log('meter_proof_image:', inserted.meter_proof_image);

  console.log('--- 3. Testing query matching analytics document audit deck ---');
  const deckRes = await pool.query(`
    SELECT 
      l.id as log_id,
      l.start_meter,
      l.end_meter,
      l.start_meter_proof_image,
      l.end_meter_proof_image,
      l.meter_proof_image,
      a.name as machine_name
    FROM public.staff_logs l
    JOIN public.physical_assets a ON l.equipment_id = a.id
    WHERE l.id = $1;
  `, [inserted.id]);
  console.table(deckRes.rows);

  console.log('--- 4. Cleaning up test row ---');
  await pool.query('DELETE FROM public.staff_logs WHERE id = $1;', [inserted.id]);
  console.log('✓ Cleaned up test row.');
}

testMeterLogs()
  .then(() => {
    console.log('>>> ALL DB METER LOG FLOW TESTS PASSED! <<<');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test error:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
