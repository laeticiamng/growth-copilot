/**
 * Mock data for dashboard, department views, agent chat, and approvals
 * 100% mockées, prêtes pour Supabase
 */

import { AGENTS_CATALOG, DEPARTMENTS_CATALOG } from "./agents-catalog";

// ── KPI Data ──
export interface DashboardKPI {
  label: string;
  value: number;
  previousValue: number;
  suffix?: string;
  prefix?: string;
}

export const MOCK_KPIS = {
  tasksInProgress: 12,
  tasksCompletedThisWeek: 47,
  activeAgents: 31,
  growthScore: 78,
};

// ── Activity Feed ──
export interface ActivityFeedItem {
  id: string;
  agentSlug: string;
  agentName: string;
  agentInitials: string;
  departmentSlug: string;
  departmentColor: string;
  action: Record<string, string>;
  timestamp: string;
  type: "task_completed" | "alert" | "report" | "approval_needed" | "insight";
}

export const MOCK_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: "act-1",
    agentSlug: "content-builder",
    agentName: "Léa Fontaine",
    agentInitials: "LF",
    departmentSlug: "marketing",
    departmentColor: "#3b82f6",
    action: {
      fr: "a généré le brief SEO mensuel pour janvier 2026",
      en: "generated the monthly SEO brief for January 2026",
    },
    timestamp: "2026-02-10T09:15:00Z",
    type: "task_completed",
  },
  {
    id: "act-2",
    agentSlug: "analytics-guardian",
    agentName: "Chloé Martin",
    agentInitials: "CM",
    departmentSlug: "data",
    departmentColor: "#2563eb",
    action: {
      fr: "alerte : baisse de trafic organique -12% cette semaine",
      en: "alert: organic traffic down -12% this week",
    },
    timestamp: "2026-02-10T08:45:00Z",
    type: "alert",
  },
  {
    id: "act-3",
    agentSlug: "revenue-analyst",
    agentName: "François Martin",
    agentInitials: "FM",
    departmentSlug: "finance",
    departmentColor: "#eab308",
    action: {
      fr: "a publié le rapport de revenus hebdomadaire — MRR +8.3%",
      en: "published the weekly revenue report — MRR +8.3%",
    },
    timestamp: "2026-02-10T08:30:00Z",
    type: "report",
  },
  {
    id: "act-4",
    agentSlug: "social-media-manager",
    agentName: "Marc Rousseau",
    agentInitials: "MR",
    departmentSlug: "marketing",
    departmentColor: "#3b82f6",
    action: {
      fr: "demande d'approbation : campagne LinkedIn « Growth IA 2026 »",
      en: "approval request: LinkedIn campaign 'Growth AI 2026'",
    },
    timestamp: "2026-02-10T08:00:00Z",
    type: "approval_needed",
  },
  {
    id: "act-5",
    agentSlug: "security-auditor",
    agentName: "Pierre Lambert",
    agentInitials: "PL",
    departmentSlug: "security",
    departmentColor: "#ef4444",
    action: {
      fr: "a complété l'audit de sécurité trimestriel — 0 vulnérabilité critique",
      en: "completed the quarterly security audit — 0 critical vulnerabilities",
    },
    timestamp: "2026-02-09T17:30:00Z",
    type: "task_completed",
  },
  {
    id: "act-6",
    agentSlug: "sales-accelerator",
    agentName: "Marie Laurent",
    agentInitials: "ML",
    departmentSlug: "sales",
    departmentColor: "#22c55e",
    action: {
      fr: "a qualifié 23 nouveaux leads — 8 classés A+",
      en: "qualified 23 new leads — 8 classified A+",
    },
    timestamp: "2026-02-09T16:00:00Z",
    type: "insight",
  },
  {
    id: "act-7",
    agentSlug: "compliance-auditor",
    agentName: "Philippe Renaud",
    agentInitials: "PR",
    departmentSlug: "governance",
    departmentColor: "#10b981",
    action: {
      fr: "rapport de conformité RGPD mis à jour — score 98/100",
      en: "GDPR compliance report updated — score 98/100",
    },
    timestamp: "2026-02-09T14:20:00Z",
    type: "report",
  },
  {
    id: "act-8",
    agentSlug: "keyword-strategist",
    agentName: "Thomas Duval",
    agentInitials: "TD",
    departmentSlug: "marketing",
    departmentColor: "#3b82f6",
    action: {
      fr: "a identifié 34 nouvelles opportunités de mots-clés long-tail",
      en: "identified 34 new long-tail keyword opportunities",
    },
    timestamp: "2026-02-09T11:45:00Z",
    type: "insight",
  },
  {
    id: "act-9",
    agentSlug: "budget-optimizer",
    agentName: "Isabelle Durand",
    agentInitials: "ID",
    departmentSlug: "finance",
    departmentColor: "#eab308",
    action: {
      fr: "demande d'approbation : réallocation budget ads +15% vers LinkedIn",
      en: "approval request: budget reallocation +15% to LinkedIn ads",
    },
    timestamp: "2026-02-09T10:00:00Z",
    type: "approval_needed",
  },
  {
    id: "act-10",
    agentSlug: "recruitment-agent",
    agentName: "Céline Hervé",
    agentInitials: "CH",
    departmentSlug: "hr",
    departmentColor: "#ec4899",
    action: {
      fr: "a trié 45 candidatures — 12 profils shortlistés pour le poste Dev Senior",
      en: "sorted 45 applications — 12 profiles shortlisted for Senior Dev position",
    },
    timestamp: "2026-02-08T16:30:00Z",
    type: "task_completed",
  },
];

// ── Weekly Performance Data ──
export interface WeeklyDataPoint {
  day: string;
  tasks: number;
  approvals: number;
  alerts: number;
}

export const MOCK_WEEKLY_PERFORMANCE: WeeklyDataPoint[] = [
  { day: "Lun", tasks: 12, approvals: 3, alerts: 1 },
  { day: "Mar", tasks: 18, approvals: 5, alerts: 2 },
  { day: "Mer", tasks: 15, approvals: 4, alerts: 0 },
  { day: "Jeu", tasks: 22, approvals: 7, alerts: 3 },
  { day: "Ven", tasks: 19, approvals: 6, alerts: 1 },
  { day: "Sam", tasks: 8, approvals: 1, alerts: 0 },
  { day: "Dim", tasks: 5, approvals: 0, alerts: 0 },
];

export const MOCK_WEEKLY_PERFORMANCE_EN: WeeklyDataPoint[] = [
  { day: "Mon", tasks: 12, approvals: 3, alerts: 1 },
  { day: "Tue", tasks: 18, approvals: 5, alerts: 2 },
  { day: "Wed", tasks: 15, approvals: 4, alerts: 0 },
  { day: "Thu", tasks: 22, approvals: 7, alerts: 3 },
  { day: "Fri", tasks: 19, approvals: 6, alerts: 1 },
  { day: "Sat", tasks: 8, approvals: 1, alerts: 0 },
  { day: "Sun", tasks: 5, approvals: 0, alerts: 0 },
];

// ── Pending Approvals (Enhanced) ──
export interface PendingApprovalItem {
  id: string;
  agentSlug: string;
  agentName: string;
  agentInitials: string;
  departmentSlug: string;
  action: Record<string, string>;
  impact: Record<string, string>;
  riskLevel: "low" | "medium" | "high";
  priority: "urgent" | "high" | "normal" | "low";
  createdAt: string;
}

export const MOCK_PENDING_APPROVALS: PendingApprovalItem[] = [
  {
    id: "appr-1",
    agentSlug: "social-media-manager",
    agentName: "Marc Rousseau",
    agentInitials: "MR",
    departmentSlug: "marketing",
    action: {
      fr: "Publier la campagne LinkedIn « Growth IA 2026 » — 5 posts planifiés sur 2 semaines",
      en: "Publish LinkedIn campaign 'Growth AI 2026' — 5 posts scheduled over 2 weeks",
    },
    impact: {
      fr: "Portée estimée : 12 000 impressions, coût : 0€ (organique)",
      en: "Estimated reach: 12,000 impressions, cost: €0 (organic)",
    },
    riskLevel: "medium",
    priority: "high",
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "appr-2",
    agentSlug: "budget-optimizer",
    agentName: "Isabelle Durand",
    agentInitials: "ID",
    departmentSlug: "finance",
    action: {
      fr: "Réallouer +15% du budget Google Ads vers LinkedIn Ads",
      en: "Reallocate +15% of Google Ads budget to LinkedIn Ads",
    },
    impact: {
      fr: "Économie estimée : 340€/mois, CPA prévu : -22%",
      en: "Estimated savings: €340/month, expected CPA: -22%",
    },
    riskLevel: "high",
    priority: "urgent",
    createdAt: "2026-02-09T10:00:00Z",
  },
  {
    id: "appr-3",
    agentSlug: "content-builder",
    agentName: "Léa Fontaine",
    agentInitials: "LF",
    departmentSlug: "marketing",
    action: {
      fr: "Publier l'article « 10 stratégies SEO pour 2026 » sur le blog",
      en: "Publish article '10 SEO Strategies for 2026' on the blog",
    },
    impact: {
      fr: "Trafic attendu : +800 visites/mois, 3 backlinks potentiels",
      en: "Expected traffic: +800 visits/month, 3 potential backlinks",
    },
    riskLevel: "low",
    priority: "normal",
    createdAt: "2026-02-08T15:30:00Z",
  },
  {
    id: "appr-4",
    agentSlug: "devops-agent",
    agentName: "Romain Fournier",
    agentInitials: "RF",
    departmentSlug: "engineering",
    action: {
      fr: "Déployer la mise à jour v2.5.1 en production (correctif CDN + cache)",
      en: "Deploy v2.5.1 update to production (CDN fix + cache)",
    },
    impact: {
      fr: "Amélioration TTFB : -35%, risque de downtime : <1min",
      en: "TTFB improvement: -35%, downtime risk: <1min",
    },
    riskLevel: "high",
    priority: "high",
    createdAt: "2026-02-08T11:00:00Z",
  },
];

// ── Department Tasks (per department mock) ──
export interface AgentTask {
  id: string;
  agentSlug: string;
  title: Record<string, string>;
  status: "in_progress" | "completed" | "pending" | "review";
  priority: "urgent" | "high" | "normal" | "low";
  dueDate: string;
}

