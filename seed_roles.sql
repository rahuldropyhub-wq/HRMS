-- SQL script to set up user roles in Supabase database

-- 1. Ensure profiles table role column values for designated emails
UPDATE public.profiles 
SET role = 'admin' 
WHERE LOWER(email) = 'test@dropyhub.com';

