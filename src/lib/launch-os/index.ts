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

// Canonical sub-entities
export * from './launch-entities';

// Agent specifications (15 launch-centric agents)
export { LAUNCH_AGENTS, getLaunchAgentById, getLaunchAgentsByStage, getLaunchAgentsRequiringApproval } from './launch-agents';
export type { LaunchAgentSpec, SchemaField, DataDependency } from './launch-agents';

// 14-stage orchestration pipeline
export { LAUNCH_PIPELINE, getStageDefinition, getNextStage, getPreviousStage, getStageProgress, getStagesRequiringApproval, validateStageInputs } from './orchestration-pipeline';
export type { StageDefinition, StageInput, StageOutput, ValidationCriterion, FallbackStrategy } from './orchestration-pipeline';

// Creative QA & repurposing
export { runBrandComplianceCheck, runCTAClarityCheck, runLanguageQualityCheck, generateQAReport, canTransition, getRepurposeTargets, REPURPOSE_RULES, ASSET_STATUS_TRANSITIONS } from './creative-qa';
export type { CreativeQAReport, QACheckResult, QAIssue, AssetRegistryEntry, AssetStatus } from './creative-qa';

// Approval governance
export { APPROVAL_POLICIES, getApprovalPolicy, getApprovalPoliciesForStage, isApprovalExpired, getApprovalSLARemaining, createCheckpoint, computeApprovalSummary } from './approval-governance';
export type { ApprovalPolicyRule, ApprovalSummary } from './approval-governance';

// Integration health
export { runIntegrationHealthCheck } from './integration-health';
export type { ConnectorHealth, IntegrationHealthReport, ConnectorStatus } from './integration-health';

// Observability
export { computeRunStatusMetrics, computeOutputQualityMetrics, CircuitBreaker, calculateBackoff, getRetryConfig, DEFAULT_RETRY_CONFIGS } from './observability';
export type { LaunchMetrics, RunStatusMetrics, OutputQualityMetrics, ErrorEntry, CircuitBreakerState, LaunchErrorType } from './observability';
