import { describe, it, expect } from 'vitest';
import { DecisionEngine, DEFAULT_DECISION_RULES } from '../decision-engine';
import type { DecisionRule, SignalEvent } from '../types';

function makeRule(overrides: Partial<DecisionRule> = {}): DecisionRule {
  return {
    id: 'rule-1',
    workspace_id: 'ws-1',
    name: 'Test Rule',
    description: 'Test description',
    condition: { metric: 'creative_ctr', operator: 'lt', threshold: 1.0, time_window_hours: 48, min_sample_size: 500 },
    action: 'pause_creative',
    action_config: {},
    is_auto_execute: false,
    is_active: true,
    priority: 1,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('DecisionEngine', () => {
  describe('DEFAULT_DECISION_RULES', () => {
    it('has 7 default rules', () => {
      expect(DEFAULT_DECISION_RULES).toHaveLength(7);
    });

    it('all rules have required fields', () => {
      for (const rule of DEFAULT_DECISION_RULES) {
        expect(rule.name).toBeTruthy();
        expect(rule.condition.metric).toBeTruthy();
        expect(rule.condition.operator).toBeTruthy();
        expect(typeof rule.condition.threshold).toBe('number');
        expect(rule.action).toBeTruthy();
      }
    });
  });

  describe('evaluate', () => {
    it('triggers rule when condition is met', () => {
      const engine = new DecisionEngine([makeRule()]);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 0.5, sampleSize: 600, timeWindowHours: 24 },
      ]);
      expect(results).toHaveLength(1);
      expect(results[0].triggered).toBe(true);
      expect(results[0].metricValue).toBe(0.5);
      expect(results[0].threshold).toBe(1.0);
    });

    it('does not trigger when condition is not met', () => {
      const engine = new DecisionEngine([makeRule()]);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 2.0, sampleSize: 600, timeWindowHours: 24 },
      ]);
      expect(results).toHaveLength(0);
    });

    it('skips rule when sample size is insufficient', () => {
      const engine = new DecisionEngine([makeRule()]);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 0.5, sampleSize: 100, timeWindowHours: 24 },
      ]);
      expect(results).toHaveLength(0);
    });

    it('skips rule when time window exceeds rule limit', () => {
      const engine = new DecisionEngine([makeRule()]);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 0.5, sampleSize: 600, timeWindowHours: 100 },
      ]);
      expect(results).toHaveLength(0);
    });

    it('skips inactive rules', () => {
      const engine = new DecisionEngine([makeRule({ is_active: false })]);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 0.5, sampleSize: 600, timeWindowHours: 24 },
      ]);
      expect(results).toHaveLength(0);
    });

    it('evaluates gt operator correctly', () => {
      const rule = makeRule({
        condition: { metric: 'creative_ctr', operator: 'gt', threshold: 3.0, time_window_hours: 24, min_sample_size: 100 },
        action: 'boost_creative',
      });
      const engine = new DecisionEngine([rule]);
      expect(engine.evaluate([{ metric: 'creative_ctr', value: 4.0, sampleSize: 200, timeWindowHours: 12 }])).toHaveLength(1);
      expect(engine.evaluate([{ metric: 'creative_ctr', value: 2.0, sampleSize: 200, timeWindowHours: 12 }])).toHaveLength(0);
    });

    it('evaluates multiple rules in priority order', () => {
      const rules = [
        makeRule({ id: 'r1', priority: 2, condition: { metric: 'creative_ctr', operator: 'lt', threshold: 1.0, time_window_hours: 48, min_sample_size: 100 }, action: 'pause_creative' }),
        makeRule({ id: 'r2', priority: 1, condition: { metric: 'hook_retention_3s', operator: 'lt', threshold: 30, time_window_hours: 72, min_sample_size: 100 }, action: 'switch_hook' }),
      ];
      const engine = new DecisionEngine(rules);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 0.5, sampleSize: 600, timeWindowHours: 24 },
        { metric: 'hook_retention_3s', value: 20, sampleSize: 300, timeWindowHours: 48 },
      ]);
      expect(results).toHaveLength(2);
      // Priority 1 should come first
      expect(results[0].rule.id).toBe('r2');
    });

    it('skips rules when metric not in snapshot', () => {
      const engine = new DecisionEngine([makeRule()]);
      const results = engine.evaluate([
        { metric: 'some_other_metric', value: 0.5, sampleSize: 600, timeWindowHours: 24 },
      ]);
      expect(results).toHaveLength(0);
    });
  });

  describe('buildActionLogs', () => {
    it('creates action logs from evaluation results', () => {
      const engine = new DecisionEngine([makeRule()]);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 0.5, sampleSize: 600, timeWindowHours: 24 },
      ]);
      const logs = engine.buildActionLogs(results, 'project-123');
      expect(logs).toHaveLength(1);
      expect(logs[0].launch_project_id).toBe('project-123');
      expect(logs[0].action).toBe('pause_creative');
      expect(logs[0].status).toBe('recommended');
      expect(logs[0].reason).toContain('0.5');
    });

    it('sets status to executed for auto-execute rules', () => {
      const rule = makeRule({ is_auto_execute: true });
      const engine = new DecisionEngine([rule]);
      const results = engine.evaluate([
        { metric: 'creative_ctr', value: 0.5, sampleSize: 600, timeWindowHours: 24 },
      ]);
      const logs = engine.buildActionLogs(results, 'project-123');
      expect(logs[0].status).toBe('executed');
      expect(logs[0].executed_at).toBeTruthy();
    });
  });

  describe('computeMetrics', () => {
    it('computes creative_ctr from impression and click events', () => {
      const now = new Date();
      const events = [
        ...Array(100).fill(null).map((_, i) => ({
          id: `imp-${i}`, launch_project_id: 'p1', event_type: 'impression' as const,
          source: 'meta', channel: 'meta_ads', properties: {}, created_at: now.toISOString(),
        })),
        ...Array(5).fill(null).map((_, i) => ({
          id: `click-${i}`, launch_project_id: 'p1', event_type: 'click' as const,
          source: 'meta', channel: 'meta_ads', properties: {}, created_at: now.toISOString(),
        })),
      ];

      const metrics = DecisionEngine.computeMetrics(events as any, 24);
      const ctr = metrics.find(m => m.metric === 'creative_ctr');
      expect(ctr).toBeDefined();
      expect(ctr!.value).toBeCloseTo(5, 0);
      expect(ctr!.sampleSize).toBe(100);
    });

    it('computes hook_retention_3s from view and watch_3s events', () => {
      const now = new Date();
      const events = [
        ...Array(200).fill(null).map((_, i) => ({
          id: `view-${i}`, launch_project_id: 'p1', event_type: 'view' as const,
          source: 'tiktok', channel: 'tiktok', properties: {}, created_at: now.toISOString(),
        })),
        ...Array(80).fill(null).map((_, i) => ({
          id: `w3s-${i}`, launch_project_id: 'p1', event_type: 'watch_3s' as const,
          source: 'tiktok', channel: 'tiktok', properties: {}, created_at: now.toISOString(),
        })),
      ];

      const metrics = DecisionEngine.computeMetrics(events as any, 48);
      const retention = metrics.find(m => m.metric === 'hook_retention_3s');
      expect(retention).toBeDefined();
      expect(retention!.value).toBeCloseTo(40, 0);
    });

    it('filters events outside time window', () => {
      const now = new Date();
      const old = new Date(now.getTime() - 50 * 3600 * 1000); // 50 hours ago
      const events = [
        { id: 'imp-old', launch_project_id: 'p1', event_type: 'impression', source: 'meta', channel: 'meta_ads', created_at: old.toISOString() },
        { id: 'imp-new', launch_project_id: 'p1', event_type: 'impression', source: 'meta', channel: 'meta_ads', created_at: now.toISOString() },
      ];

      const metrics = DecisionEngine.computeMetrics(events, 24);
      const ctr = metrics.find(m => m.metric === 'creative_ctr');
      // Only 1 impression within window, no clicks → no CTR or CTR = 0
      expect(ctr?.sampleSize).toBe(1);
    });

    it('returns empty array when no relevant events', () => {
      const metrics = DecisionEngine.computeMetrics([], 24);
      expect(metrics).toHaveLength(0);
    });
  });
});
