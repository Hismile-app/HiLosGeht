const { Pool } = require('pg');
const { list } = require('@vercel/blob');
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

async function testOperatorResolution() {
  const client = await pool.connect();
  try {
    console.log('=== TEST 1: Checking Operator Profiles in DB & Blob ===');
    const dbProfs = await client.query(`SELECT id, full_name, email, role FROM public.profiles WHERE role = 'OPERATOR';`);
    console.log('DB Operators:', dbProfs.rows.map(r => `${r.full_name} (${r.email})`));

    // Test operator queries for each user
    const testCases = [
      { name: 'kb 1445 testor operator', email: 'kbrian1445@gmail.com', expectedLogs: 0 },
      { name: 'Brian K.', email: 'kbrian1237@gmail.com', expectedLogs: 6 },
      { name: 'David Kimathi', email: 'david.kimathi@hilosgeht.co.ke', expectedLogs: 1 },
    ];

    for (const tc of testCases) {
      console.log(`\nTesting operator: ${tc.name} (${tc.email})`);
      const profRes = await client.query(`SELECT id, full_name, email FROM public.profiles WHERE LOWER(email) = LOWER($1);`, [tc.email]);
      if (profRes.rows.length === 0) {
        console.error(`FAILED: Profile not found for ${tc.email}`);
        process.exit(1);
      }
      const prof = profRes.rows[0];

      // Query logs strictly for this operator
      const logsRes = await client.query(`
        SELECT l.id, l.start_meter, l.end_meter, (l.end_meter - l.start_meter) as hours, l.fuel_amount
        FROM public.staff_logs l
        LEFT JOIN public.profiles p ON l.staff_id = p.id
        WHERE (l.staff_id::text = $1 OR (p.email IS NOT NULL AND LOWER(p.email) = $2));
      `, [prof.id, prof.email.toLowerCase()]);

      console.log(`-> Returned ${logsRes.rows.length} logs (Expected: ${tc.expectedLogs})`);
      if (logsRes.rows.length !== tc.expectedLogs) {
        console.error(`FAILED: Expected ${tc.expectedLogs} logs for ${tc.name}, but got ${logsRes.rows.length}!`);
        process.exit(1);
      }
    }

    console.log('\n✅ ALL OPERATOR IDENTITY SCOPING TESTS PASSED 100%!');
  } finally {
    client.release();
    await pool.end();
  }
}

testOperatorResolution().catch(err => {
  console.error(err);
  process.exit(1);
});
