-- =====================================================
-- SECURITY FIX: RLS policies for tables WITH workspace_id
-- =====================================================

-- 1. user_roles - restrict to own + workspace members
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Workspace members can view roles" ON public.user_roles;
CREATE POLICY "Users can view workspace roles" ON public.user_roles
  FOR SELECT USING (
    user_id = auth.uid() 
    OR public.has_workspace_access(auth.uid(), workspace_id)
  );

-- 2. leads - full RLS for workspace members
DROP POLICY IF EXISTS "Workspace members can view leads" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can update leads" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can delete leads" ON public.leads;
CREATE POLICY "Leads workspace access" ON public.leads
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 3. review_requests - workspace members only
DROP POLICY IF EXISTS "Workspace members can manage review_requests" ON public.review_requests;
CREATE POLICY "review_requests workspace access" ON public.review_requests
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 4. smart_link_emails - public INSERT, SELECT restricted
DROP POLICY IF EXISTS "Anyone can submit smart link email" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Workspace members can view smart link emails" ON public.smart_link_emails;
CREATE POLICY "Public can insert smart link emails" ON public.smart_link_emails
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Workspace view smart link emails" ON public.smart_link_emails
  FOR SELECT USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 5. team_invitations - workspace + invited email
DROP POLICY IF EXISTS "Workspace members and invited can view invitations" ON public.team_invitations;
CREATE POLICY "View team invitations" ON public.team_invitations
  FOR SELECT USING (
    public.has_workspace_access(auth.uid(), workspace_id)
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 6. workspaces - owner or member access
DROP POLICY IF EXISTS "Users can view their workspaces" ON public.workspaces;
CREATE POLICY "View own workspaces" ON public.workspaces
  FOR SELECT USING (public.has_workspace_access(auth.uid(), id) OR owner_id = auth.uid());

-- 7. integration_tokens - workspace members only
DROP POLICY IF EXISTS "Workspace members can view integration_tokens" ON public.integration_tokens;
DROP POLICY IF EXISTS "Workspace members can manage integration_tokens" ON public.integration_tokens;
CREATE POLICY "integration_tokens workspace access" ON public.integration_tokens
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 8. meta tables - workspace access
DROP POLICY IF EXISTS "Workspace members can manage meta_capi_events" ON public.meta_capi_events;
CREATE POLICY "meta_capi_events access" ON public.meta_capi_events
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage meta_conversations" ON public.meta_conversations;
CREATE POLICY "meta_conversations access" ON public.meta_conversations
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage meta_ads" ON public.meta_ads;
CREATE POLICY "meta_ads access" ON public.meta_ads
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage meta_adsets" ON public.meta_adsets;
CREATE POLICY "meta_adsets access" ON public.meta_adsets
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage meta_campaigns" ON public.meta_campaigns;
CREATE POLICY "meta_campaigns access" ON public.meta_campaigns
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage meta_ad_accounts" ON public.meta_ad_accounts;
CREATE POLICY "meta_ad_accounts access" ON public.meta_ad_accounts
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage meta_ig_accounts" ON public.meta_ig_accounts;
CREATE POLICY "meta_ig_accounts access" ON public.meta_ig_accounts
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 9. activities + deals - workspace access
DROP POLICY IF EXISTS "Workspace members can manage activities" ON public.activities;
CREATE POLICY "activities workspace access" ON public.activities
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage deals" ON public.deals;
CREATE POLICY "deals workspace access" ON public.deals
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 10. notifications - user + workspace access
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "notifications view access" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid() 
    OR public.has_workspace_access(auth.uid(), workspace_id)
  );
CREATE POLICY "notifications update access" ON public.notifications
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR public.has_workspace_access(auth.uid(), workspace_id)
  );

-- 11. gbp tables - workspace access
DROP POLICY IF EXISTS "Workspace members can manage gbp_posts" ON public.gbp_posts;
CREATE POLICY "gbp_posts access" ON public.gbp_posts
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage gbp_profiles" ON public.gbp_profiles;
CREATE POLICY "gbp_profiles access" ON public.gbp_profiles
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 12. oauth_tokens - via integration_id join (no workspace_id)
DROP POLICY IF EXISTS "Block all oauth_tokens access" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Workspace admins can manage oauth_tokens" ON public.oauth_tokens;
CREATE POLICY "oauth_tokens via integration access" ON public.oauth_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.integrations i 
      WHERE i.id = oauth_tokens.integration_id 
      AND public.has_workspace_access(auth.uid(), i.workspace_id)
    )
  );