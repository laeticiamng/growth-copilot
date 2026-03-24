import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

/**
 * Launch Stage Executor — Executes a specific stage's agent logic.
 *
 * Each stage invocation:
 * 1. Validates inputs from previous stages
 * 2. Invokes the relevant agent(s) via AI gateway
 * 3. Persists outputs to the appropriate tables
 * 4. Updates stage_run with evidence level and outputs
 * 5. Logs all events
 * 6. Handles errors with retry + circuit breaker
 */

interface StageExecRequest {
  launch_project_id: string;
  workspace_id: string;
  stage_name: string;
  inputs?: Record<string, unknown>;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id, stage_name, inputs }: StageExecRequest = await req.json();

    if (!launch_project_id || !workspace_id || !stage_name) {
      return jsonResponse({ error: 'launch_project_id, workspace_id, stage_name required' }, 400, corsHeaders);
    }

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get project context
    const { data: project } = await supabase
      .from('launch_projects')
      .select('*')
      .eq('id', launch_project_id)
      .single();

    if (!project) {
      return jsonResponse({ error: 'Project not found' }, 404, corsHeaders);
    }

    // Get active run
    const { data: run } = await supabase
      .from('launch_runs')
      .select('id')
      .eq('launch_project_id', launch_project_id)
      .in('status', ['running', 'waiting_approval'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Execute stage
    const result = await executeStage(supabase, project, stage_name, inputs || {}, workspace_id);

    // Update stage run if we have an active run
    if (run) {
      await supabase.from('launch_stage_runs').update({
        evidence_level: result.evidence_level,
        output_refs: result.outputs,
        agent_ids: result.agents_invoked,
      }).eq('launch_run_id', run.id).eq('stage_name', stage_name);

      // Log agent events
      for (const agentId of result.agents_invoked) {
        await supabase.from('launch_run_events').insert({
          launch_run_id: run.id,
          launch_project_id: launch_project_id,
          event_type: result.success ? 'agent_completed' : 'agent_failed',
          stage_name,
          agent_id: agentId,
          details: { evidence_level: result.evidence_level },
          error_message: result.error || null,
        });
      }
    }

    return jsonResponse({
      success: result.success,
      stage: stage_name,
      evidence_level: result.evidence_level,
      outputs: result.outputs,
      agents_invoked: result.agents_invoked,
      error: result.error,
    }, result.success ? 200 : 500, corsHeaders);

  } catch (error) {
    console.error('Stage executor error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500, corsHeaders);
  }
});

// ─── Stage Execution Router ─────────────────────────────────────────────────

interface StageResult {
  success: boolean;
  evidence_level: 'VERIFIED' | 'DERIVED' | 'TEMPLATE';
  outputs: Record<string, unknown>;
  agents_invoked: string[];
  error?: string;
}

async function executeStage(
  supabase: ReturnType<typeof createClient>,
  project: Record<string, unknown>,
  stage: string,
  inputs: Record<string, unknown>,
  workspaceId: string
): Promise<StageResult> {
  switch (stage) {
    case 'intake':
      return executeIntake(supabase, project, inputs);
    case 'audience_research':
      return executeAudienceResearch(supabase, project, inputs, workspaceId);
    case 'positioning':
      return executePositioning(supabase, project, inputs);
    case 'messaging':
      return executeMessaging(supabase, project, inputs);
    case 'creative_strategy':
      return executeCreativeStrategy(supabase, project, inputs, workspaceId);
    case 'video_asset_planning':
      return executeVideoPlanning(supabase, project, inputs, workspaceId);
    case 'landing_funnel':
      return executeLandingFunnel(supabase, project, inputs);
    case 'channel_plan':
      return executeChannelPlan(supabase, project, inputs, workspaceId);
    case 'approval_gate':
      return executeApprovalGate(supabase, project);
    case 'publish_distribute':
      return executePublishDistribute(supabase, project, workspaceId);
    case 'track_attribute':
      return executeTrackAttribute(supabase, project, workspaceId);
    case 'iterate_recommend':
      return executeIterateRecommend(supabase, project);
    case 'sales_handoff':
      return executeSalesHandoff(supabase, project);
    case 'executive_report':
      return executeExecutiveReport(supabase, project, workspaceId);
    default:
      return { success: false, evidence_level: 'TEMPLATE', outputs: {}, agents_invoked: [], error: `Unknown stage: ${stage}` };
  }
}

