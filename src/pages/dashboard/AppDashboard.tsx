/**
 * P1 — Dashboard Principal
 * Vue d'ensemble avec KPI cards, feed d'activité agents, graphique performances, validations en attente
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  CheckCircle2,
  Clock,
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
import {
  MOCK_KPIS,
  MOCK_ACTIVITY_FEED,
  MOCK_WEEKLY_PERFORMANCE,
  MOCK_WEEKLY_PERFORMANCE_EN,
  MOCK_PENDING_APPROVALS,
} from "@/data/mock-dashboard";
import { AGENTS_CATALOG, DEPARTMENTS_CATALOG } from "@/data/agents-catalog";
import { toast } from "sonner";

export default function AppDashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const weeklyData = lang === "fr" ? MOCK_WEEKLY_PERFORMANCE : MOCK_WEEKLY_PERFORMANCE_EN;

  const kpis = [
    {
      label: lang === "fr" ? "Tâches en cours" : "Tasks in progress",
      value: MOCK_KPIS.tasksInProgress,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: lang === "fr" ? "Terminées cette semaine" : "Completed this week",
      value: MOCK_KPIS.tasksCompletedThisWeek,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: lang === "fr" ? "Agents actifs" : "Active agents",
      value: `${MOCK_KPIS.activeAgents}/39`,
      icon: Bot,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: lang === "fr" ? "Score de croissance" : "Growth score",
      value: `${MOCK_KPIS.growthScore}/100`,
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

  const priorityLabels = {
    urgent: lang === "fr" ? "Urgent" : "Urgent",
    high: lang === "fr" ? "Haute" : "High",
    normal: lang === "fr" ? "Normale" : "Normal",
    low: lang === "fr" ? "Basse" : "Low",
  };

  const activityTypeIcons = {
    task_completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    alert: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    report: <BarChart3 className="w-4 h-4 text-blue-500" />,
    approval_needed: <Shield className="w-4 h-4 text-violet-500" />,
    insight: <Zap className="w-4 h-4 text-cyan-500" />,
  };

  const handleApprove = (id: string) => {
    toast.success(lang === "fr" ? "Action approuvée" : "Action approved");
  };

  const handleReject = (id: string) => {
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
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <CardContent className="max-h-[500px] overflow-y-auto space-y-1 px-4">
            {MOCK_ACTIVITY_FEED.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: item.departmentColor }}
                >
                  {item.agentInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.agentName}</span>
                    {activityTypeIcons[item.type]}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {item.action[lang]}
                  </p>
                  <span className="text-xs text-muted-foreground/60 mt-1 block">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
            ))}
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
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
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
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    name={lang === "fr" ? "Tâches" : "Tasks"}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="approvals"
                    name={lang === "fr" ? "Approbations" : "Approvals"}
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alerts"
                    name={lang === "fr" ? "Alertes" : "Alerts"}
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-5))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Quick Access */}
      <div>
        <h2 className="text-lg font-bold mb-3">
          {lang === "fr" ? "Départements" : "Departments"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {DEPARTMENTS_CATALOG.map((dept) => {
            const DeptIcon = dept.icon;
            return (
              <Link
                key={dept.slug}
                to={`/dashboard/dept/${dept.slug}`}
                className="group"
              >
                <div className="p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all bg-secondary/20 hover:bg-secondary/40 text-center">
                  <DeptIcon
                    className="w-5 h-5 mx-auto mb-2 group-hover:text-primary transition-colors"
                    style={{ color: dept.color }}
                  />
                  <p className="text-xs font-medium truncate">{dept.name[lang]}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {dept.agentCount} agents
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pending Validations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                {lang === "fr" ? "En attente de validation" : "Pending Validation"}
                <Badge variant="secondary" className="ml-2">
                  {MOCK_PENDING_APPROVALS.length}
                </Badge>
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
          {MOCK_PENDING_APPROVALS.map((item) => {
            const agent = AGENTS_CATALOG.find((a) => a.slug === item.agentSlug);
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: agent?.color || "#6366f1" }}
                >
                  {item.agentInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{item.agentName}</span>
                    <Badge variant="outline" className={cn("text-[10px]", priorityColors[item.priority])}>
                      {priorityLabels[item.priority]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        item.riskLevel === "low"
                          ? "text-emerald-500"
                          : item.riskLevel === "medium"
                          ? "text-amber-500"
                          : "text-red-500"
                      )}
                    >
                      {lang === "fr" ? "Risque" : "Risk"}: {item.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm">{item.action[lang]}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.impact[lang]}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleReject(item.id)}
                  >
                    {lang === "fr" ? "Rejeter" : "Reject"}
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleApprove(item.id)}>
                    {lang === "fr" ? "Approuver" : "Approve"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        &copy; 2026 EmotionsCare SASU — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}
