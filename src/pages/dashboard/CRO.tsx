import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
import { calculateConfidence, getTestRecommendation, calculateUplift } from "@/lib/statistics";
import { CROSuggestionsAI } from "@/components/cro/CROSuggestionsAI";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { ModuleEmptyState, NoSiteEmptyState } from "@/components/ui/module-empty-state";

export default function CRO() {
  const { t } = useTranslation();
  const { currentSite } = useSites();
  const { currentWorkspace } = useWorkspace();
  const { audits, experiments, variants, loading, createExperiment, updateExperimentStatus, declareWinner, refetch } = useCRO();
  
  const [showExperimentDialog, setShowExperimentDialog] = useState(false);
  const [experimentForm, setExperimentForm] = useState({
    name: "",
    hypothesis: "",
    page_url: "",
    test_type: "ab",
  });
  const [submitting, setSubmitting] = useState(false);
 
  const handleViewAudit = (auditId: string) => {
    toast.info(t("common.comingSoon"));
  };

  const handleDeclareWinner = async (experimentId: string, variantId: string) => {
    const { error } = await declareWinner(experimentId, variantId);
    if (error) {
      toast.error(t("croPage.declareWinnerError"));
    } else {
      toast.success(t("croPage.declareWinnerSuccess"));
    }
  };

  const handleOpenSuggestion = (suggestionId: string) => {
    toast.info(t("common.comingSoon"));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    toast.info(t("common.comingSoon"));
  };

  const handleCreateTaskFromSuggestion = (suggestionId: string) => {
    toast.info(t("common.comingSoon"));
  };

  const handleCreateExperimentFromSuggestion = (suggestionId: string) => {
    toast.info(t("common.comingSoon"));
  };

  const handleCreateAudit = () => {
    toast.info(t("common.comingSoon"));
  };

  const handleAISuggestions = () => {
    toast.info(t("common.comingSoon"));
  };

  const handleRealtimeUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useRealtimeSubscription(
    `cro-experiments-${currentWorkspace?.id}`,
    {
      table: 'experiments',
      filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
    },
    handleRealtimeUpdate,
    !!currentWorkspace?.id
  );

  useRealtimeSubscription(
    `cro-variants-${currentWorkspace?.id}`,
    {
      table: 'experiment_variants',
      filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
    },
    handleRealtimeUpdate,
    !!currentWorkspace?.id
  );

  const conversionMetrics = [
    { label: t("croPage.conversionRate"), value: experiments.length > 0 ? `${(variants.reduce((a, v) => a + (v.conversion_rate || 0), 0) / Math.max(variants.length, 1)).toFixed(1)}%` : "—", change: "", trend: "up" },
    { label: t("croPage.visitors"), value: variants.reduce((a, v) => a + (v.visitors || 0), 0).toLocaleString() || "0", change: "", trend: "up" },
    { label: t("croPage.conversions"), value: variants.reduce((a, v) => a + (v.conversions || 0), 0).toString(), change: "", trend: "up" },
    { label: t("croPage.activeTests"), value: experiments.filter(e => e.status === 'running').length.toString(), change: "", trend: "up" },
  ];

  const pageAudits = audits.map(a => ({
    page: a.page_type || "Page",
    url: "/",
    frictionScore: a.friction_score || 50,
    issues: (a.findings as unknown[])?.length || 0,
    opportunities: (a.recommendations as unknown[])?.length || 0,
    status: (a.friction_score || 50) < 40 ? "optimized" : (a.friction_score || 50) < 60 ? "in_progress" : "needs_work",
  }));

  const displayExperiments = experiments.map(exp => {
    const expVariants = variants.filter(v => v.experiment_id === exp.id);
    const controlVariant = expVariants.find(v => v.is_control);
    const testVariant = expVariants.find(v => !v.is_control);
    const confidence = controlVariant && testVariant
      ? calculateConfidence(controlVariant.visitors || 0, controlVariant.conversions || 0, testVariant.visitors || 0, testVariant.conversions || 0)
      : 0;
    const rateA = controlVariant?.conversion_rate || 0;
    const rateB = testVariant?.conversion_rate || 0;
    const uplift = calculateUplift(rateA, rateB);
    const recommendation = getTestRecommendation(confidence, rateA, rateB);
    return {
      id: exp.id, name: exp.name, page: exp.page_url || "Page", status: exp.status || "draft",
      variants: expVariants.length, visitors: expVariants.reduce((a, v) => a + (v.visitors || 0), 0),
      conversionA: rateA, conversionB: rateB, confidence, uplift, recommendation,
      winner: exp.winner_variant_id ? "B" : undefined,
    };
  });

  const croBacklog = audits.flatMap(a => 
    (a.recommendations as Array<{ title?: string; impact?: number; effort?: string; status?: string }> || []).map((rec, i) => ({
      task: rec.title || `${t("seoPage.recommendation")} ${i + 1}`,
      impact: rec.impact || 50,
      effort: rec.effort || t("seoPage.medium"),
      status: rec.status || "todo",
    }))
  ).slice(0, 10);

  const handleCreateExperiment = async () => {
    if (!experimentForm.name) {
      toast.error(t("croPage.experimentNameRequired"));
      return;
    }
    setSubmitting(true);
    const { error } = await createExperiment(experimentForm);
    setSubmitting(false);
    if (error) {
      toast.error(t("croPage.createError"));
    } else {
      toast.success(t("croPage.experimentCreated"));
      setShowExperimentDialog(false);
      setExperimentForm({ name: "", hypothesis: "", page_url: "", test_type: "ab" });
    }
  };

  const handleToggleExperiment = async (experimentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "running" ? "paused" : "running";
    const { error } = await updateExperimentStatus(experimentId, newStatus);
    if (error) {
      toast.error(t("croPage.updateError"));
    } else {
      toast.success(newStatus === "running" ? t("croPage.testStarted") : t("croPage.testPaused"));
    }
  };

  if (loading) {
    return <LoadingState message={t("croPage.loadingCRO")} />;
  }

  if (!currentSite) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("croPage.title")}</h1>
          <p className="text-muted-foreground">{t("croPage.subtitle")}</p>
        </div>
        <NoSiteEmptyState moduleName="CRO" icon={Target} />
      </div>
    );
  }

  const hasData = experiments.length > 0 || audits.length > 0;
  if (!hasData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {t("croPage.title")}
              <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
            </h1>
            <p className="text-muted-foreground">{t("croPage.subtitle")}</p>
          </div>
        </div>
        <ModuleEmptyState
          icon={Target}
          moduleName="CRO"
          description={t("croPage.emptyDescription")}
          features={[t("croPage.emptyFeature1"), t("croPage.emptyFeature2"), t("croPage.emptyFeature3"), t("croPage.emptyFeature4")]}
          primaryAction={{
            label: t("croPage.createABTest"),
            onClick: () => setShowExperimentDialog(true),
            icon: Plus,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {t("croPage.title")}
            <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
          </h1>
          <p className="text-muted-foreground">{t("croPage.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t("croPage.croReport")}
          </Button>
          <Button variant="hero" onClick={() => setShowExperimentDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("croPage.newTest")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {conversionMetrics.map((metric, i) => (
          <Card key={i} variant="kpi">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold mt-1">{metric.value}</p>
              {metric.change && (
                <p className={`text-xs mt-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-destructive'}`}>
                  {metric.change} {t("croPage.thisMonth")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="experiments" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="experiments">{t("croPage.experimentsTab")}</TabsTrigger>
          <TabsTrigger value="suggestions">{t("croPage.suggestionsTab")}</TabsTrigger>
          <TabsTrigger value="audits">{t("croPage.auditsTab")}</TabsTrigger>
          <TabsTrigger value="backlog">{t("croPage.backlogTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("croPage.abTests")}</CardTitle>
                  <CardDescription>{t("croPage.testsResults")}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowExperimentDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("croPage.newTest")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayExperiments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("croPage.noExperiments")}</p>
              ) : (
                displayExperiments.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{exp.name}</p>
                          <Badge variant={exp.status === "running" ? "gradient" : exp.status === "completed" ? "secondary" : "outline"}>
                            {exp.status === "running" ? t("croPage.running")
                              : exp.status === "completed" ? t("croPage.completed")
                              : exp.status === "paused" ? t("croPage.paused")
                              : t("croPage.draftStatus")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.page}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exp.winner && (
                          <Badge variant="gradient">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t("croPage.winner")}: {exp.winner}
                          </Badge>
                        )}
                        {exp.status !== "completed" && (
                          <Button variant="ghost" size="sm" onClick={() => handleToggleExperiment(exp.id, exp.status)}>
                            {exp.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    {exp.status !== "draft" && (
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("croPage.visitors")}</p>
                          <p className="font-medium">{exp.visitors.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Conv. A</p>
                          <p className="font-medium">{exp.conversionA}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Conv. B</p>
                          <p className={`font-medium ${exp.conversionB > exp.conversionA ? 'text-green-500' : ''}`}>{exp.conversionB}%</p>
                        </div>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {t("croPage.confidence")} <Info className="w-3 h-3" />
                                  </p>
                                  <p className={`font-medium ${exp.confidence >= 95 ? 'text-green-500' : exp.confidence >= 80 ? 'text-amber-500' : ''}`}>{exp.confidence}%</p>
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

        <TabsContent value="suggestions" className="space-y-6">
          {currentWorkspace?.id ? (
            <CROSuggestionsAI workspaceId={currentWorkspace.id} pageUrl={currentSite?.url || ""} />
          ) : (
            <Card variant="feature">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">{t("croPage.selectWorkspace")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("croPage.keyPageAudit")}</CardTitle>
                  <CardDescription>{t("croPage.frictionScoreOpportunities")}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("croPage.auditPage")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pageAudits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("croPage.noAudits")}</p>
              ) : (
                pageAudits.map((audit, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{audit.page}</p>
                        <Badge variant={audit.status === "optimized" ? "gradient" : audit.status === "in_progress" ? "secondary" : "destructive"}>
                          {audit.status === "optimized" ? t("croPage.optimized")
                            : audit.status === "in_progress" ? t("croPage.inProgress")
                            : t("croPage.needsWork")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{audit.url}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t("croPage.friction")}</span>
                        <Progress value={100 - audit.frictionScore} className="w-20 h-2" />
                      </div>
                      <p className={`text-sm font-medium ${audit.frictionScore > 50 ? 'text-destructive' : 'text-primary'}`}>{audit.frictionScore}/100</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t("croPage.issues")}</p>
                      <p className="font-medium">{audit.issues}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t("croPage.opportunitiesLabel")}</p>
                      <p className="font-medium text-primary">{audit.opportunities}</p>
                    </div>
                    <Button variant="ghost" size="sm"><ArrowRight className="w-4 h-4" /></Button>
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
                  <CardTitle>{t("croPage.backlogTitle")}</CardTitle>
                  <CardDescription>{t("croPage.backlogDesc")}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("croPage.aiSuggestions")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {croBacklog.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("croPage.noBacklog")}</p>
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
                    <div className="flex-1 min-w-0"><p className="font-medium">{item.task}</p></div>
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

      <Dialog open={showExperimentDialog} onOpenChange={setShowExperimentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("croPage.newExperiment")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("croPage.testName")}</label>
              <Input placeholder={t("croPage.testNamePlaceholder")} value={experimentForm.name} onChange={(e) => setExperimentForm({ ...experimentForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("croPage.hypothesis")}</label>
              <Textarea placeholder={t("croPage.hypothesisPlaceholder")} value={experimentForm.hypothesis} onChange={(e) => setExperimentForm({ ...experimentForm, hypothesis: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("croPage.pageUrl")}</label>
              <Input placeholder={t("croPage.pageUrlPlaceholder")} value={experimentForm.page_url} onChange={(e) => setExperimentForm({ ...experimentForm, page_url: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExperimentDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateExperiment} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