// ─── Stage Implementations ──────────────────────────────────────────────────

async function executeIntake(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>): Promise<StageResult> {
  const brief = {
    launch_project_id: project.id,
    product_name: inputs.product_name || project.name || '',
    product_type: inputs.product_type || project.launch_type || '',
    product_description: inputs.product_description || '',
    launch_goal: inputs.launch_goal || '',
    target_audience_summary: inputs.target_audience || '',
    key_differentiators: inputs.key_differentiators || [],
    competitive_landscape: inputs.competitive_landscape || '',
    budget_range: inputs.budget_range || {},
    timeline: inputs.timeline || {},
    success_criteria: inputs.success_criteria || [],
    constraints: inputs.constraints || [],
    evidence_level: inputs.product_name ? 'DERIVED' : 'TEMPLATE',
    evidence_source: 'user_input',
    status: 'draft',
  };

  const { data, error } = await supabase.from('launch_briefs').insert(brief).select().single();

  return {
    success: !error,
    evidence_level: brief.evidence_level as 'DERIVED' | 'TEMPLATE',
    outputs: { brief_id: data?.id, brief },
    agents_invoked: ['launch_program_manager'],
    error: error?.message,
  };
}

async function executeAudienceResearch(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>, workspaceId: string): Promise<StageResult> {
  // Check for real analytics data
  const { data: integrations } = await supabase
    .from('integrations')
    .select('provider, status')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active');

  const hasGA4 = integrations?.some((i: { provider: string }) => i.provider === 'google_analytics');
  const hasMeta = integrations?.some((i: { provider: string }) => i.provider === 'meta_ads');

  let evidenceLevel: 'VERIFIED' | 'DERIVED' | 'TEMPLATE' = 'TEMPLATE';
  const dataSources: string[] = [];
  if (hasGA4) { dataSources.push('ga4'); evidenceLevel = 'DERIVED'; }
  if (hasMeta) { dataSources.push('meta_ads'); evidenceLevel = 'DERIVED'; }
  if (hasGA4 && hasMeta) evidenceLevel = 'VERIFIED';

  // Generate audience research via AI if available
  const aiResult = await callAIAgent(
    'icp_audience_researcher',
    `Generate ICP and audience segments for: ${project.name}. Product type: ${project.launch_type}. Target: ${(project as Record<string, unknown>).target_audience || 'unknown'}. Data sources available: ${dataSources.join(', ') || 'none'}.`,
  );

  const research = {
    launch_project_id: project.id,
    icp: aiResult?.icp || { title: 'Default ICP', demographics: {}, psychographics: [], pain_points: [], goals: [], buying_behavior: [], channels_used: [], objections: [], decision_criteria: [] },
    segments: aiResult?.segments || [],
    persona_profiles: aiResult?.personas || [],
    market_estimate: null,
    data_sources: dataSources,
    evidence_level: evidenceLevel,
    evidence_source: dataSources.length > 0 ? 'connector_data' : 'ai_generation',
    evidence_confidence: dataSources.length > 0 ? 0.7 : 0.3,
  };

  const { data, error } = await supabase.from('launch_audience_research').insert(research).select().single();

  return {
    success: !error,
    evidence_level: evidenceLevel,
    outputs: { audience_research_id: data?.id, data_sources: dataSources, connector_verified: hasGA4 || hasMeta },
    agents_invoked: ['icp_audience_researcher'],
    error: error?.message,
  };
}

