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

async function checkBlob() {
  try {
    const result = await list();
    for (const b of result.blobs) {
      if (b.pathname === 'system/staff_registry.json' || b.pathname === 'system/staff_logs.json') {
        const res = await fetch(b.url, {
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
        });
        const text = await res.text();
        console.log(`\n=== Content of ${b.pathname} ===`);
        console.log(text);
      }
    }
  } catch (err) {
    console.error('Blob error:', err);
  }
}

checkBlob();
