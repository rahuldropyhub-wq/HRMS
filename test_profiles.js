import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
let url = '';
let key = '';
lines.forEach(l => {
  if (l.startsWith('VITE_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('VITE_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
});

const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log(JSON.stringify(data, null, 2));
}
test();
