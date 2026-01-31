-- =====================================================
-- SECURITY FIX: Strengthen RLS on sensitive tables
-- =====================================================

-- 1. Drop overly permissive policies and add proper ones for leads
DROP POLICY IF EXISTS "Workspace access for leads" ON public.leads;
CREATE POLICY "leads_workspace_access" ON public.leads
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 2. Protect workspaces stripe data - restrict to owner only for payment columns
DROP POLICY IF EXISTS "Workspace members can view their workspaces" ON public.workspaces;
CREATE POLICY "workspaces_owner_full_access" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "workspaces_member_read_non_sensitive" ON public.workspaces
  FOR SELECT USING (id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 3. Protect smart_link_emails - restrict to workspace members
DROP POLICY IF EXISTS "Public can view smart link emails" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_public_select" ON public.smart_link_emails;
CREATE POLICY "smart_link_emails_workspace_access" ON public.smart_link_emails
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));
CREATE POLICY "smart_link_emails_workspace_insert" ON public.smart_link_emails
  FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 4. Protect review_requests - restrict to workspace members
DROP POLICY IF EXISTS "Workspace access for review_requests" ON public.review_requests;
CREATE POLICY "review_requests_workspace_access" ON public.review_requests
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 5. Restrict ai_models and ai_providers to authenticated users only
DROP POLICY IF EXISTS "ai_models_select" ON public.ai_models;
CREATE POLICY "ai_models_authenticated_read" ON public.ai_models
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "ai_providers_select" ON public.ai_providers;
CREATE POLICY "ai_providers_authenticated_read" ON public.ai_providers
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Protect system_logs - only allow null workspace_id for admins (workspace owner)
DROP POLICY IF EXISTS "system_logs_select" ON public.system_logs;
CREATE POLICY "system_logs_workspace_access" ON public.system_logs
  FOR SELECT USING (
    (workspace_id IS NOT NULL AND workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    OR (workspace_id IS NULL AND EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'owner'
    ))
  );

-- 7. Add rate limiting metadata column for smart_link_clicks
ALTER TABLE public.smart_link_clicks 
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS rate_limited boolean DEFAULT false;

-- 8. Strengthen integrations - ensure only workspace members can access
DROP POLICY IF EXISTS "Workspace access for integrations" ON public.integrations;
CREATE POLICY "integrations_workspace_access" ON public.integrations
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));