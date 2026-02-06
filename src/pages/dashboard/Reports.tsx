import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, TrendingUp, TrendingDown, Bot, Calendar, Loader2, Clock, BarChart3, Settings2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { toast } from "sonner";
import { ReportScheduler } from "@/components/reports/ReportScheduler";
import { ModuleEmptyState, NoSiteEmptyState } from "@/components/ui/module-empty-state";

export default function Reports() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");

  const { data: reports, isLoading: reportsLoading, refetch } = useQuery({
    queryKey: ['monthly-reports', currentWorkspace?.id, currentSite?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id || !currentSite?.id) return [];
      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('site_id', currentSite.id)
        .order('month', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id && !!currentSite?.id,
  });

  const { data: auditTrail, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-trail', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data, error } = await supabase
        .from('action_log')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('actor_type', 'agent')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const { data: kpiTrend } = useQuery({
    queryKey: ['kpi-trend', currentWorkspace?.id, currentSite?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id || !currentSite?.id) return null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: current } = await supabase
        .from('kpis_daily')
        .select('total_conversions, organic_clicks, organic_impressions')
        .eq('site_id', currentSite.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      const { data: previous } = await supabase
        .from('kpis_daily')
        .select('total_conversions, organic_clicks, organic_impressions')
        .eq('site_id', currentSite.id)
        .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
        .lt('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      const currentConversions = (current || []).reduce((sum, k) => sum + (k.total_conversions || 0), 0);
      const previousConversions = (previous || []).reduce((sum, k) => sum + (k.total_conversions || 0), 0);
      const currentClicks = (current || []).reduce((sum, k) => sum + (k.organic_clicks || 0), 0);
      const previousClicks = (previous || []).reduce((sum, k) => sum + (k.organic_clicks || 0), 0);
      const currentImpressions = (current || []).reduce((sum, k) => sum + (k.organic_impressions || 0), 0);
      const previousImpressions = (previous || []).reduce((sum, k) => sum + (k.organic_impressions || 0), 0);
      
      return {
        conversions: {
          current: currentConversions,
          previous: previousConversions,
          change: previousConversions > 0 ? ((currentConversions - previousConversions) / previousConversions * 100).toFixed(0) : '0',
        },
        clicks: {
          current: currentClicks,
          previous: previousClicks,
          change: previousClicks > 0 ? ((currentClicks - previousClicks) / previousClicks * 100).toFixed(0) : '0',
        },
        impressions: {
          current: currentImpressions,
          previous: previousImpressions,
          change: previousImpressions > 0 ? ((currentImpressions - previousImpressions) / previousImpressions * 100).toFixed(0) : '0',
        },
      };
    },
    enabled: !!currentWorkspace?.id && !!currentSite?.id,
  });

  const handleGenerateReport = async (retryCount = 0) => {
    if (!currentWorkspace?.id || !currentSite?.id) {
      toast.error(t("modules.reports.selectSite"));
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { workspace_id: currentWorkspace.id, site_id: currentSite.id },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(t("modules.reports.reportGenerated"), {
          action: data.url ? { label: t("modules.reports.download"), onClick: () => window.open(data.url, '_blank') } : undefined,
        });
        refetch();
      } else {
        throw new Error(data?.error || t("modules.reports.unknownError"));
      }
    } catch (err) {
      console.error('Report generation error:', err);
      if (retryCount < 2) {
        toast.info(t("modules.reports.retrying", { count: retryCount + 1 }));
        setTimeout(() => handleGenerateReport(retryCount + 1), 2000);
        return;
      }
      toast.error(t("modules.reports.generationFailed"));
    } finally {
      if (retryCount >= 2 || retryCount === 0) {
        setGenerating(false);
      }
    }
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return t("modules.reports.timeAgo.lessThanHour");
    if (diffHours < 24) return t("modules.reports.timeAgo.hoursAgo", { n: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return t("modules.reports.timeAgo.yesterday");
    return t("modules.reports.timeAgo.daysAgo", { n: diffDays });
  };

  const TrendIndicator = ({ change }: { change: string }) => {
    const num = Number(change);
    if (num === 0) return <span className="text-muted-foreground">—</span>;
    return (
      <span className={`flex items-center gap-1 ${num > 0 ? 'text-chart-3' : 'text-destructive'}`}>
        {num > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {num > 0 ? '+' : ''}{change}%
      </span>
    );
  };

  if (!currentSite) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("modules.reports.title")}</h1>
            <p className="text-muted-foreground">{t("modules.reports.subtitle")}</p>
          </div>
        </div>
        <NoSiteEmptyState moduleName={t("nav.reports")} icon={FileText} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("modules.reports.title")}</h1>
            <p className="text-muted-foreground">{t("modules.reports.subtitle")}</p>
          </div>
        </div>
        <Button variant="hero" onClick={() => handleGenerateReport()} disabled={generating || !currentSite}>
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          {t("modules.reports.generatePDFReport")}
        </Button>
      </div>

      {kpiTrend && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card variant="kpi">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("modules.reports.kpi.conversions")}</p>
                  <p className="text-2xl font-bold">{kpiTrend.conversions.current}</p>
                </div>
                <TrendIndicator change={kpiTrend.conversions.change} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t("modules.reports.prevPeriod", { val: kpiTrend.conversions.previous })}
              </p>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("modules.reports.kpi.organicClicks")}</p>
                  <p className="text-2xl font-bold">{kpiTrend.clicks.current.toLocaleString()}</p>
                </div>
                <TrendIndicator change={kpiTrend.clicks.change} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t("modules.reports.prevPeriod", { val: kpiTrend.clicks.previous.toLocaleString() })}
              </p>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("modules.reports.kpi.impressionsLabel")}</p>
                  <p className="text-2xl font-bold">{(kpiTrend.impressions.current / 1000).toFixed(1)}K</p>
                </div>
                <TrendIndicator change={kpiTrend.impressions.change} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t("modules.reports.prevPeriod", { val: `${(kpiTrend.impressions.previous / 1000).toFixed(1)}K` })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="reports">{t("modules.reports.tabs.reports")}</TabsTrigger>
          <TabsTrigger value="audit">{t("modules.reports.tabs.audit")}</TabsTrigger>
          <TabsTrigger value="comparison">{t("modules.reports.tabs.comparison")}</TabsTrigger>
          <TabsTrigger value="scheduled">
            <Settings2 className="w-4 h-4 mr-1" />
            {t("modules.reports.tabs.scheduled")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t("modules.reports.monthlyReports")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : reports && reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <span className="font-medium capitalize">{formatMonth(report.month)}</span>
                        <p className="text-xs text-muted-foreground">
                          {t("modules.reports.generatedOn", { date: new Date(report.created_at).toLocaleDateString(locale) })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="gradient">{t("modules.reports.ready")}</Badge>
                      {report.pdf_url && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(report.pdf_url, '_blank')}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">{t("modules.reports.noReportsAvailable")}</p>
                  <p className="text-sm mt-1">{t("modules.reports.generateFirstReport")}</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleGenerateReport()}>
                    <Download className="w-4 h-4 mr-2" />
                    {t("modules.reports.generateNow")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                {t("modules.reports.aiActionHistory")}
              </CardTitle>
              <CardDescription>{t("modules.reports.aiActionHistoryDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : auditTrail && auditTrail.length > 0 ? (
                auditTrail.map((action) => (
                  <div key={action.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{action.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{action.action_type}</Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(action.created_at)}</span>
                      </div>
                    </div>
                    <Badge variant={action.result === 'success' ? 'success' : action.result === 'error' ? 'destructive' : 'secondary'}>
                      {action.result || 'pending'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">{t("modules.reports.noActionsRecorded")}</p>
                  <p className="text-sm mt-1">{t("modules.reports.aiActionsWillAppear")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t("modules.reports.periodComparison")}
              </CardTitle>
              <CardDescription>{t("modules.reports.periodComparisonDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {kpiTrend ? (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">{t("modules.reports.kpi.conversions")}</span>
                        <TrendIndicator change={kpiTrend.conversions.change} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("modules.reports.thisMonth")}</span>
                          <span className="font-medium">{kpiTrend.conversions.current}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("modules.reports.prevMonth")}</span>
                          <span>{kpiTrend.conversions.previous}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">{t("modules.reports.kpi.organicClicks")}</span>
                        <TrendIndicator change={kpiTrend.clicks.change} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("modules.reports.thisMonth")}</span>
                          <span className="font-medium">{kpiTrend.clicks.current.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("modules.reports.prevMonth")}</span>
                          <span>{kpiTrend.clicks.previous.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">{t("modules.reports.kpi.impressionsLabel")}</span>
                        <TrendIndicator change={kpiTrend.impressions.change} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("modules.reports.thisMonth")}</span>
                          <span className="font-medium">{(kpiTrend.impressions.current / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("modules.reports.prevMonth")}</span>
                          <span>{(kpiTrend.impressions.previous / 1000).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">{t("modules.reports.insufficientData")}</p>
                  <p className="text-sm mt-1">{t("modules.reports.connectDataSources")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <ReportScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
}
