const { Pool } = require('pg');
const pool = new Pool({ host: '127.0.0.1', port: 5433, user: 'postgres', password: 'HiLosGeht123', database: 'postgres' });

async function check() {
  const enums = await pool.query("SELECT enumlabel, enumtypid::regtype AS type FROM pg_enum;");
  console.log('Enums:');
  console.table(enums.rows);
  await pool.end();
}

check().catch(e => { console.error(e); pool.end(); });