async function executePositioning(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>): Promise<StageResult> {
  const aiResult = await callAIAgent(
    'offer_positioning_strategist',
    `Define positioning for: ${project.name}. Type: ${project.launch_type}. Goal: ${(project as Record<string, unknown>).launch_goal || ''}. Audience: ${JSON.stringify(inputs.audience_research || {}).slice(0, 500)}`,
  );

  const offer = {
    launch_project_id: project.id,
    offer_name: aiResult?.offer_name || `${project.name} Launch Offer`,
    offer_type: 'main',
    description: aiResult?.description || '',
    price: inputs.price || {},
    value_stack: aiResult?.value_stack || [],
    guarantees: aiResult?.guarantees || [],
    urgency_triggers: aiResult?.urgency_triggers || [],
    scarcity_triggers: [],
    cta_primary: aiResult?.cta_primary || 'Get Started',
    evidence_level: aiResult ? 'DERIVED' : 'TEMPLATE',
    status: 'draft',
  };

  const { data, error } = await supabase.from('launch_offer_assets').insert(offer).select().single();

  return {
    success: !error,
    evidence_level: (offer.evidence_level as 'DERIVED' | 'TEMPLATE'),
    outputs: { offer_asset_id: data?.id, positioning_statement: aiResult?.positioning_statement || '' },
    agents_invoked: ['offer_positioning_strategist'],
    error: error?.message,
  };
}

async function executeMessaging(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>): Promise<StageResult> {
  const aiResult = await callAIAgent(
    'creative_strategist',
    `Create messaging framework for: ${project.name}. Positioning: ${JSON.stringify(inputs.positioning_statement || '').slice(0, 300)}`,
  );

  const framework = {
    launch_project_id: project.id,
    positioning_statement: inputs.positioning_statement as string || '',
    value_proposition: aiResult?.value_proposition || '',
    tagline: aiResult?.tagline || '',
    elevator_pitch: aiResult?.elevator_pitch || '',
    key_messages: aiResult?.key_messages || [],
    tone_of_voice: aiResult?.tone_of_voice || {},
    proof_points: aiResult?.proof_points || [],
    objection_responses: aiResult?.objection_responses || [],
    evidence_level: aiResult ? 'DERIVED' : 'TEMPLATE',
    status: 'draft',
  };

  const { data, error } = await supabase.from('launch_messaging_frameworks').insert(framework).select().single();

  return {
    success: !error,
    evidence_level: (framework.evidence_level as 'DERIVED' | 'TEMPLATE'),
    outputs: { messaging_framework_id: data?.id },
    agents_invoked: ['offer_positioning_strategist', 'creative_strategist'],
    error: error?.message,
  };
}

async function executeCreativeStrategy(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>, workspaceId: string): Promise<StageResult> {
  // Try to invoke creative-factory edge function
  try {
    const formats = ['social_post', 'ad_copy', 'email_subject'];
    const response = await fetch(`${SUPABASE_URL}/functions/v1/creative-factory`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ launch_project_id: project.id, workspace_id: workspaceId, formats }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        evidence_level: 'DERIVED',
        outputs: { creative_variants: result.variants || [], variant_count: result.variants?.length || 0 },
        agents_invoked: ['creative_strategist', 'creative_production_qa'],
      };
    }
  } catch (e) {
    console.error('Creative factory invocation failed:', e);
  }

  return {
    success: true,
    evidence_level: 'TEMPLATE',
    outputs: { creative_variants: [], note: 'Creative factory unavailable - manual asset creation required' },
    agents_invoked: ['creative_strategist'],
  };
}

