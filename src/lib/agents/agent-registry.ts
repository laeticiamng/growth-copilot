/**
 * Agent Registry
 * Centralized registry for all AI agents with capability tracking
 * 
 * 39 Agents Total:
 * - Direction (2): CGO, QCO
 * - 11 Departments (37 agents)
 * 
 * Features:
 * - Unified agent discovery
 * - Capability-based routing
 * - Health monitoring
 * - Usage analytics
 */

import type { AgentType, AgentArtifact } from './types';

export type AgentCapability = 
  | 'seo_audit'
  | 'content_creation'
  | 'keyword_research'
  | 'ads_optimization'
  | 'social_scheduling'
  | 'analytics_analysis'
  | 'cro_testing'
  | 'reputation_monitoring'
  | 'competitive_analysis'
  | 'offer_generation'
  | 'lifecycle_automation'
  | 'report_generation'
  | 'compliance_check'
  | 'security_audit'
  | 'code_review'
  | 'data_engineering'
  | 'ml_training'
  | 'ux_analysis'
  | 'contract_review'
  | 'recruitment'
  | 'ticket_handling'
  | 'budget_analysis'
  | 'risk_assessment';

export type AgentStatus = 'available' | 'busy' | 'disabled' | 'error';

export type AgentCategory = 
  | 'direction'
  | 'marketing'
  | 'sales'
  | 'finance'
  | 'security'
  | 'product'
  | 'engineering'
  | 'data'
  | 'support'
  | 'governance'
  | 'hr'
  | 'legal';

export interface AgentDefinition {
  type: AgentType;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  requiresApproval: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
  category: AgentCategory;
  department: string;
}

export interface AgentInstance {
  definition: AgentDefinition;
  status: AgentStatus;
  lastRun: Date | null;
  runCount: number;
  errorCount: number;
  avgDurationMs: number;
}

/**
 * Central registry of all 39 available agents
 * Organized by department following the Grandes Écoles methodology
 */
