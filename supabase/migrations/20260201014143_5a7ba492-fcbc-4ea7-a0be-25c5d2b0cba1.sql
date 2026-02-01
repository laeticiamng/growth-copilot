-- Security improvements - corrected version
-- oauth_tokens links to workspace via integrations table

-- 1. Restrict oauth_tokens to workspace owners via integrations join
DROP POLICY IF EXISTS "oauth_tokens_workspace_access" ON public.oauth_tokens;

CREATE POLICY "oauth_tokens_owner_only" 
ON public.oauth_tokens 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.integrations i
    JOIN public.workspaces w ON w.id = i.workspace_id
    WHERE i.id = oauth_tokens.integration_id 
    AND w.owner_id = auth.uid()
  )
);

-- 2. Add rate limiting for smart_link_emails
CREATE OR REPLACE FUNCTION public.check_smart_link_email_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count emails from same address in last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.smart_link_emails
  WHERE created_at > NOW() - INTERVAL '1 hour'
  AND email = NEW.email;
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded for email submissions';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS smart_link_email_rate_limit ON public.smart_link_emails;

CREATE TRIGGER smart_link_email_rate_limit
BEFORE INSERT ON public.smart_link_emails
FOR EACH ROW
EXECUTE FUNCTION public.check_smart_link_email_rate_limit();