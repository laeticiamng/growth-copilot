import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Gauge, Cpu, Database, Zap, AlertTriangle, ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface QuotaItem {
  label: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ElementType;
  warning?: boolean;
  critical?: boolean;
}

export function WorkspaceQuotaWidget() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  
  const { data: quota, isLoading } = useQuery({
    queryKey: ['workspace-quota', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;
      const { data, error } = await supabase.from('workspace_quotas').select('*').eq('workspace_id', currentWorkspace.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!currentWorkspace?.id,
    refetchInterval: 60000,
  });

  const { data: planLimits } = useQuery({
    queryKey: ['workspace-plan', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;
      const planDefaults: Record<string, { tokens: number; crawls: number; runs: number }> = {
        free: { tokens: 100000, crawls: 10, runs: 50 },
        starter: { tokens: 1000000, crawls: 100, runs: 500 },
        growth: { tokens: 10000000, crawls: 1000, runs: 5000 },
        agency: { tokens: 50000000, crawls: 5000, runs: 25000 },
      };
      return planDefaults[quota?.plan_tier || 'free'] || planDefaults.free;
    },
    enabled: !!quota,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            {t("cockpit.quotaTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tokenUsed = quota?.monthly_tokens_used || 0;
  const tokenLimit = planLimits?.tokens || 100000;
  const tokenPercent = Math.min((tokenUsed / tokenLimit) * 100, 100);
  const crawlsUsed = quota?.crawls_today || 0;
  const crawlsLimit = planLimits?.crawls || 10;
  const crawlsPercent = Math.min((crawlsUsed / crawlsLimit) * 100, 100);
  const runsUsed = quota?.concurrent_runs || 0;
  const runsLimit = planLimits?.runs || 50;
  const runsPercent = Math.min((runsUsed / runsLimit) * 100, 100);

  const quotas: QuotaItem[] = [
    { label: t("cockpit.quotaAiTokens"), used: Math.round(tokenUsed / 1000), limit: Math.round(tokenLimit / 1000), unit: "K", icon: Cpu, warning: tokenPercent >= 70, critical: tokenPercent >= 90 },
    { label: t("cockpit.quotaCrawlsToday"), used: crawlsUsed, limit: crawlsLimit, unit: "", icon: Database, warning: crawlsPercent >= 70, critical: crawlsPercent >= 90 },
    { label: t("cockpit.quotaConcurrentRuns"), used: runsUsed, limit: runsLimit, unit: "", icon: Zap, warning: runsPercent >= 70, critical: runsPercent >= 90 },
  ];

  const hasWarning = quotas.some(q => q.warning);
  const hasCritical = quotas.some(q => q.critical);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            {t("cockpit.quotaTitle")}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasCritical && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="w-3 h-3" />{t("cockpit.quotaNearLimit")}
              </Badge>
            )}
            {hasWarning && !hasCritical && (
              <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-700">{t("cockpit.quotaWarning")}</Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">{quota?.plan_tier || 'free'}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {quotas.map((item) => {
          const Icon = item.icon;
          const percent = (item.used / item.limit) * 100;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", item.critical ? "text-destructive" : item.warning ? "text-yellow-500" : "text-muted-foreground")} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className={cn("text-xs", item.critical ? "text-destructive font-medium" : "text-muted-foreground")}>
                  {item.used.toLocaleString()}{item.unit} / {item.limit.toLocaleString()}{item.unit}
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Progress value={percent} className={cn("h-2", item.critical && "[&>div]:bg-destructive", item.warning && !item.critical && "[&>div]:bg-yellow-500")} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{t("cockpit.quotaUsed", { percent: percent.toFixed(1) })}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
          <Link to="/dashboard/billing">{t("cockpit.quotaManage")}<ArrowUpRight className="w-4 h-4 ml-2" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
