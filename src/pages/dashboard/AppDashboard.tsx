/**
 * P1 — Dashboard Principal
 * Vue d'ensemble avec KPI cards, feed d'activité agents, graphique performances, validations en attente
 * Wired to real Lovable Cloud data (agent_runs, action_log, approval_queue)
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Zap,
  BarChart3,
  ListChecks,
  Shield,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { DEPARTMENTS_CATALOG } from "@/data/agents-catalog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useApprovals } from "@/hooks/useApprovals";

// ── Helpers ──

function useDashboardKPIs(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["app-dashboard-kpis", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString();

      // Parallel queries
      const [runsRes, completedRes, activeRes, healthRes] = await Promise.all([
        // Tasks in progress
        supabase
          .from("agent_runs")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "running"),
        // Completed this week
        supabase
          .from("agent_runs")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "completed")
          .gte("completed_at", weekAgoStr),
        // Distinct active agent types (last 30d)
        supabase
          .from("agent_runs")
          .select("agent_type")
          .eq("workspace_id", workspaceId)
          .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
        // Health score
        supabase.rpc("calculate_health_score", { _workspace_id: workspaceId }),
      ]);

      const uniqueAgents = new Set((activeRes.data || []).map((r: any) => r.agent_type)).size;

      return {
        tasksInProgress: runsRes.count ?? 0,
        tasksCompletedThisWeek: completedRes.count ?? 0,
        activeAgents: uniqueAgents,
        growthScore: (healthRes.data as number) ?? 50,
      };
    },
    enabled: !!workspaceId,
    staleTime: 60_000,
  });
}

function useActivityFeed(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["app-dashboard-activity", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("action_log")
        .select("id, action_type, actor_type, description, created_at, action_category, entity_type")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
}

function useWeeklyPerformance(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["app-dashboard-weekly", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [runsRes, approvalsRes] = await Promise.all([
        supabase
          .from("agent_runs")
          .select("created_at, status")
          .eq("workspace_id", workspaceId)
          .gte("created_at", sevenDaysAgo.toISOString()),
        supabase
          .from("approval_queue")
          .select("created_at, status")
          .eq("workspace_id", workspaceId)
          .gte("created_at", sevenDaysAgo.toISOString()),
      ]);

      // Aggregate by day
      const dayMap = new Map<string, { tasks: number; approvals: number; alerts: number }>();
      const dayNames: Record<string, string[]> = {
        fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
        en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      };

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dayMap.set(key, { tasks: 0, approvals: 0, alerts: 0 });
      }

      for (const run of runsRes.data || []) {
        const key = run.created_at?.split("T")[0];
        if (key && dayMap.has(key)) {
          const entry = dayMap.get(key)!;
          entry.tasks++;
          if (run.status === "failed") entry.alerts++;
        }
      }

      for (const appr of approvalsRes.data || []) {
        const key = appr.created_at?.split("T")[0];
        if (key && dayMap.has(key)) {
          dayMap.get(key)!.approvals++;
        }
      }

      return Array.from(dayMap.entries()).map(([dateStr, counts]) => {
        const d = new Date(dateStr);
        return {
          dayFr: dayNames.fr[d.getDay()],
          dayEn: dayNames.en[d.getDay()],
          ...counts,
        };
      });
    },
    enabled: !!workspaceId,
    staleTime: 60_000,
  });
}

// ── Component ──

export default function AppDashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const { currentWorkspace } = useWorkspace();
  const wsId = currentWorkspace?.id;

  const { data: kpiData, isLoading: kpiLoading } = useDashboardKPIs(wsId);
  const { data: activityData = [], isLoading: activityLoading } = useActivityFeed(wsId);
  const { data: weeklyData = [], isLoading: weeklyLoading } = useWeeklyPerformance(wsId);
  const { pendingApprovals, approveAction, rejectAction } = useApprovals();

  const kpis = [
    {
      label: lang === "fr" ? "Tâches en cours" : "Tasks in progress",
      value: kpiData?.tasksInProgress ?? "–",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: lang === "fr" ? "Terminées cette semaine" : "Completed this week",
      value: kpiData?.tasksCompletedThisWeek ?? "–",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: lang === "fr" ? "Agents actifs" : "Active agents",
      value: kpiData ? `${kpiData.activeAgents}/39` : "–",
      icon: Bot,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: lang === "fr" ? "Score de croissance" : "Growth score",
      value: kpiData ? `${kpiData.growthScore}/100` : "–",
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const priorityColors = {
    urgent: "bg-red-500/10 text-red-500 border-red-500/20",
    high: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    normal: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const activityTypeIcon = (type: string) => {
    if (type.includes("complet")) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type.includes("alert") || type.includes("fail")) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (type.includes("report")) return <BarChart3 className="w-4 h-4 text-blue-500" />;
    if (type.includes("approval")) return <Shield className="w-4 h-4 text-violet-500" />;
    return <Zap className="w-4 h-4 text-cyan-500" />;
  };

  const handleApprove = async (id: string) => {
    await approveAction(id);
    toast.success(lang === "fr" ? "Action approuvée" : "Action approved");
  };

  const handleReject = async (id: string) => {
    await rejectAction(id, "Rejected by user");
    toast.success(lang === "fr" ? "Action rejetée" : "Action rejected");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return lang === "fr" ? `Il y a ${minutes}min` : `${minutes}min ago`;
    if (hours < 24) return lang === "fr" ? `Il y a ${hours}h` : `${hours}h ago`;
    return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
  };

  const chartData = weeklyData.map((d: any) => ({
    day: lang === "fr" ? d.dayFr : d.dayEn,
    tasks: d.tasks,
    approvals: d.approvals,
    alerts: d.alerts,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {lang === "fr" ? "Tableau de bord" : "Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "fr"
            ? "Vue d'ensemble de l'activité de vos 39 agents IA"
            : "Overview of your 39 AI agents' activity"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
                    <Icon className={cn("w-4 h-4", kpi.color)} />
                  </div>
                </div>
                {kpiLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{kpi.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Agent Activity Feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {lang === "fr" ? "Activité des agents" : "Agent Activity"}
            </CardTitle>
            <CardDescription>
              {lang === "fr" ? "Dernières actions en temps réel" : "Latest real-time actions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto space-y-1 px-3 sm:px-4">
            {activityLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-2" />
              ))
            ) : activityData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {lang === "fr" ? "Aucune activité récente" : "No recent activity"}
              </p>
            ) : (
              activityData.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {activityTypeIcon(item.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm capitalize">
                        {item.actor_type === "agent" ? item.action_category || "Agent" : "User"}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {item.action_type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-xs text-muted-foreground/60 mt-1 block">
                      {formatTime(item.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weekly Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {lang === "fr" ? "Performance hebdomadaire" : "Weekly Performance"}
            </CardTitle>
            <CardDescription>
              {lang === "fr"
                ? "Tâches exécutées, approbations et alertes"
                : "Tasks executed, approvals and alerts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <Skeleton className="h-[260px] sm:h-[340px] w-full" />
            ) : (
              <div className="h-[260px] sm:h-[340px] overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="tasks" name={lang === "fr" ? "Tâches" : "Tasks"} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="approvals" name={lang === "fr" ? "Approbations" : "Approvals"} stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))", r: 4 }} />
                    <Line type="monotone" dataKey="alerts" name={lang === "fr" ? "Alertes" : "Alerts"} stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-5))", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Quick Access */}
      <div>
        <h2 className="text-lg font-bold mb-3">
          {lang === "fr" ? "Départements" : "Departments"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
          {DEPARTMENTS_CATALOG.map((dept) => {
            const DeptIcon = dept.icon;
            return (
              <Link key={dept.slug} to={`/dashboard/dept/${dept.slug}`} className="group">
                <div className="p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all bg-secondary/20 hover:bg-secondary/40 text-center">
                  <DeptIcon className="w-5 h-5 mx-auto mb-2 group-hover:text-primary transition-colors" style={{ color: dept.color }} />
                  <p className="text-xs font-medium truncate">{dept.name[lang]}</p>
                  <p className="text-[10px] text-muted-foreground">{dept.agentCount} agents</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pending Validations — Real data from approval_queue */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                {lang === "fr" ? "En attente de validation" : "Pending Validation"}
                <Badge variant="secondary" className="ml-2">{pendingApprovals.length}</Badge>
              </CardTitle>
              <CardDescription>
                {lang === "fr"
                  ? "Actions proposées par vos agents nécessitant votre approbation"
                  : "Actions proposed by your agents requiring your approval"}
              </CardDescription>
            </div>
            <Link to="/dashboard/approvals">
              <Button variant="outline" size="sm">
                {lang === "fr" ? "Voir tout" : "View all"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {lang === "fr" ? "Aucune validation en attente 🎉" : "No pending validations 🎉"}
            </p>
          ) : (
            pendingApprovals.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm capitalize">
                      {item.agent_type.replace(/_/g, " ")}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        item.risk_level === "low"
                          ? "text-emerald-500"
                          : item.risk_level === "medium"
                          ? "text-amber-500"
                          : "text-red-500"
                      )}
                    >
                      {lang === "fr" ? "Risque" : "Risk"}: {item.risk_level}
                    </Badge>
                  </div>
                  <p className="text-sm">{item.action_type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(item.created_at || "")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive min-h-[44px]"
                    onClick={() => handleReject(item.id)}
                  >
                    {lang === "fr" ? "Rejeter" : "Reject"}
                  </Button>
                  <Button variant="default" size="sm" className="min-h-[44px]" onClick={() => handleApprove(item.id)}>
                    {lang === "fr" ? "Approuver" : "Approve"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        &copy; 2026 EmotionsCare SASU — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}
