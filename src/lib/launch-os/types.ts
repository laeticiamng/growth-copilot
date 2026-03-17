// ─── Launch OS Core Types ───────────────────────────────────────────────────

/** All supported launch types */
export type LaunchType =
  // Music
  | 'single'
  | 'ep'
  | 'album'
  | 'clip'
  | 'music_evergreen'
  // Platform / Digital
  | 'website_launch'
  | 'saas_launch'
  | 'mobile_app_launch'
  | 'landing_page_promo'
  | 'digital_product_launch'
  | 'brand_campaign';

export type LaunchCategory = 'music' | 'platform';

export function getLaunchCategory(type: LaunchType): LaunchCategory {
  const musicTypes: LaunchType[] = ['single', 'ep', 'album', 'clip', 'music_evergreen'];
  return musicTypes.includes(type) ? 'music' : 'platform';
}

/** Launch project status */
export type LaunchStatus =
  | 'draft'
  | 'readiness_check'
  | 'ready_to_launch'
  | 'pre_launch'
  | 'launching'
  | 'post_launch'
  | 'completed'
  | 'paused'
  | 'cancelled';

/** Readiness status for scoring */
export type ReadinessStatus = 'not_ready' | 'needs_fix' | 'ready_to_launch';

// ─── Launch Project ─────────────────────────────────────────────────────────

export interface LaunchProject {
  id: string;
  workspace_id: string;
  name: string;
  launch_type: LaunchType;
  status: LaunchStatus;
  input_url: string | null;
  input_metadata: Record<string, unknown>;
  media_asset_id: string | null;
  launch_date: string | null;
  playbook_id: string | null;
  readiness_score: number | null;
  readiness_status: ReadinessStatus | null;
  config: LaunchConfig;
  created_at: string;
  updated_at: string;
}

export interface LaunchConfig {
  budget?: number;
  currency?: string;
  target_markets?: string[];
  channels?: string[];
  goals?: string[];
  kpi_targets?: Record<string, number>;
}

// ─── Launch Type Engine ─────────────────────────────────────────────────────

export interface LaunchTypeConfig {
  type: LaunchType;
  category: LaunchCategory;
  label: string;
  description: string;
  icon: string;
  defaultChannels: string[];
  phases: LaunchPhaseTemplate[];
  kpiKeys: string[];
}

export interface LaunchPhaseTemplate {
  name: string;
  key: 'pre_launch' | 'launch_day' | 'post_launch';
  daysOffset: number;  // relative to launch date
  durationDays: number;
  defaultTasks: string[];
}

// ─── Readiness Score ────────────────────────────────────────────────────────

export interface ReadinessScore {
  id: string;
  launch_project_id: string;
  overall_score: number;
  status: ReadinessStatus;
  dimensions: ReadinessDimension[];
  blockers: ReadinessBlocker[];
  recommendations: ReadinessRecommendation[];
  scored_at: string;
}

export interface ReadinessDimension {
  key: string;
  label: string;
  score: number;       // 0-100
  weight: number;      // 0-1
  details: string;
}

export interface ReadinessBlocker {
  dimension: string;
  severity: 'critical' | 'warning';
  message: string;
  fix_hint: string;
}

