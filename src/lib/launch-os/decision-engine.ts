import type {
  DecisionRule,
  DecisionCondition,
  DecisionAction,
  DecisionActionLog,
  SignalEvent,
} from './types';

/**
 * DecisionEngine — Evaluates rules against signal data and recommends or triggers actions.
 * All decisions are logged, auditable, and optionally require approval.
 */

interface MetricSnapshot {
  metric: string;
  value: number;
  sampleSize: number;
  timeWindowHours: number;
}

interface EvaluationResult {
  rule: DecisionRule;
  triggered: boolean;
  metricValue: number;
  threshold: number;
  recommendation: string;
}

/** Default decision rules templates */
export const DEFAULT_DECISION_RULES: Omit<DecisionRule, 'id' | 'workspace_id' | 'created_at'>[] = [
  {
    name: 'Pause underperforming creative',
    description: 'Pause creatives with CTR below 1% after sufficient impressions',
    condition: { metric: 'creative_ctr', operator: 'lt', threshold: 1.0, time_window_hours: 48, min_sample_size: 500 },
    action: 'pause_creative',
    action_config: {},
    is_auto_execute: false,
    is_active: true,
    priority: 1,
  },
  {
    name: 'Boost high-performing creative',
    description: 'Scale budget on creatives with CTR above 3%',
    condition: { metric: 'creative_ctr', operator: 'gt', threshold: 3.0, time_window_hours: 24, min_sample_size: 300 },
    action: 'boost_creative',
    action_config: { budget_multiplier: 1.5 },
    is_auto_execute: false,
    is_active: true,
    priority: 2,
  },
  {
    name: 'Switch hook on low retention',
    description: 'Recommend hook change when 3s retention drops below 30%',
    condition: { metric: 'hook_retention_3s', operator: 'lt', threshold: 30, time_window_hours: 72, min_sample_size: 200 },
    action: 'switch_hook',
    action_config: {},
    is_auto_execute: false,
    is_active: true,
    priority: 3,
  },
  {
    name: 'Retarget warm audience',
    description: 'Activate retargeting when engaged-but-not-converted pool exceeds 500',
    condition: { metric: 'warm_audience_size', operator: 'gt', threshold: 500, time_window_hours: 168, min_sample_size: 0 },
    action: 'retarget_warm',
    action_config: {},
    is_auto_execute: false,
    is_active: true,
    priority: 4,
  },
  {
    name: 'Reallocate budget from poor channel',
    description: 'Move budget when a channel CPA exceeds 3x target',
    condition: { metric: 'channel_cpa_ratio', operator: 'gt', threshold: 3.0, time_window_hours: 72, min_sample_size: 50 },
    action: 'reallocate_budget',
    action_config: { reallocation_pct: 50 },
    is_auto_execute: false,
    is_active: true,
    priority: 5,
  },
  {
    name: 'Change landing on high bounce',
    description: 'Recommend landing change when bounce rate exceeds 75%',
    condition: { metric: 'landing_bounce_rate', operator: 'gt', threshold: 75, time_window_hours: 48, min_sample_size: 100 },
    action: 'change_landing',
    action_config: {},
    is_auto_execute: false,
    is_active: true,
    priority: 6,
  },
  {
    name: 'Scale performing channel',
    description: 'Scale a channel when ROAS exceeds 3x and spend is under 50% of budget',
    condition: { metric: 'channel_roas', operator: 'gt', threshold: 3.0, time_window_hours: 72, min_sample_size: 30 },
    action: 'scale_channel',
    action_config: { scale_factor: 2 },
    is_auto_execute: false,
    is_active: true,
    priority: 7,
  },
];

const FLOAT_COMPARISON_EPSILON = 0.001;

export class DecisionEngine {
  private rules: DecisionRule[];

