import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder';

const isConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_URL.includes('placeholder'));

if (!isConfigured) {
  console.warn('⚠️ SUPABASE_URL and SUPABASE_SERVICE_KEY are not configured. Backend running in standalone mode.');
}

const customFetch = async (url: any, options: any) => {
  const urlStr = typeof url === 'string' ? url : (url?.url || String(url));
  
  if (urlStr.includes('placeholder.supabase.co')) {
    const headers = options?.headers || {};
    const rawAccept = typeof headers.get === 'function' ? headers.get('Accept') : (headers['Accept'] || headers['accept'] || '');
    const acceptHeader = rawAccept || '';
    const isSingleObject = acceptHeader.includes('vnd.pgrst.object+json');

    let body = '[]';
    if (isSingleObject) {
      body = 'null';
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Range': '0-0/0'
      }
    });
  }

  return fetch(url, options);
};

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  global: {
    fetch: customFetch
  }
});

