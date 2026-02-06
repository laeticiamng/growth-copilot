import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
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
  Users,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  Link,
  Eye,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Trash2,
  Loader2,
  ExternalLink,
  Download,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useCompetitors } from "@/hooks/useCompetitors";
import { useSites } from "@/hooks/useSites";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
import { ModuleEmptyState, NoSiteEmptyState } from "@/components/ui/module-empty-state";

export default function Competitors() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { currentSite } = useSites();
  const { competitors, loading, addCompetitor, removeCompetitor, analyzeCompetitor, refetch } = useCompetitors();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSWOTDialog, setShowSWOTDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [competitorForm, setCompetitorForm] = useState({ url: "", name: "" });
  const [swotData, setSWOTData] = useState({
    strengths: [] as string[],
    weaknesses: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[],
  });
  const [alertSettings, setAlertSettings] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatingSWOT, setGeneratingSWOT] = useState(false);

  // Real data only - no demo fallback (Zero Fake Data policy)
  const displayCompetitors = competitors.map(c => ({
    id: c.id,
    name: c.competitor_name || t("modules.competitors.competitor"),
    url: c.competitor_url,
    lastAnalyzed: c.last_analyzed_at ? new Date(c.last_analyzed_at).toLocaleDateString(locale) : "—",
    domainAuthority: (c.insights as Record<string, number>)?.domain_authority || 0,
    organicKeywords: (c.keyword_gaps as unknown[])?.length || 0,
    traffic: "—",
    trend: "up" as const,
  }));

  // Real keyword gaps from database
  const keywordGaps = competitors.length > 0 
    ? (competitors[0]?.keyword_gaps as Array<{keyword: string; competitor_rank: number; your_rank: number; volume: number; difficulty: number}>) || []
    : [];

  // Real content gaps from database
  const contentGaps = competitors.length > 0
    ? (competitors[0]?.content_gaps as Array<{topic: string; competitors: number; you_have: boolean; priority: string}>) || []
    : [];

  const handleAddCompetitor = async () => {
    if (!competitorForm.url) {
      toast.error(t("modules.competitors.competitorUrlRequired"));
      return;
    }
    
    try {
      new URL(competitorForm.url.startsWith('http') ? competitorForm.url : `https://${competitorForm.url}`);
    } catch {
      toast.error(t("modules.competitors.invalidUrl"));
      return;
    }
    
    setSubmitting(true);
    const url = competitorForm.url.startsWith('http') ? competitorForm.url : `https://${competitorForm.url}`;
    const { error } = await addCompetitor(url, competitorForm.name);
    setSubmitting(false);
    
    if (error) {
      toast.error(t("modules.competitors.addError"));
    } else {
      toast.success(t("modules.competitors.competitorAdded"));
      setShowAddDialog(false);
      setCompetitorForm({ url: "", name: "" });
    }
  };

  const handleAnalyze = async (competitorId: string) => {
    setAnalyzingId(competitorId);
    const { error } = await analyzeCompetitor(competitorId);
    setAnalyzingId(null);
    
    if (error) {
      toast.error(t("modules.competitors.analysisError"));
    } else {
      toast.success(t("modules.competitors.analysisLaunched"));
    }
  };

  const handleRemove = async (competitorId: string) => {
    const { error } = await removeCompetitor(competitorId);
    if (error) {
      toast.error(t("modules.competitors.deleteError"));
    } else {
      toast.success(t("modules.competitors.competitorDeleted"));
    }
  };

  const handleGenerateSWOT = async () => {
    if (competitors.length === 0) {
      toast.error(t("modules.competitors.addAtLeastOne"));
      return;
    }
    
    setGeneratingSWOT(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];
    
    competitors.forEach(comp => {
      const insights = comp.insights as Record<string, unknown> | null;
      if (insights?.domain_authority && (insights.domain_authority as number) > 40) {
        threats.push(t("modules.competitors.highDA", { name: comp.competitor_name || t("modules.competitors.competitor"), da: insights.domain_authority }));
      }
      if (comp.keyword_gaps && (comp.keyword_gaps as unknown[]).length > 0) {
        opportunities.push(t("modules.competitors.unusedKeywords", { count: (comp.keyword_gaps as unknown[]).length }));
      }
      if (comp.content_gaps && (comp.content_gaps as unknown[]).length > 0) {
        opportunities.push(t("modules.competitors.contentTopicsToCreate", { count: (comp.content_gaps as unknown[]).length }));
      }
    });
    
    if (currentSite) {
      strengths.push(t("modules.competitors.localMarketKnowledge"));
      weaknesses.push(t("modules.competitors.seoVisibilityToImprove"));
    }
    
    setSWOTData({ strengths, weaknesses, opportunities, threats });
    setGeneratingSWOT(false);
    setShowSWOTDialog(true);
  };

  const handleExportSWOT = () => {
    const content = `# ${t("modules.competitors.swotTitle")}
${t("modules.competitors.generatedOn", { date: new Date().toLocaleDateString(locale) })}

## ${t("modules.competitors.swotStrengths")}
${swotData.strengths.map(s => `- ${s}`).join('\n') || `- ${t("modules.competitors.noneIdentified")}`}

## ${t("modules.competitors.swotWeaknesses")}
${swotData.weaknesses.map(w => `- ${w}`).join('\n') || `- ${t("modules.competitors.noneIdentified")}`}

## ${t("modules.competitors.swotOpportunities")}
${swotData.opportunities.map(o => `- ${o}`).join('\n') || `- ${t("modules.competitors.noneIdentified")}`}

## ${t("modules.competitors.swotThreats")}
${swotData.threats.map(item => `- ${item}`).join('\n') || `- ${t("modules.competitors.noneIdentified")}`}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swot-analysis-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("modules.competitors.swotExported"));
  };

  const toggleAlert = (competitorId: string) => {
    setAlertSettings(prev => ({
      ...prev,
      [competitorId]: !prev[competitorId],
    }));
    toast.success(alertSettings[competitorId] ? t("modules.competitors.alertsDisabled") : t("modules.competitors.alertsEnabled"));
  };

  if (loading) {
    return <LoadingState message={t("modules.competitors.loadingCompetitors")} />;
  }

  if (!currentSite) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.competitors.title")}</h1>
          <p className="text-muted-foreground">{t("modules.competitors.subtitle")}</p>
        </div>
        <NoSiteEmptyState moduleName={t("nav.competitors")} icon={Users} />
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.competitors.title")}</h1>
          <p className="text-muted-foreground">{t("modules.competitors.subtitle")}</p>
        </div>
        <ModuleEmptyState
          icon={Users}
          moduleName={t("nav.competitors")}
          description={t("modules.competitors.emptyDesc")}
          features={t("modules.competitors.emptyFeatures").split(",")}
          primaryAction={{
            label: t("modules.competitors.addCompetitor"),
            onClick: () => setShowAddDialog(true),
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
          <h1 className="text-2xl font-bold">{t("modules.competitors.title")}</h1>
          <p className="text-muted-foreground">{t("modules.competitors.subtitle")}</p>
          {!currentSite && <p className="text-sm text-muted-foreground mt-1">{t("modules.competitors.selectSiteWarning")}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleGenerateSWOT} disabled={generatingSWOT || competitors.length === 0}>
            {generatingSWOT ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            SWOT
          </Button>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("modules.competitors.refresh")}
          </Button>
          <Button variant="hero" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("modules.competitors.addCompetitor")}
          </Button>
        </div>
      </div>

      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">{t("modules.competitors.ethicalAnalysis")}</p>
              <p className="text-xs text-muted-foreground">{t("modules.competitors.ethicalAnalysisDesc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCompetitors.map((comp) => (
          <Card key={comp.id} variant="feature">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{comp.name}</h3>
                  <p className="text-sm text-muted-foreground">{comp.url}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleAnalyze(comp.id)} disabled={analyzingId === comp.id}>
                    {analyzingId === comp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  {competitors.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(comp.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">DA</p>
                  <p className="font-bold text-lg">{comp.domainAuthority || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Keywords</p>
                  <p className="font-bold text-lg">{comp.organicKeywords?.toLocaleString() || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("modules.competitors.traffic")}</p>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-lg">{comp.traffic}</p>
                    {comp.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("modules.competitors.analyzed")}</p>
                  <p className="text-sm">{comp.lastAnalyzed}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleAnalyze(comp.id)} disabled={analyzingId === comp.id}>
                {analyzingId === comp.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                {t("modules.competitors.analyze")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keywords">
            <Target className="w-4 h-4 mr-2" />
            {t("modules.competitors.keywordGaps")}
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            {t("modules.competitors.contentGaps")}
          </TabsTrigger>
          <TabsTrigger value="backlinks">
            <Link className="w-4 h-4 mr-2" />
            {t("modules.competitors.backlinks")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("modules.competitors.keywordOpportunities")}</CardTitle>
                  <CardDescription>{t("modules.competitors.keywordOpportunitiesDesc")}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("modules.competitors.generateBriefs")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {keywordGaps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("modules.competitors.addCompetitorsForKeywords")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.ads.keyword")}</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.competitor")}</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.you")}</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.volume")}</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.difficulty")}</th>
                        <th className="text-center py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywordGaps.map((kw, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-secondary/50">
                          <td className="py-3 px-2 font-medium">{kw.keyword}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant="gradient">#{kw.competitor_rank}</Badge>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {kw.your_rank === 0 ? (
                              <Badge variant="outline">—</Badge>
                            ) : (
                              <Badge variant="secondary">#{kw.your_rank}</Badge>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right text-muted-foreground">{kw.volume?.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={kw.difficulty} className="w-12 h-1.5" />
                              <span className="text-xs">{kw.difficulty}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Button variant="ghost" size="sm"><Plus className="w-4 h-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.competitors.contentOpportunities")}</CardTitle>
              <CardDescription>{t("modules.competitors.contentOpportunitiesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contentGaps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("modules.competitors.addCompetitorsForContent")}</p>
              ) : (
                contentGaps.map((gap, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{gap.topic}</p>
                        {gap.you_have ? (
                          <Badge variant="secondary">{t("modules.competitors.youHaveIt")}</Badge>
                        ) : (
                          <Badge variant={gap.priority === "high" ? "destructive" : "outline"}>
                            {gap.priority === "high" ? t("modules.competitors.priority") : t("modules.competitors.medium")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("modules.competitors.competitorsHaveContent", { count: gap.competitors })}
                      </p>
                    </div>
                    {!gap.you_have && (
                      <Button variant="outline" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t("modules.competitors.createBrief")}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlinks" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.competitors.backlinkAnalysis")}</CardTitle>
              <CardDescription>{t("modules.competitors.backlinkAnalysisDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {competitors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">{t("modules.competitors.addCompetitorsForBacklinks")}</p>
                  <p className="text-sm">{t("modules.competitors.compareBacklinks")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.competitor")}</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.referringDomains")}</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.totalBacklinks")}</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.competitors.avgDA")}</th>
                          <th className="text-center py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitors.map(comp => {
                          const backlinkData = comp.backlink_comparison as { referring_domains?: number; total_backlinks?: number; avg_da?: number } | null;
                          return (
                            <tr key={comp.id} className="border-b border-border/50 hover:bg-secondary/50">
                              <td className="py-3 px-2">
                                <div>
                                  <p className="font-medium">{comp.competitor_name || t("modules.competitors.noName")}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{comp.competitor_url}</p>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right font-medium">{backlinkData?.referring_domains?.toLocaleString() || '—'}</td>
                              <td className="py-3 px-2 text-right">{backlinkData?.total_backlinks?.toLocaleString() || '—'}</td>
                              <td className="py-3 px-2 text-right">
                                <Badge variant={backlinkData?.avg_da && backlinkData.avg_da >= 40 ? "success" : "secondary"}>
                                  {backlinkData?.avg_da || '—'}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <Button variant="ghost" size="sm" onClick={() => handleAnalyze(comp.id)} disabled={analyzingId === comp.id}>
                                  {analyzingId === comp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        {t("modules.competitors.linkBuildingOpps")}
                      </h4>
                      <p className="text-sm text-muted-foreground">{t("modules.competitors.linkBuildingDesc")}</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Search className="w-4 h-4 mr-2" />
                        {t("modules.competitors.findOpportunities")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.competitors.addCompetitor")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("modules.competitors.siteUrl")}</label>
              <Input 
                placeholder="https://concurrent.com"
                value={competitorForm.url}
                onChange={(e) => setCompetitorForm({ ...competitorForm, url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("modules.competitors.nameOptional")}</label>
              <Input 
                placeholder="Ex: Concurrent A"
                value={competitorForm.name}
                onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleAddCompetitor} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSWOTDialog} onOpenChange={setShowSWOTDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("modules.competitors.swotTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> {t("modules.competitors.strengths")}
              </h4>
              <ul className="text-sm space-y-1">
                {swotData.strengths.length > 0 ? swotData.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                )) : <li className="text-muted-foreground">{t("modules.competitors.noneIdentified")}</li>}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4" /> {t("modules.competitors.weaknesses")}
              </h4>
              <ul className="text-sm space-y-1">
                {swotData.weaknesses.length > 0 ? swotData.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                )) : <li className="text-muted-foreground">{t("modules.competitors.noneIdentified")}</li>}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {t("modules.competitors.opportunities")}
              </h4>
              <ul className="text-sm space-y-1">
                {swotData.opportunities.length > 0 ? swotData.opportunities.map((o, i) => (
                  <li key={i}>• {o}</li>
                )) : <li className="text-muted-foreground">{t("modules.competitors.noneIdentified")}</li>}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {t("modules.competitors.threats")}
              </h4>
              <ul className="text-sm space-y-1">
                {swotData.threats.length > 0 ? swotData.threats.map((item, i) => (
                  <li key={i}>• {item}</li>
                )) : <li className="text-muted-foreground">{t("modules.competitors.noneIdentified")}</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSWOTDialog(false)}>{t("common.close")}</Button>
            <Button onClick={handleExportSWOT}>
              <Download className="w-4 h-4 mr-2" />
              {t("common.export")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
