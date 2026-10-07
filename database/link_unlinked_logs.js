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
    // 1. Link any unlinked logs to Brian K. (Lead Operator)
    const updateRes = await client.query(`
      UPDATE public.staff_logs
      SET staff_id = '00000000-0000-0000-0000-000000000002'
      WHERE staff_id IS NULL;
    `);
    console.log(`Updated ${updateRes.rowCount} unlinked logs to belong to Brian K.`);

    // 2. Also ensure we have a second operator in public.profiles: David Kimathi (Backhoe Operator)
    await client.query(`
      INSERT INTO public.profiles (
        id, full_name, email, role, phone_number, account_status
      ) VALUES (
        '00000000-0000-0000-0000-000000000003',
        'David Kimathi (Backhoe Operator)',
        'david.kimathi@hilosgeht.co.ke',
        'OPERATOR',
        '+254712345678',
        'ACTIVE'
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = 'OPERATOR';
    `);
    console.log('Ensured David Kimathi operator profile exists in DB.');

    // 3. Add a log for David Kimathi on the JCB Backhoe Loader
    const jcbAsset = await client.query(`
      SELECT id FROM public.physical_assets WHERE name ILIKE '%JCB%' LIMIT 1;
    `);
    if (jcbAsset.rows.length > 0) {
      const jcbId = jcbAsset.rows[0].id;
      await client.query(`
        INSERT INTO public.staff_logs (
          staff_id,
          equipment_id,
          start_meter,
          end_meter,
          work_description,
          fuel_amount,
          fuel_proof_image,
          start_meter_proof_image,
          end_meter_proof_image,
          meter_proof_image,
          verification_status,
          date_submitted
        ) VALUES (
          '00000000-0000-0000-0000-000000000003',
          $1,
          210.0,
          215.5,
          'Culvert excavation and drainage trenching at Makutano Junction',
          28.5,
          'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/fuel-david.jpg',
          'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/meter-start-jcb.jpg',
          'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/meter-end-jcb.jpg',
          'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/meter-end-jcb.jpg',
          'APPROVED',
          NOW() - INTERVAL '2 days'
        )
        ON CONFLICT DO NOTHING;
      `, [jcbId]);
      console.log('Ensured David Kimathi has distinct backhoe logs in DB.');
    }

    // Check all logs grouped by operator
    const summaryRes = await client.query(`
      SELECT 
        COALESCE(p.full_name, 'Unlinked') as operator_name,
        count(l.id) as log_count,
        SUM(l.end_meter - l.start_meter) as total_hours,
        SUM(l.fuel_amount) as total_fuel
      FROM public.staff_logs l
      LEFT JOIN public.profiles p ON l.staff_id = p.id
      GROUP BY p.full_name;
    `);
    console.table(summaryRes.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
