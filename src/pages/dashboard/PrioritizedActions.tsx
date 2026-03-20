import { useMemo } from "react";
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
      : "No refresh scheduled";

    return [
      {
        id: "fix-drop",
        title: "Review the strongest performance drop",
        summary: "Validate the biggest negative signal and identify whether the cause is channel, creative, funnel or tracking related.",
        owner: "Growth lead",
        priority: "P1",
        approval: pendingApprovals.length > 0 ? "Required" : "Optional",
        evidence: latestEvidence?.title ?? "Latest evidence bundle pending",
        expectedImpact: "Recover lost demand faster and reduce reactive firefighting.",
        eta: "This week",
      },
      {
        id: "brief-exec",
        title: "Publish a weekly decision brief",
        summary: "Convert top signals into a short list of ranked actions with owner, rationale and approval status.",
        owner: "Workspace operator",
        priority: "P2",
        approval: "Optional",
        evidence: latestEvidence?.summary ?? "Use evidence bundle summaries to justify ranking.",
        expectedImpact: "Shorter alignment loops across client or internal teams.",
        eta: refreshCadence,
      },
      {
        id: "schedule-monitoring",
        title: "Lock monitoring cadence",
        summary: "Ensure briefs and anomaly detection are refreshed automatically instead of depending on manual reporting cycles.",
        owner: "Operations",
        priority: "P3",
        approval: "Auto",
        evidence: `${scheduledRuns.length} scheduled run(s) currently configured`,
        expectedImpact: "More predictable visibility and less reporting latency.",
        eta: "Immediately",
      },
    ];
  }, [evidenceBundles, pendingApprovals.length, scheduledRuns]);

  if (isLoading) {
    return <div className="grid gap-4 xl:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-72" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prioritized Actions</h1>
        <p className="text-muted-foreground">A ranked queue of actions grounded in evidence, governance and likely business impact.</p>
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
                  <p><span className="font-medium">Owner:</span> {action.owner}</p>
                  <p><span className="font-medium">Approval:</span> {action.approval}</p>
                  <p><span className="font-medium">ETA:</span> {action.eta}</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Evidence</p>
                  <p>{action.evidence}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Expected impact</p>
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
            <CardTitle className="flex items-center gap-2"><FileSearch className="w-5 h-5 text-primary" /> Evidence-first prioritization</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-6">
            Use evidence bundles to keep the queue explainable. Each recommendation should point to observed data, reasoning and known limitations.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Governance-aware execution</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-6">
            Approval gates stay in front of sensitive actions so teams can move quickly without losing control or traceability.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TimerReset className="w-5 h-5 text-primary" /> Scheduled refreshes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-6">
            Keep the queue current by pairing human review with scheduled briefs, signal refreshes and recurring evidence generation.
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/dashboard/approvals">
          <Button>
            Review approvals
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link to="/dashboard/outcomes">
          <Button variant="outline">
            Track outcomes
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
