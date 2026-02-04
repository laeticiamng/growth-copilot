-- =====================================================
-- CRITICAL RLS HARDENING - Fix 18 security findings
-- Simplified version without user_id reference where not available
-- =====================================================

-- 1. Fix leads table
DROP POLICY IF EXISTS "leads_workspace_select" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_update" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_delete" ON public.leads;

CREATE POLICY "leads_workspace_select" ON public.leads
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "leads_workspace_insert" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "leads_workspace_update" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "leads_workspace_delete" ON public.leads
  FOR DELETE TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 2. Fix employees table (has user_id)
DROP POLICY IF EXISTS "employees_workspace_select" ON public.employees;
DROP POLICY IF EXISTS "employees_workspace_insert" ON public.employees;
DROP POLICY IF EXISTS "employees_workspace_update" ON public.employees;

CREATE POLICY "employees_workspace_select" ON public.employees
  FOR SELECT TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND (
      public.has_permission(auth.uid(), workspace_id, 'manage_team')
      OR user_id = auth.uid()
    )
  );

CREATE POLICY "employees_workspace_insert" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'manage_team')
  );

CREATE POLICY "employees_workspace_update" ON public.employees
  FOR UPDATE TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND (
      public.has_permission(auth.uid(), workspace_id, 'manage_team')
      OR user_id = auth.uid()
    )
  );

-- 3. Fix contracts table
DROP POLICY IF EXISTS "contracts_workspace_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_workspace_insert" ON public.contracts;
DROP POLICY IF EXISTS "contracts_workspace_update" ON public.contracts;

CREATE POLICY "contracts_workspace_select" ON public.contracts
  FOR SELECT TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'manage_billing')
  );

CREATE POLICY "contracts_workspace_insert" ON public.contracts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'manage_billing')
  );

CREATE POLICY "contracts_workspace_update" ON public.contracts
  FOR UPDATE TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'manage_billing')
  );

-- 4. Fix oauth_tokens - via integration_id
DROP POLICY IF EXISTS "oauth_tokens_owner_select" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_owner_insert" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_owner_update" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_owner_delete" ON public.oauth_tokens;

CREATE POLICY "oauth_tokens_owner_select" ON public.oauth_tokens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = integration_id
      AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

CREATE POLICY "oauth_tokens_owner_insert" ON public.oauth_tokens
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = integration_id
      AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

CREATE POLICY "oauth_tokens_owner_update" ON public.oauth_tokens
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = integration_id
      AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

CREATE POLICY "oauth_tokens_owner_delete" ON public.oauth_tokens
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = integration_id
      AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

-- 5. Fix integration_tokens
DROP POLICY IF EXISTS "integration_tokens_owner_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_owner_insert" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_owner_update" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_owner_delete" ON public.integration_tokens;

CREATE POLICY "integration_tokens_owner_select" ON public.integration_tokens
  FOR SELECT TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "integration_tokens_owner_insert" ON public.integration_tokens
  FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "integration_tokens_owner_update" ON public.integration_tokens
  FOR UPDATE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "integration_tokens_owner_delete" ON public.integration_tokens
  FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- 6. Fix meta_conversations
DROP POLICY IF EXISTS "meta_conversations_workspace_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_workspace_insert" ON public.meta_conversations;

CREATE POLICY "meta_conversations_workspace_select" ON public.meta_conversations
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "meta_conversations_workspace_insert" ON public.meta_conversations
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

-- 7. Fix meta_messages
DROP POLICY IF EXISTS "meta_messages_workspace_select" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_workspace_insert" ON public.meta_messages;

CREATE POLICY "meta_messages_workspace_select" ON public.meta_messages
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "meta_messages_workspace_insert" ON public.meta_messages
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

-- 8. Fix gdpr_requests (no user_id, use view_audit permission)
DROP POLICY IF EXISTS "gdpr_requests_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_insert" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_update" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_select" ON public.gdpr_requests
  FOR SELECT TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'view_audit')
  );

CREATE POLICY "gdpr_requests_insert" ON public.gdpr_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "gdpr_requests_update" ON public.gdpr_requests
  FOR UPDATE TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'view_audit')
  );

-- 9. Fix smart_link_emails
DROP POLICY IF EXISTS "smart_link_emails_workspace_select" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_workspace_insert" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_workspace_select" ON public.smart_link_emails
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "smart_link_emails_workspace_insert" ON public.smart_link_emails
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

-- 10. Fix user_roles
DROP POLICY IF EXISTS "user_roles_workspace_select" ON public.user_roles;

CREATE POLICY "user_roles_workspace_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_workspace_access(auth.uid(), workspace_id)
  );

-- 11. Fix deals
DROP POLICY IF EXISTS "deals_workspace_select" ON public.deals;
DROP POLICY IF EXISTS "deals_workspace_insert" ON public.deals;
DROP POLICY IF EXISTS "deals_workspace_update" ON public.deals;

CREATE POLICY "deals_workspace_select" ON public.deals
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "deals_workspace_insert" ON public.deals
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "deals_workspace_update" ON public.deals
  FOR UPDATE TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 12. Fix activities
DROP POLICY IF EXISTS "activities_workspace_select" ON public.activities;
DROP POLICY IF EXISTS "activities_workspace_insert" ON public.activities;
DROP POLICY IF EXISTS "activities_workspace_update" ON public.activities;

CREATE POLICY "activities_workspace_select" ON public.activities
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "activities_workspace_insert" ON public.activities
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "activities_workspace_update" ON public.activities
  FOR UPDATE TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 13. Fix campaigns
DROP POLICY IF EXISTS "campaigns_workspace_select" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_workspace_insert" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_workspace_update" ON public.campaigns;

CREATE POLICY "campaigns_workspace_select" ON public.campaigns
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "campaigns_workspace_insert" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "campaigns_workspace_update" ON public.campaigns
  FOR UPDATE TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 14. Fix ai_requests
DROP POLICY IF EXISTS "ai_requests_workspace_select" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_workspace_insert" ON public.ai_requests;

CREATE POLICY "ai_requests_workspace_select" ON public.ai_requests
  FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "ai_requests_workspace_insert" ON public.ai_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

-- 15. Fix performance_reviews (reference employees.id to get user_id)
DROP POLICY IF EXISTS "performance_reviews_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_insert" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_update" ON public.performance_reviews;

CREATE POLICY "performance_reviews_select" ON public.performance_reviews
  FOR SELECT TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND (
      public.has_permission(auth.uid(), workspace_id, 'manage_team')
      OR EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = employee_id AND e.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "performance_reviews_insert" ON public.performance_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'manage_team')
  );

CREATE POLICY "performance_reviews_update" ON public.performance_reviews
  FOR UPDATE TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND public.has_permission(auth.uid(), workspace_id, 'manage_team')
  );

-- 16. Fix time_off_requests
DROP POLICY IF EXISTS "time_off_requests_select" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_insert" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_update" ON public.time_off_requests;

CREATE POLICY "time_off_requests_select" ON public.time_off_requests
  FOR SELECT TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND (
      public.has_permission(auth.uid(), workspace_id, 'manage_team')
      OR EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = employee_id AND e.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "time_off_requests_insert" ON public.time_off_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_workspace_access(auth.uid(), workspace_id)
  );

CREATE POLICY "time_off_requests_update" ON public.time_off_requests
  FOR UPDATE TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    AND (
      public.has_permission(auth.uid(), workspace_id, 'manage_team')
      OR EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = employee_id AND e.user_id = auth.uid()
      )
    )
  );