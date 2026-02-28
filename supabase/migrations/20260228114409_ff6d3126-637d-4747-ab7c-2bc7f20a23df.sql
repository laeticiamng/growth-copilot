
-- Drop ALL existing policies on oauth_tokens to eliminate redundancy
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'oauth_tokens' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.oauth_tokens', pol.policyname);
  END LOOP;
END;
$$;

-- Create 4 clean policies based on is_workspace_owner via integrations join
CREATE POLICY "oauth_tokens_select"
  ON public.oauth_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = oauth_tokens.integration_id
        AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

CREATE POLICY "oauth_tokens_insert"
  ON public.oauth_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = oauth_tokens.integration_id
        AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

CREATE POLICY "oauth_tokens_update"
  ON public.oauth_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = oauth_tokens.integration_id
        AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

CREATE POLICY "oauth_tokens_delete"
  ON public.oauth_tokens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      WHERE i.id = oauth_tokens.integration_id
        AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );
