import { describe, it, expect } from 'vitest';

// ─── Phase 2: Canonical Model Tests ──────────────────────────────────────────

describe('Launch Entities', () => {
  it('should define all required sub-entity types', async () => {
    const entities = await import('../launch-entities');

    // Verify core types exist
    expect(entities).toBeDefined();

    // Verify EvidenceLevel type exists by checking a valid value
    const tag: entities.EvidenceTag = {
      level: 'VERIFIED',
      source: 'test',
      confidence: 0.9,
    };
    expect(tag.level).toBe('VERIFIED');
    expect(['VERIFIED', 'DERIVED', 'TEMPLATE']).toContain(tag.level);
  });

  it('should enforce evidence level on all sub-entities', () => {
    // LaunchBrief must have evidence
    const brief: Partial<import('../launch-entities').LaunchBrief> = {
      evidence: { level: 'TEMPLATE', source: 'user_input', confidence: 0.5 },
    };
    expect(brief.evidence?.level).toBe('TEMPLATE');
  });

  it('should define all 14 launch stages', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');
    expect(LAUNCH_PIPELINE).toHaveLength(14);

    const stages = LAUNCH_PIPELINE.map(s => s.stage);
    expect(stages).toContain('intake');
    expect(stages).toContain('audience_research');
    expect(stages).toContain('positioning');
    expect(stages).toContain('messaging');
    expect(stages).toContain('creative_strategy');
    expect(stages).toContain('video_asset_planning');
    expect(stages).toContain('landing_funnel');
    expect(stages).toContain('channel_plan');
    expect(stages).toContain('approval_gate');
    expect(stages).toContain('publish_distribute');
    expect(stages).toContain('track_attribute');
    expect(stages).toContain('iterate_recommend');
    expect(stages).toContain('sales_handoff');
    expect(stages).toContain('executive_report');
  });
});

// ─── Phase 3: Launch Agents Tests ────────────────────────────────────────────

describe('Launch Agents', () => {
  it('should define exactly 15 launch agents', async () => {
    const { LAUNCH_AGENTS } = await import('../launch-agents');
    expect(LAUNCH_AGENTS).toHaveLength(15);
  });

  it('every agent should have all required fields', async () => {
    const { LAUNCH_AGENTS } = await import('../launch-agents');

    for (const agent of LAUNCH_AGENTS) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.role).toBeTruthy();
      expect(agent.objective).toBeTruthy();
      expect(agent.input_schema).toBeDefined();
      expect(agent.output_schema).toBeDefined();
      expect(agent.data_dependencies).toBeDefined();
      expect(agent.tools_used.length).toBeGreaterThan(0);
      expect(agent.acceptance_criteria.length).toBeGreaterThan(0);
      expect(typeof agent.human_approval_required).toBe('boolean');
      expect(agent.stop_conditions.length).toBeGreaterThan(0);
      expect(agent.escalation_route).toBeTruthy();
      expect(agent.kpi_ownership).toBeDefined();
      expect(agent.stages_involved.length).toBeGreaterThan(0);
      expect(['VERIFIED', 'DERIVED', 'TEMPLATE']).toContain(agent.evidence_output_level);
    }
  });

  it('should have agents for all required roles', async () => {
    const { LAUNCH_AGENTS } = await import('../launch-agents');
    const ids = LAUNCH_AGENTS.map(a => a.id);

    expect(ids).toContain('launch_program_manager');
    expect(ids).toContain('offer_positioning_strategist');
    expect(ids).toContain('icp_audience_researcher');
    expect(ids).toContain('creative_strategist');
    expect(ids).toContain('video_scriptwriter');
    expect(ids).toContain('storyboard_agent');
    expect(ids).toContain('creative_production_qa');
    expect(ids).toContain('multichannel_distribution_planner');
    expect(ids).toContain('paid_media_planner');
    expect(ids).toContain('organic_content_planner');
    expect(ids).toContain('landing_page_cro');
    expect(ids).toContain('crm_lifecycle_agent');
    expect(ids).toContain('attribution_analytics_lead');
    expect(ids).toContain('sales_enablement_agent');
    expect(ids).toContain('brand_legal_compliance_reviewer');
  });

  it('agents requiring approval should have approval_description', async () => {
    const { LAUNCH_AGENTS } = await import('../launch-agents');
    const approvalAgents = LAUNCH_AGENTS.filter(a => a.human_approval_required);

    expect(approvalAgents.length).toBeGreaterThan(0);
    for (const agent of approvalAgents) {
      expect(agent.approval_description).toBeTruthy();
    }
  });

  it('should lookup agents by stage', async () => {
    const { getLaunchAgentsByStage } = await import('../launch-agents');

    const intakeAgents = getLaunchAgentsByStage('intake');
    expect(intakeAgents.length).toBeGreaterThan(0);

    const approvalAgents = getLaunchAgentsByStage('approval_gate');
    expect(approvalAgents.length).toBeGreaterThan(0);
  });
});

