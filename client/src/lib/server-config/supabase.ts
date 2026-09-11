import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL || 'https://vvxllppyslizpnqeluik.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eGxscHB5c2xpenBucWVsdWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg2OTk0MCwiZXhwIjoyMTA0NDQ1OTQwfQ.e9QxdEKsXJKPhJk6adWDiyDT37FDiz70smProTo5WCE';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eGxscHB5c2xpenBucWVsdWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4Njk5NDAsImV4cCI6MjEwNDQ0NTk0MH0.S6thXSkUkoIVDpMY5Qqo7aUFdCYivGE1-f1NqRg41gA';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseAdmin;
