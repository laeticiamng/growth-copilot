import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileText, History, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EvidenceBundleList } from "@/components/evidence/EvidenceBundleViewer";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useEvidenceBundles } from "@/hooks/useEvidenceBundles";
import { useSites } from "@/hooks/useSites";
import { OutcomeMetric, getOutcomeStatusMeta } from "@/lib/growth-cockpit";
import { supabase } from "@/integrations/supabase/client";

export default function OutcomeTracking() {
  const { currentSite } = useSites();
  const { bundles, isLoading: evidenceLoading } = useEvidenceBundles();
  const { entries } = useAuditLog();

  const { data: kpis, isLoading } = useQuery({
    queryKey: ["outcomes", currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return [];
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const { data, error } = await supabase
        .from("kpis_daily")
        .select("date, organic_clicks, total_conversions, avg_position")
        .eq("site_id", currentSite.id)
        .gte("date", sixtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!currentSite?.id,
  });

  const metrics = useMemo<OutcomeMetric[]>(() => {
    const recent = (kpis ?? []).slice(0, 30);
    const previous = (kpis ?? []).slice(30, 60);
    const sum = (rows: typeof recent, key: "organic_clicks" | "total_conversions") => rows.reduce((acc, row) => acc + (row[key] ?? 0), 0);
    const avgPosition = recent.length
      ? recent.reduce((acc, row) => acc + Number(row.avg_position ?? 0), 0) / recent.filter((row) => row.avg_position).length
      : 0;

    const recentClicks = sum(recent, "organic_clicks");
    const previousClicks = sum(previous, "organic_clicks");
    const recentConversions = sum(recent, "total_conversions");
    const previousConversions = sum(previous, "total_conversions");

    const clickDelta = previousClicks > 0 ? ((recentClicks - previousClicks) / previousClicks) * 100 : 0;
    const conversionDelta = previousConversions > 0 ? ((recentConversions - previousConversions) / previousConversions) * 100 : 0;

    return [
      {
        id: "clicks",
        label: "Organic clicks",
        value: recentClicks.toLocaleString(),
        change: `${clickDelta >= 0 ? "+" : ""}${clickDelta.toFixed(1)}% vs prior period`,
        status: clickDelta >= 0 ? "up" : "down",
      },
      {
        id: "conversions",
        label: "Conversions",
        value: recentConversions.toLocaleString(),
        change: `${conversionDelta >= 0 ? "+" : ""}${conversionDelta.toFixed(1)}% vs prior period`,
        status: conversionDelta >= 0 ? "up" : "down",
      },
      {
        id: "position",
        label: "Average position",
        value: avgPosition ? avgPosition.toFixed(1) : "n/a",
        change: "Search visibility quality indicator",
        status: "stable",
      },
    ];
  }, [kpis]);

  const auditHighlights = entries.slice(0, 5);

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-48" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outcome Tracking</h1>
        <p className="text-muted-foreground">Track whether the signal-to-action loop is producing measurable business improvement over time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const meta = getOutcomeStatusMeta(metric.status);
          const Icon = meta.icon;
          return (
            <Card key={metric.id} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">{metric.label}</CardTitle>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-3xl font-bold">{metric.value}</span>
                  <Icon className={`w-5 h-5 ${meta.className}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${meta.className}`}>{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Evidence bundles</CardTitle>
            <CardDescription>Use evidence artifacts as the proof layer behind recommendations and reported impact.</CardDescription>
          </CardHeader>
          <CardContent>
            <EvidenceBundleList
              bundles={bundles.slice(0, 3)}
              loading={evidenceLoading}
              emptyMessage="No evidence bundle has been generated yet for this workspace."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Audit highlights</CardTitle>
            <CardDescription>Recent traceability events that support governance and impact reviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditHighlights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit entries available yet.</p>
            ) : auditHighlights.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Badge variant="outline">{entry.action}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm font-medium">{entry.entity_type}</p>
                <p className="text-sm text-muted-foreground">Actor type: {entry.actor_type}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> What “good” looks like</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div className="rounded-xl border border-border/60 p-4">
            <p className="font-medium text-foreground mb-2">Fast signal review</p>
            <p>Teams can identify the highest-impact anomaly without spending the week collecting screenshots and exports.</p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="font-medium text-foreground mb-2">Explainable action</p>
            <p>Every recommendation points back to evidence, confidence and governance status.</p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="font-medium text-foreground mb-2">Measurable outcome</p>
            <p>The cockpit helps prove whether approved actions improved performance, not just whether a task was executed.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
