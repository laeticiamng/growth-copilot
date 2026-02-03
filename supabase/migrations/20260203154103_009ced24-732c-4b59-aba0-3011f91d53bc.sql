-- ===========================================
-- INTEGRATION HEALTH SUMMARY VIEW (Fixed)
-- ===========================================

CREATE OR REPLACE VIEW public.v_integration_health AS
SELECT
  i.workspace_id,
  i.provider,
  i.status::TEXT as status_text,
  i.token_expires_at,
  i.last_sync_at,
  i.refresh_failure_count,
  CASE 
    WHEN i.token_expires_at IS NULL THEN NULL
    ELSE EXTRACT(EPOCH FROM (i.token_expires_at - NOW())) / 3600
  END AS expires_in_hours,
  CASE 
    WHEN i.last_sync_at IS NULL THEN NULL
    ELSE EXTRACT(EPOCH FROM (NOW() - i.last_sync_at)) / 3600
  END AS hours_since_sync,
  CASE
    WHEN i.refresh_failure_count > 2 THEN true
    WHEN i.token_expires_at IS NOT NULL AND i.token_expires_at < NOW() + INTERVAL '24 hours' THEN true
    ELSE false
  END AS needs_attention
FROM public.integrations i
WHERE i.status::TEXT = 'connected';

-- Grant access to views
GRANT SELECT ON public.v_integration_health TO authenticated;