
-- 1. Drop overly permissive SELECT policy on employees
DROP POLICY IF EXISTS "emp_sel_strict" ON public.employees;

-- 2. Create restrictive SELECT policy: only HR roles + own record + workspace owner
CREATE POLICY "emp_sel_strict_v2"
ON public.employees
FOR SELECT
USING (
  public.has_hr_access(auth.uid(), workspace_id)
  OR auth.uid() = user_id
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 3. Create a safe directory view that hides sensitive fields
CREATE OR REPLACE VIEW public.employees_directory AS
SELECT 
  id,
  workspace_id,
  user_id,
  first_name,
  last_name,
  job_title,
  department,
  hire_date,
  status,
  manager_id,
  created_at
FROM public.employees;

-- 4. Grant access to the view
GRANT SELECT ON public.employees_directory TO authenticated;

-- 5. Make view use invoker's permissions (respects RLS)
ALTER VIEW public.employees_directory SET (security_invoker = true);
