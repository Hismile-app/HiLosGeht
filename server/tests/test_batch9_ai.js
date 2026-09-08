const { generateOperationalAIInsights } = require('../dist/services/ai');
const db = require('../dist/config/db').default;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') });
require('dotenv').config();

async function testBatch9AI() {
  console.log('====================================================');
  console.log('🧪 BATCH 9 TEST: AI Log Summaries & Anomaly Alerts');
  console.log('====================================================');

  const results = {
    timestamp: new Date().toISOString(),
    batch: 9,
    tests: []
  };

  try {
    // 1. Get equipment IDs for Isuzu and Komatsu
    const isuzuRes = await db.query("SELECT id, name FROM public.physical_assets WHERE model LIKE '%FVZ 34%' LIMIT 1;");
    const komatsuRes = await db.query("SELECT id, name FROM public.physical_assets WHERE model LIKE '%PC-200%' LIMIT 1;");

    const isuzuId = isuzuRes.rows[0].id;
    const komatsuId = komatsuRes.rows[0].id;

    console.log('\n[SETUP] Seeding mock anomalous daily logs into public.staff_logs...');
    // Seed Anomaly 1: Isuzu FVZ 34 consuming 150L for 2.0 hrs (75 L/hr)
    await db.query(`
      INSERT INTO public.staff_logs (
        equipment_id,
        start_meter,
        end_meter,
        work_description,
        fuel_amount,
        date_submitted
      ) VALUES (
        $1, 512.8, 514.8, 'Hauled 2 loads of earth at Meru Town ring road', 150.00, NOW()
      );
    `, [isuzuId]);

    // Seed Anomaly 2: Komatsu PC-200 with 40L fuel but only 0.2 hrs
    await db.query(`
      INSERT INTO public.staff_logs (
        equipment_id,
        start_meter,
        end_meter,
        work_description,
        fuel_amount,
        date_submitted
      ) VALUES (
        $1, 348.5, 348.7, 'Pre-inspection idling at quarry yard', 40.00, NOW()
      );
    `, [komatsuId]);

    console.log('✅ Anomalous mock logs inserted.');

    // 2. Execute AI Analysis
    console.log('\n[TEST 1] Running AI Operational Insights & Anomaly Detection Algorithm...');
    const insights = await generateOperationalAIInsights(7);

    console.log('\n--- 🤖 AI Executive Summary ---');
    console.log(insights.weeklySummary);
    console.log(`\nMetrics: Total Hours: ${insights.totalHoursWorked}h | Fuel: ${insights.totalFuelLiters}L | Trips: ${insights.totalTripsLogged} | Cost/Hr: KES ${insights.costPerHourAverageKES}`);

    console.log(`\n--- 🚨 Detected Anomalies (${insights.anomalies.length}) ---`);
    insights.anomalies.forEach((a, idx) => {
      console.log(`[Anomaly ${idx + 1}] [${a.severity}] ${a.machine}: ${a.issue}`);
      console.log(`  👉 Action: ${a.recommendation}`);
    });

    // 3. Assertions
    const isuzuFlagged = insights.anomalies.find(a => a.machine.includes('Isuzu') || a.issue.includes('150'));
    if (!isuzuFlagged) {
      throw new Error('Expected Isuzu FVZ 34 fuel anomaly (150L / 2.0 hrs) to be detected!');
    }
    console.log('✅ TEST 1 PASSED: Isuzu FVZ 34 (150L / 2.0 hrs) successfully flagged.');

    const komatsuFlagged = insights.anomalies.find(a => a.machine.includes('Komatsu') || a.issue.includes('40'));
    if (!komatsuFlagged) {
      throw new Error('Expected Komatsu PC-200 zero-hour fuel anomaly to be detected!');
    }
    console.log('✅ TEST 2 PASSED: Komatsu PC-200 (40L / 0.2 hrs) zero-work fuel anomaly flagged.');

    results.tests.push({
      name: 'AI Weekly Operational Summary Generation',
      status: 'PASSED',
      weeklySummary: insights.weeklySummary
    });
    results.tests.push({
      name: 'High Fuel Consumption Anomaly Detection',
      status: 'PASSED',
      flaggedMachine: isuzuFlagged.machine,
      severity: isuzuFlagged.severity
    });
    results.tests.push({
      name: 'Zero-Work Fuel Anomaly Detection',
      status: 'PASSED',
      flaggedMachine: komatsuFlagged.machine,
      severity: komatsuFlagged.severity
    });

    // 4. Export Artifacts
    const artifactsDir = path.join(__dirname, '..', '..', 'artifacts');
    if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

    fs.writeFileSync(
      path.join(artifactsDir, 'batch9_test_output.json'),
      JSON.stringify({ ...results, insights }, null, 2)
    );

    const reportMd = `# Batch 9 Verification Report: AI Log Summaries & Anomaly Alerts

**Date**: ${new Date().toISOString()}  
**Status**: 🟢 ALL TESTS PASSED  

## Executive Summary
${insights.weeklySummary}

## Operational Metrics
- **Total Operational Hours**: ${insights.totalHoursWorked} hrs
- **Total Fuel Consumed**: ${insights.totalFuelLiters} Litres
- **Average Fuel Cost**: KES ${insights.costPerHourAverageKES} / hr
- **Total Trips Recorded**: ${insights.totalTripsLogged}

## Flagged Anomalies
${insights.anomalies.map(a => `### 🚨 [${a.severity}] ${a.machine}
- **Issue**: ${a.issue}
- **Recommendation**: ${a.recommendation}
`).join('\n')}
`;
    fs.writeFileSync(path.join(artifactsDir, 'batch9_report.md'), reportMd);
    console.log('\n📊 Test artifacts exported to ./artifacts/batch9_test_output.json and ./artifacts/batch9_report.md');
    console.log('\n🎉 BATCH 9 AI ANOMALY TEST PASSED!\n');

  } catch (err) {
    console.error('❌ Batch 9 Test Failed:', err);
    process.exit(1);
  }
}

testBatch9AI();
