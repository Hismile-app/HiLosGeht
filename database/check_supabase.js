const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: require('path').join(__dirname, '../client/.env.local') });
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvxllppyslizpnqeluik.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabase() {
  console.log('Testing Supabase connection to:', supabaseUrl);
  
  const tables = ['physical_assets', 'profiles', 'reservations', 'staff_logs', 'staff_tasks', 'system_settings'];
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(3);
      if (error) {
        console.log(`❌ Table [${table}]:`, error.message, error.code);
      } else {
        console.log(`✅ Table [${table}]: Total count = ${count || data.length}, Sample rows = ${data.length}`);
        if (data.length > 0) {
          console.log(`   Sample keys:`, Object.keys(data[0]).join(', '));
        }
      }
    } catch (e) {
      console.log(`⚠️ Exception on table [${table}]:`, e.message);
    }
  }
}

testSupabase();
