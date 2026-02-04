import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, AlertCircle, Clock, 
  Zap, TrendingUp, Briefcase, BarChart3, Shield, 
  Puzzle, Code, HeadphonesIcon, Settings, Users, Scale,
  Bot, Database, Lock, Webhook, FileText, Globe,
  Sparkles, Eye
} from "lucide-react";

type Status = "complete" | "partial" | "planned";

interface FeatureStatus {
  name: string;
  status: Status;
  details?: string;
}

interface ModuleStatus {
  name: string;
  slug: string;
  icon: React.ElementType;
  status: Status;
  features: FeatureStatus[];
  employees?: number;
}

const STATUS_CONFIG = {
  complete: { 
    icon: CheckCircle2, 
    color: "text-green-500", 
    bg: "bg-green-500/10",
    label: "Complet",
    emoji: "✅"
  },
  partial: { 
    icon: AlertCircle, 
    color: "text-yellow-500", 
    bg: "bg-yellow-500/10",
    label: "En cours",
    emoji: "🟡"
  },
  planned: { 
    icon: Clock, 
    color: "text-muted-foreground", 
    bg: "bg-muted",
    label: "Planifié",
    emoji: "🔴"
  },
};

// Core OS Features
const CORE_OS: ModuleStatus = {
  name: "Core OS",
  slug: "core-os",
  icon: Zap,
  status: "complete",
  features: [
    { name: "Workspace Management", status: "complete", details: "Multi-tenant, sites, équipes" },
    { name: "RBAC & Permissions", status: "complete", details: "Rôles owner/manager/member, permissions granulaires" },
    { name: "Audit Log Immuable", status: "complete", details: "Historique complet, export JSON" },
    { name: "Approval Engine", status: "complete", details: "Queue d'approbation, niveaux de risque, SLA" },
    { name: "Scheduler", status: "complete", details: "Automation rules, triggers, cron jobs" },
    { name: "AI Gateway", status: "complete", details: "Routage multi-modèles, quotas, logging" },
    { name: "Integrations Hub", status: "complete", details: "OAuth flows, token refresh, status monitoring" },
    { name: "Executive Cockpit", status: "complete", details: "Dashboard unifié, KPIs, quick actions" },
    { name: "Voice Commands", status: "complete", details: "ElevenLabs integration, commandes vocales" },
    { name: "Evidence Bundles", status: "complete", details: "Traçabilité IA, sources, raisonnement" },
  ]
};

