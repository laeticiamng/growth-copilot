import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";
import type { AgentArtifactV2, AgentActionV2 } from "./ai-gateway-client";

type ApprovalQueueInsert = Database['public']['Tables']['approval_queue']['Insert'];
type ActionLogInsert = Database['public']['Tables']['action_log']['Insert'];

/**
 * Action decision types
 */
export type ActionDecision = "auto_approved" | "pending_approval" | "blocked";

export interface ActionDecisionResult {
  actionId: string;
  decision: ActionDecision;
  reason: string;
  queueId?: string; // ID in approval_queue if pending
}

export interface DecisionReport {
  summary: string;
  decisions: ActionDecisionResult[];
  stats: {
    auto_approved: number;
    pending_approval: number;
    blocked: number;
  };
  budget_remaining: number | null;
  actions_remaining_this_week: number | null;
}

export interface AutopilotConfig {
  enabled: boolean;
  allowed_actions: string[];
  require_approval_above_risk: "low" | "medium" | "high";
  max_actions_per_week: number;
  max_daily_budget: number;
}

/**
 * Approval Engine Agent
 * Classifies actions as auto_safe, approval_required, or blocked
 * based on autopilot settings, risk level, and quotas
 */
export class ApprovalEngine {
  private workspaceId: string;
  private siteId?: string;

  constructor(workspaceId: string, siteId?: string) {
    this.workspaceId = workspaceId;
    this.siteId = siteId;
  }

  /**
   * Process actions from an agent artifact and classify them
   */
  async processActions(
    artifact: AgentArtifactV2,
    agentType: string
  ): Promise<DecisionReport> {
    const config = await this.getAutopilotConfig();
    const weeklyStats = await this.getWeeklyActionStats();
    
    const decisions: ActionDecisionResult[] = [];
    const stats = { auto_approved: 0, pending_approval: 0, blocked: 0 };

    for (const action of artifact.actions) {
      const decision = await this.classifyAction(action, agentType, config, weeklyStats);
      decisions.push(decision);
      stats[decision.decision]++;

      // If pending, insert into approval_queue
      if (decision.decision === "pending_approval") {
        decision.queueId = await this.queueForApproval(action, agentType, config);
      }

      // If auto_approved, log it directly
      if (decision.decision === "auto_approved") {
        await this.logAutoApproval(action, agentType);
      }

      // Update weekly stats for budget tracking
      if (decision.decision === "auto_approved") {
        weeklyStats.actionsThisWeek++;
      }
    }

    // Log the decision report
    await this.logDecisionReport(agentType, stats, decisions.length);

    return {
      summary: `Processed ${decisions.length} actions: ${stats.auto_approved} auto-approved, ${stats.pending_approval} pending, ${stats.blocked} blocked`,
      decisions,
      stats,
      budget_remaining: config.max_daily_budget > 0 ? config.max_daily_budget : null,
      actions_remaining_this_week: config.max_actions_per_week - weeklyStats.actionsThisWeek,
    };
  }

  /**
   * Get autopilot configuration for the workspace
   */
  private async getAutopilotConfig(): Promise<AutopilotConfig> {
    const { data, error } = await supabase
      .from("autopilot_settings")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch autopilot settings:", error);
    }

