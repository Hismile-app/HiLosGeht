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

async function inspect() {
  const token = envVars.BLOB_READ_WRITE_TOKEN;
  const listRes = await list({ token });
  const blobInfo = listRes.blobs.find(b => b.pathname === 'system/staff_logs.json');
  if (!blobInfo) {
    console.log('No system/staff_logs.json found in blob');
    return;
  }
  const res = await fetch(blobInfo.url, { headers: { Authorization: `Bearer ${token}` } });
  const logs = await res.json();
  console.log('Total logs in Blob:', logs.length);
  logs.forEach((l, idx) => {
    console.log(`[${idx}] id=${l.id} | staff_id=${l.staff_id} | staff_name=${l.staff_name} | operator_name=${l.operator_name} | email=${l.staff_email || l.operator_email} | status=${l.verification_status} | desc=${l.work_description || l.yield_description}`);
  });
}

inspect().catch(console.error);