// Departments
const DEPARTMENTS: ModuleStatus[] = [
  {
    name: "Marketing",
    slug: "marketing",
    icon: TrendingUp,
    status: "complete",
    employees: 5,
    features: [
      { name: "SEO Technical Auditor", status: "complete", details: "Crawl, Core Web Vitals, schema markup" },
      { name: "Content Strategist", status: "complete", details: "Calendrier éditorial, briefs, optimisation" },
      { name: "Local SEO Manager", status: "complete", details: "GBP sync, NAP consistency, reviews" },
      { name: "Ads Optimizer", status: "complete", details: "Google Ads sync, budget optimization" },
      { name: "Meta Ads Agent", status: "complete", details: "Facebook/Instagram campaigns, CAPI" },
      { name: "Social Distribution", status: "complete", details: "Multi-platform posting, scheduling" },
      { name: "CRO Analyst", status: "partial", details: "A/B testing, heatmaps (UI ready, backend partial)" },
      { name: "Brand Kit", status: "complete", details: "Colors, fonts, tone of voice, claims" },
      { name: "Creatives Studio", status: "complete", details: "Template factory, QA, export" },
      { name: "Competitors Intel", status: "complete", details: "Monitoring, benchmarks, alerts" },
    ]
  },
  {
    name: "Sales",
    slug: "sales",
    icon: Briefcase,
    status: "complete",
    employees: 4,
    features: [
      { name: "Pipeline Kanban", status: "complete", details: "Leads, deals, stages, activities" },
      { name: "Lead Scoring", status: "complete", details: "Qualification automatique" },
      { name: "Offers Management", status: "complete", details: "Devis, propositions, suivi" },
      { name: "Activity Tracking", status: "complete", details: "Calls, emails, meetings" },
      { name: "CRM Integration", status: "partial", details: "Sync Salesforce/HubSpot (connecteur planifié)" },
    ]
  },
  {
    name: "Finance",
    slug: "finance",
    icon: BarChart3,
    status: "complete",
    employees: 3,
    features: [
      { name: "Report Generator", status: "complete", details: "Rapports mensuels, exports PDF" },
      { name: "KPI Aggregates", status: "complete", details: "Métriques consolidées multi-sources" },
      { name: "Billing Dashboard", status: "complete", details: "Stripe integration, abonnements" },
      { name: "ROI Calculator", status: "complete", details: "Comparaison AI vs salaires" },
      { name: "Budget Tracking", status: "partial", details: "Suivi dépenses ads (partiel)" },
    ]
  },
  {
    name: "Security",
    slug: "security",
    icon: Shield,
    status: "complete",
    employees: 3,
    features: [
      { name: "Access Review", status: "complete", details: "Audit utilisateurs, permissions, risques" },
      { name: "Diagnostics Panel", status: "complete", details: "Health checks, connectivity" },
      { name: "Policy Engine", status: "complete", details: "Autopilot rules, risk levels" },
      { name: "Ops Metrics", status: "complete", details: "Uptime, errors, performance" },
      { name: "Secret Rotation", status: "partial", details: "Alertes expiration (rotation manuelle)" },
    ]
  },
  {
    name: "Product",
    slug: "product",
    icon: Puzzle,
    status: "partial",
    employees: 4,
    features: [
      { name: "Feature Flags", status: "complete", details: "Activation/désactivation modules" },
      { name: "Experiments", status: "complete", details: "A/B testing infrastructure" },
      { name: "User Research Hub", status: "complete", details: "Perplexity-powered research" },
      { name: "Roadmap Management", status: "planned", details: "Priorisation, OKRs" },
    ]
  },
  {
    name: "Engineering",
    slug: "engineering",
    icon: Code,
    status: "partial",
    employees: 5,
    features: [
      { name: "Edge Functions", status: "complete", details: "30+ functions déployées" },
      { name: "Database Migrations", status: "complete", details: "Schema versioning, RLS" },
      { name: "API Documentation", status: "complete", details: "OpenAPI specs, Swagger UI" },
      { name: "Monitoring", status: "partial", details: "Logs, métriques (dashboard externe)" },
      { name: "CI/CD Pipeline", status: "planned", details: "Tests auto, déploiement" },
    ]
  },
  {
    name: "Data",
    slug: "data",
    icon: Database,
    status: "complete",
    employees: 4,
    features: [
      { name: "Analytics Guardian", status: "complete", details: "GA4, GSC data sync" },
      { name: "KPI Sync", status: "complete", details: "Aggregation multi-sources" },
      { name: "Data Export", status: "complete", details: "GDPR export, CSV/JSON" },
      { name: "Reporting Engine", status: "complete", details: "Templates, scheduling" },
    ]
  },
  {
    name: "Support",
    slug: "support",
    icon: HeadphonesIcon,
    status: "complete",
    employees: 3,
    features: [
      { name: "Reputation Manager", status: "complete", details: "Avis Google/Meta, réponses" },
      { name: "AI Assistant", status: "complete", details: "Chat contextuel, commandes" },
      { name: "Notification Center", status: "complete", details: "Alerts, smart prioritization" },
      { name: "Help Documentation", status: "partial", details: "Guides in-app (à compléter)" },
    ]
  },
  {
    name: "Governance",
    slug: "governance",
    icon: Settings,
    status: "complete",
    employees: 3,
    features: [
      { name: "Agency Mode", status: "complete", details: "Multi-client management" },
      { name: "Automations", status: "complete", details: "Rules, triggers, actions" },
      { name: "Webhooks", status: "complete", details: "Outbound integrations" },
      { name: "Policy Profiles", status: "complete", details: "Risk levels, approvals" },
    ]
  },
  {
    name: "HR",
    slug: "hr",
    icon: Users,
    status: "complete",
    employees: 2,
    features: [
      { name: "Team Management", status: "complete", details: "Invitations, rôles" },
      { name: "Employee Directory", status: "complete", details: "38 AI employees catalog" },
      { name: "Access Control", status: "complete", details: "RBAC, site permissions" },
      { name: "Onboarding Flow", status: "complete", details: "Guided setup wizard" },
    ]
  },
  {
    name: "Legal",
    slug: "legal",
    icon: Scale,
    status: "complete",
    employees: 2,
    features: [
      { name: "Contracts Manager", status: "complete", details: "Templates, signature tracking" },
      { name: "Compliance Dashboard", status: "complete", details: "GDPR, policies" },
      { name: "Claim Guardrail", status: "complete", details: "Vérification allégations marketing" },
      { name: "Privacy Policy", status: "complete", details: "Politique de confidentialité" },
    ]
  },
];

