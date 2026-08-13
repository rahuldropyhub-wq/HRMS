-- SQL Script to create missing tables and set RLS policies in Supabase

-- 1. Create tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  subject TEXT NOT NULL,
  department TEXT DEFAULT 'IT Support',
  category TEXT DEFAULT 'IT Support',
  priority TEXT DEFAULT 'medium',
  description TEXT,
  status TEXT DEFAULT 'open',
  assigned_to TEXT DEFAULT 'Unassigned',
  conversation JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create appreciations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.appreciations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT,
  receiver_name TEXT,
  message TEXT,
  type TEXT DEFAULT 'kudos',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and add public read/write access
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appreciations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on tickets" ON public.tickets;
CREATE POLICY "Allow all on tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on appreciations" ON public.appreciations;
CREATE POLICY "Allow all on appreciations" ON public.appreciations FOR ALL USING (true) WITH CHECK (true);
