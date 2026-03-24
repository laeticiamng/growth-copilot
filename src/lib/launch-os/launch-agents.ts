// ─── Launch OS Agent Definitions ─────────────────────────────────────────────
// 15 specialized agents for the launch operating system.
// Each agent has: name, role, objective, input/output schema, data dependencies,
// tools used, acceptance criteria, human approval requirements, stop conditions,
// escalation route, and KPI ownership.

import type { LaunchStage, EvidenceLevel } from './launch-entities';

// ─── Agent Spec Interface ────────────────────────────────────────────────────

export interface LaunchAgentSpec {
  id: string;
  name: string;
  role: string;
  objective: string;
  input_schema: Record<string, SchemaField>;
  output_schema: Record<string, SchemaField>;
  data_dependencies: DataDependency[];
  tools_used: string[];
  acceptance_criteria: string[];
  human_approval_required: boolean;
  approval_description: string | null;
  stop_conditions: string[];
  escalation_route: string;
  kpi_ownership: string[];
  stages_involved: LaunchStage[];
  evidence_output_level: EvidenceLevel;
}

export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
}

export interface DataDependency {
  source: string;
  type: 'database' | 'api' | 'connector' | 'user_input' | 'agent_output';
  required: boolean;
  fallback: string | null;
}

// ─── 15 Launch Agent Specifications ──────────────────────────────────────────

