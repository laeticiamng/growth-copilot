import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, 
  Award, 
  Briefcase, 
  Languages, 
  Target,
  Brain,
  Zap,
  CheckCircle,
  Star,
  BookOpen,
  Code,
  BarChart3,
  Shield,
  Users,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Detailed skills and qualifications for each agent
export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  specialty: string;
  education: {
    degree: string;
    school: string;
    year: number;
  };
  certifications: string[];
  languages: { name: string; level: string }[];
  coreSkills: { name: string; level: number }[]; // 0-100
  technicalSkills: string[];
  softSkills: string[];
  expertise: string[];
  experience: string;
  methodology: string[];
  tools: string[];
}

// Complete profiles for all 39 agents
const AGENT_PROFILES: Record<string, AgentProfile> = {
  // Direction
  cgo: {
    id: "cgo",
    name: "Sophie Marchand",
    role: "Directrice de la Croissance",
    department: "Direction",
    specialty: "Orchestration & Stratégie",
    education: {
      degree: "MBA Strategy & Digital Transformation",
      school: "HEC Paris",
      year: 2018
    },
    certifications: [
      "Google Analytics 360 Certified",
      "McKinsey Digital Strategy",
      "INSEAD Leadership Programme",
      "Certified Growth Hacker (GrowthHackers)"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" },
      { name: "Allemand", level: "Courant (B2)" }
    ],
    coreSkills: [
      { name: "Stratégie de croissance", level: 98 },
      { name: "Orchestration multi-agents", level: 95 },
      { name: "Analyse de données", level: 92 },
      { name: "Leadership", level: 96 },
      { name: "Gestion de projets", level: 94 }
    ],
    technicalSkills: [
      "Python", "SQL", "Tableau", "Power BI", "Google Analytics 4",
      "BigQuery", "Looker Studio", "Amplitude", "Mixpanel"
    ],
    softSkills: [
      "Vision stratégique", "Prise de décision rapide", "Communication exécutive",
      "Négociation", "Gestion du changement", "Mentorat"
    ],
    expertise: [
      "Growth Hacking & Product-Led Growth",
      "Stratégie d'acquisition multi-canal",
      "Optimisation du funnel AARRR",
      "Analyse prédictive et forecasting",
      "OKRs et alignement stratégique"
    ],
    experience: "12 ans d'expérience en stratégie digitale et croissance, ex-McKinsey, ex-Google",
    methodology: [
      "ICE Scoring (Impact × Confidence × Ease)",
      "First Principles Thinking",
      "Analyse MECE",
      "North Star Metric Framework"
    ],
    tools: ["Notion", "Asana", "Slack", "Figma", "Miro", "Loom"]
  },
  qco: {
    id: "qco",
    name: "Jean-Michel Fournier",
    role: "Directeur Qualité & Conformité",
    department: "Direction",
    specialty: "Contrôle Qualité",
    education: {
      degree: "Master Droit des Affaires & Compliance",
      school: "Sciences Po Paris",
      year: 2015
    },
    certifications: [
      "Certified Compliance & Ethics Professional (CCEP)",
      "ISO 27001 Lead Auditor",
      "GDPR Data Protection Officer",
      "Six Sigma Black Belt"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" },
      { name: "Espagnol", level: "Intermédiaire (B1)" }
    ],
    coreSkills: [
      { name: "Audit qualité", level: 98 },
      { name: "Conformité réglementaire", level: 97 },
      { name: "Gestion des risques", level: 95 },
      { name: "Éthique IA", level: 94 },
      { name: "Documentation", level: 96 }
    ],
    technicalSkills: [
      "JIRA", "Confluence", "TestRail", "SonarQube", "OWASP ZAP"
    ],
    softSkills: [
      "Rigueur", "Attention aux détails", "Intégrité", "Pédagogie", "Diplomatie"
    ],
    expertise: [
      "Validation des livrables IA",
      "Détection des biais algorithmiques",
      "Conformité RGPD/CCPA",
      "Anti-plagiat et originalité",
      "Contrôle anti-fraude"
    ],
    experience: "15 ans en audit et conformité, ex-Deloitte, ex-CNIL",
    methodology: [
      "Framework QCO (Quality & Compliance Officer)",
      "Audit trail complet",
      "Checklist anti-violation",
      "Double validation croisée"
    ],
    tools: ["Grammarly", "Turnitin", "Copyscape", "Jira", "Notion"]
  },

  // Marketing
  tech_auditor: {
    id: "tech_auditor",
    name: "Emma Lefebvre",
    role: "Responsable SEO Technique",
    department: "Marketing",
    specialty: "SEO Technique",
    education: {
      degree: "Ingénieur Informatique, spécialisation Web",
      school: "École Polytechnique",
      year: 2019
    },
    certifications: [
      "Google Search Central Advanced",
      "Semrush SEO Toolkit",
      "Screaming Frog Certified",
      "Core Web Vitals Expert"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "SEO Technique", level: 98 },
      { name: "Core Web Vitals", level: 96 },
      { name: "Crawling & Indexation", level: 97 },
      { name: "Schema Markup", level: 95 },
      { name: "Audit technique", level: 98 }
    ],
    technicalSkills: [
      "JavaScript", "Python", "HTML/CSS", "Schema.org", "Screaming Frog",
      "Sitebulb", "Botify", "Google Search Console", "Lighthouse"
    ],
    softSkills: [
      "Analyse critique", "Résolution de problèmes", "Communication technique", "Patience"
    ],
    expertise: [
      "Optimisation de la vitesse de chargement",
      "Architecture de site et linking interne",
      "Gestion des erreurs d'indexation",
      "Migration SEO et redirections",
      "JavaScript SEO"
    ],
    experience: "8 ans en SEO technique, ex-Botify, projets Fortune 500",
    methodology: [
      "Audit SEO en 5 phases",
      "Priorisation par impact business",
      "Tests A/B techniques",
      "Monitoring continu"
    ],
    tools: ["Screaming Frog", "Sitebulb", "Ahrefs", "Semrush", "GTmetrix"]
  },
  keyword_strategist: {
    id: "keyword_strategist",
    name: "Thomas Duval",
    role: "Stratégiste Contenu",
    department: "Marketing",
    specialty: "Stratégie de contenu",
    education: {
      degree: "Master Marketing Digital & Content Strategy",
      school: "ESSEC Business School",
      year: 2017
    },
    certifications: [
      "HubSpot Content Marketing",
      "Semrush Content Marketing Toolkit",
      "Google Analytics Individual Qualification"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Recherche de mots-clés", level: 97 },
      { name: "Clusters sémantiques", level: 96 },
      { name: "Analyse de la concurrence", level: 94 },
      { name: "Content Gap Analysis", level: 95 },
      { name: "Stratégie éditoriale", level: 93 }
    ],
    technicalSkills: [
      "Ahrefs", "Semrush", "Surfer SEO", "Clearscope", "MarketMuse"
    ],
    softSkills: [
      "Créativité", "Curiosité", "Esprit d'analyse", "Travail en équipe"
    ],
    expertise: [
      "Topic clustering et pillar pages",
      "Intent mapping (informatif, transactionnel, navigationnel)",
      "Calendrier éditorial data-driven",
      "Optimisation du maillage interne"
    ],
    experience: "9 ans en content marketing, ex-agence SEO premium",
    methodology: [
      "Framework Hub & Spoke",
      "Analyse SERP Features",
      "Content Scoring Model"
    ],
    tools: ["Ahrefs", "Semrush", "Clearscope", "Notion", "Trello"]
  },
  content_builder: {
    id: "content_builder",
    name: "Léa Fontaine",
    role: "Rédactrice",
    department: "Marketing",
    specialty: "Copywriting",
    education: {
      degree: "Master Lettres Modernes & Communication",
      school: "ENS Ulm",
      year: 2020
    },
    certifications: [
      "Certified Professional Copywriter",
      "StoryBrand Guide",
      "AWAI Copywriting"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" },
      { name: "Italien", level: "Courant (B2)" }
    ],
    coreSkills: [
      { name: "Rédaction SEO", level: 97 },
      { name: "Storytelling", level: 96 },
      { name: "Copywriting persuasif", level: 95 },
      { name: "Ton de voix", level: 98 },
      { name: "Editing", level: 94 }
    ],
    technicalSkills: [
      "WordPress", "Notion", "Grammarly", "Hemingway Editor", "Surfer SEO"
    ],
    softSkills: [
      "Créativité", "Empathie", "Adaptabilité", "Respect des délais"
    ],
    expertise: [
      "Rédaction de landing pages à haute conversion",
      "Articles de blog longue traîne",
      "Scripts vidéo et podcasts",
      "Newsletters et email sequences"
    ],
    experience: "7 ans en rédaction, ex-freelance clients CAC40",
    methodology: [
      "Framework AIDA",
      "PAS (Problem-Agitation-Solution)",
      "Méthode des 4C (Clear, Concise, Compelling, Credible)"
    ],
    tools: ["Notion", "Google Docs", "Grammarly", "Hemingway", "Canva"]
  },
  local_optimizer: {
    id: "local_optimizer",
    name: "Antoine Girard",
    role: "Spécialiste SEO Local",
    department: "Marketing",
    specialty: "SEO Local",
    education: {
      degree: "Master Marketing & Commerce",
      school: "EM Lyon",
      year: 2018
    },
    certifications: [
      "Google Business Profile Certified",
      "Local Search Association Member",
      "BrightLocal Expert"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Google Business Profile", level: 98 },
      { name: "Citations locales", level: 96 },
      { name: "Gestion des avis", level: 97 },
      { name: "NAP consistency", level: 95 },
      { name: "Local pack optimization", level: 94 }
    ],
    technicalSkills: [
      "BrightLocal", "Moz Local", "Yext", "Whitespark", "Google Business"
    ],
    softSkills: [
      "Sens du détail", "Organisation", "Patience", "Communication client"
    ],
    expertise: [
      "Optimisation multi-établissements",
      "Stratégie d'avis et réponses",
      "Posts Google Business",
      "Local link building"
    ],
    experience: "6 ans en SEO local, +500 profils GBP optimisés",
    methodology: [
      "Audit local en 3 phases",
      "Citation building progressif",
      "Monitoring concurrentiel local"
    ],
    tools: ["BrightLocal", "Whitespark", "Google Business", "Moz Local"]
  },
  social_manager: {
    id: "social_manager",
    name: "Camille Rousseau",
    role: "Responsable Réseaux Sociaux",
    department: "Marketing",
    specialty: "Réseaux Sociaux",
    education: {
      degree: "Master Communication Digitale",
      school: "CELSA Sorbonne",
      year: 2019
    },
    certifications: [
      "Meta Blueprint Certified",
      "Hootsuite Social Marketing",
      "Google Analytics for Social"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Stratégie social media", level: 97 },
      { name: "Community management", level: 96 },
      { name: "Création de contenu", level: 95 },
      { name: "Analytics social", level: 93 },
      { name: "Gestion de crise", level: 92 }
    ],
    technicalSkills: [
      "Hootsuite", "Buffer", "Later", "Canva", "CapCut", "Meta Business Suite"
    ],
    softSkills: [
      "Créativité", "Réactivité", "Empathie", "Gestion du stress"
    ],
    expertise: [
      "Stratégie multi-plateforme",
      "UGC et influence marketing",
      "Social listening",
      "Paid social optimization"
    ],
    experience: "8 ans en social media, ex-agence digitale premium",
    methodology: [
      "Content pillars framework",
      "Social listening actif",
      "A/B testing créatif"
    ],
    tools: ["Hootsuite", "Sprout Social", "Canva", "CapCut", "Brandwatch"]
  },

  // Sales
  offer_architect: {
    id: "offer_architect",
    name: "David Petit",
    role: "Directeur Commercial",
    department: "Ventes",
    specialty: "Offres commerciales",
    education: {
      degree: "MBA Sales & Business Development",
      school: "ESCP Business School",
      year: 2014
    },
    certifications: [
      "Sandler Training Certified",
      "MEDDIC Sales Methodology",
      "Salesforce Administrator"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" },
      { name: "Espagnol", level: "Courant (B2)" }
    ],
    coreSkills: [
      { name: "Négociation commerciale", level: 98 },
      { name: "Stratégie pricing", level: 96 },
      { name: "Pipeline management", level: 97 },
      { name: "Closing", level: 98 },
      { name: "Account planning", level: 95 }
    ],
    technicalSkills: [
      "Salesforce", "HubSpot CRM", "Pipedrive", "Gong", "Chorus.ai"
    ],
    softSkills: [
      "Leadership", "Persuasion", "Écoute active", "Résilience"
    ],
    expertise: [
      "Construction d'offres à haute valeur",
      "Négociation grands comptes",
      "Sales enablement",
      "Revenue operations"
    ],
    experience: "14 ans en ventes B2B, ex-Oracle, ex-SAP",
    methodology: [
      "MEDDIC/MEDDPICC",
      "Challenger Sale",
      "Value-based selling"
    ],
    tools: ["Salesforce", "HubSpot", "Gong", "LinkedIn Sales Navigator"]
  },
  sales_accelerator: {
    id: "sales_accelerator",
    name: "Nicolas Bernard",
    role: "Commercial",
    department: "Ventes",
    specialty: "Ventes",
    education: {
      degree: "Master Commerce International",
      school: "NEOMA Business School",
      year: 2018
    },
    certifications: [
      "HubSpot Sales Software",
      "LinkedIn Sales Solutions",
      "Outreach.io Certified"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Prospection", level: 96 },
      { name: "Discovery calls", level: 95 },
      { name: "Démonstrations", level: 94 },
      { name: "Follow-up", level: 97 },
      { name: "Objection handling", level: 93 }
    ],
    technicalSkills: [
      "HubSpot", "Outreach", "Apollo.io", "ZoomInfo", "Vidyard"
    ],
    softSkills: [
      "Persévérance", "Enthousiasme", "Adaptabilité", "Écoute"
    ],
    expertise: [
      "Cold outreach multi-canal",
      "Sales sequences automation",
      "Lead qualification BANT/MEDDIC"
    ],
    experience: "7 ans en ventes SaaS, +€10M de deals signés",
    methodology: [
      "Multi-touch sequences",
      "Social selling",
      "Video prospecting"
    ],
    tools: ["HubSpot", "Outreach", "LinkedIn", "Loom", "Calendly"]
  },
  lifecycle_manager: {
    id: "lifecycle_manager",
    name: "Claire Dubois",
    role: "Responsable Automation Marketing",
    department: "Ventes",
    specialty: "Automation",
    education: {
      degree: "Master Marketing Automation",
      school: "Université Paris-Dauphine",
      year: 2017
    },
    certifications: [
      "HubSpot Marketing Software",
      "Marketo Certified Expert",
      "ActiveCampaign Certified"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Email automation", level: 97 },
      { name: "Lead nurturing", level: 96 },
      { name: "Segmentation", level: 95 },
      { name: "Lifecycle stages", level: 94 },
      { name: "A/B testing", level: 93 }
    ],
    technicalSkills: [
      "HubSpot", "Marketo", "ActiveCampaign", "Mailchimp", "Customer.io"
    ],
    softSkills: [
      "Rigueur", "Créativité", "Analyse", "Organisation"
    ],
    expertise: [
      "Workflows de nurturing avancés",
      "Lead scoring prédictif",
      "Email deliverability"
    ],
    experience: "8 ans en marketing automation, ex-HubSpot partner",
    methodology: [
      "Customer journey mapping",
      "Behavioral triggers",
      "Progressive profiling"
    ],
    tools: ["HubSpot", "Marketo", "Zapier", "Segment"]
  },
  deal_closer: {
    id: "deal_closer",
    name: "Alexandre Martin",
    role: "Chargé de Comptes",
    department: "Ventes",
    specialty: "Closing",
    education: {
      degree: "Master Négociation & Affaires Internationales",
      school: "KEDGE Business School",
      year: 2016
    },
    certifications: [
      "Winning by Design Certified",
      "Force Management MEDDPICC"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Closing", level: 98 },
      { name: "Négociation", level: 97 },
      { name: "Upselling", level: 95 },
      { name: "Renewal management", level: 94 },
      { name: "Executive selling", level: 96 }
    ],
    technicalSkills: [
      "Salesforce", "DocuSign", "PandaDoc", "Gong"
    ],
    softSkills: [
      "Persuasion", "Patience stratégique", "Confiance", "Empathie"
    ],
    expertise: [
      "Négociation de contrats complexes",
      "Multi-threading stakeholders",
      "Champion building"
    ],
    experience: "10 ans en closing grands comptes, €50M+ de deals",
    methodology: [
      "MEDDPICC closing framework",
      "Mutual action plans",
      "Paper process management"
    ],
    tools: ["Salesforce", "DocuSign", "Gong", "Notion"]
  },

  // Finance
  revenue_analyst: {
    id: "revenue_analyst",
    name: "Mathilde Legrand",
    role: "Directrice Financière",
    department: "Finance",
    specialty: "Analyse Revenus",
    education: {
      degree: "Master Finance d'Entreprise",
      school: "HEC Paris",
      year: 2013
    },
    certifications: [
      "CFA Level III",
      "DSCG (Diplôme Supérieur de Comptabilité)",
      "FP&A Certified"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Financial planning", level: 98 },
      { name: "Revenue forecasting", level: 97 },
      { name: "Unit economics", level: 96 },
      { name: "Reporting financier", level: 98 },
      { name: "Cash flow management", level: 95 }
    ],
    technicalSkills: [
      "Excel avancé", "Power BI", "Tableau", "NetSuite", "QuickBooks"
    ],
    softSkills: [
      "Rigueur", "Vision stratégique", "Communication", "Leadership"
    ],
    expertise: [
      "Modélisation financière SaaS",
      "Analyse de cohorts",
      "LTV/CAC optimization"
    ],
    experience: "15 ans en finance, ex-EY, ex-CFO startup scale-up",
    methodology: [
      "Driver-based planning",
      "Rolling forecasts",
      "Zero-based budgeting"
    ],
    tools: ["Excel", "NetSuite", "Stripe", "ChartMogul"]
  },
  budget_optimizer: {
    id: "budget_optimizer",
    name: "François Mercier",
    role: "Analyste Financier",
    department: "Finance",
    specialty: "Budget",
    education: {
      degree: "Master Contrôle de Gestion",
      school: "EM Lyon",
      year: 2019
    },
    certifications: [
      "CMA (Certified Management Accountant)",
      "Advanced Excel Certification"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Budget planning", level: 96 },
      { name: "Variance analysis", level: 95 },
      { name: "Cost optimization", level: 94 },
      { name: "Reporting", level: 97 },
      { name: "Forecasting", level: 93 }
    ],
    technicalSkills: [
      "Excel", "SAP", "Power BI", "Adaptive Insights"
    ],
    softSkills: [
      "Précision", "Analyse", "Proactivité", "Collaboration"
    ],
    expertise: [
      "Allocation budgétaire data-driven",
      "Contrôle des coûts",
      "ROI analysis"
    ],
    experience: "6 ans en contrôle de gestion, ex-KPMG",
    methodology: [
      "Activity-based costing",
      "Scenario planning",
      "Monthly close optimization"
    ],
    tools: ["Excel", "SAP", "Power BI", "Anaplan"]
  },
  billing_manager: {
    id: "billing_manager",
    name: "Aurélie Chevalier",
    role: "Spécialiste Facturation",
    department: "Finance",
    specialty: "Facturation",
    education: {
      degree: "Licence Comptabilité-Gestion",
      school: "IAE Paris",
      year: 2018
    },
    certifications: [
      "Stripe Billing Certified",
      "NetSuite Administrator"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Intermédiaire (B1)" }
    ],
    coreSkills: [
      { name: "Billing operations", level: 97 },
      { name: "Revenue recognition", level: 95 },
      { name: "Subscription management", level: 96 },
      { name: "Dunning", level: 94 },
      { name: "Reconciliation", level: 98 }
    ],
    technicalSkills: [
      "Stripe", "Chargebee", "Zuora", "QuickBooks"
    ],
    softSkills: [
      "Rigueur", "Organisation", "Service client", "Patience"
    ],
    expertise: [
      "Gestion des abonnements récurrents",
      "Recouvrement intelligent",
      "Conformité facturation UE"
    ],
    experience: "7 ans en billing SaaS, ex-Doctolib",
    methodology: [
      "Dunning sequences optimisées",
      "Proration handling",
      "Churn recovery"
    ],
    tools: ["Stripe", "Chargebee", "ChartMogul", "Slack"]
  },

  // Security
  security_auditor: {
    id: "security_auditor",
    name: "Julien Moreau",
    role: "Directeur Sécurité",
    department: "Sécurité",
    specialty: "Audit Sécurité",
    education: {
      degree: "Ingénieur Cybersécurité",
      school: "École Polytechnique",
      year: 2012
    },
    certifications: [
      "CISSP (Certified Information Systems Security Professional)",
      "OSCP (Offensive Security Certified Professional)",
      "CEH (Certified Ethical Hacker)"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Security auditing", level: 98 },
      { name: "Penetration testing", level: 96 },
      { name: "Threat modeling", level: 97 },
      { name: "Incident response", level: 95 },
      { name: "Security architecture", level: 94 }
    ],
    technicalSkills: [
      "Burp Suite", "Metasploit", "Nmap", "Wireshark", "OWASP ZAP"
    ],
    softSkills: [
      "Vigilance", "Éthique", "Communication", "Leadership"
    ],
    expertise: [
      "Audit de sécurité applicative",
      "Red team operations",
      "Conformité SOC 2"
    ],
    experience: "16 ans en cybersécurité, ex-ANSSI, ex-Thales",
    methodology: [
      "OWASP Testing Guide",
      "NIST Cybersecurity Framework",
      "Zero Trust Architecture"
    ],
    tools: ["Burp Suite", "Nessus", "Splunk", "CrowdStrike"]
  },
  access_controller: {
    id: "access_controller",
    name: "Nathalie Vincent",
    role: "Gestionnaire des Accès",
    department: "Sécurité",
    specialty: "Contrôle d'accès",
    education: {
      degree: "Master Systèmes d'Information",
      school: "EPITA",
      year: 2017
    },
    certifications: [
      "Okta Certified Professional",
      "AWS Security Specialty"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Identity management", level: 97 },
      { name: "Access control", level: 98 },
      { name: "SSO implementation", level: 96 },
      { name: "Privilege escalation prevention", level: 95 },
      { name: "Audit trails", level: 94 }
    ],
    technicalSkills: [
      "Okta", "Auth0", "Azure AD", "AWS IAM", "Ping Identity"
    ],
    softSkills: [
      "Rigueur", "Patience", "Pédagogie", "Discrétion"
    ],
    expertise: [
      "RBAC/ABAC implementation",
      "Just-in-time access",
      "Access reviews automation"
    ],
    experience: "8 ans en IAM, ex-Okta partner",
    methodology: [
      "Principle of least privilege",
      "Role mining",
      "Continuous access review"
    ],
    tools: ["Okta", "Auth0", "Azure AD", "1Password"]
  },
  threat_monitor: {
    id: "threat_monitor",
    name: "Sébastien Blanc",
    role: "Analyste Sécurité",
    department: "Sécurité",
    specialty: "Surveillance",
    education: {
      degree: "Master Cyberdéfense",
      school: "ESIEA",
      year: 2020
    },
    certifications: [
      "GIAC Security Essentials (GSEC)",
      "Splunk Core Certified User"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Threat detection", level: 96 },
      { name: "SIEM management", level: 95 },
      { name: "Log analysis", level: 97 },
      { name: "Alerting", level: 94 },
      { name: "Forensics", level: 93 }
    ],
    technicalSkills: [
      "Splunk", "ELK Stack", "Datadog", "PagerDuty", "Sumo Logic"
    ],
    softSkills: [
      "Vigilance", "Calme sous pression", "Curiosité", "Rigueur"
    ],
    expertise: [
      "Détection d'anomalies comportementales",
      "Threat hunting",
      "Incident triage"
    ],
    experience: "5 ans en SOC, ex-Orange Cyberdefense",
    methodology: [
      "MITRE ATT&CK Framework",
      "Kill chain analysis",
      "IOC hunting"
    ],
    tools: ["Splunk", "Datadog", "CrowdStrike", "VirusTotal"]
  },

  // Product
  feature_analyst: {
    id: "feature_analyst",
    name: "Marie Leclerc",
    role: "Chef de Produit",
    department: "Produit",
    specialty: "Analyse Produit",
    education: {
      degree: "Master Product Management",
      school: "HEC Paris",
      year: 2016
    },
    certifications: [
      "Pragmatic Institute PMC",
      "Product School Certified",
      "Amplitude Analytics"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Product strategy", level: 97 },
      { name: "User research", level: 96 },
      { name: "Data analysis", level: 95 },
      { name: "Roadmap planning", level: 98 },
      { name: "Stakeholder management", level: 94 }
    ],
    technicalSkills: [
      "Amplitude", "Mixpanel", "Productboard", "Jira", "Figma"
    ],
    softSkills: [
      "Vision", "Communication", "Empathie utilisateur", "Priorisation"
    ],
    expertise: [
      "Product-led growth",
      "Feature prioritization frameworks",
      "OKR cascading"
    ],
    experience: "10 ans en product management, ex-BlaBlaCar, ex-Doctolib",
    methodology: [
      "RICE scoring",
      "Jobs-to-be-done",
      "Opportunity-solution trees"
    ],
    tools: ["Productboard", "Amplitude", "Figma", "Notion"]
  },
  ux_optimizer: {
    id: "ux_optimizer",
    name: "Caroline Roux",
    role: "Designer UX",
    department: "Produit",
    specialty: "UX Design",
    education: {
      degree: "Master Design d'Interaction",
      school: "Strate École de Design",
      year: 2018
    },
    certifications: [
      "Nielsen Norman Group UX Certified",
      "Google UX Design Professional"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "User research", level: 97 },
      { name: "Wireframing", level: 96 },
      { name: "Usability testing", level: 98 },
      { name: "Information architecture", level: 95 },
      { name: "Design systems", level: 94 }
    ],
    technicalSkills: [
      "Figma", "Maze", "UserTesting", "Hotjar", "Optimal Workshop"
    ],
    softSkills: [
      "Empathie", "Curiosité", "Collaboration", "Itération"
    ],
    expertise: [
      "Research-driven design",
      "Accessibility (WCAG 2.1)",
      "Micro-interactions"
    ],
    experience: "8 ans en UX design, ex-freelance Fortune 500",
    methodology: [
      "Double Diamond",
      "Design Thinking",
      "Lean UX"
    ],
    tools: ["Figma", "Maze", "Hotjar", "Loom", "Miro"]
  },
  roadmap_planner: {
    id: "roadmap_planner",
    name: "Pierre-Antoine Faure",
    role: "Responsable Produit",
    department: "Produit",
    specialty: "Roadmap",
    education: {
      degree: "Ingénieur + MBA",
      school: "CentraleSupélec + INSEAD",
      year: 2015
    },
    certifications: [
      "SAFe Product Owner/Manager",
      "Pragmatic Institute Foundations"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" },
      { name: "Mandarin", level: "Intermédiaire (B1)" }
    ],
    coreSkills: [
      { name: "Strategic planning", level: 97 },
      { name: "Roadmap communication", level: 96 },
      { name: "Cross-functional alignment", level: 95 },
      { name: "Release planning", level: 94 },
      { name: "Dependencies management", level: 93 }
    ],
    technicalSkills: [
      "Productboard", "Aha!", "Jira", "Confluence", "Miro"
    ],
    softSkills: [
      "Vision long-terme", "Diplomatie", "Leadership", "Clarté"
    ],
    expertise: [
      "Now-Next-Later roadmapping",
      "Outcome-based planning",
      "Stakeholder alignment rituals"
    ],
    experience: "12 ans en product leadership, ex-Google, ex-Spotify",
    methodology: [
      "Outcome-based roadmaps",
      "Theme-based planning",
      "Continuous discovery"
    ],
    tools: ["Productboard", "Aha!", "Miro", "Notion"]
  },
  backlog_manager: {
    id: "backlog_manager",
    name: "Stéphane Garnier",
    role: "Coordinateur Agile",
    department: "Produit",
    specialty: "Backlog",
    education: {
      degree: "Master Gestion de Projet",
      school: "ESSEC Business School",
      year: 2019
    },
    certifications: [
      "Certified Scrum Master (CSM)",
      "SAFe Scrum Master",
      "Jira Administrator"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Backlog management", level: 97 },
      { name: "Sprint planning", level: 96 },
      { name: "Story writing", level: 95 },
      { name: "Velocity tracking", level: 94 },
      { name: "Retrospectives facilitation", level: 93 }
    ],
    technicalSkills: [
      "Jira", "Linear", "ClickUp", "Notion", "Miro"
    ],
    softSkills: [
      "Facilitation", "Écoute", "Organisation", "Médiation"
    ],
    expertise: [
      "Backlog grooming rituals",
      "Definition of Ready/Done",
      "Cross-team dependencies"
    ],
    experience: "6 ans en product operations, ex-startup scale-up",
    methodology: [
      "Scrum/Kanban hybrid",
      "Story mapping",
      "Dual-track agile"
    ],
    tools: ["Jira", "Linear", "Miro", "Notion"]
  },

  // Engineering
  code_reviewer: {
    id: "code_reviewer",
    name: "Maxime Perrin",
    role: "Responsable Technique",
    department: "Ingénierie",
    specialty: "Revue de Code",
    education: {
      degree: "Ingénieur Informatique",
      school: "École Polytechnique",
      year: 2014
    },
    certifications: [
      "AWS Solutions Architect Professional",
      "Google Cloud Professional Architect"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Code review", level: 98 },
      { name: "Architecture design", level: 97 },
      { name: "Technical mentoring", level: 96 },
      { name: "Performance optimization", level: 95 },
      { name: "Security best practices", level: 94 }
    ],
    technicalSkills: [
      "TypeScript", "Python", "Go", "PostgreSQL", "Redis", "Kubernetes"
    ],
    softSkills: [
      "Pédagogie", "Patience", "Rigueur", "Leadership technique"
    ],
    expertise: [
      "Clean code principles",
      "Design patterns",
      "Microservices architecture"
    ],
    experience: "14 ans en développement, ex-Google, ex-Meta",
    methodology: [
      "SOLID principles",
      "DRY/KISS",
      "Test-Driven Development"
    ],
    tools: ["GitHub", "GitLab", "SonarQube", "Datadog"]
  },
  performance_engineer: {
    id: "performance_engineer",
    name: "Olivier Bonnet",
    role: "Ingénieur Performance",
    department: "Ingénierie",
    specialty: "Performance",
    education: {
      degree: "Ingénieur Systèmes Distribués",
      school: "INSA Lyon",
      year: 2017
    },
    certifications: [
      "AWS Performance Specialty",
      "Datadog Certified"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Performance profiling", level: 97 },
      { name: "Load testing", level: 96 },
      { name: "Database optimization", level: 95 },
      { name: "Caching strategies", level: 94 },
      { name: "CDN optimization", level: 93 }
    ],
    technicalSkills: [
      "k6", "Grafana", "Prometheus", "PostgreSQL", "Redis", "Cloudflare"
    ],
    softSkills: [
      "Analyse", "Patience", "Curiosité", "Précision"
    ],
    expertise: [
      "Core Web Vitals optimization",
      "Database query optimization",
      "Horizontal scaling"
    ],
    experience: "8 ans en performance engineering, ex-Cloudflare",
    methodology: [
      "Continuous performance testing",
      "APM-driven optimization",
      "Chaos engineering"
    ],
    tools: ["k6", "Grafana", "Datadog", "Lighthouse"]
  },
  devops_agent: {
    id: "devops_agent",
    name: "Laurent Muller",
    role: "Ingénieur DevOps",
    department: "Ingénierie",
    specialty: "DevOps",
    education: {
      degree: "Ingénieur Infrastructure Cloud",
      school: "Télécom Paris",
      year: 2018
    },
    certifications: [
      "AWS DevOps Engineer Professional",
      "Kubernetes CKA",
      "Terraform Associate"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "CI/CD pipelines", level: 98 },
      { name: "Infrastructure as Code", level: 97 },
      { name: "Kubernetes", level: 96 },
      { name: "Monitoring", level: 95 },
      { name: "Incident management", level: 94 }
    ],
    technicalSkills: [
      "Terraform", "Kubernetes", "GitHub Actions", "ArgoCD", "Helm"
    ],
    softSkills: [
      "Rigueur", "Réactivité", "Collaboration", "Documentation"
    ],
    expertise: [
      "GitOps workflows",
      "Zero-downtime deployments",
      "Disaster recovery"
    ],
    experience: "7 ans en DevOps, ex-GitLab, ex-Datadog",
    methodology: [
      "GitOps",
      "Infrastructure as Code",
      "SRE practices"
    ],
    tools: ["Terraform", "Kubernetes", "GitHub Actions", "Datadog"]
  },
  api_integrator: {
    id: "api_integrator",
    name: "Romain Simon",
    role: "Spécialiste Intégrations",
    department: "Ingénierie",
    specialty: "Intégrations",
    education: {
      degree: "Ingénieur Logiciel",
      school: "EPITA",
      year: 2019
    },
    certifications: [
      "Zapier Expert",
      "MuleSoft Developer"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "API design", level: 97 },
      { name: "OAuth flows", level: 96 },
      { name: "Webhooks", level: 95 },
      { name: "Data transformation", level: 94 },
      { name: "Error handling", level: 93 }
    ],
    technicalSkills: [
      "REST", "GraphQL", "Zapier", "n8n", "Postman", "OpenAPI"
    ],
    softSkills: [
      "Résolution de problèmes", "Documentation", "Patience", "Communication"
    ],
    expertise: [
      "Third-party API integrations",
      "Webhook reliability",
      "Rate limiting strategies"
    ],
    experience: "6 ans en intégrations, +100 connecteurs développés",
    methodology: [
      "API-first design",
      "Contract testing",
      "Idempotency patterns"
    ],
    tools: ["Postman", "Zapier", "n8n", "Swagger"]
  },
  testing_agent: {
    id: "testing_agent",
    name: "Élodie Michel",
    role: "Ingénieure Qualité",
    department: "Ingénierie",
    specialty: "Tests",
    education: {
      degree: "Ingénieur Qualité Logicielle",
      school: "ENSEIRB-MATMECA",
      year: 2020
    },
    certifications: [
      "ISTQB Advanced Test Analyst",
      "Cypress.io Certified"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Test automation", level: 97 },
      { name: "E2E testing", level: 96 },
      { name: "Test strategy", level: 95 },
      { name: "Bug tracking", level: 94 },
      { name: "Regression testing", level: 93 }
    ],
    technicalSkills: [
      "Cypress", "Playwright", "Jest", "Vitest", "TestRail"
    ],
    softSkills: [
      "Attention aux détails", "Rigueur", "Communication", "Curiosité"
    ],
    expertise: [
      "Test pyramid implementation",
      "Visual regression testing",
      "Accessibility testing"
    ],
    experience: "5 ans en QA automation, ex-startup fintech",
    methodology: [
      "Shift-left testing",
      "BDD with Cucumber",
      "Risk-based testing"
    ],
    tools: ["Cypress", "Playwright", "Jest", "TestRail"]
  },

  // Data
  analytics_detective: {
    id: "analytics_detective",
    name: "Lucas Bernier",
    role: "Responsable Data",
    department: "Data & Analytique",
    specialty: "Analytics",
    education: {
      degree: "Master Data Science",
      school: "École Polytechnique",
      year: 2017
    },
    certifications: [
      "Google Cloud Professional Data Engineer",
      "dbt Analytics Engineering"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Data analysis", level: 98 },
      { name: "SQL advanced", level: 97 },
      { name: "Data visualization", level: 96 },
      { name: "Statistical modeling", level: 95 },
      { name: "Data storytelling", level: 94 }
    ],
    technicalSkills: [
      "Python", "SQL", "dbt", "Looker", "BigQuery", "Snowflake"
    ],
    softSkills: [
      "Curiosité", "Rigueur", "Communication", "Pédagogie"
    ],
    expertise: [
      "Product analytics",
      "Attribution modeling",
      "Cohort analysis"
    ],
    experience: "10 ans en data, ex-Criteo, ex-Datadog",
    methodology: [
      "Metrics-driven culture",
      "Self-serve analytics",
      "Data mesh"
    ],
    tools: ["dbt", "Looker", "BigQuery", "Amplitude"]
  },
  data_engineer: {
    id: "data_engineer",
    name: "Damien Lefèvre",
    role: "Ingénieur Data",
    department: "Data & Analytique",
    specialty: "Ingénierie Data",
    education: {
      degree: "Ingénieur Big Data",
      school: "CentraleSupélec",
      year: 2019
    },
    certifications: [
      "Databricks Certified Data Engineer",
      "AWS Data Analytics Specialty"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Data pipelines", level: 97 },
      { name: "ETL/ELT", level: 96 },
      { name: "Data modeling", level: 95 },
      { name: "Data quality", level: 94 },
      { name: "Orchestration", level: 93 }
    ],
    technicalSkills: [
      "Apache Airflow", "dbt", "Spark", "Kafka", "Fivetran"
    ],
    softSkills: [
      "Rigueur", "Proactivité", "Documentation", "Collaboration"
    ],
    expertise: [
      "Real-time data pipelines",
      "Data lakehouse architecture",
      "CDC implementation"
    ],
    experience: "6 ans en data engineering, ex-Criteo",
    methodology: [
      "DataOps",
      "Data contracts",
      "Incremental processing"
    ],
    tools: ["Airflow", "dbt", "Fivetran", "Snowflake"]
  },
  ml_trainer: {
    id: "ml_trainer",
    name: "Sarah Dupont",
    role: "Ingénieure Machine Learning",
    department: "Data & Analytique",
    specialty: "Machine Learning",
    education: {
      degree: "Doctorat en IA & Machine Learning",
      school: "ENS Paris-Saclay",
      year: 2021
    },
    certifications: [
      "TensorFlow Developer Certificate",
      "AWS Machine Learning Specialty"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Machine learning", level: 98 },
      { name: "Deep learning", level: 97 },
      { name: "NLP", level: 96 },
      { name: "MLOps", level: 94 },
      { name: "Feature engineering", level: 95 }
    ],
    technicalSkills: [
      "Python", "TensorFlow", "PyTorch", "scikit-learn", "MLflow"
    ],
    softSkills: [
      "Recherche", "Curiosité", "Rigueur scientifique", "Communication"
    ],
    expertise: [
      "Predictive modeling",
      "Recommendation systems",
      "Time series forecasting"
    ],
    experience: "7 ans en ML/AI, ex-DeepMind, publications ICML/NeurIPS",
    methodology: [
      "Experiment tracking",
      "A/B testing ML models",
      "Feature stores"
    ],
    tools: ["MLflow", "Weights & Biases", "Vertex AI", "SageMaker"]
  },
  reporting_agent: {
    id: "reporting_agent",
    name: "Benjamin Giraud",
    role: "Analyste BI",
    department: "Data & Analytique",
    specialty: "Reporting",
    education: {
      degree: "Master Business Intelligence",
      school: "Université Paris-Dauphine",
      year: 2020
    },
    certifications: [
      "Tableau Desktop Certified",
      "Power BI Data Analyst"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Dashboard design", level: 97 },
      { name: "Data visualization", level: 96 },
      { name: "KPI definition", level: 95 },
      { name: "Report automation", level: 94 },
      { name: "Stakeholder communication", level: 93 }
    ],
    technicalSkills: [
      "Tableau", "Power BI", "Looker", "SQL", "Excel"
    ],
    softSkills: [
      "Clarté", "Pédagogie", "Sens du design", "Écoute"
    ],
    expertise: [
      "Executive dashboards",
      "Self-service BI",
      "Data storytelling"
    ],
    experience: "5 ans en BI, ex-Capgemini",
    methodology: [
      "Dashboard best practices",
      "Metric tree design",
      "Automated reporting"
    ],
    tools: ["Tableau", "Looker", "Power BI", "Notion"]
  },

  // Support
  reputation_guardian: {
    id: "reputation_guardian",
    name: "Marine Leroy",
    role: "Responsable Support",
    department: "Support",
    specialty: "E-réputation",
    education: {
      degree: "Master Communication de Crise",
      school: "CELSA Sorbonne",
      year: 2018
    },
    certifications: [
      "Zendesk Admin Certified",
      "HubSpot Service Hub"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Crisis management", level: 97 },
      { name: "Review management", level: 96 },
      { name: "Team leadership", level: 95 },
      { name: "Customer experience", level: 98 },
      { name: "Escalation handling", level: 94 }
    ],
    technicalSkills: [
      "Zendesk", "Intercom", "Trustpilot", "Google Reviews", "Brandwatch"
    ],
    softSkills: [
      "Empathie", "Calme", "Leadership", "Diplomatie"
    ],
    expertise: [
      "Review response strategies",
      "Crisis communication",
      "NPS improvement"
    ],
    experience: "9 ans en customer experience, ex-Airbnb",
    methodology: [
      "Voice of Customer programs",
      "Proactive support",
      "Escalation matrices"
    ],
    tools: ["Zendesk", "Intercom", "Trustpilot", "Slack"]
  },
  ticket_handler: {
    id: "ticket_handler",
    name: "Virginie Morel",
    role: "Chargée de Support",
    department: "Support",
    specialty: "Support",
    education: {
      degree: "Licence Communication",
      school: "Université Lyon 2",
      year: 2019
    },
    certifications: [
      "Zendesk Support Specialist",
      "Intercom Product Specialist"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" },
      { name: "Espagnol", level: "Intermédiaire (B1)" }
    ],
    coreSkills: [
      { name: "Ticket resolution", level: 97 },
      { name: "First response time", level: 96 },
      { name: "Customer satisfaction", level: 98 },
      { name: "Troubleshooting", level: 95 },
      { name: "Product knowledge", level: 94 }
    ],
    technicalSkills: [
      "Zendesk", "Intercom", "Notion", "Loom", "Slack"
    ],
    softSkills: [
      "Patience", "Empathie", "Clarté", "Réactivité"
    ],
    expertise: [
      "Multi-channel support",
      "Macro optimization",
      "CSAT improvement"
    ],
    experience: "6 ans en support client, ex-Qonto",
    methodology: [
      "First contact resolution",
      "Tiered support model",
      "Proactive outreach"
    ],
    tools: ["Zendesk", "Intercom", "Loom", "Notion"]
  },
  knowledge_manager: {
    id: "knowledge_manager",
    name: "Christophe Dumas",
    role: "Gestionnaire Base de Connaissances",
    department: "Support",
    specialty: "Base de Connaissances",
    education: {
      degree: "Master Documentation & Médiation",
      school: "ENSSIB Lyon",
      year: 2017
    },
    certifications: [
      "KCS Practices Certified",
      "Confluence Certified"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Content organization", level: 97 },
      { name: "Technical writing", level: 96 },
      { name: "Search optimization", level: 95 },
      { name: "Taxonomy design", level: 94 },
      { name: "Localization", level: 93 }
    ],
    technicalSkills: [
      "Notion", "Confluence", "GitBook", "Algolia", "Intercom"
    ],
    softSkills: [
      "Organisation", "Clarté", "Patience", "Collaboration"
    ],
    expertise: [
      "Self-service content strategy",
      "SEO for help centers",
      "Multilingual documentation"
    ],
    experience: "8 ans en knowledge management, ex-Zendesk",
    methodology: [
      "KCS (Knowledge-Centered Service)",
      "LATCH organization",
      "Content audits"
    ],
    tools: ["Notion", "GitBook", "Algolia", "Loom"]
  },

  // Governance
  compliance_auditor: {
    id: "compliance_auditor",
    name: "Isabelle Lambert",
    role: "Responsable Conformité",
    department: "Gouvernance",
    specialty: "Conformité",
    education: {
      degree: "Master Droit du Numérique",
      school: "Sciences Po Paris",
      year: 2016
    },
    certifications: [
      "CIPP/E (Certified Information Privacy Professional/Europe)",
      "ISO 27001 Lead Implementer"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "GDPR compliance", level: 98 },
      { name: "Privacy impact assessment", level: 97 },
      { name: "Policy development", level: 96 },
      { name: "Audit management", level: 95 },
      { name: "Vendor assessment", level: 94 }
    ],
    technicalSkills: [
      "OneTrust", "TrustArc", "Cookiebot", "BigID"
    ],
    softSkills: [
      "Rigueur", "Intégrité", "Communication", "Pédagogie"
    ],
    expertise: [
      "RGPD implementation",
      "Cookie compliance",
      "Data mapping"
    ],
    experience: "12 ans en conformité, ex-CNIL, ex-Deloitte Legal",
    methodology: [
      "Privacy by Design",
      "ROPA maintenance",
      "Continuous compliance"
    ],
    tools: ["OneTrust", "Cookiebot", "Notion", "Jira"]
  },
  policy_enforcer: {
    id: "policy_enforcer",
    name: "Philippe Durand",
    role: "Gestionnaire des Politiques",
    department: "Gouvernance",
    specialty: "Politiques",
    education: {
      degree: "Master Administration des Entreprises",
      school: "IAE Paris",
      year: 2015
    },
    certifications: [
      "ISO 9001 Lead Auditor",
      "ITIL 4 Foundation"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Policy writing", level: 97 },
      { name: "Process documentation", level: 96 },
      { name: "Change management", level: 95 },
      { name: "Training development", level: 94 },
      { name: "Compliance monitoring", level: 93 }
    ],
    technicalSkills: [
      "Confluence", "Notion", "Process Street", "Trainual"
    ],
    softSkills: [
      "Clarté", "Organisation", "Patience", "Diplomatie"
    ],
    expertise: [
      "Policy lifecycle management",
      "SOPs and playbooks",
      "Compliance training"
    ],
    experience: "10 ans en operations, ex-consultant Big 4",
    methodology: [
      "Policy-as-code",
      "Version control for policies",
      "Automated enforcement"
    ],
    tools: ["Confluence", "Notion", "Process Street", "Loom"]
  },
  risk_assessor: {
    id: "risk_assessor",
    name: "Catherine Renard",
    role: "Analyste des Risques",
    department: "Gouvernance",
    specialty: "Risques",
    education: {
      degree: "Master Risk Management",
      school: "EDHEC Business School",
      year: 2018
    },
    certifications: [
      "CRISC (Certified in Risk and Information Systems Control)",
      "FRM (Financial Risk Manager)"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Risk assessment", level: 97 },
      { name: "Control testing", level: 96 },
      { name: "Risk mitigation", level: 95 },
      { name: "Risk reporting", level: 94 },
      { name: "Business continuity", level: 93 }
    ],
    technicalSkills: [
      "Archer", "LogicGate", "ServiceNow GRC", "Excel"
    ],
    softSkills: [
      "Analyse critique", "Communication", "Proactivité", "Rigueur"
    ],
    expertise: [
      "Enterprise risk management",
      "Third-party risk",
      "Operational resilience"
    ],
    experience: "8 ans en risk management, ex-Société Générale",
    methodology: [
      "COSO ERM Framework",
      "Risk heat mapping",
      "Quantitative risk modeling"
    ],
    tools: ["Archer", "ServiceNow", "Excel", "Power BI"]
  },

  // HR
  recruitment_agent: {
    id: "recruitment_agent",
    name: "Sandrine Petit",
    role: "Directrice RH",
    department: "Ressources Humaines",
    specialty: "Recrutement",
    education: {
      degree: "Master Management des RH",
      school: "HEC Paris",
      year: 2014
    },
    certifications: [
      "SHRM-SCP (Senior Certified Professional)",
      "LinkedIn Recruiter Certified"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" }
    ],
    coreSkills: [
      { name: "Talent acquisition", level: 98 },
      { name: "Employer branding", level: 96 },
      { name: "Interview techniques", level: 97 },
      { name: "Compensation benchmarking", level: 95 },
      { name: "HR strategy", level: 94 }
    ],
    technicalSkills: [
      "Greenhouse", "Lever", "LinkedIn Recruiter", "Workday"
    ],
    softSkills: [
      "Empathie", "Écoute", "Négociation", "Leadership"
    ],
    expertise: [
      "Tech recruitment",
      "Diversity & Inclusion",
      "Employer value proposition"
    ],
    experience: "15 ans en RH, ex-Google, ex-L'Oréal",
    methodology: [
      "Structured interviews",
      "Scorecards",
      "Candidate experience design"
    ],
    tools: ["Greenhouse", "LinkedIn", "Notion", "Slack"]
  },
  employee_experience: {
    id: "employee_experience",
    name: "Fabrice Leroux",
    role: "Partenaire RH",
    department: "Ressources Humaines",
    specialty: "Expérience Collaborateur",
    education: {
      degree: "Master Psychologie du Travail",
      school: "Université Paris Descartes",
      year: 2019
    },
    certifications: [
      "CultureAmp Certified",
      "Gallup Strengths Coach"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" }
    ],
    coreSkills: [
      { name: "Employee engagement", level: 97 },
      { name: "Performance management", level: 96 },
      { name: "Onboarding", level: 95 },
      { name: "Culture development", level: 94 },
      { name: "Conflict resolution", level: 93 }
    ],
    technicalSkills: [
      "CultureAmp", "15Five", "Lattice", "BambooHR"
    ],
    softSkills: [
      "Empathie", "Écoute active", "Médiation", "Patience"
    ],
    expertise: [
      "Employee journey mapping",
      "Pulse surveys",
      "Performance review cycles"
    ],
    experience: "6 ans en people ops, ex-startup licorne",
    methodology: [
      "Continuous feedback",
      "OKR-based performance",
      "Stay interviews"
    ],
    tools: ["CultureAmp", "Lattice", "Notion", "Slack"]
  },

  // Legal
  contract_analyzer: {
    id: "contract_analyzer",
    name: "Me Véronique Roche",
    role: "Directrice Juridique",
    department: "Juridique",
    specialty: "Contrats",
    education: {
      degree: "Master 2 Droit des Affaires",
      school: "Université Paris 1 Panthéon-Sorbonne",
      year: 2012
    },
    certifications: [
      "Avocate au Barreau de Paris",
      "DPO Certified (CNIL)"
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Bilingue (C2)" },
      { name: "Allemand", level: "Courant (B2)" }
    ],
    coreSkills: [
      { name: "Contract drafting", level: 98 },
      { name: "Legal risk assessment", level: 97 },
      { name: "Negotiation", level: 96 },
      { name: "IP/IT law", level: 95 },
      { name: "Data protection", level: 97 }
    ],
    technicalSkills: [
      "Ironclad", "DocuSign", "Notion", "Legal Tracker"
    ],
    softSkills: [
      "Rigueur", "Diplomatie", "Clarté", "Éthique"
    ],
    expertise: [
      "SaaS contracts",
      "DPA (Data Processing Agreements)",
      "Intellectual property"
    ],
    experience: "18 ans en droit des affaires, ex-Freshfields, ex-General Counsel startup",
    methodology: [
      "Playbooks de négociation",
      "Risk tiering",
      "Self-serve legal templates"
    ],
    tools: ["Ironclad", "DocuSign", "Notion", "Legal Tracker"]
  }
};