export function getMockTasksForDepartment(departmentSlug: string): AgentTask[] {
  const tasksByDept: Record<string, AgentTask[]> = {
    marketing: [
      { id: "t-m1", agentSlug: "seo-tech-auditor", title: { fr: "Audit technique du site principal", en: "Main site technical audit" }, status: "in_progress", priority: "high", dueDate: "2026-02-12" },
      { id: "t-m2", agentSlug: "keyword-strategist", title: { fr: "Cluster sémantique « Growth Hacking »", en: "'Growth Hacking' semantic cluster" }, status: "completed", priority: "normal", dueDate: "2026-02-09" },
      { id: "t-m3", agentSlug: "content-builder", title: { fr: "Rédaction article SEO « IA Marketing 2026 »", en: "SEO article writing 'AI Marketing 2026'" }, status: "review", priority: "high", dueDate: "2026-02-11" },
      { id: "t-m4", agentSlug: "social-media-manager", title: { fr: "Campagne LinkedIn Q1 2026", en: "LinkedIn Campaign Q1 2026" }, status: "pending", priority: "normal", dueDate: "2026-02-15" },
    ],
    sales: [
      { id: "t-s1", agentSlug: "offer-architect", title: { fr: "Nouveau package « Scale-Up »", en: "New 'Scale-Up' package" }, status: "in_progress", priority: "high", dueDate: "2026-02-14" },
      { id: "t-s2", agentSlug: "sales-accelerator", title: { fr: "Scoring des 150 leads entrants", en: "Scoring of 150 inbound leads" }, status: "completed", priority: "urgent", dueDate: "2026-02-10" },
      { id: "t-s3", agentSlug: "lifecycle-manager", title: { fr: "Séquence nurturing « Onboarding Client »", en: "'Client Onboarding' nurturing sequence" }, status: "in_progress", priority: "normal", dueDate: "2026-02-13" },
      { id: "t-s4", agentSlug: "deal-closer", title: { fr: "Proposition Entreprise X — closing", en: "Enterprise X proposal — closing" }, status: "pending", priority: "urgent", dueDate: "2026-02-11" },
    ],
    finance: [
      { id: "t-f1", agentSlug: "revenue-analyst", title: { fr: "Rapport revenus hebdomadaire", en: "Weekly revenue report" }, status: "completed", priority: "high", dueDate: "2026-02-10" },
      { id: "t-f2", agentSlug: "budget-optimizer", title: { fr: "Optimisation budget Q1 2026", en: "Q1 2026 budget optimization" }, status: "in_progress", priority: "high", dueDate: "2026-02-14" },
      { id: "t-f3", agentSlug: "billing-manager", title: { fr: "Facturation automatisée — lot février", en: "Automated billing — February batch" }, status: "pending", priority: "normal", dueDate: "2026-02-28" },
    ],
    security: [
      { id: "t-sec1", agentSlug: "security-auditor", title: { fr: "Audit trimestriel de vulnérabilités", en: "Quarterly vulnerability audit" }, status: "completed", priority: "high", dueDate: "2026-02-09" },
      { id: "t-sec2", agentSlug: "access-controller", title: { fr: "Revue des permissions utilisateurs", en: "User permissions review" }, status: "in_progress", priority: "normal", dueDate: "2026-02-12" },
      { id: "t-sec3", agentSlug: "threat-monitor", title: { fr: "Monitoring anomalies — rapport hebdo", en: "Anomaly monitoring — weekly report" }, status: "in_progress", priority: "high", dueDate: "2026-02-10" },
    ],
    product: [
      { id: "t-p1", agentSlug: "feature-analyst", title: { fr: "Analyse feature requests Q4 2025", en: "Q4 2025 feature requests analysis" }, status: "completed", priority: "normal", dueDate: "2026-02-08" },
      { id: "t-p2", agentSlug: "ux-optimizer", title: { fr: "Audit UX du parcours onboarding", en: "Onboarding journey UX audit" }, status: "in_progress", priority: "high", dueDate: "2026-02-13" },
      { id: "t-p3", agentSlug: "roadmap-planner", title: { fr: "Roadmap Q1-Q2 2026", en: "Q1-Q2 2026 Roadmap" }, status: "review", priority: "urgent", dueDate: "2026-02-11" },
      { id: "t-p4", agentSlug: "backlog-manager", title: { fr: "Nettoyage backlog — 45 tickets archivés", en: "Backlog cleanup — 45 tickets archived" }, status: "completed", priority: "low", dueDate: "2026-02-07" },
    ],
    engineering: [
      { id: "t-e1", agentSlug: "code-reviewer", title: { fr: "Revue de code — module paiement v2", en: "Code review — payment module v2" }, status: "in_progress", priority: "high", dueDate: "2026-02-11" },
      { id: "t-e2", agentSlug: "performance-engineer", title: { fr: "Optimisation temps de chargement dashboard", en: "Dashboard loading time optimization" }, status: "in_progress", priority: "high", dueDate: "2026-02-12" },
      { id: "t-e3", agentSlug: "devops-agent", title: { fr: "Migration CDN Cloudflare → Vercel Edge", en: "CDN migration Cloudflare → Vercel Edge" }, status: "review", priority: "urgent", dueDate: "2026-02-10" },
      { id: "t-e4", agentSlug: "api-integrator", title: { fr: "Intégration API HubSpot v3", en: "HubSpot API v3 integration" }, status: "pending", priority: "normal", dueDate: "2026-02-18" },
    ],
    data: [
      { id: "t-d1", agentSlug: "analytics-guardian", title: { fr: "Synchronisation GA4 + GSC — détection anomalies", en: "GA4 + GSC sync — anomaly detection" }, status: "completed", priority: "high", dueDate: "2026-02-10" },
      { id: "t-d2", agentSlug: "data-engineer", title: { fr: "Pipeline ETL — nouvelle source Meta Ads", en: "ETL pipeline — new Meta Ads source" }, status: "in_progress", priority: "normal", dueDate: "2026-02-14" },
      { id: "t-d3", agentSlug: "ml-trainer", title: { fr: "Modèle prédictif de churn — v2", en: "Churn prediction model — v2" }, status: "in_progress", priority: "high", dueDate: "2026-02-16" },
      { id: "t-d4", agentSlug: "reporting-agent", title: { fr: "Dashboard automatique KPIs marketing", en: "Automated marketing KPIs dashboard" }, status: "completed", priority: "normal", dueDate: "2026-02-08" },
    ],
    support: [
      { id: "t-sup1", agentSlug: "reputation-guardian", title: { fr: "Monitoring avis Google — réponses automatiques", en: "Google reviews monitoring — auto responses" }, status: "in_progress", priority: "normal", dueDate: "2026-02-10" },
      { id: "t-sup2", agentSlug: "ticket-handler", title: { fr: "Traitement des 34 tickets en attente", en: "Processing 34 pending tickets" }, status: "in_progress", priority: "high", dueDate: "2026-02-10" },
      { id: "t-sup3", agentSlug: "knowledge-manager", title: { fr: "Mise à jour base de connaissances — 12 articles", en: "Knowledge base update — 12 articles" }, status: "review", priority: "normal", dueDate: "2026-02-12" },
    ],
    governance: [
      { id: "t-g1", agentSlug: "compliance-auditor", title: { fr: "Audit RGPD trimestriel", en: "Quarterly GDPR audit" }, status: "completed", priority: "high", dueDate: "2026-02-09" },
      { id: "t-g2", agentSlug: "policy-enforcer", title: { fr: "Mise à jour politique de sécurité interne", en: "Internal security policy update" }, status: "in_progress", priority: "normal", dueDate: "2026-02-14" },
      { id: "t-g3", agentSlug: "risk-assessor", title: { fr: "Matrice de risques Q1 2026", en: "Q1 2026 risk matrix" }, status: "pending", priority: "high", dueDate: "2026-02-15" },
    ],
    hr: [
      { id: "t-h1", agentSlug: "recruitment-agent", title: { fr: "Screening 45 candidatures Dev Senior", en: "Screening 45 Senior Dev applications" }, status: "completed", priority: "urgent", dueDate: "2026-02-08" },
      { id: "t-h2", agentSlug: "employee-experience", title: { fr: "Enquête satisfaction Q4 — analyse", en: "Q4 satisfaction survey — analysis" }, status: "in_progress", priority: "normal", dueDate: "2026-02-12" },
      { id: "t-h3", agentSlug: "training-coach", title: { fr: "Programme formation IA pour équipe marketing", en: "AI training program for marketing team" }, status: "pending", priority: "high", dueDate: "2026-02-20" },
      { id: "t-h4", agentSlug: "performance-manager", title: { fr: "Évaluations de performance S2 2025", en: "H2 2025 performance evaluations" }, status: "review", priority: "high", dueDate: "2026-02-11" },
    ],
    legal: [
      { id: "t-l1", agentSlug: "contract-analyzer", title: { fr: "Analyse contrat fournisseur cloud", en: "Cloud vendor contract analysis" }, status: "in_progress", priority: "high", dueDate: "2026-02-11" },
      { id: "t-l2", agentSlug: "ip-specialist", title: { fr: "Veille marques — 3 dépôts à surveiller", en: "Trademark watch — 3 filings to monitor" }, status: "in_progress", priority: "normal", dueDate: "2026-02-14" },
      { id: "t-l3", agentSlug: "regulatory-advisor", title: { fr: "Impact nouvelle réglementation IA (EU AI Act)", en: "Impact of new AI regulation (EU AI Act)" }, status: "pending", priority: "urgent", dueDate: "2026-02-15" },
    ],
  };
  return tasksByDept[departmentSlug] || [];
}

