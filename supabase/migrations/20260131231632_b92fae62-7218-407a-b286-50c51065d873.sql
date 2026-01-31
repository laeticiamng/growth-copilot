-- V2 ADD-ONS PART 3: Helper Functions
-- =============================================

-- Log token audit event
CREATE OR REPLACE FUNCTION public.log_token_audit(
    _workspace_id UUID,
    _integration_id UUID,
    _provider TEXT,
    _action TEXT,
    _scopes JSONB DEFAULT '[]',
    _error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _audit_id UUID;
BEGIN
    INSERT INTO public.integration_token_audit (workspace_id, integration_id, provider, action, scopes, error_message)
    VALUES (_workspace_id, _integration_id, _provider, _action, _scopes, _error_message)
    RETURNING id INTO _audit_id;
    
    IF _action = 'auth_failure' AND _integration_id IS NOT NULL THEN
        UPDATE public.integrations
        SET refresh_failure_count = refresh_failure_count + 1,
            last_auth_failure_at = NOW()
        WHERE id = _integration_id;
    END IF;
    
    RETURN _audit_id;
END;
$$;

-- Check claim against guardrails
CREATE OR REPLACE FUNCTION public.check_claim_guardrail(
    _workspace_id UUID,
    _claim TEXT,
    _has_evidence BOOLEAN DEFAULT false,
    _evidence_source TEXT DEFAULT NULL
)
RETURNS TABLE(allowed BOOLEAN, requires_rewrite BOOLEAN, reason TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _has_absolute_claim BOOLEAN;
    _has_numeric_claim BOOLEAN;
BEGIN
    _has_absolute_claim := _claim ~* '\m(meilleur|unique|seul|garanti|100%|parfait|miracle|révolutionnaire)\M';
    _has_numeric_claim := _claim ~ '\d+\s*(%|€|euros?|fois|x\d)';
    
    IF _has_absolute_claim AND NOT _has_evidence THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            true::BOOLEAN,
            'Les claims absolus (meilleur, unique, garanti) nécessitent une source vérifiable'::TEXT;
        RETURN;
    END IF;
    
    IF _has_numeric_claim AND NOT _has_evidence THEN
        RETURN QUERY SELECT
            false::BOOLEAN,
            true::BOOLEAN,
            'Les claims chiffrés nécessitent une source (étude, statistique officielle)'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT true::BOOLEAN, false::BOOLEAN, NULL::TEXT;
END;
$$;

-- Get applicable policy profile
CREATE OR REPLACE FUNCTION public.get_policy_profile(
    _workspace_id UUID,
    _platform TEXT DEFAULT NULL,
    _industry TEXT DEFAULT NULL
)
RETURNS SETOF public.policy_profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.policy_profiles
    WHERE (workspace_id = _workspace_id OR is_system_preset = true)
      AND (platform = _platform OR platform IS NULL)
      AND (industry = _industry OR industry IS NULL)
    ORDER BY 
        CASE WHEN workspace_id IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN platform IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN industry IS NOT NULL THEN 0 ELSE 1 END
    LIMIT 1;
$$;

-- Compute daily ops metrics for a workspace
CREATE OR REPLACE FUNCTION public.compute_ops_metrics(
    _workspace_id UUID,
    _date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _agent_total INTEGER;
    _agent_success INTEGER;
    _agent_failed INTEGER;
    _agent_avg_ms INTEGER;
    _creative_total INTEGER;
    _creative_done INTEGER;
    _creative_manual INTEGER;
    _total_cost NUMERIC;
    _render_cost NUMERIC;
    _ai_cost NUMERIC;
BEGIN
    -- Agent metrics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'failed'),
        AVG(duration_ms)::INTEGER
    INTO _agent_total, _agent_success, _agent_failed, _agent_avg_ms
    FROM agent_runs
    WHERE workspace_id = _workspace_id
      AND created_at::DATE = _date;
    
    -- Creative job metrics
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'done'),
        COUNT(*) FILTER (WHERE status = 'needs_manual_review')
    INTO _creative_total, _creative_done, _creative_manual
    FROM creative_jobs
    WHERE workspace_id = _workspace_id
      AND created_at::DATE = _date;
    
    -- Cost estimates
    SELECT COALESCE(SUM(cost_estimate), 0)
    INTO _render_cost
    FROM creative_jobs
    WHERE workspace_id = _workspace_id
      AND created_at::DATE = _date;
    
    SELECT COALESCE(SUM(cost_estimate), 0)
    INTO _ai_cost
    FROM ai_requests
    WHERE workspace_id = _workspace_id
      AND created_at::DATE = _date;
    
    _total_cost := COALESCE(_render_cost, 0) + COALESCE(_ai_cost, 0);
    
    -- Upsert metrics
    INSERT INTO ops_metrics_daily (
        workspace_id, date,
        agent_runs_total, agent_runs_success, agent_runs_failed, agent_avg_duration_ms,
        creative_jobs_total, creative_jobs_completed, creative_jobs_manual_review,
        total_cost_usd, render_cost_usd, ai_cost_usd
    ) VALUES (
        _workspace_id, _date,
        COALESCE(_agent_total, 0), COALESCE(_agent_success, 0), COALESCE(_agent_failed, 0), _agent_avg_ms,
        COALESCE(_creative_total, 0), COALESCE(_creative_done, 0), COALESCE(_creative_manual, 0),
        _total_cost, COALESCE(_render_cost, 0), COALESCE(_ai_cost, 0)
    )
    ON CONFLICT (workspace_id, date)
    DO UPDATE SET
        agent_runs_total = EXCLUDED.agent_runs_total,
        agent_runs_success = EXCLUDED.agent_runs_success,
        agent_runs_failed = EXCLUDED.agent_runs_failed,
        agent_avg_duration_ms = EXCLUDED.agent_avg_duration_ms,
        creative_jobs_total = EXCLUDED.creative_jobs_total,
        creative_jobs_completed = EXCLUDED.creative_jobs_completed,
        creative_jobs_manual_review = EXCLUDED.creative_jobs_manual_review,
        total_cost_usd = EXCLUDED.total_cost_usd,
        render_cost_usd = EXCLUDED.render_cost_usd,
        ai_cost_usd = EXCLUDED.ai_cost_usd;
END;
$$;

-- Insert system policy presets if they don't exist
INSERT INTO public.policy_profiles (name, platform, industry, is_system_preset, policy_rules, warnings, required_approvals) 
SELECT 'Meta Ads - Standard', 'meta', NULL, true, 
 '{"require_safe_zones": true, "max_text_ratio": 0.20, "require_subtitles": true}'::jsonb,
 '["No claims without evidence", "Avoid discriminatory targeting"]'::jsonb,
 '["video_publish", "audience_change"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM policy_profiles WHERE name = 'Meta Ads - Standard' AND is_system_preset = true);

INSERT INTO public.policy_profiles (name, platform, industry, is_system_preset, policy_rules, warnings, required_approvals)
SELECT 'Google Ads - Standard', 'google', NULL, true,
 '{"require_landing_page": true, "max_headline_length": 30, "max_description_length": 90}'::jsonb,
 '["Trademark restrictions apply", "Limited healthcare targeting"]'::jsonb,
 '["keyword_change", "budget_change"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM policy_profiles WHERE name = 'Google Ads - Standard' AND is_system_preset = true);

INSERT INTO public.policy_profiles (name, platform, industry, is_system_preset, policy_rules, warnings, required_approvals)
SELECT 'Healthcare - Strict', NULL, 'healthcare', true,
 '{"require_evidence_source": true, "ban_absolute_claims": true, "require_disclaimer": true}'::jsonb,
 '["No cure/guarantee claims", "Requires ARPP validation", "Medical claims need source"]'::jsonb,
 '["any_publish", "any_claim"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM policy_profiles WHERE name = 'Healthcare - Strict' AND is_system_preset = true);

INSERT INTO public.policy_profiles (name, platform, industry, is_system_preset, policy_rules, warnings, required_approvals)
SELECT 'Finance - Regulated', NULL, 'finance', true,
 '{"require_risk_disclaimer": true, "ban_guaranteed_returns": true, "require_legal_review": true}'::jsonb,
 '["Past performance disclaimer required", "No guaranteed returns", "AMF compliance"]'::jsonb,
 '["any_publish", "any_claim", "any_targeting"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM policy_profiles WHERE name = 'Finance - Regulated' AND is_system_preset = true);