// ─── Launch OS Canonical Sub-Entities ─────────────────────────────────────────
// These extend the core LaunchProject model with all sub-entities required
// for a complete launch operating system.
//
// Evidence levels for all outputs:
//   VERIFIED  = based on real data/connectors confirmed at runtime
//   DERIVED   = deduced from partial real data
//   TEMPLATE  = generic proposition, not backed by real data

import type {
  LaunchType,
  LaunchStatus,
  LaunchConfig,
  CreativeFormat,
  DistributionChannel,
  SignalEventType,
} from './types';

// ─── Evidence Level ──────────────────────────────────────────────────────────

export type EvidenceLevel = 'VERIFIED' | 'DERIVED' | 'TEMPLATE';

export interface EvidenceTag {
  level: EvidenceLevel;
  source: string;       // e.g. "ga4_api", "user_input", "ai_generation"
  verified_at?: string;  // ISO timestamp of last verification
  confidence: number;    // 0-1
}

// ─── LaunchBrief ─────────────────────────────────────────────────────────────

export interface LaunchBrief {
  id: string;
  launch_project_id: string;
  product_name: string;
  product_type: string;
  product_description: string;
  launch_goal: string;
  target_audience_summary: string;
  key_differentiators: string[];
  competitive_landscape: string;
  budget_range: { min: number; max: number; currency: string };
  timeline: { start: string; launch_date: string; end: string };
  success_criteria: string[];
  constraints: string[];
  evidence: EvidenceTag;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── AudienceResearch ────────────────────────────────────────────────────────

export interface AudienceResearch {
  id: string;
  launch_project_id: string;
  icp: IdealCustomerProfile;
  segments: AudienceSegmentDef[];
  persona_profiles: PersonaProfile[];
  market_size_estimate: MarketEstimate | null;
  data_sources: string[];
  evidence: EvidenceTag;
  created_at: string;
  updated_at: string;
}

export interface IdealCustomerProfile {
  title: string;
  demographics: Record<string, string>;
  psychographics: string[];
  pain_points: string[];
  goals: string[];
  buying_behavior: string[];
  channels_used: string[];
  objections: string[];
  decision_criteria: string[];
}

export interface AudienceSegmentDef {
  name: string;
  description: string;
  size_estimate: number | null;
  priority: 'primary' | 'secondary' | 'tertiary';
  channels: string[];
  messaging_angle: string;
}

export interface PersonaProfile {
  name: string;
  role: string;
  age_range: string;
  quote: string;
  goals: string[];
  frustrations: string[];
  preferred_channels: string[];
}

export interface MarketEstimate {
  tam: number | null;
  sam: number | null;
  som: number | null;
  currency: string;
  source: string;
  evidence_level: EvidenceLevel;
}

// ─── MessagingFramework ──────────────────────────────────────────────────────

export interface MessagingFramework {
  id: string;
  launch_project_id: string;
  positioning_statement: string;
  value_proposition: string;
  tagline: string;
  elevator_pitch: string;
  key_messages: KeyMessage[];
  tone_of_voice: ToneOfVoice;
  proof_points: ProofPoint[];
  objection_responses: ObjectionResponse[];
  evidence: EvidenceTag;
  status: 'draft' | 'in_review' | 'approved';
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeyMessage {
  audience_segment: string;
  headline: string;
  supporting_copy: string;
  cta: string;
  channel_adaptation: Record<string, string>;
}

export interface ToneOfVoice {
  personality: string[];
  do_say: string[];
  dont_say: string[];
  examples: { good: string; bad: string }[];
}

export interface ProofPoint {
  type: 'statistic' | 'testimonial' | 'case_study' | 'award' | 'certification';
  content: string;
  source: string;
  evidence_level: EvidenceLevel;
}

export interface ObjectionResponse {
  objection: string;
  response: string;
  proof_point_ref: string | null;
}

// ─── OfferAsset ──────────────────────────────────────────────────────────────

export interface OfferAsset {
  id: string;
  launch_project_id: string;
  offer_name: string;
  offer_type: 'main' | 'upsell' | 'downsell' | 'bonus' | 'trial' | 'freemium';
  description: string;
  price: { amount: number; currency: string; billing_cycle?: string };
  value_stack: ValueStackItem[];
  guarantees: string[];
  urgency_triggers: string[];
  scarcity_triggers: string[];
  cta_primary: string;
  cta_secondary: string | null;
  evidence: EvidenceTag;
  status: 'draft' | 'in_review' | 'approved' | 'active' | 'deprecated';
  created_at: string;
  updated_at: string;
}

export interface ValueStackItem {
  item: string;
  perceived_value: number | null;
  is_bonus: boolean;
}

// ─── CreativeAsset (extends existing CreativeVariant) ─────────────────────────

export interface CreativeAssetMeta {
  id: string;
  launch_project_id: string;
  creative_variant_id: string;
  asset_type: 'image' | 'copy' | 'video_script' | 'audio' | 'animation';
  brand_compliant: boolean | null;
  compliance_notes: string[];
  repurpose_targets: RepurposeTarget[];
  ab_test_group: string | null;
  evidence: EvidenceTag;
  status: 'draft' | 'in_review' | 'approved' | 'scheduled' | 'published' | 'deprecated';
  created_at: string;
}

export interface RepurposeTarget {
  from_format: CreativeFormat;
  to_format: CreativeFormat;
  channel: string;
  aspect_ratio: string;
  adaptation_notes: string;
}

// ─── VideoAsset ──────────────────────────────────────────────────────────────

export interface VideoAsset {
  id: string;
  launch_project_id: string;
  video_concept_id: string;
  script_text: string;
  storyboard_url: string | null;
  voiceover_text: string | null;
  voiceover_url: string | null;
  caption_set: CaptionSet | null;
  thumbnail_ideas: string[];
  cta_package: CTAPackage;
  aspect_ratio_variants: AspectRatioVariant[];
  channel_packaging: ChannelPackaging[];
  publish_status: 'draft' | 'in_review' | 'approved' | 'scheduled' | 'published' | 'deprecated';
  evidence: EvidenceTag;
  created_at: string;
  updated_at: string;
}

export interface CaptionSet {
  language: string;
  srt_content: string | null;
  highlight_words: string[];
}

export interface CTAPackage {
  primary_cta: string;
  cta_url: string;
  cta_variants: string[];
  urgency_text: string | null;
}

export interface AspectRatioVariant {
  ratio: '9:16' | '1:1' | '16:9' | '4:5';
  platform: string;
  crop_notes: string;
  duration_adjustment: number;  // seconds delta
}

export interface ChannelPackaging {
  channel: DistributionChannel;
  title: string;
  description: string;
  hashtags: string[];
  thumbnail_text: string;
  scheduled_at: string | null;
  published_at: string | null;
}

// ─── LandingPageAsset ────────────────────────────────────────────────────────

export interface LandingPageAsset {
  id: string;
  launch_project_id: string;
  url: string | null;
  page_type: 'hero' | 'sales' | 'waitlist' | 'pre_launch' | 'thank_you';
  headline: string;
  subheadline: string;
  hero_cta: string;
  sections: LandingSection[];
  seo_meta: { title: string; description: string; keywords: string[] };
  conversion_goals: string[];
  tracking_pixels: string[];
  evidence: EvidenceTag;
  status: 'draft' | 'in_review' | 'approved' | 'live' | 'deprecated';
  created_at: string;
  updated_at: string;
}

export interface LandingSection {
  type: 'hero' | 'features' | 'social_proof' | 'pricing' | 'faq' | 'cta' | 'video' | 'testimonials';
  order: number;
  content: Record<string, unknown>;
}

// ─── CampaignPlan ────────────────────────────────────────────────────────────

export interface CampaignPlan {
  id: string;
  launch_project_id: string;
  name: string;
  campaign_type: 'awareness' | 'consideration' | 'conversion' | 'retention' | 'launch_burst';
  channels: CampaignChannel[];
  total_budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  objectives: CampaignObjective[];
  audience_targeting: AudienceTargeting;
  evidence: EvidenceTag;
  status: 'draft' | 'in_review' | 'approved' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CampaignChannel {
  channel: DistributionChannel;
  budget_allocation: number;    // percentage
  budget_amount: number;
  objective: string;
  creative_ids: string[];
  start_date: string;
  end_date: string;
}

export interface CampaignObjective {
  metric: string;
  target: number;
  current: number | null;
  evidence_level: EvidenceLevel;
}

export interface AudienceTargeting {
  demographics: Record<string, string[]>;
  interests: string[];
  lookalike_sources: string[];
  retargeting_pools: string[];
  exclusions: string[];
}

// ─── DistributionPlan ────────────────────────────────────────────────────────

export interface DistributionPlan {
  id: string;
  launch_project_id: string;
  campaign_plan_id: string | null;
  phases: DistributionPhase[];
  total_touchpoints: number;
  evidence: EvidenceTag;
  created_at: string;
}

export interface DistributionPhase {
  phase: 'pre_launch' | 'launch_day' | 'post_launch';
  channels: DistributionChannelPlan[];
  start_date: string;
  end_date: string;
}

export interface DistributionChannelPlan {
  channel: DistributionChannel;
  frequency: string;       // e.g. "3x/week", "daily", "burst"
  content_types: string[];
  asset_ids: string[];
  automation_enabled: boolean;
  notes: string;
}

// ─── ApprovalCheckpoint ──────────────────────────────────────────────────────

export type ApprovalCheckpointType =
  | 'launch_brief'
  | 'positioning'
  | 'offer'
  | 'ad_copy'
  | 'video_script'
  | 'landing_page'
  | 'campaign_plan'
  | 'budget_change'
  | 'publication'
  | 'campaign_activation'
  | 'crm_automation'
  | 'compliance_review';

export interface ApprovalCheckpoint {
  id: string;
  launch_project_id: string;
  checkpoint_type: ApprovalCheckpointType;
  entity_id: string;        // ID of the entity being approved
  entity_type: string;       // e.g. "launch_brief", "creative_variant"
  requires_approval: boolean;
  approval_reason: string;
  approver_role: string;     // e.g. "owner", "marketing_lead", "legal"
  blocking_level: 'hard_block' | 'soft_block' | 'advisory';
  sla_hours: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'bypassed';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  audit_log_entry_id: string | null;
  rollback_path: string | null;
  created_at: string;
  updated_at: string;
}

// ─── LaunchRun ───────────────────────────────────────────────────────────────

export type LaunchStage =
  | 'intake'
  | 'audience_research'
  | 'positioning'
  | 'messaging'
  | 'creative_strategy'
  | 'video_asset_planning'
  | 'landing_funnel'
  | 'channel_plan'
  | 'approval_gate'
  | 'publish_distribute'
  | 'track_attribute'
  | 'iterate_recommend'
  | 'sales_handoff'
  | 'executive_report';

export interface LaunchRun {
  id: string;
  launch_project_id: string;
  run_number: number;
  current_stage: LaunchStage;
  stages_completed: LaunchStageResult[];
  stages_remaining: LaunchStage[];
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'waiting_approval';
  triggered_by: string;    // user_id or 'system'
  error_log: LaunchError[];
  created_at: string;
}

export interface LaunchStageResult {
  stage: LaunchStage;
  status: 'completed' | 'skipped' | 'failed' | 'partial';
  started_at: string;
  completed_at: string;
  agent_ids: string[];
  outputs: Record<string, unknown>;
  evidence_level: EvidenceLevel;
  duration_ms: number;
  retry_count: number;
}

export interface LaunchError {
  stage: LaunchStage;
  error_type: 'agent_failure' | 'data_missing' | 'approval_timeout' | 'connector_error' | 'validation_error';
  message: string;
  recoverable: boolean;
  timestamp: string;
}

// ─── LaunchInsight ───────────────────────────────────────────────────────────

export interface LaunchInsight {
  id: string;
  launch_project_id: string;
  insight_type: 'performance' | 'anomaly' | 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  metric_key: string | null;
  metric_value: number | null;
  metric_trend: 'up' | 'down' | 'stable' | null;
  confidence: number;        // 0-1
  evidence: EvidenceTag;
  action_suggested: string | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  created_at: string;
}

// ─── LaunchExperiment ────────────────────────────────────────────────────────

export interface LaunchExperiment {
  id: string;
  launch_project_id: string;
  name: string;
  hypothesis: string;
  experiment_type: 'ab_test' | 'multivariate' | 'holdout' | 'sequential';
  metric_key: string;
  variants: ExperimentVariant[];
  traffic_split: Record<string, number>;
  min_sample_size: number;
  current_sample_size: number;
  statistical_significance: number | null;
  winner_variant_id: string | null;
  status: 'draft' | 'running' | 'paused' | 'concluded' | 'cancelled';
  results: ExperimentResults | null;
  evidence: EvidenceTag;
  started_at: string | null;
  concluded_at: string | null;
  created_at: string;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  variant_type: 'control' | 'treatment';
  config: Record<string, unknown>;
  impressions: number;
  conversions: number;
  metric_value: number;
}

export interface ExperimentResults {
  winner: string | null;
  lift_percent: number | null;
  p_value: number | null;
  confidence_interval: { lower: number; upper: number } | null;
  recommendation: string;
}

// ─── LeadHandoff ─────────────────────────────────────────────────────────────

export interface LeadHandoff {
  id: string;
  launch_project_id: string;
  lead_source: string;          // channel or campaign
  lead_email_hash: string;      // privacy-safe
  lead_score: number;           // 0-100
  qualification_status: 'raw' | 'mql' | 'sql' | 'opportunity' | 'closed_won' | 'closed_lost';
  first_touch_channel: string;
  last_touch_channel: string;
  touchpoint_count: number;
  utm_source: string | null;
  utm_campaign: string | null;
  handoff_to_crm: boolean;
  crm_record_id: string | null;
  handoff_at: string | null;
  lifecycle_stage: string;
  follow_up_actions: FollowUpAction[];
  created_at: string;
  updated_at: string;
}

export interface FollowUpAction {
  action_type: 'email_sequence' | 'sales_call' | 'retarget' | 'nurture' | 'demo_invite';
  scheduled_at: string;
  executed_at: string | null;
  status: 'pending' | 'sent' | 'completed' | 'skipped';
}

// ─── LaunchReport ────────────────────────────────────────────────────────────

export interface LaunchReport {
  id: string;
  launch_project_id: string;
  report_type: 'daily' | 'weekly' | 'final' | 'executive';
  period: { start: string; end: string };
  kpi_summary: KPISummaryItem[];
  channel_performance: ChannelPerformanceSummary[];
  creative_performance: CreativePerformanceSummary[];
  budget_summary: BudgetSummary;
  top_insights: LaunchInsight[];
  recommendations: string[];
  overall_status: 'on_track' | 'at_risk' | 'behind' | 'exceeded';
  confidence_score: number;     // 0-100
  evidence: EvidenceTag;
  generated_at: string;
}

export interface KPISummaryItem {
  metric_key: string;
  label: string;
  target: number;
  actual: number | null;
  delta_percent: number | null;
  trend: 'up' | 'down' | 'stable';
  evidence_level: EvidenceLevel;
}

export interface ChannelPerformanceSummary {
  channel: DistributionChannel;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  cpa: number | null;
  roas: number | null;
  evidence_level: EvidenceLevel;
}

export interface CreativePerformanceSummary {
  creative_id: string;
  format: CreativeFormat;
  impressions: number;
  ctr: number;
  conversion_rate: number;
  status: string;
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  remaining: number;
  burn_rate_daily: number;
  projected_end_date: string | null;
  by_channel: Record<string, { allocated: number; spent: number }>;
  currency: string;
}

// ─── Enhanced LaunchProject (canonical model) ────────────────────────────────

export interface LaunchProjectCanonical {
  id: string;
  workspace_id: string;
  product_name: string;
  product_type: string;
  launch_goal: string;
  target_audience: string;
  icp_summary: string | null;
  positioning: string | null;
  key_offer: string | null;
  channels_enabled: DistributionChannel[];
  budget: number | null;
  currency: string;
  timeline: { start: string; launch_date: string; end: string } | null;
  approval_policy: ApprovalPolicy;
  launch_status: LaunchStatus;
  current_stage: LaunchStage;
  owner: string;
  kpis: Record<string, number>;
  risks: LaunchRisk[];
  dependencies: LaunchDependency[];
  evidence_level: EvidenceLevel;

  // Sub-entity references
  brief_id: string | null;
  audience_research_id: string | null;
  messaging_framework_id: string | null;
  campaign_plan_id: string | null;
  distribution_plan_id: string | null;
  current_run_id: string | null;

  created_at: string;
  updated_at: string;
}

export interface ApprovalPolicy {
  auto_approve_low_risk: boolean;
  require_legal_review: boolean;
  require_brand_review: boolean;
  budget_approval_threshold: number;
  escalation_email: string | null;
}

export interface LaunchRisk {
  id: string;
  category: 'timeline' | 'budget' | 'quality' | 'compliance' | 'technical' | 'market';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string;
  owner: string | null;
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
}

export interface LaunchDependency {
  id: string;
  type: 'connector' | 'approval' | 'asset' | 'data' | 'external';
  description: string;
  status: 'met' | 'pending' | 'blocked';
  blocking: boolean;
  resolution_path: string | null;
}
