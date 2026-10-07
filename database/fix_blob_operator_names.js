const { list, put } = require('@vercel/blob');
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

async function fixBlobLogs() {
  const token = envVars.BLOB_READ_WRITE_TOKEN;
  const listRes = await list({ token });
  const blobInfo = listRes.blobs.find(b => b.pathname === 'system/staff_logs.json');
  if (!blobInfo) {
    console.error('system/staff_logs.json not found in Blob!');
    return;
  }

  const res = await fetch(blobInfo.url, { headers: { Authorization: `Bearer ${token}` } });
  const logs = await res.json();
  console.log(`Read ${logs.length} logs from Blob.`);

  for (const log of logs) {
    if (log.id === 'log-muwwxgac' && (!log.staff_name || log.staff_name === 'Lead Operator')) {
      log.staff_id = '00000000-0000-0000-0000-000000000002';
      log.staff_name = 'Brian K. (Lead Operator)';
      log.staff_email = 'kbrian1237@gmail.com';
    }

    const name = log.operator_name || log.staff_name || 'Certified Operator';
    const email = log.operator_email || log.staff_email || 'operator@hilosgeht.co.ke';

    log.operator_name = name;
    log.staff_name = name;
    log.operator_email = email;
    log.staff_email = email;
    if (!log.verification_status) log.verification_status = 'PENDING';
  }

  await put('system/staff_logs.json', JSON.stringify(logs, null, 2), {
    access: 'private',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log('Successfully normalized operator names & emails in Vercel Blob system/staff_logs.json:');
  logs.forEach(l => {
    console.log(`- ${l.id}: ${l.operator_name} (${l.operator_email}) [${l.verification_status}]`);
  });
}

fixBlobLogs().catch(console.error);
