import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Target,
  Search,
  FileText,
  Megaphone,
  BarChart3,
  Bot,
  ChevronRight,
  Sparkles,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

// CGO Agent Persona
const CGO_PERSONA = {
  name: "Sophie Marchand",
  role: "Chief Growth Officer",
  avatar: "👩‍💼",
};

// Mock KPIs - In production, these would come from actual data
const EXECUTIVE_KPIS = [
  {
    id: "traffic",
    label: "Trafic organique",
    value: "12.4K",
    change: +15.3,
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    id: "leads",
    label: "Leads générés",
    value: "234",
    change: +8.2,
    trend: "up" as const,
    icon: Target,
  },
  {
    id: "positions",
    label: "Mots-clés Top 10",
    value: "47",
    change: -3,
    trend: "down" as const,
    icon: Search,
  },
  {
    id: "score",
    label: "Score SEO global",
    value: "72/100",
    change: +5,
    trend: "up" as const,
    icon: BarChart3,
  },
];

// Priority alerts from agents
const PRIORITY_ALERTS = [
  {
    id: "1",
    severity: "high" as const,
    agent: "Emma Lefebvre",
    agentRole: "SEO Tech",
    title: "15 pages avec Core Web Vitals dégradés",
    action: "Voir les corrections",
    link: "/dashboard/seo",
  },
  {
    id: "2",
    severity: "medium" as const,
    agent: "Thomas Duval",
    agentRole: "Content",
    title: "5 articles prêts pour publication",
    action: "Approuver",
    link: "/dashboard/approvals",
  },
  {
    id: "3",
    severity: "low" as const,
    agent: "Marc Rousseau",
    agentRole: "Ads",
    title: "Budget Ads sous-utilisé de 23%",
    action: "Optimiser",
    link: "/dashboard/ads",
  },
];

// CGO Recommendations
const CGO_RECOMMENDATIONS = [
  {
    id: "1",
    priority: "critical" as const,
    title: "Lancer l'audit SEO initial",
    description: "Votre site n'a jamais été audité. C'est la première étape pour identifier les opportunités.",
    iceScore: 85,
    effort: "Automatique",
    action: "Lancer l'audit",
    link: "/dashboard/seo",
  },
  {
    id: "2",
    priority: "high" as const,
    title: "Connecter Google Search Console",
    description: "Accédez aux données de performance réelles pour des recommandations personnalisées.",
    iceScore: 78,
    effort: "5 min",
    action: "Connecter",
    link: "/dashboard/integrations",
  },
  {
    id: "3",
    priority: "medium" as const,
    title: "Définir votre Brand Kit",
    description: "Personnalisez le ton et les guidelines pour que les agents génèrent du contenu adapté.",
    iceScore: 65,
    effort: "10 min",
    action: "Configurer",
    link: "/dashboard/brand-kit",
  },
];

// Quick actions
const QUICK_ACTIONS = [
  { label: "Lancer un audit SEO", icon: Search, link: "/dashboard/seo" },
  { label: "Créer du contenu", icon: FileText, link: "/dashboard/content" },
  { label: "Voir les rapports", icon: BarChart3, link: "/dashboard/reports" },
  { label: "Gérer les approbations", icon: CheckCircle2, link: "/dashboard/approvals" },
];

export default function DashboardHome() {
  const { currentWorkspace, loading: wsLoading } = useWorkspace();
  const { currentSite, loading: sitesLoading } = useSites();
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const isLoading = wsLoading || sitesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Aucun workspace</h2>
        <p className="text-muted-foreground mb-6">
          Créez votre premier workspace pour commencer.
        </p>
        <Link to="/onboarding">
          <Button>
            Créer un workspace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CGO Welcome Card */}
      <Card variant="gradient" className="border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* CGO Avatar & Message */}
            <div className="flex items-start gap-4 flex-1">
              <div className="text-4xl">{CGO_PERSONA.avatar}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{CGO_PERSONA.name}</span>
                  <Badge variant="outline" className="text-xs">
                    <Bot className="w-3 h-3 mr-1" />
                    {CGO_PERSONA.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Bonjour ! Voici l'état de{" "}
                  <span className="font-medium text-foreground">
                    {currentSite?.name || currentWorkspace?.name || "votre site"}
                  </span>
                  . J'ai identifié <span className="font-medium text-primary">3 actions prioritaires</span> pour
                  améliorer votre croissance cette semaine.
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              {QUICK_ACTIONS.slice(0, 2).map((action) => (
                <Button key={action.label} variant="outline" size="sm" asChild>
                  <Link to={action.link}>
                    <action.icon className="w-4 h-4 mr-1" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {EXECUTIVE_KPIS.map((kpi) => (
          <Card key={kpi.id} className="relative overflow-hidden">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={cn(
                  "w-5 h-5",
                  kpi.trend === "up" ? "text-chart-3" : "text-destructive"
                )} />
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    kpi.trend === "up" ? "text-chart-3" : "text-destructive"
                  )}
                >
                  {kpi.trend === "up" ? "+" : ""}{kpi.change}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Alertes prioritaires
              </CardTitle>
              <Badge variant="secondary">{PRIORITY_ALERTS.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRIORITY_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  alert.severity === "high"
                    ? "border-destructive/30 bg-destructive/5"
                    : alert.severity === "medium"
                    ? "border-warning/30 bg-warning/5"
                    : "border-border bg-secondary/30"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    alert.severity === "high"
                      ? "bg-destructive"
                      : alert.severity === "medium"
                      ? "bg-warning"
                      : "bg-muted-foreground"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alert.agent} • {alert.agentRole}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={alert.link}>
                    {alert.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CGO Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recommandations IA
              </CardTitle>
              <Badge variant="gradient">ICE Score</Badge>
            </div>
            <CardDescription>
              Actions prioritaires classées par impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CGO_RECOMMENDATIONS.slice(0, showAllRecommendations ? undefined : 2).map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      rec.priority === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : rec.priority === "high"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {rec.iceScore}
                  </div>
                  <span className="text-[10px] text-muted-foreground">ICE</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {rec.effort}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link to={rec.link}>
                    {rec.action}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
            {CGO_RECOMMENDATIONS.length > 2 && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              >
                {showAllRecommendations ? "Voir moins" : `Voir les ${CGO_RECOMMENDATIONS.length - 2} autres`}
                <Eye className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                to={action.link}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
