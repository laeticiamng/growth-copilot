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

/**
 * Agent types available in the system
 * 39 agents total: 2 Direction + 37 Department agents across 11 departments
 * 
 * Structure:
 * - Direction (2): CGO, QCO
 * - Marketing (5): tech_auditor, keyword_strategist, content_builder, local_optimizer, social_manager
 * - Sales (4): offer_architect, sales_accelerator, lifecycle_manager, deal_closer
 * - Finance (3): revenue_analyst, budget_optimizer, billing_manager
 * - Security (3): security_auditor, access_controller, threat_monitor
 * - Product (4): feature_analyst, ux_optimizer, roadmap_planner, backlog_manager
 * - Engineering (5): code_reviewer, performance_engineer, devops_agent, api_integrator, testing_agent
 * - Data (4): analytics_detective, data_engineer, ml_trainer, reporting_agent
 * - Support (3): reputation_guardian, ticket_handler, knowledge_manager
 * - Governance (3): compliance_auditor, policy_enforcer, risk_assessor
 * - HR (2): recruitment_agent, employee_experience
 * - Legal (1): contract_analyzer
 */
export type AgentType = 
  // Direction (2)
  | 'chief_growth_officer'
  | 'quality_compliance'
  // Marketing (5)
  | 'tech_auditor'
  | 'keyword_strategist'
  | 'content_builder'
  | 'local_optimizer'
  | 'social_manager'
  // Sales (4)
  | 'offer_architect'
  | 'sales_accelerator'
  | 'lifecycle_manager'
  | 'deal_closer'
  // Finance (3)
  | 'revenue_analyst'
  | 'budget_optimizer'
  | 'billing_manager'
  // Security (3)
  | 'security_auditor'
  | 'access_controller'
  | 'threat_monitor'
  // Product (4)
  | 'feature_analyst'
  | 'ux_optimizer'
  | 'roadmap_planner'
  | 'backlog_manager'
  // Engineering (5)
  | 'code_reviewer'
  | 'performance_engineer'
  | 'devops_agent'
  | 'api_integrator'
  | 'testing_agent'
  // Data (4)
  | 'analytics_detective'
  | 'data_engineer'
  | 'ml_trainer'
  | 'reporting_agent'
  // Support (3)
  | 'reputation_guardian'
  | 'ticket_handler'
  | 'knowledge_manager'
  // Governance (3)
  | 'compliance_auditor'
  | 'policy_enforcer'
  | 'risk_assessor'
  // HR (2)
  | 'recruitment_agent'
  | 'employee_experience'
  // Legal (1)
  | 'contract_analyzer'
  // Legacy (for backward compatibility)
  | 'ads_optimizer'
  | 'cro_specialist'
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
