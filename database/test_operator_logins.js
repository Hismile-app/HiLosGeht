const { Pool } = require('pg');
const crypto = require('crypto');
const pool = new Pool({ host: '127.0.0.1', port: 5433, user: 'postgres', password: 'HiLosGeht123', database: 'postgres' });

async function test() {
  const users = [
    { phone: '0728803790', pass: '0728803790', name: 'Joseph Mbogo' },
    { phone: '0717186396', pass: '0717186396', name: 'Fredrick Mutuma' },
    { phone: '0729139178', pass: '0729139178', name: 'Felix Maore' },
    { phone: '0788183496', pass: '0788183496', name: 'kb 1445' }
  ];

  for (const u of users) {
    const hash = crypto.createHash('sha256').update(u.pass).digest('hex');
    const res = await pool.query('SELECT id, full_name, phone_number, role FROM public.profiles WHERE phone_number = $1 AND password_hash = $2', [u.phone, hash]);
    console.log(u.name, '=> Login matched:', res.rows.length === 1 ? 'SUCCESS' : 'FAILED', res.rows[0]);
  }
  await pool.end();
}
test();
