import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data: users } = await supabase.from('profiles').select('id').limit(1);
  if (!users || users.length === 0) {
    console.log('No users found.');
    return;
  }
  const userId = users[0].id;
  const today = new Date().toISOString().split('T')[0];
  console.log('Testing insert for user:', userId, 'on', today);
  
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      employee_id: userId,
      date: today,
      check_in: '10:00',
      status: 'present',
      work_mode: 'office',
      breaks: [],
      total_break_hours: 0
    })
    .select();
    
  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
  }
}

testInsert();
