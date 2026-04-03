import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, FileSearch, Shield, TimerReset } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovals } from "@/hooks/useApprovals";
import { useScheduledRuns } from "@/hooks/useScheduledRuns";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { getPriorityMeta, PrioritizedAction } from "@/lib/growth-cockpit";

export default function PrioritizedActions() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { pendingApprovals } = useApprovals();
  const { scheduledRuns } = useScheduledRuns();

  const { data: evidenceBundles = [], isLoading } = useQuery({
    queryKey: ["prioritized-actions", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data, error } = await supabase
        .from("evidence_bundles")
        .select("id, title, summary, generated_at, overall_confidence")
        .eq("workspace_id", currentWorkspace.id)
        .order("generated_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const actions = useMemo<PrioritizedAction[]>(() => {
    const latestEvidence = evidenceBundles[0];
    const refreshCadence = scheduledRuns[0]?.next_run_at
      ? new Date(scheduledRuns[0].next_run_at).toLocaleDateString()
      : t("prioritizedActions.noRefresh");

    return [
      {
        id: "fix-drop",
        title: t("prioritizedActions.fixDropTitle"),
        summary: t("prioritizedActions.fixDropSummary"),
        owner: t("prioritizedActions.fixDropOwner"),
        priority: "P1",
        approval: (pendingApprovals.length > 0 ? t("prioritizedActions.approvalRequired") : t("prioritizedActions.approvalOptional")) as "Auto" | "Optional" | "Required",
        evidence: latestEvidence?.title ?? t("prioritizedActions.evidencePending"),
        expectedImpact: t("prioritizedActions.fixDropImpact"),
        eta: t("prioritizedActions.etaThisWeek"),
      },
      {
        id: "brief-exec",
        title: t("prioritizedActions.briefExecTitle"),
        summary: t("prioritizedActions.briefExecSummary"),
        owner: t("prioritizedActions.briefExecOwner"),
        priority: "P2",
        approval: t("prioritizedActions.approvalOptional") as "Auto" | "Optional" | "Required",
        evidence: latestEvidence?.summary ?? t("prioritizedActions.briefExecEvidence"),
        expectedImpact: t("prioritizedActions.briefExecImpact"),
        eta: refreshCadence,
      },
      {
        id: "schedule-monitoring",
        title: t("prioritizedActions.scheduleMonitoringTitle"),
        summary: t("prioritizedActions.scheduleMonitoringSummary"),
        owner: t("prioritizedActions.scheduleMonitoringOwner"),
        priority: "P3",
        approval: t("prioritizedActions.approvalAuto"),
        evidence: t("prioritizedActions.scheduledRunsEvidence", { count: scheduledRuns.length }),
        expectedImpact: t("prioritizedActions.scheduleMonitoringImpact"),
        eta: t("prioritizedActions.etaImmediately"),
      },
    ];
  }, [evidenceBundles, pendingApprovals.length, scheduledRuns, t]);

  if (isLoading) {
    return <div className="grid gap-4 xl:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-72" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("prioritizedActions.title")}</h1>
        <p className="text-muted-foreground">{t("prioritizedActions.subtitle")}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {actions.map((action) => {
          const meta = getPriorityMeta(action.priority);
          const Icon = meta.icon;
          return (
            <Card key={action.id} className="border-border/60 h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.className}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className={meta.className}>{action.priority}</Badge>
                </div>
                <CardTitle className="text-xl">{action.title}</CardTitle>
                <CardDescription className="leading-6">{action.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-secondary/40 p-4 space-y-2 text-sm">
                  <p><span className="font-medium">{t("prioritizedActions.ownerLabel")}:</span> {action.owner}</p>
                  <p><span className="font-medium">{t("prioritizedActions.approvalLabel")}:</span> {action.approval}</p>
                  <p><span className="font-medium">{t("prioritizedActions.etaLabel")}:</span> {action.eta}</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">{t("prioritizedActions.evidenceLabel")}</p>
                  <p>{action.evidence}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">{t("prioritizedActions.expectedImpactLabel")}</p>
                  <p>{action.expectedImpact}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSearch className="w-5 h-5 text-primary" /> {t("prioritizedActions.evidenceFirstTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-6">
            {t("prioritizedActions.evidenceFirstDesc")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> {t("prioritizedActions.governanceTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-6">
            {t("prioritizedActions.governanceDesc")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TimerReset className="w-5 h-5 text-primary" /> {t("prioritizedActions.scheduledRefreshesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-6">
            {t("prioritizedActions.scheduledRefreshesDesc")}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/dashboard/approvals">
          <Button>
            {t("prioritizedActions.reviewApprovals")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link to="/dashboard/outcomes">
          <Button variant="outline">
            {t("prioritizedActions.trackOutcomes")}
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
