-- Security Hardening Step 3b: Meta tables fix

-- meta_conversations: Customer service only
DROP POLICY IF EXISTS "Users can view meta conversations" ON public.meta_conversations;
CREATE POLICY "Customer service can view conversations"
ON public.meta_conversations FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- meta_messages: Based on workspace access via conversation
DROP POLICY IF EXISTS "Users can view meta messages" ON public.meta_messages;
CREATE POLICY "Customer service can view messages"
ON public.meta_messages FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- integration_tokens: Owners only  
DROP POLICY IF EXISTS "Users can view integration tokens" ON public.integration_tokens;
CREATE POLICY "Owners can view integration tokens"
ON public.integration_tokens FOR SELECT
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- notifications: Users see only their own
DROP POLICY IF EXISTS "Users can view notifications in their workspace" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    user_id IS NULL 
    AND public.has_workspace_access(auth.uid(), workspace_id)
  )
);

-- ai_requests: Own requests + owners
DROP POLICY IF EXISTS "Users can view AI requests" ON public.ai_requests;
CREATE POLICY "Owners and admins can view AI requests"
ON public.ai_requests FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    user_id = auth.uid()
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);