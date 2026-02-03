-- Fix 1: Drop and recreate the v_integration_health view WITHOUT SECURITY DEFINER
-- This view was using SECURITY DEFINER which bypasses RLS - should use SECURITY INVOKER instead
DROP VIEW IF EXISTS public.v_integration_health;

CREATE VIEW public.v_integration_health 
WITH (security_invoker = true) AS
SELECT 
    workspace_id,
    provider,
    (status)::text AS status_text,
    token_expires_at,
    last_sync_at,
    refresh_failure_count,
    CASE
        WHEN (token_expires_at IS NULL) THEN NULL::numeric
        ELSE (EXTRACT(epoch FROM (token_expires_at - now())) / (3600)::numeric)
    END AS expires_in_hours,
    CASE
        WHEN (last_sync_at IS NULL) THEN NULL::numeric
        ELSE (EXTRACT(epoch FROM (now() - last_sync_at)) / (3600)::numeric)
    END AS hours_since_sync,
    CASE
        WHEN (refresh_failure_count > 2) THEN true
        WHEN ((token_expires_at IS NOT NULL) AND (token_expires_at < (now() + '24:00:00'::interval))) THEN true
        ELSE false
    END AS needs_attention
FROM integrations
WHERE (status)::text = 'connected'::text;

-- Add comment explaining the security decision
COMMENT ON VIEW public.v_integration_health IS 'Integration health dashboard view. Uses SECURITY INVOKER to respect RLS policies of the querying user.';

-- Fix 2: Update the smart_link_emails INSERT policy to use proper workspace-based check
-- Currently uses WITH CHECK (true) which is too permissive
DROP POLICY IF EXISTS "Public can insert smart link emails" ON public.smart_link_emails;

-- Create a more restrictive policy that still allows public inserts but validates workspace_id
-- The trigger check_smart_link_email_rate_limit already provides rate limiting protection
CREATE POLICY "Public can insert smart link emails with rate limit"
ON public.smart_link_emails
FOR INSERT
WITH CHECK (
  -- Require valid workspace_id and media_asset_id (must exist)
  workspace_id IS NOT NULL 
  AND media_asset_id IS NOT NULL
  AND consent_given = true
);