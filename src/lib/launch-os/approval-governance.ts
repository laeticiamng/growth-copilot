// ─── Approval Governance System ──────────────────────────────────────────────
// Every sensitive content or costly action must pass through an approval checkpoint.
// Clear system with: requires_approval, approval_reason, approver_role,
// blocking_level, SLA, audit log, rollback path.

import type { ApprovalCheckpointType, ApprovalCheckpoint, LaunchStage } from './launch-entities';

// ─── Approval Policy Definitions ─────────────────────────────────────────────

export interface ApprovalPolicyRule {
  checkpoint_type: ApprovalCheckpointType;
  description: string;
  default_requires_approval: boolean;
  default_approver_role: string;
  default_blocking_level: 'hard_block' | 'soft_block' | 'advisory';
  default_sla_hours: number;
  rollback_description: string;
  risk_category: 'content' | 'financial' | 'legal' | 'operational';
  related_stages: LaunchStage[];
}

export const APPROVAL_POLICIES: ApprovalPolicyRule[] = [
  {
    checkpoint_type: 'launch_brief',
    description: 'Validation du brief de lancement final avant demarrage de la production',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 24,
    rollback_description: 'Revenir au statut draft et demander des modifications',
    risk_category: 'operational',
    related_stages: ['intake'],
  },
  {
    checkpoint_type: 'positioning',
    description: 'Validation du positionnement et de la proposition de valeur',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 24,
    rollback_description: 'Refaire le positionnement avec nouvelles directives',
    risk_category: 'content',
    related_stages: ['positioning'],
  },
  {
    checkpoint_type: 'offer',
    description: 'Validation de l offre commerciale (prix, value stack, garanties)',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 24,
    rollback_description: 'Modifier l offre sans impact sur les assets deja produits',
    risk_category: 'financial',
    related_stages: ['positioning'],
  },
  {
    checkpoint_type: 'ad_copy',
    description: 'Validation des copies publicitaires avant diffusion',
    default_requires_approval: true,
    default_approver_role: 'marketing_lead',
    default_blocking_level: 'hard_block',
    default_sla_hours: 12,
    rollback_description: 'Regenerer les copies avec les corrections demandees',
    risk_category: 'content',
    related_stages: ['creative_strategy'],
  },
  {
    checkpoint_type: 'video_script',
    description: 'Validation des scripts video avant production',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 24,
    rollback_description: 'Reecrire le script avec les feedbacks',
    risk_category: 'content',
    related_stages: ['video_asset_planning'],
  },
  {
    checkpoint_type: 'landing_page',
    description: 'Validation de la landing page avant mise en ligne',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'soft_block',
    default_sla_hours: 12,
    rollback_description: 'Revenir a la version precedente de la landing',
    risk_category: 'content',
    related_stages: ['landing_funnel'],
  },
  {
    checkpoint_type: 'campaign_plan',
    description: 'Validation du plan de campagne et allocation budgetaire',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 24,
    rollback_description: 'Revoir le plan sans engager de depenses',
    risk_category: 'financial',
    related_stages: ['channel_plan'],
  },
  {
    checkpoint_type: 'budget_change',
    description: 'Approbation des changements de budget significatifs',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 4,
    rollback_description: 'Revenir au budget precedent',
    risk_category: 'financial',
    related_stages: ['channel_plan', 'iterate_recommend'],
  },
  {
    checkpoint_type: 'publication',
    description: 'Approbation finale avant publication sur les canaux',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 4,
    rollback_description: 'Annuler la publication planifiee',
    risk_category: 'operational',
    related_stages: ['approval_gate', 'publish_distribute'],
  },
  {
    checkpoint_type: 'campaign_activation',
    description: 'Activation des campagnes publicitaires payantes',
    default_requires_approval: true,
    default_approver_role: 'owner',
    default_blocking_level: 'hard_block',
    default_sla_hours: 2,
    rollback_description: 'Desactiver la campagne immediatement',
    risk_category: 'financial',
    related_stages: ['publish_distribute'],
  },
  {
    checkpoint_type: 'crm_automation',
    description: 'Activation des automations CRM et sequences email',
    default_requires_approval: true,
    default_approver_role: 'marketing_lead',
    default_blocking_level: 'soft_block',
    default_sla_hours: 12,
    rollback_description: 'Desactiver l automation et revenir en mode manuel',
    risk_category: 'operational',
    related_stages: ['publish_distribute', 'sales_handoff'],
  },
  {
    checkpoint_type: 'compliance_review',
    description: 'Revue de conformite legale et publicitaire des assets avec claims',
    default_requires_approval: true,
    default_approver_role: 'legal',
    default_blocking_level: 'hard_block',
    default_sla_hours: 48,
    rollback_description: 'Retirer les claims non conformes et soumettre a nouveau',
    risk_category: 'legal',
    related_stages: ['approval_gate'],
  },
];

