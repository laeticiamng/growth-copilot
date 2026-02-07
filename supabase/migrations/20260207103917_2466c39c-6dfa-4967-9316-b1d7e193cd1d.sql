
-- =============================================
-- FIX 1: compliance_tasks - Remove overly broad ALL policy
-- The specific compliance officer policies are correct and sufficient
-- =============================================
DROP POLICY IF EXISTS "authenticated_compliance_tasks_access" ON public.compliance_tasks;

-- =============================================
-- FIX 2: leads - Remove overly permissive workspace-only policies
-- The stricter sales access policies (leads_sel_strict, leads_ins_strict, etc.) are sufficient
-- =============================================
DROP POLICY IF EXISTS "leads_workspace_delete" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_update" ON public.leads;

-- =============================================
-- FIX 3: ai_requests - Remove overlapping/redundant ALL and SELECT policies
-- Keep ai_requests_owner_billing (SELECT) and ai_requests_workspace_insert (INSERT)
-- =============================================
DROP POLICY IF EXISTS "ai_requests_creator_or_owner_v5" ON public.ai_requests;
DROP POLICY IF EXISTS "aireq_sel" ON public.ai_requests;

-- Add proper UPDATE policy for ai_requests (only owner or creator)
CREATE POLICY "ai_requests_update_own" ON public.ai_requests
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_workspace_owner(auth.uid(), workspace_id));

-- =============================================
-- FIX 4: employees - Remove duplicate public-role policies, keep authenticated ones
-- =============================================
DROP POLICY IF EXISTS "emp_del_strict" ON public.employees;
DROP POLICY IF EXISTS "emp_ins_strict" ON public.employees;
DROP POLICY IF EXISTS "emp_sel_strict_v2" ON public.employees;
DROP POLICY IF EXISTS "emp_upd_strict" ON public.employees;
