const { Pool } = require('pg');
const pool = new Pool({ host: '127.0.0.1', port: 5433, user: 'postgres', password: 'HiLosGeht123', database: 'postgres' });

async function check() {
  const assets = await pool.query('SELECT id, name, category, model, telemetry_api_id, current_hour_meter FROM public.physical_assets');
  console.log('Physical Assets count:', assets.rows.length);
  console.table(assets.rows);

  const logs = await pool.query('SELECT COUNT(*) FROM public.staff_logs');
  console.log('Current staff_logs count:', logs.rows[0].count);

  await pool.end();
}

check().catch(e => { console.error(e); pool.end(); });
