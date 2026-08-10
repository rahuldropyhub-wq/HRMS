import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase env vars missing! Check your .env.local file.');
}

// Determine storage key based on the portal being accessed
// This completely separates the Admin and Employee login sessions!
const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
const storageKey = isAdminRoute ? 'dropyhub-admin-auth-token' : 'dropyhub-employee-auth-token';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storageKey: storageKey
    }
  }
);
