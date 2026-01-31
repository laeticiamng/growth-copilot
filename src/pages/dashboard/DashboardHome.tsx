import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Search,
  MapPin,
  Megaphone,
  Target,
  Play,
  Pause,
  Bot,
  Zap,
  ExternalLink,
} from "lucide-react";

// Demo data for display
const kpiData = [
  {
    label: "Trafic Organique",
    value: "12,847",
    change: "+18.2%",
    trend: "up",
    icon: Search,
  },
  {
    label: "Conversions",
    value: "342",
    change: "+24.5%",
    trend: "up",
    icon: Target,
  },
  {
    label: "Position Moyenne",
    value: "12.4",
    change: "-2.1",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Avis Google",
    value: "4.8",
    change: "+0.2",
    trend: "up",
    icon: MapPin,
  },
];

const topActions = [
  {
    id: 1,
    priority: "critical",
    title: "Corriger 12 erreurs 404",
    category: "SEO Tech",
    impact: 85,
    effort: "Faible",
    description: "Pages cassées détectées qui impactent l'expérience utilisateur et le SEO.",
  },
  {
    id: 2,
    priority: "high",
    title: "Optimiser les Core Web Vitals",
    category: "Performance",
    impact: 78,
    effort: "Moyen",
    description: "LCP à 4.2s sur mobile. Objectif < 2.5s pour meilleur ranking.",
  },
  {
    id: 3,
    priority: "high",
    title: "Ajouter schema LocalBusiness",
    category: "Local SEO",
    impact: 72,
    effort: "Faible",
    description: "Améliorer la visibilité dans les résultats locaux avec structured data.",
  },
  {
    id: 4,
    priority: "medium",
    title: "Créer 5 articles piliers",
    category: "Contenu",
    impact: 68,
    effort: "Élevé",
    description: "Opportunités de mots-clés à fort volume identifiées.",
  },
  {
    id: 5,
    priority: "medium",
    title: "Répondre à 8 avis en attente",
    category: "Réputation",
    impact: 55,
    effort: "Faible",
    description: "Avis clients non répondus depuis plus de 48h.",
  },
];

const agentStatus = [
  { name: "Chief Growth Officer", status: "active", lastRun: "Il y a 2 min" },
  { name: "Tech Auditor", status: "idle", lastRun: "Il y a 1h" },
  { name: "Content Builder", status: "active", lastRun: "En cours" },
  { name: "Analytics Guardian", status: "active", lastRun: "Il y a 5 min" },
  { name: "CRO Optimizer", status: "idle", lastRun: "Il y a 3h" },
  { name: "Local Manager", status: "idle", lastRun: "Il y a 2h" },
];

const alerts = [
  {
    type: "error",
    message: "Tracking GA4 cassé sur /checkout",
    time: "Il y a 15 min",
  },
  {
    type: "warning",
    message: "Budget Ads atteint à 80%",
    time: "Il y a 1h",
  },
  {
    type: "info",
    message: "Nouveau concurrent détecté",
    time: "Il y a 3h",
  },
];

export default function DashboardHome() {
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Aucun workspace sélectionné</h2>
        <p className="text-muted-foreground mb-6">
          Créez ou sélectionnez un workspace pour commencer
        </p>
        <Link to="/onboarding">
          <Button variant="hero">
            Créer un workspace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de {currentWorkspace.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={currentWorkspace.plan === 'free' ? 'secondary' : 'gradient'} className="capitalize">
            Plan {currentWorkspace.plan}
          </Badge>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Voir le site
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === "error"
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : alert.type === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                  : "bg-primary/10 border-primary/30 text-primary"
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-sm">{alert.message}</span>
              <span className="text-xs opacity-70">{alert.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} variant="kpi" className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${
                      kpi.trend === "up" ? "text-green-500" : "text-destructive"
                    }`}>
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {kpi.change}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Actions */}
        <div className="lg:col-span-2">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Actions prioritaires</CardTitle>
                  <CardDescription>Recommandations classées par impact</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topActions.map((action, i) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        action.priority === "critical"
                          ? "bg-destructive"
                          : action.priority === "high"
                          ? "bg-yellow-500"
                          : "bg-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{action.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {action.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Impact</span>
                        <Progress value={action.impact} className="w-20 h-1.5" />
                        <span className="text-xs font-medium">{action.impact}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Effort: {action.effort}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Agent Status */}
        <div className="space-y-6">
          <Card variant="agent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Agents IA
                </CardTitle>
                <Badge variant="gradient" className="text-xs">
                  3 actifs
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentStatus.map((agent, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        agent.status === "active"
                          ? "bg-green-500 agent-pulse"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-sm">{agent.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {agent.lastRun}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Autopilot toggle */}
          <Card variant="gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Autopilot</p>
                    <p className="text-xs opacity-80">Exécution auto</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Pause className="w-4 h-4" />
                  OFF
                </Button>
              </div>
              <p className="text-xs mt-4 opacity-70">
                En mode OFF, les actions sont suggérées mais requièrent votre validation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
