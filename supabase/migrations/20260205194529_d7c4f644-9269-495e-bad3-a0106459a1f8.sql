-- =====================================================
-- SECURITY HARDENING MIGRATION v2
-- Fix RLS policies for sensitive tables
-- =====================================================

-- 1. EMPLOYEES TABLE - Add strict RLS policies
DROP POLICY IF EXISTS "employees_public_read" ON public.employees;
DROP POLICY IF EXISTS "employees_select_all" ON public.employees;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emp_sel_strict" ON public.employees;
CREATE POLICY "emp_sel_strict" ON public.employees
FOR SELECT USING (
  user_id = auth.uid() 
  OR public.has_hr_access(auth.uid(), workspace_id) 
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "emp_ins_strict" ON public.employees;
CREATE POLICY "emp_ins_strict" ON public.employees
FOR INSERT WITH CHECK (
  public.has_hr_access(auth.uid(), workspace_id) 
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "emp_upd_strict" ON public.employees;
CREATE POLICY "emp_upd_strict" ON public.employees
FOR UPDATE USING (
  public.has_hr_access(auth.uid(), workspace_id) 
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "emp_del_strict" ON public.employees;
CREATE POLICY "emp_del_strict" ON public.employees
FOR DELETE USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 2. CONTRACTS TABLE - Add strict RLS policies
DROP POLICY IF EXISTS "contracts_public_read" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_all" ON public.contracts;

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts_sel_strict" ON public.contracts;
CREATE POLICY "contracts_sel_strict" ON public.contracts
FOR SELECT USING (
  public.has_billing_access(auth.uid(), workspace_id)
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "contracts_ins_strict" ON public.contracts;
CREATE POLICY "contracts_ins_strict" ON public.contracts
FOR INSERT WITH CHECK (
  public.has_billing_access(auth.uid(), workspace_id)
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "contracts_upd_strict" ON public.contracts;
CREATE POLICY "contracts_upd_strict" ON public.contracts
FOR UPDATE USING (
  public.has_billing_access(auth.uid(), workspace_id)
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "contracts_del_strict" ON public.contracts;
CREATE POLICY "contracts_del_strict" ON public.contracts
FOR DELETE USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 3. LEADS TABLE - Add strict RLS policies
DROP POLICY IF EXISTS "leads_public_read" ON public.leads;
DROP POLICY IF EXISTS "leads_select_all" ON public.leads;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_sel_strict" ON public.leads;
CREATE POLICY "leads_sel_strict" ON public.leads
FOR SELECT USING (
  public.has_sales_access(auth.uid(), workspace_id)
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "leads_ins_strict" ON public.leads;
CREATE POLICY "leads_ins_strict" ON public.leads
FOR INSERT WITH CHECK (
  public.has_sales_access(auth.uid(), workspace_id)
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "leads_upd_strict" ON public.leads;
CREATE POLICY "leads_upd_strict" ON public.leads
FOR UPDATE USING (
  public.has_sales_access(auth.uid(), workspace_id)
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "leads_del_strict" ON public.leads;
CREATE POLICY "leads_del_strict" ON public.leads
FOR DELETE USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 4. GDPR_REQUESTS TABLE - Add strict RLS policies
DROP POLICY IF EXISTS "gdpr_requests_public_read" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_select_all" ON public.gdpr_requests;

ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gdpr_sel_strict" ON public.gdpr_requests;
CREATE POLICY "gdpr_sel_strict" ON public.gdpr_requests
FOR SELECT USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR public.has_hr_access(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "gdpr_ins_strict" ON public.gdpr_requests;
CREATE POLICY "gdpr_ins_strict" ON public.gdpr_requests
FOR INSERT WITH CHECK (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR public.has_hr_access(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "gdpr_upd_strict" ON public.gdpr_requests;
CREATE POLICY "gdpr_upd_strict" ON public.gdpr_requests
FOR UPDATE USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "gdpr_del_strict" ON public.gdpr_requests;
CREATE POLICY "gdpr_del_strict" ON public.gdpr_requests
FOR DELETE USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 5. CREATIVE_JOBS TABLE - Add strict RLS policies
DROP POLICY IF EXISTS "creative_jobs_public_read" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_select_all" ON public.creative_jobs;

ALTER TABLE public.creative_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creative_jobs_sel_strict" ON public.creative_jobs;
CREATE POLICY "creative_jobs_sel_strict" ON public.creative_jobs
FOR SELECT USING (
  public.is_workspace_member(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "creative_jobs_ins_strict" ON public.creative_jobs;
CREATE POLICY "creative_jobs_ins_strict" ON public.creative_jobs
FOR INSERT WITH CHECK (
  public.is_workspace_member(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "creative_jobs_upd_strict" ON public.creative_jobs;
CREATE POLICY "creative_jobs_upd_strict" ON public.creative_jobs
FOR UPDATE USING (
  public.is_workspace_member(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "creative_jobs_del_strict" ON public.creative_jobs;
CREATE POLICY "creative_jobs_del_strict" ON public.creative_jobs
FOR DELETE USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 6. CONTACT_SUBMISSIONS TABLE - Add rate limiting trigger at database level
-- The table doesn't have workspace_id, so we keep the current policies
-- but add a database-level rate limit trigger

CREATE OR REPLACE FUNCTION public.check_contact_submission_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_count INT;
BEGIN
  -- Count submissions from this email in last hour
  SELECT COUNT(*) INTO submission_count
  FROM public.contact_submissions
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF submission_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 3 submissions per hour per email';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS contact_submission_rate_limit ON public.contact_submissions;

-- Create rate limit trigger
CREATE TRIGGER contact_submission_rate_limit
BEFORE INSERT ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.check_contact_submission_rate_limit();

-- 7. Update employees_safe view with proper security
-- First drop the existing view
DROP VIEW IF EXISTS public.employees_safe;

-- Recreate with security_invoker for proper RLS enforcement
CREATE VIEW public.employees_safe WITH (security_invoker = true) AS
SELECT 
  id,
  workspace_id,
  user_id,
  first_name,
  last_name,
  email,
  phone,
  job_title,
  department,
  hire_date,
  end_date,
  status,
  contract_type,
  work_location,
  skills,
  notes,
  manager_id,
  created_at,
  updated_at,
  last_review_at,
  -- Mask sensitive data for non-HR users
  CASE WHEN public.has_hr_access(auth.uid(), workspace_id) 
       OR public.is_workspace_owner(auth.uid(), workspace_id)
       THEN salary_annual 
       ELSE NULL 
  END AS salary_annual,
  CASE WHEN public.has_hr_access(auth.uid(), workspace_id)
       OR public.is_workspace_owner(auth.uid(), workspace_id)
       THEN performance_score 
       ELSE NULL 
  END AS performance_score
FROM public.employees;

-- Grant appropriate access to the view
GRANT SELECT ON public.employees_safe TO authenticated;