export const AGENT_DEFINITIONS: Record<AgentType, AgentDefinition> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // DIRECTION (2 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  chief_growth_officer: {
    type: 'chief_growth_officer',
    name: 'Chief Growth Officer',
    description: 'Orchestrateur principal qui coordonne tous les agents et priorise les actions via ICE scoring (HEC/McKinsey mindset)',
    capabilities: ['analytics_analysis', 'report_generation'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '👔',
    color: '#6366f1',
    category: 'direction',
    department: 'Direction',
  },
  quality_compliance: {
    type: 'quality_compliance',
    name: 'Quality & Compliance Officer',
    description: 'Valide chaque livrable pour assurer la conformité éthique et technique (Big Four Audit mindset)',
    capabilities: ['compliance_check'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🛡️',
    color: '#10b981',
    category: 'direction',
    department: 'Direction',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKETING (5 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  tech_auditor: {
    type: 'tech_auditor',
    name: 'Tech SEO Auditor',
    description: 'Analyse technique du site pour détecter les problèmes SEO (Core Web Vitals, E-E-A-T)',
    capabilities: ['seo_audit'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🔍',
    color: '#f59e0b',
    category: 'marketing',
    department: 'Marketing',
  },
  keyword_strategist: {
    type: 'keyword_strategist',
    name: 'Keyword Strategist',
    description: 'Recherche et analyse des mots-clés pour la stratégie SEO',
    capabilities: ['keyword_research'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🎯',
    color: '#8b5cf6',
    category: 'marketing',
    department: 'Marketing',
  },
  content_builder: {
    type: 'content_builder',
    name: 'Content Builder',
    description: 'Génère du contenu optimisé SEO basé sur les briefs (Condé Nast editorial standards)',
    capabilities: ['content_creation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '✍️',
    color: '#ec4899',
    category: 'marketing',
    department: 'Marketing',
  },
  local_optimizer: {
    type: 'local_optimizer',
    name: 'Local SEO Manager',
    description: 'Optimise la présence locale et les fiches Google Business',
    capabilities: ['seo_audit'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📍',
    color: '#14b8a6',
    category: 'marketing',
    department: 'Marketing',
  },
  social_manager: {
    type: 'social_manager',
    name: 'Social Media Manager',
    description: 'Planifie et optimise la présence sur les réseaux sociaux',
    capabilities: ['social_scheduling'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '📱',
    color: '#06b6d4',
    category: 'marketing',
    department: 'Marketing',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SALES (4 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  offer_architect: {
    type: 'offer_architect',
    name: 'Offer Architect',
    description: 'Conçoit des offres commerciales optimisées et irrésistibles',
    capabilities: ['offer_generation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '💰',
    color: '#eab308',
    category: 'sales',
    department: 'Sales',
  },
  sales_accelerator: {
    type: 'sales_accelerator',
    name: 'Sales Accelerator',
    description: 'Accélère le pipeline de vente avec des recommandations IA',
    capabilities: ['analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🚀',
    color: '#ef4444',
    category: 'sales',
    department: 'Sales',
  },
  lifecycle_manager: {
    type: 'lifecycle_manager',
    name: 'Lifecycle Manager',
    description: 'Automatise les séquences email et nurturing',
    capabilities: ['lifecycle_automation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🔄',
    color: '#a855f7',
    category: 'sales',
    department: 'Sales',
  },
  deal_closer: {
    type: 'deal_closer',
    name: 'Deal Closer',
    description: 'Optimise les processus de closing et négocie les contrats',
    capabilities: ['offer_generation', 'analytics_analysis'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '🤝',
    color: '#f97316',
    category: 'sales',
    department: 'Sales',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE (3 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  revenue_analyst: {
    type: 'revenue_analyst',
    name: 'Revenue Analyst',
    description: 'Analyse les revenus et prévoit les tendances financières',
    capabilities: ['analytics_analysis', 'report_generation'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📈',
    color: '#22c55e',
    category: 'finance',
    department: 'Finance',
  },
  budget_optimizer: {
    type: 'budget_optimizer',
    name: 'Budget Optimizer',
    description: 'Optimise l\'allocation budgétaire et identifie les économies',
    capabilities: ['budget_analysis', 'analytics_analysis'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '💵',
    color: '#16a34a',
    category: 'finance',
    department: 'Finance',
  },
  billing_manager: {
    type: 'billing_manager',
    name: 'Billing Manager',
    description: 'Gère la facturation et les paiements automatisés',
    capabilities: ['report_generation'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '🧾',
    color: '#15803d',
    category: 'finance',
    department: 'Finance',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY (3 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  security_auditor: {
    type: 'security_auditor',
    name: 'Security Auditor',
    description: 'Audite la sécurité des systèmes et détecte les vulnérabilités',
    capabilities: ['security_audit', 'compliance_check'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🔒',
    color: '#dc2626',
    category: 'security',
    department: 'Security',
  },
  access_controller: {
    type: 'access_controller',
    name: 'Access Controller',
    description: 'Gère les contrôles d\'accès et les permissions utilisateurs',
    capabilities: ['security_audit', 'compliance_check'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '🔐',
    color: '#b91c1c',
    category: 'security',
    department: 'Security',
  },
  threat_monitor: {
    type: 'threat_monitor',
    name: 'Threat Monitor',
    description: 'Surveille les menaces en temps réel et alerte sur les anomalies',
    capabilities: ['security_audit'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🚨',
    color: '#991b1b',
    category: 'security',
    department: 'Security',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCT (4 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  feature_analyst: {
    type: 'feature_analyst',
    name: 'Feature Analyst',
    description: 'Analyse les demandes de fonctionnalités et priorise le backlog',
    capabilities: ['analytics_analysis', 'ux_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🎨',
    color: '#7c3aed',
    category: 'product',
    department: 'Product',
  },
  ux_optimizer: {
    type: 'ux_optimizer',
    name: 'UX Optimizer',
    description: 'Optimise l\'expérience utilisateur et propose des améliorations',
    capabilities: ['ux_analysis', 'cro_testing'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🖌️',
    color: '#6d28d9',
    category: 'product',
    department: 'Product',
  },
  roadmap_planner: {
    type: 'roadmap_planner',
    name: 'Roadmap Planner',
    description: 'Planifie la roadmap produit et aligne les objectifs',
    capabilities: ['analytics_analysis', 'report_generation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🗺️',
    color: '#5b21b6',
    category: 'product',
    department: 'Product',
  },
  backlog_manager: {
    type: 'backlog_manager',
    name: 'Backlog Manager',
    description: 'Organise et priorise le backlog produit',
    capabilities: ['analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📋',
    color: '#4c1d95',
    category: 'product',
    department: 'Product',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINEERING (5 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  code_reviewer: {
    type: 'code_reviewer',
    name: 'Code Reviewer',
    description: 'Revue de code automatisée et détection des problèmes',
    capabilities: ['code_review'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '👨‍💻',
    color: '#0891b2',
    category: 'engineering',
    department: 'Engineering',
  },
  performance_engineer: {
    type: 'performance_engineer',
    name: 'Performance Engineer',
    description: 'Optimise les performances applicatives et identifie les goulots',
    capabilities: ['code_review', 'analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '⚡',
    color: '#0e7490',
    category: 'engineering',
    department: 'Engineering',
  },
  devops_agent: {
    type: 'devops_agent',
    name: 'DevOps Agent',
    description: 'Automatise le déploiement et gère l\'infrastructure',
    capabilities: ['code_review'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '🔧',
    color: '#155e75',
    category: 'engineering',
    department: 'Engineering',
  },
  api_integrator: {
    type: 'api_integrator',
    name: 'API Integrator',
    description: 'Intègre et maintient les connexions API externes',
    capabilities: ['code_review'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🔗',
    color: '#164e63',
    category: 'engineering',
    department: 'Engineering',
  },
  testing_agent: {
    type: 'testing_agent',
    name: 'Testing Agent',
    description: 'Génère et exécute les tests automatisés',
    capabilities: ['code_review'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🧪',
    color: '#083344',
    category: 'engineering',
    department: 'Engineering',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA (4 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  analytics_detective: {
    type: 'analytics_detective',
    name: 'Analytics Guardian',
    description: 'Détecte les anomalies et génère des insights depuis les données (FAANG Data Scientist mindset)',
    capabilities: ['analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🔎',
    color: '#2563eb',
    category: 'data',
    department: 'Data',
  },
  data_engineer: {
    type: 'data_engineer',
    name: 'Data Engineer',
    description: 'Construit et maintient les pipelines de données',
    capabilities: ['data_engineering'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🛠️',
    color: '#1d4ed8',
    category: 'data',
    department: 'Data',
  },
  ml_trainer: {
    type: 'ml_trainer',
    name: 'ML Trainer',
    description: 'Entraîne et optimise les modèles de machine learning',
    capabilities: ['ml_training', 'analytics_analysis'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🤖',
    color: '#1e40af',
    category: 'data',
    department: 'Data',
  },
  reporting_agent: {
    type: 'reporting_agent',
    name: 'Reporting Agent',
    description: 'Génère des rapports automatisés et tableaux de bord',
    capabilities: ['report_generation', 'analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📊',
    color: '#1e3a8a',
    category: 'data',
    department: 'Data',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPPORT (3 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  reputation_guardian: {
    type: 'reputation_guardian',
    name: 'Reputation Guardian',
    description: 'Surveille et gère la réputation en ligne',
    capabilities: ['reputation_monitoring'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '⭐',
    color: '#fbbf24',
    category: 'support',
    department: 'Support',
  },
  ticket_handler: {
    type: 'ticket_handler',
    name: 'Ticket Handler',
    description: 'Traite et priorise les tickets de support',
    capabilities: ['ticket_handling'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🎫',
    color: '#f59e0b',
    category: 'support',
    department: 'Support',
  },
  knowledge_manager: {
    type: 'knowledge_manager',
    name: 'Knowledge Manager',
    description: 'Maintient et enrichit la base de connaissances',
    capabilities: ['content_creation'],
    requiresApproval: true,
    riskLevel: 'low',
    icon: '📚',
    color: '#d97706',
    category: 'support',
    department: 'Support',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERNANCE (3 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  compliance_auditor: {
    type: 'compliance_auditor',
    name: 'Compliance Auditor',
    description: 'Audite la conformité réglementaire (RGPD, SOC2)',
    capabilities: ['compliance_check', 'security_audit'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📜',
    color: '#059669',
    category: 'governance',
    department: 'Governance',
  },
  policy_enforcer: {
    type: 'policy_enforcer',
    name: 'Policy Enforcer',
    description: 'Applique les politiques et règles de l\'organisation',
    capabilities: ['compliance_check'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '⚖️',
    color: '#047857',
    category: 'governance',
    department: 'Governance',
  },
  risk_assessor: {
    type: 'risk_assessor',
    name: 'Risk Assessor',
    description: 'Évalue et quantifie les risques business',
    capabilities: ['risk_assessment', 'analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '⚠️',
    color: '#065f46',
    category: 'governance',
    department: 'Governance',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HR (2 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  recruitment_agent: {
    type: 'recruitment_agent',
    name: 'Recruitment Agent',
    description: 'Automatise le processus de recrutement et screening',
    capabilities: ['recruitment'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '👥',
    color: '#db2777',
    category: 'hr',
    department: 'HR',
  },
  employee_experience: {
    type: 'employee_experience',
    name: 'Employee Experience',
    description: 'Optimise l\'expérience collaborateur et l\'engagement',
    capabilities: ['analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '💼',
    color: '#be185d',
    category: 'hr',
    department: 'HR',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGAL (1 agent)
  // ═══════════════════════════════════════════════════════════════════════════
  contract_analyzer: {
    type: 'contract_analyzer',
    name: 'Contract Analyzer',
    description: 'Analyse les contrats et détecte les clauses à risque',
    capabilities: ['contract_review', 'compliance_check'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '⚖️',
    color: '#78350f',
    category: 'legal',
    department: 'Legal',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LAUNCH OS (15 agents)
  // ═══════════════════════════════════════════════════════════════════════════
  launch_program_manager: {
    type: 'launch_program_manager',
    name: 'Launch Program Manager',
    description: 'Orchestre le programme de lancement end-to-end, suit les dependances et gere la timeline',
    capabilities: ['report_generation', 'analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🚀',
    color: '#6366f1',
    category: 'direction',
    department: 'Launch OS',
  },
  offer_positioning_strategist: {
    type: 'offer_positioning_strategist',
    name: 'Offer & Positioning Strategist',
    description: 'Definit le positionnement produit, la proposition de valeur et construit l offre',
    capabilities: ['offer_generation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🎯',
    color: '#f59e0b',
    category: 'marketing',
    department: 'Launch OS',
  },
  icp_audience_researcher: {
    type: 'icp_audience_researcher',
    name: 'ICP & Audience Research Agent',
    description: 'Construit le profil client ideal, segmente l audience et valide les hypotheses',
    capabilities: ['analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🔬',
    color: '#8b5cf6',
    category: 'data',
    department: 'Launch OS',
  },
  creative_strategist: {
    type: 'creative_strategist',
    name: 'Creative Strategist',
    description: 'Definit la strategie creative, les angles, les hooks et orchestre la production',
    capabilities: ['content_creation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🎨',
    color: '#ec4899',
    category: 'marketing',
    department: 'Launch OS',
  },
  video_scriptwriter: {
    type: 'video_scriptwriter',
    name: 'Video Scriptwriter',
    description: 'Ecrit des scripts video performants avec hooks et CTA optimises par plateforme',
    capabilities: ['content_creation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🎬',
    color: '#ef4444',
    category: 'marketing',
    department: 'Launch OS',
  },
  storyboard_agent: {
    type: 'storyboard_agent',
    name: 'Storyboard Agent',
    description: 'Transforme les scripts en storyboards detailles avec descriptions visuelles et transitions',
    capabilities: ['content_creation'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🖼️',
    color: '#f97316',
    category: 'marketing',
    department: 'Launch OS',
  },
  creative_production_qa: {
    type: 'creative_production_qa',
    name: 'Creative Production QA',
    description: 'Verifie la conformite branding, coherence message, clarte CTA et qualite langue',
    capabilities: ['compliance_check'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '✅',
    color: '#10b981',
    category: 'governance',
    department: 'Launch OS',
  },
  multichannel_distribution_planner: {
    type: 'multichannel_distribution_planner',
    name: 'Multi-Channel Distribution Planner',
    description: 'Orchestre la distribution sur tous les canaux, planifie le calendrier de publication',
    capabilities: ['social_scheduling'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '📡',
    color: '#06b6d4',
    category: 'marketing',
    department: 'Launch OS',
  },
  paid_media_planner: {
    type: 'paid_media_planner',
    name: 'Paid Media Planner',
    description: 'Definit la strategie media payant, alloue le budget par plateforme et optimise le ROAS',
    capabilities: ['ads_optimization', 'budget_analysis'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '💰',
    color: '#eab308',
    category: 'marketing',
    department: 'Launch OS',
  },
  organic_content_planner: {
    type: 'organic_content_planner',
    name: 'Organic Content Planner',
    description: 'Planifie le contenu organique sur tous les canaux non payants',
    capabilities: ['content_creation', 'social_scheduling'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🌱',
    color: '#22c55e',
    category: 'marketing',
    department: 'Launch OS',
  },
  landing_page_cro: {
    type: 'landing_page_cro',
    name: 'Landing Page CRO Agent',
    description: 'Optimise les landing pages pour maximiser le taux de conversion',
    capabilities: ['cro_testing', 'ux_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📊',
    color: '#3b82f6',
    category: 'data',
    department: 'Launch OS',
  },
  crm_lifecycle_agent: {
    type: 'crm_lifecycle_agent',
    name: 'CRM & Lifecycle Launch Agent',
    description: 'Configure les sequences email, automations lifecycle et workflows de nurturing',
    capabilities: ['lifecycle_automation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '📧',
    color: '#a855f7',
    category: 'sales',
    department: 'Launch OS',
  },
  attribution_analytics_lead: {
    type: 'attribution_analytics_lead',
    name: 'Attribution & Analytics Lead',
    description: 'Mesure la performance avec attribution multi-touch et genere les insights',
    capabilities: ['analytics_analysis', 'report_generation'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📈',
    color: '#2563eb',
    category: 'data',
    department: 'Launch OS',
  },
  sales_enablement_agent: {
    type: 'sales_enablement_agent',
    name: 'Sales Enablement Agent',
    description: 'Capture les leads du lancement, qualifie et transmet au CRM avec outils de closing',
    capabilities: ['offer_generation', 'analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🤝',
    color: '#f97316',
    category: 'sales',
    department: 'Launch OS',
  },
  brand_legal_compliance_reviewer: {
    type: 'brand_legal_compliance_reviewer',
    name: 'Brand & Legal Compliance Reviewer',
    description: 'Verifie que tous les assets respectent les guidelines marque et la reglementation',
    capabilities: ['compliance_check', 'risk_assessment'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '⚖️',
    color: '#78350f',
    category: 'governance',
    department: 'Launch OS',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY (backward compatibility)
  // ═══════════════════════════════════════════════════════════════════════════
  ads_optimizer: {
    type: 'ads_optimizer',
    name: 'Ads Optimizer',
    description: 'Optimise les campagnes publicitaires Google Ads (Google Ads Certified)',
    capabilities: ['ads_optimization'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '📊',
    color: '#f97316',
    category: 'marketing',
    department: 'Marketing',
  },
  cro_specialist: {
    type: 'cro_specialist',
    name: 'CRO Specialist',
    description: 'Analyse et optimise les taux de conversion',
    capabilities: ['cro_testing'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '📈',
    color: '#84cc16',
    category: 'data',
    department: 'Data',
  },
  competitive_watcher: {
    type: 'competitive_watcher',
    name: 'Competitive Analyst',
    description: 'Analyse la concurrence et détecte les opportunités',
    capabilities: ['competitive_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '👁️',
    color: '#64748b',
    category: 'marketing',
    department: 'Marketing',
  },
};

/**
 * Department colors for UI
 */
export const DEPARTMENT_COLORS: Record<AgentCategory, string> = {
  direction: 'from-primary to-primary/60',
  marketing: 'from-amber-500 to-amber-400',
  sales: 'from-red-500 to-red-400',
  finance: 'from-green-500 to-green-400',
  security: 'from-rose-600 to-rose-500',
  product: 'from-violet-500 to-violet-400',
  engineering: 'from-cyan-500 to-cyan-400',
  data: 'from-blue-500 to-blue-400',
  support: 'from-yellow-500 to-yellow-400',
  governance: 'from-emerald-500 to-emerald-400',
  hr: 'from-pink-500 to-pink-400',
  legal: 'from-amber-700 to-amber-600',
};

/**
 * Agent Registry Class
 * Manages agent instances and provides discovery services
 */
export class AgentRegistry {
  private instances: Map<AgentType, AgentInstance> = new Map();

  constructor() {
    // Initialize all agents as available
    Object.entries(AGENT_DEFINITIONS).forEach(([type, definition]) => {
      this.instances.set(type as AgentType, {
        definition,
        status: 'available',
        lastRun: null,
        runCount: 0,
        errorCount: 0,
        avgDurationMs: 0,
      });
    });
  }

  /**
   * Get all registered agents
   */
  getAll(): AgentInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get agent by type
   */
  get(type: AgentType): AgentInstance | undefined {
    return this.instances.get(type);
  }

  /**
   * Find agents by capability
   */
  findByCapability(capability: AgentCapability): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.capabilities.includes(capability)
    );
  }

  /**
   * Find agents by category/department
   */
  findByCategory(category: AgentCategory): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.category === category
    );
  }

  /**
   * Find agents by department name
   */
  findByDepartment(department: string): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.department === department
    );
  }

  /**
   * Get available agents (not busy or in error)
   */
  getAvailable(): AgentInstance[] {
    return this.getAll().filter(instance => instance.status === 'available');
  }

  /**
   * Update agent status
   */
  updateStatus(type: AgentType, status: AgentStatus): void {
    const instance = this.instances.get(type);
    if (instance) {
      instance.status = status;
    }
  }

  /**
   * Record a completed run
   */
  recordRun(type: AgentType, durationMs: number, success: boolean): void {
    const instance = this.instances.get(type);
    if (instance) {
      instance.lastRun = new Date();
      instance.runCount++;
      if (!success) instance.errorCount++;
      
      // Update average duration
      const totalRuns = instance.runCount;
      instance.avgDurationMs = 
        (instance.avgDurationMs * (totalRuns - 1) + durationMs) / totalRuns;
    }
  }

  /**
   * Get agents that require approval
   */
  getApprovalRequired(): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.requiresApproval
    );
  }

  /**
   * Get high-risk agents
   */
  getHighRisk(): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.riskLevel === 'high'
    );
  }

  /**
   * Get department summary
   */
  getDepartmentStats(): Record<string, { total: number; categories: AgentCategory[] }> {
    const stats: Record<string, { total: number; categories: AgentCategory[] }> = {};
    this.getAll().forEach(instance => {
      const dept = instance.definition.department;
      if (!stats[dept]) {
        stats[dept] = { total: 0, categories: [] };
      }
      stats[dept].total++;
      if (!stats[dept].categories.includes(instance.definition.category)) {
        stats[dept].categories.push(instance.definition.category);
      }
    });
    return stats;
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    total: number;
    available: number;
    busy: number;
    error: number;
    totalRuns: number;
    totalErrors: number;
    byDepartment: Record<string, number>;
  } {
    const all = this.getAll();
    const byDept: Record<string, number> = {};
    all.forEach(a => {
      const dept = a.definition.department;
      byDept[dept] = (byDept[dept] || 0) + 1;
    });
    
    return {
      total: all.length,
      available: all.filter(a => a.status === 'available').length,
      busy: all.filter(a => a.status === 'busy').length,
      error: all.filter(a => a.status === 'error').length,
      totalRuns: all.reduce((sum, a) => sum + a.runCount, 0),
      totalErrors: all.reduce((sum, a) => sum + a.errorCount, 0),
      byDepartment: byDept,
    };
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();

/**
 * Helper to route a task to the best available agent
 */
export function routeToAgent(capability: AgentCapability): AgentInstance | null {
  const candidates = agentRegistry
    .findByCapability(capability)
    .filter(a => a.status === 'available');

  if (candidates.length === 0) return null;

  // Prefer agent with lowest error rate
  return candidates.sort((a, b) => {
    const aErrorRate = a.runCount > 0 ? a.errorCount / a.runCount : 0;
    const bErrorRate = b.runCount > 0 ? b.errorCount / b.runCount : 0;
    return aErrorRate - bErrorRate;
  })[0];
}
