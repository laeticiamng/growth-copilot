import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { cn } from "@/lib/utils";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
} from "lucide-react";
import { useMultiTableSubscription } from "@/hooks/useRealtimeSubscription";
import { useTranslation } from "react-i18next";

interface HealthMetric {
  nameKey: string;
  score: number;
  weight: number;
  trend?: "up" | "down" | "stable";
  description: string;
}

interface BusinessHealthScoreProps {
  className?: string;
}

export function BusinessHealthScore({ className }: BusinessHealthScoreProps) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateHealth = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }
     
    setLoading(true);
    const newMetrics: HealthMetric[] = [];

    try {
      const { count: sitesCount } = await supabase
        .from("sites")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", currentWorkspace.id);

      newMetrics.push({
        nameKey: "cockpit.configuration",
        score: sitesCount && sitesCount > 0 ? 100 : 0,
        weight: 20,
        trend: "stable",
        description: sitesCount && sitesCount > 0 ? t("cockpit.siteConfigured") : t("cockpit.noSiteConfigured"),
      });

      const { count: integrationsCount } = await supabase
        .from("integrations")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", currentWorkspace.id)
        .eq("status", "connected");

      const integrationScore = Math.min((integrationsCount || 0) * 25, 100);
      newMetrics.push({
        nameKey: "cockpit.integrations",
        score: integrationScore,
        weight: 20,
        trend: integrationScore >= 50 ? "up" : "stable",
        description: t("cockpit.integrationsActive", { count: integrationsCount || 0 }),
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: runsCount } = await supabase
        .from("agent_runs")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", currentWorkspace.id)
        .eq("status", "completed")
        .gte("created_at", sevenDaysAgo.toISOString());

      const runsScore = Math.min((runsCount || 0) * 10, 100);
      newMetrics.push({
        nameKey: "cockpit.aiActivity",
        score: runsScore,
        weight: 20,
        trend: (runsCount || 0) > 5 ? "up" : (runsCount || 0) > 0 ? "stable" : "down",
        description: t("cockpit.runsThisWeek", { count: runsCount || 0 }),
      });

      const { count: pendingCount } = await supabase
        .from("approval_queue")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", currentWorkspace.id)
        .eq("status", "pending");

      const approvalScore = Math.max(100 - (pendingCount || 0) * 20, 0);
      newMetrics.push({
        nameKey: "cockpit.approvals",
        score: approvalScore,
        weight: 15,
        trend: (pendingCount || 0) === 0 ? "up" : (pendingCount || 0) <= 3 ? "stable" : "down",
        description: (pendingCount || 0) === 0 ? t("cockpit.upToDate") : t("cockpit.pendingCount", { count: pendingCount }),
      });

      let kpiScore = 0;
      if (currentSite?.id) {
        const { count: kpiCount } = await supabase
          .from("kpis_daily")
          .select("*", { count: "exact", head: true })
          .eq("site_id", currentSite.id)
          .gte("date", sevenDaysAgo.toISOString().split("T")[0]);

        kpiScore = Math.min((kpiCount || 0) * 15, 100);
      }

      newMetrics.push({
        nameKey: "cockpit.kpiData",
        score: kpiScore,
        weight: 25,
        trend: kpiScore >= 50 ? "up" : kpiScore > 0 ? "stable" : "down",
        description: kpiScore > 0 ? t("cockpit.dataCollected") : t("cockpit.waitingForSync"),
      });

      setMetrics(newMetrics);

      const totalWeight = newMetrics.reduce((sum, m) => sum + m.weight, 0);
      const weightedSum = newMetrics.reduce((sum, m) => sum + (m.score * m.weight) / 100, 0);
      const overall = Math.round((weightedSum / totalWeight) * 100);
      setOverallScore(overall);
    } catch (error) {
      console.error("[BusinessHealth] Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, currentSite?.id, t]);

  useEffect(() => {
    calculateHealth();
  }, [calculateHealth]);

  useMultiTableSubscription(
    `health-score-${currentWorkspace?.id}`,
    [
      { table: 'sites', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined, onPayload: () => calculateHealth() },
      { table: 'integrations', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined, onPayload: () => calculateHealth() },
      { table: 'agent_runs', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined, onPayload: () => calculateHealth() },
      { table: 'approval_queue', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined, onPayload: () => calculateHealth() },
    ],
    !!currentWorkspace?.id
  );

  const getWeatherIcon = (score: number) => {
    if (score >= 80) return <Sun className="w-8 h-8 text-warning" />;
    if (score >= 60) return <Cloud className="w-8 h-8 text-primary" />;
    if (score >= 40) return <CloudRain className="w-8 h-8 text-muted-foreground" />;
    return <Snowflake className="w-8 h-8 text-accent" />;
  };

  const getWeatherLabel = (score: number) => {
    if (score >= 80) return { label: t("cockpit.excellent"), color: "text-warning" };
    if (score >= 60) return { label: t("cockpit.good"), color: "text-primary" };
    if (score >= 40) return { label: t("cockpit.moderate"), color: "text-muted-foreground" };
    return { label: t("cockpit.needsImprovement"), color: "text-accent" };
  };

  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="w-3 h-3 text-chart-3" />;
    if (trend === "down") return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const weather = getWeatherLabel(overallScore);

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
              <span className="relative">
                {t("cockpit.businessWeather")}
                <span className="absolute -right-2 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </span>
           </CardTitle>
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <button type="button" className="focus:outline-none">
                   <HelpCircle className="w-4 h-4 text-muted-foreground" />
                 </button>
               </TooltipTrigger>
               <TooltipContent className="max-w-xs">
                 <p className="text-xs">
                   {t("cockpit.healthTooltip")}
                 </p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
          <Badge variant="outline" className={weather.color}>
            {weather.label}
          </Badge>
        </div>
        <CardDescription>{t("cockpit.healthScoreDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          {getWeatherIcon(overallScore)}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{overallScore}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Progress value={overallScore} className="h-2 mt-1" />
          </div>
        </div>

        <div className="space-y-2">
          {metrics.map((metric) => (
            <div key={metric.nameKey} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate">{t(metric.nameKey)}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    {metric.score}%
                  </span>
                </div>
                <Progress value={metric.score} className="h-1 mt-0.5" />
              </div>
            </div>
          ))}
        </div>

        {overallScore < 80 && (
          <div className="mt-4 p-2 rounded-md bg-muted/50 text-xs text-muted-foreground">
            💡 {metrics.find((m) => m.score < 50)?.description || t("cockpit.keepUsing")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
