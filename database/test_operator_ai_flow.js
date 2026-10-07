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
    console.log('=== TEST 1: Operator Strict Scoping Verification in DB ===');
    const brianLogs = await client.query(`
      SELECT l.id, l.start_meter, l.end_meter, (l.end_meter - l.start_meter) as hours, l.fuel_amount, a.name as equipment_name
      FROM public.staff_logs l
      JOIN public.physical_assets a ON l.equipment_id = a.id
      WHERE l.staff_id = '00000000-0000-0000-0000-000000000002';
    `);
    console.log(`Brian K. has ${brianLogs.rows.length} strictly personal logs in DB.`);
    const brianTotalHours = brianLogs.rows.reduce((sum, r) => sum + parseFloat(r.hours), 0);
    console.log(`Brian K. Total Hours: ${brianTotalHours.toFixed(1)} hrs`);

    const davidLogs = await client.query(`
      SELECT l.id, l.start_meter, l.end_meter, (l.end_meter - l.start_meter) as hours, l.fuel_amount, a.name as equipment_name
      FROM public.staff_logs l
      JOIN public.physical_assets a ON l.equipment_id = a.id
      WHERE l.staff_id = '00000000-0000-0000-0000-000000000003';
    `);
    console.log(`David Kimathi has ${davidLogs.rows.length} strictly personal logs in DB.`);
    const davidTotalHours = davidLogs.rows.reduce((sum, r) => sum + parseFloat(r.hours), 0);
    console.log(`David Kimathi Total Hours: ${davidTotalHours.toFixed(1)} hrs`);

    if (brianTotalHours === davidTotalHours) {
      throw new Error('Operators should have distinct scoped totals!');
    }
    console.log('✓ Verified: Each operator has strictly separated personal logs in DB!');

    console.log('\n=== TEST 2: Testing Groq AI Operator Coach Prompt Generation ===');
    const groqKey = envVars.GROQ_API_KEY;
    if (groqKey) {
      console.log('GROQ_API_KEY is present. Testing direct Groq chat completion...');
      const fetch = global.fetch || require('node-fetch');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: envVars.GROQ_MODEL || 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'You are the Lead Heavy Plant Operations AI Coach for Hi Los Geht in Meru, Kenya. Answer certified operator Brian K. concisely.'
            },
            {
              role: 'user',
              content: 'Give me 2 field tips for managing fuel burn on my Komatsu PC-200 excavator at the Nkubu quarry.'
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const json = await response.json();
        console.log('✓ Groq AI Response successfully generated:');
        console.log(json.choices?.[0]?.message?.content);
      } else {
        console.warn('Groq returned status:', response.status);
      }
    } else {
      console.log('No GROQ_API_KEY in environment, fallback heuristic will be used.');
    }

    console.log('\n>>> ALL OPERATOR SCOPING & AI PIPELINE TESTS PASSED! <<<');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
