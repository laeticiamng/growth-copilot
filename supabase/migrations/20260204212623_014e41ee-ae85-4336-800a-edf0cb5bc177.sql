-- Fix SECURITY DEFINER view warning
-- Recreate employees_safe view with SECURITY INVOKER (default, explicit for clarity)
DROP VIEW IF EXISTS public.employees_safe;

CREATE VIEW public.employees_safe 
WITH (security_invoker = true)
AS
SELECT 
  id, workspace_id, user_id, first_name, last_name, email,
  phone, job_title, department, hire_date, end_date, manager_id, status,
  contract_type, work_location, skills, performance_score, last_review_at, notes,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
        AND ur.workspace_id = employees.workspace_id 
        AND ur.role IN ('owner', 'admin')
    ) OR public.has_hr_access(auth.uid(), employees.workspace_id)
    THEN salary_annual
    ELSE NULL
  END as salary_annual,
  created_at, updated_at
FROM public.employees;