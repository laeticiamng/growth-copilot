/**
 * Meta-Supervisor Agent
 * Mission: Monitor system health, costs, quotas, and prevent runaway behaviors
 */

import type { AgentArtifact, AgentAction } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface SystemMetrics {
  totalRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  avgLatencyMs: number;
  concurrentRuns: number;
  requestsThisMinute: number;
}

export interface QuotaLimits {
  maxRequestsPerMinute: number;
  maxConcurrentRuns: number;
  monthlyTokenBudget: number;
  monthlyTokensUsed: number;
  dailyBudgetCap: number;
  dailySpend: number;
}

export interface AgentRunStats {
  agentType: string;
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  avgTokens: number;
  errorPatterns: string[];
}

export interface HealthCheckInput {
  metrics: SystemMetrics;
  quotas: QuotaLimits;
  agentStats: AgentRunStats[];
  recentErrors: ErrorEvent[];
  timeWindowMinutes: number;
}

export interface ErrorEvent {
  timestamp: string;
  agentType: string;
  errorType: string;
  message: string;
  isRetry: boolean;
}

export interface HealthStatus {
  overall: "healthy" | "degraded" | "critical";
  quotaStatus: "ok" | "warning" | "exceeded";
  errorRate: "normal" | "elevated" | "critical";
  latency: "normal" | "slow" | "critical";
  recommendations: ThrottleRecommendation[];
}

