
-- Add missing SELECT policy for employees table
-- Only HR personnel and the employee themselves can view records
CREATE POLICY "employees_select_hr_or_self"
ON public.employees
FOR SELECT
TO authenticated
USING (
  has_hr_access(auth.uid(), workspace_id)
  OR (user_id = auth.uid())
  OR is_workspace_owner(auth.uid(), workspace_id)
);

-- Fix policies using {public} role on sensitive tables - change to {authenticated}
-- employees write policies are already authenticated, good

-- Fix performance_reviews SELECT: currently on {public}, should be {authenticated}
DROP POLICY IF EXISTS "perf_reviews_strict_access" ON public.performance_reviews;
CREATE POLICY "perf_reviews_strict_access"
ON public.performance_reviews
FOR SELECT
TO authenticated
USING (
  (auth.uid() = employee_id)
  OR (auth.uid() = reviewer_id)
  OR has_hr_access(auth.uid(), workspace_id)
);

-- Fix time_off_requests: drop {public} SELECT policies, keep {authenticated} ones
DROP POLICY IF EXISTS "time_off_employee_hr_only" ON public.time_off_requests;

-- Fix oauth_tokens SELECT: currently on {public}, should be {authenticated}
DROP POLICY IF EXISTS "oauth_tokens_select" ON public.oauth_tokens;
CREATE POLICY "oauth_tokens_select"
ON public.oauth_tokens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM integrations i
    WHERE i.id = oauth_tokens.integration_id
    AND is_workspace_owner(auth.uid(), i.workspace_id)
  )
);

-- Fix workspaces: drop {public} SELECT policies, keep {authenticated} ones
DROP POLICY IF EXISTS "View own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_member_read_non_sensitive" ON public.workspaces;