// ── Department Metrics ──
export interface DepartmentMetric {
  label: Record<string, string>;
  value: string;
  change: string;
  positive: boolean;
}

export function getMockMetricsForDepartment(departmentSlug: string): DepartmentMetric[] {
  const metrics: Record<string, DepartmentMetric[]> = {
    marketing: [
      { label: { fr: "Trafic organique", en: "Organic traffic" }, value: "24 350", change: "+12%", positive: true },
      { label: { fr: "Mots-clés Top 10", en: "Top 10 keywords" }, value: "187", change: "+23", positive: true },
      { label: { fr: "Articles publiés", en: "Published articles" }, value: "8", change: "+3", positive: true },
      { label: { fr: "Taux de conversion", en: "Conversion rate" }, value: "3.2%", change: "+0.4%", positive: true },
    ],
    sales: [
      { label: { fr: "Leads qualifiés", en: "Qualified leads" }, value: "156", change: "+34", positive: true },
      { label: { fr: "Pipeline total", en: "Total pipeline" }, value: "€245K", change: "+18%", positive: true },
      { label: { fr: "Taux de closing", en: "Close rate" }, value: "28%", change: "+4%", positive: true },
      { label: { fr: "Cycle de vente moyen", en: "Avg sales cycle" }, value: "18j", change: "-5j", positive: true },
    ],
    finance: [
      { label: { fr: "MRR", en: "MRR" }, value: "€47.2K", change: "+8.3%", positive: true },
      { label: { fr: "Marge nette", en: "Net margin" }, value: "34%", change: "+2%", positive: true },
      { label: { fr: "Budget consommé", en: "Budget consumed" }, value: "68%", change: "On track", positive: true },
    ],
    security: [
      { label: { fr: "Score de sécurité", en: "Security score" }, value: "94/100", change: "+3", positive: true },
      { label: { fr: "Vulnérabilités ouvertes", en: "Open vulnerabilities" }, value: "0", change: "-2", positive: true },
      { label: { fr: "Uptime", en: "Uptime" }, value: "99.98%", change: "+0.01%", positive: true },
    ],
    product: [
      { label: { fr: "Features livrées", en: "Features shipped" }, value: "12", change: "+5", positive: true },
      { label: { fr: "NPS", en: "NPS" }, value: "72", change: "+8", positive: true },
      { label: { fr: "Backlog items", en: "Backlog items" }, value: "34", change: "-12", positive: true },
      { label: { fr: "Vélocité sprint", en: "Sprint velocity" }, value: "45pts", change: "+7pts", positive: true },
    ],
    engineering: [
      { label: { fr: "Couverture tests", en: "Test coverage" }, value: "87%", change: "+3%", positive: true },
      { label: { fr: "Bugs ouverts", en: "Open bugs" }, value: "5", change: "-8", positive: true },
      { label: { fr: "Déploiements/semaine", en: "Deploys/week" }, value: "14", change: "+3", positive: true },
      { label: { fr: "MTTR", en: "MTTR" }, value: "12min", change: "-5min", positive: true },
    ],
    data: [
      { label: { fr: "Pipelines actifs", en: "Active pipelines" }, value: "8", change: "+2", positive: true },
      { label: { fr: "Qualité données", en: "Data quality" }, value: "96%", change: "+1%", positive: true },
      { label: { fr: "Modèles déployés", en: "Models deployed" }, value: "3", change: "+1", positive: true },
      { label: { fr: "Insights générés", en: "Insights generated" }, value: "47", change: "+12", positive: true },
    ],
    support: [
      { label: { fr: "Tickets résolus", en: "Tickets resolved" }, value: "234", change: "+45", positive: true },
      { label: { fr: "Temps réponse moyen", en: "Avg response time" }, value: "2.4h", change: "-1.2h", positive: true },
      { label: { fr: "CSAT", en: "CSAT" }, value: "4.7/5", change: "+0.3", positive: true },
    ],
    governance: [
      { label: { fr: "Score conformité", en: "Compliance score" }, value: "98/100", change: "+2", positive: true },
      { label: { fr: "Politiques actives", en: "Active policies" }, value: "24", change: "+3", positive: true },
      { label: { fr: "Risques identifiés", en: "Risks identified" }, value: "7", change: "-4", positive: true },
    ],
    hr: [
      { label: { fr: "Postes ouverts", en: "Open positions" }, value: "6", change: "+2", positive: false },
      { label: { fr: "Engagement", en: "Engagement" }, value: "87%", change: "+5%", positive: true },
      { label: { fr: "Formations terminées", en: "Trainings completed" }, value: "18", change: "+7", positive: true },
      { label: { fr: "Rétention", en: "Retention" }, value: "95%", change: "+2%", positive: true },
    ],
    legal: [
      { label: { fr: "Contrats analysés", en: "Contracts analyzed" }, value: "12", change: "+4", positive: true },
      { label: { fr: "Clauses à risque", en: "Risky clauses" }, value: "3", change: "-2", positive: true },
      { label: { fr: "Conformité légale", en: "Legal compliance" }, value: "100%", change: "Stable", positive: true },
    ],
  };
  return metrics[departmentSlug] || [];
}

