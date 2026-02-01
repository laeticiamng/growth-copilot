import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Search,
  Target,
  Pause,
  Play,
  Bot,
  Zap,
  FileText,
  Loader2,
  RefreshCw,
  Eye,
  MousePointerClick,
  BarChart3,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface KPIData {
  date: string;
  organic_clicks: number;
  organic_impressions: number;
  organic_sessions: number;
  total_conversions: number;
  avg_position: number;
}

interface DataQualityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  created_at: string | null;
}

interface TopAction {
  id: string;
  priority: string;
  title: string;
  category: string;
  impact: number;
  effort: string;
  description: string;
}

interface AgentRun {
  agent_type: string;
  status: string;
  created_at: string;
}

export default function DashboardHome() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [alerts, setAlerts] = useState<DataQualityAlert[]>([]);
  const [topActions, setTopActions] = useState<TopAction[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [runningGuardian, setRunningGuardian] = useState(false);
  const [togglingAutopilot, setTogglingAutopilot] = useState(false);

  useEffect(() => {
    if (currentWorkspace && currentSite) {
      loadDashboardData();
    } else if (currentWorkspace) {
      loadAutopilotSettings();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentWorkspace, currentSite]);

  const loadDashboardData = async () => {
    if (!currentSite || !currentWorkspace) return;
    
    setLoading(true);
    try {
      // Load KPI data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [kpisRes, alertsRes, issuesRes, agentsRes, autopilotRes] = await Promise.all([
        supabase
          .from("kpis_daily")
          .select("*")
          .eq("site_id", currentSite.id)
          .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
          .order("date", { ascending: true }),
        supabase
          .from("data_quality_alerts")
          .select("*")
          .eq("site_id", currentSite.id)
          .eq("is_resolved", false)
          .order("severity", { ascending: true })
          .limit(5),
        supabase
          .from("issues")
          .select("*")
          .eq("site_id", currentSite.id)
          .eq("status", "open")
          .order("impact_score", { ascending: false })
          .limit(5),
        supabase
          .from("agent_runs")
          .select("agent_type, status, created_at")
          .eq("workspace_id", currentWorkspace.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("autopilot_settings")
          .select("enabled")
          .eq("workspace_id", currentWorkspace.id)
          .maybeSingle(),
      ]);

      setKpiData(kpisRes.data || []);
      setAlerts(alertsRes.data || []);
      setTopActions((issuesRes.data || []).map(i => ({
        id: i.id,
        priority: i.severity || "medium",
        title: i.title,
        category: i.category,
        impact: i.impact_score || 50,
        effort: i.effort_score && i.effort_score > 70 ? t("dashboard.home.effort") + ": High" : 
                i.effort_score && i.effort_score > 40 ? t("dashboard.home.effort") + ": Medium" : 
                t("dashboard.home.effort") + ": Low",
        description: i.description || "",
      })));
      setAgentRuns(agentsRes.data || []);
      setAutopilotEnabled(autopilotRes.data?.enabled ?? false);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAutopilotSettings = async () => {
    if (!currentWorkspace) return;
    try {
      const { data } = await supabase
        .from("autopilot_settings")
        .select("enabled")
        .eq("workspace_id", currentWorkspace.id)
        .maybeSingle();
      setAutopilotEnabled(data?.enabled ?? false);
    } catch (error) {
      console.error("Failed to load autopilot settings:", error);
    }
  };

  const toggleAutopilot = async () => {
    if (!currentWorkspace) return;
    
    setTogglingAutopilot(true);
    try {
      const newValue = !autopilotEnabled;
      const { error } = await supabase
        .from("autopilot_settings")
        .upsert({
          workspace_id: currentWorkspace.id,
          enabled: newValue,
          updated_at: new Date().toISOString(),
        }, { onConflict: "workspace_id" });

      if (error) throw error;
      
      setAutopilotEnabled(newValue);
      toast.success(newValue ? "Autopilot activé" : "Autopilot désactivé");
    } catch (error) {
      console.error("Failed to toggle autopilot:", error);
      toast.error("Erreur lors du changement d'état de l'Autopilot");
    } finally {
      setTogglingAutopilot(false);
    }
  };

  const runAnalyticsGuardian = async () => {
    if (!currentWorkspace || !currentSite) return;
    
    setRunningGuardian(true);
    try {
      const { data, error } = await supabase.functions.invoke("analytics-guardian", {
        body: { workspace_id: currentWorkspace.id, site_id: currentSite.id },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Analytics Guardian: ${data.alerts_created} ${t("notifications.types.info").toLowerCase()}`);
        loadDashboardData();
      } else {
        toast.error(data.error || t("errors.generic"));
      }
    } catch (error) {
      console.error("Guardian error:", error);
      toast.error(t("errors.generic"));
    } finally {
      setRunningGuardian(false);
    }
  };

  const generateMonthlyReport = async () => {
    if (!currentWorkspace || !currentSite) return;
    
    setGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-report", {
        body: { workspace_id: currentWorkspace.id, site_id: currentSite.id },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(t("common.export") + " OK", {
          action: {
            label: t("common.view"),
            onClick: () => window.open(data.url, "_blank"),
          },
        });
      } else {
        toast.error(data.error || t("errors.generic"));
      }
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error(t("errors.generic"));
    } finally {
      setGeneratingReport(false);
    }
  };

  // Calculate summary KPIs
  const calculateSummary = () => {
    if (kpiData.length === 0) return null;

    const lastWeek = kpiData.slice(-7);
    const prevWeek = kpiData.slice(-14, -7);

    const sum = (data: KPIData[], key: keyof KPIData) =>
      data.reduce((acc, d) => acc + (Number(d[key]) || 0), 0);
    
    const calcChange = (curr: number, prev: number) =>
      prev === 0 ? 0 : ((curr - prev) / prev) * 100;

    const currentClicks = sum(lastWeek, "organic_clicks");
    const prevClicks = sum(prevWeek, "organic_clicks");
    const currentConversions = sum(lastWeek, "total_conversions");
    const prevConversions = sum(prevWeek, "total_conversions");
    const currentSessions = sum(lastWeek, "organic_sessions");
    const prevSessions = sum(prevWeek, "organic_sessions");

    const avgPosition = lastWeek.length > 0
      ? lastWeek.reduce((acc, d) => acc + (Number(d.avg_position) || 0), 0) / lastWeek.length
      : 0;
    const prevAvgPosition = prevWeek.length > 0
      ? prevWeek.reduce((acc, d) => acc + (Number(d.avg_position) || 0), 0) / prevWeek.length
      : 0;

    return [
      {
        label: t("dashboard.home.organicClicks"),
        value: currentClicks.toLocaleString(),
        change: calcChange(currentClicks, prevClicks).toFixed(1),
        trend: currentClicks >= prevClicks ? "up" : "down",
        icon: MousePointerClick,
      },
      {
        label: t("dashboard.home.conversions"),
        value: currentConversions.toLocaleString(),
        change: calcChange(currentConversions, prevConversions).toFixed(1),
        trend: currentConversions >= prevConversions ? "up" : "down",
        icon: Target,
      },
      {
        label: t("dashboard.home.sessions"),
        value: currentSessions.toLocaleString(),
        change: calcChange(currentSessions, prevSessions).toFixed(1),
        trend: currentSessions >= prevSessions ? "up" : "down",
        icon: BarChart3,
      },
      {
        label: t("dashboard.home.avgPosition"),
        value: avgPosition.toFixed(1),
        change: (prevAvgPosition - avgPosition).toFixed(1),
        trend: avgPosition <= prevAvgPosition ? "up" : "down",
        icon: Search,
      },
    ];
  };

  const summaryKpis = calculateSummary();

  // Demo data fallback
  const demoKpiData = summaryKpis || [
    { label: t("dashboard.home.organicClicks"), value: "—", change: "0", trend: "up", icon: MousePointerClick },
    { label: t("dashboard.home.conversions"), value: "—", change: "0", trend: "up", icon: Target },
    { label: t("dashboard.home.sessions"), value: "—", change: "0", trend: "up", icon: BarChart3 },
    { label: t("dashboard.home.avgPosition"), value: "—", change: "0", trend: "up", icon: Search },
  ];

  // Build agent status from real data
  const getAgentStatus = () => {
    const agentTypes = ["cgo", "tech_auditor", "analytics_guardian", "content_builder"];
    const agentNames: Record<string, string> = {
      cgo: "Chief Growth Officer",
      tech_auditor: "Tech Auditor",
      analytics_guardian: "Analytics Guardian",
      content_builder: "Content Builder",
    };
    
    return agentTypes.map(type => {
      const latestRun = agentRuns.find(r => r.agent_type === type);
      const isActive = latestRun?.status === "running" || (type === "analytics_guardian" && runningGuardian);
      
      let lastRun = "—";
      if (type === "analytics_guardian" && runningGuardian) {
        lastRun = t("dashboard.home.running");
      } else if (latestRun) {
        const minutesAgo = Math.floor((Date.now() - new Date(latestRun.created_at).getTime()) / 60000);
        if (minutesAgo < 60) {
          lastRun = t("dashboard.home.agoMinutes", { n: minutesAgo });
        } else {
          lastRun = t("dashboard.home.agoHours", { n: Math.floor(minutesAgo / 60) });
        }
      }
      
      return {
        name: agentNames[type] || type,
        status: isActive ? "active" : "idle",
        lastRun,
      };
    });
  };

  const agentStatus = getAgentStatus();

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("dashboard.home.noWorkspace")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("dashboard.home.createWorkspace")}
        </p>
        <Link to="/onboarding">
          <Button variant="hero">
            {t("dashboard.home.createWorkspaceBtn")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard.home.title")}</h1>
          <p className="text-muted-foreground">
            {currentWorkspace.name}
            {currentSite && ` - ${currentSite.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={runAnalyticsGuardian}
            disabled={runningGuardian || !currentSite}
          >
            {runningGuardian ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {t("dashboard.home.dataCheck")}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateMonthlyReport}
            disabled={generatingReport || !currentSite}
          >
            {generatingReport ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {t("dashboard.home.pdfReport")}
          </Button>
          <Badge variant={currentWorkspace.plan === 'free' ? 'secondary' : 'gradient'} className="capitalize">
            Plan {currentWorkspace.plan}
          </Badge>
        </div>
      </div>

      {/* Data Quality Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.severity === "critical"
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : alert.severity === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                  : "bg-primary/10 border-primary/30 text-primary"
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium text-sm">{alert.title}</span>
                <p className="text-xs opacity-80">{alert.description}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {alert.alert_type}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* No Site Warning */}
      {!currentSite && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <Eye className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{t("dashboard.home.selectSite")}</p>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.home.selectSiteDesc")}
              </p>
            </div>
            <Link to="/dashboard/sites">
              <Button size="sm">{t("dashboard.home.manageSites")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {demoKpiData.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} variant="kpi" className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${
                      kpi.trend === "up" ? "text-green-500" : "text-destructive"
                    }`}>
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Number(kpi.change) >= 0 ? "+" : ""}{kpi.change}%
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      {kpiData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Clicks & Impressions Chart */}
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-primary" />
                {t("dashboard.home.gscChart")}
              </CardTitle>
              <CardDescription>{t("dashboard.home.last30Days")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={kpiData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(v) => new Date(v).toLocaleDateString("fr", { day: "2-digit", month: "short" })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(v) => new Date(v as string).toLocaleDateString("fr")}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="organic_impressions" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    name="Impressions"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="organic_clicks" 
                    stroke="hsl(var(--accent-foreground))" 
                    fill="hsl(var(--accent) / 0.3)" 
                    name="Clicks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sessions & Conversions Chart */}
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {t("dashboard.home.ga4Chart")}
              </CardTitle>
              <CardDescription>{t("dashboard.home.last30Days")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={kpiData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(v) => new Date(v).toLocaleDateString("fr", { day: "2-digit", month: "short" })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(v) => new Date(v as string).toLocaleDateString("fr")}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="organic_sessions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    name="Sessions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_conversions" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={false}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Actions */}
        <div className="lg:col-span-2">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("dashboard.home.priorityActions")}</CardTitle>
                  <CardDescription>{t("dashboard.home.priorityActionsDesc")}</CardDescription>
                </div>
                <Link to="/dashboard/seo">
                  <Button variant="ghost" size="sm">
                    {t("dashboard.home.viewAll")}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topActions.length > 0 ? topActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        action.priority === "critical"
                          ? "bg-destructive"
                          : action.priority === "high"
                          ? "bg-yellow-500"
                          : "bg-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{action.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {action.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t("dashboard.home.impact")}</span>
                        <Progress value={action.impact} className="w-20 h-1.5" />
                        <span className="text-xs font-medium">{action.impact}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {action.effort}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("dashboard.home.noActions")}</p>
                  <p className="text-sm">{t("dashboard.home.noActionsDesc")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Agent Status */}
        <div className="space-y-6">
          <Card variant="agent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  {t("dashboard.home.aiAgents")}
                </CardTitle>
                <Badge variant="gradient" className="text-xs">
                  {agentStatus.filter(a => a.status === "active").length} {t("dashboard.home.active")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentStatus.map((agent, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        agent.status === "active"
                          ? "bg-green-500 agent-pulse"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-sm">{agent.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {agent.lastRun}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Autopilot toggle - NOW FUNCTIONAL */}
          <Card variant="gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{t("dashboard.home.autopilot")}</p>
                    <p className="text-xs opacity-80">{t("dashboard.home.autopilotAuto")}</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="gap-2"
                  onClick={toggleAutopilot}
                  disabled={togglingAutopilot}
                >
                  {togglingAutopilot ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : autopilotEnabled ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  {autopilotEnabled ? "ON" : "OFF"}
                </Button>
              </div>
              <p className="text-xs mt-4 opacity-70">
                {autopilotEnabled 
                  ? t("dashboard.home.autopilotOnDesc")
                  : t("dashboard.home.autopilotOffDesc")
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
