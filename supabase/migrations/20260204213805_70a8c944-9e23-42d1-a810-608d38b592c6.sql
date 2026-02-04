-- Migration v14: Security Hardening - Critical fixes only
DROP VIEW IF EXISTS public.employees_safe CASCADE;
DROP VIEW IF EXISTS public.ai_requests_safe CASCADE;

-- 1. EMPLOYEES: Secure view hiding salary
CREATE VIEW public.employees_safe WITH (security_invoker = true) AS
SELECT id, workspace_id, user_id, first_name, last_name, email, phone, job_title, department,
  hire_date, end_date, status, manager_id, contract_type, work_location, skills, last_review_at,
  notes, created_at, updated_at,
  CASE WHEN public.has_hr_access(auth.uid(), workspace_id) THEN salary_annual ELSE NULL END AS salary_annual,
  CASE WHEN public.has_hr_access(auth.uid(), workspace_id) THEN performance_score ELSE NULL END AS performance_score
FROM public.employees WHERE public.has_workspace_access(auth.uid(), workspace_id);

-- 2. AI_REQUESTS: Secure view hiding costs
CREATE VIEW public.ai_requests_safe WITH (security_invoker = true) AS
SELECT id, workspace_id, agent_name, purpose, model_name, provider_name, status, duration_ms, error_message, created_at,
  CASE WHEN public.has_role(auth.uid(), workspace_id, 'owner'::app_role) OR public.has_role(auth.uid(), workspace_id, 'admin'::app_role) THEN cost_estimate ELSE NULL END AS cost_estimate,
  CASE WHEN public.has_role(auth.uid(), workspace_id, 'owner'::app_role) OR public.has_role(auth.uid(), workspace_id, 'admin'::app_role) THEN tokens_in ELSE NULL END AS tokens_in,
  CASE WHEN public.has_role(auth.uid(), workspace_id, 'owner'::app_role) OR public.has_role(auth.uid(), workspace_id, 'admin'::app_role) THEN tokens_out ELSE NULL END AS tokens_out
FROM public.ai_requests WHERE public.has_workspace_access(auth.uid(), workspace_id);

-- 3. AUDIT_LOG: Immutability policies
DROP POLICY IF EXISTS "audit_log_no_update" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_no_delete" ON public.audit_log;
CREATE POLICY "audit_log_no_update" ON public.audit_log FOR UPDATE TO authenticated USING (false);
CREATE POLICY "audit_log_no_delete" ON public.audit_log FOR DELETE TO authenticated USING (false);

-- 4. SMART_LINK_EMAILS: Consent constraint
DO $$ BEGIN
  ALTER TABLE public.smart_link_emails ADD CONSTRAINT smart_link_emails_consent_required CHECK (consent_given = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;