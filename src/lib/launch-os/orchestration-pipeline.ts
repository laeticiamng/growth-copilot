// ─── Launch OS Orchestration Pipeline ─────────────────────────────────────────
// 14-stage end-to-end launch orchestration with validation, retry, and fallback.
//
// Each stage defines:
//   - inputs required
//   - outputs expected
//   - agents involved
//   - data dependencies
//   - validation criteria
//   - retry policy
//   - fallback if data absent
//   - confidence level

import type { LaunchStage, EvidenceLevel, ApprovalCheckpointType } from './launch-entities';

// ─── Stage Definition ────────────────────────────────────────────────────────

export interface StageDefinition {
  stage: LaunchStage;
  order: number;
  name: string;
  description: string;
  inputs: StageInput[];
  outputs: StageOutput[];
  agents: string[];           // launch agent IDs
  data_dependencies: string[];
  validation_criteria: ValidationCriterion[];
  retry_policy: RetryPolicy;
  fallback_if_missing: FallbackStrategy;
  confidence_level: ConfidenceSpec;
  approval_checkpoint: ApprovalCheckpointType | null;
  estimated_duration_minutes: number;
  can_skip: boolean;
  skip_conditions: string[];
}

export interface StageInput {
  key: string;
  type: string;
  required: boolean;
  source: 'user_input' | 'previous_stage' | 'database' | 'connector';
  description: string;
}

export interface StageOutput {
  key: string;
  type: string;
  entity_created: string | null;   // e.g. "launch_brief", "messaging_framework"
  description: string;
}

