/**
 * Agents Catalog - Central data source for all 39 AI agents
 * Used by /agents, /agents/[slug], and /departments/[slug] pages
 */

import {
  Brain, Search, FileText, BarChart3, Megaphone, Shield, Zap, PenTool,
  Target, Share2, Eye, Users, Briefcase, Code, HeadphonesIcon, Database,
  Settings, Bot, TrendingUp, Lock, AlertTriangle, Clipboard, Palette,
  Map, GitBranch, TestTube, Link2, Wrench, Cpu, LineChart, Receipt,
  UserCheck, Heart, Scale, Globe, Mail, Layers, Activity, Gauge,
  BookOpen, Gavel
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AgentCatalogItem {
  slug: string;
  name: string;
  role: Record<string, string>;
  department: string;
  departmentSlug: string;
  description: Record<string, string>;
  useCases: Record<string, string[]>;
  capabilities: string[];
  icon: LucideIcon;
  color: string;
  riskLevel: "low" | "medium" | "high";
  requiresApproval: boolean;
  persona: { name: string; initials: string };
}

export interface DepartmentWorkflowStep {
  label: Record<string, string>;
  description: Record<string, string>;
}

export interface DepartmentCatalogItem {
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  icon: LucideIcon;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  agentCount: number;
  features: Record<string, string[]>;
  heroMetric: Record<string, string>;
  workflow: DepartmentWorkflowStep[];
  integrations: string[];
}

export const AGENTS_CATALOG: AgentCatalogItem[] = [
  // ── MARKETING (4) ──
  {
    slug: "seo-tech-auditor",
    name: "Tech SEO Auditor",
    role: { fr: "Auditeur SEO Technique", en: "Tech SEO Auditor" },
    department: "Marketing",
    departmentSlug: "marketing",
    description: {
      fr: "Crawle le site, identifie les erreurs techniques et génère les correctifs. Analyse Core Web Vitals, E-E-A-T, schema markup et structure du site.",
      en: "Crawls the site, identifies technical errors and generates fixes. Analyzes Core Web Vitals, E-E-A-T, schema markup and site structure.",
    },
    useCases: {
      fr: ["Audit technique complet", "Détection erreurs 404/500", "Optimisation Core Web Vitals", "Analyse de la structure de liens"],
      en: ["Full technical audit", "404/500 error detection", "Core Web Vitals optimization", "Link structure analysis"],
    },
    capabilities: ["seo_audit"],
    icon: Search,
    color: "#f59e0b",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Emma Lefebvre", initials: "EL" },
  },
  {
    slug: "keyword-strategist",
    name: "Keyword Strategist",
    role: { fr: "Stratège Mots-clés", en: "Keyword Strategist" },
    department: "Marketing",
    departmentSlug: "marketing",
    description: {
      fr: "Analyse les mots-clés, crée les clusters sémantiques et planifie le calendrier éditorial. Identifie les opportunités de positionnement.",
      en: "Analyzes keywords, creates semantic clusters and plans the editorial calendar. Identifies ranking opportunities.",
    },
    useCases: {
      fr: ["Recherche de mots-clés", "Clusters sémantiques", "Calendrier éditorial", "Analyse de la concurrence SEO"],
      en: ["Keyword research", "Semantic clusters", "Editorial calendar", "SEO competitive analysis"],
    },
    capabilities: ["keyword_research"],
    icon: Target,
    color: "#8b5cf6",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Thomas Duval", initials: "TD" },
  },
  {
    slug: "content-builder",
    name: "Content Builder",
    role: { fr: "Créateur de Contenu", en: "Content Builder" },
    department: "Marketing",
    departmentSlug: "marketing",
    description: {
      fr: "Génère du contenu optimisé SEO basé sur les briefs. Rédige les textes conversion-first avec frameworks AIDA/PAS.",
      en: "Generates SEO-optimized content based on briefs. Writes conversion-first copy using AIDA/PAS frameworks.",
    },
    useCases: {
      fr: ["Rédaction d'articles SEO", "Landing pages optimisées", "Briefs automatiques", "Optimisation des méta-descriptions"],
      en: ["SEO article writing", "Optimized landing pages", "Automatic briefs", "Meta description optimization"],
    },
    capabilities: ["content_creation"],
    icon: PenTool,
    color: "#ec4899",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Léa Fontaine", initials: "LF" },
  },
  {
    slug: "social-media-manager",
    name: "Social Media Manager",
    role: { fr: "Manager Réseaux Sociaux", en: "Social Media Manager" },
    department: "Marketing",
    departmentSlug: "marketing",
    description: {
      fr: "Planifie et optimise la présence sur les réseaux sociaux et la visibilité locale. Génère du contenu, analyse les performances, gère la communauté et les fiches Google Business Profile.",
      en: "Plans and optimizes social media presence and local visibility. Generates content, analyzes performance, manages community and Google Business Profile listings.",
    },
    useCases: {
      fr: ["Planification de posts", "Analyse des performances", "Gestion de communauté", "Veille concurrentielle sociale"],
      en: ["Post scheduling", "Performance analysis", "Community management", "Social competitive monitoring"],
    },
    capabilities: ["social_scheduling"],
    icon: Share2,
    color: "#06b6d4",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Marc Rousseau", initials: "MR" },
  },

  // ── SALES (4) ──
  {
    slug: "offer-architect",
    name: "Offer Architect",
    role: { fr: "Architecte d'Offres", en: "Offer Architect" },
    department: "Sales",
    departmentSlug: "sales",
    description: {
      fr: "Définit la stratégie commerciale et conçoit des offres irrésistibles. Optimise le pricing et les packages produit.",
      en: "Defines sales strategy and designs irresistible offers. Optimizes pricing and product packages.",
    },
    useCases: {
      fr: ["Conception d'offres", "Optimisation du pricing", "Packages produit", "Analyse de la valeur perçue"],
      en: ["Offer design", "Pricing optimization", "Product packages", "Perceived value analysis"],
    },
    capabilities: ["offer_generation"],
    icon: Briefcase,
    color: "#eab308",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Alexandre Petit", initials: "AP" },
  },
  {
    slug: "sales-accelerator",
    name: "Sales Accelerator",
    role: { fr: "Accélérateur Commercial", en: "Sales Accelerator" },
    department: "Sales",
    departmentSlug: "sales",
    description: {
      fr: "Qualifie les leads entrants, priorise les opportunités et accélère le pipeline de vente avec des recommandations IA.",
      en: "Qualifies inbound leads, prioritizes opportunities and accelerates the sales pipeline with AI recommendations.",
    },
    useCases: {
      fr: ["Lead scoring automatique", "Priorisation des opportunités", "Recommandations de relance", "Analyse du pipeline"],
      en: ["Automatic lead scoring", "Opportunity prioritization", "Follow-up recommendations", "Pipeline analysis"],
    },
    capabilities: ["analytics_analysis"],
    icon: TrendingUp,
    color: "#ef4444",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Marie Laurent", initials: "ML" },
  },
  {
    slug: "lifecycle-manager",
    name: "Lifecycle Manager",
    role: { fr: "Manager Lifecycle", en: "Lifecycle Manager" },
    department: "Sales",
    departmentSlug: "sales",
    description: {
      fr: "Automatise les séquences email et nurturing. Accompagne les prospects et clients à chaque étape du parcours.",
      en: "Automates email sequences and nurturing. Guides prospects and customers through every stage of the journey.",
    },
    useCases: {
      fr: ["Séquences email automatisées", "Nurturing leads", "Onboarding clients", "Réactivation des inactifs"],
      en: ["Automated email sequences", "Lead nurturing", "Client onboarding", "Inactive reactivation"],
    },
    capabilities: ["lifecycle_automation"],
    icon: Mail,
    color: "#a855f7",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Julien Morel", initials: "JM" },
  },
  {
    slug: "deal-closer",
    name: "Deal Closer",
    role: { fr: "Closer Commercial", en: "Deal Closer" },
    department: "Sales",
    departmentSlug: "sales",
    description: {
      fr: "Accompagne les prospects jusqu'à la signature. Optimise les processus de closing et détecte les opportunités d'upsell.",
      en: "Guides prospects through to signature. Optimizes closing processes and detects upsell opportunities.",
    },
    useCases: {
      fr: ["Optimisation du closing", "Détection upsell", "Négociation assistée", "Suivi des contrats"],
      en: ["Closing optimization", "Upsell detection", "Assisted negotiation", "Contract tracking"],
    },
    capabilities: ["offer_generation", "analytics_analysis"],
    icon: Zap,
    color: "#f97316",
    riskLevel: "high",
    requiresApproval: true,
    persona: { name: "Camille Roux", initials: "CR" },
  },

  // ── FINANCE (3) ──
  {
    slug: "revenue-analyst",
    name: "Revenue Analyst",
    role: { fr: "Analyste Revenus", en: "Revenue Analyst" },
    department: "Finance",
    departmentSlug: "finance",
    description: {
      fr: "Supervise la santé financière et les prévisions. Analyse les revenus et prédit les tendances financières.",
      en: "Oversees financial health and forecasting. Analyzes revenue and predicts financial trends.",
    },
    useCases: {
      fr: ["Analyse des revenus", "Prévisions financières", "Détection d'anomalies", "Rapports de rentabilité"],
      en: ["Revenue analysis", "Financial forecasting", "Anomaly detection", "Profitability reports"],
    },
    capabilities: ["analytics_analysis", "report_generation"],
    icon: LineChart,
    color: "#22c55e",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "François Martin", initials: "FM" },
  },
  {
    slug: "budget-optimizer",
    name: "Budget Optimizer",
    role: { fr: "Optimiseur Budget", en: "Budget Optimizer" },
    department: "Finance",
    departmentSlug: "finance",
    description: {
      fr: "Analyse les coûts et la rentabilité par projet. Optimise l'allocation budgétaire et identifie les économies.",
      en: "Analyzes costs and project profitability. Optimizes budget allocation and identifies savings.",
    },
    useCases: {
      fr: ["Optimisation budgétaire", "Analyse des coûts", "Identification des économies", "Allocation des ressources"],
      en: ["Budget optimization", "Cost analysis", "Savings identification", "Resource allocation"],
    },
    capabilities: ["budget_analysis", "analytics_analysis"],
    icon: BarChart3,
    color: "#16a34a",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Isabelle Durand", initials: "ID" },
  },
  {
    slug: "billing-manager",
    name: "Billing Manager",
    role: { fr: "Manager Facturation", en: "Billing Manager" },
    department: "Finance",
    departmentSlug: "finance",
    description: {
      fr: "Pilote les budgets et les écarts. Gère la facturation et les paiements automatisés.",
      en: "Manages budgets and variance analysis. Handles billing and automated payments.",
    },
    useCases: {
      fr: ["Gestion de la facturation", "Suivi des paiements", "Analyse des écarts", "Automatisation comptable"],
      en: ["Billing management", "Payment tracking", "Variance analysis", "Accounting automation"],
    },
    capabilities: ["report_generation"],
    icon: Receipt,
    color: "#15803d",
    riskLevel: "high",
    requiresApproval: true,
    persona: { name: "Paul Leroy", initials: "PL" },
  },

  // ── SECURITY (3) ──
  {
    slug: "security-auditor",
    name: "Security Auditor",
    role: { fr: "Auditeur Sécurité", en: "Security Auditor" },
    department: "Security",
    departmentSlug: "security",
    description: {
      fr: "Garantit la sécurité des systèmes et des données. Audite les vulnérabilités et renforce les processus de sécurité.",
      en: "Ensures system and data security. Audits vulnerabilities and strengthens security processes.",
    },
    useCases: {
      fr: ["Audit de vulnérabilités", "Scan de sécurité", "Rapport de conformité", "Tests de pénétration"],
      en: ["Vulnerability audit", "Security scan", "Compliance report", "Penetration testing"],
    },
    capabilities: ["security_audit", "compliance_check"],
    icon: Shield,
    color: "#dc2626",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Pierre Lambert", initials: "PL" },
  },
  {
    slug: "access-controller",
    name: "Access Controller",
    role: { fr: "Contrôleur d'Accès", en: "Access Controller" },
    department: "Security",
    departmentSlug: "security",
    description: {
      fr: "Veille à la conformité RGPD et réglementaire. Gère les contrôles d'accès et les permissions utilisateurs.",
      en: "Ensures GDPR and regulatory compliance. Manages access controls and user permissions.",
    },
    useCases: {
      fr: ["Gestion des accès", "Revue des permissions", "Audit RGPD", "Contrôle des identités"],
      en: ["Access management", "Permission review", "GDPR audit", "Identity control"],
    },
    capabilities: ["security_audit", "compliance_check"],
    icon: Lock,
    color: "#b91c1c",
    riskLevel: "high",
    requiresApproval: true,
    persona: { name: "Claire Dubois", initials: "CD" },
  },
  {
    slug: "threat-monitor",
    name: "Threat Monitor",
    role: { fr: "Moniteur de Menaces", en: "Threat Monitor" },
    department: "Security",
    departmentSlug: "security",
    description: {
      fr: "Audite et renforce les processus de sécurité. Surveille les menaces en temps réel et alerte sur les anomalies.",
      en: "Audits and strengthens security processes. Monitors threats in real-time and alerts on anomalies.",
    },
    useCases: {
      fr: ["Surveillance en temps réel", "Détection d'anomalies", "Alertes de sécurité", "Analyse des menaces"],
      en: ["Real-time monitoring", "Anomaly detection", "Security alerts", "Threat analysis"],
    },
    capabilities: ["security_audit"],
    icon: AlertTriangle,
    color: "#991b1b",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Nicolas Bernard", initials: "NB" },
  },

  // ── PRODUCT (4) ──
  {
    slug: "feature-analyst",
    name: "Feature Analyst",
    role: { fr: "Analyste Fonctionnel", en: "Feature Analyst" },
    department: "Product",
    departmentSlug: "product",
    description: {
      fr: "Définit la vision produit et la roadmap stratégique. Analyse les demandes de fonctionnalités et priorise le backlog.",
      en: "Defines product vision and strategic roadmap. Analyzes feature requests and prioritizes the backlog.",
    },
    useCases: {
      fr: ["Analyse des demandes", "Priorisation du backlog", "Étude d'impact", "Roadmap produit"],
      en: ["Request analysis", "Backlog prioritization", "Impact study", "Product roadmap"],
    },
    capabilities: ["analytics_analysis", "ux_analysis"],
    icon: Clipboard,
    color: "#7c3aed",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Amélie Girard", initials: "AG" },
  },
  {
    slug: "ux-optimizer",
    name: "UX Optimizer",
    role: { fr: "Optimiseur UX", en: "UX Optimizer" },
    department: "Product",
    departmentSlug: "product",
    description: {
      fr: "Analyse les comportements utilisateurs et optimise l'expérience. Propose des améliorations UX basées sur les données.",
      en: "Analyzes user behavior and optimizes experience. Proposes data-driven UX improvements.",
    },
    useCases: {
      fr: ["Tests d'utilisabilité", "Heatmaps & parcours", "Recommandations UX", "Optimisation des flows"],
      en: ["Usability testing", "Heatmaps & journeys", "UX recommendations", "Flow optimization"],
    },
    capabilities: ["ux_analysis", "cro_testing"],
    icon: Palette,
    color: "#6d28d9",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Laura Simon", initials: "LS" },
  },
  {
    slug: "roadmap-planner",
    name: "Roadmap Planner",
    role: { fr: "Planificateur Roadmap", en: "Roadmap Planner" },
    department: "Product",
    departmentSlug: "product",
    description: {
      fr: "Gère le backlog et priorise les fonctionnalités. Planifie la roadmap produit et aligne les objectifs OKR.",
      en: "Manages the backlog and prioritizes features. Plans the product roadmap and aligns OKR objectives.",
    },
    useCases: {
      fr: ["Planification roadmap", "Alignement OKR", "Gestion du backlog", "Suivi des milestones"],
      en: ["Roadmap planning", "OKR alignment", "Backlog management", "Milestone tracking"],
    },
    capabilities: ["analytics_analysis", "report_generation"],
    icon: Map,
    color: "#5b21b6",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Vincent Mercier", initials: "VM" },
  },
  {
    slug: "backlog-manager",
    name: "Backlog Manager",
    role: { fr: "Manager Backlog", en: "Backlog Manager" },
    department: "Product",
    departmentSlug: "product",
    description: {
      fr: "Mesure l'adoption et l'impact des features. Organise et priorise le backlog produit.",
      en: "Measures feature adoption and impact. Organizes and prioritizes the product backlog.",
    },
    useCases: {
      fr: ["Organisation du backlog", "Mesure d'adoption", "Analyse d'impact", "Rapports produit"],
      en: ["Backlog organization", "Adoption measurement", "Impact analysis", "Product reports"],
    },
    capabilities: ["analytics_analysis"],
    icon: Layers,
    color: "#4c1d95",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Maxime Faure", initials: "MF" },
  },

  // ── ENGINEERING (4) ──
  {
    slug: "code-reviewer",
    name: "Code Reviewer",
    role: { fr: "Réviseur de Code", en: "Code Reviewer" },
    department: "Engineering",
    departmentSlug: "engineering",
    description: {
      fr: "Définit l'architecture technique et les standards. Revue de code automatisée, détection des problèmes et exécution des tests automatisés.",
      en: "Defines technical architecture and standards. Automated code review, problem detection and automated test execution.",
    },
    useCases: {
      fr: ["Revue de code automatisée", "Détection de bugs", "Standards de qualité", "Analyse de la dette technique"],
      en: ["Automated code review", "Bug detection", "Quality standards", "Technical debt analysis"],
    },
    capabilities: ["code_review"],
    icon: Code,
    color: "#0891b2",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Antoine Legrand", initials: "AL" },
  },
  {
    slug: "performance-engineer",
    name: "Performance Engineer",
    role: { fr: "Ingénieur Performance", en: "Performance Engineer" },
    department: "Engineering",
    departmentSlug: "engineering",
    description: {
      fr: "Supervise le développement et les revues de code. Optimise les performances applicatives et identifie les goulots.",
      en: "Oversees development and code reviews. Optimizes application performance and identifies bottlenecks.",
    },
    useCases: {
      fr: ["Optimisation des performances", "Analyse des goulots", "Profiling applicatif", "Recommandations d'architecture"],
      en: ["Performance optimization", "Bottleneck analysis", "Application profiling", "Architecture recommendations"],
    },
    capabilities: ["code_review", "analytics_analysis"],
    icon: Gauge,
    color: "#0e7490",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Sophie Blanc", initials: "SB" },
  },
  {
    slug: "devops-agent",
    name: "DevOps Agent",
    role: { fr: "Agent DevOps", en: "DevOps Agent" },
    department: "Engineering",
    departmentSlug: "engineering",
    description: {
      fr: "Automatise les déploiements et surveille l'infrastructure. Gère les pipelines CI/CD et la haute disponibilité.",
      en: "Automates deployments and monitors infrastructure. Manages CI/CD pipelines and high availability.",
    },
    useCases: {
      fr: ["Déploiement automatisé", "Monitoring infrastructure", "Pipeline CI/CD", "Haute disponibilité"],
      en: ["Automated deployment", "Infrastructure monitoring", "CI/CD pipeline", "High availability"],
    },
    capabilities: ["code_review"],
    icon: Wrench,
    color: "#155e75",
    riskLevel: "high",
    requiresApproval: true,
    persona: { name: "Romain Fournier", initials: "RF" },
  },
  {
    slug: "api-integrator",
    name: "API Integrator",
    role: { fr: "Intégrateur API", en: "API Integrator" },
    department: "Engineering",
    departmentSlug: "engineering",
    description: {
      fr: "Assure la qualité et les tests automatisés. Intègre et maintient les connexions API externes.",
      en: "Ensures quality and automated testing. Integrates and maintains external API connections.",
    },
    useCases: {
      fr: ["Intégration d'APIs", "Tests d'intégration", "Documentation technique", "Monitoring des endpoints"],
      en: ["API integration", "Integration testing", "Technical documentation", "Endpoint monitoring"],
    },
    capabilities: ["code_review"],
    icon: Link2,
    color: "#164e63",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Élise Perrin", initials: "EP" },
  },

  // ── DATA (4) ──
  {
    slug: "analytics-guardian",
    name: "Analytics Guardian",
    role: { fr: "Gardien Analytics", en: "Analytics Guardian" },
    department: "Data",
    departmentSlug: "data",
    description: {
      fr: "Définit la stratégie data et la gouvernance. Détecte les anomalies et génère des insights depuis les données.",
      en: "Defines data strategy and governance. Detects anomalies and generates insights from data.",
    },
    useCases: {
      fr: ["Synchronisation GSC/GA4", "Détection d'anomalies", "Dashboards automatiques", "Insights business"],
      en: ["GSC/GA4 sync", "Anomaly detection", "Automatic dashboards", "Business insights"],
    },
    capabilities: ["analytics_analysis"],
    icon: Eye,
    color: "#2563eb",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Chloé Martin", initials: "CM" },
  },
  {
    slug: "data-engineer",
    name: "Data Engineer",
    role: { fr: "Ingénieur Data", en: "Data Engineer" },
    department: "Data",
    departmentSlug: "data",
    description: {
      fr: "Construit les pipelines et l'infrastructure data. Assure la qualité et la disponibilité des données.",
      en: "Builds pipelines and data infrastructure. Ensures data quality and availability.",
    },
    useCases: {
      fr: ["Construction de pipelines", "ETL automatisé", "Qualité des données", "Infrastructure data"],
      en: ["Pipeline construction", "Automated ETL", "Data quality", "Data infrastructure"],
    },
    capabilities: ["data_engineering"],
    icon: Database,
    color: "#1d4ed8",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Hugo Dupont", initials: "HD" },
  },
  {
    slug: "ml-trainer",
    name: "ML Trainer",
    role: { fr: "Entraîneur ML", en: "ML Trainer" },
    department: "Data",
    departmentSlug: "data",
    description: {
      fr: "Analyse les données et génère les insights business. Développe et déploie les modèles prédictifs.",
      en: "Analyzes data and generates business insights. Develops and deploys predictive models.",
    },
    useCases: {
      fr: ["Modèles prédictifs", "Classification automatique", "Scoring leads", "Prédiction de churn"],
      en: ["Predictive models", "Automatic classification", "Lead scoring", "Churn prediction"],
    },
    capabilities: ["ml_training", "analytics_analysis"],
    icon: Cpu,
    color: "#1e40af",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Lucas André", initials: "LA" },
  },
  {
    slug: "reporting-agent",
    name: "Reporting Agent",
    role: { fr: "Agent de Reporting", en: "Reporting Agent" },
    department: "Data",
    departmentSlug: "data",
    description: {
      fr: "Génère des rapports automatisés et tableaux de bord. Crée des visualisations de données interactives.",
      en: "Generates automated reports and dashboards. Creates interactive data visualizations.",
    },
    useCases: {
      fr: ["Rapports automatisés", "Tableaux de bord", "Export PDF/CSV", "KPIs personnalisés"],
      en: ["Automated reports", "Dashboards", "PDF/CSV export", "Custom KPIs"],
    },
    capabilities: ["report_generation", "analytics_analysis"],
    icon: BarChart3,
    color: "#1e3a8a",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Julie Moreau", initials: "JMo" },
  },

  // ── SUPPORT (3) ──
  {
    slug: "reputation-guardian",
    name: "Reputation Guardian",
    role: { fr: "Gardien de la Réputation", en: "Reputation Guardian" },
    department: "Support",
    departmentSlug: "support",
    description: {
      fr: "Pilote l'expérience client et la satisfaction. Surveille et gère la réputation en ligne.",
      en: "Drives customer experience and satisfaction. Monitors and manages online reputation.",
    },
    useCases: {
      fr: ["Monitoring des avis", "Réponses automatisées", "Score de satisfaction", "Alertes réputation"],
      en: ["Review monitoring", "Automated responses", "Satisfaction score", "Reputation alerts"],
    },
    capabilities: ["reputation_monitoring"],
    icon: Activity,
    color: "#fbbf24",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Marine Chevalier", initials: "MC" },
  },
  {
    slug: "ticket-handler",
    name: "Ticket Handler",
    role: { fr: "Gestionnaire de Tickets", en: "Ticket Handler" },
    department: "Support",
    departmentSlug: "support",
    description: {
      fr: "Accompagne les clients vers leurs objectifs. Traite et priorise les tickets de support.",
      en: "Helps clients achieve their goals. Processes and prioritizes support tickets.",
    },
    useCases: {
      fr: ["Tri automatique des tickets", "Réponses pré-qualifiées", "Escalade intelligente", "SLA monitoring"],
      en: ["Automatic ticket sorting", "Pre-qualified responses", "Smart escalation", "SLA monitoring"],
    },
    capabilities: ["ticket_handling"],
    icon: HeadphonesIcon,
    color: "#f59e0b",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Thomas Gérard", initials: "TG" },
  },
  {
    slug: "knowledge-manager",
    name: "Knowledge Manager",
    role: { fr: "Manager Base de Connaissances", en: "Knowledge Manager" },
    department: "Support",
    departmentSlug: "support",
    description: {
      fr: "Résout les problèmes techniques en temps réel. Maintient et enrichit la base de connaissances.",
      en: "Resolves technical issues in real-time. Maintains and enriches the knowledge base.",
    },
    useCases: {
      fr: ["Base de connaissances", "FAQ automatisées", "Articles d'aide", "Recherche intelligente"],
      en: ["Knowledge base", "Automated FAQ", "Help articles", "Smart search"],
    },
    capabilities: ["content_creation"],
    icon: FileText,
    color: "#d97706",
    riskLevel: "low",
    requiresApproval: true,
    persona: { name: "Sarah Lemoine", initials: "SL" },
  },

  // ── GOVERNANCE (3) ──
  {
    slug: "compliance-auditor",
    name: "Compliance Auditor",
    role: { fr: "Auditeur de Conformité", en: "Compliance Auditor" },
    department: "Governance",
    departmentSlug: "governance",
    description: {
      fr: "Coordonne les opérations transverses. Audite la conformité réglementaire (RGPD, SOC2).",
      en: "Coordinates cross-functional operations. Audits regulatory compliance (GDPR, SOC2).",
    },
    useCases: {
      fr: ["Audit de conformité", "Checklist réglementaire", "Rapport RGPD", "Certification SOC2"],
      en: ["Compliance audit", "Regulatory checklist", "GDPR report", "SOC2 certification"],
    },
    capabilities: ["compliance_check", "security_audit"],
    icon: Scale,
    color: "#059669",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Philippe Renaud", initials: "PR" },
  },
  {
    slug: "policy-enforcer",
    name: "Policy Enforcer",
    role: { fr: "Exécuteur de Politiques", en: "Policy Enforcer" },
    department: "Governance",
    departmentSlug: "governance",
    description: {
      fr: "Gère les projets stratégiques et les deadlines. Applique les politiques et règles de l'organisation.",
      en: "Manages strategic projects and deadlines. Enforces organizational policies and rules.",
    },
    useCases: {
      fr: ["Application des politiques", "Gestion des dérogations", "Suivi des règles", "Audit des processus"],
      en: ["Policy enforcement", "Exception management", "Rule tracking", "Process audit"],
    },
    capabilities: ["compliance_check"],
    icon: Settings,
    color: "#047857",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Nathalie Vincent", initials: "NV" },
  },
  {
    slug: "risk-assessor",
    name: "Risk Assessor",
    role: { fr: "Évaluateur de Risques", en: "Risk Assessor" },
    department: "Governance",
    departmentSlug: "governance",
    description: {
      fr: "Optimise les processus et la performance opérationnelle. Évalue et quantifie les risques business.",
      en: "Optimizes processes and operational performance. Evaluates and quantifies business risks.",
    },
    useCases: {
      fr: ["Évaluation des risques", "Matrice de risques", "Plan de mitigation", "Monitoring continu"],
      en: ["Risk evaluation", "Risk matrix", "Mitigation plan", "Continuous monitoring"],
    },
    capabilities: ["risk_assessment", "analytics_analysis"],
    icon: AlertTriangle,
    color: "#065f46",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "David Gauthier", initials: "DG" },
  },

  // ── HR (4) ──
  {
    slug: "recruitment-agent",
    name: "Recruitment Agent",
    role: { fr: "Agent de Recrutement", en: "Recruitment Agent" },
    department: "HR",
    departmentSlug: "hr",
    description: {
      fr: "Pilote la stratégie RH et le développement des talents. Automatise le processus de recrutement et screening.",
      en: "Leads HR strategy and talent development. Automates the recruitment and screening process.",
    },
    useCases: {
      fr: ["Screening automatisé", "Matching candidats", "Suivi des candidatures", "Onboarding"],
      en: ["Automated screening", "Candidate matching", "Application tracking", "Onboarding"],
    },
    capabilities: ["recruitment"],
    icon: UserCheck,
    color: "#db2777",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Céline Hervé", initials: "CH" },
  },
  {
    slug: "employee-experience",
    name: "Employee Experience",
    role: { fr: "Expérience Employé", en: "Employee Experience" },
    department: "HR",
    departmentSlug: "hr",
    description: {
      fr: "Gère le recrutement et l'onboarding. Optimise l'expérience collaborateur et l'engagement.",
      en: "Manages recruitment and onboarding. Optimizes employee experience and engagement.",
    },
    useCases: {
      fr: ["Enquêtes de satisfaction", "Programme d'onboarding", "Suivi de l'engagement", "Développement des talents"],
      en: ["Satisfaction surveys", "Onboarding program", "Engagement tracking", "Talent development"],
    },
    capabilities: ["analytics_analysis"],
    icon: Heart,
    color: "#be185d",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Aurélien Brun", initials: "AB" },
  },
  {
    slug: "training-coach",
    name: "Training Coach",
    role: { fr: "Coach Formation", en: "Training Coach" },
    department: "HR",
    departmentSlug: "hr",
    description: {
      fr: "Conçoit et gère les programmes de formation. Identifie les besoins en compétences et mesure l'efficacité des formations.",
      en: "Designs and manages training programs. Identifies skill gaps and measures training effectiveness.",
    },
    useCases: {
      fr: ["Programmes de formation", "Analyse des compétences", "E-learning personnalisé", "Certification tracking"],
      en: ["Training programs", "Skills analysis", "Personalized e-learning", "Certification tracking"],
    },
    capabilities: ["training_management", "analytics_analysis"],
    icon: BookOpen,
    color: "#9d174d",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Diane Perret", initials: "DP" },
  },
  {
    slug: "performance-manager",
    name: "Performance Manager",
    role: { fr: "Manager Performance", en: "Performance Manager" },
    department: "HR",
    departmentSlug: "hr",
    description: {
      fr: "Pilote les évaluations de performance et les plans de développement. Automatise les revues et le suivi des objectifs OKR.",
      en: "Drives performance evaluations and development plans. Automates reviews and OKR objective tracking.",
    },
    useCases: {
      fr: ["Évaluations de performance", "Plans de développement", "Suivi des OKR", "Rapports de compétences"],
      en: ["Performance evaluations", "Development plans", "OKR tracking", "Skills reports"],
    },
    capabilities: ["analytics_analysis", "report_generation"],
    icon: BarChart3,
    color: "#881337",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Guillaume Fabre", initials: "GF" },
  },

  // ── LEGAL (3) ──
  {
    slug: "contract-analyzer",
    name: "Contract Analyzer",
    role: { fr: "Analyste Contractuel", en: "Contract Analyzer" },
    department: "Legal",
    departmentSlug: "legal",
    description: {
      fr: "Supervise les contrats et la conformité légale. Analyse les contrats et détecte les clauses à risque.",
      en: "Oversees contracts and legal compliance. Analyzes contracts and detects risky clauses.",
    },
    useCases: {
      fr: ["Analyse de contrats", "Détection de clauses à risque", "Conformité légale", "Veille réglementaire"],
      en: ["Contract analysis", "Risky clause detection", "Legal compliance", "Regulatory monitoring"],
    },
    capabilities: ["contract_review", "compliance_check"],
    icon: Scale,
    color: "#78350f",
    riskLevel: "high",
    requiresApproval: true,
    persona: { name: "Margaux Picard", initials: "MP" },
  },
  {
    slug: "ip-specialist",
    name: "IP Specialist",
    role: { fr: "Spécialiste Propriété Intellectuelle", en: "IP Specialist" },
    department: "Legal",
    departmentSlug: "legal",
    description: {
      fr: "Protège la propriété intellectuelle de l'entreprise. Surveille les marques, brevets et droits d'auteur.",
      en: "Protects company intellectual property. Monitors trademarks, patents and copyrights.",
    },
    useCases: {
      fr: ["Veille marques & brevets", "Protection des droits d'auteur", "Audit de propriété intellectuelle", "Gestion des licences"],
      en: ["Trademark & patent monitoring", "Copyright protection", "IP audit", "License management"],
    },
    capabilities: ["contract_review", "compliance_check"],
    icon: FileText,
    color: "#92400e",
    riskLevel: "medium",
    requiresApproval: true,
    persona: { name: "Élodie Renard", initials: "ER" },
  },
  {
    slug: "regulatory-advisor",
    name: "Regulatory Advisor",
    role: { fr: "Conseiller Réglementaire", en: "Regulatory Advisor" },
    department: "Legal",
    departmentSlug: "legal",
    description: {
      fr: "Assure la veille réglementaire et conseille sur la conformité. Analyse l'impact des nouvelles régulations sur l'activité.",
      en: "Ensures regulatory monitoring and compliance advisory. Analyzes the impact of new regulations on business.",
    },
    useCases: {
      fr: ["Veille réglementaire", "Analyse d'impact réglementaire", "Mise en conformité", "Rapports de conformité"],
      en: ["Regulatory monitoring", "Regulatory impact analysis", "Compliance implementation", "Compliance reports"],
    },
    capabilities: ["compliance_check", "risk_assessment"],
    icon: Gavel,
    color: "#78350f",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Xavier Morin", initials: "XM" },
  },
];

