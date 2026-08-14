-- ====================================================================
-- DROPYHUB HRMS: ADMIN LOGIN & SECURITY AUDIT TRAIL TABLE
-- Description: Stores live timestamps, administrator identity, client device,
--              IP address, and authentication method for all admin sessions.
-- ====================================================================

-- 1. Create the admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id TEXT PRIMARY KEY,
    admin_email TEXT NOT NULL,
    admin_name TEXT,
    login_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    login_date TEXT,
    login_time TEXT,
    ip_address TEXT DEFAULT '127.0.0.1 (Gateway)',
    device_info TEXT,
    auth_method TEXT DEFAULT 'Passcode OTP',
    status TEXT DEFAULT 'Active Session',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on login_timestamp for ultra-fast ordering
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp 
ON public.admin_audit_logs (login_timestamp DESC);

-- 3. Create index on admin_email for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_email 
ON public.admin_audit_logs (admin_email);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies:
-- Allow authenticated users & admins to read audit logs
CREATE POLICY "Allow authenticated users to read admin audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated, anon
USING (true);

-- Allow authenticated users & anon to insert login audit logs
CREATE POLICY "Allow insert of admin audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 6. Insert initial seed data (optional)
INSERT INTO public.admin_audit_logs (id, admin_email, admin_name, login_timestamp, login_date, login_time, ip_address, device_info, auth_method, status)
VALUES 
    (
        'adm_seed_001',
        'test@dropyhub.com',
        'Test Administrator',
        NOW() - INTERVAL '15 minutes',
        TO_CHAR(NOW() - INTERVAL '15 minutes', 'DD Mon YYYY'),
        TO_CHAR(NOW() - INTERVAL '15 minutes', 'HH12:MI AM'),
        '192.168.1.104',
        'Chrome • Windows 11',
        'Passcode OTP',
        'Active Session'
    ),
    (
        'adm_seed_002',
        'manjula.k@dropyhub.com',
        'Manjula K (Super Admin)',
        NOW() - INTERVAL '1 day',
        TO_CHAR(NOW() - INTERVAL '1 day', 'DD Mon YYYY'),
        '10:15 AM',
        '192.168.1.112',
        'Edge • Windows 11',
        'Passcode OTP',
        'Logged Out'
    )
ON CONFLICT (id) DO NOTHING;
