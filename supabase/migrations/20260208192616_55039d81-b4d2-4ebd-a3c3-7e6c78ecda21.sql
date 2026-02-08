
-- 1. Drop the overly permissive policy on policy_profiles that allows any authenticated user to read all data
DROP POLICY IF EXISTS "Authenticated users can read policy profiles" ON public.policy_profiles;

-- 2. Recreate employees_directory view with security_invoker so it inherits RLS from employees table
DROP VIEW IF EXISTS public.employees_directory;
CREATE VIEW public.employees_directory WITH (security_invoker = true) AS
SELECT id, workspace_id, user_id, first_name, last_name, job_title, department, hire_date, status, manager_id, created_at
FROM public.employees;
