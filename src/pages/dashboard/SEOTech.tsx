import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Play,
  Download,
  FileText,
  Loader2,
  Shield,
  Eye,
  History,
  TrendingUp,
  AlertCircle,
  Info,
  Zap,
  Target,
  ExternalLink,
} from "lucide-react";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types for SEO Audit
interface SEOIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  recommendation: string;
  effort: "low" | "medium" | "high";
}

interface SEOOpportunity {
  title: string;
  potential_impact: string;
  effort: "low" | "medium" | "high";
}

interface SEOActionItem {
  priority: number;
  action: string;
  estimated_time: string;
  impact: string;
}

interface SEOMetrics {
  estimated_page_speed: "fast" | "medium" | "slow";
  mobile_friendly: boolean;
  https_status: boolean;
  indexation_risk: "low" | "medium" | "high";
}

interface SEOAuditResult {
  summary: string;
  generated_at: string;
  site_url: string;
  site_name: string;
  score: number;
  issues: SEOIssue[];
  opportunities: SEOOpportunity[];
  action_plan: SEOActionItem[];
  metrics: SEOMetrics;
  error?: string;
}

interface AuditHistoryItem {
  id: string;
  run_type: string;
  status: string;
  outputs: SEOAuditResult;
  created_at: string;
  completed_at: string;
}