  constructor(rules: DecisionRule[]) {
    this.rules = rules.filter(r => r.is_active).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Evaluate all active rules against current metrics.
   * Returns triggered rules with recommendations.
   */
  evaluate(metrics: MetricSnapshot[]): EvaluationResult[] {
    if (metrics.length === 0) return [];

    const results: EvaluationResult[] = [];
    const metricMap = new Map(metrics.map(m => [m.metric, m]));

    for (const rule of this.rules) {
      const metric = metricMap.get(rule.condition.metric);
      if (!metric) continue;

      // Check minimum sample size
      if (metric.sampleSize < rule.condition.min_sample_size) continue;

      // Check time window
      if (metric.timeWindowHours > rule.condition.time_window_hours) continue;

      const triggered = this.evaluateCondition(rule.condition, metric.value);

      if (triggered) {
        results.push({
          rule,
          triggered: true,
          metricValue: metric.value,
          threshold: rule.condition.threshold,
          recommendation: this.buildRecommendation(rule, metric),
        });
      }
    }

    return results;
  }

  /**
   * Build action log entries from evaluation results.
   */
  buildActionLogs(
    results: EvaluationResult[],
    launchProjectId: string
  ): Omit<DecisionActionLog, 'id' | 'created_at'>[] {
    return results.map(r => ({
      launch_project_id: launchProjectId,
      rule_id: r.rule.id,
      action: r.rule.action,
      reason: r.recommendation,
      context: {
        metric_value: r.metricValue,
        threshold: r.threshold,
        condition: r.rule.condition,
      },
      status: r.rule.is_auto_execute ? 'executed' : 'recommended',
      approved_by: null,
      executed_at: r.rule.is_auto_execute ? new Date().toISOString() : null,
    }));
  }

  /**
   * Compute aggregate metrics from raw signal events.
   */
  static computeMetrics(events: SignalEvent[], timeWindowHours: number): MetricSnapshot[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindowHours * 3600 * 1000);
    const filtered = events.filter(e => new Date(e.created_at) >= cutoff);

    const impressions = filtered.filter(e => e.event_type === 'impression').length;
    const clicks = filtered.filter(e => e.event_type === 'click').length;
    const watch3s = filtered.filter(e => e.event_type === 'watch_3s').length;
    const views = filtered.filter(e => e.event_type === 'view').length;

    const metrics: MetricSnapshot[] = [];

    if (impressions > 0) {
      metrics.push({
        metric: 'creative_ctr',
        value: (clicks / impressions) * 100,
        sampleSize: impressions,
        timeWindowHours,
      });
    }

    if (views > 0) {
      metrics.push({
        metric: 'hook_retention_3s',
        value: (watch3s / views) * 100,
        sampleSize: views,
        timeWindowHours,
      });
    }

    // Add more computed metrics as needed
    return metrics;
  }

  private evaluateCondition(condition: DecisionCondition, value: number): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return Math.abs(value - condition.threshold) < FLOAT_COMPARISON_EPSILON;
      case 'between':
        return value >= condition.threshold && value <= (condition.threshold_upper ?? Infinity);
      default:
        return false;
    }
  }

  private buildRecommendation(rule: DecisionRule, metric: MetricSnapshot): string {
    const actionLabels: Record<DecisionAction, string> = {
      pause_creative: 'Pause underperforming creative',
      boost_creative: 'Boost high-performing creative',
      change_angle: 'Change marketing angle',
      change_landing: 'Optimize landing page',
      retarget_warm: 'Activate warm audience retargeting',
      extend_campaign: 'Extend campaign duration',
      change_cta: 'Update call-to-action',
      switch_hook: 'Switch to alternative hook',
      reallocate_budget: 'Reallocate budget across channels',
      scale_channel: 'Scale performing channel',
      pause_channel: 'Pause underperforming channel',
    };

    return `${actionLabels[rule.action]}: ${rule.condition.metric} is ${metric.value.toFixed(1)} (threshold: ${rule.condition.threshold}). ${rule.description}`;
  }
}
