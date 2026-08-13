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

-- Option A: Disable RLS on all tables for full public access
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appreciations DISABLE ROW LEVEL SECURITY;

-- Option B: Or Enable RLS and add public read/write access for all tables
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appreciations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on tickets" ON public.tickets;
CREATE POLICY "Allow all on tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on appreciations" ON public.appreciations;
CREATE POLICY "Allow all on appreciations" ON public.appreciations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on departments" ON public.departments;
CREATE POLICY "Allow all on departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on designations" ON public.designations;
CREATE POLICY "Allow all on designations" ON public.designations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on announcements" ON public.announcements;
CREATE POLICY "Allow all on announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on holidays" ON public.holidays;
CREATE POLICY "Allow all on holidays" ON public.holidays FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on tasks" ON public.tasks;
CREATE POLICY "Allow all on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
