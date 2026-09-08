// test_routes_and_ssr.js
const http = require('http');

const routesToTest = [
  // Client Frontend Routes
  { path: 'http://localhost:3000/', expectStatus: 200, label: 'Homepage' },
  { path: 'http://localhost:3000/catalog', expectStatus: 200, label: 'Catalog Page' },
  { path: 'http://localhost:3000/catalog/komatsu-pc-200', expectStatus: 200, label: 'Catalog Item Slug' },
  { path: 'http://localhost:3000/admin', expectStatus: 200, label: 'Admin Command Overview (Module 1)' },
  { path: 'http://localhost:3000/admin/fleet', expectStatus: 200, label: 'Admin Fleet Management (Module 2)' },
  { path: 'http://localhost:3000/admin/inbox', expectStatus: 200, label: 'Admin Order Kanban (Module 3)' },
  { path: 'http://localhost:3000/admin/staff', expectStatus: 200, label: 'Admin Staff Management (Module 4)' },
  { path: 'http://localhost:3000/admin/logs', expectStatus: 200, label: 'Admin Daily Logs Ledger (Module 5)' },
  { path: 'http://localhost:3000/admin/ai-insights', expectStatus: 200, label: 'Admin AI Insights (Module 6)' },
  { path: 'http://localhost:3000/admin/financials', expectStatus: 200, label: 'Admin Financials & Fuel (Module 7)' },
  { path: 'http://localhost:3000/admin/utilization', expectStatus: 200, label: 'Admin Fleet Utilization (Module 8)' },
  { path: 'http://localhost:3000/admin/calendar', expectStatus: 200, label: 'Admin Master Calendar (Module 9)' },
  { path: 'http://localhost:3000/admin/crm', expectStatus: 200, label: 'Admin Client CRM (Module 10)' },
  { path: 'http://localhost:3000/admin/verification', expectStatus: 200, label: 'Admin Document Audit (Module 11)' },
  { path: 'http://localhost:3000/admin/settings', expectStatus: 200, label: 'Admin System Settings (Module 12)' },
  { path: 'http://localhost:3000/staff', expectStatus: 200, label: 'Staff Operator Log Portal' },
  { path: 'http://localhost:3000/dashboard/operator/log', expectStatus: 200, label: 'Operator Log Alias' },
  { path: 'http://localhost:3000/icon.svg', expectStatus: 200, label: 'Favicon SVG' },
  { path: 'http://localhost:3000/favicon.ico', expectStatus: 200, label: 'Favicon ICO' },

  // Express Backend Endpoints (Port 5000)
  { path: 'http://localhost:5000/api/v1/equipment', expectStatus: 200, label: 'API /equipment' },
  { path: 'http://localhost:5000/api/v1/inquiries', expectStatus: 200, label: 'API /inquiries' },
  { path: 'http://localhost:5000/api/v1/logs', expectStatus: 200, label: 'API /logs' },
  { path: 'http://localhost:5000/api/v1/analytics/overview', expectStatus: 200, label: 'API /analytics/overview' },
  { path: 'http://localhost:5000/api/v1/analytics/financials', expectStatus: 200, label: 'API /analytics/financials' },
  { path: 'http://localhost:5000/api/v1/analytics/crm', expectStatus: 200, label: 'API /analytics/crm' },
  { path: 'http://localhost:5000/api/v1/analytics/documents', expectStatus: 200, label: 'API /analytics/documents' },
  { path: 'http://localhost:5000/api/v1/analytics/ai-insights', expectStatus: 200, label: 'API /analytics/ai-insights' },
];

function testUrl(target) {
  return new Promise((resolve) => {
    http.get(target.path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const passed = res.statusCode === target.expectStatus;
        console.log(`${passed ? '✅' : '❌'} [${res.statusCode}] ${target.label} -> ${target.path}`);
        resolve({ target, passed, statusCode: res.statusCode, length: data.length });
      });
    }).on('error', (err) => {
      console.log(`❌ [ERR] ${target.label} -> ${err.message}`);
      resolve({ target, passed: false, error: err.message });
    });
  });
}

async function run() {
  console.log('=== RUNNING COMPREHENSIVE ROUTE & API VERIFICATION SUITE ===');
  let passedCount = 0;
  for (const r of routesToTest) {
    const res = await testUrl(r);
    if (res.passed) passedCount++;
  }
  console.log(`\nResults: ${passedCount} / ${routesToTest.length} Routes Verified OK!`);
  if (passedCount === routesToTest.length) {
    console.log('🎉 100% OF APPLICATION ROUTES AND API ENDPOINTS PASSING HEALTHILY.');
  }
}

run();
