// Agent artifact standard format
export interface AgentArtifact {
  summary: string;
  actions: AgentAction[];
  risks: AgentRisk[];
  dependencies: string[];
  metrics_to_watch: string[];
  requires_approval: boolean;
}

export interface AgentAction {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  ice_score: number; // Impact * Confidence * Ease
  category: string;
  auto_fixable: boolean;
  fix_instructions?: string;
}

export interface AgentRisk {
  id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  mitigation?: string;
}

// Agent run status
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'requires_approval';

// Agent types available in the system
export type AgentType = 
  | 'chief_growth_officer'
  | 'quality_compliance'
  | 'tech_auditor'
  | 'keyword_strategist'
  | 'content_builder'
  | 'local_optimizer'
  | 'ads_optimizer'
  | 'analytics_detective'
  | 'cro_specialist'
  | 'offer_architect'
  | 'lifecycle_manager'
  | 'sales_accelerator'
  | 'reputation_guardian'
  | 'competitive_watcher';

// Agent run input/output types
export interface AgentRunInput {
  site_id?: string;
  target_url?: string;
  options?: Record<string, unknown>;
}

export interface AgentRunOutput extends AgentArtifact {
  raw_data?: Record<string, unknown>;
  errors?: string[];
}

// SEO Specific types
export interface SEOIssue {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected_urls: string[];
  recommendation: string;
  ice_score: number;
  auto_fixable: boolean;
  fix_instructions?: string;
}

export interface CrawlResult {
  pages_crawled: number;
  pages_total: number;
  issues: SEOIssue[];
  errors: string[];
  duration_ms: number;
}

export interface PageData {
  url: string;
  status_code: number;
  title?: string;
  meta_description?: string;
  h1?: string;
  h1_count: number;
  canonical?: string;
  robots_meta?: string;
  has_schema: boolean;
  schema_types: string[];
  internal_links: string[];
  external_links: string[];
  word_count: number;
  load_time_ms: number;
  errors: string[];
}