export interface ReadinessRecommendation {
  priority: number;
  dimension: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

// ─── Creative Factory ───────────────────────────────────────────────────────

export type CreativeFormat =
  | 'hook'
  | 'caption'
  | 'script'
  | 'ad_copy'
  | 'headline'
  | 'subhead'
  | 'email_subject'
  | 'email_body'
  | 'bio'
  | 'pitch'
  | 'cta'
  | 'objection_handler'
  | 'offer_stack'
  | 'storyboard'
  | 'voiceover_script'
  | 'landing_copy';

export interface CreativeVariant {
  id: string;
  launch_project_id: string;
  format: CreativeFormat;
  name: string;
  content: Record<string, unknown>;
  platform_target: string | null;
  angle: string | null;
  audience_segment: string | null;
  status: 'draft' | 'approved' | 'rejected' | 'published';
  performance_score: number | null;
  created_at: string;
}

// ─── Short Video Factory ────────────────────────────────────────────────────

export interface VideoConcept {
  id: string;
  launch_project_id: string;
  title: string;
  format: '9:16' | '1:1' | '16:9';
  duration_seconds: number;
  hook_text: string;
  scenes: VideoScene[];
  voiceover_script: string | null;
  cta: string;
  angle: string;
  platform_targets: string[];
  status: 'concept' | 'storyboard' | 'scripted' | 'ready_for_production';
  created_at: string;
}

export interface VideoScene {
  order: number;
  duration_seconds: number;
  visual_description: string;
  text_overlay: string | null;
  voiceover: string | null;
  transition: string | null;
}

// ─── Distribution Orchestrator ──────────────────────────────────────────────

export type DistributionChannel =
  | 'tiktok'
  | 'instagram_reels'
  | 'youtube_shorts'
  | 'youtube'
  | 'meta_ads'
  | 'google_ads'
  | 'email'
  | 'smart_link'
  | 'landing_page'
  | 'retargeting'
  | 'organic_social';

export interface DistributionRun {
  id: string;
  launch_project_id: string;
  channel: DistributionChannel;
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  config: Record<string, unknown>;
  results: Record<string, unknown> | null;
  budget_allocated: number;
  budget_spent: number;
}

export interface DistributionStep {
  id: string;
  distribution_run_id: string;
  order: number;
  action: string;
  channel: DistributionChannel;
  asset_ids: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  scheduled_at: string | null;
  executed_at: string | null;
  result: Record<string, unknown> | null;
}

// ─── Signal Graph ───────────────────────────────────────────────────────────

export type SignalEventType =
  // Awareness
  | 'view'
  | 'impression'
  | 'watch_3s'
  | 'watch_25pct'
  | 'watch_50pct'
  | 'watch_75pct'
  | 'watch_100pct'
  // Engagement
  | 'click'
  | 'outbound_click'
  | 'like'
  | 'comment'
  | 'share'
  | 'save'
  // Music-specific
  | 'pre_save'
  | 'smart_link_click'
  | 'stream_start'
  | 'playlist_add'
  | 'follow'
  // Platform-specific
  | 'signup'
  | 'waitlist_join'
  | 'trial_start'
  | 'activation'
  | 'purchase'
  | 'repeat_purchase'
  // Email
  | 'email_open'
  | 'email_click'
  // Attribution
  | 'conversion_post_retargeting';

export interface SignalEvent {
  id: string;
  launch_project_id: string;
  workspace_id: string;
  event_type: SignalEventType;
  source: string;            // ga4, meta, smart_link, internal, etc.
  channel: string | null;
  session_id: string | null;
  user_id_hash: string | null;
  value: number;
  metadata: Record<string, unknown>;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

// ─── Decision Engine ────────────────────────────────────────────────────────

export type DecisionAction =
  | 'pause_creative'
  | 'boost_creative'
  | 'change_angle'
  | 'change_landing'
  | 'retarget_warm'
  | 'extend_campaign'
  | 'change_cta'
  | 'switch_hook'
  | 'reallocate_budget'
  | 'scale_channel'
  | 'pause_channel';

export interface DecisionRule {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  condition: DecisionCondition;
  action: DecisionAction;
  action_config: Record<string, unknown>;
  is_auto_execute: boolean;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface DecisionCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'between';
  threshold: number;
  threshold_upper?: number;
  time_window_hours: number;
  min_sample_size: number;
}

export interface DecisionActionLog {
  id: string;
  launch_project_id: string;
  rule_id: string | null;
  action: DecisionAction;
  reason: string;
  context: Record<string, unknown>;
  status: 'recommended' | 'approved' | 'executed' | 'rejected';
  approved_by: string | null;
  executed_at: string | null;
  created_at: string;
}

// ─── Campaign Memory ────────────────────────────────────────────────────────

export interface CampaignMemory {
  id: string;
  workspace_id: string;
  launch_project_id: string;
  launch_type: LaunchType;
  summary: CampaignSummary;
  learnings: CampaignLearning[];
  created_at: string;
}

export interface CampaignSummary {
  total_reach: number;
  total_conversions: number;
  total_spend: number;
  roas: number;
  best_channel: string;
  best_creative_format: string;
  best_hook: string;
  audience_insights: string[];
  duration_days: number;
}

export interface CampaignLearning {
  category: 'hook' | 'channel' | 'audience' | 'creative' | 'timing' | 'budget' | 'message';
  insight: string;
  confidence: number;  // 0-1
  supporting_data: Record<string, unknown>;
}

// ─── Playbook ───────────────────────────────────────────────────────────────

export interface LaunchPlaybook {
  id: string;
  name: string;
  launch_type: LaunchType;
  description: string;
  is_template: boolean;
  workspace_id: string | null;  // null = system template
  phases: PlaybookPhase[];
  default_channels: DistributionChannel[];
  default_kpi_targets: Record<string, number>;
  created_at: string;
}

export interface PlaybookPhase {
  key: 'pre_launch' | 'launch_day' | 'post_launch';
  name: string;
  duration_days: number;
  tasks: PlaybookTask[];
  automations: PlaybookAutomation[];
}

export interface PlaybookTask {
  title: string;
  description: string;
  channel: DistributionChannel | null;
  is_automated: boolean;
  day_offset: number;  // relative to phase start
  priority: 'high' | 'medium' | 'low';
}

export interface PlaybookAutomation {
  trigger: string;
  action: string;
  config: Record<string, unknown>;
}

// ─── KPI Targets ────────────────────────────────────────────────────────────

/** Music-specific KPIs */
export interface MusicKPIs {
  hook_retention_rate: number;
  completion_rate: number;
  ctr: number;
  smart_link_ctr: number;
  pre_save_rate: number;
  save_rate: number;
  playlist_add_rate: number;
  follow_rate: number;
  stream_conversion: number;
  repeat_listen_proxy: number;
  cost_per_engaged_listener: number;
}

/** Platform-specific KPIs */
export interface PlatformKPIs {
  landing_ctr: number;
  signup_rate: number;
  activation_rate: number;
  trial_to_paid: number;
  cac: number;
  roas: number;
  retention_proxy: number;
  funnel_drop_rate: Record<string, number>;
  assisted_conversion_rate: number;
}
