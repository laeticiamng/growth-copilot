/**
 * Agents Catalog - Central data source for all 39 AI agents
 * Used by /agents, /agents/[slug], and /departments/[slug] pages
 */

import {
  Brain, Search, FileText, BarChart3, Megaphone, Shield, Zap, PenTool,
  Target, Share2, Eye, Users, Briefcase, Code, HeadphonesIcon, Database,
  Settings, Bot, TrendingUp, Lock, AlertTriangle, Clipboard, Palette,
  Map, GitBranch, TestTube, Link2, Wrench, Cpu, LineChart, Receipt,
  UserCheck, Heart, Scale, Globe, Mail, Layers, Activity, Gauge
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
}

export const AGENTS_CATALOG: AgentCatalogItem[] = [
  // ── DIRECTION (2) ──
  {
    slug: "chief-growth-officer",
    name: "Chief Growth Officer",
    role: { fr: "Directrice de la Croissance", en: "Chief Growth Officer" },
    department: "Direction",
    departmentSlug: "direction",
    description: {
      fr: "Orchestre tous les agents et priorise les actions selon l'impact business via le scoring ICE. Sophie coordonne les 11 départements et génère le briefing quotidien.",
      en: "Orchestrates all agents and prioritizes actions by business impact via ICE scoring. Sophie coordinates all 11 departments and generates the daily briefing.",
    },
    useCases: {
      fr: ["Briefing quotidien exécutif", "Priorisation ICE des actions", "Coordination inter-départements", "Rapport de performance global"],
      en: ["Daily executive briefing", "ICE action prioritization", "Cross-department coordination", "Global performance report"],
    },
    capabilities: ["analytics_analysis", "report_generation"],
    icon: Brain,
    color: "#6366f1",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Sophie Marchand", initials: "SM" },
  },
  {
    slug: "quality-compliance-officer",
    name: "Quality & Compliance Officer",
    role: { fr: "Responsable Qualité & Conformité", en: "Quality & Compliance Officer" },
    department: "Direction",
    departmentSlug: "direction",
    description: {
      fr: "Valide chaque livrable pour assurer la conformité éthique et technique. Vérifie le respect du RGPD, des politiques internes et des standards de qualité.",
      en: "Validates each deliverable to ensure ethical and technical compliance. Verifies GDPR adherence, internal policies, and quality standards.",
    },
    useCases: {
      fr: ["Validation des livrables", "Audit de conformité RGPD", "Contrôle qualité des contenus", "Revue des politiques"],
      en: ["Deliverable validation", "GDPR compliance audit", "Content quality control", "Policy review"],
    },
    capabilities: ["compliance_check"],
    icon: Shield,
    color: "#10b981",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Jean-Michel Fournier", initials: "JF" },
  },

  // ── MARKETING (5) ──
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
    slug: "local-seo-optimizer",
    name: "Local SEO Manager",
    role: { fr: "Manager SEO Local", en: "Local SEO Manager" },
    department: "Marketing",
    departmentSlug: "marketing",
    description: {
      fr: "Optimise la présence locale et les fiches Google Business Profile. Gère les posts, FAQ et le suivi des avis clients.",
      en: "Optimizes local presence and Google Business Profile listings. Manages posts, FAQ and customer review tracking.",
    },
    useCases: {
      fr: ["Optimisation fiche GBP", "Réponse aux avis", "Posts Google locaux", "Suivi du classement local"],
      en: ["GBP listing optimization", "Review responses", "Local Google posts", "Local ranking tracking"],
    },
    capabilities: ["seo_audit"],
    icon: Globe,
    color: "#14b8a6",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Lucas Bernier", initials: "LB" },
  },
  {
    slug: "social-media-manager",
    name: "Social Media Manager",
    role: { fr: "Manager Réseaux Sociaux", en: "Social Media Manager" },
    department: "Marketing",
    departmentSlug: "marketing",
    description: {
      fr: "Planifie et optimise la présence sur les réseaux sociaux. Génère du contenu, analyse les performances et gère la communauté.",
      en: "Plans and optimizes social media presence. Generates content, analyzes performance, and manages community.",
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

  // ── ENGINEERING (5) ──
  {
    slug: "code-reviewer",
    name: "Code Reviewer",
    role: { fr: "Réviseur de Code", en: "Code Reviewer" },
    department: "Engineering",
    departmentSlug: "engineering",
    description: {
      fr: "Définit l'architecture technique et les standards. Revue de code automatisée et détection des problèmes.",
      en: "Defines technical architecture and standards. Automated code review and problem detection.",
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
  {
    slug: "testing-agent",
    name: "Testing Agent",
    role: { fr: "Agent de Tests", en: "Testing Agent" },
    department: "Engineering",
    departmentSlug: "engineering",
    description: {
      fr: "Documente les APIs et les processus techniques. Génère et exécute les tests automatisés.",
      en: "Documents APIs and technical processes. Generates and executes automated tests.",
    },
    useCases: {
      fr: ["Tests unitaires automatisés", "Tests E2E", "Couverture de code", "Rapports de qualité"],
      en: ["Automated unit tests", "E2E tests", "Code coverage", "Quality reports"],
    },
    capabilities: ["code_review"],
    icon: TestTube,
    color: "#083344",
    riskLevel: "low",
    requiresApproval: false,
    persona: { name: "Thibault Robert", initials: "TR" },
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

  // ── HR (2) ──
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

  // ── LEGAL (1) ──
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
];

export const DEPARTMENTS_CATALOG: DepartmentCatalogItem[] = [
  {
    slug: "direction",
    name: { fr: "Direction", en: "Leadership" },
    description: {
      fr: "Le cerveau de Growth OS. La direction orchestre l'ensemble des 39 agents IA, priorise les actions et assure la qualité de chaque livrable.",
      en: "The brain of Growth OS. Leadership orchestrates all 39 AI agents, prioritizes actions and ensures the quality of every deliverable.",
    },
    icon: Brain,
    color: "#6366f1",
    gradientFrom: "from-primary",
    gradientTo: "to-primary/60",
    agentCount: 2,
    features: {
      fr: ["Orchestration de tous les agents", "Scoring ICE des priorités", "Briefing quotidien exécutif", "Contrôle qualité & conformité"],
      en: ["Orchestration of all agents", "ICE priority scoring", "Daily executive briefing", "Quality control & compliance"],
    },
  },
  {
    slug: "marketing",
    name: { fr: "Marketing", en: "Marketing" },
    description: {
      fr: "SEO technique, stratégie de contenu, publicités, réseaux sociaux et optimisation locale. 5 agents spécialisés pour maximiser votre visibilité.",
      en: "Technical SEO, content strategy, ads, social media and local optimization. 5 specialized agents to maximize your visibility.",
    },
    icon: Megaphone,
    color: "#3b82f6",
    gradientFrom: "from-blue-500",
    gradientTo: "to-blue-400",
    agentCount: 5,
    features: {
      fr: ["Audit SEO technique complet", "Clusters sémantiques & mots-clés", "Contenu optimisé SEO", "Gestion réseaux sociaux", "SEO local & Google Business"],
      en: ["Full technical SEO audit", "Semantic clusters & keywords", "SEO-optimized content", "Social media management", "Local SEO & Google Business"],
    },
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
  },
  {
    slug: "engineering",
    name: { fr: "Ingénierie", en: "Engineering" },
    description: {
      fr: "Revue de code, performance, DevOps, intégrations API et tests. 5 agents pour une excellence technique.",
      en: "Code review, performance, DevOps, API integrations and testing. 5 agents for technical excellence.",
    },
    icon: Code,
    color: "#06b6d4",
    gradientFrom: "from-orange-500",
    gradientTo: "to-orange-400",
    agentCount: 5,
    features: {
      fr: ["Revue de code automatisée", "Optimisation des performances", "CI/CD & DevOps", "Intégrations API", "Tests automatisés"],
      en: ["Automated code review", "Performance optimization", "CI/CD & DevOps", "API integrations", "Automated testing"],
    },
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
  },
  {
    slug: "hr",
    name: { fr: "RH", en: "HR" },
    description: {
      fr: "Recrutement automatisé et expérience employé. 2 agents pour optimiser votre gestion des talents.",
      en: "Automated recruitment and employee experience. 2 agents to optimize your talent management.",
    },
    icon: Users,
    color: "#ec4899",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-indigo-400",
    agentCount: 2,
    features: {
      fr: ["Screening & matching automatisé", "Programme d'onboarding", "Suivi de l'engagement", "Développement des talents"],
      en: ["Automated screening & matching", "Onboarding program", "Engagement tracking", "Talent development"],
    },
  },
  {
    slug: "legal",
    name: { fr: "Juridique", en: "Legal" },
    description: {
      fr: "Analyse de contrats et conformité légale. 1 agent spécialisé pour sécuriser vos engagements contractuels.",
      en: "Contract analysis and legal compliance. 1 specialized agent to secure your contractual commitments.",
    },
    icon: Scale,
    color: "#78350f",
    gradientFrom: "from-slate-500",
    gradientTo: "to-slate-400",
    agentCount: 1,
    features: {
      fr: ["Analyse automatique de contrats", "Détection des clauses à risque", "Conformité légale", "Veille réglementaire"],
      en: ["Automatic contract analysis", "Risky clause detection", "Legal compliance", "Regulatory monitoring"],
    },
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