export const DEPARTMENTS_CATALOG: DepartmentCatalogItem[] = [
  {
    slug: "marketing",
    name: { fr: "Marketing", en: "Marketing" },
    description: {
      fr: "SEO technique, stratégie de contenu, réseaux sociaux et optimisation locale. 4 agents spécialisés pour maximiser votre visibilité.",
      en: "Technical SEO, content strategy, social media and local optimization. 4 specialized agents to maximize your visibility.",
    },
    icon: Megaphone,
    color: "#3b82f6",
    gradientFrom: "from-blue-500",
    gradientTo: "to-blue-400",
    agentCount: 4,
    features: {
      fr: ["Audit SEO technique complet", "Clusters sémantiques & mots-clés", "Contenu optimisé SEO", "Gestion réseaux sociaux & SEO local"],
      en: ["Full technical SEO audit", "Semantic clusters & keywords", "SEO-optimized content", "Social media management & local SEO"],
    },
    heroMetric: { fr: "+340% de trafic organique en 4 mois", en: "+340% organic traffic in 4 months" },
    workflow: [
      { label: { fr: "Audit SEO", en: "SEO Audit" }, description: { fr: "Crawl technique du site et analyse des erreurs", en: "Technical site crawl and error analysis" } },
      { label: { fr: "Stratégie", en: "Strategy" }, description: { fr: "Clusters de mots-clés et calendrier éditorial", en: "Keyword clusters and editorial calendar" } },
      { label: { fr: "Création", en: "Creation" }, description: { fr: "Contenu SEO-first avec frameworks AIDA/PAS", en: "SEO-first content with AIDA/PAS frameworks" } },
      { label: { fr: "Distribution", en: "Distribution" }, description: { fr: "Publication multi-canal et suivi des KPIs", en: "Multi-channel publishing and KPI tracking" } },
    ],
    integrations: ["Google Analytics", "Search Console", "Google Ads", "Meta Ads", "Google Business Profile", "Instagram"],
  },
  {
    slug: "sales",
    name: { fr: "Commercial", en: "Sales" },
    description: {
      fr: "Pipeline de vente automatisé, lead scoring, nurturing et closing. 4 agents pour accélérer votre cycle de vente.",
      en: "Automated sales pipeline, lead scoring, nurturing and closing. 4 agents to accelerate your sales cycle.",
    },
    icon: Briefcase,
    color: "#22c55e",
    gradientFrom: "from-green-500",
    gradientTo: "to-green-400",
    agentCount: 4,
    features: {
      fr: ["Architecture d'offres commerciales", "Lead scoring & qualification", "Séquences email automatisées", "Optimisation du closing"],
      en: ["Sales offer architecture", "Lead scoring & qualification", "Automated email sequences", "Closing optimization"],
    },
    heroMetric: { fr: "Réduit le cycle de vente de 60%", en: "Reduces sales cycle by 60%" },
    workflow: [
      { label: { fr: "Qualification", en: "Qualification" }, description: { fr: "Scoring automatique des leads entrants", en: "Automatic scoring of inbound leads" } },
      { label: { fr: "Nurturing", en: "Nurturing" }, description: { fr: "Séquences email personnalisées par segment", en: "Personalized email sequences by segment" } },
      { label: { fr: "Offre", en: "Offer" }, description: { fr: "Création d'offres optimisées par l'IA", en: "AI-optimized offer creation" } },
      { label: { fr: "Closing", en: "Closing" }, description: { fr: "Accompagnement jusqu'à la signature", en: "Guidance through to signature" } },
    ],
    integrations: ["Stripe", "HubSpot", "Salesforce", "Google Sheets", "Slack"],
  },
  {
    slug: "finance",
    name: { fr: "Finance", en: "Finance" },
    description: {
      fr: "Suivi des revenus, optimisation budgétaire et facturation automatisée. 3 agents pour piloter votre santé financière.",
      en: "Revenue tracking, budget optimization and automated billing. 3 agents to drive your financial health.",
    },
    icon: BarChart3,
    color: "#eab308",
    gradientFrom: "from-yellow-500",
    gradientTo: "to-yellow-400",
    agentCount: 3,
    features: {
      fr: ["Analyse des revenus & prévisions", "Optimisation budgétaire", "Facturation automatisée", "Rapports de rentabilité"],
      en: ["Revenue analysis & forecasting", "Budget optimization", "Automated billing", "Profitability reports"],
    },
    heroMetric: { fr: "Réduit le temps de reporting de 80%", en: "Reduces reporting time by 80%" },
    workflow: [
      { label: { fr: "Collecte", en: "Collect" }, description: { fr: "Agrège les données financières de toutes les sources", en: "Aggregates financial data from all sources" } },
      { label: { fr: "Analyse", en: "Analyze" }, description: { fr: "Détecte les anomalies et tendances de revenus", en: "Detects revenue anomalies and trends" } },
      { label: { fr: "Optimisation", en: "Optimize" }, description: { fr: "Recommandations d'allocation budgétaire", en: "Budget allocation recommendations" } },
      { label: { fr: "Rapport", en: "Report" }, description: { fr: "Rapports automatisés et prévisions", en: "Automated reports and forecasts" } },
    ],
    integrations: ["Stripe", "QuickBooks", "Google Sheets", "Xero"],
  },
  {
    slug: "security",
    name: { fr: "Sécurité", en: "Security" },
    description: {
      fr: "Audit de sécurité, contrôle des accès et monitoring des menaces. 3 agents pour protéger vos données et systèmes.",
      en: "Security audit, access control and threat monitoring. 3 agents to protect your data and systems.",
    },
    icon: Shield,
    color: "#ef4444",
    gradientFrom: "from-red-500",
    gradientTo: "to-red-400",
    agentCount: 3,
    features: {
      fr: ["Audit de vulnérabilités", "Contrôle d'accès & RBAC", "Monitoring des menaces en temps réel", "Conformité RGPD"],
      en: ["Vulnerability audit", "Access control & RBAC", "Real-time threat monitoring", "GDPR compliance"],
    },
    heroMetric: { fr: "99.9% de disponibilité garantie", en: "99.9% guaranteed uptime" },
    workflow: [
      { label: { fr: "Scan", en: "Scan" }, description: { fr: "Audit automatisé des vulnérabilités", en: "Automated vulnerability audit" } },
      { label: { fr: "Détection", en: "Detection" }, description: { fr: "Monitoring en temps réel des menaces", en: "Real-time threat monitoring" } },
      { label: { fr: "Alerte", en: "Alert" }, description: { fr: "Notification immédiate des incidents", en: "Immediate incident notification" } },
      { label: { fr: "Remédiation", en: "Remediation" }, description: { fr: "Actions correctives automatisées", en: "Automated corrective actions" } },
    ],
    integrations: ["AWS", "Supabase", "Sentry", "Cloudflare"],
  },
  {
    slug: "product",
    name: { fr: "Produit", en: "Product" },
    description: {
      fr: "Vision produit, UX, roadmap et backlog. 4 agents pour optimiser votre produit et l'expérience utilisateur.",
      en: "Product vision, UX, roadmap and backlog. 4 agents to optimize your product and user experience.",
    },
    icon: Target,
    color: "#8b5cf6",
    gradientFrom: "from-purple-500",
    gradientTo: "to-purple-400",
    agentCount: 4,
    features: {
      fr: ["Analyse des fonctionnalités", "Optimisation UX", "Planification roadmap & OKR", "Gestion du backlog"],
      en: ["Feature analysis", "UX optimization", "Roadmap & OKR planning", "Backlog management"],
    },
    heroMetric: { fr: "2x plus rapide sur la priorisation produit", en: "2x faster product prioritization" },
    workflow: [
      { label: { fr: "Recherche", en: "Research" }, description: { fr: "Analyse des feedbacks et demandes utilisateurs", en: "Analysis of user feedback and requests" } },
      { label: { fr: "Priorisation", en: "Prioritization" }, description: { fr: "Scoring des features par impact business", en: "Feature scoring by business impact" } },
      { label: { fr: "Planification", en: "Planning" }, description: { fr: "Roadmap et OKR alignés sur la stratégie", en: "Roadmap and OKR aligned with strategy" } },
      { label: { fr: "Mesure", en: "Measure" }, description: { fr: "Suivi de l'adoption et de l'impact", en: "Adoption and impact tracking" } },
    ],
    integrations: ["Jira", "Linear", "Notion", "Figma", "Hotjar"],
  },
  {
    slug: "engineering",
    name: { fr: "Ingénierie", en: "Engineering" },
    description: {
      fr: "Revue de code, performance, DevOps et intégrations API. 4 agents pour une excellence technique.",
      en: "Code review, performance, DevOps and API integrations. 4 agents for technical excellence.",
    },
    icon: Code,
    color: "#06b6d4",
    gradientFrom: "from-orange-500",
    gradientTo: "to-orange-400",
    agentCount: 4,
    features: {
      fr: ["Revue de code & tests automatisés", "Optimisation des performances", "CI/CD & DevOps", "Intégrations API"],
      en: ["Code review & automated testing", "Performance optimization", "CI/CD & DevOps", "API integrations"],
    },
    heroMetric: { fr: "-45% de bugs en production", en: "-45% production bugs" },
    workflow: [
      { label: { fr: "Code Review", en: "Code Review" }, description: { fr: "Analyse statique et détection de bugs", en: "Static analysis and bug detection" } },
      { label: { fr: "Tests", en: "Tests" }, description: { fr: "Tests unitaires, E2E et couverture", en: "Unit tests, E2E and coverage" } },
      { label: { fr: "Deploy", en: "Deploy" }, description: { fr: "Pipeline CI/CD et déploiement automatisé", en: "CI/CD pipeline and automated deployment" } },
      { label: { fr: "Monitor", en: "Monitor" }, description: { fr: "Performance monitoring et alertes", en: "Performance monitoring and alerts" } },
    ],
    integrations: ["GitHub", "GitLab", "Vercel", "AWS", "Sentry", "Datadog"],
  },
  {
    slug: "data",
    name: { fr: "Data", en: "Data" },
    description: {
      fr: "Analytics, pipelines de données, machine learning et reporting. 4 agents pour transformer vos données en insights.",
      en: "Analytics, data pipelines, machine learning and reporting. 4 agents to transform your data into insights.",
    },
    icon: Database,
    color: "#2563eb",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-cyan-400",
    agentCount: 4,
    features: {
      fr: ["Analytics & détection d'anomalies", "Pipelines de données", "Modèles prédictifs ML", "Rapports & dashboards automatisés"],
      en: ["Analytics & anomaly detection", "Data pipelines", "ML predictive models", "Automated reports & dashboards"],
    },
    heroMetric: { fr: "Insights 10x plus rapides", en: "10x faster insights" },
    workflow: [
      { label: { fr: "Ingestion", en: "Ingestion" }, description: { fr: "Collecte multi-sources (GA4, GSC, Meta, etc.)", en: "Multi-source collection (GA4, GSC, Meta, etc.)" } },
      { label: { fr: "Pipeline", en: "Pipeline" }, description: { fr: "ETL automatisé et qualité des données", en: "Automated ETL and data quality" } },
      { label: { fr: "ML", en: "ML" }, description: { fr: "Modèles prédictifs et scoring", en: "Predictive models and scoring" } },
      { label: { fr: "Dashboard", en: "Dashboard" }, description: { fr: "Visualisations interactives et alertes", en: "Interactive visualizations and alerts" } },
    ],
    integrations: ["Google Analytics", "Search Console", "BigQuery", "Snowflake", "Tableau"],
  },
  {
    slug: "support",
    name: { fr: "Support", en: "Support" },
    description: {
      fr: "Expérience client, gestion des tickets et base de connaissances. 3 agents pour une satisfaction client optimale.",
      en: "Customer experience, ticket management and knowledge base. 3 agents for optimal customer satisfaction.",
    },
    icon: HeadphonesIcon,
    color: "#f59e0b",
    gradientFrom: "from-pink-500",
    gradientTo: "to-pink-400",
    agentCount: 3,
    features: {
      fr: ["Monitoring de la réputation", "Gestion intelligente des tickets", "Base de connaissances enrichie", "SLA & satisfaction client"],
      en: ["Reputation monitoring", "Smart ticket management", "Enriched knowledge base", "SLA & customer satisfaction"],
    },
    heroMetric: { fr: "Temps de réponse réduit de 75%", en: "Response time reduced by 75%" },
    workflow: [
      { label: { fr: "Réception", en: "Receive" }, description: { fr: "Tri et classification automatique des tickets", en: "Automatic ticket sorting and classification" } },
      { label: { fr: "Analyse", en: "Analyze" }, description: { fr: "Détection de la priorité et du sentiment", en: "Priority and sentiment detection" } },
      { label: { fr: "Réponse", en: "Respond" }, description: { fr: "Suggestion de réponse pré-qualifiée", en: "Pre-qualified response suggestion" } },
      { label: { fr: "Suivi", en: "Follow-up" }, description: { fr: "Mesure de satisfaction et enrichissement KB", en: "Satisfaction measurement and KB enrichment" } },
    ],
    integrations: ["Crisp", "Zendesk", "Intercom", "Slack"],
  },
  {
    slug: "governance",
    name: { fr: "Gouvernance", en: "Governance" },
    description: {
      fr: "Conformité réglementaire, politiques internes et évaluation des risques. 3 agents pour une gouvernance solide.",
      en: "Regulatory compliance, internal policies and risk assessment. 3 agents for solid governance.",
    },
    icon: Settings,
    color: "#10b981",
    gradientFrom: "from-gray-500",
    gradientTo: "to-gray-400",
    agentCount: 3,
    features: {
      fr: ["Audit de conformité réglementaire", "Application des politiques", "Évaluation des risques", "Monitoring continu"],
      en: ["Regulatory compliance audit", "Policy enforcement", "Risk assessment", "Continuous monitoring"],
    },
    heroMetric: { fr: "100% de conformité RGPD", en: "100% GDPR compliance" },
    workflow: [
      { label: { fr: "Audit", en: "Audit" }, description: { fr: "Scan de conformité réglementaire", en: "Regulatory compliance scan" } },
      { label: { fr: "Politiques", en: "Policies" }, description: { fr: "Application et suivi des règles internes", en: "Internal rule enforcement and tracking" } },
      { label: { fr: "Risques", en: "Risks" }, description: { fr: "Évaluation et quantification des risques", en: "Risk evaluation and quantification" } },
      { label: { fr: "Rapport", en: "Report" }, description: { fr: "Tableau de bord de gouvernance", en: "Governance dashboard" } },
    ],
    integrations: ["Supabase", "AWS", "Vanta", "Drata"],
  },
  {
    slug: "hr",
    name: { fr: "RH", en: "HR" },
    description: {
      fr: "Recrutement automatisé, expérience employé, formation et performance. 4 agents pour optimiser votre gestion des talents.",
      en: "Automated recruitment, employee experience, training and performance. 4 agents to optimize your talent management.",
    },
    icon: Users,
    color: "#ec4899",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-indigo-400",
    agentCount: 4,
    features: {
      fr: ["Screening & matching automatisé", "Programme d'onboarding", "Formation & développement", "Évaluations de performance", "Suivi de l'engagement"],
      en: ["Automated screening & matching", "Onboarding program", "Training & development", "Performance evaluations", "Engagement tracking"],
    },
    heroMetric: { fr: "Temps de recrutement divisé par 3", en: "Recruitment time divided by 3" },
    workflow: [
      { label: { fr: "Sourcing", en: "Sourcing" }, description: { fr: "Screening automatisé des candidatures", en: "Automated application screening" } },
      { label: { fr: "Matching", en: "Matching" }, description: { fr: "Scoring des candidats par compétences", en: "Candidate scoring by skills" } },
      { label: { fr: "Onboarding", en: "Onboarding" }, description: { fr: "Parcours d'intégration personnalisé", en: "Personalized onboarding journey" } },
      { label: { fr: "Engagement", en: "Engagement" }, description: { fr: "Suivi de la satisfaction et rétention", en: "Satisfaction and retention tracking" } },
    ],
    integrations: ["LinkedIn", "Slack", "BambooHR", "Google Workspace"],
  },
  {
    slug: "legal",
    name: { fr: "Juridique", en: "Legal" },
    description: {
      fr: "Analyse de contrats, propriété intellectuelle et conformité légale. 3 agents spécialisés pour sécuriser vos engagements.",
      en: "Contract analysis, intellectual property and legal compliance. 3 specialized agents to secure your commitments.",
    },
    icon: Scale,
    color: "#78350f",
    gradientFrom: "from-slate-500",
    gradientTo: "to-slate-400",
    agentCount: 3,
    features: {
      fr: ["Analyse automatique de contrats", "Détection des clauses à risque", "Protection de la propriété intellectuelle", "Veille réglementaire", "Conformité légale"],
      en: ["Automatic contract analysis", "Risky clause detection", "Intellectual property protection", "Regulatory monitoring", "Legal compliance"],
    },
    heroMetric: { fr: "Analyse un contrat en 30 secondes", en: "Analyzes a contract in 30 seconds" },
    workflow: [
      { label: { fr: "Upload", en: "Upload" }, description: { fr: "Import du contrat (PDF, DOCX)", en: "Contract import (PDF, DOCX)" } },
      { label: { fr: "Extraction", en: "Extraction" }, description: { fr: "Identification des clauses et parties", en: "Clause and party identification" } },
      { label: { fr: "Analyse", en: "Analysis" }, description: { fr: "Détection des clauses à risque", en: "Risky clause detection" } },
      { label: { fr: "Rapport", en: "Report" }, description: { fr: "Synthèse et recommandations", en: "Summary and recommendations" } },
    ],
    integrations: ["DocuSign", "Google Drive", "Notion"],
  },
];

/** Get all agents for a given department slug */
export function getAgentsByDepartment(departmentSlug: string): AgentCatalogItem[] {
  return AGENTS_CATALOG.filter((a) => a.departmentSlug === departmentSlug);
}

/** Get a single agent by slug */
export function getAgentBySlug(slug: string): AgentCatalogItem | undefined {
  return AGENTS_CATALOG.find((a) => a.slug === slug);
}

/** Get a single department by slug */
export function getDepartmentBySlug(slug: string): DepartmentCatalogItem | undefined {
  return DEPARTMENTS_CATALOG.find((d) => d.slug === slug);
}
