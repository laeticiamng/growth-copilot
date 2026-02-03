import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServices } from "@/hooks/useServices";
import { Link } from "react-router-dom";
import { 
  Bot, ArrowRight, CheckCircle2, Clock,
  TrendingUp, Briefcase, BarChart3, Shield, 
  Puzzle, Code, HeadphonesIcon, Settings, Users, Scale,
  Zap, Target, FileText, Search, BarChart, Globe,
  Mail, Camera, MessageSquare, LineChart, AlertTriangle
} from "lucide-react";

// Employee data per department
const DEPARTMENT_DATA: Record<string, {
  employees: {
    name: string;
    role: string;
    specialty: string;
    icon: React.ElementType;
  }[];
  inputs: string[];
  outputs: string[];
  examples: { action: string; result: string }[];
  limits: string[];
}> = {
  marketing: {
    employees: [
      { name: "Sophie Marchand", role: "Chief Growth Officer", specialty: "Orchestration & prioritization", icon: Target },
      { name: "Lucas Bernard", role: "SEO Tech Auditor", specialty: "Core Web Vitals, Schema markup", icon: Search },
      { name: "Emma Dubois", role: "Content Strategist", specialty: "Editorial calendar, briefs", icon: FileText },
      { name: "Thomas Martin", role: "Ads Optimizer", specialty: "Google Ads, Meta Ads", icon: BarChart },
      { name: "Julie Petit", role: "Social Manager", specialty: "Multi-platform distribution", icon: MessageSquare },
    ],
    inputs: [
      "Google Analytics 4 data",
      "Google Search Console keywords",
      "Meta Ads campaigns",
      "Competitor analysis",
      "Brand kit (colors, tone, claims)"
    ],
    outputs: [
      "SEO audit reports with priorities",
      "Content briefs and calendar",
      "Ad optimization recommendations",
      "Social posting schedule",
      "Monthly performance reports"
    ],
    examples: [
      { action: "Run SEO audit on example.com", result: "87 issues found, 12 critical (Core Web Vitals), action plan generated" },
      { action: "Generate content brief for 'AI marketing'", result: "3,500 word brief with H2 structure, keyword mapping, competitor analysis" },
      { action: "Optimize Meta Ads campaign", result: "Reduced CPA by 23%, paused 4 fatigued audiences, suggested 2 new creatives" },
    ],
    limits: [
      "Cannot execute paid media changes without approval",
      "Content generation limited to briefs (not full articles)",
      "SEO crawl limited to 1,000 pages per audit",
      "Social posting requires account authorization"
    ]
  },
  sales: {
    employees: [
      { name: "Alexandre Leroy", role: "Sales Director", specialty: "Pipeline management", icon: Target },
      { name: "Marie Moreau", role: "Lead Qualifier", specialty: "Scoring & qualification", icon: Users },
      { name: "Pierre Durand", role: "Account Manager", specialty: "Client relationships", icon: Briefcase },
      { name: "Camille Roux", role: "Proposal Writer", specialty: "Quotes & contracts", icon: FileText },
    ],
    inputs: [
      "Inbound leads (forms, emails)",
      "CRM data (if connected)",
      "Website visitor behavior",
      "Company information (via enrichment)"
    ],
    outputs: [
      "Qualified lead reports",
      "Pipeline health dashboard",
      "Proposal drafts",
      "Follow-up recommendations"
    ],
    examples: [
      { action: "Score new lead from contact form", result: "Lead scored 78/100 (Budget: confirmed, Timeline: 30 days, Authority: decision maker)" },
      { action: "Generate proposal for SaaS client", result: "3-page proposal with pricing, timeline, ROI projections" },
    ],
    limits: [
      "Cannot send emails without approval",
      "Lead enrichment limited to public data",
      "No direct CRM write access (suggestions only)"
    ]
  },
  finance: {
    employees: [
      { name: "Françoise Garnier", role: "DAF IA", specialty: "Financial analysis", icon: BarChart3 },
      { name: "Nicolas Blanc", role: "Reporting Manager", specialty: "Monthly reports", icon: FileText },
      { name: "Isabelle Faure", role: "Budget Controller", specialty: "Cost tracking", icon: LineChart },
    ],
    inputs: [
      "Stripe transactions",
      "Ad spend data (Google, Meta)",
      "Agent execution costs",
      "Subscription data"
    ],
    outputs: [
      "Monthly financial reports",
      "ROI calculations",
      "Budget forecasts",
      "Cost optimization recommendations"
    ],
    examples: [
      { action: "Generate monthly report for January", result: "PDF report with revenue, costs, ROAS, MoM comparison" },
      { action: "Analyze ad spend efficiency", result: "Identified 3 underperforming campaigns, savings potential: €2,400/month" },
    ],
    limits: [
      "Cannot execute financial transactions",
      "Read-only access to payment data",
      "Reports require manager approval for sharing"
    ]
  },
  security: {
    employees: [
      { name: "Antoine Lambert", role: "CISO IA", specialty: "Security oversight", icon: Shield },
      { name: "Claire Dupont", role: "Access Reviewer", specialty: "Permission audits", icon: Users },
      { name: "Maxime Girard", role: "Compliance Officer", specialty: "GDPR, policies", icon: FileText },
    ],
    inputs: [
      "User activity logs",
      "OAuth token status",
      "Permission assignments",
      "Integration health checks"
    ],
    outputs: [
      "Access review reports",
      "Security recommendations",
      "Compliance dashboards",
      "Alert notifications"
    ],
    examples: [
      { action: "Run access review", result: "15 users audited, 2 flagged as high-risk (inactive 90+ days), 1 token expiring" },
      { action: "Check GDPR compliance", result: "Compliance score: 94%, 2 items need attention (data retention policy update)" },
    ],
    limits: [
      "Cannot revoke access without owner approval",
      "Alert thresholds configurable by admin only",
      "Penetration testing not included"
    ]
  },
  product: {
    employees: [
      { name: "Rémi Fontaine", role: "Product Manager", specialty: "Feature prioritization", icon: Puzzle },
      { name: "Lucie Chevalier", role: "UX Researcher", specialty: "User insights", icon: Search },
      { name: "Julien Mercier", role: "Feature Analyst", specialty: "Usage analytics", icon: BarChart },
      { name: "Élise Simon", role: "Roadmap Planner", specialty: "OKRs & planning", icon: Target },
    ],
    inputs: [
      "Feature usage data",
      "User feedback",
      "Competitor features",
      "Market research"
    ],
    outputs: [
      "Feature prioritization (ICE scores)",
      "User research summaries",
      "Roadmap recommendations",
      "A/B test designs"
    ],
    examples: [
      { action: "Prioritize Q2 features", result: "Ranked 12 features by ICE score, top 3: Dashboard redesign (85), API v2 (78), Mobile app (72)" },
      { action: "Analyze feature adoption", result: "New onboarding flow: 67% completion (+23%), identified 2 drop-off points" },
    ],
    limits: [
      "Roadmap suggestions only (not decisions)",
      "Research limited to available data sources",
      "Cannot deploy features"
    ]
  },
  engineering: {
    employees: [
      { name: "Olivier Rousseau", role: "CTO IA", specialty: "Technical architecture", icon: Code },
      { name: "Élodie Morel", role: "DevOps Engineer", specialty: "Infrastructure", icon: Settings },
      { name: "Damien Lefebvre", role: "API Developer", specialty: "Integrations", icon: Globe },
      { name: "Pauline Guérin", role: "QA Engineer", specialty: "Testing", icon: CheckCircle2 },
      { name: "Benoît André", role: "Tech Lead", specialty: "Code review", icon: FileText },
    ],
    inputs: [
      "Error logs",
      "Performance metrics",
      "API documentation",
      "Deployment status"
    ],
    outputs: [
      "Technical recommendations",
      "Performance reports",
      "Integration status",
      "Code quality metrics"
    ],
    examples: [
      { action: "Analyze error logs", result: "3 critical errors identified, root cause: API timeout in payment flow" },
      { action: "Review deployment health", result: "All 30 Edge Functions healthy, P95 latency: 234ms" },
    ],
    limits: [
      "Cannot deploy code changes",
      "Read-only access to infrastructure",
      "Recommendations require dev approval"
    ]
  },
  data: {
    employees: [
      { name: "Vincent Fournier", role: "Chief Data Officer", specialty: "Data strategy", icon: BarChart3 },
      { name: "Nathalie Perrin", role: "Analytics Guardian", specialty: "GA4, GSC sync", icon: LineChart },
      { name: "Guillaume Robert", role: "ETL Developer", specialty: "Data pipelines", icon: Settings },
      { name: "Mathilde Laurent", role: "Dashboard Builder", specialty: "Visualizations", icon: BarChart },
    ],
    inputs: [
      "Google Analytics 4",
      "Google Search Console",
      "Meta Insights",
      "Internal databases"
    ],
    outputs: [
      "Aggregated KPI dashboards",
      "Trend analysis",
      "Data quality reports",
      "Custom exports"
    ],
    examples: [
      { action: "Sync GA4 data for March", result: "12,456 sessions imported, 3 anomalies detected (traffic spike March 15)" },
      { action: "Build executive dashboard", result: "5 KPI cards configured: Sessions, Leads, Revenue, ROAS, CAC" },
    ],
    limits: [
      "Data sync frequency: daily maximum",
      "Historical data limited to 24 months",
      "Custom queries require approval"
    ]
  },
  support: {
    employees: [
      { name: "Caroline Michel", role: "Support Director", specialty: "Customer success", icon: HeadphonesIcon },
      { name: "Florian Dupuis", role: "Reputation Manager", specialty: "Reviews & responses", icon: MessageSquare },
      { name: "Anaïs Martin", role: "Knowledge Manager", specialty: "Documentation", icon: FileText },
    ],
    inputs: [
      "Google reviews",
      "Meta reviews",
      "Support tickets",
      "User feedback"
    ],
    outputs: [
      "Review response drafts",
      "Sentiment analysis",
      "FAQ updates",
      "Escalation alerts"
    ],
    examples: [
      { action: "Draft response to negative review", result: "Empathetic response draft, acknowledging issue, offering solution" },
      { action: "Analyze review sentiment", result: "87% positive, 3 recurring themes: speed, support, pricing" },
    ],
    limits: [
      "Cannot publish review responses without approval",
      "Ticket responses are suggestions only",
      "No direct customer communication"
    ]
  },
  governance: {
    employees: [
      { name: "Philippe Bonnet", role: "Governance Director", specialty: "Policy management", icon: Settings },
      { name: "Stéphanie Renard", role: "Automation Specialist", specialty: "Workflow design", icon: Zap },
      { name: "Laurent Morin", role: "Webhook Manager", specialty: "Integrations", icon: Globe },
    ],
    inputs: [
      "Policy configurations",
      "Automation rules",
      "Webhook endpoints",
      "Third-party systems"
    ],
    outputs: [
      "Policy enforcement reports",
      "Automation execution logs",
      "Integration status",
      "Compliance alerts"
    ],
    examples: [
      { action: "Configure approval workflow for ads", result: "Rule created: All ad changes > €500 require owner approval" },
      { action: "Set up Slack notification webhook", result: "Webhook configured for critical approvals, tested successfully" },
    ],
    limits: [
      "Policy changes require owner approval",
      "Maximum 50 automation rules per workspace",
      "Webhook rate limit: 100/minute"
    ]
  },
  hr: {
    employees: [
      { name: "Céline Hervé", role: "HR Director", specialty: "Team management", icon: Users },
      { name: "Aurélien Brun", role: "Onboarding Specialist", specialty: "New hire setup", icon: CheckCircle2 },
    ],
    inputs: [
      "Team invitations",
      "Role assignments",
      "Onboarding checklists",
      "Access requests"
    ],
    outputs: [
      "Team directory",
      "Onboarding progress",
      "Access reports",
      "Role change logs"
    ],
    examples: [
      { action: "Onboard new team member", result: "Checklist created: 8 tasks, email sent, workspace access granted" },
      { action: "Audit team permissions", result: "15 members reviewed, 2 role updates recommended" },
    ],
    limits: [
      "Cannot delete users without owner approval",
      "Role changes logged in audit trail",
      "Maximum 50 team members (Growth plan)"
    ]
  },
  legal: {
    employees: [
      { name: "Margaux Picard", role: "Legal Director", specialty: "Contract management", icon: Scale },
      { name: "Thibault Lemoine", role: "Compliance Analyst", specialty: "GDPR & policies", icon: Shield },
    ],
    inputs: [
      "Contract documents",
      "GDPR requests",
      "Compliance checklists",
      "Legal templates"
    ],
    outputs: [
      "Contract tracking",
      "GDPR request handling",
      "Compliance reports",
      "Expiration alerts"
    ],
    examples: [
      { action: "Track contract expiration", result: "3 contracts expiring in 30 days, renewal reminders sent" },
      { action: "Process GDPR deletion request", result: "Data mapped, deletion checklist generated, deadline: 28 days" },
    ],
    limits: [
      "Cannot sign contracts (digital signature not included)",
      "Legal advice is informational only",
      "Template library limited to standard documents"
    ]
  },
};

