-- SQL script to set up user roles in Supabase database

-- 1. Ensure profiles table role column values for designated emails
UPDATE public.profiles 
SET role = 'admin' 
WHERE LOWER(email) = 'test@dropyhub.com';

UPDATE public.profiles 
SET role = 'employee' 
WHERE LOWER(email) IN ('jayanth.choda@dropyhub.com', 'balaji.s@dropyhub.com');

-- 2. Insert employee invitations if they do not already exist
INSERT INTO public.employee_invitations (email, first_name, last_name, department, designation, raw_data)
VALUES 
  ('jayanth.choda@dropyhub.com', 'Jayanth', 'Choda', 'Engineering', 'Software Engineer', '{"empId": "EMP-001", "firstName": "Jayanth", "lastName": "Choda", "department": "Engineering", "designation": "Software Engineer"}'),
  ('balaji.s@dropyhub.com', 'Balaji', 'S', 'Engineering', 'Software Engineer', '{"empId": "EMP-002", "firstName": "Balaji", "lastName": "S", "department": "Engineering", "designation": "Software Engineer"}')
ON CONFLICT (email) DO UPDATE 
SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;
