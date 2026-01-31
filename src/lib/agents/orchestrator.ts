import { supabase } from "@/integrations/supabase/client";
import type { AgentArtifact, AgentType, AgentRunInput, AgentRunOutput, AgentStatus } from "./types";
import type { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";

type DbAgentType = Database['public']['Enums']['agent_type'];
type DbAgentRunStatus = Database['public']['Enums']['agent_run_status'];

// Map our agent types to database enum values
const agentTypeToDb: Record<AgentType, DbAgentType> = {
  chief_growth_officer: 'chief_growth_officer',
  quality_compliance: 'quality_compliance',
  tech_auditor: 'tech_auditor',
  keyword_strategist: 'keyword_strategist',
  content_builder: 'content_builder',
  local_optimizer: 'local_manager',
  ads_optimizer: 'ads_manager',
  analytics_detective: 'analytics_guardian',
  cro_specialist: 'cro_optimizer',
  offer_architect: 'offer_architect',
  lifecycle_manager: 'lifecycle_manager',
  sales_accelerator: 'sales_ops',
  reputation_guardian: 'reputation_manager',
  competitive_watcher: 'competitive_analyst',
};

// Map status to DB enum
const statusToDb: Record<AgentStatus, DbAgentRunStatus> = {
  pending: 'pending',
  running: 'running',
  completed: 'completed',
  failed: 'failed',
  requires_approval: 'pending',
};

/**
 * Chief Growth Officer (CGO) Agent
 * Orchestrates specialized agents and prioritizes actions using ICE scoring
 */
export class ChiefGrowthOfficer {
  private workspaceId: string;
  private siteId: string;

  constructor(workspaceId: string, siteId: string) {
    this.workspaceId = workspaceId;
    this.siteId = siteId;
  }

  /**
   * Launch a specialized agent and track its execution
   */
  async launchAgent(
    agentType: AgentType,
    input: AgentRunInput
  ): Promise<{ runId: string; status: AgentStatus }> {
    const dbAgentType = agentTypeToDb[agentType];
    
    const insertData: Database['public']['Tables']['agent_runs']['Insert'] = {
      workspace_id: this.workspaceId,
      site_id: this.siteId,
      agent_type: dbAgentType,
      status: 'pending' as DbAgentRunStatus,
      inputs: input as unknown as Json,
      requires_approval: this.requiresApproval(agentType),
    };
    
    const { data: run, error } = await supabase
      .from('agent_runs')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create agent run:', error);
      throw new Error(`Failed to launch agent: ${error.message}`);
    }

    await this.logAction('agent_launched', {
      agent_type: agentType,
      run_id: run.id,
      input,
    });

    return { runId: run.id, status: 'pending' };
  }

  /**
   * Update agent run status
   */
  async updateAgentStatus(
    runId: string,
    status: AgentStatus,
    output?: AgentRunOutput,
    errorMessage?: string
  ): Promise<void> {
    const dbStatus = statusToDb[status];
    
    const updateData: Database['public']['Tables']['agent_runs']['Update'] = {
      status: dbStatus,
      ...(status === 'running' && { started_at: new Date().toISOString() }),
      ...((status === 'completed' || status === 'failed') && { completed_at: new Date().toISOString() }),
      ...(output && { outputs: output as unknown as Json }),
      ...(errorMessage && { error_message: errorMessage }),
    };

    const { error } = await supabase
      .from('agent_runs')
      .update(updateData)
      .eq('id', runId);

    if (error) {
      console.error('Failed to update agent run:', error);
    }

    await this.logAction('agent_status_updated', {
      run_id: runId,
      status,
      has_output: !!output,
      has_error: !!errorMessage,
    });
  }

  /**
   * Calculate ICE score for prioritization
   */
  calculateICE(impact: number, confidence: number, ease: number): number {
    return Math.round((impact * confidence * ease) / 10);
  }

  private requiresApproval(agentType: AgentType): boolean {
    const approvalRequired: AgentType[] = ['ads_optimizer', 'content_builder', 'lifecycle_manager'];
    return approvalRequired.includes(agentType);
  }

  private async logAction(actionType: string, details: Record<string, unknown>): Promise<void> {
    const insertData: Database['public']['Tables']['action_log']['Insert'] = {
      workspace_id: this.workspaceId,
      site_id: this.siteId,
      actor_type: 'agent',
      actor_id: 'chief_growth_officer',
      action_type: actionType,
      action_category: 'orchestration',
      description: `CGO: ${actionType}`,
      details: details as Json,
      is_automated: true,
      result: 'success',
    };

    const { error } = await supabase.from('action_log').insert(insertData);

    if (error) {
      console.error('Failed to log action:', error);
    }
  }
}

/**
 * Quality & Compliance Officer (QCO) Agent
 */
export class QualityComplianceOfficer {
  private workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  async validateArtifact(
    artifact: AgentArtifact,
    agentType: AgentType
  ): Promise<{ valid: boolean; issues: string[]; warnings: string[] }> {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!artifact.summary || artifact.summary.length < 10) {
      issues.push('Summary is missing or too short');
    }

    if (!Array.isArray(artifact.actions)) {
      issues.push('Actions must be an array');
    } else {
      for (const action of artifact.actions) {
        if (!action.id || !action.title) {
          issues.push(`Action missing required fields: ${JSON.stringify(action)}`);
        }
        if (action.ice_score < 0 || action.ice_score > 100) {
          warnings.push(`ICE score out of range for action: ${action.id}`);
        }
      }
    }

    const complianceIssues = this.checkCompliance(artifact);
    issues.push(...complianceIssues);

    await this.logValidation(agentType, issues.length === 0, issues, warnings);

    return { valid: issues.length === 0, issues, warnings };
  }

  private checkCompliance(artifact: AgentArtifact): string[] {
    const issues: string[] = [];
    const forbiddenPatterns = [
      { pattern: /fake.*review/i, message: 'Fake reviews are forbidden' },
      { pattern: /buy.*backlink/i, message: 'Buying backlinks is forbidden' },
      { pattern: /plagiari/i, message: 'Plagiarism is forbidden' },
    ];

    const artifactText = JSON.stringify(artifact);
    for (const { pattern, message } of forbiddenPatterns) {
      if (pattern.test(artifactText)) {
        issues.push(`Compliance violation: ${message}`);
      }
    }
    return issues;
  }

  private async logValidation(
    agentType: AgentType,
    valid: boolean,
    issues: string[],
    warnings: string[]
  ): Promise<void> {
    const insertData: Database['public']['Tables']['action_log']['Insert'] = {
      workspace_id: this.workspaceId,
      actor_type: 'agent',
      actor_id: 'quality_compliance',
      action_type: 'artifact_validated',
      action_category: 'compliance',
      description: `QCO validated ${agentType} artifact: ${valid ? 'PASS' : 'FAIL'}`,
      details: { agent_type: agentType, valid, issues, warnings } as Json,
      is_automated: true,
      result: valid ? 'success' : 'warning',
    };

    const { error } = await supabase.from('action_log').insert(insertData);

    if (error) {
      console.error('Failed to log validation:', error);
    }
  }
}
