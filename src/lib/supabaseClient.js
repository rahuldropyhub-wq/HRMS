import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseUrl = rawUrl.trim().replace(/[\r\n\t ]+/g, '');
const supabaseAnonKey = rawKey.trim().replace(/[\r\n\t ]+/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey.startsWith('eyJ')
);

if (!isSupabaseConfigured) {
  console.info('ℹ️ Running in Local Standalone Mode (using simulated local authentication).');
}

// Custom fetch to intercept placeholder URL requests and prevent ERR_NAME_NOT_RESOLVED console errors
const customFetch = async (url, options) => {
  const urlStr = typeof url === 'string' ? url : (url?.url || String(url));
  
  if (urlStr.includes('placeholder.supabase.co')) {
    const headers = options?.headers || {};
    const rawAccept = typeof headers.get === 'function' ? headers.get('Accept') : (headers['Accept'] || headers['accept'] || '');
    const acceptHeader = rawAccept || '';
    const isSingleObject = acceptHeader.includes('vnd.pgrst.object+json');

    let body = '[]';
    if (isSingleObject) {
      body = 'null';
    } else if (urlStr.includes('/auth/v1')) {
      body = JSON.stringify({ user: null, session: null });
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Range': '0-0/0'
      }
    });
  }

  const res = await fetch(url, options);

  // If table does not exist yet on remote Supabase DB (404), return empty array gracefully to prevent console error cascades
  if (res.status === 404 && (urlStr.includes('/rest/v1/appreciations') || urlStr.includes('/rest/v1/tickets'))) {
    return new Response('[]', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Range': '0-0/0'
      }
    });
  }

  return res;
};

// Determine storage key based on the portal being accessed
// This completely separates the Admin and Employee login sessions!
const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
const storageKey = isAdminRoute ? 'dropyhub-admin-auth-token' : 'dropyhub-employee-auth-token';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storageKey: storageKey,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: true
    },
    global: {
      fetch: customFetch
    },
    realtime: {
      autoConnect: isSupabaseConfigured
    }
  }
);

// In local standalone mode, safely mock realtime channels to prevent WebSocket connection failures
if (!isSupabaseConfigured) {
  const dummyChannel = {
    on: () => dummyChannel,
    subscribe: (cb) => {
      if (typeof cb === 'function') cb('SUBSCRIBED');
      return dummyChannel;
    },
    unsubscribe: () => Promise.resolve('ok')
  };
  supabase.channel = () => dummyChannel;
  supabase.removeChannel = () => Promise.resolve('ok');
  if (supabase.realtime) {
    supabase.realtime.connect = () => {};
    supabase.realtime.disconnect = () => {};
  }
}