// Get profile by agent ID
export function getAgentProfile(agentId: string): AgentProfile | undefined {
  return AGENT_PROFILES[agentId];
}

interface AgentProfileDialogProps {
  agentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentProfileDialog({ agentId, open, onOpenChange }: AgentProfileDialogProps) {
  const profile = agentId ? AGENT_PROFILES[agentId] : undefined;
  
  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{profile.name}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {profile.role} • {profile.department}
              </DialogDescription>
              <Badge className="mt-2">{profile.specialty}</Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Formation */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                Formation
              </h3>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="font-medium">{profile.education.degree}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.education.school} • Promotion {profile.education.year}
                </p>
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Award className="w-5 h-5 text-amber-500" />
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Langues */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Languages className="w-5 h-5 text-blue-500" />
                Langues
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.languages.map((lang, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg bg-muted/50 border text-sm">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-muted-foreground"> • {lang.level}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Compétences Clés */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Target className="w-5 h-5 text-emerald-500" />
                Compétences Clés
              </h3>
              <div className="space-y-3">
                {profile.coreSkills.map((skill, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </section>

            {/* Compétences Techniques */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Code className="w-5 h-5 text-slate-500" />
                Compétences Techniques
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.technicalSkills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Soft Skills */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Users className="w-5 h-5 text-pink-500" />
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.softSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Domaines d'Expertise */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Star className="w-5 h-5 text-yellow-500" />
                Domaines d'Expertise
              </h3>
              <ul className="space-y-2">
                {profile.expertise.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {exp}
                  </li>
                ))}
              </ul>
            </section>

            {/* Expérience */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Expérience
              </h3>
              <p className="text-sm text-muted-foreground">{profile.experience}</p>
            </section>

            {/* Méthodologies */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <BookOpen className="w-5 h-5 text-teal-500" />
                Méthodologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.methodology.map((method, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                    {method}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Outils */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Zap className="w-5 h-5 text-orange-500" />
                Outils Maîtrisés
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.tools.map((tool, i) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    {tool}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
