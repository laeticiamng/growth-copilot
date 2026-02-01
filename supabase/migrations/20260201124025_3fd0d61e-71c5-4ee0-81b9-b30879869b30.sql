-- Fix ambiguous column reference in get_workspace_quota function
CREATE OR REPLACE FUNCTION public.get_workspace_quota(p_workspace_id uuid)
 RETURNS TABLE(plan_tier text, requests_this_minute integer, concurrent_runs integer, monthly_tokens_used bigint, last_request_at timestamp with time zone, current_period_start date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Reset monthly counters if new month
  UPDATE workspace_quotas wq
  SET monthly_tokens_used = 0,
      current_period_start = CURRENT_DATE,
      crawls_today = 0
  WHERE wq.workspace_id = p_workspace_id
    AND (EXTRACT(MONTH FROM wq.current_period_start) != EXTRACT(MONTH FROM CURRENT_DATE)
         OR EXTRACT(YEAR FROM wq.current_period_start) != EXTRACT(YEAR FROM CURRENT_DATE));

  RETURN QUERY
  SELECT 
    wq.plan_tier,
    wq.requests_this_minute,
    wq.concurrent_runs,
    wq.monthly_tokens_used,
    wq.last_request_at,
    wq.current_period_start
  FROM workspace_quotas wq
  WHERE wq.workspace_id = p_workspace_id;
END;
$function$;