// ── Agent Chat Scripted Responses ──
export interface AgentChatMessage {
  role: "agent" | "user";
  content: Record<string, string>;
}

export function getAgentGreeting(agentSlug: string): Record<string, string> {
  const greetings: Record<string, Record<string, string>> = {
    "seo-tech-auditor": {
      fr: "Bonjour ! Je suis Emma Lefebvre, votre auditrice SEO technique. Je surveille en permanence la santé technique de votre site. Actuellement, j'ai identifié 3 points d'amélioration sur vos Core Web Vitals. Souhaitez-vous que je vous présente mon dernier rapport ?",
      en: "Hello! I'm Emma Lefebvre, your Technical SEO Auditor. I continuously monitor your site's technical health. I've currently identified 3 improvement points on your Core Web Vitals. Would you like me to present my latest report?",
    },
    "keyword-strategist": {
      fr: "Bonjour ! Thomas Duval, Stratège Mots-clés. J'ai terminé l'analyse des clusters sémantiques de ce mois. J'ai identifié 34 nouvelles opportunités long-tail avec un volume total de 12 400 recherches/mois. Par quel cluster souhaitez-vous commencer ?",
      en: "Hello! Thomas Duval, Keyword Strategist. I've completed this month's semantic cluster analysis. I've identified 34 new long-tail opportunities with a total volume of 12,400 searches/month. Which cluster would you like to start with?",
    },
    "content-builder": {
      fr: "Bonjour ! Léa Fontaine, Créatrice de Contenu. Le brief SEO de janvier est prêt — 5 articles planifiés, tous optimisés avec le framework AIDA. L'article prioritaire cible le mot-clé « automatisation growth 2026 ». Voulez-vous le relire avant publication ?",
      en: "Hello! Léa Fontaine, Content Builder. The January SEO brief is ready — 5 articles planned, all optimized with the AIDA framework. The priority article targets the keyword 'growth automation 2026'. Would you like to review it before publishing?",
    },
    "revenue-analyst": {
      fr: "Bonjour ! François Martin, Analyste Revenus. Le MRR a atteint €47.2K ce mois, soit +8.3% par rapport au mois dernier. La marge nette s'est améliorée de 2 points. Je détecte une opportunité d'upsell sur 12 comptes existants. Souhaitez-vous le détail ?",
      en: "Hello! François Martin, Revenue Analyst. MRR has reached €47.2K this month, up 8.3% from last month. Net margin improved by 2 points. I'm detecting an upsell opportunity on 12 existing accounts. Would you like the details?",
    },
    "sales-accelerator": {
      fr: "Bonjour ! Marie Laurent, Accélérateur Commercial. J'ai qualifié 23 nouveaux leads cette semaine — 8 sont classés A+ avec un score de propension élevé. Le pipeline total est à €245K. Dois-je préparer les séquences de relance pour les leads A+ ?",
      en: "Hello! Marie Laurent, Sales Accelerator. I've qualified 23 new leads this week — 8 are classified A+ with a high propensity score. Total pipeline is at €245K. Should I prepare follow-up sequences for A+ leads?",
    },
    "security-auditor": {
      fr: "Bonjour ! Pierre Lambert, Auditeur Sécurité. L'audit trimestriel est terminé : 0 vulnérabilité critique, 2 mineures corrigées. Le score de sécurité est à 94/100. Uptime à 99.98%. Tout est nominal. Voulez-vous le rapport complet ?",
      en: "Hello! Pierre Lambert, Security Auditor. The quarterly audit is complete: 0 critical vulnerabilities, 2 minor ones fixed. Security score is at 94/100. Uptime at 99.98%. Everything is nominal. Would you like the full report?",
    },
  };

  return greetings[agentSlug] || {
    fr: `Bonjour ! Je suis prêt à vous aider. Comment puis-je vous assister aujourd'hui ?`,
    en: `Hello! I'm ready to help. How can I assist you today?`,
  };
}