export interface ThrottleRecommendation {
  type: "reduce_tokens" | "switch_model" | "pause_agent" | "freeze_autopilot" | "alert_ops";
  target?: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const ERROR_RATE_THRESHOLDS = {
  normal: 0.05,    // < 5%
  elevated: 0.15,  // < 15%
  critical: 0.30,  // >= 30%
};

const LATENCY_THRESHOLDS_MS = {
  normal: 5000,    // < 5s
  slow: 15000,     // < 15s
  critical: 30000, // >= 30s
};

const QUOTA_WARNING_THRESHOLD = 0.8;  // 80%
const QUOTA_CRITICAL_THRESHOLD = 0.95; // 95%

const RETRY_STORM_THRESHOLD = 3; // 3+ retries = storm pattern

// ─────────────────────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────────────────────

/**
 * Calculate error rate from metrics
 */
export function calculateErrorRate(metrics: SystemMetrics): number {
  if (metrics.totalRequests === 0) return 0;
  return metrics.failedRequests / metrics.totalRequests;
}

/**
 * Classify error rate status
 */
export function classifyErrorRate(rate: number): "normal" | "elevated" | "critical" {
  if (rate >= ERROR_RATE_THRESHOLDS.critical) return "critical";
  if (rate >= ERROR_RATE_THRESHOLDS.elevated) return "elevated";
  return "normal";
}

/**
 * Classify latency status
 */
export function classifyLatency(avgLatencyMs: number): "normal" | "slow" | "critical" {
  if (avgLatencyMs >= LATENCY_THRESHOLDS_MS.critical) return "critical";
  if (avgLatencyMs >= LATENCY_THRESHOLDS_MS.slow) return "slow";
  return "normal";
}

/**
 * Calculate quota usage percentage
 */
export function calculateQuotaUsage(quotas: QuotaLimits): {
  tokenUsage: number;
  budgetUsage: number;
  rpmUsage: number;
} {
  return {
    tokenUsage: quotas.monthlyTokenBudget > 0 
      ? quotas.monthlyTokensUsed / quotas.monthlyTokenBudget 
      : 0,
    budgetUsage: quotas.dailyBudgetCap > 0 
      ? quotas.dailySpend / quotas.dailyBudgetCap 
      : 0,
    rpmUsage: quotas.maxRequestsPerMinute > 0 
      ? 0 // Would need current minute's requests
      : 0,
  };
}

/**
 * Classify quota status based on usage
 */
export function classifyQuotaStatus(quotas: QuotaLimits): "ok" | "warning" | "exceeded" {
  const usage = calculateQuotaUsage(quotas);
  const maxUsage = Math.max(usage.tokenUsage, usage.budgetUsage);
  
  if (maxUsage >= 1.0) return "exceeded";
  if (maxUsage >= QUOTA_WARNING_THRESHOLD) return "warning";
  return "ok";
}

/**
 * Detect retry storm patterns in errors
 */
export function detectRetryStorms(errors: ErrorEvent[]): Map<string, number> {
  const retryCountByAgent = new Map<string, number>();
  
  for (const error of errors) {
    if (error.isRetry) {
      const current = retryCountByAgent.get(error.agentType) || 0;
      retryCountByAgent.set(error.agentType, current + 1);
    }
  }
  
  return retryCountByAgent;
}

/**
 * Identify problematic agents based on stats
 */
export function identifyProblematicAgents(stats: AgentRunStats[]): AgentRunStats[] {
  return stats.filter(agent => {
    const hasLowSuccess = agent.successRate < 0.7;
    const hasHighLatency = agent.avgDurationMs > LATENCY_THRESHOLDS_MS.slow;
    const hasErrors = agent.errorPatterns.length > 0;
    
    return hasLowSuccess || hasHighLatency || hasErrors;
  });
}

/**
 * Generate throttle recommendations based on health data
 */
export function generateThrottleRecommendations(
  input: HealthCheckInput
): ThrottleRecommendation[] {
  const recommendations: ThrottleRecommendation[] = [];
  
  const errorRate = calculateErrorRate(input.metrics);
  const errorStatus = classifyErrorRate(errorRate);
  const latencyStatus = classifyLatency(input.metrics.avgLatencyMs);
  const quotaStatus = classifyQuotaStatus(input.quotas);
  const retryStorms = detectRetryStorms(input.recentErrors);
  const problematicAgents = identifyProblematicAgents(input.agentStats);
  
  // Quota recommendations
  if (quotaStatus === "exceeded") {
    recommendations.push({
      type: "freeze_autopilot",
      reason: "Quota dépassé - gel de l'autopilot pour éviter les coûts supplémentaires",
      severity: "high",
    });
    recommendations.push({
      type: "alert_ops",
      reason: "Quota mensuel dépassé - intervention requise",
      severity: "high",
    });
  } else if (quotaStatus === "warning") {
    recommendations.push({
      type: "reduce_tokens",
      reason: "Quota à 80%+ - réduction des max_tokens pour les tâches non critiques",
      severity: "medium",
    });
    recommendations.push({
      type: "switch_model",
      target: "gpt-5-nano",
      reason: "Basculer vers modèle économique pour préserver le budget",
      severity: "medium",
    });
  }
  
  // Error rate recommendations
  if (errorStatus === "critical") {
    recommendations.push({
      type: "freeze_autopilot",
      reason: `Taux d'erreur critique (${(errorRate * 100).toFixed(1)}%) - gel préventif`,
      severity: "high",
    });
    recommendations.push({
      type: "alert_ops",
      reason: "Taux d'erreur anormal détecté - investigation requise",
      severity: "high",
    });
  } else if (errorStatus === "elevated") {
    recommendations.push({
      type: "reduce_tokens",
      reason: "Taux d'erreur élevé - réduction de la complexité des requêtes",
      severity: "medium",
    });
  }
  
  // Latency recommendations
  if (latencyStatus === "critical") {
    recommendations.push({
      type: "switch_model",
      target: "gpt-5-nano",
      reason: "Latence critique - basculer vers modèle plus rapide",
      severity: "high",
    });
  } else if (latencyStatus === "slow") {
    recommendations.push({
      type: "reduce_tokens",
      reason: "Latence élevée - réduire max_tokens",
      severity: "low",
    });
  }
  
  // Retry storm recommendations
  for (const [agentType, retryCount] of retryStorms) {
    if (retryCount >= RETRY_STORM_THRESHOLD) {
      recommendations.push({
        type: "pause_agent",
        target: agentType,
        reason: `Retry storm détecté (${retryCount} retries) - pause temporaire`,
        severity: "high",
      });
    }
  }
  
  // Problematic agent recommendations
  for (const agent of problematicAgents) {
    if (agent.successRate < 0.5) {
      recommendations.push({
        type: "pause_agent",
        target: agent.agentType,
        reason: `Taux de succès très faible (${(agent.successRate * 100).toFixed(0)}%)`,
        severity: "high",
      });
    }
  }
  
  return recommendations;
}

/**
 * Determine overall health status
 */
export function determineOverallHealth(
  errorStatus: "normal" | "elevated" | "critical",
  latencyStatus: "normal" | "slow" | "critical",
  quotaStatus: "ok" | "warning" | "exceeded"
): "healthy" | "degraded" | "critical" {
  // Any critical = overall critical
  if (errorStatus === "critical" || latencyStatus === "critical" || quotaStatus === "exceeded") {
    return "critical";
  }
  
  // Any warning/elevated = degraded
  if (errorStatus === "elevated" || latencyStatus === "slow" || quotaStatus === "warning") {
    return "degraded";
  }
  
  return "healthy";
}

/**
 * Generate full health check report
 */
export function generateHealthCheck(input: HealthCheckInput): HealthStatus {
  const errorRate = calculateErrorRate(input.metrics);
  const errorStatus = classifyErrorRate(errorRate);
  const latencyStatus = classifyLatency(input.metrics.avgLatencyMs);
  const quotaStatus = classifyQuotaStatus(input.quotas);
  const recommendations = generateThrottleRecommendations(input);
  const overall = determineOverallHealth(errorStatus, latencyStatus, quotaStatus);
  
  return {
    overall,
    quotaStatus,
    errorRate: errorStatus,
    latency: latencyStatus,
    recommendations,
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────

/**
 * Calculate ICE score for a recommendation
 */
function calculateICE(rec: ThrottleRecommendation): number {
  const impactMap = { high: 9, medium: 6, low: 3 };
  const impact = impactMap[rec.severity];
  const confidence = 8; // High confidence for system metrics
  const ease = 7; // Generally easy to implement throttles
  return Math.round((impact * confidence * ease) / 10);
}

/**
 * Generate Meta-Supervisor agent output
 */
export function generateMetaSupervisorOutput(input: HealthCheckInput): AgentArtifact {
  const health = generateHealthCheck(input);
  const usage = calculateQuotaUsage(input.quotas);
  
  const actions: AgentAction[] = health.recommendations.map((rec, idx) => {
    const title = rec.type === "freeze_autopilot" 
      ? "Geler l'autopilot"
      : rec.type === "pause_agent"
      ? `Pause agent: ${rec.target}`
      : rec.type === "switch_model"
      ? `Basculer vers ${rec.target}`
      : rec.type === "reduce_tokens"
      ? "Réduire max_tokens"
      : "Alerter l'équipe ops";
    
    return {
      id: `meta-${Date.now()}-${idx}`,
      title,
      description: rec.reason,
      priority: rec.severity === "high" ? "critical" as const : rec.severity === "medium" ? "high" as const : "medium" as const,
      effort: "low" as const,
      impact: rec.severity,
      ice_score: calculateICE(rec),
      category: "system_health",
      auto_fixable: rec.type !== "freeze_autopilot" && rec.type !== "alert_ops",
      fix_instructions: generateHowSteps(rec).join(" → "),
    };
  });
  
  const risks = [];
  if (health.overall === "critical") {
    risks.push({
      id: `risk-critical-${Date.now()}`,
      description: "Système en état critique - intervention immédiate recommandée",
      severity: "critical" as const,
      mitigation: "Appliquer les recommandations de throttle immédiatement",
    });
  }
  if (health.quotaStatus === "exceeded") {
    risks.push({
      id: `risk-quota-${Date.now()}`,
      description: "Budget dépassé - nouvelles requêtes AI bloquées",
      severity: "high" as const,
      mitigation: "Augmenter le quota ou attendre le prochain cycle",
    });
  }
  
  return {
    summary: generateSummary(health, input.metrics, usage),
    actions,
    risks,
    dependencies: [],
    metrics_to_watch: [
      "error_rate",
      "avg_latency_ms",
      "monthly_tokens_used",
      "daily_spend",
      "concurrent_runs",
    ],
    requires_approval: health.overall === "critical",
  };
}

function generateSummary(
  health: HealthStatus, 
  metrics: SystemMetrics,
  usage: { tokenUsage: number; budgetUsage: number }
): string {
  const statusEmoji = health.overall === "healthy" ? "✅" : health.overall === "degraded" ? "⚠️" : "🚨";
  const tokenPct = (usage.tokenUsage * 100).toFixed(0);
  const budgetPct = (usage.budgetUsage * 100).toFixed(0);
  const errorPct = metrics.totalRequests > 0 
    ? ((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)
    : "0";
  
  return `${statusEmoji} Système ${health.overall.toUpperCase()} | Tokens: ${tokenPct}% | Budget: ${budgetPct}% | Erreurs: ${errorPct}% | ${health.recommendations.length} action(s) recommandée(s)`;
}

function generateHowSteps(rec: ThrottleRecommendation): string[] {
  switch (rec.type) {
    case "freeze_autopilot":
      return [
        "Désactiver autopilot dans autopilot_settings",
        "Notifier les utilisateurs du workspace",
        "Mettre en queue les actions en attente",
      ];
    case "pause_agent":
      return [
        `Ajouter ${rec.target} à la liste des agents suspendus`,
        "Annuler les runs en cours",
        "Logger l'événement dans action_log",
      ];
    case "switch_model":
      return [
        `Configurer le modèle par défaut vers ${rec.target}`,
        "Appliquer aux nouvelles requêtes uniquement",
        "Monitorer la qualité des outputs",
      ];
    case "reduce_tokens":
      return [
        "Réduire max_output_tokens de 50%",
        "Appliquer aux tâches non critiques",
        "Maintenir tokens pour SEO audit et reports",
      ];
    case "alert_ops":
      return [
        "Envoyer notification Slack/Email",
        "Créer ticket incident",
        "Escalader si non résolu en 30min",
      ];
    default:
      return ["Exécuter l'action corrective"];
  }
}

// ─────────────────────────────────────────────────────────────
// Quota Check (for 429 responses)
// ─────────────────────────────────────────────────────────────

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
}

/**
 * Check if a request should be allowed based on quotas
 */
export function checkQuotaBeforeRequest(quotas: QuotaLimits, metrics: SystemMetrics): QuotaCheckResult {
  // Check monthly token budget
  if (quotas.monthlyTokensUsed >= quotas.monthlyTokenBudget) {
    return {
      allowed: false,
      reason: "quota_exceeded_monthly",
      retryAfterSeconds: 86400, // Retry tomorrow
    };
  }
  
  // Check daily budget
  if (quotas.dailySpend >= quotas.dailyBudgetCap && quotas.dailyBudgetCap > 0) {
    return {
      allowed: false,
      reason: "quota_exceeded_daily",
      retryAfterSeconds: 3600, // Retry in 1 hour
    };
  }
  
  // Check requests per minute
  if (metrics.requestsThisMinute >= quotas.maxRequestsPerMinute) {
    return {
      allowed: false,
      reason: "rate_limit_exceeded",
      retryAfterSeconds: 60,
    };
  }
  
  // Check concurrent runs
  if (metrics.concurrentRuns >= quotas.maxConcurrentRuns) {
    return {
      allowed: false,
      reason: "concurrent_limit_exceeded",
      retryAfterSeconds: 10,
    };
  }
  
  return { allowed: true };
}
