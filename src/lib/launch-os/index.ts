// Launch OS — Core module barrel exports
// Extended with hardening: sub-entities, agents, pipeline, QA, governance, observability

export * from './types';
export { LaunchTypeEngine } from './launch-type-engine';
export { ReadinessScorer } from './readiness-score';
export { DecisionEngine, DEFAULT_DECISION_RULES } from './decision-engine';
export {
  EVENT_TAXONOMY,
  buildUTMUrl,
  computeAttribution,
  computeFunnel,
  type UTMParams,
  type AttributionModel,
  type AttributionResult,
  type FunnelStep,
} from './signal-graph';

// ─── Launch OS Hardening Exports ─────────────────────────────────────────────

/** Canonical sub-entities — type definitions for all launch data models */
export * from './launch-entities';

/**
 * Agent specifications (15 launch-centric agents).
 * @remarks Currently consumed by tests and orchestration-pipeline internals.
 * Not yet wired into UI pages — available for future agent management UI.
 */
export { LAUNCH_AGENTS, getLaunchAgentById, getLaunchAgentsByStage, getLaunchAgentsRequiringApproval } from './launch-agents';
export type { LaunchAgentSpec, SchemaField, DataDependency } from './launch-agents';

/** 14-stage orchestration pipeline — consumed by useLaunchOS hook for stage progression */
export { LAUNCH_PIPELINE, getStageDefinition, getNextStage, getPreviousStage, getStageProgress, getStagesRequiringApproval, validateStageInputs } from './orchestration-pipeline';
export type { StageDefinition, StageInput, StageOutput, ValidationCriterion, FallbackStrategy } from './orchestration-pipeline';

/**
 * Creative QA & repurposing — brand compliance, CTA clarity, language quality checks.
 * @remarks Not yet surfaced in LaunchProject UI. Available for future creative QA workflow integration.
 */
export { runBrandComplianceCheck, runCTAClarityCheck, runLanguageQualityCheck, generateQAReport, canTransition, getRepurposeTargets, REPURPOSE_RULES, ASSET_STATUS_TRANSITIONS } from './creative-qa';
export type { CreativeQAReport, QACheckResult, QAIssue, AssetRegistryEntry, AssetStatus } from './creative-qa';

/** Approval governance — 12 approval policies with SLAs, consumed by useLaunchOS hook */
export { APPROVAL_POLICIES, getApprovalPolicy, getApprovalPoliciesForStage, isApprovalExpired, getApprovalSLARemaining, createCheckpoint, computeApprovalSummary } from './approval-governance';
export type { ApprovalPolicyRule, ApprovalSummary } from './approval-governance';

/** Integration health — runtime health checks for 14 connectors */
export { runIntegrationHealthCheck } from './integration-health';
export type { ConnectorHealth, IntegrationHealthReport, ConnectorStatus } from './integration-health';

/**
 * Observability — metrics, circuit breaker, retry policies.
 * @remarks Not yet surfaced in dashboard UI. Available for future observability dashboard.
 */
export { computeRunStatusMetrics, computeOutputQualityMetrics, CircuitBreaker, calculateBackoff, getRetryConfig, DEFAULT_RETRY_CONFIGS } from './observability';
export type { LaunchMetrics, RunStatusMetrics, OutputQualityMetrics, ErrorEntry, CircuitBreakerState, LaunchErrorType } from './observability';
