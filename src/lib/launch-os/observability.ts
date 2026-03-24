// ─── Launch OS Observability Layer ────────────────────────────────────────────
// Serious observability for launch workflows: run status, agent latency,
// data freshness, connector errors, approval bottlenecks, publish failures,
// attribution lag, template-output ratio, verified-output ratio.

import type { LaunchStage, EvidenceLevel, LaunchRun, LaunchStageResult } from './launch-entities';

// ─── Metrics Types ───────────────────────────────────────────────────────────

export interface LaunchMetrics {
  launch_project_id: string;
  timestamp: string;

  // Run status
  run_status: RunStatusMetrics;

  // Agent performance
  agent_metrics: AgentLatencyMetrics[];

  // Data quality
  data_freshness: DataFreshnessMetrics;

  // Error tracking
  error_metrics: ErrorMetrics;

  // Approval tracking
  approval_metrics: ApprovalBottleneckMetrics;

  // Output quality
  output_quality: OutputQualityMetrics;
}

export interface RunStatusMetrics {
  current_stage: LaunchStage | null;
  stages_completed: number;
  stages_total: number;
  progress_percent: number;
  elapsed_minutes: number;
  estimated_remaining_minutes: number;
  is_blocked: boolean;
  blocked_reason: string | null;
}

export interface AgentLatencyMetrics {
  agent_id: string;
  agent_name: string;
  avg_duration_ms: number;
  p95_duration_ms: number;
  total_runs: number;
  success_rate: number;
  last_run_at: string | null;
  last_error: string | null;
}

export interface DataFreshnessMetrics {
  connectors: ConnectorFreshness[];
  overall_freshness_score: number;  // 0-100
}

export interface ConnectorFreshness {
  connector_id: string;
  last_sync_at: string | null;
  staleness_minutes: number;
  is_stale: boolean;   // > 60 minutes
  is_critical: boolean; // > 24 hours
}

export interface ErrorMetrics {
  total_errors: number;
  errors_by_type: Record<string, number>;
  errors_by_stage: Record<string, number>;
  last_error: { stage: string; type: string; message: string; timestamp: string } | null;
  error_rate_per_hour: number;
}

export interface ApprovalBottleneckMetrics {
  pending_approvals: number;
  blocking_approvals: number;
  avg_approval_time_hours: number;
  oldest_pending_hours: number;
  expired_approvals: number;
  approver_load: Record<string, number>; // approver_role -> count
}

export interface OutputQualityMetrics {
  total_outputs: number;
  verified_count: number;
  derived_count: number;
  template_count: number;
  verified_ratio: number;    // 0-1
  template_ratio: number;    // 0-1
  quality_score: number;     // 0-100
}

// ─── Error Taxonomy ──────────────────────────────────────────────────────────

export type LaunchErrorType =
  | 'agent_failure'
  | 'ai_gateway_timeout'
  | 'ai_gateway_quota'
  | 'connector_error'
  | 'connector_auth_expired'
  | 'data_missing'
  | 'validation_error'
  | 'approval_timeout'
  | 'approval_rejected'
  | 'publish_failure'
  | 'rate_limit'
  | 'network_error'
  | 'unknown';

export interface ErrorEntry {
  id: string;
  launch_project_id: string;
  stage: LaunchStage;
  error_type: LaunchErrorType;
  message: string;
  stack_trace: string | null;
  recoverable: boolean;
  retry_count: number;
  max_retries: number;
  resolved: boolean;
  resolved_at: string | null;
  resolution: string | null;
  created_at: string;
}

// ─── Retry Policy ────────────────────────────────────────────────────────────

export interface RetryConfig {
  error_type: LaunchErrorType;
  max_retries: number;
  backoff_base_ms: number;
  backoff_multiplier: number;
  max_backoff_ms: number;
  circuit_breaker_threshold: number;  // failures before circuit opens
  circuit_breaker_reset_ms: number;
}

export const DEFAULT_RETRY_CONFIGS: RetryConfig[] = [
  {
    error_type: 'ai_gateway_timeout',
    max_retries: 3,
    backoff_base_ms: 2000,
    backoff_multiplier: 2,
    max_backoff_ms: 30000,
    circuit_breaker_threshold: 5,
    circuit_breaker_reset_ms: 60000,
  },
  {
    error_type: 'ai_gateway_quota',
    max_retries: 1,
    backoff_base_ms: 60000,
    backoff_multiplier: 1,
    max_backoff_ms: 60000,
    circuit_breaker_threshold: 2,
    circuit_breaker_reset_ms: 300000,
  },
  {
    error_type: 'connector_error',
    max_retries: 3,
    backoff_base_ms: 5000,
    backoff_multiplier: 2,
    max_backoff_ms: 60000,
    circuit_breaker_threshold: 3,
    circuit_breaker_reset_ms: 120000,
  },
  {
    error_type: 'connector_auth_expired',
    max_retries: 0,
    backoff_base_ms: 0,
    backoff_multiplier: 1,
    max_backoff_ms: 0,
    circuit_breaker_threshold: 1,
    circuit_breaker_reset_ms: 0,
  },
  {
    error_type: 'rate_limit',
    max_retries: 5,
    backoff_base_ms: 10000,
    backoff_multiplier: 2,
    max_backoff_ms: 120000,
    circuit_breaker_threshold: 10,
    circuit_breaker_reset_ms: 300000,
  },
  {
    error_type: 'network_error',
    max_retries: 3,
    backoff_base_ms: 2000,
    backoff_multiplier: 2,
    max_backoff_ms: 30000,
    circuit_breaker_threshold: 5,
    circuit_breaker_reset_ms: 60000,
  },
  {
    error_type: 'publish_failure',
    max_retries: 2,
    backoff_base_ms: 10000,
    backoff_multiplier: 2,
    max_backoff_ms: 60000,
    circuit_breaker_threshold: 3,
    circuit_breaker_reset_ms: 120000,
  },
];

