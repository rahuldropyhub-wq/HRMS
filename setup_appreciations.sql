-- Supabase SQL Script to create the `appreciations` table

CREATE TABLE IF NOT EXISTS public.appreciations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_name TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'shoutout', -- 'shoutout', 'award', 'achievement'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appreciations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read appreciations
CREATE POLICY "Enable read access for all authenticated users"
ON public.appreciations FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert their own appreciations
CREATE POLICY "Enable insert access for authenticated users"
ON public.appreciations FOR INSERT
TO authenticated
WITH CHECK (true);
