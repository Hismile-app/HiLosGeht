const { processAEMPTelemetry } = require('../dist/services/telemetryService');
const db = require('../dist/config/db').default;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') });
require('dotenv').config();

async function testBatch10Telemetry() {
  console.log('====================================================');
  console.log('🧪 BATCH 10 TEST: ISO 15143-3 Telematics & DB Trigger');
  console.log('====================================================');

  const results = {
    timestamp: new Date().toISOString(),
    batch: 10,
    tests: []
  };

  try {
    // 1. Get Komatsu PC-200 and reset to 342.5 hrs for clean trigger testing
    const komatsuRes = await db.query("SELECT id, name, current_hour_meter, telemetry_api_id FROM public.physical_assets WHERE model LIKE '%PC-200%' LIMIT 1;");
    const komatsu = komatsuRes.rows[0];
    console.log(`Found asset: ${komatsu.name} [ID: ${komatsu.id}, Initial DB Meter: ${komatsu.current_hour_meter}]`);

    // Reset state before firing telematics payload
    await db.query("UPDATE public.physical_assets SET current_hour_meter = 342.5 WHERE id = $1;", [komatsu.id]);
    await db.query("DELETE FROM public.staff_tasks WHERE equipment_id = $1;", [komatsu.id]);
    await db.query("UPDATE public.maintenance_triggers SET last_triggered_at = NULL WHERE equipment_id = $1;", [komatsu.id]);

    // 2. Prepare ISO 15143-3 (AEMP 2.0) Telemetry Payload crossing 500.0h limit (501.0 hrs)
    const aempPayload = {
      version: '2.0',
      Equipment: {
        EquipmentHeader: {
          Make: 'Komatsu',
          Model: 'PC-200',
          EquipmentSerialNumber: komatsu.telemetry_api_id || 'KOM-PC200-KE-001',
          PIN: 'KOM-PC200-KE-001',
          AssetId: komatsu.id
        },
        CumulativeOperatingHours: {
          Hour: 501.0,
          Datetime: new Date().toISOString()
        },
        FuelRemaining: {
          Percent: 78.5,
          Datetime: new Date().toISOString()
        },
        Location: {
          Latitude: 0.0463, // Meru Coordinates
          Longitude: 37.6559,
          Altitude: 1530.0,
          Datetime: new Date().toISOString()
        },
        DiagnosticTroubleCodes: []
      }
    };

    console.log('\n[TEST 1] Ingesting ISO 15143-3 (AEMP 2.0) Telematics payload with 501.0 engine hours...');
    const teleResult = await processAEMPTelemetry(aempPayload);

    console.log('Telematics Ingestion Result:', {
      equipment: teleResult.equipmentName,
      previousHours: teleResult.previousHours,
      updatedHours: teleResult.updatedHours,
      tasksGenerated: teleResult.maintenanceTasksTriggered.length
    });

    // 3. Verify Database State
    const updatedAssetRes = await db.query("SELECT current_hour_meter FROM public.physical_assets WHERE id = $1;", [komatsu.id]);
    const updatedMeter = parseFloat(updatedAssetRes.rows[0].current_hour_meter);

    if (updatedMeter !== 501.0) {
      throw new Error(`Expected current_hour_meter to be 501.0, got: ${updatedMeter}`);
    }
    console.log('✅ TEST 1 PASSED: Asset hour meter updated to 501.0 hrs.');
    results.tests.push({ name: 'Telematics Hour Meter Update', status: 'PASSED', newHours: updatedMeter });

    // 4. Verify PostgreSQL Database Trigger trg_evaluate_maintenance_limits
    console.log('\n[TEST 2] Verifying automatic creation of Preventive Maintenance Task in public.staff_tasks...');
    const tasksRes = await db.query(`
      SELECT * FROM public.staff_tasks 
      WHERE equipment_id = $1 AND task_type = 'PREVENTIVE_MAINTENANCE'
      ORDER BY created_at DESC;
    `, [komatsu.id]);

    if (tasksRes.rows.length === 0) {
      throw new Error('Preventive Maintenance DB Trigger failed to create task in public.staff_tasks!');
    }

    const task = tasksRes.rows[0];
    console.log('Generated Maintenance Task in Database:');
    console.log(`  - Task ID: ${task.id}`);
    console.log(`  - Type: ${task.task_type}`);
    console.log(`  - Priority: ${task.priority}`);
    console.log(`  - Description: ${task.description}`);

    if (task.priority !== 'HIGH') {
      throw new Error(`Expected task priority to be 'HIGH', got: ${task.priority}`);
    }

    console.log('✅ TEST 2 PASSED: PostgreSQL trigger automatically created HIGH-priority Preventive Maintenance task.');
    results.tests.push({
      name: 'Automated Preventive Maintenance DB Trigger',
      status: 'PASSED',
      taskId: task.id,
      priority: task.priority,
      description: task.description
    });

    // 5. Export Artifacts
    const artifactsDir = path.join(__dirname, '..', '..', 'artifacts');
    if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

    fs.writeFileSync(
      path.join(artifactsDir, 'batch10_test_output.json'),
      JSON.stringify({ ...results, payload: aempPayload, generatedTask: task }, null, 2)
    );

    const reportMd = `# Batch 10 Verification Report: ISO 15143-3 Telematics & Maintenance Triggers

**Date**: ${new Date().toISOString()}  
**Status**: 🟢 ALL TESTS PASSED  

## Telematics Payload (ISO 15143-3 / AEMP 2.0)
- **Make / Model**: \`Komatsu PC-200\`
- **Serial Number**: \`${komatsu.telemetry_api_id || 'KOM-PC200-KE-001'}\`
- **Updated Operating Hours**: \`501.0 hrs\`
- **GPS Coordinates**: \`0.0463° N, 37.6559° E\` (Meru, Kenya)

## Database Trigger Execution
- **Trigger**: \`trg_evaluate_maintenance_limits\` on \`public.physical_assets\`
- **Task ID**: \`${task.id}\`
- **Task Type**: \`${task.task_type}\`
- **Priority**: \`${task.priority}\`
- **Generated Description**: \`${task.description}\`
`;
    fs.writeFileSync(path.join(artifactsDir, 'batch10_report.md'), reportMd);
    console.log('\n📊 Test artifacts exported to ./artifacts/batch10_test_output.json and ./artifacts/batch10_report.md');
    console.log('\n🎉 BATCH 10 TELEMATICS & TRIGGER TEST PASSED!\n');

  } catch (err) {
    console.error('❌ Batch 10 Test Failed:', err);
    process.exit(1);
  }
}

testBatch10Telemetry();
