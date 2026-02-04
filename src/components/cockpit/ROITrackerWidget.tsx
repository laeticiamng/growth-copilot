import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Zap,
  Calculator,
  HelpCircle,
  ArrowUpRight,
  Bot,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ROITrackerWidgetProps {
  className?: string;
}

// Constants for ROI calculation
const HOURLY_RATE_HUMAN = 45; // €/hour for a marketing specialist
const AI_MULTIPLIER = 3; // AI is 3x faster
const MONTHLY_PLATFORM_COST = 299; // € per month

export function ROITrackerWidget({ className }: ROITrackerWidgetProps) {
  const { currentWorkspace } = useWorkspace();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['roi-metrics', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch agent runs with duration
      const { data: runs, error } = await supabase
        .from('agent_runs')
        .select('duration_ms, agent_type, status, cost_estimate')
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Calculate metrics
      const totalTasks = runs?.length || 0;
      const totalDurationMs = runs?.reduce((sum, r) => sum + (r.duration_ms || 0), 0) || 0;
      const totalDurationHours = totalDurationMs / (1000 * 60 * 60);
      
      // Time saved = AI time * multiplier (what it would have taken a human)
      const humanEquivalentHours = totalDurationHours * AI_MULTIPLIER;
      const timeSavedHours = humanEquivalentHours - totalDurationHours;
      
      // Money saved = human equivalent time * hourly rate
      const moneySavedFromTime = humanEquivalentHours * HOURLY_RATE_HUMAN;
      
      // AI costs
      const aiCosts = runs?.reduce((sum, r) => sum + (r.cost_estimate || 0), 0) || 0;
      
      // Net savings = money saved - platform cost - AI costs
      const netSavings = moneySavedFromTime - MONTHLY_PLATFORM_COST - aiCosts;
      
      // ROI percentage
      const totalInvestment = MONTHLY_PLATFORM_COST + aiCosts;
      const roi = totalInvestment > 0 ? ((moneySavedFromTime - totalInvestment) / totalInvestment) * 100 : 0;

      // Tasks by agent type
      const tasksByAgent = runs?.reduce((acc, r) => {
        acc[r.agent_type] = (acc[r.agent_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalTasks,
        totalDurationHours: Math.round(totalDurationHours * 10) / 10,
        humanEquivalentHours: Math.round(humanEquivalentHours * 10) / 10,
        timeSavedHours: Math.round(timeSavedHours * 10) / 10,
        moneySavedFromTime: Math.round(moneySavedFromTime),
        aiCosts: Math.round(aiCosts * 100) / 100,
        platformCost: MONTHLY_PLATFORM_COST,
        netSavings: Math.round(netSavings),
        roi: Math.round(roi),
        tasksByAgent,
      };
    },
    enabled: !!currentWorkspace?.id,
    refetchInterval: 60000, // Refresh every minute
  });

  const topAgents = useMemo(() => {
    if (!metrics?.tasksByAgent) return [];
    return Object.entries(metrics.tasksByAgent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([agent, count]) => ({
        agent: agent.replace(/_/g, ' '),
        count,
      }));
  }, [metrics?.tasksByAgent]);

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const roiColor = (metrics?.roi || 0) > 0 
    ? "text-primary" 
    : "text-destructive";

  return (
    <Card className={cn("overflow-hidden flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            ROI Temps Réel
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Calcul basé sur un coût horaire de {HOURLY_RATE_HUMAN}€/h,
                    un multiplicateur IA de {AI_MULTIPLIER}x, et le coût plateforme de {MONTHLY_PLATFORM_COST}€/mois.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Badge 
            variant={(metrics?.roi || 0) > 0 ? "success" : "destructive"}
            className="flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            {metrics?.roi || 0}% ROI
          </Badge>
        </div>
        <CardDescription>30 derniers jours</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* Main Savings Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
          <div>
            <p className="text-sm text-muted-foreground">Économies nettes</p>
            <p className={cn("text-3xl font-bold", roiColor)}>
              {(metrics?.netSavings || 0) > 0 ? '+' : ''}{metrics?.netSavings || 0}€
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Temps gagné</p>
            <p className="text-2xl font-bold text-primary">
              {metrics?.timeSavedHours || 0}h
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Tâches IA</span>
            </div>
            <p className="text-xl font-bold">{metrics?.totalTasks || 0}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Durée IA</span>
            </div>
            <p className="text-xl font-bold">{metrics?.totalDurationHours || 0}h</p>
          </div>
          
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Équiv. humain</span>
            </div>
            <p className="text-xl font-bold">{metrics?.humanEquivalentHours || 0}h</p>
          </div>
          
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Coûts IA</span>
            </div>
            <p className="text-xl font-bold">{metrics?.aiCosts || 0}€</p>
          </div>
        </div>

        {/* Top Agents */}
        {topAgents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Agents les plus actifs</p>
            {topAgents.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="capitalize">{item.agent}</span>
                    <span className="text-muted-foreground">{item.count} tâches</span>
                  </div>
                  <Progress 
                    value={(item.count / (metrics?.totalTasks || 1)) * 100} 
                    className="h-1.5" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cost Breakdown Footer */}
        <div className="pt-3 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Valeur produite (équiv. humain)</span>
            <span className="font-medium text-foreground">+{metrics?.moneySavedFromTime || 0}€</span>
          </div>
          <div className="flex justify-between">
            <span>Coût plateforme</span>
            <span className="text-destructive">-{metrics?.platformCost || 0}€</span>
          </div>
          <div className="flex justify-between">
            <span>Coûts IA (tokens)</span>
            <span className="text-destructive">-{metrics?.aiCosts || 0}€</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
