-- Complete remaining security hardening policies

-- 15. notifications: Add role-based filtering for sensitive categories
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their own or workspace notifications"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR (
        user_id IS NULL 
        AND has_workspace_access(auth.uid(), workspace_id)
        AND (
          category NOT IN ('security', 'billing', 'compliance')
          OR has_permission(auth.uid(), workspace_id, 'manage_billing')
          OR is_workspace_owner(auth.uid(), workspace_id)
        )
      )
    )
  );

-- 16. creative_jobs: Restrict pending jobs to approvers only (fixed - no requested_by column)
DROP POLICY IF EXISTS "Workspace members can view creative jobs" ON public.creative_jobs;
CREATE POLICY "Workspace members can view creative jobs with approval control"
  ON public.creative_jobs
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND has_workspace_access(auth.uid(), workspace_id)
    AND (
      status IN ('done', 'published', 'rendering', 'qa_pass')
      OR has_permission(auth.uid(), workspace_id, 'approve_actions')
      OR is_workspace_owner(auth.uid(), workspace_id)
    )
  );