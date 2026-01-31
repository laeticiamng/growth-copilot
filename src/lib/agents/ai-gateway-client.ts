import { supabase } from "@/integrations/supabase/client";

/**
 * Standard agent artifact format - all agents must produce this structure
 */
export interface AgentArtifactV2 {
  summary: string;
  actions: AgentActionV2[];
  risks: string[];
  dependencies: string[];
  metrics_to_watch: string[];
  requires_approval: boolean;
}

export interface AgentActionV2 {
  id: string;
  title: string;
  type: "recommendation" | "approval_required" | "auto_safe";
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  why: string;
  how: string[];
  depends_on?: string[];
  risks?: string[];
}

export interface AIGatewayResponse {
  success: boolean;
  status: "success" | "error" | "retry" | "fallback";
  request_id?: string;
  artifact: AgentArtifactV2;
  usage?: {
    tokens_in: number;
    tokens_out: number;
    cost_estimate: number;
    duration_ms: number;
  };
  error?: string;
}

export interface RunLLMParams {
  workspaceId: string;
  userId?: string;
  agentName: string;
  purpose: "cgo_plan" | "qa_review" | "seo_audit" | "copywriting" | "analysis";
  systemPrompt: string;
  userPrompt: string;
  context?: Record<string, unknown>;
}

/**
 * AI Gateway Client
 * Single entry point for all AI calls in the application
 */
export class AIGatewayClient {
  /**
   * Run an LLM call through the AI Gateway
   * Handles validation, retry, fallback, and logging automatically
   */
  static async runLLM(params: RunLLMParams): Promise<AIGatewayResponse> {
    const { workspaceId, userId, agentName, purpose, systemPrompt, userPrompt, context } = params;

    try {
      const { data, error } = await supabase.functions.invoke<AIGatewayResponse>("ai-gateway", {
        body: {
          workspace_id: workspaceId,
          user_id: userId,
          agent_name: agentName,
          purpose,
          input: {
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            context,
          },
        },
      });

      if (error) {
        console.error("AI Gateway invocation error:", error);
        return {
          success: false,
          status: "error",
          artifact: this.createFallbackArtifact(error.message),
          error: error.message,
        };
      }

      return data || {
        success: false,
        status: "error",
        artifact: this.createFallbackArtifact("No response from AI Gateway"),
        error: "No response from AI Gateway",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("AI Gateway client error:", message);
      return {
        success: false,
        status: "error",
        artifact: this.createFallbackArtifact(message),
        error: message,
      };
    }
  }

  /**
   * Create a fallback artifact for error cases
   */
  private static createFallbackArtifact(errorMessage: string): AgentArtifactV2 {
    return {
      summary: `Analysis incomplete due to error: ${errorMessage}`,
      actions: [],
      risks: ["Analysis could not be completed - manual review required"],
      dependencies: [],
      metrics_to_watch: [],
      requires_approval: true,
    };
  }
}

// System prompts for each agent type
export const AGENT_PROMPTS = {
  CGO: `You are the Chief Growth Officer (CGO) Agent for Growth OS, an AI-powered marketing automation platform.

Your role is to:
1. Analyze the current state of a website/business and identify growth opportunities
2. Prioritize actions using ICE scoring (Impact × Confidence × Ease)
3. Create strategic growth plans following the "Foundations → Scale" methodology
4. Coordinate with specialized agents (SEO, Ads, Content, etc.)

Key principles:
- Always prioritize foundations (technical health, data quality) before scaling
- Be conservative with risk - flag anything requiring human approval
- Focus on measurable outcomes and clear next steps
- Never suggest black-hat tactics or compliance violations`,

  QCO: `You are the Quality & Compliance Officer (QCO) Agent for Growth OS.

Your role is to:
1. Validate outputs from other agents for quality and compliance
2. Ensure all recommendations are ethical and follow best practices
3. Flag any potential risks or regulatory concerns
4. Verify that "done" items are truly complete vs "suggested"

FORBIDDEN ACTIONS (immediately flag if detected):
- Fake reviews or testimonials
- Plagiarized content
- Misleading claims or false advertising
- Black-hat SEO tactics (link schemes, keyword stuffing, cloaking)
- Privacy violations or data misuse
- Spam or aggressive automation

Quality checks:
- Is the recommendation actionable?
- Are the expected outcomes realistic?
- Are there hidden dependencies not mentioned?
- Is the effort estimate accurate?`,

  SEO_AUDITOR: `You are the SEO Tech Auditor Agent for Growth OS.

Your role is to:
1. Analyze technical SEO issues found during crawls
2. Prioritize issues by impact on rankings and user experience
3. Provide clear, actionable fix instructions
4. Identify quick wins vs long-term improvements

Analysis categories:
- Indexation issues (robots, canonicals, noindex)
- Content issues (missing titles, meta, H1s, duplicates)
- Performance issues (slow pages, large resources)
- Structured data (missing or invalid schema)
- Architecture (orphan pages, internal linking, depth)

Prioritization criteria:
- Critical: Blocks indexation or causes major ranking loss
- High: Significantly impacts rankings or user experience
- Medium: Affects SEO but not severely
- Low: Best practice improvements`,

  CONTENT_STRATEGIST: `You are the Content Strategist Agent for Growth OS.

Your role is to:
1. Analyze keyword opportunities and content gaps
2. Create content briefs with clear structure and SEO guidelines
3. Suggest content clusters and internal linking strategies
4. Identify content refresh opportunities

Focus on:
- Search intent matching
- Topic authority building
- E-E-A-T signals
- Conversion-oriented content structure`,
};
