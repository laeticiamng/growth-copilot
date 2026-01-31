-- 1. Fix RLS for ai_requests: remove client INSERT, keep SELECT only for workspace members
-- Drop existing policies
DROP POLICY IF EXISTS "ai_requests_insert" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_select" ON public.ai_requests;

-- SELECT only for workspace members (read logs)
CREATE POLICY "ai_requests_select" ON public.ai_requests
FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- No INSERT/UPDATE/DELETE from client - service role only via edge functions
-- (RLS doesn't apply to service role, so no policy needed for inserts)

-- 2. Add workspace quotas table for rate limiting and budget caps
CREATE TABLE public.workspace_quotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'growth', 'agency')),
  -- Rate limits
  ai_requests_per_minute INTEGER NOT NULL DEFAULT 10,
  max_concurrent_runs INTEGER NOT NULL DEFAULT 2,
  -- Monthly budgets (in USD)
  monthly_ai_budget NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  monthly_ai_spent NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  -- Crawl limits
  max_pages_per_crawl INTEGER NOT NULL DEFAULT 100,
  max_crawls_per_day INTEGER NOT NULL DEFAULT 5,
  crawls_today INTEGER NOT NULL DEFAULT 0,
  -- Reset tracking
  current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  last_request_at TIMESTAMP WITH TIME ZONE,
  requests_this_minute INTEGER NOT NULL DEFAULT 0,
  concurrent_runs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspace_quotas ENABLE ROW LEVEL SECURITY;

-- Workspace members can view their quotas
CREATE POLICY "workspace_quotas_select" ON public.workspace_quotas
FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- Only owners can update quotas (for plan upgrades via admin)
CREATE POLICY "workspace_quotas_update" ON public.workspace_quotas
FOR UPDATE USING (is_workspace_owner(auth.uid(), workspace_id));

-- System can insert (via triggers)
CREATE POLICY "workspace_quotas_insert" ON public.workspace_quotas
FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- Create index for fast lookups
CREATE INDEX idx_workspace_quotas_workspace_id ON public.workspace_quotas(workspace_id);

-- Auto-create quotas for new workspaces
CREATE OR REPLACE FUNCTION public.handle_new_workspace_quotas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.workspace_quotas (workspace_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_workspace_created_quotas
AFTER INSERT ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_workspace_quotas();

-- Plan tier limits reference (stored in code, not DB, for flexibility)
COMMENT ON TABLE public.workspace_quotas IS 'Workspace rate limits and budget caps. Plan tiers: free (10 req/min, $5/mo), starter (30 req/min, $25/mo), growth (60 req/min, $100/mo), agency (120 req/min, $500/mo)';