/**
 * Demo/Sandbox mock data for prospects to explore the dashboard
 * POLICY: Clearly labeled as "demo data" — not real metrics
 */

export const DEMO_WORKSPACE = {
  id: "demo-workspace-000",
  name: "Acme Growth Co.",
  slug: "acme-growth",
  plan: "growth",
  is_agency: false,
  quota_sites: 10,
  quota_crawls_month: 500,
  quota_agent_runs_month: 1000,
};

export const DEMO_SITE = {
  id: "demo-site-000",
  workspace_id: DEMO_WORKSPACE.id,
  name: "acme-growth.com",
  url: "https://acme-growth.com",
  domain: "acme-growth.com",
  status: "active",
  created_at: "2025-12-01T00:00:00Z",
};

// KPI data for the last 60 days
function generateKPIDays(days: number, startDate: Date) {
  const data = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    const progress = 1 - i / days; // 0 → 1
    data.push({
      date: date.toISOString().split("T")[0],
      organic_clicks: Math.round(120 + progress * 280 + Math.random() * 40),
      organic_impressions: Math.round(2400 + progress * 3600 + Math.random() * 500),
      total_conversions: Math.round(8 + progress * 22 + Math.random() * 5),
      avg_position: +(18 - progress * 6 + Math.random() * 2).toFixed(1),
    });
  }
  return data;
}

const now = new Date();
export const DEMO_KPIS_DAILY = generateKPIDays(60, now);

export const DEMO_KPI_CURRENT = {
  organicClicks: DEMO_KPIS_DAILY.slice(-30).reduce((s, k) => s + k.organic_clicks, 0),
  conversions: DEMO_KPIS_DAILY.slice(-30).reduce((s, k) => s + k.total_conversions, 0),
  avgPosition: +(DEMO_KPIS_DAILY.slice(-30).reduce((s, k) => s + k.avg_position, 0) / 30).toFixed(1),
  daysTracked: 30,
};

export const DEMO_KPI_PREVIOUS = {
  organicClicks: DEMO_KPIS_DAILY.slice(0, 30).reduce((s, k) => s + k.organic_clicks, 0),
  conversions: DEMO_KPIS_DAILY.slice(0, 30).reduce((s, k) => s + k.total_conversions, 0),
  avgPosition: +(DEMO_KPIS_DAILY.slice(0, 30).reduce((s, k) => s + k.avg_position, 0) / 30).toFixed(1),
  daysTracked: 30,
};

// Agent runs
export const DEMO_AGENT_RUNS = [
  { id: "ar-1", agent_type: "tech_auditor", status: "completed", started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 3000000).toISOString(), duration_ms: 600000, error_message: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "ar-2", agent_type: "keyword_strategist", status: "completed", started_at: new Date(Date.now() - 7200000).toISOString(), completed_at: new Date(Date.now() - 6600000).toISOString(), duration_ms: 480000, error_message: null, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "ar-3", agent_type: "content_builder", status: "running", started_at: new Date(Date.now() - 120000).toISOString(), completed_at: null, duration_ms: null, error_message: null, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: "ar-4", agent_type: "social_manager", status: "completed", started_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 85800000).toISOString(), duration_ms: 300000, error_message: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "ar-5", agent_type: "chief_growth_officer", status: "completed", started_at: new Date(Date.now() - 14400000).toISOString(), completed_at: new Date(Date.now() - 13200000).toISOString(), duration_ms: 1200000, error_message: null, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: "ar-6", agent_type: "quality_compliance", status: "completed", started_at: new Date(Date.now() - 10800000).toISOString(), completed_at: new Date(Date.now() - 10200000).toISOString(), duration_ms: 360000, error_message: null, created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: "ar-7", agent_type: "ads_optimizer", status: "failed", started_at: new Date(Date.now() - 172800000).toISOString(), completed_at: new Date(Date.now() - 172500000).toISOString(), duration_ms: 300000, error_message: "API quota exceeded", created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "ar-8", agent_type: "cro_specialist", status: "completed", started_at: new Date(Date.now() - 43200000).toISOString(), completed_at: new Date(Date.now() - 42600000).toISOString(), duration_ms: 600000, error_message: null, created_at: new Date(Date.now() - 43200000).toISOString() },
];

// Pending approvals
export const DEMO_APPROVALS = [
  {
    id: "ap-1",
    action_type: "publish_content",
    agent_type: "content_builder",
    risk_level: "medium",
    status: "pending",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    action_data: { title: "Article: 10 Growth Hacking Strategies" },
  },
  {
    id: "ap-2",
    action_type: "launch_campaign",
    agent_type: "ads_optimizer",
    risk_level: "high",
    status: "pending",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    action_data: { title: "Google Ads Q1 Campaign" },
  },
  {
    id: "ap-3",
    action_type: "update_meta_descriptions",
    agent_type: "tech_auditor",
    risk_level: "low",
    status: "pending",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    action_data: { title: "Batch update 15 meta descriptions" },
  },
];