export interface ValidationCriterion {
  check: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface RetryPolicy {
  max_retries: number;
  backoff_ms: number;
  retry_on: string[];   // error types that trigger retry
}

export interface FallbackStrategy {
  strategy: 'skip' | 'template' | 'manual_input' | 'block';
  template_key: string | null;
  message: string;
}

export interface ConfidenceSpec {
  min_for_advance: EvidenceLevel;
  target: EvidenceLevel;
  degrades_to: EvidenceLevel;
}

// ─── Pipeline Definition ─────────────────────────────────────────────────────

export const LAUNCH_PIPELINE: StageDefinition[] = [
  // ─── Stage 1: Intake / Product Brief ─────────────────────────────────────
  {
    stage: 'intake',
    order: 1,
    name: 'Intake & Product Brief',
    description: 'Collecte des informations produit, objectifs de lancement, contraintes et criteres de succes.',
    inputs: [
      { key: 'product_name', type: 'string', required: true, source: 'user_input', description: 'Nom du produit' },
      { key: 'product_type', type: 'string', required: true, source: 'user_input', description: 'Type de produit' },
      { key: 'product_description', type: 'string', required: true, source: 'user_input', description: 'Description du produit' },
      { key: 'launch_goal', type: 'string', required: true, source: 'user_input', description: 'Objectif principal du lancement' },
      { key: 'target_audience', type: 'string', required: true, source: 'user_input', description: 'Audience cible' },
      { key: 'budget', type: 'number', required: false, source: 'user_input', description: 'Budget disponible' },
      { key: 'launch_date', type: 'string', required: false, source: 'user_input', description: 'Date de lancement souhaitee' },
    ],
    outputs: [
      { key: 'launch_brief', type: 'LaunchBrief', entity_created: 'launch_brief', description: 'Brief de lancement structure' },
      { key: 'initial_config', type: 'LaunchConfig', entity_created: null, description: 'Configuration initiale du projet' },
    ],
    agents: ['launch_program_manager'],
    data_dependencies: [],
    validation_criteria: [
      { check: 'product_name is not empty', severity: 'error', message: 'Le nom du produit est requis' },
      { check: 'launch_goal is not empty', severity: 'error', message: 'L objectif de lancement est requis' },
      { check: 'target_audience is not empty', severity: 'error', message: 'L audience cible est requise' },
    ],
    retry_policy: { max_retries: 0, backoff_ms: 0, retry_on: [] },
    fallback_if_missing: { strategy: 'block', template_key: null, message: 'Le brief est obligatoire pour demarrer un lancement.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'VERIFIED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: null,
    estimated_duration_minutes: 5,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 2: Audience & Market Understanding ────────────────────────────
  {
    stage: 'audience_research',
    order: 2,
    name: 'Audience & Market Understanding',
    description: 'Recherche et segmentation de l audience, construction ICP, analyse du marche.',
    inputs: [
      { key: 'launch_brief', type: 'LaunchBrief', required: true, source: 'previous_stage', description: 'Brief de lancement' },
      { key: 'ga4_data', type: 'object', required: false, source: 'connector', description: 'Donnees GA4 existantes' },
      { key: 'meta_data', type: 'object', required: false, source: 'connector', description: 'Donnees Meta existantes' },
    ],
    outputs: [
      { key: 'audience_research', type: 'AudienceResearch', entity_created: 'audience_research', description: 'Recherche audience complete' },
      { key: 'icp', type: 'IdealCustomerProfile', entity_created: null, description: 'Profil client ideal' },
      { key: 'segments', type: 'AudienceSegmentDef[]', entity_created: null, description: 'Segments audience' },
    ],
    agents: ['icp_audience_researcher'],
    data_dependencies: ['sync-ga4', 'sync-meta-ads'],
    validation_criteria: [
      { check: 'icp has pain_points', severity: 'error', message: 'L ICP doit inclure les pain points' },
      { check: 'segments.length >= 2', severity: 'warning', message: 'Au moins 2 segments recommandes' },
    ],
    retry_policy: { max_retries: 2, backoff_ms: 5000, retry_on: ['ai_gateway_timeout', 'connector_error'] },
    fallback_if_missing: { strategy: 'template', template_key: 'default_audience_research', message: 'Recherche audience generee en mode TEMPLATE (pas de donnees reelles connectees).' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'VERIFIED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: null,
    estimated_duration_minutes: 10,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 3: Positioning & Offer ────────────────────────────────────────
  {
    stage: 'positioning',
    order: 3,
    name: 'Positioning & Offer',
    description: 'Definition du positionnement, proposition de valeur, et construction de l offre.',
    inputs: [
      { key: 'launch_brief', type: 'LaunchBrief', required: true, source: 'previous_stage', description: 'Brief de lancement' },
      { key: 'audience_research', type: 'AudienceResearch', required: true, source: 'previous_stage', description: 'Recherche audience' },
      { key: 'competitor_data', type: 'object', required: false, source: 'database', description: 'Donnees concurrentielles' },
    ],
    outputs: [
      { key: 'positioning_statement', type: 'string', entity_created: null, description: 'Declaration de positionnement' },
      { key: 'offer_asset', type: 'OfferAsset', entity_created: 'offer_asset', description: 'Offre structuree' },
    ],
    agents: ['offer_positioning_strategist'],
    data_dependencies: ['competitors'],
    validation_criteria: [
      { check: 'positioning_statement is specific', severity: 'error', message: 'Le positionnement doit etre specifique et differencie' },
      { check: 'offer has value_stack', severity: 'error', message: 'L offre doit avoir un value stack' },
    ],
    retry_policy: { max_retries: 2, backoff_ms: 5000, retry_on: ['ai_gateway_timeout'] },
    fallback_if_missing: { strategy: 'template', template_key: 'default_positioning', message: 'Positionnement genere en mode TEMPLATE.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'DERIVED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: 'positioning',
    estimated_duration_minutes: 15,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 4: Messaging Framework ────────────────────────────────────────
  {
    stage: 'messaging',
    order: 4,
    name: 'Messaging Framework',
    description: 'Construction du framework de messaging: messages cles, ton, preuves, reponses aux objections.',
    inputs: [
      { key: 'positioning_statement', type: 'string', required: true, source: 'previous_stage', description: 'Positionnement' },
      { key: 'audience_research', type: 'AudienceResearch', required: true, source: 'previous_stage', description: 'Recherche audience' },
      { key: 'offer_asset', type: 'OfferAsset', required: true, source: 'previous_stage', description: 'Offre' },
    ],
    outputs: [
      { key: 'messaging_framework', type: 'MessagingFramework', entity_created: 'messaging_framework', description: 'Framework de messaging complet' },
    ],
    agents: ['offer_positioning_strategist', 'creative_strategist'],
    data_dependencies: [],
    validation_criteria: [
      { check: 'key_messages.length >= 3', severity: 'error', message: 'Minimum 3 messages cles requis' },
      { check: 'objection_responses.length >= 3', severity: 'warning', message: 'Minimum 3 reponses aux objections recommandees' },
    ],
    retry_policy: { max_retries: 1, backoff_ms: 3000, retry_on: ['ai_gateway_timeout'] },
    fallback_if_missing: { strategy: 'template', template_key: 'default_messaging', message: 'Messaging genere en mode TEMPLATE.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'DERIVED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: null,
    estimated_duration_minutes: 15,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 5: Creative Strategy ──────────────────────────────────────────
  {
    stage: 'creative_strategy',
    order: 5,
    name: 'Creative Strategy',
    description: 'Definition de la strategie creative: angles, hooks, formats, matrice canal/segment.',
    inputs: [
      { key: 'messaging_framework', type: 'MessagingFramework', required: true, source: 'previous_stage', description: 'Framework de messaging' },
      { key: 'audience_segments', type: 'AudienceSegmentDef[]', required: true, source: 'previous_stage', description: 'Segments audience' },
      { key: 'channels_enabled', type: 'string[]', required: true, source: 'database', description: 'Canaux actives' },
    ],
    outputs: [
      { key: 'creative_brief', type: 'object', entity_created: null, description: 'Brief creatif' },
      { key: 'hook_bank', type: 'array', entity_created: null, description: 'Banque de hooks' },
      { key: 'creative_variants', type: 'CreativeVariant[]', entity_created: 'creative_asset', description: 'Variantes creatives generees' },
    ],
    agents: ['creative_strategist', 'creative_production_qa'],
    data_dependencies: ['creative-factory'],
    validation_criteria: [
      { check: 'hook_bank.length >= 10', severity: 'warning', message: 'Minimum 10 hooks recommandes' },
      { check: 'creative_variants.length >= 3', severity: 'error', message: 'Minimum 3 variantes creatives requises' },
    ],
    retry_policy: { max_retries: 2, backoff_ms: 5000, retry_on: ['ai_gateway_timeout', 'creative_factory_error'] },
    fallback_if_missing: { strategy: 'template', template_key: 'default_creatives', message: 'Creatives generes en mode TEMPLATE.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'DERIVED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: 'ad_copy',
    estimated_duration_minutes: 20,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 6: Video & Asset Planning ─────────────────────────────────────
  {
    stage: 'video_asset_planning',
    order: 6,
    name: 'Video & Asset Planning',
    description: 'Creation des scripts video, storyboards, shot lists, et packaging canal.',
    inputs: [
      { key: 'creative_brief', type: 'object', required: true, source: 'previous_stage', description: 'Brief creatif' },
      { key: 'hook_bank', type: 'array', required: true, source: 'previous_stage', description: 'Banque de hooks' },
      { key: 'target_platforms', type: 'string[]', required: true, source: 'database', description: 'Plateformes video cibles' },
    ],
    outputs: [
      { key: 'video_concepts', type: 'VideoConcept[]', entity_created: 'video_asset', description: 'Concepts video avec scenes' },
      { key: 'storyboards', type: 'array', entity_created: null, description: 'Storyboards detailles' },
      { key: 'video_assets', type: 'VideoAsset[]', entity_created: 'video_asset', description: 'Assets video structures' },
    ],
    agents: ['video_scriptwriter', 'storyboard_agent'],
    data_dependencies: ['video-concept-factory'],
    validation_criteria: [
      { check: 'video_concepts.length >= 2', severity: 'error', message: 'Minimum 2 concepts video requis' },
      { check: 'each video has hook within 3s', severity: 'error', message: 'Chaque video doit avoir un hook dans les 3 premieres secondes' },
    ],
    retry_policy: { max_retries: 2, backoff_ms: 5000, retry_on: ['ai_gateway_timeout'] },
    fallback_if_missing: { strategy: 'skip', template_key: null, message: 'Video planning saute si pas de canaux video actives.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'TEMPLATE', degrades_to: 'TEMPLATE' },
    approval_checkpoint: 'video_script',
    estimated_duration_minutes: 20,
    can_skip: true,
    skip_conditions: ['no_video_channels_enabled'],
  },

  // ─── Stage 7: Landing Page & Funnel Setup ────────────────────────────────
  {
    stage: 'landing_funnel',
    order: 7,
    name: 'Landing Page & Funnel Setup',
    description: 'Configuration et optimisation des landing pages et entonnoirs de conversion.',
    inputs: [
      { key: 'offer_asset', type: 'OfferAsset', required: true, source: 'previous_stage', description: 'Offre' },
      { key: 'messaging_framework', type: 'MessagingFramework', required: true, source: 'previous_stage', description: 'Messaging' },
      { key: 'creative_variants', type: 'CreativeVariant[]', required: false, source: 'previous_stage', description: 'Variantes creatives' },
    ],
    outputs: [
      { key: 'landing_page_asset', type: 'LandingPageAsset', entity_created: 'landing_page_asset', description: 'Asset landing page' },
      { key: 'cro_report', type: 'object', entity_created: null, description: 'Rapport CRO initial' },
    ],
    agents: ['landing_page_cro'],
    data_dependencies: ['site-analyze'],
    validation_criteria: [
      { check: 'landing has CTA', severity: 'error', message: 'La landing page doit avoir un CTA clair' },
      { check: 'landing has tracking', severity: 'warning', message: 'Le tracking doit etre configure' },
    ],
    retry_policy: { max_retries: 1, backoff_ms: 3000, retry_on: ['site_analyze_error'] },
    fallback_if_missing: { strategy: 'template', template_key: 'default_landing', message: 'Landing page en mode TEMPLATE.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'DERIVED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: 'landing_page',
    estimated_duration_minutes: 15,
    can_skip: true,
    skip_conditions: ['no_landing_page_needed'],
  },

  // ─── Stage 8: Channel Plan ───────────────────────────────────────────────
  {
    stage: 'channel_plan',
    order: 8,
    name: 'Channel Plan',
    description: 'Planification detaillee par canal: budget, ciblage, calendrier, assets assignes.',
    inputs: [
      { key: 'channels_enabled', type: 'string[]', required: true, source: 'database', description: 'Canaux actives' },
      { key: 'creative_variants', type: 'CreativeVariant[]', required: true, source: 'previous_stage', description: 'Assets creatifs' },
      { key: 'budget', type: 'number', required: false, source: 'database', description: 'Budget total' },
      { key: 'audience_segments', type: 'AudienceSegmentDef[]', required: true, source: 'previous_stage', description: 'Segments' },
    ],
    outputs: [
      { key: 'campaign_plan', type: 'CampaignPlan', entity_created: 'campaign_plan', description: 'Plan de campagne' },
      { key: 'distribution_plan', type: 'DistributionPlan', entity_created: 'distribution_plan', description: 'Plan de distribution' },
    ],
    agents: ['multichannel_distribution_planner', 'paid_media_planner', 'organic_content_planner'],
    data_dependencies: ['sync-meta-ads', 'sync-ads'],
    validation_criteria: [
      { check: 'all channels have assigned assets', severity: 'error', message: 'Tous les canaux doivent avoir des assets assignes' },
      { check: 'budget allocation sums to 100%', severity: 'error', message: 'L allocation budgetaire doit totaliser 100%' },
    ],
    retry_policy: { max_retries: 1, backoff_ms: 3000, retry_on: ['ai_gateway_timeout'] },
    fallback_if_missing: { strategy: 'template', template_key: 'default_channel_plan', message: 'Plan canal en mode TEMPLATE.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'DERIVED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: 'campaign_plan',
    estimated_duration_minutes: 15,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 9: Approval Gate ──────────────────────────────────────────────
  {
    stage: 'approval_gate',
    order: 9,
    name: 'Approval Gate',
    description: 'Point de controle final avant publication. Verification conformite, brand, legal, et approbation humaine.',
    inputs: [
      { key: 'all_assets', type: 'array', required: true, source: 'previous_stage', description: 'Tous les assets du lancement' },
      { key: 'campaign_plan', type: 'CampaignPlan', required: true, source: 'previous_stage', description: 'Plan de campagne' },
      { key: 'readiness_score', type: 'ReadinessScore', required: false, source: 'database', description: 'Score de readiness' },
    ],
    outputs: [
      { key: 'approval_status', type: 'string', entity_created: null, description: 'Statut d approbation global' },
      { key: 'compliance_report', type: 'object', entity_created: null, description: 'Rapport de conformite' },
      { key: 'blocked_items', type: 'array', entity_created: null, description: 'Items bloques' },
    ],
    agents: ['creative_production_qa', 'brand_legal_compliance_reviewer'],
    data_dependencies: [],
    validation_criteria: [
      { check: 'no critical compliance issues', severity: 'error', message: 'Aucun probleme critique de conformite' },
      { check: 'human approval received', severity: 'error', message: 'L approbation humaine est requise' },
    ],
    retry_policy: { max_retries: 0, backoff_ms: 0, retry_on: [] },
    fallback_if_missing: { strategy: 'block', template_key: null, message: 'L approbation est obligatoire avant publication.' },
    confidence_level: { min_for_advance: 'DERIVED', target: 'VERIFIED', degrades_to: 'DERIVED' },
    approval_checkpoint: 'publication',
    estimated_duration_minutes: 30,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 10: Publish / Distribute ──────────────────────────────────────
  {
    stage: 'publish_distribute',
    order: 10,
    name: 'Publish & Distribute',
    description: 'Publication et distribution des assets sur tous les canaux actives.',
    inputs: [
      { key: 'approved_assets', type: 'array', required: true, source: 'previous_stage', description: 'Assets approuves' },
      { key: 'distribution_plan', type: 'DistributionPlan', required: true, source: 'previous_stage', description: 'Plan de distribution' },
    ],
    outputs: [
      { key: 'distribution_runs', type: 'DistributionRun[]', entity_created: null, description: 'Runs de distribution' },
      { key: 'publish_log', type: 'array', entity_created: null, description: 'Log de publication' },
    ],
    agents: ['multichannel_distribution_planner', 'crm_lifecycle_agent'],
    data_dependencies: ['integrations'],
    validation_criteria: [
      { check: 'all scheduled items published', severity: 'warning', message: 'Tous les items planifies doivent etre publies' },
    ],
    retry_policy: { max_retries: 3, backoff_ms: 10000, retry_on: ['connector_error', 'rate_limit', 'network_error'] },
    fallback_if_missing: { strategy: 'manual_input', template_key: null, message: 'Publication manuelle requise pour les canaux non connectes.' },
    confidence_level: { min_for_advance: 'DERIVED', target: 'VERIFIED', degrades_to: 'DERIVED' },
    approval_checkpoint: null,
    estimated_duration_minutes: 15,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 11: Track / Attribute ─────────────────────────────────────────
  {
    stage: 'track_attribute',
    order: 11,
    name: 'Track & Attribute',
    description: 'Suivi des performances et attribution multi-touch sur tous les canaux.',
    inputs: [
      { key: 'distribution_runs', type: 'DistributionRun[]', required: true, source: 'previous_stage', description: 'Runs de distribution' },
      { key: 'signal_events', type: 'SignalEvent[]', required: false, source: 'database', description: 'Evenements signal' },
    ],
    outputs: [
      { key: 'performance_snapshot', type: 'object', entity_created: null, description: 'Snapshot de performance' },
      { key: 'attribution_report', type: 'object', entity_created: null, description: 'Rapport d attribution' },
      { key: 'insights', type: 'LaunchInsight[]', entity_created: 'launch_insight', description: 'Insights detectes' },
    ],
    agents: ['attribution_analytics_lead'],
    data_dependencies: ['sync-ga4', 'sync-meta-ads', 'signal_events'],
    validation_criteria: [
      { check: 'signal events being received', severity: 'warning', message: 'Des evenements signal doivent etre recus' },
    ],
    retry_policy: { max_retries: 2, backoff_ms: 5000, retry_on: ['connector_error'] },
    fallback_if_missing: { strategy: 'template', template_key: null, message: 'Attribution limitee aux signaux internes si connecteurs absents.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'VERIFIED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: null,
    estimated_duration_minutes: 10,
    can_skip: false,
    skip_conditions: [],
  },

  // ─── Stage 12: Iterate / Recommend ───────────────────────────────────────
  {
    stage: 'iterate_recommend',
    order: 12,
    name: 'Iterate & Recommend',
    description: 'Boucle d iteration automatique: detection d anomalies, recommandations, actions correctives.',
    inputs: [
      { key: 'performance_snapshot', type: 'object', required: true, source: 'previous_stage', description: 'Snapshot de performance' },
      { key: 'decision_rules', type: 'DecisionRule[]', required: true, source: 'database', description: 'Regles de decision' },
    ],
    outputs: [
      { key: 'decision_actions', type: 'DecisionActionLog[]', entity_created: null, description: 'Actions recommandees' },
      { key: 'experiments_suggested', type: 'LaunchExperiment[]', entity_created: 'launch_experiment', description: 'Experiments suggerees' },
    ],
    agents: ['attribution_analytics_lead', 'creative_strategist'],
    data_dependencies: ['decision_engine', 'signal_events'],
    validation_criteria: [
      { check: 'actions are justified with data', severity: 'warning', message: 'Les actions doivent etre justifiees par des donnees' },
    ],
    retry_policy: { max_retries: 1, backoff_ms: 3000, retry_on: ['ai_gateway_timeout'] },
    fallback_if_missing: { strategy: 'skip', template_key: null, message: 'Pas assez de donnees pour iterer.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'DERIVED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: null,
    estimated_duration_minutes: 10,
    can_skip: true,
    skip_conditions: ['insufficient_data', 'launch_completed'],
  },

  // ─── Stage 13: Sales Handoff / CRM Follow-up ────────────────────────────
  {
    stage: 'sales_handoff',
    order: 13,
    name: 'Sales Handoff & CRM Follow-up',
    description: 'Capture des leads, qualification, transmission au CRM, et relances lifecycle.',
    inputs: [
      { key: 'signal_events', type: 'SignalEvent[]', required: true, source: 'database', description: 'Evenements signal' },
      { key: 'audience_segments', type: 'AudienceSegmentDef[]', required: true, source: 'previous_stage', description: 'Segments' },
    ],
    outputs: [
      { key: 'lead_handoffs', type: 'LeadHandoff[]', entity_created: 'lead_handoff', description: 'Leads transmis' },
      { key: 'sales_toolkit', type: 'object', entity_created: null, description: 'Kit commercial' },
    ],
    agents: ['sales_enablement_agent', 'crm_lifecycle_agent'],
    data_dependencies: ['signal_events'],
    validation_criteria: [
      { check: 'leads are scored', severity: 'warning', message: 'Les leads doivent etre scores' },
      { check: 'handoff includes context', severity: 'warning', message: 'Le handoff doit inclure le contexte d engagement' },
    ],
    retry_policy: { max_retries: 1, backoff_ms: 3000, retry_on: ['connector_error'] },
    fallback_if_missing: { strategy: 'skip', template_key: null, message: 'Pas de leads a transmettre.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'DERIVED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: null,
    estimated_duration_minutes: 10,
    can_skip: true,
    skip_conditions: ['no_leads', 'no_sales_team'],
  },

  // ─── Stage 14: Executive Launch Report ───────────────────────────────────
  {
    stage: 'executive_report',
    order: 14,
    name: 'Executive Launch Report',
    description: 'Rapport final de lancement avec KPIs, ROI, insights, et recommandations pour les prochains lancements.',
    inputs: [
      { key: 'all_stage_outputs', type: 'object', required: true, source: 'previous_stage', description: 'Tous les outputs des stages' },
      { key: 'signal_events', type: 'SignalEvent[]', required: true, source: 'database', description: 'Evenements signal' },
      { key: 'budget_data', type: 'object', required: false, source: 'database', description: 'Donnees budgetaires' },
    ],
    outputs: [
      { key: 'launch_report', type: 'LaunchReport', entity_created: 'launch_report', description: 'Rapport de lancement' },
      { key: 'campaign_memory', type: 'CampaignMemory', entity_created: null, description: 'Memoire de campagne' },
    ],
    agents: ['attribution_analytics_lead', 'launch_program_manager'],
    data_dependencies: ['signal_events', 'campaign_memories'],
    validation_criteria: [
      { check: 'report includes all KPIs', severity: 'warning', message: 'Le rapport doit inclure tous les KPIs cibles' },
      { check: 'evidence levels clearly tagged', severity: 'error', message: 'Les niveaux de preuve doivent etre clairement indiques' },
    ],
    retry_policy: { max_retries: 1, backoff_ms: 3000, retry_on: ['ai_gateway_timeout'] },
    fallback_if_missing: { strategy: 'template', template_key: 'default_report', message: 'Rapport genere en mode TEMPLATE avec donnees limitees.' },
    confidence_level: { min_for_advance: 'TEMPLATE', target: 'VERIFIED', degrades_to: 'TEMPLATE' },
    approval_checkpoint: null,
    estimated_duration_minutes: 15,
    can_skip: false,
    skip_conditions: [],
  },
];

// ─── Pipeline Helpers ────────────────────────────────────────────────────────

export function getStageDefinition(stage: LaunchStage): StageDefinition | undefined {
  return LAUNCH_PIPELINE.find(s => s.stage === stage);
}

export function getNextStage(currentStage: LaunchStage): LaunchStage | null {
  const current = LAUNCH_PIPELINE.find(s => s.stage === currentStage);
  if (!current) return null;
  const next = LAUNCH_PIPELINE.find(s => s.order === current.order + 1);
  return next?.stage ?? null;
}

export function getPreviousStage(currentStage: LaunchStage): LaunchStage | null {
  const current = LAUNCH_PIPELINE.find(s => s.stage === currentStage);
  if (!current || current.order <= 1) return null;
  const prev = LAUNCH_PIPELINE.find(s => s.order === current.order - 1);
  return prev?.stage ?? null;
}

export function getStageProgress(completedStages: LaunchStage[]): number {
  return Math.round((completedStages.length / LAUNCH_PIPELINE.length) * 100);
}

export function getStagesRequiringApproval(): StageDefinition[] {
  return LAUNCH_PIPELINE.filter(s => s.approval_checkpoint !== null);
}

export function validateStageInputs(
  stage: LaunchStage,
  inputs: Record<string, unknown>
): { valid: boolean; missing: string[]; warnings: string[] } {
  const def = getStageDefinition(stage);
  if (!def) return { valid: false, missing: ['stage_not_found'], warnings: [] };

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const input of def.inputs) {
    const value = inputs[input.key];
    if (input.required && (value === undefined || value === null)) {
      missing.push(input.key);
    }
  }

  for (const criterion of def.validation_criteria) {
    if (criterion.severity === 'warning') {
      warnings.push(criterion.message);
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}
