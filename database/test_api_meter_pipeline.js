const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from client/.env.local
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

async function runTest() {
  const client = await pool.connect();
  let createdLogId = null;

  try {
    console.log('=== TEST 1: Equipment Discovery ===');
    const assetRes = await client.query('SELECT id, name, current_hour_meter FROM public.physical_assets LIMIT 1;');
    if (assetRes.rows.length === 0) {
      throw new Error('No equipment assets found in public.physical_assets');
    }
    const asset = assetRes.rows[0];
    console.log(`Found active machine: "${asset.name}" (ID: ${asset.id}), current meter: ${asset.current_hour_meter}`);

    console.log('\n=== TEST 2: Operator Log Submission with Meter Proof Images ===');
    const initialMeter = parseFloat(asset.current_hour_meter || '100');
    const startMeter = initialMeter;
    const endMeter = initialMeter + 4.5;
    const startMeterProof = 'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/test-start-gauge-6500hrs.jpg';
    const endMeterProof = 'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/test-end-gauge-6504.5hrs.jpg';

    const insertSql = `
      INSERT INTO public.staff_logs (
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', NOW())
      RETURNING *;
    `;
    const insertRes = await client.query(insertSql, [
      asset.id,
      startMeter,
      endMeter,
      'Automated terminal test: Excavation and grading with meter proof verification',
      35.0,
      'https://ztkxbo3sajazo5zi.private.blob.vercel-storage.com/proofs/test-fuel-receipt.jpg',
      startMeterProof,
      endMeterProof,
      endMeterProof,
    ]);

    const created = insertRes.rows[0];
    createdLogId = created.id;
    console.log(`✓ Inserted log successfully! ID: ${created.id}`);
    console.log(`  start_meter_proof_image: ${created.start_meter_proof_image}`);
    console.log(`  end_meter_proof_image:   ${created.end_meter_proof_image}`);
    console.log(`  meter_proof_image:       ${created.meter_proof_image}`);

    console.log('\n=== TEST 3: Controller SQL for getAllStaffLogs Querying ===');
    const logsSql = `
      SELECT 
        l.id,
        l.start_meter,
        l.end_meter,
        (l.end_meter - l.start_meter) as hours_worked,
        l.start_meter_proof_image,
        l.end_meter_proof_image,
        l.meter_proof_image,
        l.verification_status,
        COALESCE(a.name, 'Equipment') as equipment_name
      FROM public.staff_logs l
      LEFT JOIN public.physical_assets a ON l.equipment_id = a.id
      WHERE l.id = $1;
    `;
    const logsRes = await client.query(logsSql, [createdLogId]);
    console.log('Query result:');
    console.table(logsRes.rows);

    if (
      logsRes.rows[0].start_meter_proof_image !== startMeterProof ||
      logsRes.rows[0].end_meter_proof_image !== endMeterProof ||
      logsRes.rows[0].meter_proof_image !== endMeterProof
    ) {
      throw new Error('Meter proof image URLs do not match expected values in getAllStaffLogs query');
    }
    console.log('✓ getAllStaffLogs query returned exact image URLs and hour calculations!');

    console.log('\n=== TEST 4: Document Verification Audit Gallery Querying ===');
    const gallerySql = `
      SELECT 
        l.id as log_id,
        l.date_submitted,
        l.start_meter,
        l.end_meter,
        l.fuel_amount,
        l.fuel_proof_image,
        l.materials_received,
        l.materials_proof_image,
        l.start_meter_proof_image,
        l.end_meter_proof_image,
        l.meter_proof_image,
        COALESCE(p.full_name, 'Operator') as operator_name,
        COALESCE(a.name, 'Equipment') as machine_name,
        COALESCE(a.model, 'Asset') as machine_model
      FROM public.staff_logs l
      LEFT JOIN public.profiles p ON l.staff_id = p.id
      LEFT JOIN public.physical_assets a ON l.equipment_id = a.id
      WHERE l.id = $1 AND (
        l.fuel_proof_image IS NOT NULL 
        OR l.materials_proof_image IS NOT NULL 
        OR l.meter_proof_image IS NOT NULL
        OR l.start_meter_proof_image IS NOT NULL
        OR l.end_meter_proof_image IS NOT NULL
      );
    `;
    const galleryRes = await client.query(gallerySql, [createdLogId]);
    console.log('Gallery query result:');
    console.table(galleryRes.rows);

    if (galleryRes.rows.length === 0) {
      throw new Error('Document verification gallery query failed to fetch record with meter proof');
    }
    console.log('✓ Document verification audit gallery successfully identified meter photos!');

    console.log('\n=== TEST 5: Admin Verification Update Approval ===');
    const updateRes = await client.query(`
      UPDATE public.staff_logs
      SET verification_status = 'APPROVED', audit_notes = 'Verified against gauge photo in terminal test'
      WHERE id = $1
      RETURNING id, verification_status, audit_notes;
    `, [createdLogId]);
    console.log('Update result:', updateRes.rows[0]);
    if (updateRes.rows[0].verification_status !== 'APPROVED') {
      throw new Error('Failed to update verification status to APPROVED');
    }
    console.log('✓ Verification update to APPROVED successful!');

  } finally {
    if (createdLogId) {
      console.log('\n=== TEST 6: Teardown & Clean Test Artifacts ===');
      await client.query('DELETE FROM public.staff_logs WHERE id = $1;', [createdLogId]);
      console.log(`✓ Cleaned up test record ${createdLogId}`);
    }
    client.release();
    await pool.end();
  }

  console.log('\n=========================================');
  console.log('>>> ALL 5 TERMINAL PIPELINE TESTS PASSED <<<');
  console.log('=========================================');
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
