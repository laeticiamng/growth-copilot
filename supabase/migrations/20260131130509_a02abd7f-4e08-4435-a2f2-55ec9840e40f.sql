-- Drop existing functions to change signatures
DROP FUNCTION IF EXISTS public.get_workspace_quota(uuid);
DROP FUNCTION IF EXISTS public.update_workspace_quota(uuid, boolean, boolean, boolean, numeric);

-- Update workspace_quotas to track tokens instead of cost
ALTER TABLE workspace_quotas 
  DROP COLUMN IF EXISTS monthly_ai_spent,
  DROP COLUMN IF EXISTS monthly_ai_budget,
  ADD COLUMN IF NOT EXISTS monthly_tokens_used bigint DEFAULT 0;

-- Recreate get_workspace_quota with token-based return
CREATE OR REPLACE FUNCTION public.get_workspace_quota(p_workspace_id uuid)
RETURNS TABLE(
  plan_tier text,
  requests_this_minute integer,
  concurrent_runs integer,
  monthly_tokens_used bigint,
  last_request_at timestamp with time zone,
  current_period_start date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset monthly counters if new month
  UPDATE workspace_quotas
  SET monthly_tokens_used = 0,
      current_period_start = CURRENT_DATE,
      crawls_today = 0
  WHERE workspace_id = p_workspace_id
    AND (EXTRACT(MONTH FROM current_period_start) != EXTRACT(MONTH FROM CURRENT_DATE)
         OR EXTRACT(YEAR FROM current_period_start) != EXTRACT(YEAR FROM CURRENT_DATE));

  RETURN QUERY
  SELECT 
    q.plan_tier,
    q.requests_this_minute,
    q.concurrent_runs,
    q.monthly_tokens_used,
    q.last_request_at,
    q.current_period_start
  FROM workspace_quotas q
  WHERE q.workspace_id = p_workspace_id;
END;
$$;

-- Recreate update_workspace_quota with token tracking
CREATE OR REPLACE FUNCTION public.update_workspace_quota(
  p_workspace_id uuid,
  p_increment_requests boolean DEFAULT false,
  p_increment_concurrent boolean DEFAULT false,
  p_decrement_concurrent boolean DEFAULT false,
  p_add_tokens bigint DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_should_reset_minute BOOLEAN;
BEGIN
  -- Check if minute counter should be reset
  SELECT (last_request_at IS NULL OR v_now - last_request_at > INTERVAL '60 seconds')
  INTO v_should_reset_minute
  FROM workspace_quotas
  WHERE workspace_id = p_workspace_id;

  UPDATE workspace_quotas
  SET
    requests_this_minute = CASE 
      WHEN p_increment_requests AND v_should_reset_minute THEN 1
      WHEN p_increment_requests THEN requests_this_minute + 1
      ELSE requests_this_minute
    END,
    concurrent_runs = CASE 
      WHEN p_increment_concurrent THEN concurrent_runs + 1
      WHEN p_decrement_concurrent THEN GREATEST(0, concurrent_runs - 1)
      ELSE concurrent_runs
    END,
    monthly_tokens_used = CASE 
      WHEN p_add_tokens IS NOT NULL THEN COALESCE(monthly_tokens_used, 0) + p_add_tokens
      ELSE monthly_tokens_used
    END,
    last_request_at = CASE 
      WHEN p_increment_requests THEN v_now
      ELSE last_request_at
    END,
    updated_at = v_now
  WHERE workspace_id = p_workspace_id;
  
  IF NOT FOUND THEN
    INSERT INTO workspace_quotas (
      workspace_id,
      requests_this_minute,
      concurrent_runs,
      monthly_tokens_used,
      last_request_at
    ) VALUES (
      p_workspace_id,
      CASE WHEN p_increment_requests THEN 1 ELSE 0 END,
      CASE WHEN p_increment_concurrent THEN 1 ELSE 0 END,
      COALESCE(p_add_tokens, 0),
      CASE WHEN p_increment_requests THEN v_now ELSE NULL END
    )
    ON CONFLICT (workspace_id) DO NOTHING;
  END IF;
END;
$$;