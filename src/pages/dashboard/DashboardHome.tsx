import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, CheckCircle2, Download, Shield, Sparkles, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovals } from "@/hooks/useApprovals";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useEvidenceBundles } from "@/hooks/useEvidenceBundles";
import { useScheduledRuns } from "@/hooks/useScheduledRuns";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { PredictiveAnalytics } from "@/components/dashboard/PredictiveAnalytics";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { CockpitPDFExport } from "@/components/dashboard/CockpitPDFExport";

export default function DashboardHome() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { pendingApprovals } = useApprovals();
  const { entries } = useAuditLog();
  const { bundles } = useEvidenceBundles();
  const { scheduledRuns } = useScheduledRuns();

  const { data: snapshot, isLoading } = useQuery({
    queryKey: ["dashboard-home-snapshot", currentWorkspace?.id, currentSite?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [integrationRes, kpiRes] = await Promise.all([
        supabase
          .from("integrations")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", currentWorkspace.id)
          .eq("status", "active"),
        currentSite?.id
          ? supabase
              .from("kpis_daily")
              .select("organic_clicks, total_conversions")
              .eq("site_id", currentSite.id)
              .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
          : Promise.resolve({ data: [], error: null }),
      ]);

      return {
        connectedSources: integrationRes.count ?? 0,
        clicks: (kpiRes.data ?? []).reduce((sum, row) => sum + (row.organic_clicks ?? 0), 0),
        conversions: (kpiRes.data ?? []).reduce((sum, row) => sum + (row.total_conversions ?? 0), 0),
      };
    },
    enabled: !!currentWorkspace?.id,
  });

  const summaryCards = useMemo(() => [
    {
      title: t("dashboardHome.connectedSources"),
      value: snapshot?.connectedSources ?? 0,
      helper: t("dashboardHome.connectedSourcesHelper"),
      icon: BarChart3,
    },
    {
      title: t("dashboardHome.pendingApprovals"),
      value: pendingApprovals.length,
      helper: t("dashboardHome.pendingApprovalsHelper"),
      icon: Shield,
    },
    {
      title: t("dashboardHome.evidenceBundles"),
      value: bundles.length,
      helper: t("dashboardHome.evidenceBundlesHelper"),
      icon: Sparkles,
    },
    {
      title: t("dashboardHome.trackedOutcomes"),
      value: snapshot?.conversions ?? 0,
      helper: t("dashboardHome.trackedOutcomesHelper"),
      icon: CheckCircle2,
    },
  ], [bundles.length, pendingApprovals.length, snapshot?.connectedSources, snapshot?.conversions, t]);

  if (!currentWorkspace) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>{t("dashboardHome.createTitle")}</CardTitle>
            <CardDescription>{t("dashboardHome.createDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/onboarding">
              <Button>{t("dashboardHome.startOnboarding")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Badge variant="agent" className="mb-3">{t("dashboardHome.badge")}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold">{t("dashboardHome.title")}</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            {t("dashboardHome.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/signals"><Button variant="hero">{t("dashboardHome.openSignals")}</Button></Link>
          <Link to="/dashboard/actions"><Button variant="outline">{t("dashboardHome.viewActions")}</Button></Link>
          <CockpitPDFExport workspaceName={currentWorkspace.name} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(isLoading ? [1, 2, 3, 4] : summaryCards).map((card, index) => {
          if (typeof card === "number") {
            return <Skeleton key={card} className="h-44" />;
          }
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border/60">
              <CardHeader>
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-muted-foreground">{card.title}</CardTitle>
                <p className="text-3xl font-bold">{card.value}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-6">{card.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Workflow className="w-5 h-5 text-primary" /> {t("dashboardHome.decisionWorkflow")}</CardTitle>
            <CardDescription>{t("dashboardHome.decisionWorkflowDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              [t("dashboardHome.wfSignals"), t("dashboardHome.wfSignalsDesc")],
              [t("dashboardHome.wfActions"), t("dashboardHome.wfActionsDesc")],
              [t("dashboardHome.wfApprovals"), t("dashboardHome.wfApprovalsDesc")],
              [t("dashboardHome.wfOutcomes"), t("dashboardHome.wfOutcomesDesc")],
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
            <CardTitle>{t("dashboardHome.operationalSnapshot")}</CardTitle>
            <CardDescription>{t("dashboardHome.operationalSnapshotDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="font-medium text-foreground">{t("dashboardHome.recentTraffic")}</p>
              <p className="text-2xl font-bold mt-1">{snapshot?.clicks?.toLocaleString() ?? 0}</p>
              <p>{t("dashboardHome.trafficDesc")}</p>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <p><span className="font-medium text-foreground">{t("dashboardHome.auditEntries")}:</span> {entries.length}</p>
              <p><span className="font-medium text-foreground">{t("dashboardHome.scheduledRuns")}:</span> {scheduledRuns.length}</p>
              <p><span className="font-medium text-foreground">{t("dashboardHome.workspace")}:</span> {currentWorkspace.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["/dashboard/signals", t("dashboardHome.navSignals"), t("dashboardHome.navSignalsDesc")],
          ["/dashboard/actions", t("dashboardHome.navActions"), t("dashboardHome.navActionsDesc")],
          ["/dashboard/outcomes", t("dashboardHome.navOutcomes"), t("dashboardHome.navOutcomesDesc")],
        ].map(([href, title, description]) => (
          <Link key={href} to={href}>
            <Card className="h-full border-border/60 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold mb-2">{title}</p>
                  <p className="text-sm text-muted-foreground leading-6">{description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {/* Predictive Analytics */}
      <PredictiveAnalytics />

      {/* Goals Progress */}
      <GoalsProgress />
    </div>
  );
}