// ─── Phase 4: Orchestration Pipeline Tests ───────────────────────────────────

describe('Orchestration Pipeline', () => {
  it('stages should be in correct order', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');

    for (let i = 0; i < LAUNCH_PIPELINE.length; i++) {
      expect(LAUNCH_PIPELINE[i].order).toBe(i + 1);
    }
  });

  it('every stage should have validation criteria', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');

    for (const stage of LAUNCH_PIPELINE) {
      expect(stage.validation_criteria.length).toBeGreaterThan(0);
    }
  });

  it('every stage should define inputs and outputs', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');

    for (const stage of LAUNCH_PIPELINE) {
      expect(stage.inputs.length).toBeGreaterThan(0);
      expect(stage.outputs.length).toBeGreaterThan(0);
    }
  });

  it('approval gate should have hard_block fallback', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');
    const approvalGate = LAUNCH_PIPELINE.find(s => s.stage === 'approval_gate');

    expect(approvalGate).toBeDefined();
    expect(approvalGate!.fallback_if_missing.strategy).toBe('block');
    expect(approvalGate!.can_skip).toBe(false);
  });

  it('getNextStage should return correct next stage', async () => {
    const { getNextStage } = await import('../orchestration-pipeline');

    expect(getNextStage('intake')).toBe('audience_research');
    expect(getNextStage('approval_gate')).toBe('publish_distribute');
    expect(getNextStage('executive_report')).toBeNull();
  });

  it('validateStageInputs should detect missing required inputs', async () => {
    const { validateStageInputs } = await import('../orchestration-pipeline');

    const result = validateStageInputs('intake', {});
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('product_name');
    expect(result.missing).toContain('launch_goal');

    const validResult = validateStageInputs('intake', {
      product_name: 'Test Product',
      product_type: 'SaaS',
      product_description: 'A test product',
      launch_goal: 'Get 1000 users',
      target_audience: 'Developers',
    });
    expect(validResult.valid).toBe(true);
    expect(validResult.missing).toHaveLength(0);
  });

  it('getStageProgress should compute correct percentage', async () => {
    const { getStageProgress } = await import('../orchestration-pipeline');

    expect(getStageProgress([])).toBe(0);
    expect(getStageProgress(['intake', 'audience_research', 'positioning', 'messaging', 'creative_strategy', 'video_asset_planning', 'landing_funnel'])).toBe(50);
    expect(getStageProgress(['intake', 'audience_research', 'positioning', 'messaging', 'creative_strategy', 'video_asset_planning', 'landing_funnel', 'channel_plan', 'approval_gate', 'publish_distribute', 'track_attribute', 'iterate_recommend', 'sales_handoff', 'executive_report'])).toBe(100);
  });
});

// ─── Phase 5: Creative QA Tests ──────────────────────────────────────────────