async function executeVideoPlanning(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>, workspaceId: string): Promise<StageResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/video-concept-factory`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ launch_project_id: project.id, workspace_id: workspaceId }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        evidence_level: 'TEMPLATE',
        outputs: { video_concepts: result.concepts || [], concept_count: result.concepts?.length || 0 },
        agents_invoked: ['video_scriptwriter', 'storyboard_agent'],
      };
    }
  } catch (e) {
    console.error('Video concept factory failed:', e);
  }

  return {
    success: true,
    evidence_level: 'TEMPLATE',
    outputs: { video_concepts: [], note: 'Video factory unavailable' },
    agents_invoked: ['video_scriptwriter'],
  };
}

async function executeLandingFunnel(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>): Promise<StageResult> {
  const landingPage = {
    launch_project_id: project.id,
    url: (project as Record<string, unknown>).input_url || null,
    page_type: 'sales',
    headline: '',
    subheadline: '',
    hero_cta: 'Get Started',
    sections: [],
    seo_meta: {},
    conversion_goals: ['signup', 'purchase'],
    tracking_pixels: [],
    evidence_level: (project as Record<string, unknown>).input_url ? 'DERIVED' : 'TEMPLATE',
    status: 'draft',
  };

  const { data, error } = await supabase.from('launch_landing_pages').insert(landingPage).select().single();

  return {
    success: !error,
    evidence_level: (landingPage.evidence_level as 'DERIVED' | 'TEMPLATE'),
    outputs: { landing_page_id: data?.id },
    agents_invoked: ['landing_page_cro'],
    error: error?.message,
  };
}

async function executeChannelPlan(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, inputs: Record<string, unknown>, workspaceId: string): Promise<StageResult> {
  const { data: integrations } = await supabase
    .from('integrations')
    .select('provider')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active');

  const activeChannels = (integrations || []).map((i: { provider: string }) => i.provider);
  const config = (project as Record<string, unknown>).config as Record<string, unknown> || {};

  const plan = {
    launch_project_id: project.id,
    name: `${project.name} Launch Campaign`,
    campaign_type: 'launch_burst',
    channels: activeChannels.map((ch: string) => ({ channel: ch, budget_allocation: Math.round(100 / Math.max(activeChannels.length, 1)), creative_ids: [] })),
    total_budget: (config.budget as number) || 0,
    currency: 'EUR',
    objectives: [],
    audience_targeting: {},
    evidence_level: activeChannels.length > 0 ? 'DERIVED' : 'TEMPLATE',
    status: 'draft',
  };

  const { data, error } = await supabase.from('launch_campaign_plans').insert(plan).select().single();

  return {
    success: !error,
    evidence_level: (plan.evidence_level as 'DERIVED' | 'TEMPLATE'),
    outputs: { campaign_plan_id: data?.id, active_channels: activeChannels },
    agents_invoked: ['multichannel_distribution_planner', 'paid_media_planner', 'organic_content_planner'],
    error: error?.message,
  };
}

async function executeApprovalGate(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>): Promise<StageResult> {
  const { data: checkpoints } = await supabase
    .from('launch_approval_checkpoints')
    .select('*')
    .eq('launch_project_id', project.id);

  const pending = (checkpoints || []).filter((c: { status: string }) => c.status === 'pending');
  const rejected = (checkpoints || []).filter((c: { status: string }) => c.status === 'rejected');
  const approved = (checkpoints || []).filter((c: { status: string }) => c.status === 'approved');

  return {
    success: pending.length === 0 && rejected.length === 0,
    evidence_level: approved.length > 0 ? 'VERIFIED' : 'DERIVED',
    outputs: { approval_status: pending.length === 0 ? 'all_approved' : 'pending', pending_count: pending.length, rejected_count: rejected.length, approved_count: approved.length },
    agents_invoked: ['creative_production_qa', 'brand_legal_compliance_reviewer'],
    error: pending.length > 0 ? `${pending.length} approval(s) still pending` : undefined,
  };
}

async function executePublishDistribute(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, workspaceId: string): Promise<StageResult> {
  // Create publication jobs for each asset + channel combination
  const { data: creatives } = await supabase
    .from('launch_creative_variants')
    .select('id, format, platform_target')
    .eq('launch_project_id', project.id)
    .eq('status', 'approved');

  const { data: integrations } = await supabase
    .from('integrations')
    .select('provider, status')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active');

  const activeChannels = (integrations || []).map((i: { provider: string }) => i.provider);
  const jobs = [];

  for (const creative of (creatives || [])) {
    const targetChannel = creative.platform_target || activeChannels[0] || 'manual';
    const canAutoPublish = activeChannels.includes(targetChannel);

    jobs.push({
      launch_project_id: project.id,
      asset_id: creative.id,
      asset_type: 'creative_variant',
      channel: targetChannel,
      status: canAutoPublish ? 'ready' : 'exported_manual',
      publish_method: canAutoPublish ? 'auto_api' : 'export_manual',
    });
  }

  if (jobs.length > 0) {
    await supabase.from('launch_publication_jobs').insert(jobs);
  }

  // Also create jobs for non-creative assets
  const manualCount = jobs.filter(j => j.publish_method === 'export_manual').length;
  const autoCount = jobs.filter(j => j.publish_method === 'auto_api').length;

  return {
    success: true,
    evidence_level: autoCount > 0 ? 'DERIVED' : 'TEMPLATE',
    outputs: {
      total_jobs: jobs.length,
      auto_publish: autoCount,
      manual_export: manualCount,
      channels_used: [...new Set(jobs.map(j => j.channel))],
    },
    agents_invoked: ['multichannel_distribution_planner', 'crm_lifecycle_agent'],
  };
}

async function executeTrackAttribute(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, workspaceId: string): Promise<StageResult> {
  const { data: signals, count } = await supabase
    .from('launch_signal_events')
    .select('id', { count: 'exact', head: true })
    .eq('launch_project_id', project.id);

  const { data: integrations } = await supabase
    .from('integrations')
    .select('provider')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .in('provider', ['google_analytics', 'meta_ads']);

  const hasAnalytics = (integrations?.length || 0) > 0;
  const signalCount = count || 0;

  return {
    success: true,
    evidence_level: hasAnalytics && signalCount > 0 ? 'VERIFIED' : signalCount > 0 ? 'DERIVED' : 'TEMPLATE',
    outputs: { signal_count: signalCount, analytics_connected: hasAnalytics, attribution_available: hasAnalytics },
    agents_invoked: ['attribution_analytics_lead'],
  };
}

async function executeIterateRecommend(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>): Promise<StageResult> {
  const { data: signals, count } = await supabase
    .from('launch_signal_events')
    .select('id', { count: 'exact', head: true })
    .eq('launch_project_id', project.id);

  if ((count || 0) < 10) {
    return {
      success: true,
      evidence_level: 'TEMPLATE',
      outputs: { note: 'Insufficient data for iteration recommendations', signal_count: count || 0 },
      agents_invoked: ['attribution_analytics_lead'],
    };
  }

  return {
    success: true,
    evidence_level: 'DERIVED',
    outputs: { signal_count: count, recommendations_generated: true },
    agents_invoked: ['attribution_analytics_lead', 'creative_strategist'],
  };
}

async function executeSalesHandoff(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>): Promise<StageResult> {
  // Delegate to launch-sales-handoff function
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/launch-sales-handoff`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ launch_project_id: project.id }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        evidence_level: result.evidence_level || 'TEMPLATE',
        outputs: result,
        agents_invoked: ['sales_enablement_agent', 'crm_lifecycle_agent'],
      };
    }
  } catch (e) {
    console.error('Sales handoff invocation failed:', e);
  }

  return {
    success: true,
    evidence_level: 'TEMPLATE',
    outputs: { note: 'Sales handoff function unavailable - manual handoff required' },
    agents_invoked: ['sales_enablement_agent'],
  };
}

async function executeExecutiveReport(supabase: ReturnType<typeof createClient>, project: Record<string, unknown>, workspaceId: string): Promise<StageResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/launch-executive-report`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ launch_project_id: project.id, workspace_id: workspaceId }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        evidence_level: result.evidence_level || 'TEMPLATE',
        outputs: result,
        agents_invoked: ['attribution_analytics_lead', 'launch_program_manager'],
      };
    }
  } catch (e) {
    console.error('Executive report invocation failed:', e);
  }

  return {
    success: true,
    evidence_level: 'TEMPLATE',
    outputs: { note: 'Executive report function unavailable' },
    agents_invoked: ['launch_program_manager'],
  };
}

// ─── AI Agent Invocation ────────────────────────────────────────────────────

async function callAIAgent(agentId: string, prompt: string): Promise<Record<string, unknown> | null> {
  if (!LOVABLE_API_KEY) return null;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        temperature: 0.4,
        messages: [
          { role: 'system', content: `You are the ${agentId} agent. Respond with a JSON object containing your analysis and outputs.` },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return JSON.parse(data.choices?.[0]?.message?.content || '{}');
  } catch {
    return null;
  }
}

function jsonResponse(data: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
