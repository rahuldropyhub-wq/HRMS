import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function audit() {
  console.log("Testing attendance table schema...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log("Profile Columns:", data[0] ? Object.keys(data[0]) : "Empty");
  }
}

audit();