// Integrations
const INTEGRATIONS: FeatureStatus[] = [
  { name: "Google Analytics 4", status: "complete", details: "Read-only metrics sync" },
  { name: "Google Search Console", status: "complete", details: "Keywords, positions, CTR" },
  { name: "Google Business Profile", status: "complete", details: "Locations, reviews, posts" },
  { name: "Google Ads", status: "complete", details: "Campaigns, keywords, performance" },
  { name: "Meta Ads (Facebook/Instagram)", status: "complete", details: "Campaigns, audiences, CAPI" },
  { name: "Meta Pages", status: "complete", details: "Posts, insights, messaging" },
  { name: "Instagram Business", status: "complete", details: "Feed sync, stories, reels" },
  { name: "YouTube Analytics", status: "complete", details: "Views, subscribers, revenue" },
  { name: "Stripe", status: "complete", details: "Subscriptions, invoices, portal" },
  { name: "ElevenLabs", status: "complete", details: "Voice AI, commands" },
  { name: "Perplexity", status: "complete", details: "Research, citations" },
  { name: "Firecrawl", status: "complete", details: "Web scraping, SEO audit" },
  { name: "Salesforce", status: "planned", details: "CRM sync bidirectionnel" },
  { name: "HubSpot", status: "planned", details: "Marketing automation" },
  { name: "Slack", status: "planned", details: "Notifications, commands" },
];

function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
      <config.icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function ModuleCard({ module }: { module: ModuleStatus }) {
  const Icon = module.icon;
  const completedCount = module.features.filter(f => f.status === "complete").length;
  const totalCount = module.features.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${STATUS_CONFIG[module.status].bg}`}>
              <Icon className={`w-5 h-5 ${STATUS_CONFIG[module.status].color}`} />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {module.name}
                {module.employees && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    {module.employees}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {completedCount}/{totalCount} fonctionnalités ({percentage}%)
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={module.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {module.features.map((feature) => (
            <div key={feature.name} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5">{STATUS_CONFIG[feature.status].emoji}</span>
              <div className="flex-1">
                <span className="font-medium">{feature.name}</span>
                {feature.details && (
                  <span className="text-muted-foreground"> — {feature.details}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatusPage() {
  // Calculate overall stats
  const allFeatures = [
    ...CORE_OS.features,
    ...DEPARTMENTS.flatMap(d => d.features),
    ...INTEGRATIONS
  ];
  const completeCount = allFeatures.filter(f => f.status === "complete").length;
  const partialCount = allFeatures.filter(f => f.status === "partial").length;
  const plannedCount = allFeatures.filter(f => f.status === "planned").length;
  const totalEmployees = DEPARTMENTS.reduce((sum, d) => sum + (d.employees || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Eye className="w-8 h-8 text-primary" />
          What's Implemented
        </h1>
        <p className="text-muted-foreground mt-1">
          Transparence complète sur l'état de la plateforme Growth OS.
        </p>
      </header>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-500">{completeCount}</div>
            <p className="text-sm text-muted-foreground">✅ Complet</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">{partialCount}</div>
            <p className="text-sm text-muted-foreground">🟡 En cours</p>
          </CardContent>
        </Card>
        <Card className="bg-muted border-border">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground">{plannedCount}</div>
            <p className="text-sm text-muted-foreground">🔴 Planifié</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{totalEmployees}</div>
            <p className="text-sm text-muted-foreground">👤 Employés IA</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="core" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="core">Core OS</TabsTrigger>
          <TabsTrigger value="departments">Départements ({DEPARTMENTS.length})</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations ({INTEGRATIONS.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-6">
          <ModuleCard module={CORE_OS} />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {DEPARTMENTS.map((dept) => (
              <ModuleCard key={dept.slug} module={dept} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Intégrations Tierces
              </CardTitle>
              <CardDescription>
                Connexions aux plateformes externes pour synchronisation des données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {INTEGRATIONS.map((integration) => (
                  <div key={integration.name} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                    <span className="mt-0.5">{STATUS_CONFIG[integration.status].emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{integration.name}</p>
                      {integration.details && (
                        <p className="text-xs text-muted-foreground">{integration.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card variant="feature">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span><strong>Complet</strong> — Fonctionnel et testé en production</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span><strong>En cours</strong> — Partiellement implémenté, améliorations prévues</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span><strong>Planifié</strong> — Sur la roadmap, non encore développé</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