export const LAUNCH_AGENTS: LaunchAgentSpec[] = [
  // ─── 1. Launch Program Manager ─────────────────────────────────────────────
  {
    id: 'launch_program_manager',
    name: 'Launch Program Manager',
    role: 'Orchestrateur principal du programme de lancement',
    objective: 'Coordonner toutes les etapes du lancement, suivre les dependances, gerer la timeline et escalader les blocages.',
    input_schema: {
      launch_project_id: { type: 'string', required: true, description: 'ID du projet de lancement' },
      action: { type: 'string', required: true, description: 'Action: start_run, check_status, advance_stage, escalate' },
    },
    output_schema: {
      run_status: { type: 'object', required: true, description: 'Etat complet du run avec stages et blocages' },
      next_actions: { type: 'array', required: true, description: 'Actions suivantes recommandees' },
      blockers: { type: 'array', required: false, description: 'Liste des blocages actifs' },
    },
    data_dependencies: [
      { source: 'launch_projects', type: 'database', required: true, fallback: null },
      { source: 'launch_runs', type: 'database', required: true, fallback: 'create_new_run' },
      { source: 'approval_checkpoints', type: 'database', required: false, fallback: 'skip_approvals' },
    ],
    tools_used: ['supabase_client', 'ai_gateway', 'notification_service'],
    acceptance_criteria: [
      'All stages have defined inputs/outputs',
      'Blockers are surfaced within 5 minutes',
      'Timeline deviations trigger alerts',
      'Run status is always queryable',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['All stages completed', 'Project cancelled', 'Critical unresolvable blocker'],
    escalation_route: 'workspace_owner',
    kpi_ownership: ['launch_completion_rate', 'time_to_launch', 'stage_cycle_time'],
    stages_involved: ['intake', 'audience_research', 'positioning', 'messaging', 'creative_strategy', 'video_asset_planning', 'landing_funnel', 'channel_plan', 'approval_gate', 'publish_distribute', 'track_attribute', 'iterate_recommend', 'sales_handoff', 'executive_report'],
    evidence_output_level: 'VERIFIED',
  },

  // ─── 2. Offer & Positioning Strategist ─────────────────────────────────────
  {
    id: 'offer_positioning_strategist',
    name: 'Offer & Positioning Strategist',
    role: 'Stratege de positionnement et construction offre',
    objective: 'Definir le positionnement produit, la proposition de valeur, et construire une offre irresistible basee sur les donnees marche et audience.',
    input_schema: {
      launch_brief: { type: 'object', required: true, description: 'Brief de lancement avec produit, audience, objectifs' },
      audience_research: { type: 'object', required: false, description: 'Recherche audience si disponible' },
      competitor_data: { type: 'array', required: false, description: 'Donnees concurrentielles' },
    },
    output_schema: {
      positioning_statement: { type: 'string', required: true, description: 'Declaration de positionnement' },
      value_proposition: { type: 'string', required: true, description: 'Proposition de valeur' },
      offer_asset: { type: 'object', required: true, description: 'Offre structuree avec value stack' },
      evidence_level: { type: 'string', required: true, description: 'VERIFIED/DERIVED/TEMPLATE' },
    },
    data_dependencies: [
      { source: 'launch_briefs', type: 'database', required: true, fallback: null },
      { source: 'audience_research', type: 'agent_output', required: false, fallback: 'use_template_icp' },
      { source: 'competitors', type: 'database', required: false, fallback: 'skip_competitive_analysis' },
    ],
    tools_used: ['ai_gateway', 'supabase_client'],
    acceptance_criteria: [
      'Positioning statement is specific and differentiated',
      'Value proposition addresses top 3 pain points',
      'Offer has minimum 3 value stack items',
      'Evidence level is clearly tagged',
    ],
    human_approval_required: true,
    approval_description: 'Le positionnement et l offre doivent etre valides par le owner avant la creation des assets.',
    stop_conditions: ['Positioning approved', 'No brief available', '3 rejections without new data'],
    escalation_route: 'launch_program_manager',
    kpi_ownership: ['offer_conversion_rate', 'positioning_clarity_score'],
    stages_involved: ['positioning'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 3. ICP / Audience Research Agent ──────────────────────────────────────
  {
    id: 'icp_audience_researcher',
    name: 'ICP & Audience Research Agent',
    role: 'Chercheur audience et ICP',
    objective: 'Construire un profil client ideal actionnable, segmenter l audience, et valider les hypotheses audience avec des donnees reelles.',
    input_schema: {
      launch_brief: { type: 'object', required: true, description: 'Brief de lancement' },
      existing_analytics: { type: 'object', required: false, description: 'Donnees GA4/Meta existantes' },
    },
    output_schema: {
      icp: { type: 'object', required: true, description: 'Profil client ideal structure' },
      segments: { type: 'array', required: true, description: 'Segments audience prioritises' },
      personas: { type: 'array', required: true, description: 'Profils persona detailles' },
      market_estimate: { type: 'object', required: false, description: 'Estimation marche TAM/SAM/SOM' },
    },
    data_dependencies: [
      { source: 'ga4_analytics', type: 'connector', required: false, fallback: 'template_audience' },
      { source: 'meta_audience_insights', type: 'connector', required: false, fallback: 'template_audience' },
      { source: 'launch_briefs', type: 'database', required: true, fallback: null },
    ],
    tools_used: ['ai_gateway', 'sync-ga4', 'sync-meta-ads', 'supabase_client'],
    acceptance_criteria: [
      'ICP has demographics, psychographics, pain points, and goals',
      'Minimum 2 audience segments defined',
      'Each segment has channel preference and messaging angle',
      'Evidence level reflects actual data availability',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['Research validated', 'No data sources available (outputs TEMPLATE)'],
    escalation_route: 'offer_positioning_strategist',
    kpi_ownership: ['audience_match_rate', 'segment_performance_delta'],
    stages_involved: ['audience_research'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 4. Creative Strategist ────────────────────────────────────────────────
  {
    id: 'creative_strategist',
    name: 'Creative Strategist',
    role: 'Directeur de creation et strategie creative',
    objective: 'Definir la strategie creative globale, les angles, les hooks, et orchestrer la production des assets.',
    input_schema: {
      messaging_framework: { type: 'object', required: true, description: 'Framework de messaging approuve' },
      audience_segments: { type: 'array', required: true, description: 'Segments audience cibles' },
      channels: { type: 'array', required: true, description: 'Canaux de distribution' },
    },
    output_schema: {
      creative_brief: { type: 'object', required: true, description: 'Brief creatif complet' },
      hook_bank: { type: 'array', required: true, description: 'Banque de hooks par angle' },
      format_matrix: { type: 'object', required: true, description: 'Matrice format x canal x segment' },
    },
    data_dependencies: [
      { source: 'messaging_frameworks', type: 'database', required: true, fallback: null },
      { source: 'campaign_memories', type: 'database', required: false, fallback: 'no_historical_data' },
      { source: 'brand_kit', type: 'database', required: false, fallback: 'default_brand_guidelines' },
    ],
    tools_used: ['ai_gateway', 'creative-factory', 'supabase_client'],
    acceptance_criteria: [
      'Minimum 5 hooks per audience segment',
      'Creative brief covers all enabled channels',
      'Hook bank includes urgency, curiosity, pain, and aspiration angles',
      'Format matrix accounts for platform-specific constraints',
    ],
    human_approval_required: true,
    approval_description: 'La strategie creative doit etre validee avant de lancer la production.',
    stop_conditions: ['Creative brief approved', 'No messaging framework available'],
    escalation_route: 'launch_program_manager',
    kpi_ownership: ['hook_retention_rate', 'creative_ctr', 'creative_fatigue_rate'],
    stages_involved: ['creative_strategy'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 5. Video Scriptwriter ─────────────────────────────────────────────────
  {
    id: 'video_scriptwriter',
    name: 'Video Scriptwriter',
    role: 'Scenariste video marketing',
    objective: 'Ecrire des scripts video performants avec hooks, structure narrative, et CTA optimises pour chaque plateforme.',
    input_schema: {
      creative_brief: { type: 'object', required: true, description: 'Brief creatif' },
      hook_bank: { type: 'array', required: true, description: 'Banque de hooks' },
      target_platforms: { type: 'array', required: true, description: 'Plateformes cibles' },
    },
    output_schema: {
      scripts: { type: 'array', required: true, description: 'Scripts video avec timing scene par scene' },
      voiceover_texts: { type: 'array', required: true, description: 'Textes voix-off' },
      cta_variants: { type: 'array', required: true, description: 'Variantes CTA par script' },
    },
    data_dependencies: [
      { source: 'creative_brief', type: 'agent_output', required: true, fallback: null },
      { source: 'video-concept-factory', type: 'api', required: false, fallback: 'generate_from_brief' },
    ],
    tools_used: ['ai_gateway', 'video-concept-factory', 'supabase_client'],
    acceptance_criteria: [
      'Each script has hook within first 3 seconds',
      'Scripts include timing for each scene',
      'Voiceover matches visual pacing',
      'CTA is clear and actionable',
    ],
    human_approval_required: true,
    approval_description: 'Les scripts video doivent etre valides avant production.',
    stop_conditions: ['Scripts approved', 'No creative brief available'],
    escalation_route: 'creative_strategist',
    kpi_ownership: ['video_completion_rate', 'hook_retention_3s'],
    stages_involved: ['video_asset_planning'],
    evidence_output_level: 'TEMPLATE',
  },

  // ─── 6. Storyboard Agent ───────────────────────────────────────────────────
  {
    id: 'storyboard_agent',
    name: 'Storyboard Agent',
    role: 'Architecte visuel et storyboarder',
    objective: 'Transformer les scripts en storyboards detailles avec descriptions visuelles, transitions, et annotations de production.',
    input_schema: {
      scripts: { type: 'array', required: true, description: 'Scripts video approuves' },
      brand_guidelines: { type: 'object', required: false, description: 'Guidelines visuelles de marque' },
    },
    output_schema: {
      storyboards: { type: 'array', required: true, description: 'Storyboards avec scenes detaillees' },
      shot_lists: { type: 'array', required: true, description: 'Listes de plans par video' },
      production_notes: { type: 'array', required: true, description: 'Notes de production' },
    },
    data_dependencies: [
      { source: 'video_scripts', type: 'agent_output', required: true, fallback: null },
      { source: 'brand_kit', type: 'database', required: false, fallback: 'generic_visual_style' },
    ],
    tools_used: ['ai_gateway', 'supabase_client'],
    acceptance_criteria: [
      'Each scene has visual description, text overlay, and transition',
      'Shot list includes framing and movement notes',
      'Storyboard aligns with brand visual identity',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['Storyboards generated', 'No scripts available'],
    escalation_route: 'video_scriptwriter',
    kpi_ownership: [],
    stages_involved: ['video_asset_planning'],
    evidence_output_level: 'TEMPLATE',
  },

  // ─── 7. Creative Production QA Agent ───────────────────────────────────────
  {
    id: 'creative_production_qa',
    name: 'Creative Production QA Agent',
    role: 'Controleur qualite creatif',
    objective: 'Verifier la conformite branding, la coherence message/offre, la clarte CTA, la conformite pub, et la qualite langue de tous les assets.',
    input_schema: {
      assets: { type: 'array', required: true, description: 'Assets creatifs a verifier' },
      brand_guidelines: { type: 'object', required: false, description: 'Guidelines de marque' },
      messaging_framework: { type: 'object', required: false, description: 'Framework de messaging' },
    },
    output_schema: {
      qa_results: { type: 'array', required: true, description: 'Resultats QA par asset' },
      issues_found: { type: 'array', required: true, description: 'Problemes detectes' },
      compliance_status: { type: 'string', required: true, description: 'pass/fail/warning' },
    },
    data_dependencies: [
      { source: 'creative_variants', type: 'database', required: true, fallback: null },
      { source: 'messaging_frameworks', type: 'database', required: false, fallback: 'skip_message_check' },
    ],
    tools_used: ['ai_gateway', 'creative-qa', 'supabase_client'],
    acceptance_criteria: [
      'Brand compliance checked (colors, fonts, tone)',
      'Message/offer coherence verified',
      'CTA clarity scored',
      'Ad platform compliance checked (Meta, Google policies)',
      'Language/typo/claims reviewed',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['All assets reviewed', 'No assets to review'],
    escalation_route: 'creative_strategist',
    kpi_ownership: ['creative_rejection_rate', 'ad_disapproval_rate'],
    stages_involved: ['creative_strategy', 'approval_gate'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 8. Multi-Channel Distribution Planner ─────────────────────────────────
  {
    id: 'multichannel_distribution_planner',
    name: 'Multi-Channel Distribution Planner',
    role: 'Planificateur de distribution multicanal',
    objective: 'Orchestrer la distribution des assets sur tous les canaux actives, planifier le calendrier de publication, et coordonner les touchpoints.',
    input_schema: {
      campaign_plan: { type: 'object', required: true, description: 'Plan de campagne' },
      creative_assets: { type: 'array', required: true, description: 'Assets creatifs approuves' },
      channels: { type: 'array', required: true, description: 'Canaux actives' },
    },
    output_schema: {
      distribution_plan: { type: 'object', required: true, description: 'Plan de distribution complet' },
      publishing_calendar: { type: 'array', required: true, description: 'Calendrier de publication' },
      touchpoint_map: { type: 'object', required: true, description: 'Carte des touchpoints par segment' },
    },
    data_dependencies: [
      { source: 'campaign_plans', type: 'database', required: true, fallback: null },
      { source: 'creative_variants', type: 'database', required: true, fallback: null },
      { source: 'integrations', type: 'database', required: false, fallback: 'manual_distribution' },
    ],
    tools_used: ['ai_gateway', 'supabase_client'],
    acceptance_criteria: [
      'All channels have assigned assets',
      'Calendar respects platform-specific timing rules',
      'Pre-launch, launch-day, post-launch phases defined',
      'Budget allocation per channel specified',
    ],
    human_approval_required: true,
    approval_description: 'Le plan de distribution doit etre approuve avant activation.',
    stop_conditions: ['Plan approved', 'No assets or channels available'],
    escalation_route: 'launch_program_manager',
    kpi_ownership: ['channel_reach', 'touchpoint_frequency', 'distribution_completeness'],
    stages_involved: ['channel_plan', 'publish_distribute'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 9. Paid Media Planner ─────────────────────────────────────────────────
  {
    id: 'paid_media_planner',
    name: 'Paid Media Planner',
    role: 'Planificateur media payant',
    objective: 'Definir la strategie media payant, allouer le budget par plateforme, et optimiser le ROAS.',
    input_schema: {
      budget: { type: 'number', required: true, description: 'Budget total media' },
      audience_segments: { type: 'array', required: true, description: 'Segments audience' },
      platforms: { type: 'array', required: true, description: 'Plateformes publicitaires' },
    },
    output_schema: {
      media_plan: { type: 'object', required: true, description: 'Plan media avec allocation' },
      audience_targeting: { type: 'object', required: true, description: 'Ciblage par plateforme' },
      bid_strategy: { type: 'object', required: true, description: 'Strategie d enchere' },
    },
    data_dependencies: [
      { source: 'sync-meta-ads', type: 'connector', required: false, fallback: 'template_benchmarks' },
      { source: 'sync-ads', type: 'connector', required: false, fallback: 'template_benchmarks' },
      { source: 'campaign_memories', type: 'database', required: false, fallback: 'industry_benchmarks' },
    ],
    tools_used: ['ai_gateway', 'supabase_client'],
    acceptance_criteria: [
      'Budget allocation sums to 100%',
      'Each platform has targeting spec',
      'ROAS targets defined per channel',
      'Evidence level reflects data availability',
    ],
    human_approval_required: true,
    approval_description: 'L allocation budgetaire doit etre approuvee par le owner.',
    stop_conditions: ['Plan approved', 'No budget defined'],
    escalation_route: 'launch_program_manager',
    kpi_ownership: ['roas', 'cpa', 'ad_spend_efficiency'],
    stages_involved: ['channel_plan'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 10. Organic Content Planner ───────────────────────────────────────────
  {
    id: 'organic_content_planner',
    name: 'Organic Content Planner',
    role: 'Planificateur contenu organique',
    objective: 'Planifier et orchestrer le contenu organique sur tous les canaux non payants pour maximiser la portee naturelle.',
    input_schema: {
      messaging_framework: { type: 'object', required: true, description: 'Framework de messaging' },
      channels: { type: 'array', required: true, description: 'Canaux organiques actives' },
      content_assets: { type: 'array', required: true, description: 'Assets contenu disponibles' },
    },
    output_schema: {
      content_calendar: { type: 'array', required: true, description: 'Calendrier editorial' },
      repurposing_plan: { type: 'object', required: true, description: 'Plan de recyclage contenu' },
      hashtag_strategy: { type: 'object', required: true, description: 'Strategie hashtags par plateforme' },
    },
    data_dependencies: [
      { source: 'messaging_frameworks', type: 'database', required: true, fallback: null },
      { source: 'social_analytics', type: 'connector', required: false, fallback: 'generic_best_practices' },
    ],
    tools_used: ['ai_gateway', 'supabase_client'],
    acceptance_criteria: [
      'Calendar covers pre-launch through post-launch',
      'Content frequency matches platform best practices',
      'Repurposing plan maximizes asset utility',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['Calendar generated', 'No messaging framework available'],
    escalation_route: 'multichannel_distribution_planner',
    kpi_ownership: ['organic_reach', 'engagement_rate', 'share_rate'],
    stages_involved: ['channel_plan'],
    evidence_output_level: 'TEMPLATE',
  },

  // ─── 11. Landing Page CRO Agent ────────────────────────────────────────────
  {
    id: 'landing_page_cro',
    name: 'Landing Page CRO Agent',
    role: 'Optimiseur de conversion landing page',
    objective: 'Optimiser les landing pages de lancement pour maximiser le taux de conversion, avec tests A/B et recommandations UX.',
    input_schema: {
      landing_page: { type: 'object', required: true, description: 'Configuration landing page' },
      offer_asset: { type: 'object', required: true, description: 'Offre associee' },
      traffic_sources: { type: 'array', required: false, description: 'Sources de trafic' },
    },
    output_schema: {
      optimization_report: { type: 'object', required: true, description: 'Rapport CRO avec scores' },
      ab_test_suggestions: { type: 'array', required: true, description: 'Suggestions de tests A/B' },
      ux_improvements: { type: 'array', required: true, description: 'Ameliorations UX' },
    },
    data_dependencies: [
      { source: 'landing_page_assets', type: 'database', required: true, fallback: null },
      { source: 'ga4_analytics', type: 'connector', required: false, fallback: 'no_conversion_data' },
    ],
    tools_used: ['ai_gateway', 'site-analyze', 'supabase_client'],
    acceptance_criteria: [
      'Conversion bottlenecks identified',
      'CTA visibility and clarity scored',
      'Mobile responsiveness checked',
      'Page load performance assessed',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['Report generated', 'No landing page configured'],
    escalation_route: 'creative_strategist',
    kpi_ownership: ['landing_conversion_rate', 'bounce_rate', 'time_on_page'],
    stages_involved: ['landing_funnel'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 12. CRM / Lifecycle Launch Agent ──────────────────────────────────────
  {
    id: 'crm_lifecycle_agent',
    name: 'CRM & Lifecycle Launch Agent',
    role: 'Gestionnaire CRM et cycle de vie lancement',
    objective: 'Configurer les sequences email, les automations lifecycle, et les workflows de nurturing pour le lancement.',
    input_schema: {
      audience_segments: { type: 'array', required: true, description: 'Segments audience' },
      offer_asset: { type: 'object', required: true, description: 'Offre' },
      launch_timeline: { type: 'object', required: true, description: 'Timeline de lancement' },
    },
    output_schema: {
      email_sequences: { type: 'array', required: true, description: 'Sequences email par segment' },
      automation_rules: { type: 'array', required: true, description: 'Regles d automation' },
      lifecycle_map: { type: 'object', required: true, description: 'Carte du cycle de vie' },
    },
    data_dependencies: [
      { source: 'email_provider', type: 'connector', required: false, fallback: 'template_sequences' },
      { source: 'audience_research', type: 'agent_output', required: true, fallback: null },
    ],
    tools_used: ['ai_gateway', 'send-email', 'supabase_client'],
    acceptance_criteria: [
      'Pre-launch, launch, and post-launch sequences defined',
      'Each segment has tailored messaging',
      'Automation triggers are testable',
      'Unsubscribe and compliance handled',
    ],
    human_approval_required: true,
    approval_description: 'Les automations CRM doivent etre approuvees avant activation.',
    stop_conditions: ['Sequences approved', 'No email provider configured'],
    escalation_route: 'launch_program_manager',
    kpi_ownership: ['email_open_rate', 'email_click_rate', 'nurture_to_conversion'],
    stages_involved: ['channel_plan', 'publish_distribute', 'sales_handoff'],
    evidence_output_level: 'TEMPLATE',
  },

  // ─── 13. Attribution & Analytics Lead ──────────────────────────────────────
  {
    id: 'attribution_analytics_lead',
    name: 'Attribution & Analytics Lead',
    role: 'Responsable attribution et analytics',
    objective: 'Mesurer la performance du lancement avec attribution multi-touch, detecter les anomalies, et generer les insights.',
    input_schema: {
      launch_project_id: { type: 'string', required: true, description: 'ID projet' },
      date_range: { type: 'object', required: false, description: 'Periode d analyse' },
      attribution_model: { type: 'string', required: false, description: 'Modele d attribution' },
    },
    output_schema: {
      performance_report: { type: 'object', required: true, description: 'Rapport de performance' },
      attribution_breakdown: { type: 'object', required: true, description: 'Attribution par canal' },
      insights: { type: 'array', required: true, description: 'Insights detectes' },
      anomalies: { type: 'array', required: false, description: 'Anomalies detectees' },
    },
    data_dependencies: [
      { source: 'signal_events', type: 'database', required: true, fallback: 'no_data_available' },
      { source: 'ga4_analytics', type: 'connector', required: false, fallback: 'signals_only' },
      { source: 'meta_ads', type: 'connector', required: false, fallback: 'signals_only' },
    ],
    tools_used: ['ai_gateway', 'supabase_client', 'signal_graph'],
    acceptance_criteria: [
      'Attribution covers all active channels',
      'Anomaly detection runs with statistical tests',
      'Insights are actionable with suggested next steps',
      'Evidence level reflects data completeness',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['Report generated', 'No signal events available'],
    escalation_route: 'launch_program_manager',
    kpi_ownership: ['attribution_accuracy', 'data_freshness', 'insight_actionability'],
    stages_involved: ['track_attribute', 'iterate_recommend', 'executive_report'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 14. Sales Enablement Agent ────────────────────────────────────────────
  {
    id: 'sales_enablement_agent',
    name: 'Sales Enablement Agent',
    role: 'Agent d enablement commercial',
    objective: 'Capturer les leads du lancement, qualifier, transmettre au CRM, et fournir les outils de closing au commercial.',
    input_schema: {
      launch_project_id: { type: 'string', required: true, description: 'ID projet' },
      lead_data: { type: 'array', required: false, description: 'Donnees leads' },
    },
    output_schema: {
      qualified_leads: { type: 'array', required: true, description: 'Leads qualifies avec score' },
      handoff_actions: { type: 'array', required: true, description: 'Actions de handoff CRM' },
      sales_toolkit: { type: 'object', required: true, description: 'Kit commercial (pitch, objections, battlecards)' },
    },
    data_dependencies: [
      { source: 'lead_handoffs', type: 'database', required: false, fallback: 'no_leads_yet' },
      { source: 'signal_events', type: 'database', required: false, fallback: 'no_engagement_data' },
      { source: 'messaging_frameworks', type: 'database', required: false, fallback: null },
    ],
    tools_used: ['ai_gateway', 'supabase_client'],
    acceptance_criteria: [
      'Leads scored on engagement + fit',
      'MQL/SQL classification applied',
      'Handoff includes full context (touchpoints, content consumed)',
      'Sales toolkit includes objection responses and competitive battlecard',
    ],
    human_approval_required: false,
    approval_description: null,
    stop_conditions: ['Leads processed', 'No leads from launch'],
    escalation_route: 'launch_program_manager',
    kpi_ownership: ['lead_to_mql_rate', 'mql_to_sql_rate', 'sales_cycle_length'],
    stages_involved: ['sales_handoff'],
    evidence_output_level: 'DERIVED',
  },

  // ─── 15. Brand / Legal / Ad Compliance Reviewer ────────────────────────────
  {
    id: 'brand_legal_compliance_reviewer',
    name: 'Brand & Legal Compliance Reviewer',
    role: 'Reviseur conformite marque, legal et publicitaire',
    objective: 'Verifier que tous les assets respectent les guidelines marque, la reglementation publicitaire, et les contraintes legales.',
    input_schema: {
      assets: { type: 'array', required: true, description: 'Assets a verifier' },
      claims: { type: 'array', required: false, description: 'Claims marketing a valider' },
      target_markets: { type: 'array', required: false, description: 'Marches cibles (pour reglementation locale)' },
    },
    output_schema: {
      compliance_report: { type: 'object', required: true, description: 'Rapport de conformite' },
      issues: { type: 'array', required: true, description: 'Problemes de conformite' },
      cleared_assets: { type: 'array', required: true, description: 'Assets valides' },
      blocked_assets: { type: 'array', required: true, description: 'Assets bloques' },
    },
    data_dependencies: [
      { source: 'brand_kit', type: 'database', required: false, fallback: 'no_brand_check' },
      { source: 'creative_variants', type: 'database', required: true, fallback: null },
    ],
    tools_used: ['ai_gateway', 'supabase_client'],
    acceptance_criteria: [
      'All claims are verifiable or flagged',
      'Ad platform policies checked (Meta, Google, TikTok)',
      'Brand guidelines adherence scored',
      'Legal disclaimers present where required',
      'GDPR/privacy compliance verified for tracking',
    ],
    human_approval_required: true,
    approval_description: 'Les assets avec claims marketing ou implications legales doivent etre revus par un humain.',
    stop_conditions: ['All assets reviewed', 'No assets to review'],
    escalation_route: 'workspace_owner',
    kpi_ownership: ['ad_disapproval_rate', 'compliance_score', 'brand_consistency_score'],
    stages_involved: ['approval_gate'],
    evidence_output_level: 'DERIVED',
  },
];

// ─── Agent Runtime Status ────────────────────────────────────────────────────
// HONEST classification of each agent's runtime readiness.
// An agent is EXECUTABLE if it has backend execution code in launch-stage-executor.
// An agent is PARTIAL if it delegates to an existing edge function.
// An agent is SPEC_ONLY if it's defined but has no runtime.

export type AgentRuntimeStatus = 'executable' | 'partial' | 'spec_only' | 'disabled';

export interface AgentRuntimeClassification {
  agent_id: string;
  runtime_status: AgentRuntimeStatus;
  backend_function: string | null;
  execution_evidence: string;
  limitations: string[];
}

export const AGENT_RUNTIME_CLASSIFICATIONS: AgentRuntimeClassification[] = [
  {
    agent_id: 'launch_program_manager',
    runtime_status: 'executable',
    backend_function: 'launch-orchestrator',
    execution_evidence: 'Orchestrates run lifecycle via launch-orchestrator edge function. Creates runs, advances stages, manages state.',
    limitations: ['Does not autonomously detect timeline deviations', 'Escalation is notification-only'],
  },
  {
    agent_id: 'offer_positioning_strategist',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (positioning stage)',
    execution_evidence: 'Invoked via AI gateway during positioning stage. Generates positioning statement and offer asset.',
    limitations: ['Output quality depends on AI gateway availability', 'No competitive data enrichment yet'],
  },
  {
    agent_id: 'icp_audience_researcher',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (audience_research stage)',
    execution_evidence: 'Invoked via AI gateway. Checks GA4/Meta integrations for real data. Falls back to TEMPLATE if no connectors.',
    limitations: ['No direct GA4 API query — checks integration status only', 'Persona generation is AI-only'],
  },
  {
    agent_id: 'creative_strategist',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (messaging + creative_strategy stages)',
    execution_evidence: 'Generates messaging framework via AI gateway. Delegates creative production to creative-factory edge function.',
    limitations: ['Hook bank generation is AI-only, not data-validated'],
  },
  {
    agent_id: 'video_scriptwriter',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (video_asset_planning stage)',
    execution_evidence: 'Delegates to video-concept-factory edge function.',
    limitations: ['Scripts are AI-generated only', 'No production-ready video output'],
  },
  {
    agent_id: 'storyboard_agent',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (video_asset_planning stage)',
    execution_evidence: 'Part of video planning stage. Generates storyboard descriptions via AI.',
    limitations: ['No visual storyboard generation', 'Text descriptions only'],
  },
  {
    agent_id: 'creative_production_qa',
    runtime_status: 'partial',
    backend_function: 'creative-qa.ts (lib functions)',
    execution_evidence: 'Brand compliance, CTA clarity, and language quality check functions exist in creative-qa.ts.',
    limitations: ['Not automatically invoked during pipeline', 'Must be triggered manually or via stage executor'],
  },
  {
    agent_id: 'multichannel_distribution_planner',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (channel_plan + publish_distribute stages)',
    execution_evidence: 'Creates publication jobs per channel. Checks active integrations for auto-publish eligibility.',
    limitations: ['No actual API publishing to Meta/Google yet', 'All jobs exported for manual publishing'],
  },
  {
    agent_id: 'paid_media_planner',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (channel_plan stage)',
    execution_evidence: 'Generates budget allocation plan based on active channels.',
    limitations: ['No bid strategy optimization', 'No real-time ROAS tracking'],
  },
  {
    agent_id: 'organic_content_planner',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (channel_plan stage)',
    execution_evidence: 'Part of channel plan generation.',
    limitations: ['No content calendar generation', 'No repurposing automation'],
  },
  {
    agent_id: 'landing_page_cro',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (landing_funnel stage)',
    execution_evidence: 'Creates landing page asset record. References site-analyze for existing pages.',
    limitations: ['No real CRO analysis', 'No A/B test setup'],
  },
  {
    agent_id: 'crm_lifecycle_agent',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor + launch-sales-handoff',
    execution_evidence: 'Creates lifecycle follow-up queue entries. Manages CRM push log.',
    limitations: ['No real CRM integration (push is queued_manual)', 'No email sequence activation'],
  },
  {
    agent_id: 'attribution_analytics_lead',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (track_attribute + iterate_recommend + executive_report stages)',
    execution_evidence: 'Checks signal events and analytics integrations. Generates attribution availability report.',
    limitations: ['No multi-touch attribution model', 'Depends on signal events being ingested'],
  },
  {
    agent_id: 'sales_enablement_agent',
    runtime_status: 'executable',
    backend_function: 'launch-sales-handoff',
    execution_evidence: 'Scores leads from signal events. Creates handoff records with MQL/SQL classification. Generates follow-up queue.',
    limitations: ['Lead scoring is rule-based, not ML', 'No sales toolkit generation (battlecards)'],
  },
  {
    agent_id: 'brand_legal_compliance_reviewer',
    runtime_status: 'partial',
    backend_function: 'launch-stage-executor (approval_gate stage)',
    execution_evidence: 'Part of approval gate execution. Checks for pending approvals.',
    limitations: ['No actual legal compliance checking', 'No ad platform policy verification', 'Relies entirely on human review'],
  },
];

export function getAgentRuntimeStatus(agentId: string): AgentRuntimeClassification | undefined {
  return AGENT_RUNTIME_CLASSIFICATIONS.find(c => c.agent_id === agentId);
}

export function getExecutableAgents(): AgentRuntimeClassification[] {
  return AGENT_RUNTIME_CLASSIFICATIONS.filter(c => c.runtime_status === 'executable');
}

export function getPartialAgents(): AgentRuntimeClassification[] {
  return AGENT_RUNTIME_CLASSIFICATIONS.filter(c => c.runtime_status === 'partial');
}

export function getSpecOnlyAgents(): AgentRuntimeClassification[] {
  return AGENT_RUNTIME_CLASSIFICATIONS.filter(c => c.runtime_status === 'spec_only');
}

// ─── Agent Lookup Helpers ────────────────────────────────────────────────────

export function getLaunchAgentById(id: string): LaunchAgentSpec | undefined {
  return LAUNCH_AGENTS.find(a => a.id === id);
}

export function getLaunchAgentsByStage(stage: LaunchStage): LaunchAgentSpec[] {
  return LAUNCH_AGENTS.filter(a => a.stages_involved.includes(stage));
}

export function getLaunchAgentsRequiringApproval(): LaunchAgentSpec[] {
  return LAUNCH_AGENTS.filter(a => a.human_approval_required);
}
