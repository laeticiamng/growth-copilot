import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";
import { AIGatewayClient, type AgentArtifactV2 } from "./ai-gateway-client";

type ActionLogInsert = Database['public']['Tables']['action_log']['Insert'];

/**
 * QCO Agent System Prompt
 */
const QCO_SYSTEM_PROMPT = `You are the Quality & Compliance Officer (QCO) Agent for Growth OS.

ROLE:
- Validate outputs from other agents for quality and compliance
- Ensure all recommendations are ethical and follow best practices
- Flag any potential risks or regulatory concerns
- Verify that outputs are truly actionable vs vague suggestions

FORBIDDEN ACTIONS (immediately flag if detected):
- Fake reviews or testimonials
- Plagiarized content
- Misleading claims or false advertising
- Black-hat SEO tactics (link schemes, keyword stuffing, cloaking, hidden text)
- Privacy violations or data misuse (GDPR, CCPA concerns)
- Spam or aggressive automation
- Guaranteed rankings or traffic promises
- Fake engagement or bot usage

QUALITY CHECKS:
1. Is each recommendation actionable with clear steps?
2. Are the expected outcomes realistic and measurable?
3. Are there hidden dependencies not mentioned?
4. Is the effort estimate accurate for the scope?
5. Are there compliance risks with platform policies (Google, Meta, etc.)?

VALIDATION RULES:
- If an action claims "measured data" but no data source is provided → flag as unverified
- If an action promises specific outcomes → flag as needs disclaimer
- If an action involves external platforms → check for policy compliance
- If an action modifies user-facing content → mark as needs approval

OUTPUT RULES:
- Respond with ONLY valid JSON matching the schema
- Report validation status for each action reviewed
- List specific issues found with clear explanations
- Suggest fixes when possible`;

/**
 * Validation result for a single action
 */
export interface ActionValidation {
  actionId: string;
  valid: boolean;
  issues: string[];
  warnings: string[];
  complianceFlags: string[];
  suggestedFixes?: string[];
}

/**
 * Complete validation report
 */
export interface ValidationReport {
  summary: string;
  overall_valid: boolean;
  validations: ActionValidation[];
  blocked_actions: string[];
  compliance_risks: string[];
  recommendations: string[];
}

/**
 * Quality & Compliance Officer Agent
 * Validates agent outputs for quality, compliance, and actionability
 */
export class QCOAgent {
  private workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  /**
   * Validate an agent artifact
   */
  async validateArtifact(
    artifact: AgentArtifactV2,
    agentType: string,
    originalContext?: string
  ): Promise<ValidationReport> {
    // Step 1: Schema validation (fast, local)
    const schemaValidation = this.validateSchema(artifact);
    if (!schemaValidation.valid) {
      return {
        summary: `Schema validation failed: ${schemaValidation.errors.join(", ")}`,
        overall_valid: false,
        validations: [],
        blocked_actions: [],
        compliance_risks: ["Invalid output schema - cannot process"],
        recommendations: ["Fix agent output to match required JSON schema"],
      };
    }

    // Step 2: Compliance check (fast, local pattern matching)
    const complianceCheck = this.checkCompliance(artifact);

    // Step 3: If compliance issues or high-risk actions, use AI for deeper review
    const hasHighRisk = artifact.actions.some(
      (a) => a.impact === "high" || a.type === "approval_required"
    );

    let aiValidation: ActionValidation[] = [];
    if (complianceCheck.issues.length > 0 || hasHighRisk) {
      aiValidation = await this.validateWithAI(artifact, agentType, originalContext);
    } else {
      // For low-risk, compliant artifacts, do lightweight validation
      aiValidation = artifact.actions.map((action) => ({
        actionId: action.id,
        valid: true,
        issues: [],
        warnings: [],
        complianceFlags: [],
      }));
    }

    // Combine results
    const blockedActions = [
      ...complianceCheck.blockedActions,
      ...aiValidation.filter((v) => !v.valid).map((v) => v.actionId),
    ];

    const allIssues = [
      ...complianceCheck.issues,
      ...aiValidation.flatMap((v) => v.issues),
    ];

    const overallValid = blockedActions.length === 0 && allIssues.length === 0;

    // Log the validation
    await this.logValidation(agentType, overallValid, allIssues, blockedActions);

    return {
      summary: overallValid
        ? `Validation passed: ${artifact.actions.length} actions reviewed`
        : `Validation failed: ${blockedActions.length} blocked, ${allIssues.length} issues found`,
      overall_valid: overallValid,
      validations: aiValidation,
      blocked_actions: blockedActions,
      compliance_risks: complianceCheck.issues,
      recommendations: this.generateRecommendations(complianceCheck, aiValidation),
    };
  }

