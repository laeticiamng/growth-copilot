import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, BarChart3, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { GrowthSignal, getSeverityMeta } from "@/lib/growth-cockpit";

export default function GrowthSignals() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["growth-signals", currentWorkspace?.id, currentSite?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [kpisRes, integrationsRes, evidenceRes] = await Promise.all([
        currentSite?.id
          ? supabase
              .from("kpis_daily")
              .select("date, organic_clicks, total_conversions, avg_position")
              .eq("site_id", currentSite.id)
              .gte("date", sixtyDaysAgo.toISOString().split("T")[0])
              .order("date", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("integrations")
          .select("provider, status, last_sync_at")
          .eq("workspace_id", currentWorkspace.id),
        supabase
          .from("evidence_bundles")
          .select("id, title, created_at, overall_confidence")
          .eq("workspace_id", currentWorkspace.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      return {
        kpis: kpisRes.data ?? [],
        integrations: integrationsRes.data ?? [],
        evidence: evidenceRes.data ?? [],
      };
    },
    enabled: !!currentWorkspace?.id,
  });

  const signals = useMemo<GrowthSignal[]>(() => {
    const kpis = data?.kpis ?? [];
    const recent = kpis.slice(0, 30);
    const previous = kpis.slice(30, 60);

    const recentClicks = recent.reduce((sum, row) => sum + (row.organic_clicks ?? 0), 0);
    const previousClicks = previous.reduce((sum, row) => sum + (row.organic_clicks ?? 0), 0);
    const recentConversions = recent.reduce((sum, row) => sum + (row.total_conversions ?? 0), 0);
    const previousConversions = previous.reduce((sum, row) => sum + (row.total_conversions ?? 0), 0);
    const latestAvgPosition = recent[0]?.avg_position ? Number(recent[0].avg_position).toFixed(1) : "n/a";
    const connectedIntegrations = (data?.integrations ?? []).filter((item) => item.status === "active").length;

    const clickDelta = previousClicks > 0 ? ((recentClicks - previousClicks) / previousClicks) * 100 : 0;
    const conversionDelta = previousConversions > 0 ? ((recentConversions - previousConversions) / previousConversions) * 100 : 0;

    return [
      {
        id: "traffic-shift",
        title: t("growthSignals.trafficMomentumTitle"),
        description: t("growthSignals.trafficMomentumDesc"),
        severity: clickDelta < -10 ? "critical" : clickDelta < 5 ? "warning" : "healthy",
        metric: t("growthSignals.clicksMetric", { count: recentClicks.toLocaleString() }),
        trend: t("growthSignals.vsPreviousWindow", { delta: `${clickDelta >= 0 ? "+" : ""}${clickDelta.toFixed(1)}%` }),
        source: t("growthSignals.sourceSearchConsole"),
        impact: clickDelta < -10 ? t("growthSignals.trafficDropImpact") : t("growthSignals.noTrafficDegradation"),
      },
      {
        id: "conversion-health",
        title: t("growthSignals.conversionEfficiencyTitle"),
        description: t("growthSignals.conversionEfficiencyDesc"),
        severity: conversionDelta < -5 ? "warning" : conversionDelta > 8 ? "healthy" : "warning",
        metric: t("growthSignals.conversionsMetric", { count: recentConversions.toLocaleString() }),
        trend: t("growthSignals.vsPreviousWindow", { delta: `${conversionDelta >= 0 ? "+" : ""}${conversionDelta.toFixed(1)}%` }),
        source: t("growthSignals.sourcePerformanceData"),
        impact: conversionDelta < 0 ? t("growthSignals.funnelFrictionImpact") : t("growthSignals.positiveTrendImpact"),
      },
      {
        id: "ranking-health",
        title: t("growthSignals.searchVisibilityTitle"),
        description: t("growthSignals.searchVisibilityDesc"),
        severity: Number(latestAvgPosition) > 20 ? "warning" : "healthy",
        metric: t("growthSignals.avgPositionMetric", { position: latestAvgPosition }),
        trend: connectedIntegrations > 0 ? t("growthSignals.activeConnectors", { count: connectedIntegrations }) : t("growthSignals.noActiveConnector"),
        source: t("growthSignals.sourceSearchIntegrations"),
        impact: connectedIntegrations > 0 ? t("growthSignals.pipelineReadyImpact") : t("growthSignals.connectSourcesImpact"),
      },
    ];
  }, [data?.integrations, data?.kpis, t]);

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-52" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("growthSignals.title")}</h1>
          <p className="text-muted-foreground">{t("growthSignals.subtitle")}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? t("growthSignals.refreshing") : t("growthSignals.refresh")}
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {signals.map((signal) => {
          const meta = getSeverityMeta(signal.severity);
          const Icon = meta.icon;
          return (
            <Card key={signal.id} className="border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${meta.className}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                </div>
                <CardTitle className="text-xl">{signal.title}</CardTitle>
                <CardDescription className="leading-6">{signal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-secondary/40 p-4">
                  <p className="text-sm text-muted-foreground">{t("growthSignals.metricLabel")}</p>
                  <p className="text-2xl font-semibold">{signal.metric}</p>
                  <p className="text-sm text-muted-foreground mt-1">{signal.trend}</p>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground">{t("growthSignals.sourceLabel")}:</span> {signal.source}</p>
                  <p><span className="font-medium text-foreground">{t("growthSignals.interpretationLabel")}:</span> {signal.impact}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> {t("growthSignals.signalHandlingTitle")}</CardTitle>
            <CardDescription>{t("growthSignals.signalHandlingDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              [t("growthSignals.stepVerify"), t("growthSignals.stepVerifyDesc")],
              [t("growthSignals.stepPrioritize"), t("growthSignals.stepPrioritizeDesc")],
              [t("growthSignals.stepRoute"), t("growthSignals.stepRouteDesc")],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-border/60 p-4">
                <p className="font-medium mb-2">{title}</p>
                <p className="text-sm text-muted-foreground leading-6">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-primary" /> {t("growthSignals.nextStepTitle")}</CardTitle>
            <CardDescription>{t("growthSignals.nextStepDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-6">
              {t("growthSignals.nextStepBody")}
            </p>
            <Link to="/dashboard/actions">
              <Button className="w-full">
                {t("growthSignals.openPrioritizedActions")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
