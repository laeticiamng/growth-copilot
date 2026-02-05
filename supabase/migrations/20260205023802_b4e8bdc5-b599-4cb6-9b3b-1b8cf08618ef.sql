-- =====================================================
-- SECURITY HARDENING: Phase 1 - Core Tables Only
-- =====================================================

-- 1. EMPLOYEES: Own record OR HR access
DROP POLICY IF EXISTS "employees_hr_v13" ON public.employees;
DROP POLICY IF EXISTS "employees_hardened_select" ON public.employees;
DROP POLICY IF EXISTS "employees_workspace_select" ON public.employees;

CREATE POLICY "employees_own_or_hr_only" ON public.employees
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_hr_access(auth.uid(), workspace_id)
  );

-- 2. LEADS: Assigned user + manager access
DROP POLICY IF EXISTS "leads_sales_team_v7" ON public.leads;
DROP POLICY IF EXISTS "leads_crm_select_v13" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_select" ON public.leads;

CREATE POLICY "leads_assigned_or_manager" ON public.leads
  FOR SELECT
  USING (
    auth.uid() = assigned_to 
    OR public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 3. CONTRACTS: Billing/owner only
DROP POLICY IF EXISTS "contracts_finance_legal_only_v13" ON public.contracts;
DROP POLICY IF EXISTS "contracts_workspace_select" ON public.contracts;

CREATE POLICY "contracts_owner_billing_only" ON public.contracts
  FOR SELECT
  USING (
    public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_billing_access(auth.uid(), workspace_id)
  );

-- 4. PERFORMANCE_REVIEWS: Employee/reviewer/HR
DROP POLICY IF EXISTS "performance_reviews_employee_v13" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_hr_v13" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_reviewer_v13" ON public.performance_reviews;

CREATE POLICY "perf_reviews_strict_access" ON public.performance_reviews
  FOR SELECT
  USING (
    auth.uid() = employee_id
    OR auth.uid() = reviewer_id
    OR public.has_hr_access(auth.uid(), workspace_id)
  );

-- 5. GDPR_REQUESTS: Normalized email + owner
DROP POLICY IF EXISTS "gdpr_requests_owner_v13" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_requester_v13" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_secure" ON public.gdpr_requests
  FOR SELECT
  USING (
    public.is_workspace_owner(auth.uid(), workspace_id)
  );

-- 6. META_CONVERSATIONS: Manager+ roles
DROP POLICY IF EXISTS "mc_sel_member" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_workspace" ON public.meta_conversations;

CREATE POLICY "meta_conv_cs_only" ON public.meta_conversations
  FOR SELECT
  USING (
    public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 7. META_MESSAGES: Manager+ roles
DROP POLICY IF EXISTS "mm_sel_member" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_workspace" ON public.meta_messages;

CREATE POLICY "meta_msg_cs_only" ON public.meta_messages
  FOR SELECT
  USING (
    public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 8. SMART_LINK_EMAILS
DROP POLICY IF EXISTS "sle_sel_member" ON public.smart_link_emails;
DROP POLICY IF EXISTS "sle_insert_public" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_owner_mgr" ON public.smart_link_emails
  FOR SELECT
  USING (
    public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin')
  );

CREATE POLICY "smart_link_public_insert_consent" ON public.smart_link_emails
  FOR INSERT
  WITH CHECK (consent_given = true);