  /**
   * Validate artifact schema
   */
  private validateSchema(artifact: AgentArtifactV2): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!artifact.summary || typeof artifact.summary !== "string") {
      errors.push("Missing or invalid 'summary' field");
    }

    if (!Array.isArray(artifact.actions)) {
      errors.push("Missing or invalid 'actions' array");
    } else {
      artifact.actions.forEach((action, i) => {
        if (!action.id) errors.push(`Action ${i} missing 'id'`);
        if (!action.title) errors.push(`Action ${i} missing 'title'`);
        if (!action.type || !["recommendation", "approval_required", "auto_safe"].includes(action.type)) {
          errors.push(`Action ${i} has invalid 'type'`);
        }
        if (!action.impact || !["high", "medium", "low"].includes(action.impact)) {
          errors.push(`Action ${i} has invalid 'impact'`);
        }
        if (!action.why) errors.push(`Action ${i} missing 'why'`);
        if (!Array.isArray(action.how) || action.how.length === 0) {
          errors.push(`Action ${i} missing or empty 'how' steps`);
        }
      });
    }

    if (!Array.isArray(artifact.risks)) {
      errors.push("Missing 'risks' array");
    }

    if (!Array.isArray(artifact.dependencies)) {
      errors.push("Missing 'dependencies' array");
    }

    if (typeof artifact.requires_approval !== "boolean") {
      errors.push("Missing 'requires_approval' boolean");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check for compliance violations using pattern matching
   */
  private checkCompliance(artifact: AgentArtifactV2): {
    issues: string[];
    blockedActions: string[];
  } {
    const issues: string[] = [];
    const blockedActions: string[] = [];

    const forbiddenPatterns = [
      { pattern: /fake.*review/i, message: "Fake reviews are forbidden", severity: "block" },
      { pattern: /buy.*backlink/i, message: "Buying backlinks is forbidden", severity: "block" },
      { pattern: /plagiari/i, message: "Plagiarism is forbidden", severity: "block" },
      { pattern: /keyword\s*stuff/i, message: "Keyword stuffing is forbidden", severity: "block" },
      { pattern: /hidden\s*text/i, message: "Hidden text is forbidden", severity: "block" },
      { pattern: /cloaking/i, message: "Cloaking is forbidden", severity: "block" },
      { pattern: /link\s*farm/i, message: "Link farms are forbidden", severity: "block" },
      { pattern: /spam/i, message: "Spam tactics are forbidden", severity: "warn" },
      { pattern: /guarante.*rank/i, message: "Cannot guarantee rankings", severity: "warn" },
      { pattern: /guarante.*traffic/i, message: "Cannot guarantee traffic", severity: "warn" },
      { pattern: /100%\s*(success|guarantee)/i, message: "No 100% guarantees allowed", severity: "warn" },
      { pattern: /bot.*engagement/i, message: "Bot engagement is forbidden", severity: "block" },
      { pattern: /fake.*follower/i, message: "Fake followers are forbidden", severity: "block" },
    ];

    for (const action of artifact.actions) {
      const actionText = JSON.stringify(action);
      
      for (const { pattern, message, severity } of forbiddenPatterns) {
        if (pattern.test(actionText)) {
          if (severity === "block") {
            blockedActions.push(action.id);
            issues.push(`[BLOCKED] Action ${action.id}: ${message}`);
          } else {
            issues.push(`[WARNING] Action ${action.id}: ${message}`);
          }
        }
      }

      // Check for unverified claims
      if (/measured|data shows|analytics indicate/i.test(actionText)) {
        if (!action.depends_on?.some((d) => d.includes("integration:") || d.includes("data:"))) {
          issues.push(`[WARNING] Action ${action.id}: Claims measured data without data source dependency`);
        }
      }
    }

    return { issues, blockedActions };
  }

  /**
   * Use AI for deeper validation of high-risk actions
   */
  private async validateWithAI(
    artifact: AgentArtifactV2,
    agentType: string,
    originalContext?: string
  ): Promise<ActionValidation[]> {
    const response = await AIGatewayClient.runLLM({
      workspaceId: this.workspaceId,
      agentName: "quality_compliance",
      purpose: "qa_review",
      systemPrompt: QCO_SYSTEM_PROMPT,
      userPrompt: `Review the following agent output for quality and compliance:

AGENT TYPE: ${agentType}
ORIGINAL CONTEXT: ${originalContext || "Not provided"}

ARTIFACT TO REVIEW:
${JSON.stringify(artifact, null, 2)}

For each action, evaluate:
1. Is it ethical and compliant with platform policies?
2. Is it actionable with clear, realistic steps?
3. Are there hidden risks or dependencies?
4. Is the effort/impact assessment accurate?

Provide your assessment as a JSON array of validations.`,
    });

    // Parse AI response and map to ActionValidation format
    // If AI validation fails, fall back to marking all as needing review
    if (!response.success) {
      return artifact.actions.map((action) => ({
        actionId: action.id,
        valid: false,
        issues: ["AI validation unavailable - manual review required"],
        warnings: [],
        complianceFlags: [],
      }));
    }

    // Map AI response to validations
    return artifact.actions.map((action) => {
      const aiAction = response.artifact.actions.find((a) => a.id === action.id);
      return {
        actionId: action.id,
        valid: !aiAction?.risks?.length,
        issues: aiAction?.risks ?? [],
        warnings: [],
        complianceFlags: [],
        suggestedFixes: aiAction?.how,
      };
    });
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(
    complianceCheck: { issues: string[]; blockedActions: string[] },
    validations: ActionValidation[]
  ): string[] {
    const recommendations: string[] = [];

    if (complianceCheck.blockedActions.length > 0) {
      recommendations.push(
        `Remove or rewrite ${complianceCheck.blockedActions.length} actions that violate compliance rules`
      );
    }

    const warningCount = validations.filter((v) => v.warnings.length > 0).length;
    if (warningCount > 0) {
      recommendations.push(`Review ${warningCount} actions with warnings before proceeding`);
    }

    const missingSteps = validations.filter(
      (v) => v.issues.some((i) => i.includes("missing") || i.includes("vague"))
    );
    if (missingSteps.length > 0) {
      recommendations.push(`Add more specific steps to ${missingSteps.length} actions`);
    }

    return recommendations;
  }

  /**
   * Log validation results
   */
  private async logValidation(
    agentType: string,
    valid: boolean,
    issues: string[],
    blockedActions: string[]
  ): Promise<void> {
    const insertData: ActionLogInsert = {
      workspace_id: this.workspaceId,
      actor_type: "agent",
      actor_id: "quality_compliance",
      action_type: "ARTIFACT_VALIDATED",
      action_category: "compliance",
      description: `QCO validated ${agentType}: ${valid ? "PASS" : "FAIL"}`,
      details: {
        source_agent: agentType,
        valid,
        issues_count: issues.length,
        blocked_count: blockedActions.length,
        issues: issues.slice(0, 10), // Limit stored issues
      } as Json,
      is_automated: true,
      result: valid ? "success" : "warning",
    };

    const { error } = await supabase.from("action_log").insert(insertData);

    if (error) {
      console.error("Failed to log validation:", error);
    }
  }

  /**
   * Quick schema validation without AI (for high-volume use)
   */
  static quickValidate(artifact: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!artifact || typeof artifact !== "object") {
      return { valid: false, errors: ["Not an object"] };
    }

    const a = artifact as Record<string, unknown>;

    if (typeof a.summary !== "string" || a.summary.length < 10) {
      errors.push("Summary missing or too short");
    }

    if (!Array.isArray(a.actions)) {
      errors.push("Actions is not an array");
    }

    if (!Array.isArray(a.risks)) {
      errors.push("Risks is not an array");
    }

    if (typeof a.requires_approval !== "boolean") {
      errors.push("requires_approval is not boolean");
    }

    return { valid: errors.length === 0, errors };
  }
}
