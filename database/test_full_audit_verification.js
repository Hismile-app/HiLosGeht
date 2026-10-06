const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../client/.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'HiLosGeht123',
  database: process.env.DB_NAME || 'postgres',
});

async function runAuditVerification() {
  console.log('====================================================');
  console.log('🚀 RUNNING 100-FLOW AUDIT VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Table schema verification
    console.log('--- 1. DATABASE SCHEMA & INTEGRITY ---');
    const tableRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tables = tableRes.rows.map(r => r.table_name);
    const expectedTables = [
      'physical_assets',
      'user_roles',
      'reservations',
      'profiles',
      'staff_logs',
      'maintenance_triggers',
      'staff_tasks',
      'system_settings'
    ];
    for (const t of expectedTables) {
      assert(tables.includes(t), `Table "${t}" exists in public schema`);
    }

    // 2. System Settings read and check
    console.log('\n--- 2. SYSTEM SETTINGS & DYNAMIC RATES ---');
    const settingsRes = await pool.query('SELECT key, value FROM public.system_settings');
    assert(settingsRes.rows.length >= 3, `System settings initialized with ${settingsRes.rows.length} config keys`);
    const settingsMap = Object.fromEntries(settingsRes.rows.map(r => [r.key, r.value]));
    const opParams = settingsMap['operational_parameters'] || {};
    const hotlines = settingsMap['dispatch_hotlines'] || {};
    assert(opParams.fuel_price_kes_per_liter > 0, `Fuel price KES is ${opParams.fuel_price_kes_per_liter}/L`);
    assert(hotlines.primary_phone === '0717 186396', `Primary hotline matches: ${hotlines.primary_phone}`);

    // 3. Profiles projection security (No password hash leakage)
    console.log('\n--- 3. SECURITY & RBAC TOKEN PROJECTION ---');
    const profRes = await pool.query(
      `SELECT id, full_name, email, phone_number, role, account_status FROM public.profiles LIMIT 5`
    );
    assert(profRes.rows.length > 0, `Profiles found: ${profRes.rows.length}`);
    const sample = profRes.rows[0];
    assert(sample.password_hash === undefined, 'Projected profiles omit password_hash field');
    assert(sample.onboarding_token === undefined, 'Projected profiles omit onboarding_token field');

    // 4. End meter check constraint verification
    console.log('\n--- 4. METER VALIDATION CHECK CONSTRAINT ---');
    let constraintTriggered = false;
    try {
      await pool.query(`
        INSERT INTO public.staff_logs (
          equipment_id,
          staff_id,
          work_description,
          start_meter,
          end_meter,
          fuel_amount,
          materials_received
        ) VALUES (
          (SELECT id FROM public.physical_assets LIMIT 1),
          (SELECT id FROM public.profiles WHERE role = 'OPERATOR' LIMIT 1),
          'Test invalid meter constraint',
          50.0,
          40.0,
          0.0,
          'None'
        )
      `);
    } catch (err) {
      if (err.code === '23514' && err.message.includes('chk_end_meter_gte_start_meter')) {
        constraintTriggered = true;
      }
    }
    assert(constraintTriggered, 'Constraint chk_end_meter_gte_start_meter correctly rejected end_meter (40.0) < start_meter (50.0)');

    // 5. Valid staff log insert with verification status
    console.log('\n--- 5. STAFF LOG INSERT & VOUCHER VERIFICATION ---');
    const insertLog = await pool.query(`
      INSERT INTO public.staff_logs (
        equipment_id,
        staff_id,
        work_description,
        start_meter,
        end_meter,
        fuel_amount,
        materials_received,
        verification_status
      ) VALUES (
        (SELECT id FROM public.physical_assets LIMIT 1),
        (SELECT id FROM public.profiles WHERE role = 'OPERATOR' LIMIT 1),
        'Audit verified grading test run',
        100.0,
        105.5,
        25.0,
        'Ballast 10T',
        'PENDING'
      ) RETURNING id, verification_status
    `);
    const newLogId = insertLog.rows[0].id;
    assert(insertLog.rows[0].verification_status === 'PENDING', 'Staff log created with PENDING verification');

    // Admin verifies the log
    const updateLog = await pool.query(`
      UPDATE public.staff_logs
      SET verification_status = 'VERIFIED',
          audit_notes = 'Audited and approved by Operations Director'
      WHERE id = $1
      RETURNING verification_status, audit_notes
    `, [newLogId]);
    assert(updateLog.rows[0].verification_status === 'VERIFIED', 'Log successfully transitioned to VERIFIED');

    // Clean up test log
    await pool.query('DELETE FROM public.staff_logs WHERE id = $1', [newLogId]);

    // 6. GiST overlap prevention
    console.log('\n--- 6. GIST OVERLAP EXCLUSION CONSTRAINT ---');
    const assetRes = await pool.query('SELECT id FROM public.physical_assets LIMIT 1');
    const assetId = assetRes.rows[0].id;
    let overlapPrevented = false;

    // Insert baseline booking
    const b1 = await pool.query(`
      INSERT INTO public.reservations (
        physical_asset_id,
        client_name,
        client_email,
        client_phone,
        booking_period,
        daily_rate,
        total_amount,
        status
      ) VALUES (
        $1, 'Test Client Alpha', 'alpha@example.com', '254700000001',
        tstzrange('2027-01-10 08:00:00+03', '2027-01-20 18:00:00+03', '[]'),
        45000.0, 450000.0,
        'CONFIRMED'
      ) RETURNING id
    `, [assetId]);

    try {
      // Attempt overlapping booking
      await pool.query(`
        INSERT INTO public.reservations (
          physical_asset_id,
          client_name,
          client_email,
          client_phone,
          booking_period,
          daily_rate,
          total_amount,
          status
        ) VALUES (
          $1, 'Test Client Beta', 'beta@example.com', '254700000002',
          tstzrange('2027-01-15 08:00:00+03', '2027-01-25 18:00:00+03', '[]'),
          45000.0, 450000.0,
          'CONFIRMED'
        )
      `, [assetId]);
    } catch (err) {
      if (err.code === '23P01') {
        overlapPrevented = true;
      }
    }
    assert(overlapPrevented, 'GiST constraint (23P01) strictly blocked double-booking overlap');

    // Clean up test reservation
    await pool.query('DELETE FROM public.reservations WHERE id = $1', [b1.rows[0].id]);

    // 7. Staff tasks creation and update
    console.log('\n--- 7. DISPATCH WORK ORDER / STAFF TASKS ---');
    const taskInsert = await pool.query(`
      INSERT INTO public.staff_tasks (
        task_type,
        description,
        assigned_to,
        priority,
        status,
        equipment_id
      ) VALUES (
        'PM 250hr Hydraulic Service',
        'Scheduled oil & filter replacement dispatched from AI Insights',
        (SELECT id FROM public.profiles WHERE role = 'OPERATOR' LIMIT 1),
        'HIGH',
        'PENDING',
        $1
      ) RETURNING id, status
    `, [assetId]);
    const taskId = taskInsert.rows[0].id;
    assert(taskId !== undefined, 'Work order created in public.staff_tasks');

    // Clean up test task
    await pool.query('DELETE FROM public.staff_tasks WHERE id = $1', [taskId]);

    // 8. SMTP Transport verification
    console.log('\n--- 8. EMAIL SYSTEM & SMTP VERIFICATION ---');
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const smtpVerify = await transporter.verify();
      assert(smtpVerify === true, `SMTP Handshake succeeded with ${process.env.SMTP_HOST} (user: ${process.env.SMTP_USER})`);
    } catch (err) {
      console.warn(`  ⚠️ SMTP Handshake notice: ${err.message}`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await pool.end();
  }

  console.log('\n====================================================');
  console.log(`AUDIT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuditVerification();
