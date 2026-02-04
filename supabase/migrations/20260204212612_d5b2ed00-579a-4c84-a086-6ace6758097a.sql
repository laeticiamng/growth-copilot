-- ============================================
-- SECURITY HARDENING v13 - Critical RLS Fixes
-- Fix 6 critical security vulnerabilities
-- ============================================

-- 1. LEADS TABLE - Restrict to assigned users only (no unassigned leads visible to all)
DROP POLICY IF EXISTS "leads_workspace_member_assigned_select" ON public.leads;
DROP POLICY IF EXISTS "leads_manager_all_select" ON public.leads;

-- Only managers/admins/owners can see all leads, others only see assigned
CREATE POLICY "leads_restricted_select_v13" ON public.leads
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    -- Managers and above can see all workspace leads
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = leads.workspace_id
        AND ur.role IN ('owner', 'admin', 'manager')
    )
    -- Others can only see leads assigned to them
    OR assigned_to = auth.uid()
  )
);

-- 2. EMPLOYEES TABLE - Hide salary from non-HR users via secure view
DROP VIEW IF EXISTS public.employees_safe;
CREATE VIEW public.employees_safe AS
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

-- 3. META_CONVERSATIONS - Restrict to assigned support reps only
DROP POLICY IF EXISTS "meta_conversations_workspace_select" ON public.meta_conversations;

CREATE POLICY "meta_conversations_restricted_select_v13" ON public.meta_conversations
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    -- Only support lead/admin/owner can see all conversations
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = meta_conversations.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
    -- Or user is assigned to handle this conversation (if assigned_to column exists)
  )
);

-- 4. CONTRACTS - Restrict to finance/legal/billing roles only
DROP POLICY IF EXISTS "contracts_workspace_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_select" ON public.contracts;

CREATE POLICY "contracts_finance_legal_only_v13" ON public.contracts
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    -- Only owner, admin, or users with billing access
    public.has_billing_access(auth.uid(), workspace_id)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = contracts.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
  )
);

-- 5. GDPR_REQUESTS - Only privacy officers/owners can view
DROP POLICY IF EXISTS "gdpr_requests_own_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_hr_select" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_privacy_officer_only_v13" ON public.gdpr_requests
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    -- Only owner can see all GDPR requests
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = gdpr_requests.workspace_id
        AND ur.role = 'owner'
    )
    -- Or the requester themselves (by matching email to their auth email)
    OR requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- 6. PERFORMANCE_REVIEWS - Only show submitted/acknowledged reviews to employees
DROP POLICY IF EXISTS "performance_reviews_employee_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_hr_select" ON public.performance_reviews;

CREATE POLICY "performance_reviews_restricted_select_v13" ON public.performance_reviews
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    -- HR and managers can see all reviews including drafts
    public.has_hr_access(auth.uid(), workspace_id)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = performance_reviews.workspace_id
        AND ur.role IN ('owner', 'admin', 'manager')
    )
    -- Employees can only see their own reviews that are NOT in draft status
    OR (
      employee_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.user_id = auth.uid() AND e.workspace_id = performance_reviews.workspace_id
      )
      AND status IN ('submitted', 'acknowledged', 'completed')
    )
  )
);

-- 7. AI_REQUESTS - Restrict cost data to owners/billing only
DROP POLICY IF EXISTS "ai_requests_workspace_select" ON public.ai_requests;

CREATE POLICY "ai_requests_restricted_select_v13" ON public.ai_requests
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    -- Users can see their own requests
    user_id = auth.uid()
    -- Owners/admins can see all
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = ai_requests.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
  )
);

-- 8. SMART_LINK_EMAILS - Add consent constraint
ALTER TABLE public.smart_link_emails 
DROP CONSTRAINT IF EXISTS smart_link_emails_consent_required;

ALTER TABLE public.smart_link_emails 
ADD CONSTRAINT smart_link_emails_consent_required 
CHECK (consent_given = true);

-- 9. NOTIFICATIONS - Consolidate policies for sensitive categories
DROP POLICY IF EXISTS "notifications_own_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_sensitive_select" ON public.notifications;

CREATE POLICY "notifications_consolidated_select_v13" ON public.notifications
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    -- User's own notifications (non-sensitive)
    (
      user_id = auth.uid()
      AND category NOT IN ('security', 'billing', 'compliance', 'hr')
    )
    -- Owners/admins can see all including sensitive
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = notifications.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
  )
);