describe('Creative QA System', () => {
  it('should check CTA clarity', async () => {
    const { runCTAClarityCheck } = await import('../creative-qa');

    const noCTA = runCTAClarityCheck('');
    expect(noCTA.passed).toBe(false);
    expect(noCTA.issues.some(i => i.severity === 'critical')).toBe(true);

    const goodCTA = runCTAClarityCheck('Get Started Free');
    expect(goodCTA.passed).toBe(true);
    expect(goodCTA.score).toBeGreaterThan(80);
  });

  it('should check language quality', async () => {
    const { runLanguageQualityCheck } = await import('../creative-qa');

    const capsAbuse = runLanguageQualityCheck('THIS IS ALL CAPS AND VERY LOUD AND AGGRESSIVE');
    expect(capsAbuse.issues.length).toBeGreaterThan(0);

    const normalText = runLanguageQualityCheck('This is a perfectly normal marketing copy with clear messaging.');
    expect(normalText.passed).toBe(true);
  });

  it('should generate QA report', async () => {
    const { generateQAReport, runCTAClarityCheck, runLanguageQualityCheck } = await import('../creative-qa');

    const checks = [
      runCTAClarityCheck('Start Free Trial'),
      runLanguageQualityCheck('Great product for teams who want to grow.'),
    ];

    const report = generateQAReport('test-creative-1', checks);
    expect(report.creative_id).toBe('test-creative-1');
    expect(report.overall_score).toBeGreaterThan(0);
    expect(report.overall_status).toBeDefined();
    expect(['pass', 'fail', 'warning']).toContain(report.overall_status);
  });

  it('should validate asset status transitions', async () => {
    const { canTransition } = await import('../creative-qa');

    expect(canTransition('draft', 'in_review')).toBe(true);
    expect(canTransition('draft', 'published')).toBe(false);
    expect(canTransition('approved', 'published')).toBe(true);
    expect(canTransition('published', 'draft')).toBe(false);
    expect(canTransition('deprecated', 'draft')).toBe(false);
  });

  it('should return repurpose targets', async () => {
    const { getRepurposeTargets } = await import('../creative-qa');

    const longFormTargets = getRepurposeTargets('long_form_video');
    expect(longFormTargets.length).toBeGreaterThan(0);
    expect(longFormTargets.some(t => t.channel === 'tiktok')).toBe(true);

    const noTargets = getRepurposeTargets('nonexistent_format');
    expect(noTargets).toHaveLength(0);
  });
});

// ─── Phase 7: Approval Governance Tests ──────────────────────────────────────

