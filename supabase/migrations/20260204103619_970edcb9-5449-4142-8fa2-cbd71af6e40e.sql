-- =============================================================================
-- SECURITY HARDENING: Replace permissive {public} roles with {authenticated}
-- =============================================================================

-- EMPLOYEES: Only HR/managers can access
DROP POLICY IF EXISTS "authenticated_employees_access" ON public.employees;
CREATE POLICY "authenticated_employees_access"
ON public.employees FOR ALL
TO authenticated
USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  AND (
    has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- LEADS: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_leads_access" ON public.leads;
CREATE POLICY "authenticated_leads_access"
ON public.leads FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- CONTRACTS: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_contracts_access" ON public.contracts;
CREATE POLICY "authenticated_contracts_access"
ON public.contracts FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- DEALS: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_deals_access" ON public.deals;
CREATE POLICY "authenticated_deals_access"
ON public.deals FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- GDPR_REQUESTS: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_gdpr_requests_access" ON public.gdpr_requests;
CREATE POLICY "authenticated_gdpr_requests_access"
ON public.gdpr_requests FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- COMPLIANCE_TASKS: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_compliance_tasks_access" ON public.compliance_tasks;
CREATE POLICY "authenticated_compliance_tasks_access"
ON public.compliance_tasks FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- INTEGRATION_TOKENS: Owner/admin only
DROP POLICY IF EXISTS "authenticated_integration_tokens_access" ON public.integration_tokens;
CREATE POLICY "authenticated_integration_tokens_access"
ON public.integration_tokens FOR ALL
TO authenticated
USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  AND (
    is_workspace_owner(auth.uid(), workspace_id)
    OR get_effective_role(auth.uid(), workspace_id) = 'admin'::app_role
  )
);

-- OAUTH_TOKENS: Integration owners only
DROP POLICY IF EXISTS "authenticated_oauth_tokens_access" ON public.oauth_tokens;
CREATE POLICY "authenticated_oauth_tokens_access"
ON public.oauth_tokens FOR ALL
TO authenticated
USING (
  integration_id IN (
    SELECT id FROM public.integrations 
    WHERE workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  )
);

-- META_CONVERSATIONS: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_meta_conversations_access" ON public.meta_conversations;
CREATE POLICY "authenticated_meta_conversations_access"
ON public.meta_conversations FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- META_MESSAGES: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_meta_messages_access" ON public.meta_messages;
CREATE POLICY "authenticated_meta_messages_access"
ON public.meta_messages FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- SMART_LINK_EMAILS: Authenticated workspace members for SELECT
DROP POLICY IF EXISTS "authenticated_smart_link_emails_select" ON public.smart_link_emails;
CREATE POLICY "authenticated_smart_link_emails_select"
ON public.smart_link_emails FOR SELECT
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- PERFORMANCE_REVIEWS: HR only
DROP POLICY IF EXISTS "authenticated_performance_reviews_access" ON public.performance_reviews;
CREATE POLICY "authenticated_performance_reviews_access"
ON public.performance_reviews FOR ALL
TO authenticated
USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  AND (
    has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- TIME_OFF_REQUESTS: HR/managers only
DROP POLICY IF EXISTS "authenticated_time_off_requests_access" ON public.time_off_requests;
CREATE POLICY "authenticated_time_off_requests_access"
ON public.time_off_requests FOR ALL
TO authenticated
USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  AND (
    has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- LEGAL_TEMPLATES: Authenticated workspace members
DROP POLICY IF EXISTS "authenticated_legal_templates_access" ON public.legal_templates;
CREATE POLICY "authenticated_legal_templates_access"
ON public.legal_templates FOR ALL
TO authenticated
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));