import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('profiles').insert([
    {
      id: crypto.randomUUID(),
      first_name: 'Test',
      last_name: 'User',
      email: 'test@dropyhub.com'
    }
  ]);
  console.log('Result:', error || data);
}

test();