export function getRetryConfig(errorType: LaunchErrorType): RetryConfig {
  return DEFAULT_RETRY_CONFIGS.find(c => c.error_type === errorType) ?? {
    error_type: errorType,
    max_retries: 1,
    backoff_base_ms: 5000,
    backoff_multiplier: 2,
    max_backoff_ms: 30000,
    circuit_breaker_threshold: 3,
    circuit_breaker_reset_ms: 60000,
  };
}

export function calculateBackoff(retryCount: number, config: RetryConfig): number {
  const delay = config.backoff_base_ms * Math.pow(config.backoff_multiplier, retryCount);
  return Math.min(delay, config.max_backoff_ms);
}

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

export interface CircuitBreakerState {
  name: string;
  state: 'closed' | 'open' | 'half_open';
  failure_count: number;
  last_failure_at: string | null;
  opened_at: string | null;
  half_open_at: string | null;
}

export class CircuitBreaker {
  private states: Map<string, CircuitBreakerState> = new Map();

  getState(name: string): CircuitBreakerState {
    if (!this.states.has(name)) {
      this.states.set(name, {
        name,
        state: 'closed',
        failure_count: 0,
        last_failure_at: null,
        opened_at: null,
        half_open_at: null,
      });
    }
    return this.states.get(name)!;
  }

  recordFailure(name: string, config: RetryConfig): void {
    const state = this.getState(name);
    state.failure_count++;
    state.last_failure_at = new Date().toISOString();

    if (state.failure_count >= config.circuit_breaker_threshold) {
      state.state = 'open';
      state.opened_at = new Date().toISOString();
    }
  }

  recordSuccess(name: string): void {
    const state = this.getState(name);
    state.failure_count = 0;
    state.state = 'closed';
    state.opened_at = null;
    state.half_open_at = null;
  }

  canExecute(name: string, config: RetryConfig): boolean {
    const state = this.getState(name);

    if (state.state === 'closed') return true;

    if (state.state === 'open' && state.opened_at) {
      const elapsed = Date.now() - new Date(state.opened_at).getTime();
      if (elapsed > config.circuit_breaker_reset_ms) {
        state.state = 'half_open';
        state.half_open_at = new Date().toISOString();
        return true;  // Allow one test request
      }
      return false;
    }

    if (state.state === 'half_open') return true;

    return false;
  }

  getAllStates(): CircuitBreakerState[] {
    return Array.from(this.states.values());
  }
}

// ─── Metrics Computation ─────────────────────────────────────────────────────

export function computeRunStatusMetrics(run: LaunchRun | null): RunStatusMetrics {
  if (!run) {
    return {
      current_stage: null,
      stages_completed: 0,
      stages_total: 14,
      progress_percent: 0,
      elapsed_minutes: 0,
      estimated_remaining_minutes: 0,
      is_blocked: false,
      blocked_reason: null,
    };
  }

  const elapsed = Math.round((Date.now() - new Date(run.started_at).getTime()) / 60000);
  const completedCount = run.stages_completed.length;
  const avgStageTime = completedCount > 0 ? elapsed / completedCount : 15;
  const remaining = run.stages_remaining.length;

  return {
    current_stage: run.current_stage,
    stages_completed: completedCount,
    stages_total: 14,
    progress_percent: Math.round((completedCount / 14) * 100),
    elapsed_minutes: elapsed,
    estimated_remaining_minutes: Math.round(remaining * avgStageTime),
    is_blocked: run.status === 'waiting_approval' || run.status === 'failed',
    blocked_reason: run.status === 'waiting_approval'
      ? 'Waiting for human approval'
      : run.status === 'failed'
        ? run.error_log[run.error_log.length - 1]?.message ?? 'Unknown error'
        : null,
  };
}

export function computeOutputQualityMetrics(
  stageResults: LaunchStageResult[]
): OutputQualityMetrics {
  const total = stageResults.length;
  if (total === 0) {
    return {
      total_outputs: 0,
      verified_count: 0,
      derived_count: 0,
      template_count: 0,
      verified_ratio: 0,
      template_ratio: 0,
      quality_score: 0,
    };
  }

  const verified = stageResults.filter(s => s.evidence_level === 'VERIFIED').length;
  const derived = stageResults.filter(s => s.evidence_level === 'DERIVED').length;
  const template = stageResults.filter(s => s.evidence_level === 'TEMPLATE').length;

  const verifiedRatio = verified / total;
  const templateRatio = template / total;

  // Quality score: VERIFIED=100, DERIVED=60, TEMPLATE=20
  const qualityScore = Math.round(
    (verified * 100 + derived * 60 + template * 20) / total
  );

  return {
    total_outputs: total,
    verified_count: verified,
    derived_count: derived,
    template_count: template,
    verified_ratio: Math.round(verifiedRatio * 100) / 100,
    template_ratio: Math.round(templateRatio * 100) / 100,
    quality_score: qualityScore,
  };
}