export default function SEOTech() {
  const { currentSite } = useSites();
  const { currentWorkspace } = useWorkspace();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOAuditResult | null>(null);
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<SEOIssue | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AuditHistoryItem | null>(null);

  // Load audit history
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadHistory();
    }
  }, [currentWorkspace?.id, currentSite?.id]);

  const loadHistory = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoadingHistory(true);
    try {
      // Fetch audit history from executive_runs
      const { data, error } = await supabase
        .from("executive_runs")
        .select("id, run_type, status, outputs, created_at, completed_at, inputs")
        .eq("workspace_id", currentWorkspace.id)
        .eq("run_type", "SEO_TECH_AUDIT")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const historyItems: AuditHistoryItem[] = (data || [])
        .filter((item) => item.outputs)
        .map((item) => ({
          id: item.id,
          run_type: item.run_type,
          status: item.status,
          outputs: item.outputs as unknown as SEOAuditResult,
          created_at: item.created_at,
          completed_at: item.completed_at || item.created_at,
        }));
      
      setHistory(historyItems);
      
      // Load the most recent completed audit as current result
      const lastCompleted = historyItems.find(h => h.status === "done" && h.outputs?.score);
      if (lastCompleted) {
        setResult(lastCompleted.outputs);
      }
    } catch (err) {
      console.error("Failed to load audit history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Run new audit
  const runAudit = async () => {
    if (!currentWorkspace?.id || !currentSite?.id) {
      toast.error("Veuillez sélectionner un site");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("run-executor", {
        body: {
          run_type: "SEO_TECH_AUDIT",
          workspace_id: currentWorkspace.id,
          site_id: currentSite.id,
        },
      });
      
      if (error) throw error;
      
      if (data?.outputs) {
        setResult(data.outputs as SEOAuditResult);
        await loadHistory();
        toast.success("Audit SEO terminé !");
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Audit error:", err);
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'audit");
    } finally {
      setLoading(false);
    }
  };

  // Export results
  const exportResults = (format: "json" | "csv") => {
    if (!result) return;
    
    if (format === "json") {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seo-audit-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ["ID", "Sévérité", "Catégorie", "Titre", "Description", "Effort"];
      const rows = result.issues.map((i) => [
        i.id,
        i.severity,
        i.category,
        i.title,
        i.description.replace(/,/g, ";"),
        i.effort,
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seo-audit-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // View historical audit
  const viewHistoricalAudit = (item: AuditHistoryItem) => {
    setSelectedHistoryItem(item);
    if (item.outputs) {
      setResult(item.outputs);
    }
    setShowHistoryDialog(false);
  };

  // Severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Effort badge
  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case "low":
        return <Badge variant="success" className="text-xs">Facile</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-xs">Moyen</Badge>;
      case "high":
        return <Badge variant="destructive" className="text-xs">Complexe</Badge>;
      default:
        return null;
    }
  };

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-3";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">SEO Technique</h1>
          <p className="text-muted-foreground">
            Audit technique et optimisations du site
          </p>
          {!currentSite && (
            <p className="text-sm text-warning mt-1">
              ⚠️ Veuillez sélectionner un site pour lancer l'audit
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowHistoryDialog(true)}
            disabled={history.length === 0}
          >
            <History className="w-4 h-4 mr-2" />
            Historique ({history.length})
          </Button>
          {result && (
            <Button variant="outline" onClick={() => exportResults("json")}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Main CTA - Launch Audit */}
      {!loading && !result && currentSite && (
        <Card variant="gradient" className="border-2 border-primary/20">
          <CardContent className="py-12 text-center">
            <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-6">
              <Target className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Lancer l'audit SEO de {currentSite.name || currentSite.url}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Analysez votre site pour détecter les problèmes SEO techniques et obtenir un plan d'action prioritaire.
            </p>
            <Button variant="hero" size="lg" onClick={runAudit}>
              <Play className="w-5 h-5 mr-2" />
              Lancer l'audit SEO
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Durée estimée : 30-60 secondes
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Site Selected */}
      {!currentSite && (
        <Card variant="feature">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-warning" />
            <h3 className="text-lg font-medium mb-2">Aucun site sélectionné</h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez un site dans la section "Sites" pour lancer un audit SEO.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State - Skeleton */}
      {loading && (
        <div className="space-y-6">
          <Card variant="gradient">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Analyse SEO en cours...</p>
              <p className="text-sm text-muted-foreground">
                L'IA analyse {currentSite?.name || currentSite?.url}
              </p>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          
          <Skeleton className="h-80" />
        </div>
      )}

      {/* Results */}
      {!loading && result && !result.error && (
        <>
          {/* Re-run button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Dernière analyse : {format(new Date(result.generated_at), "PPp", { locale: fr })}
            </div>
            <Button variant="outline" onClick={runAudit} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Relancer l'audit
            </Button>
          </div>

          {/* Score + Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            {/* Score Card */}
            <Card variant="gradient" className="md:row-span-2">
              <CardContent className="pt-6 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      strokeWidth="12"
                      fill="none"
                      className="stroke-background/30"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${result.score * 3.52} 352`}
                      className="stroke-primary-foreground transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </span>
                  </div>
                </div>
                <p className="font-medium text-lg">Score SEO</p>
                <p className="text-sm opacity-80">{result.issues.length} problèmes détectés</p>
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card variant="feature">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${result.metrics.estimated_page_speed === "fast" ? "bg-chart-3/10" : result.metrics.estimated_page_speed === "medium" ? "bg-warning/10" : "bg-destructive/10"}`}>
                    <Zap className={`w-5 h-5 ${result.metrics.estimated_page_speed === "fast" ? "text-chart-3" : result.metrics.estimated_page_speed === "medium" ? "text-warning" : "text-destructive"}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vitesse</p>
                    <p className="font-medium capitalize">{result.metrics.estimated_page_speed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="feature">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${result.metrics.mobile_friendly ? "bg-chart-3/10" : "bg-destructive/10"}`}>
                    <CheckCircle2 className={`w-5 h-5 ${result.metrics.mobile_friendly ? "text-chart-3" : "text-destructive"}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{result.metrics.mobile_friendly ? "Compatible" : "Problèmes"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="feature">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${result.metrics.https_status ? "bg-chart-3/10" : "bg-destructive/10"}`}>
                    <Shield className={`w-5 h-5 ${result.metrics.https_status ? "text-chart-3" : "text-destructive"}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HTTPS</p>
                    <p className="font-medium">{result.metrics.https_status ? "Sécurisé" : "Non sécurisé"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="feature">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${result.metrics.indexation_risk === "low" ? "bg-chart-3/10" : result.metrics.indexation_risk === "medium" ? "bg-warning/10" : "bg-destructive/10"}`}>
                    <TrendingUp className={`w-5 h-5 ${result.metrics.indexation_risk === "low" ? "text-chart-3" : result.metrics.indexation_risk === "medium" ? "text-warning" : "text-destructive"}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Indexation</p>
                    <p className="font-medium capitalize">Risque {result.metrics.indexation_risk === "low" ? "faible" : result.metrics.indexation_risk === "medium" ? "moyen" : "élevé"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues */}
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Problèmes détectés</CardTitle>
              <CardDescription>
                {result.issues.length} problèmes à résoudre, triés par sévérité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">
                    Tous ({result.issues.length})
                  </TabsTrigger>
                  <TabsTrigger value="critical">
                    Critiques ({result.issues.filter((i) => i.severity === "critical").length})
                  </TabsTrigger>
                  <TabsTrigger value="warning">
                    Warnings ({result.issues.filter((i) => i.severity === "warning").length})
                  </TabsTrigger>
                </TabsList>

                {["all", "critical", "warning"].map((tabValue) => (
                  <TabsContent key={tabValue} value={tabValue} className="mt-4 space-y-3">
                    {result.issues
                      .filter((i) => tabValue === "all" || i.severity === tabValue)
                      .map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{issue.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {issue.category.replace(/_/g, " ")}
                              </Badge>
                              {getEffortBadge(issue.effort)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {issue.description}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        </div>
                      ))}
                    {result.issues.filter((i) => tabValue === "all" || i.severity === tabValue).length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        Aucun problème dans cette catégorie
                      </p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Plan d'action prioritaire</CardTitle>
              <CardDescription>
                Actions recommandées classées par priorité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.action_plan.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{action.priority}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{action.action}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {action.estimated_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {action.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Opportunités d'amélioration</CardTitle>
              <CardDescription>
                Actions optionnelles pour aller plus loin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.opportunities.map((opp, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-chart-3/5 border-chart-3/20">
                    <h4 className="font-medium mb-2">{opp.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{opp.potential_impact}</p>
                    {getEffortBadge(opp.effort)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIssue && getSeverityIcon(selectedIssue.severity)}
              {selectedIssue?.title}
            </DialogTitle>
            <DialogDescription>
              Catégorie : {selectedIssue?.category.replace(/_/g, " ")}
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedIssue.description}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Recommandation</h4>
                <p className="text-muted-foreground">{selectedIssue.recommendation}</p>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Effort estimé :</span>
                {getEffortBadge(selectedIssue.effort)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historique des audits</DialogTitle>
            <DialogDescription>
              Consultez vos audits SEO précédents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => viewHistoricalAudit(item)}
              >
                <div>
                  <p className="font-medium">
                    Audit du {format(new Date(item.created_at), "PPp", { locale: fr })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Score : {item.outputs?.score || "N/A"}/100 • {item.outputs?.issues?.length || 0} problèmes
                  </p>
                </div>
                <Badge variant={item.status === "done" ? "success" : "secondary"}>
                  {item.status === "done" ? "Terminé" : item.status}
                </Badge>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun audit précédent
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
