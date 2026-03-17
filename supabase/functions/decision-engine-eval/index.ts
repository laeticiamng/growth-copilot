import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Decision Engine Evaluation — Evaluates rules against signal data.
 * Generates recommendations or auto-executes actions.
 */

interface DecisionCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'between';
  threshold: number;
  threshold_upper?: number;
  time_window_hours: number;
  min_sample_size: number;
}

function evaluateCondition(condition: DecisionCondition, value: number): boolean {
  switch (condition.operator) {
    case 'gt': return value > condition.threshold;
    case 'lt': return value < condition.threshold;
    case 'gte': return value >= condition.threshold;
    case 'lte': return value <= condition.threshold;
    case 'eq': return Math.abs(value - condition.threshold) < 0.001;
    case 'between': return value >= condition.threshold && value <= (condition.threshold_upper ?? Infinity);
    default: return false;
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id } = await req.json();

    if (!launch_project_id || !workspace_id) {
      return new Response(
        JSON.stringify({ error: 'launch_project_id and workspace_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch active rules
    const { data: rules } = await supabase
      .from('launch_decision_rules')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ success: true, actions: [], message: 'No active rules' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recent signal events
    const maxWindow = Math.max(...rules.map((r: { condition: DecisionCondition }) => r.condition.time_window_hours || 72));
    const cutoff = new Date(Date.now() - maxWindow * 3600 * 1000).toISOString();

    const { data: events } = await supabase
      .from('launch_signal_events')
      .select('*')
      .eq('launch_project_id', launch_project_id)
      .gte('created_at', cutoff);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ success: true, actions: [], message: 'No signal data yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compute metrics from events
    const metrics = new Map<string, { value: number; sampleSize: number }>();

    const impressions = events.filter((e: { event_type: string }) => e.event_type === 'impression').length;
    const clicks = events.filter((e: { event_type: string }) => e.event_type === 'click').length;
    const views = events.filter((e: { event_type: string }) => e.event_type === 'view').length;
    const watch3s = events.filter((e: { event_type: string }) => e.event_type === 'watch_3s').length;

    if (impressions > 0) {
      metrics.set('creative_ctr', { value: (clicks / impressions) * 100, sampleSize: impressions });
    }
    if (views > 0) {
      metrics.set('hook_retention_3s', { value: (watch3s / views) * 100, sampleSize: views });
    }

    // Evaluate rules
    const triggeredActions: Array<Record<string, unknown>> = [];

    for (const rule of rules) {
      const condition = rule.condition as DecisionCondition;
      const metric = metrics.get(condition.metric);
      if (!metric) continue;
      if (metric.sampleSize < condition.min_sample_size) continue;

      if (evaluateCondition(condition, metric.value)) {
        triggeredActions.push({
          launch_project_id,
          rule_id: rule.id,
          action: rule.action,
          reason: `${rule.name}: ${condition.metric} is ${metric.value.toFixed(1)} (threshold: ${condition.threshold})`,
          context: { metric_value: metric.value, threshold: condition.threshold, sample_size: metric.sampleSize },
          status: rule.is_auto_execute ? 'executed' : 'recommended',
          executed_at: rule.is_auto_execute ? new Date().toISOString() : null,
        });
      }
    }

    // Save actions
    let savedActions: unknown[] = [];
    if (triggeredActions.length > 0) {
      const { data, error } = await supabase
        .from('launch_decision_actions')
        .insert(triggeredActions)
        .select();

      if (error) console.error('Failed to save actions:', error);
      else savedActions = data || [];
    }

    // Log
    await supabase.from('action_log').insert({
      workspace_id,
      actor_type: 'agent',
      actor_id: 'decision_engine',
      action_type: 'decisions_evaluated',
      action_category: 'launch_os',
      entity_type: 'launch_project',
      entity_id: launch_project_id,
      description: `Evaluated ${rules.length} rules, triggered ${triggeredActions.length} actions`,
      is_automated: true,
      details: { rules_evaluated: rules.length, actions_triggered: triggeredActions.length },
    });

    return new Response(
      JSON.stringify({ success: true, actions: savedActions, evaluated: rules.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Decision engine error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