// Enabled services
export const DEMO_SERVICES = [
  { id: "s-1", slug: "core-os", name: "Core OS", is_core: true },
  { id: "s-2", slug: "marketing", name: "Marketing", is_core: false },
  { id: "s-3", slug: "sales", name: "Sales", is_core: false },
  { id: "s-4", slug: "finance", name: "Finance", is_core: false },
  { id: "s-5", slug: "support", name: "Support", is_core: false },
  { id: "s-6", slug: "security", name: "Security", is_core: false },
  { id: "s-7", slug: "governance", name: "Governance", is_core: false },
];

// Executive runs
export const DEMO_EXECUTIVE_RUNS = [
  { id: "er-1", run_type: "DAILY_EXECUTIVE_BRIEF", status: "completed", created_at: new Date(Date.now() - 28800000).toISOString(), completed_at: new Date(Date.now() - 27600000).toISOString(), summary: "All systems green. 3 new content pieces published. Organic clicks up 12%.", agent_count: 5 },
  { id: "er-2", run_type: "WEEKLY_EXECUTIVE_REVIEW", status: "completed", created_at: new Date(Date.now() - 604800000).toISOString(), completed_at: new Date(Date.now() - 603600000).toISOString(), summary: "Week 8 review: 23 tasks completed, 4 pending approvals, ROI +15%.", agent_count: 12 },
  { id: "er-3", run_type: "SEO_AUDIT_REPORT", status: "completed", created_at: new Date(Date.now() - 259200000).toISOString(), completed_at: new Date(Date.now() - 258000000).toISOString(), summary: "14 critical issues found. Core Web Vitals: LCP improved 22%.", agent_count: 3 },
];

// Leads for pipeline
export const DEMO_LEADS = [
  { id: "l-1", name: "Jean Dupont", company: "TechStart SAS", email: "jean@techstart.fr", phone: "+33612345678", status: "qualified", score: 85 },
  { id: "l-2", name: "Marie Martin", company: "GrowthLab", email: "marie@growthlab.io", phone: "+33698765432", status: "contacted", score: 72 },
  { id: "l-3", name: "Pierre Lefebvre", company: "Scale Digital", email: "pierre@scaledigital.com", phone: null, status: "new", score: 45 },
  { id: "l-4", name: "Sophie Bernard", company: "InnoVentures", email: "sophie@innoventures.fr", phone: "+33655443322", status: "qualified", score: 91 },
  { id: "l-5", name: "Lucas Moreau", company: null, email: "lucas.moreau@gmail.com", phone: null, status: "new", score: 30 },
];

// Deals for pipeline
export const DEMO_DEALS = [
  { id: "d-1", title: "TechStart — Plan Growth", lead_id: "l-1", stage_id: "qualified", value: 12000, probability: 75 },
  { id: "d-2", title: "GrowthLab — Agency Setup", lead_id: "l-2", stage_id: "contacted", value: 8500, probability: 45 },
  { id: "d-3", title: "Scale Digital — SEO Audit", lead_id: "l-3", stage_id: "new", value: 3000, probability: 20 },
  { id: "d-4", title: "InnoVentures — Full Stack", lead_id: "l-4", stage_id: "won", value: 24000, probability: 95 },
  { id: "d-5", title: "Lucas M. — Starter Plan", lead_id: "l-5", stage_id: "new", value: 990, probability: 15 },
];

// Department health
export const DEMO_DEPARTMENT_HEALTH = [
  { slug: "marketing", status: "green" as const, metric: "+12% organic" },
  { slug: "sales", status: "yellow" as const, metric: "3 deals pending" },
  { slug: "finance", status: "green" as const, metric: "ROI +15%" },
  { slug: "security", status: "green" as const, metric: "0 incidents" },
  { slug: "support", status: "yellow" as const, metric: "2 tickets open" },
  { slug: "product", status: "green" as const, metric: "Sprint on track" },
  { slug: "engineering", status: "green" as const, metric: "99.9% uptime" },
  { slug: "data", status: "green" as const, metric: "Pipelines OK" },
  { slug: "governance", status: "green" as const, metric: "Compliant" },
  { slug: "hr", status: "green" as const, metric: "Team complete" },
  { slug: "legal", status: "green" as const, metric: "No issues" },
];

// Health score
export const DEMO_HEALTH_SCORE = 82;
