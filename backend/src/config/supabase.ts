import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_URL and SUPABASE_SERVICE_KEY are required in the .env file.');
}

// Ensure the backend uses the Service Role Key to bypass RLS and act as the single source of truth
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
