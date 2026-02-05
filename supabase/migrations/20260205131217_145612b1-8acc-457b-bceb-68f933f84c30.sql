-- Drop the overly permissive INSERT policy and replace with a more restrictive one
-- Note: INSERT from edge functions uses service role which bypasses RLS
-- But we add a policy for authenticated users with workspace access
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_log;

-- Allow insert only for users who are members of the workspace
CREATE POLICY "Workspace members can insert email logs"
ON public.email_log
FOR INSERT
WITH CHECK (
  workspace_id IS NULL OR 
  public.is_workspace_member(auth.uid(), workspace_id)
);