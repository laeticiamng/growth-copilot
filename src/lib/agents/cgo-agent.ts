import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";
import { AIGatewayClient, type AgentArtifactV2 } from "./ai-gateway-client";
import { ApprovalEngine, type DecisionReport } from "./approval-engine";

type ActionLogInsert = Database['public']['Tables']['action_log']['Insert'];

/**
 * CGO Agent System Prompt
 * Designed for strict JSON output and no hallucinations
 */
const CGO_SYSTEM_PROMPT = `You are the Chief Growth Officer (CGO) Agent for Growth OS, an AI-powered marketing automation platform.

ROLE:
- Analyze the current state of a website/business and identify growth opportunities
- Prioritize actions using ICE scoring (Impact × Confidence × Ease)
- Create strategic growth plans following the "Foundations → Scale" methodology
- Coordinate specialized agents (SEO, Ads, Content, etc.)

METHODOLOGY - Foundations → Scale:
1. FOUNDATIONS (must be solid before scaling):
   - Technical health (site speed, crawlability, mobile-friendly)
   - Data quality (tracking, attribution, KPI accuracy)
   - Conversion basics (clear CTAs, trust signals, offer clarity)

2. OPTIMIZATION (improve what exists):
   - SEO technical fixes
   - Content optimization
   - CRO quick wins

3. SCALE (only if foundations are solid):
   - Paid acquisition
   - Content expansion
   - New channels

CONSTRAINTS:
- NEVER recommend scaling (Ads, aggressive content) if data tracking is unreliable
- NEVER promise specific ranking positions or guaranteed results
- NEVER suggest black-hat tactics or compliance violations
- If data is missing, acknowledge it and recommend setup actions first

ICE SCORING:
- Impact: 1-10 (how much will this move the needle?)
- Confidence: 1-10 (how sure are we this will work?)
- Ease: 1-10 (how easy is this to implement?)
- ICE = (Impact × Confidence × Ease) / 10

OUTPUT RULES:
- Respond with ONLY valid JSON matching the schema
- If you cannot analyze something, say so in "risks" - do not invent data
- Each action must have a unique ID: cgo_[category]_001, cgo_[category]_002, etc.
- Maximum 15 actions per plan, prioritized by ICE score`;

/**
 * Context for CGO analysis
 */
export interface CGOContext {
  siteUrl: string;
  siteId: string;
  goals: string[];
  integrations: {
    gsc: boolean;
    ga4: boolean;
    ads: boolean;
    gbp: boolean;
  };
  dataQualityStatus: "green" | "yellow" | "red";
  recentIssuesCount: number;
  recentIssuesSummary: string[];
  kpiTrends?: {
    clicks_trend: "up" | "down" | "flat";
    conversions_trend: "up" | "down" | "flat";
  };
}

/**
 * Chief Growth Officer Agent
 * Orchestrates growth planning and coordinates specialized agents
 */
export class CGOAgent {
  private workspaceId: string;
  private siteId: string;
  private approvalEngine: ApprovalEngine;

  constructor(workspaceId: string, siteId: string) {
    this.workspaceId = workspaceId;
    this.siteId = siteId;
    this.approvalEngine = new ApprovalEngine(workspaceId, siteId);
  }