    // Default: conservative settings (autopilot OFF)
    return {
      enabled: data?.enabled ?? false,
      allowed_actions: (data?.allowed_actions as string[]) ?? ["seo_fix", "review_response"],
      require_approval_above_risk: (data?.require_approval_above_risk as "low" | "medium" | "high") ?? "low",
      max_actions_per_week: data?.max_actions_per_week ?? 10,
      max_daily_budget: Number(data?.max_daily_budget) ?? 0,
    };
  }

  /**
   * Get weekly action statistics
   */
  private async getWeeklyActionStats(): Promise<{ actionsThisWeek: number }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count, error } = await supabase
      .from("action_log")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", this.workspaceId)
      .eq("is_automated", true)
      .gte("created_at", oneWeekAgo.toISOString());

    if (error) {
      console.error("Failed to fetch weekly stats:", error);
    }

    return { actionsThisWeek: count ?? 0 };
  }

  /**
   * Classify a single action
   */
  private async classifyAction(
    action: AgentActionV2,
    agentType: string,
    config: AutopilotConfig,
    weeklyStats: { actionsThisWeek: number }
  ): Promise<ActionDecisionResult> {
    // Rule 1: Autopilot OFF → everything except low-risk goes to approval
    if (!config.enabled) {
      if (action.type === "auto_safe" && action.impact === "low") {
        // Only truly safe low-impact actions can auto-approve when autopilot is OFF
        return {
          actionId: action.id,
          decision: "auto_approved",
          reason: "Low-impact auto-safe action (autopilot OFF but allowed)",
        };
      }
      return {
        actionId: action.id,
        decision: "pending_approval",
        reason: "Autopilot is disabled - manual approval required",
      };
    }

    // Rule 2: Check if action type is in whitelist
    const actionCategory = this.categorizeAction(action, agentType);
    if (!config.allowed_actions.includes(actionCategory)) {
      return {
        actionId: action.id,
        decision: "pending_approval",
        reason: `Action category '${actionCategory}' not in autopilot whitelist`,
      };
    }

    // Rule 3: Check risk level threshold
    const riskOrder = { low: 0, medium: 1, high: 2 };
    const actionRisk = riskOrder[action.impact] ?? 2;
    const thresholdRisk = riskOrder[config.require_approval_above_risk] ?? 0;

    if (actionRisk > thresholdRisk) {
      return {
        actionId: action.id,
        decision: "pending_approval",
        reason: `Risk level '${action.impact}' exceeds threshold '${config.require_approval_above_risk}'`,
      };
    }

    // Rule 4: Check weekly action limit
    if (weeklyStats.actionsThisWeek >= config.max_actions_per_week) {
      return {
        actionId: action.id,
        decision: "blocked",
        reason: `Weekly action limit reached (${config.max_actions_per_week})`,
      };
    }

    // Rule 5: Check if action requires approval by type
    if (action.type === "approval_required") {
      return {
        actionId: action.id,
        decision: "pending_approval",
        reason: "Action explicitly requires approval",
      };
    }

    // All checks passed → auto-approve
    return {
      actionId: action.id,
      decision: "auto_approved",
      reason: "Passed all autopilot checks",
    };
  }

  /**
   * Categorize action for whitelist matching
   */
  private categorizeAction(action: AgentActionV2, agentType: string): string {
    // Map agent types to action categories
    const agentCategoryMap: Record<string, string> = {
      tech_auditor: "seo_fix",
      seo_tech_auditor: "seo_fix",
      content_builder: "content_suggestion",
      content_strategist: "content_suggestion",
      reputation_guardian: "review_response",
      review_responder: "review_response",
      ads_optimizer: "ads_optimization",
      ads_manager: "ads_optimization",
      social_distributor: "social_publish",
    };

    return agentCategoryMap[agentType] ?? "general";
  }

  /**
   * Queue an action for manual approval
   */
  private async queueForApproval(
    action: AgentActionV2,
    agentType: string,
    config: AutopilotConfig
  ): Promise<string> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiration

    const insertData: ApprovalQueueInsert = {
      workspace_id: this.workspaceId,
      site_id: this.siteId ?? null,
      agent_type: agentType,
      action_type: action.title,
      action_data: {
        id: action.id,
        title: action.title,
        type: action.type,
        impact: action.impact,
        effort: action.effort,
        why: action.why,
        how: action.how,
        depends_on: action.depends_on ?? [],
        risks: action.risks ?? [],
      } as unknown as Json,
      risk_level: action.impact,
      status: "pending",
      expires_at: expiresAt.toISOString(),
      auto_approved: false,
    };

    const { data, error } = await supabase
      .from("approval_queue")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to queue action for approval:", error);
      return "";
    }

    return data.id;
  }

  /**
   * Log auto-approved action
   */
  private async logAutoApproval(action: AgentActionV2, agentType: string): Promise<void> {
    const insertData: ActionLogInsert = {
      workspace_id: this.workspaceId,
      site_id: this.siteId ?? null,
      actor_type: "agent",
      actor_id: agentType,
      action_type: "ACTION_AUTO_APPROVED",
      action_category: "approval",
      description: `Auto-approved: ${action.title}`,
      details: {
        action_id: action.id,
        action_title: action.title,
        impact: action.impact,
        effort: action.effort,
        reason: "Passed autopilot checks",
      } as Json,
      is_automated: true,
      result: "success",
    };

    const { error } = await supabase.from("action_log").insert(insertData);

    if (error) {
      console.error("Failed to log auto-approval:", error);
    }
  }

  /**
   * Log the decision report
   */
  private async logDecisionReport(
    agentType: string,
    stats: { auto_approved: number; pending_approval: number; blocked: number },
    totalActions: number
  ): Promise<void> {
    const insertData: ActionLogInsert = {
      workspace_id: this.workspaceId,
      site_id: this.siteId ?? null,
      actor_type: "agent",
      actor_id: "approval_engine",
      action_type: "DECISION_REPORT",
      action_category: "approval",
      description: `Processed ${totalActions} actions from ${agentType}`,
      details: {
        source_agent: agentType,
        stats,
        total_actions: totalActions,
      } as Json,
      is_automated: true,
      result: "success",
    };

    const { error } = await supabase.from("action_log").insert(insertData);

    if (error) {
      console.error("Failed to log decision report:", error);
    }
  }

  /**
   * Validate that a decision report is well-formed
   */
  static validateDecisionReport(report: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!report || typeof report !== "object") {
      return { valid: false, errors: ["Report is not an object"] };
    }

    const r = report as Record<string, unknown>;

    if (typeof r.summary !== "string") {
      errors.push("Missing 'summary' string");
    }

    if (!Array.isArray(r.decisions)) {
      errors.push("Missing 'decisions' array");
    }

    if (!r.stats || typeof r.stats !== "object") {
      errors.push("Missing 'stats' object");
    } else {
      const stats = r.stats as Record<string, unknown>;
      if (typeof stats.auto_approved !== "number") errors.push("stats.auto_approved must be number");
      if (typeof stats.pending_approval !== "number") errors.push("stats.pending_approval must be number");
      if (typeof stats.blocked !== "number") errors.push("stats.blocked must be number");
    }

    return { valid: errors.length === 0, errors };
  }
}