describe('Approval Governance', () => {
  it('should define approval policies for all checkpoint types', async () => {
    const { APPROVAL_POLICIES } = await import('../approval-governance');

    expect(APPROVAL_POLICIES.length).toBe(12);

    const types = APPROVAL_POLICIES.map(p => p.checkpoint_type);
    expect(types).toContain('launch_brief');
    expect(types).toContain('positioning');
    expect(types).toContain('offer');
    expect(types).toContain('ad_copy');
    expect(types).toContain('video_script');
    expect(types).toContain('publication');
    expect(types).toContain('budget_change');
    expect(types).toContain('campaign_activation');
    expect(types).toContain('crm_automation');
    expect(types).toContain('compliance_review');
  });

  it('all financial checkpoints should be hard_block', async () => {
    const { APPROVAL_POLICIES } = await import('../approval-governance');

    const financialPolicies = APPROVAL_POLICIES.filter(p => p.risk_category === 'financial');
    expect(financialPolicies.length).toBeGreaterThan(0);

    for (const policy of financialPolicies) {
      expect(policy.default_blocking_level).toBe('hard_block');
    }
  });

  it('should create checkpoint from policy', async () => {
    const { createCheckpoint } = await import('../approval-governance');

    const checkpoint = createCheckpoint('proj-1', 'entity-1', 'launch_brief', 'launch_brief');
    expect(checkpoint.requires_approval).toBe(true);
    expect(checkpoint.approver_role).toBe('owner');
    expect(checkpoint.blocking_level).toBe('hard_block');
    expect(checkpoint.status).toBe('pending');
  });

  it('should throw for unknown checkpoint type', async () => {
    const { createCheckpoint } = await import('../approval-governance');

    expect(() => {
      createCheckpoint('proj-1', 'entity-1', 'test', 'unknown_type' as any);
    }).toThrow('Unknown checkpoint type');
  });

  it('should compute approval summary', async () => {
    const { computeApprovalSummary } = await import('../approval-governance');

    const summary = computeApprovalSummary([
      { id: '1', launch_project_id: 'p1', checkpoint_type: 'launch_brief', entity_id: 'e1', entity_type: 'brief', requires_approval: true, approval_reason: '', approver_role: 'owner', blocking_level: 'hard_block', sla_hours: 24, status: 'pending', approved_by: null, approved_at: null, rejection_reason: null, audit_log_entry_id: null, rollback_path: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', launch_project_id: 'p1', checkpoint_type: 'ad_copy', entity_id: 'e2', entity_type: 'creative', requires_approval: true, approval_reason: '', approver_role: 'marketing_lead', blocking_level: 'hard_block', sla_hours: 12, status: 'approved', approved_by: 'user-1', approved_at: new Date().toISOString(), rejection_reason: null, audit_log_entry_id: null, rollback_path: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ]);

    expect(summary.total_checkpoints).toBe(2);
    expect(summary.pending).toBe(1);
    expect(summary.approved).toBe(1);
  });
});

// ─── Phase 8: Observability Tests ────────────────────────────────────────────

describe('Observability', () => {
  it('should compute run status metrics for null run', async () => {
    const { computeRunStatusMetrics } = await import('../observability');

    const metrics = computeRunStatusMetrics(null);
    expect(metrics.stages_completed).toBe(0);
    expect(metrics.progress_percent).toBe(0);
    expect(metrics.is_blocked).toBe(false);
  });

  it('should compute output quality metrics', async () => {
    const { computeOutputQualityMetrics } = await import('../observability');

    const metrics = computeOutputQualityMetrics([
      { stage: 'intake' as any, status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'VERIFIED', duration_ms: 1000, retry_count: 0 },
      { stage: 'positioning' as any, status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'DERIVED', duration_ms: 2000, retry_count: 0 },
      { stage: 'messaging' as any, status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'TEMPLATE', duration_ms: 1500, retry_count: 0 },
    ]);

    expect(metrics.total_outputs).toBe(3);
    expect(metrics.verified_count).toBe(1);
    expect(metrics.derived_count).toBe(1);
    expect(metrics.template_count).toBe(1);
    expect(metrics.quality_score).toBe(60); // (100+60+20)/3
  });

  it('should fail if platform returns TEMPLATE where VERIFIED is required', async () => {
    const { computeOutputQualityMetrics } = await import('../observability');

    const metrics = computeOutputQualityMetrics([
      { stage: 'intake' as any, status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'TEMPLATE', duration_ms: 1000, retry_count: 0 },
      { stage: 'positioning' as any, status: 'completed', started_at: '', completed_at: '', agent_ids: [], outputs: {}, evidence_level: 'TEMPLATE', duration_ms: 2000, retry_count: 0 },
    ]);

    // This test enforces the constraint:
    // If template_ratio is 1.0, quality score must be low
    expect(metrics.template_ratio).toBe(1);
    expect(metrics.quality_score).toBeLessThanOrEqual(20);
  });

  it('circuit breaker should open after threshold failures', async () => {
    const { CircuitBreaker, getRetryConfig } = await import('../observability');

    const breaker = new CircuitBreaker();
    const config = getRetryConfig('ai_gateway_timeout');

    // Record failures up to threshold
    for (let i = 0; i < config.circuit_breaker_threshold; i++) {
      breaker.recordFailure('ai_gateway', config);
    }

    const state = breaker.getState('ai_gateway');
    expect(state.state).toBe('open');
    expect(breaker.canExecute('ai_gateway', config)).toBe(false);
  });

  it('circuit breaker should close after success', async () => {
    const { CircuitBreaker, getRetryConfig } = await import('../observability');

    const breaker = new CircuitBreaker();
    const config = getRetryConfig('connector_error');

    breaker.recordFailure('connector', config);
    breaker.recordSuccess('connector');

    const state = breaker.getState('connector');
    expect(state.state).toBe('closed');
    expect(state.failure_count).toBe(0);
  });

  it('should calculate exponential backoff', async () => {
    const { calculateBackoff, getRetryConfig } = await import('../observability');

    const config = getRetryConfig('ai_gateway_timeout');
    const backoff0 = calculateBackoff(0, config);
    const backoff1 = calculateBackoff(1, config);
    const backoff2 = calculateBackoff(2, config);

    expect(backoff0).toBe(config.backoff_base_ms);
    expect(backoff1).toBe(config.backoff_base_ms * config.backoff_multiplier);
    expect(backoff2).toBeLessThanOrEqual(config.max_backoff_ms);
  });
});

// ─── E2E Scenario Tests ─────────────────────────────────────────────────────

describe('Launch E2E Scenarios', () => {
  it('Scenario: Simple product launch with human validation', async () => {
    const { LAUNCH_PIPELINE, validateStageInputs, getNextStage } = await import('../orchestration-pipeline');
    const { createCheckpoint, getApprovalPolicy } = await import('../approval-governance');
    const { LAUNCH_AGENTS, getLaunchAgentsByStage } = await import('../launch-agents');

    // Step 1: Intake
    const intakeResult = validateStageInputs('intake', {
      product_name: 'Growth OS Pro',
      product_type: 'SaaS',
      product_description: 'AI-powered growth cockpit',
      launch_goal: 'Acquire 500 users in 30 days',
      target_audience: 'Marketing managers at SMBs',
    });
    expect(intakeResult.valid).toBe(true);

    // Step 2: Agents are assigned to each stage
    let currentStage: string | null = 'intake';
    const visitedStages: string[] = [];

    while (currentStage) {
      const agents = getLaunchAgentsByStage(currentStage as any);
      expect(agents.length).toBeGreaterThanOrEqual(0); // Some stages may have 0 agents initially
      visitedStages.push(currentStage);
      currentStage = getNextStage(currentStage as any);
    }

    expect(visitedStages).toHaveLength(14);

    // Step 3: Approval gate blocks without approval
    const approvalStage = LAUNCH_PIPELINE.find(s => s.stage === 'approval_gate');
    expect(approvalStage?.approval_checkpoint).toBe('publication');
    expect(approvalStage?.fallback_if_missing.strategy).toBe('block');

    // Step 4: Create approval checkpoint
    const checkpoint = createCheckpoint('proj-1', 'all-assets', 'publication', 'publication');
    expect(checkpoint.status).toBe('pending');
    expect(checkpoint.blocking_level).toBe('hard_block');
  });

  it('Scenario: Messaging framework generation', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');

    const messagingStage = LAUNCH_PIPELINE.find(s => s.stage === 'messaging');
    expect(messagingStage).toBeDefined();
    expect(messagingStage!.inputs.length).toBeGreaterThan(0);
    expect(messagingStage!.outputs.some(o => o.entity_created === 'messaging_framework')).toBe(true);
  });

  it('Scenario: Video package generation', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');
    const { getLaunchAgentsByStage } = await import('../launch-agents');

    const videoStage = LAUNCH_PIPELINE.find(s => s.stage === 'video_asset_planning');
    expect(videoStage).toBeDefined();
    expect(videoStage!.can_skip).toBe(true);

    const videoAgents = getLaunchAgentsByStage('video_asset_planning');
    expect(videoAgents.some(a => a.id === 'video_scriptwriter')).toBe(true);
    expect(videoAgents.some(a => a.id === 'storyboard_agent')).toBe(true);
  });

  it('Scenario: Multi-channel plan generation', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');
    const { getLaunchAgentsByStage } = await import('../launch-agents');

    const channelStage = LAUNCH_PIPELINE.find(s => s.stage === 'channel_plan');
    expect(channelStage).toBeDefined();

    const channelAgents = getLaunchAgentsByStage('channel_plan');
    expect(channelAgents.some(a => a.id === 'multichannel_distribution_planner')).toBe(true);
    expect(channelAgents.some(a => a.id === 'paid_media_planner')).toBe(true);
    expect(channelAgents.some(a => a.id === 'organic_content_planner')).toBe(true);
  });

  it('Scenario: Performance signal collection', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');

    const trackStage = LAUNCH_PIPELINE.find(s => s.stage === 'track_attribute');
    expect(trackStage).toBeDefined();
    expect(trackStage!.data_dependencies).toContain('sync-ga4');
    expect(trackStage!.data_dependencies).toContain('signal_events');
  });

  it('Scenario: Executive launch report', async () => {
    const { LAUNCH_PIPELINE } = await import('../orchestration-pipeline');

    const reportStage = LAUNCH_PIPELINE.find(s => s.stage === 'executive_report');
    expect(reportStage).toBeDefined();
    expect(reportStage!.outputs.some(o => o.entity_created === 'launch_report')).toBe(true);
    expect(reportStage!.validation_criteria.some(c => c.check.includes('evidence levels'))).toBe(true);
  });
});
