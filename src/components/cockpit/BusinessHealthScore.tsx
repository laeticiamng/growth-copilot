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
   RefreshCw,
 } from "lucide-react";
 import { useMultiTableSubscription } from "@/hooks/useRealtimeSubscription";

interface HealthMetric {
  name: string;
  score: number;
  weight: number;
  trend?: "up" | "down" | "stable";
  description: string;
}

interface BusinessHealthScoreProps {
  className?: string;
}

export function BusinessHealthScore({ className }: BusinessHealthScoreProps) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);
   const [loading, setLoading] = useState(true);
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

   const calculateHealth = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
       return;
    }
     
     setLoading(true);
     const newMetrics: HealthMetric[] = [];
 
     try {
        // 1. Site configuré (20%)
        const { count: sitesCount } = await supabase
          .from("sites")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", currentWorkspace.id);

        newMetrics.push({
          name: "Configuration",
          score: sitesCount && sitesCount > 0 ? 100 : 0,
          weight: 20,
          trend: "stable",
          description: sitesCount && sitesCount > 0 ? "Site configuré" : "Aucun site configuré",
        });

        // 2. Intégrations actives (20%)
        const { count: integrationsCount } = await supabase
          .from("integrations")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", currentWorkspace.id)
          .eq("status", "connected");

        const integrationScore = Math.min((integrationsCount || 0) * 25, 100);
        newMetrics.push({
          name: "Intégrations",
          score: integrationScore,
          weight: 20,
          trend: integrationScore >= 50 ? "up" : "stable",
          description: `${integrationsCount || 0} intégration(s) active(s)`,
        });

        // 3. Runs récents (7 jours) (20%)
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
          name: "Activité IA",
          score: runsScore,
          weight: 20,
          trend: (runsCount || 0) > 5 ? "up" : (runsCount || 0) > 0 ? "stable" : "down",
          description: `${runsCount || 0} exécutions cette semaine`,
        });

        // 4. Approbations en attente (15%) - moins = mieux
        const { count: pendingCount } = await supabase
          .from("approval_queue")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", currentWorkspace.id)
          .eq("status", "pending");

        const approvalScore = Math.max(100 - (pendingCount || 0) * 20, 0);
        newMetrics.push({
          name: "Approbations",
          score: approvalScore,
          weight: 15,
          trend: (pendingCount || 0) === 0 ? "up" : (pendingCount || 0) <= 3 ? "stable" : "down",
          description: (pendingCount || 0) === 0 ? "À jour" : `${pendingCount} en attente`,
        });

        // 5. KPIs collectés (25%)
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
          name: "Données KPI",
          score: kpiScore,
          weight: 25,
          trend: kpiScore >= 50 ? "up" : kpiScore > 0 ? "stable" : "down",
          description: kpiScore > 0 ? "Données collectées" : "En attente de sync",
        });

        setMetrics(newMetrics);

        // Calculate overall weighted score
        const totalWeight = newMetrics.reduce((sum, m) => sum + m.weight, 0);
        const weightedSum = newMetrics.reduce((sum, m) => sum + (m.score * m.weight) / 100, 0);
        const overall = Math.round((weightedSum / totalWeight) * 100);
        setOverallScore(overall);
     } catch (error) {
       console.error("[BusinessHealth] Error:", error);
     } finally {
       setLoading(false);
       setLastUpdate(new Date());
     }
   }, [currentWorkspace?.id, currentSite?.id]);

   // Initial fetch
   useEffect(() => {
     calculateHealth();
   }, [calculateHealth]);
 
   // Real-time subscriptions
   useMultiTableSubscription(
     `health-score-${currentWorkspace?.id}`,
     [
       {
         table: 'sites',
         filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
         onPayload: () => calculateHealth(),
       },
       {
         table: 'integrations',
         filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
         onPayload: () => calculateHealth(),
       },
       {
         table: 'agent_runs',
         filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
         onPayload: () => calculateHealth(),
       },
       {
         table: 'approval_queue',
         filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
         onPayload: () => calculateHealth(),
       },
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
    if (score >= 80) return { label: "Excellent", color: "text-warning" };
    if (score >= 60) return { label: "Bon", color: "text-primary" };
    if (score >= 40) return { label: "Modéré", color: "text-muted-foreground" };
    return { label: "À améliorer", color: "text-accent" };
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
         <CardTitle className="text-base flex items-center gap-2">
             <span className="relative">
               Météo Business
               <span className="absolute -right-2 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
             </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Score composite basé sur la configuration, les intégrations,
                    l'activité IA, les approbations et les données KPI collectées.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Badge variant="outline" className={weather.color}>
            {weather.label}
          </Badge>
        </div>
        <CardDescription>Score de santé global de votre workspace</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Main Score */}
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

        {/* Metric Breakdown */}
        <div className="space-y-2">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate">{metric.name}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    {metric.score}%
                  </span>
                </div>
                <Progress
                  value={metric.score}
                  className="h-1 mt-0.5"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Improvement tip */}
        {overallScore < 80 && (
          <div className="mt-4 p-2 rounded-md bg-muted/50 text-xs text-muted-foreground">
            💡 {metrics.find((m) => m.score < 50)?.description || "Continuez à utiliser la plateforme pour améliorer votre score."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