  /**
   * Generate a comprehensive growth plan
   */
  async generateGrowthPlan(context: CGOContext): Promise<{
    artifact: AgentArtifactV2;
    decisions: DecisionReport;
    runId: string;
  }> {
    // Create agent run record
    const runId = await this.createAgentRun();

    try {
      // Build the user prompt with real data
      const userPrompt = this.buildUserPrompt(context);

      // Call AI Gateway
      const response = await AIGatewayClient.runLLM({
        workspaceId: this.workspaceId,
        agentName: "chief_growth_officer",
        purpose: "cgo_plan",
        systemPrompt: CGO_SYSTEM_PROMPT,
        userPrompt,
        context: context as unknown as Record<string, unknown>,
      });

      // Log the AI call
      await this.logAction("CGO_PLAN_GENERATED", {
        success: response.success,
        status: response.status,
        request_id: response.request_id,
        actions_count: response.artifact.actions.length,
        risks_count: response.artifact.risks.length,
      });

      // Process actions through approval engine
      const decisions = await this.approvalEngine.processActions(
        response.artifact,
        "chief_growth_officer"
      );

      // Update agent run with results
      await this.updateAgentRun(runId, "completed", response.artifact, decisions);

      return {
        artifact: response.artifact,
        decisions,
        runId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.updateAgentRun(runId, "failed", undefined, undefined, errorMessage);
      throw error;
    }
  }

  /**
   * Build the user prompt with context data
   */
  private buildUserPrompt(context: CGOContext): string {
    const integrationsList = Object.entries(context.integrations)
      .filter(([, connected]) => connected)
      .map(([name]) => name.toUpperCase())
      .join(", ") || "None";

    const missingIntegrations = Object.entries(context.integrations)
      .filter(([, connected]) => !connected)
      .map(([name]) => name.toUpperCase())
      .join(", ");

    return `Analyze the following business context and create a prioritized growth plan:

SITE: ${context.siteUrl}

BUSINESS GOALS:
${context.goals.length > 0 ? context.goals.map((g, i) => `${i + 1}. ${g}`).join("\n") : "Not specified - recommend goal-setting as first action"}

INTEGRATIONS:
- Connected: ${integrationsList}
- Missing: ${missingIntegrations || "None"}

DATA QUALITY STATUS: ${context.dataQualityStatus.toUpperCase()}
${context.dataQualityStatus === "red" ? "⚠️ CRITICAL: Data tracking is unreliable. Do NOT recommend scale actions (Ads, aggressive content). Focus on fixing tracking first." : ""}
${context.dataQualityStatus === "yellow" ? "⚠️ WARNING: Some data quality issues detected. Be cautious with scale recommendations." : ""}

RECENT ISSUES FOUND: ${context.recentIssuesCount}
${context.recentIssuesSummary.length > 0 ? `Top issues:\n${context.recentIssuesSummary.slice(0, 5).map((s, i) => `- ${s}`).join("\n")}` : "No recent audit data available"}

${context.kpiTrends ? `KPI TRENDS (last 7 days vs previous):
- Clicks: ${context.kpiTrends.clicks_trend}
- Conversions: ${context.kpiTrends.conversions_trend}` : "No KPI trend data available - GSC/GA4 not connected or no data yet"}

INSTRUCTIONS:
1. Evaluate the current state based on the Foundations → Scale methodology
2. Identify the most impactful actions considering available data and integrations
3. Prioritize using ICE scoring
4. If foundations are weak (data quality red, missing integrations), focus on fixing those first
5. Be specific about what needs to be done and why
6. Include clear dependencies between actions`;
  }

  /**
   * Create an agent run record
   */
  private async createAgentRun(): Promise<string> {
    const { data, error } = await supabase
      .from("agent_runs")
      .insert({
        workspace_id: this.workspaceId,
        site_id: this.siteId,
        agent_type: "chief_growth_officer",
        status: "running",
        started_at: new Date().toISOString(),
        requires_approval: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create agent run:", error);
      throw new Error("Failed to start CGO agent");
    }

    return data.id;
  }

  /**
   * Update agent run with results
   */
  private async updateAgentRun(
    runId: string,
    status: "completed" | "failed",
    artifact?: AgentArtifactV2,
    decisions?: DecisionReport,
    errorMessage?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("agent_runs")
      .update({
        status,
        completed_at: new Date().toISOString(),
        outputs: artifact ? {
          ...artifact,
          decisions_summary: decisions?.stats,
        } as unknown as Json : null,
        error_message: errorMessage ?? null,
      })
      .eq("id", runId);

    if (error) {
      console.error("Failed to update agent run:", error);
    }
  }

  /**
   * Log an action to action_log
   */
  private async logAction(
    actionType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const insertData: ActionLogInsert = {
      workspace_id: this.workspaceId,
      site_id: this.siteId,
      actor_type: "agent",
      actor_id: "chief_growth_officer",
      action_type: actionType,
      action_category: "orchestration",
      description: `CGO: ${actionType}`,
      details: details as Json,
      is_automated: true,
      result: "success",
    };

    const { error } = await supabase.from("action_log").insert(insertData);

    if (error) {
      console.error("Failed to log action:", error);
    }
  }

  /**
   * Fetch context data from the database for CGO analysis
   */
  static async buildContextFromDB(
    workspaceId: string,
    siteId: string,
    siteUrl: string
  ): Promise<CGOContext> {
    // Fetch integrations
    const { data: integrations } = await supabase
      .from("integrations")
      .select("provider, status")
      .eq("workspace_id", workspaceId)
      .eq("site_id", siteId);

    const connectedProviders = new Set(
      (integrations ?? [])
        .filter((i) => i.status === "connected")
        .map((i) => i.provider)
    );

    // Fetch data quality alerts
    const { data: alerts } = await supabase
      .from("data_quality_alerts")
      .select("severity")
      .eq("workspace_id", workspaceId)
      .eq("site_id", siteId)
      .eq("is_resolved", false);

    const criticalAlerts = (alerts ?? []).filter((a) => a.severity === "critical").length;
    const warningAlerts = (alerts ?? []).filter((a) => a.severity === "warning").length;
    const dataQualityStatus: "green" | "yellow" | "red" =
      criticalAlerts > 0 ? "red" : warningAlerts > 0 ? "yellow" : "green";

    // Fetch recent issues
    const { data: issues } = await supabase
      .from("issues")
      .select("title, severity")
      .eq("workspace_id", workspaceId)
      .eq("site_id", siteId)
      .eq("status", "open")
      .order("impact_score", { ascending: false })
      .limit(10);

    // Fetch KPI trends (simplified)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: recentKpis } = await supabase
      .from("kpis_daily")
      .select("organic_clicks, total_conversions")
      .eq("site_id", siteId)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0]);

    const { data: prevKpis } = await supabase
      .from("kpis_daily")
      .select("organic_clicks, total_conversions")
      .eq("site_id", siteId)
      .gte("date", fourteenDaysAgo.toISOString().split("T")[0])
      .lt("date", sevenDaysAgo.toISOString().split("T")[0]);

    const sumKpis = (data: { organic_clicks: number | null; total_conversions: number | null }[] | null) => ({
      clicks: (data ?? []).reduce((s, k) => s + (k.organic_clicks ?? 0), 0),
      conversions: (data ?? []).reduce((s, k) => s + (k.total_conversions ?? 0), 0),
    });

    const recent = sumKpis(recentKpis);
    const prev = sumKpis(prevKpis);

    const trend = (curr: number, prev: number): "up" | "down" | "flat" =>
      prev === 0 ? "flat" : curr > prev * 1.05 ? "up" : curr < prev * 0.95 ? "down" : "flat";

    return {
      siteUrl,
      siteId,
      goals: [], // Could be fetched from a goals table if available
      integrations: {
        gsc: connectedProviders.has("google_search_console"),
        ga4: connectedProviders.has("google_analytics"),
        ads: connectedProviders.has("google_ads"),
        gbp: connectedProviders.has("google_business_profile"),
      },
      dataQualityStatus,
      recentIssuesCount: issues?.length ?? 0,
      recentIssuesSummary: (issues ?? []).map((i) => `[${i.severity}] ${i.title}`),
      kpiTrends: recentKpis && recentKpis.length > 0 ? {
        clicks_trend: trend(recent.clicks, prev.clicks),
        conversions_trend: trend(recent.conversions, prev.conversions),
      } : undefined,
    };
  }
}