export function getAgentResponses(agentSlug: string): Record<string, string>[] {
  const defaultResponses = [
    {
      fr: "J'ai analysé les données et voici mes conclusions : les performances sont en hausse sur les 7 derniers jours. Je recommande de maintenir la stratégie actuelle tout en optimisant les points suivants.",
      en: "I've analyzed the data and here are my conclusions: performance is up over the last 7 days. I recommend maintaining the current strategy while optimizing the following points.",
    },
    {
      fr: "Très bien, je lance l'exécution de cette tâche. Vous recevrez une notification dès qu'elle sera terminée. Estimé à environ 15 minutes.",
      en: "Very well, I'm launching this task execution. You'll receive a notification once it's complete. Estimated around 15 minutes.",
    },
    {
      fr: "Voici le rapport détaillé. Les points clés : +12% sur l'indicateur principal, 3 actions prioritaires identifiées, et une recommandation d'approbation soumise pour validation.",
      en: "Here's the detailed report. Key points: +12% on the main indicator, 3 priority actions identified, and an approval recommendation submitted for validation.",
    },
  ];

  return defaultResponses;
}

// ── URL Analysis Mock Results ──
export interface AnalysisResult {
  seoScore: number;
  contentScore: number;
  speedScore: number;
  technicalScore: number;
  recommendations: { priority: "high" | "medium" | "low"; text: Record<string, string> }[];
  metrics: { label: Record<string, string>; value: string; status: "good" | "warning" | "error" }[];
}

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  seoScore: 72,
  contentScore: 65,
  speedScore: 84,
  technicalScore: 78,
  recommendations: [
    { priority: "high", text: { fr: "Ajouter des meta descriptions uniques sur 12 pages", en: "Add unique meta descriptions to 12 pages" } },
    { priority: "high", text: { fr: "Corriger 8 erreurs 404 détectées dans le crawl", en: "Fix 8 404 errors detected in the crawl" } },
    { priority: "medium", text: { fr: "Optimiser les images (compression + lazy loading) — gain estimé : -1.2s LCP", en: "Optimize images (compression + lazy loading) — estimated gain: -1.2s LCP" } },
    { priority: "medium", text: { fr: "Implémenter le schema markup Article sur les pages blog", en: "Implement Article schema markup on blog pages" } },
    { priority: "medium", text: { fr: "Améliorer le maillage interne — 15 pages orphelines détectées", en: "Improve internal linking — 15 orphan pages detected" } },
    { priority: "low", text: { fr: "Migrer vers HTTP/3 pour améliorer le TTFB", en: "Migrate to HTTP/3 to improve TTFB" } },
    { priority: "low", text: { fr: "Ajouter des données structurées FAQ sur la page d'accueil", en: "Add FAQ structured data to the homepage" } },
  ],
  metrics: [
    { label: { fr: "Temps de chargement", en: "Load time" }, value: "2.4s", status: "warning" },
    { label: { fr: "First Contentful Paint", en: "First Contentful Paint" }, value: "1.1s", status: "good" },
    { label: { fr: "Largest Contentful Paint", en: "Largest Contentful Paint" }, value: "3.2s", status: "warning" },
    { label: { fr: "Cumulative Layout Shift", en: "Cumulative Layout Shift" }, value: "0.05", status: "good" },
    { label: { fr: "Total Blocking Time", en: "Total Blocking Time" }, value: "180ms", status: "warning" },
    { label: { fr: "Pages indexées", en: "Indexed pages" }, value: "234", status: "good" },
    { label: { fr: "Erreurs 404", en: "404 errors" }, value: "8", status: "error" },
    { label: { fr: "Liens cassés", en: "Broken links" }, value: "3", status: "error" },
    { label: { fr: "Pages sans meta description", en: "Pages without meta description" }, value: "12", status: "warning" },
    { label: { fr: "Score mobile", en: "Mobile score" }, value: "88/100", status: "good" },
  ],
};