// ─── Approval Helpers ────────────────────────────────────────────────────────

export function getApprovalPolicy(type: ApprovalCheckpointType): ApprovalPolicyRule | undefined {
  return APPROVAL_POLICIES.find(p => p.checkpoint_type === type);
}

export function getApprovalPoliciesForStage(stage: LaunchStage): ApprovalPolicyRule[] {
  return APPROVAL_POLICIES.filter(p => p.related_stages.includes(stage));
}

export function isApprovalExpired(checkpoint: ApprovalCheckpoint): boolean {
  if (checkpoint.status !== 'pending') return false;
  const policy = getApprovalPolicy(checkpoint.checkpoint_type);
  if (!policy) return false;

  const createdAt = new Date(checkpoint.created_at);
  const slaDeadline = new Date(createdAt.getTime() + policy.default_sla_hours * 60 * 60 * 1000);
  return new Date() > slaDeadline;
}

export function getApprovalSLARemaining(checkpoint: ApprovalCheckpoint): number {
  const policy = getApprovalPolicy(checkpoint.checkpoint_type);
  if (!policy) return 0;

  const createdAt = new Date(checkpoint.created_at);
  const slaDeadline = new Date(createdAt.getTime() + policy.default_sla_hours * 60 * 60 * 1000);
  const remaining = slaDeadline.getTime() - Date.now();
  return Math.max(0, Math.round(remaining / (60 * 60 * 1000)));  // hours
}

export function createCheckpoint(
  launchProjectId: string,
  entityId: string,
  entityType: string,
  checkpointType: ApprovalCheckpointType
): Omit<ApprovalCheckpoint, 'id' | 'created_at' | 'updated_at'> {
  const policy = getApprovalPolicy(checkpointType);
  if (!policy) {
    throw new Error(`Unknown checkpoint type: ${checkpointType}`);
  }

  return {
    launch_project_id: launchProjectId,
    checkpoint_type: checkpointType,
    entity_id: entityId,
    entity_type: entityType,
    requires_approval: policy.default_requires_approval,
    approval_reason: policy.description,
    approver_role: policy.default_approver_role,
    blocking_level: policy.default_blocking_level,
    sla_hours: policy.default_sla_hours,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    audit_log_entry_id: null,
    rollback_path: policy.rollback_description,
  };
}

// ─── Approval Summary ────────────────────────────────────────────────────────

export interface ApprovalSummary {
  total_checkpoints: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  blocking_count: number;
  avg_sla_remaining_hours: number;
  oldest_pending_hours: number;
}

export function computeApprovalSummary(checkpoints: ApprovalCheckpoint[]): ApprovalSummary {
  const pending = checkpoints.filter(c => c.status === 'pending');
  const expired = pending.filter(isApprovalExpired);
  const blocking = pending.filter(c => {
    const policy = getApprovalPolicy(c.checkpoint_type);
    return policy?.default_blocking_level === 'hard_block';
  });

  const slaRemaining = pending.map(c => getApprovalSLARemaining(c));
  const avgSla = slaRemaining.length > 0
    ? slaRemaining.reduce((a, b) => a + b, 0) / slaRemaining.length
    : 0;

  const oldestPending = pending.length > 0
    ? Math.round((Date.now() - new Date(pending[0].created_at).getTime()) / (60 * 60 * 1000))
    : 0;

  return {
    total_checkpoints: checkpoints.length,
    pending: pending.length,
    approved: checkpoints.filter(c => c.status === 'approved').length,
    rejected: checkpoints.filter(c => c.status === 'rejected').length,
    expired: expired.length,
    blocking_count: blocking.length,
    avg_sla_remaining_hours: Math.round(avgSla),
    oldest_pending_hours: oldestPending,
  };
}
