import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpsMetrics } from "@/hooks/useOpsMetrics";
import { useDemoMode, DEMO_DATA } from "@/hooks/useDemoMode";
import { 
  DollarSign, Zap, Clock, TrendingUp, TrendingDown,
  Bot, BarChart3, AlertTriangle, CheckCircle2
} from "lucide-react";

// Cost per 1M tokens (approximate)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-3-pro': { input: 1.25, output: 5.00 },
  'gemini-3-flash': { input: 0.075, output: 0.30 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
};

interface CostBreakdown {
  model: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

export default function AICostDashboard() {
  const { metrics, loading } = useOpsMetrics();
  const { isDemoMode } = useDemoMode();

  // Get latest metric or default
  const latestMetric = Array.isArray(metrics) ? metrics[0] : metrics;
  const aiCost = latestMetric?.ai_cost_usd || 0;

  // Use demo data if in demo mode
  const displayData = isDemoMode ? DEMO_DATA.aiCosts : {
    today: aiCost,
    thisWeek: aiCost * 5,
    thisMonth: aiCost * 22,
    breakdown: [] as CostBreakdown[],
  };

  const formatCost = (cost: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cost);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-primary" />
          Coûts IA & Observabilité
        </h1>
        <p className="text-muted-foreground mt-1">
          Suivez vos dépenses IA en temps réel et optimisez vos coûts
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold">{formatCost(displayData.today)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cette semaine</p>
                <p className="text-2xl font-bold">{formatCost(displayData.thisWeek)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">{formatCost(displayData.thisMonth)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimation mensuelle</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCost(displayData.today * 30)}
                </p>
              </div>
              <Zap className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList>
          <TabsTrigger value="breakdown">Par modèle</TabsTrigger>
          <TabsTrigger value="agents">Par agent</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par modèle</CardTitle>
              <CardDescription>
                Coûts détaillés par modèle IA utilisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(MODEL_COSTS).map(([model, costs]) => {
                  const usage = isDemoMode 
                    ? DEMO_DATA.aiCosts.breakdown.find(b => b.model === model)
                    : null;
                  
                  return (
                    <div key={model} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{model}</p>
                          <p className="text-sm text-muted-foreground">
                            Input: ${costs.input}/1M • Output: ${costs.output}/1M
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {usage ? (
                          <>
                            <p className="font-semibold">{formatCost(usage.cost)}</p>
                            <p className="text-xs text-muted-foreground">
                              {usage.requests} requêtes
                            </p>
                          </>
                        ) : (
                          <Badge variant="outline">Non utilisé</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coûts par agent</CardTitle>
              <CardDescription>
                Consommation IA de chaque agent spécialisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'SEO Auditor', cost: 23.45, runs: 12 },
                  { name: 'Content Strategist', cost: 45.67, runs: 34 },
                  { name: 'Ads Optimizer', cost: 12.34, runs: 8 },
                  { name: 'Report Generator', cost: 34.56, runs: 15 },
                  { name: 'Social Manager', cost: 8.90, runs: 45 },
                ].map(agent => (
                  <div key={agent.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{agent.runs} runs</Badge>
                      <span className="font-semibold">{formatCost(agent.cost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des alertes</CardTitle>
              <CardDescription>
                Recevez des notifications en cas de dépassement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Seuil journalier</p>
                    <p className="text-sm text-muted-foreground">Alerte si dépassement de 50€/jour</p>
                  </div>
                </div>
                <Badge variant="success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Seuil mensuel</p>
                    <p className="text-sm text-muted-foreground">Alerte si dépassement de 500€/mois</p>
                  </div>
                </div>
                <Badge variant="success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Pic d'utilisation</p>
                    <p className="text-sm text-muted-foreground">Alerte si +100% vs moyenne</p>
                  </div>
                </div>
                <Badge variant="outline">Désactivé</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Optimization Tips */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Conseils d'optimisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">Utilisez Flash pour les tâches simples</p>
              <p className="text-sm text-muted-foreground">
                Gemini Flash coûte 16x moins cher que Pro pour les tâches de classification et extraction.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">Activez le cache de réponses</p>
              <p className="text-sm text-muted-foreground">
                Les requêtes identiques sont automatiquement mises en cache (économie ~30%).
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">Réduisez les tokens de contexte</p>
              <p className="text-sm text-muted-foreground">
                Limitez le contexte historique à 10 messages max pour les conversations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">Planifiez les runs off-peak</p>
              <p className="text-sm text-muted-foreground">
                Les exécutions nocturnes bénéficient de meilleurs temps de réponse.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