const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  marketing: TrendingUp,
  sales: Briefcase,
  finance: BarChart3,
  security: Shield,
  product: Puzzle,
  engineering: Code,
  data: BarChart3,
  support: HeadphonesIcon,
  governance: Settings,
  hr: Users,
  legal: Scale,
};

export default function ServiceCatalog() {
  const { catalog, enabledServices, hasService } = useServices();
  
  const departments = catalog.filter(s => !s.is_core);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          Catalogue des Services
        </h1>
        <p className="text-muted-foreground mt-1">
          Découvrez ce que chaque département IA peut faire pour vous
        </p>
      </header>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-primary">37</p>
            <p className="text-sm text-muted-foreground">Employés IA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">{departments.length}</p>
            <p className="text-sm text-muted-foreground">Départements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-green-600">
              {enabledServices.filter(s => !s.is_core).length}
            </p>
            <p className="text-sm text-muted-foreground">Activés</p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="space-y-6">
        {departments.map(dept => {
          const Icon = DEPARTMENT_ICONS[dept.slug] || Puzzle;
          const data = DEPARTMENT_DATA[dept.slug];
          const isEnabled = hasService(dept.slug);

          if (!data) return null;

          return (
            <Card key={dept.id} className={isEnabled ? "border-primary/30" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isEnabled ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`w-6 h-6 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {dept.name}
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          {data.employees.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{dept.description}</CardDescription>
                    </div>
                  </div>
                  {isEnabled ? (
                    <Badge variant="success">Activé</Badge>
                  ) : (
                    <Link to="/dashboard/billing">
                      <Button variant="outline" size="sm">
                        Activer
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="team" className="space-y-4">
                  <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="team">Équipe</TabsTrigger>
                    <TabsTrigger value="io">I/O</TabsTrigger>
                    <TabsTrigger value="examples">Exemples</TabsTrigger>
                    <TabsTrigger value="limits">Limites</TabsTrigger>
                  </TabsList>

                  <TabsContent value="team">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.employees.map(emp => (
                        <div key={emp.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <div className="p-2 rounded-lg bg-background">
                            <emp.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{emp.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{emp.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="io">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          Inputs
                        </h4>
                        <ul className="space-y-2">
                          {data.inputs.map(input => (
                            <li key={input} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {input}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-green-500 rotate-180" />
                          Outputs
                        </h4>
                        <ul className="space-y-2">
                          {data.outputs.map(output => (
                            <li key={output} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {output}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples">
                    <div className="space-y-3">
                      {data.examples.map((ex, i) => (
                        <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded bg-primary/10">
                              <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{ex.action}</p>
                              <p className="text-sm text-muted-foreground mt-1">→ {ex.result}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="limits">
                    <div className="space-y-2">
                      {data.limits.map(limit => (
                        <div key={limit} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{limit}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
