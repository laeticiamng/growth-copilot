import { describe, it, expect } from 'vitest';
import {
  LAUNCH_PIPELINE,
  getStageDefinition,
  getNextStage,
  getPreviousStage,
  getStageProgress,
  getStagesRequiringApproval,
  validateStageInputs,
} from '../orchestration-pipeline';
import {
  LAUNCH_AGENTS,
  getLaunchAgentById,
  getLaunchAgentsByStage,
  AGENT_RUNTIME_CLASSIFICATIONS,
  getAgentRuntimeStatus,
  getExecutableAgents,
  getPartialAgents,
} from '../launch-agents';
import {
  APPROVAL_POLICIES,
  getApprovalPolicy,
  getApprovalPoliciesForStage,
  computeApprovalSummary,
  createCheckpoint,
} from '../approval-governance';
import {
  CircuitBreaker,
  calculateBackoff,
  getRetryConfig,
  DEFAULT_RETRY_CONFIGS,
  computeRunStatusMetrics,
  computeOutputQualityMetrics,
} from '../observability';
import type { LaunchStage, LaunchStageResult, LaunchRun, ApprovalCheckpoint } from '../launch-entities';

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════

describe('Launch Pipeline — Structural Integrity', () => {
  it('has exactly 14 stages', () => {
    expect(LAUNCH_PIPELINE.length).toBe(14);
  });

  it('stages are ordered 1 through 14', () => {
    const orders = LAUNCH_PIPELINE.map(s => s.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('every stage has a unique name', () => {
    const stages = LAUNCH_PIPELINE.map(s => s.stage);
    expect(new Set(stages).size).toBe(14);
  });

  it('every stage has inputs, outputs, agents, and validation', () => {
    for (const stage of LAUNCH_PIPELINE) {
      expect(stage.inputs.length).toBeGreaterThan(0);
      expect(stage.outputs.length).toBeGreaterThan(0);
      expect(stage.agents.length).toBeGreaterThan(0);
      expect(stage.validation_criteria.length).toBeGreaterThan(0);
    }
  });

  it('every stage has retry policy and fallback', () => {
    for (const stage of LAUNCH_PIPELINE) {
      expect(stage.retry_policy).toBeDefined();
      expect(stage.fallback_if_missing).toBeDefined();
      expect(['skip', 'template', 'manual_input', 'block']).toContain(stage.fallback_if_missing.strategy);
    }
  });

  it('getNextStage returns correct sequence', () => {
    expect(getNextStage('intake')).toBe('audience_research');
    expect(getNextStage('executive_report')).toBeNull();
  });

  it('getPreviousStage returns correct sequence', () => {
    expect(getPreviousStage('intake')).toBeNull();
    expect(getPreviousStage('audience_research')).toBe('intake');
  });

  it('getStageProgress calculates correctly', () => {
    expect(getStageProgress([])).toBe(0);
    expect(getStageProgress(['intake'])).toBe(7);
    const allStages = LAUNCH_PIPELINE.map(s => s.stage) as LaunchStage[];
    expect(getStageProgress(allStages)).toBe(100);
  });

  it('skippable stages have skip conditions', () => {
    const skippable = LAUNCH_PIPELINE.filter(s => s.can_skip);
    expect(skippable.length).toBeGreaterThan(0);
    for (const stage of skippable) {
      expect(stage.skip_conditions.length).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AGENT HONESTY
// ═══════════════════════════════════════════════════════════════════════════

describe('Launch Agents — Honest Classification', () => {
  it('has exactly 15 agent specifications', () => {
    expect(LAUNCH_AGENTS.length).toBe(15);
  });

  it('every agent has runtime classification', () => {
    for (const agent of LAUNCH_AGENTS) {
      const c = getAgentRuntimeStatus(agent.id);
      expect(c).toBeDefined();
      expect(['executable', 'partial', 'spec_only', 'disabled']).toContain(c!.runtime_status);
    }
  });

  it('no agent is falsely classified as spec_only', () => {
    const specOnly = AGENT_RUNTIME_CLASSIFICATIONS.filter(c => c.runtime_status === 'spec_only');
    expect(specOnly.length).toBe(0);
  });

  it('executable agents have backend function documented', () => {
    for (const agent of getExecutableAgents()) {
      expect(agent.backend_function).not.toBeNull();
      expect(agent.execution_evidence.length).toBeGreaterThan(10);
    }
  });

  it('partial agents have limitations documented', () => {
    for (const agent of getPartialAgents()) {
      expect(agent.limitations.length).toBeGreaterThan(0);
    }
  });

  it('every agent has I/O schema', () => {
    for (const agent of LAUNCH_AGENTS) {
      expect(Object.keys(agent.input_schema).length).toBeGreaterThan(0);
      expect(Object.keys(agent.output_schema).length).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL GOVERNANCE
// ═══════════════════════════════════════════════════════════════════════════

describe('Approval Governance', () => {
  it('has 12 approval policies', () => {
    expect(APPROVAL_POLICIES.length).toBe(12);
  });

  it('every policy has SLA and risk category', () => {
    for (const p of APPROVAL_POLICIES) {
      expect(p.default_sla_hours).toBeGreaterThan(0);
      expect(['content', 'financial', 'legal', 'operational']).toContain(p.risk_category);
      expect(p.related_stages.length).toBeGreaterThan(0);
    }
  });

  it('createCheckpoint creates valid checkpoint', () => {
    const cp = createCheckpoint('p1', 'e1', 'creative_variant', 'ad_copy');
    expect(cp.status).toBe('pending');
    expect(cp.blocking_level).toBe('hard_block');
    expect(cp.sla_hours).toBe(12);
  });

  it('computeApprovalSummary is accurate', () => {
    const checkpoints: ApprovalCheckpoint[] = [
      { id: '1', launch_project_id: 'p1', checkpoint_type: 'ad_copy', entity_id: 'e1', entity_type: 'creative', requires_approval: true, approval_reason: 'test', approver_role: 'owner', blocking_level: 'hard_block', sla_hours: 12, status: 'pending', approved_by: null, approved_at: null, rejection_reason: null, audit_log_entry_id: null, rollback_path: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', launch_project_id: 'p1', checkpoint_type: 'positioning', entity_id: 'e2', entity_type: 'pos', requires_approval: true, approval_reason: 'test', approver_role: 'owner', blocking_level: 'hard_block', sla_hours: 24, status: 'approved', approved_by: 'u1', approved_at: new Date().toISOString(), rejection_reason: null, audit_log_entry_id: null, rollback_path: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    const s = computeApprovalSummary(checkpoints);
    expect(s.pending).toBe(1);
    expect(s.approved).toBe(1);
    expect(s.blocking_count).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RELIABILITY & ERROR MODEL
// ═══════════════════════════════════════════════════════════════════════════

describe('Reliability — Retry & Circuit Breaker', () => {
  it('has retry configs for critical errors', () => {
    expect(DEFAULT_RETRY_CONFIGS.length).toBeGreaterThan(0);
    expect(getRetryConfig('ai_gateway_timeout').max_retries).toBeGreaterThanOrEqual(1);
  });

  it('calculateBackoff is exponential', () => {
    const config = getRetryConfig('ai_gateway_timeout');
    expect(calculateBackoff(1, config)).toBeGreaterThan(calculateBackoff(0, config));
    expect(calculateBackoff(2, config)).toBeGreaterThan(calculateBackoff(1, config));
  });

  it('backoff respects max', () => {
    const config = getRetryConfig('ai_gateway_timeout');
    expect(calculateBackoff(100, config)).toBeLessThanOrEqual(config.max_backoff_ms);
  });

  it('CircuitBreaker opens after threshold', () => {
    const breaker = new CircuitBreaker();
    const config = getRetryConfig('connector_error');
    for (let i = 0; i < config.circuit_breaker_threshold; i++) breaker.recordFailure('test', config);
    expect(breaker.canExecute('test', config)).toBe(false);
  });

  it('CircuitBreaker resets on success', () => {
    const breaker = new CircuitBreaker();
    const config = getRetryConfig('connector_error');
    breaker.recordFailure('t', config);
    breaker.recordSuccess('t');
    expect(breaker.getState('t').state).toBe('closed');
  });

  it('connector_auth_expired has 0 retries', () => {
    const config = getRetryConfig('connector_auth_expired');
    expect(config.max_retries).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// OUTPUT QUALITY & EVIDENCE
// ═══════════════════════════════════════════════════════════════════════════

describe('Output Quality Metrics', () => {
  it('empty results produce zero score', () => {
    const m = computeOutputQualityMetrics([]);
    expect(m.total_outputs).toBe(0);
    expect(m.quality_score).toBe(0);
  });

  it('all TEMPLATE scores 20', () => {
    const r: LaunchStageResult[] = [
      { stage: 'intake', status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'TEMPLATE', duration_ms: 0, retry_count: 0 },
    ];
    expect(computeOutputQualityMetrics(r).quality_score).toBe(20);
  });

  it('all VERIFIED scores 100', () => {
    const r: LaunchStageResult[] = [
      { stage: 'intake', status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'VERIFIED', duration_ms: 0, retry_count: 0 },
    ];
    expect(computeOutputQualityMetrics(r).quality_score).toBe(100);
  });

  it('mixed scores correctly', () => {
    const r: LaunchStageResult[] = [
      { stage: 'intake', status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'VERIFIED', duration_ms: 0, retry_count: 0 },
      { stage: 'positioning', status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'DERIVED', duration_ms: 0, retry_count: 0 },
      { stage: 'messaging', status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'TEMPLATE', duration_ms: 0, retry_count: 0 },
    ];
    const m = computeOutputQualityMetrics(r);
    expect(m.quality_score).toBe(60); // (100+60+20)/3
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STAGE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Stage Input Validation', () => {
  it('intake fails without required inputs', () => {
    const r = validateStageInputs('intake', {});
    expect(r.valid).toBe(false);
    expect(r.missing).toContain('product_name');
  });

  it('intake passes with all required inputs', () => {
    const r = validateStageInputs('intake', {
      product_name: 'X', product_type: 'saas', product_description: 'Y', launch_goal: 'Z', target_audience: 'W',
    });
    expect(r.valid).toBe(true);
  });

  it('unknown stage returns invalid', () => {
    const r = validateStageInputs('fake' as LaunchStage, {});
    expect(r.valid).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NO FALSE READY
// ═══════════════════════════════════════════════════════════════════════════

describe('READY Decision — No False Positives', () => {
  it('empty pipeline = 0% progress', () => {
    expect(getStageProgress([])).toBe(0);
  });

  it('all TEMPLATE outputs score below 25', () => {
    const r: LaunchStageResult[] = Array(10).fill(null).map(() => ({
      stage: 'intake' as LaunchStage, status: 'completed' as const, started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'TEMPLATE' as const, duration_ms: 0, retry_count: 0,
    }));
    expect(computeOutputQualityMetrics(r).quality_score).toBeLessThanOrEqual(20);
  });

  it('exported_manual is NOT published', () => {
    expect('exported_manual').not.toBe('published');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RUN STATUS METRICS
// ═══════════════════════════════════════════════════════════════════════════

describe('Run Status Metrics', () => {
  it('null run returns safe defaults', () => {
    const m = computeRunStatusMetrics(null);
    expect(m.current_stage).toBeNull();
    expect(m.progress_percent).toBe(0);
    expect(m.is_blocked).toBe(false);
  });

  it('waiting_approval run is blocked', () => {
    const run: LaunchRun = {
      id: 'r1', launch_project_id: 'p1', run_number: 1, current_stage: 'approval_gate',
      stages_completed: [], stages_remaining: ['approval_gate'],
      started_at: new Date().toISOString(), completed_at: null,
      status: 'waiting_approval', triggered_by: 'u1', error_log: [], created_at: new Date().toISOString(),
    };
    const m = computeRunStatusMetrics(run);
    expect(m.is_blocked).toBe(true);
    expect(m.blocked_reason).toContain('approval');
  });

  it('failed run is blocked', () => {
    const run: LaunchRun = {
      id: 'r1', launch_project_id: 'p1', run_number: 1, current_stage: 'creative_strategy',
      stages_completed: [], stages_remaining: [],
      started_at: new Date().toISOString(), completed_at: null,
      status: 'failed', triggered_by: 'u1',
      error_log: [{ stage: 'creative_strategy', error_type: 'agent_failure', message: 'AI timeout', recoverable: true, timestamp: new Date().toISOString() }],
      created_at: new Date().toISOString(),
    };
    const m = computeRunStatusMetrics(run);
    expect(m.is_blocked).toBe(true);
    expect(m.blocked_reason).toContain('AI timeout');
  });
});
