-- Create RPC functions for quota management (bypasses type issues in edge functions)

-- Get workspace quota
CREATE OR REPLACE FUNCTION public.get_workspace_quota(p_workspace_id UUID)
RETURNS TABLE (
  plan_tier TEXT,
  requests_this_minute INTEGER,
  concurrent_runs INTEGER,
  monthly_ai_spent NUMERIC,
  monthly_ai_budget NUMERIC,
  last_request_at TIMESTAMP WITH TIME ZONE,
  current_period_start DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset monthly counters if needed
  UPDATE workspace_quotas
  SET monthly_ai_spent = 0,
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
    q.monthly_ai_spent,
    q.monthly_ai_budget,
    q.last_request_at,
    q.current_period_start
  FROM workspace_quotas q
  WHERE q.workspace_id = p_workspace_id;
END;
$$;

-- Update workspace quota (increment requests, concurrent, add cost)
CREATE OR REPLACE FUNCTION public.update_workspace_quota(
  p_workspace_id UUID,
  p_increment_requests BOOLEAN DEFAULT FALSE,
  p_increment_concurrent BOOLEAN DEFAULT FALSE,
  p_decrement_concurrent BOOLEAN DEFAULT FALSE,
  p_add_cost NUMERIC DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_should_reset_minute BOOLEAN;
BEGIN
  -- Check if minute counter should be reset (>60s since last request)
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
    monthly_ai_spent = CASE 
      WHEN p_add_cost IS NOT NULL THEN monthly_ai_spent + p_add_cost
      ELSE monthly_ai_spent
    END,
    last_request_at = CASE 
      WHEN p_increment_requests THEN v_now
      ELSE last_request_at
    END,
    updated_at = v_now
  WHERE workspace_id = p_workspace_id;
  
  -- If no row updated, try to insert (workspace without quota yet)
  IF NOT FOUND THEN
    INSERT INTO workspace_quotas (
      workspace_id,
      requests_this_minute,
      concurrent_runs,
      monthly_ai_spent,
      last_request_at
    ) VALUES (
      p_workspace_id,
      CASE WHEN p_increment_requests THEN 1 ELSE 0 END,
      CASE WHEN p_increment_concurrent THEN 1 ELSE 0 END,
      COALESCE(p_add_cost, 0),
      CASE WHEN p_increment_requests THEN v_now ELSE NULL END
    )
    ON CONFLICT (workspace_id) DO NOTHING;
  END IF;
END;
$$;