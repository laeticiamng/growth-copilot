import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sparkles,
  ArrowRight,
  BarChart3,
  MousePointer,
  Eye,
} from "lucide-react";

const conversionMetrics = [
  { label: "Taux de conversion", value: "3.2%", change: "+0.4%", trend: "up" },
  { label: "Visiteurs", value: "12,847", change: "+18%", trend: "up" },
  { label: "Leads", value: "411", change: "+24%", trend: "up" },
  { label: "Taux rebond", value: "42%", change: "-5%", trend: "up" },
];

const pageAudits = [
  {
    page: "Page d'accueil",
    url: "/",
    frictionScore: 35,
    issues: 4,
    opportunities: 3,
    status: "optimized",
  },
  {
    page: "Page services",
    url: "/services",
    frictionScore: 58,
    issues: 7,
    opportunities: 5,
    status: "needs_work",
  },
  {
    page: "Page pricing",
    url: "/pricing",
    frictionScore: 45,
    issues: 5,
    opportunities: 4,
    status: "in_progress",
  },
  {
    page: "Page contact",
    url: "/contact",
    frictionScore: 62,
    issues: 8,
    opportunities: 6,
    status: "needs_work",
  },
];

const experiments = [
  {
    id: 1,
    name: "Hero CTA - Couleur",
    page: "Homepage",
    status: "running",
    variants: 2,
    visitors: 1245,
    conversionA: 3.2,
    conversionB: 4.1,
    confidence: 87,
  },
  {
    id: 2,
    name: "Pricing - Mise en page",
    page: "Pricing",
    status: "completed",
    variants: 2,
    visitors: 2890,
    conversionA: 2.8,
    conversionB: 3.5,
    confidence: 95,
    winner: "B",
  },
  {
    id: 3,
    name: "Form - Champs réduits",
    page: "Contact",
    status: "draft",
    variants: 2,
    visitors: 0,
    conversionA: 0,
    conversionB: 0,
    confidence: 0,
  },
];

const croBacklog = [
  { task: "Ajouter preuves sociales hero", impact: 85, effort: "Faible", status: "todo" },
  { task: "Réduire champs formulaire contact", impact: 78, effort: "Faible", status: "todo" },
  { task: "Ajouter FAQ section pricing", impact: 72, effort: "Moyen", status: "in_progress" },
  { task: "Optimiser CTA couleur/texte", impact: 68, effort: "Faible", status: "testing" },
  { task: "Ajouter chat live", impact: 65, effort: "Élevé", status: "todo" },
];

export default function CRO() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRO Autopilot</h1>
          <p className="text-muted-foreground">
            Optimisation du taux de conversion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapport CRO
          </Button>
          <Button variant="hero">
            <Sparkles className="w-4 h-4 mr-2" />
            Analyser page
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-4 gap-4">
        {conversionMetrics.map((metric, i) => (
          <Card key={i} variant="kpi">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold mt-1">{metric.value}</p>
              <p className={`text-xs mt-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-destructive'}`}>
                {metric.change} ce mois
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="audits">Audits pages</TabsTrigger>
          <TabsTrigger value="experiments">Expérimentations</TabsTrigger>
          <TabsTrigger value="backlog">Backlog CRO</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit des pages clés</CardTitle>
                  <CardDescription>Score de friction et opportunités</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Auditer une page
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pageAudits.map((audit, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{audit.page}</p>
                      <Badge
                        variant={
                          audit.status === "optimized"
                            ? "gradient"
                            : audit.status === "in_progress"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {audit.status === "optimized"
                          ? "Optimisé"
                          : audit.status === "in_progress"
                          ? "En cours"
                          : "À améliorer"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{audit.url}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Friction</span>
                      <Progress value={100 - audit.frictionScore} className="w-20 h-2" />
                    </div>
                    <p className={`text-sm font-medium ${audit.frictionScore > 50 ? 'text-destructive' : 'text-green-500'}`}>
                      {audit.frictionScore}/100
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Issues</p>
                    <p className="font-medium">{audit.issues}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Opportunités</p>
                    <p className="font-medium text-primary">{audit.opportunities}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tests A/B & Expérimentations</CardTitle>
                  <CardDescription>Tests en cours et résultats</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau test
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiments.map((exp) => (
                <div key={exp.id} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{exp.name}</p>
                        <Badge
                          variant={
                            exp.status === "running"
                              ? "gradient"
                              : exp.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {exp.status === "running"
                            ? "En cours"
                            : exp.status === "completed"
                            ? "Terminé"
                            : "Brouillon"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{exp.page}</p>
                    </div>
                    {exp.winner && (
                      <Badge variant="gradient">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Gagnant: {exp.winner}
                      </Badge>
                    )}
                  </div>
                  {exp.status !== "draft" && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Visiteurs</p>
                        <p className="font-medium">{exp.visitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conv. A</p>
                        <p className="font-medium">{exp.conversionA}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conv. B</p>
                        <p className={`font-medium ${exp.conversionB > exp.conversionA ? 'text-green-500' : ''}`}>
                          {exp.conversionB}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confiance</p>
                        <p className={`font-medium ${exp.confidence >= 95 ? 'text-green-500' : ''}`}>
                          {exp.confidence}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlog" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backlog CRO</CardTitle>
                  <CardDescription>Optimisations priorisées par impact</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggestions IA
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {croBacklog.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className="flex-shrink-0">
                    {item.status === "testing" ? (
                      <div className="w-3 h-3 rounded-full bg-green-500 agent-pulse" />
                    ) : item.status === "in_progress" ? (
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.task}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Impact</span>
                    <Progress value={item.impact} className="w-16 h-1.5" />
                    <span className="text-xs font-medium">{item.impact}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{item.effort}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
