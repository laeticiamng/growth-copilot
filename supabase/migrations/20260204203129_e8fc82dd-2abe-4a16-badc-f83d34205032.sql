-- ============================================================================
-- Security Hardening Migration Part 2 - Fix remaining policies
-- ============================================================================

-- Drop duplicate policies that caused previous failure
DROP POLICY IF EXISTS "leads_workspace_insert" ON public.leads;
DROP POLICY IF EXISTS "deals_workspace_insert" ON public.deals;

-- Re-create leads insert policy
CREATE POLICY "leads_workspace_insert"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
);

-- Re-create deals insert policy  
CREATE POLICY "deals_workspace_insert"
ON public.deals
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
);

-- 5. contracts - Consolidate to billing/owner only
DROP POLICY IF EXISTS "contracts_workspace_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_admin_select" ON public.contracts;
DROP POLICY IF EXISTS "Workspace members can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "contracts_admin_only_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_restricted_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_owner_select" ON public.contracts;

CREATE POLICY "contracts_billing_owner_select"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  public.has_permission(auth.uid(), workspace_id, 'manage_billing')
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 6. meta_conversations - Consolidate for assigned reps only
DROP POLICY IF EXISTS "meta_conversations_workspace_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "Workspace members can view conversations" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_restricted_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_assigned_select" ON public.meta_conversations;

CREATE POLICY "meta_conversations_assigned_select"
ON public.meta_conversations
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
);

-- 7. meta_messages - Consolidate for conversation participants only
DROP POLICY IF EXISTS "meta_messages_workspace_select" ON public.meta_messages;
DROP POLICY IF EXISTS "Workspace members can view messages" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_restricted_select" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_conversation_select" ON public.meta_messages;

CREATE POLICY "meta_messages_conversation_select"
ON public.meta_messages
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
);

-- 8. reviews - Restrict to reputation managers
DROP POLICY IF EXISTS "reviews_workspace_select" ON public.reviews;
DROP POLICY IF EXISTS "Workspace members can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_reputation_manager_select" ON public.reviews;

CREATE POLICY "reviews_reputation_manager_select"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
);

-- 9. ai_requests - Restrict to owners/billing managers
DROP POLICY IF EXISTS "ai_requests_workspace_select" ON public.ai_requests;
DROP POLICY IF EXISTS "Workspace members can view AI requests" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_restricted_select" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_billing_only_select" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_owner_billing_select" ON public.ai_requests;

CREATE POLICY "ai_requests_owner_billing_select"
ON public.ai_requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_permission(auth.uid(), workspace_id, 'manage_billing')
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 10. kpis_daily - Restrict to analytics permission
DROP POLICY IF EXISTS "kpis_daily_workspace_select" ON public.kpis_daily;
DROP POLICY IF EXISTS "Workspace members can view KPIs" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_analytics_select" ON public.kpis_daily;

CREATE POLICY "kpis_daily_analytics_select"
ON public.kpis_daily
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
);

-- 11. approval_queue - Restrict to approvers and creators
DROP POLICY IF EXISTS "approval_queue_workspace_select" ON public.approval_queue;
DROP POLICY IF EXISTS "Workspace members can view approvals" ON public.approval_queue;
DROP POLICY IF EXISTS "approval_queue_member_select" ON public.approval_queue;

CREATE POLICY "approval_queue_member_select"
ON public.approval_queue
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
);

-- 12. creative_jobs - Restrict to creators and approvers
DROP POLICY IF EXISTS "creative_jobs_workspace_select" ON public.creative_jobs;
DROP POLICY IF EXISTS "Workspace members can view creative jobs" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_member_select" ON public.creative_jobs;

CREATE POLICY "creative_jobs_member_select"
ON public.creative_jobs
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
);