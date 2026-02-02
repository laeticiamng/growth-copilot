import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Loader2,
  Play,
  Pause,
  Info,
} from "lucide-react";
import { useCRO } from "@/hooks/useCRO";
import { useSites } from "@/hooks/useSites";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
import { calculateConfidence, getTestRecommendation, calculateUplift } from "@/lib/statistics";

export default function CRO() {
  const { currentSite } = useSites();
  const { audits, experiments, variants, loading, createExperiment, updateExperimentStatus, declareWinner, refetch } = useCRO();
  
  const [showExperimentDialog, setShowExperimentDialog] = useState(false);
  const [experimentForm, setExperimentForm] = useState({
    name: "",
    hypothesis: "",
    page_url: "",
    test_type: "ab",
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate metrics from real data only
  const conversionMetrics = [
    { label: "Taux de conversion", value: experiments.length > 0 ? `${(variants.reduce((a, v) => a + (v.conversion_rate || 0), 0) / Math.max(variants.length, 1)).toFixed(1)}%` : "—", change: "", trend: "up" },
    { label: "Visiteurs", value: variants.reduce((a, v) => a + (v.visitors || 0), 0).toLocaleString() || "0", change: "", trend: "up" },
    { label: "Conversions", value: variants.reduce((a, v) => a + (v.conversions || 0), 0).toString(), change: "", trend: "up" },
    { label: "Tests actifs", value: experiments.filter(e => e.status === 'running').length.toString(), change: "", trend: "up" },
  ];

  // Real page audits only - no demo data
  const pageAudits = audits.map(a => ({
    page: a.page_type || "Page",
    url: "/",
    frictionScore: a.friction_score || 50,
    issues: (a.findings as unknown[])?.length || 0,
    opportunities: (a.recommendations as unknown[])?.length || 0,
    status: (a.friction_score || 50) < 40 ? "optimized" : (a.friction_score || 50) < 60 ? "in_progress" : "needs_work",
  }));

  // Real experiments only - no demo data
  const displayExperiments = experiments.map(exp => {
    const expVariants = variants.filter(v => v.experiment_id === exp.id);
    const controlVariant = expVariants.find(v => v.is_control);
    const testVariant = expVariants.find(v => !v.is_control);
    
    // Calculate real confidence
    const confidence = controlVariant && testVariant
      ? calculateConfidence(
          controlVariant.visitors || 0,
          controlVariant.conversions || 0,
          testVariant.visitors || 0,
          testVariant.conversions || 0
        )
      : 0;
    
    const rateA = controlVariant?.conversion_rate || 0;
    const rateB = testVariant?.conversion_rate || 0;
    const uplift = calculateUplift(rateA, rateB);
    const recommendation = getTestRecommendation(confidence, rateA, rateB);
    
    return {
      id: exp.id,
      name: exp.name,
      page: exp.page_url || "Page",
      status: exp.status || "draft",
      variants: expVariants.length,
      visitors: expVariants.reduce((a, v) => a + (v.visitors || 0), 0),
      conversionA: rateA,
      conversionB: rateB,
      confidence,
      uplift,
      recommendation,
      winner: exp.winner_variant_id ? "B" : undefined,
    };
  });

  // CRO backlog - derived from audits recommendations (no hardcoded demo data)
  const croBacklog = audits.flatMap(a => 
    (a.recommendations as Array<{ title?: string; impact?: number; effort?: string; status?: string }> || []).map((rec, i) => ({
      task: rec.title || `Recommandation ${i + 1}`,
      impact: rec.impact || 50,
      effort: rec.effort || "Moyen",
      status: rec.status || "todo",
    }))
  ).slice(0, 10);

  const handleCreateExperiment = async () => {
    if (!experimentForm.name) {
      toast.error("Nom de l'expérimentation requis");
      return;
    }
    setSubmitting(true);
    const { error } = await createExperiment(experimentForm);
    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Expérimentation créée");
      setShowExperimentDialog(false);
      setExperimentForm({ name: "", hypothesis: "", page_url: "", test_type: "ab" });
    }
  };

  const handleToggleExperiment = async (experimentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "running" ? "paused" : "running";
    const { error } = await updateExperimentStatus(experimentId, newStatus);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(`Test ${newStatus === "running" ? "démarré" : "en pause"}`);
    }
  };

  if (loading) {
    return <LoadingState message="Chargement des données CRO..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRO Autopilot</h1>
          <p className="text-muted-foreground">
            Optimisation du taux de conversion
          </p>
          {!currentSite && <p className="text-sm text-muted-foreground mt-1">⚠️ Sélectionnez un site pour voir vos données</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapport CRO
          </Button>
          <Button variant="hero" onClick={() => setShowExperimentDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau test
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
              {metric.change && (
                <p className={`text-xs mt-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-destructive'}`}>
                  {metric.change} ce mois
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="experiments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="experiments">Expérimentations</TabsTrigger>
          <TabsTrigger value="audits">Audits pages</TabsTrigger>
          <TabsTrigger value="backlog">Backlog CRO</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tests A/B & Expérimentations</CardTitle>
                  <CardDescription>Tests en cours et résultats</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowExperimentDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau test
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayExperiments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune expérimentation. Créez votre premier test A/B.</p>
              ) : (
                displayExperiments.map((exp) => (
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
                              : exp.status === "paused"
                              ? "En pause"
                              : "Brouillon"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.page}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exp.winner && (
                          <Badge variant="gradient">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Gagnant: {exp.winner}
                          </Badge>
                        )}
                        {exp.status !== "completed" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleExperiment(exp.id, exp.status)}
                          >
                            {exp.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    {exp.status !== "draft" && (
                      <div className="grid grid-cols-5 gap-4 mt-4">
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    Confiance <Info className="w-3 h-3" />
                                  </p>
                                  <p className={`font-medium ${exp.confidence >= 95 ? 'text-green-500' : exp.confidence >= 80 ? 'text-amber-500' : ''}`}>
                                    {exp.confidence}%
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">{exp.recommendation?.message}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Uplift</p>
                          <p className={`font-medium ${(exp.uplift || 0) > 0 ? 'text-green-500' : (exp.uplift || 0) < 0 ? 'text-destructive' : ''}`}>
                            {(exp.uplift || 0) > 0 ? '+' : ''}{(exp.uplift || 0).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
              {pageAudits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun audit de page. Lancez un audit pour voir les opportunités d'optimisation.</p>
              ) : (
                pageAudits.map((audit, i) => (
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
                      <p className={`text-sm font-medium ${audit.frictionScore > 50 ? 'text-destructive' : 'text-primary'}`}>
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
                ))
              )}
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
              {croBacklog.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune recommandation CRO. Lancez un audit de page pour obtenir des suggestions.</p>
              ) : (
                croBacklog.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0">
                      {item.status === "testing" ? (
                        <div className="w-3 h-3 rounded-full bg-primary agent-pulse" />
                      ) : item.status === "in_progress" ? (
                        <div className="w-3 h-3 rounded-full bg-warning" />
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
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Experiment Dialog */}
      <Dialog open={showExperimentDialog} onOpenChange={setShowExperimentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle expérimentation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nom du test</label>
              <Input 
                placeholder="Ex: Hero CTA - Couleur"
                value={experimentForm.name}
                onChange={(e) => setExperimentForm({ ...experimentForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hypothèse</label>
              <Textarea 
                placeholder="Ex: Changer la couleur du CTA en vert augmentera les conversions de 10%"
                value={experimentForm.hypothesis}
                onChange={(e) => setExperimentForm({ ...experimentForm, hypothesis: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL de la page</label>
              <Input 
                placeholder="Ex: /pricing"
                value={experimentForm.page_url}
                onChange={(e) => setExperimentForm({ ...experimentForm, page_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExperimentDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateExperiment} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}