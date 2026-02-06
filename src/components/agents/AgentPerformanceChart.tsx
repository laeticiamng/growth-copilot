import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Loader2 } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { fr, enUS, es, de, it, pt, nl } from "date-fns/locale";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const dateLocaleMap: Record<string, typeof enUS> = { fr, en: enUS, es, de, it, pt, nl };

type ViewMode = "executions" | "duration" | "success";
type TimeRange = "7d" | "30d" | "90d";

export function AgentPerformanceChart() {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("executions");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const locale = dateLocaleMap[i18n.language] || enUS;
  
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = subDays(new Date(), days);

  const { data: runs, isLoading } = useQuery({
    queryKey: ['agent-performance', currentWorkspace?.id, timeRange],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data, error } = await supabase
        .from('agent_runs')
        .select('agent_type, status, duration_ms, created_at')
        .eq('workspace_id', currentWorkspace.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const handleRealtimeUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['agent-performance', currentWorkspace?.id, timeRange] });
  }, [queryClient, currentWorkspace?.id, timeRange]);

  useRealtimeSubscription(
    `agent-perf-${currentWorkspace?.id}`,
    { table: 'agent_runs', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined },
    handleRealtimeUpdate,
    !!currentWorkspace?.id
  );

  const chartData = useMemo(() => {
    if (!runs) return [];
    const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRuns = runs.filter(r => r.created_at?.startsWith(dateStr));
      const successCount = dayRuns.filter(r => r.status === 'completed').length;
      const failCount = dayRuns.filter(r => r.status === 'failed').length;
      const avgDuration = dayRuns.length > 0 ? dayRuns.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / dayRuns.length / 1000 : 0;
      return {
        date: format(date, 'dd/MM', { locale }),
        fullDate: dateStr,
        executions: dayRuns.length,
        success: successCount,
        failed: failCount,
        successRate: dayRuns.length > 0 ? (successCount / dayRuns.length) * 100 : 0,
        avgDuration: Math.round(avgDuration * 10) / 10,
      };
    });
  }, [runs, startDate, locale]);

  const totals = useMemo(() => {
    if (!runs) return { total: 0, success: 0, failed: 0, avgDuration: 0, successRate: 0 };
    const success = runs.filter(r => r.status === 'completed').length;
    const failed = runs.filter(r => r.status === 'failed').length;
    const avgDuration = runs.length > 0 ? runs.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / runs.length / 1000 : 0;
    return { total: runs.length, success, failed, avgDuration: Math.round(avgDuration * 10) / 10, successRate: runs.length > 0 ? (success / runs.length) * 100 : 0 };
  }, [runs]);

  const getChartContent = () => {
    if (viewMode === "executions") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} labelStyle={{ fontWeight: 'bold' }} />
            <Bar dataKey="success" fill="hsl(var(--chart-3))" name={t("cockpit.agentPerfSuccess")} radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed" fill="hsl(var(--destructive))" name={t("cockpit.agentPerfFailed")} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (viewMode === "duration") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" unit="s" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [`${value}s`, t("cockpit.agentPerfAvgDuration")]} />
            <Area type="monotone" dataKey="avgDuration" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name={t("cockpit.agentPerfAvgDuration")} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" unit="%" domain={[0, 100]} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [`${value.toFixed(1)}%`, t("cockpit.agentPerfSuccessRate")]} />
          <Area type="monotone" dataKey="successRate" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.2)" name={t("cockpit.agentPerfSuccessRate")} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="relative">
                {t("cockpit.agentPerfTitle")}
                <span className="absolute -right-2 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </span>
            </CardTitle>
            <CardDescription>
              {t("cockpit.agentPerfExecutions", { count: totals.total, days })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="executions">{t("cockpit.agentPerfViewExecs")}</SelectItem>
                <SelectItem value="duration">{t("cockpit.agentPerfViewDuration")}</SelectItem>
                <SelectItem value="success">{t("cockpit.agentPerfViewSuccess")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("cockpit.agentPerfPeriod7d")}</SelectItem>
                <SelectItem value="30d">{t("cockpit.agentPerfPeriod30d")}</SelectItem>
                <SelectItem value="90d">{t("cockpit.agentPerfPeriod90d")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-2xl font-bold">{totals.total}</p>
            <p className="text-xs text-muted-foreground">{t("cockpit.agentPerfViewExecs")}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-chart-3/10">
            <p className="text-2xl font-bold text-chart-3">{totals.success}</p>
            <p className="text-xs text-muted-foreground">{t("cockpit.agentPerfSuccess")}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold text-destructive">{totals.failed}</p>
            <p className="text-xs text-muted-foreground">{t("cockpit.agentPerfFailed")}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">{totals.avgDuration}s</p>
            <p className="text-xs text-muted-foreground">{t("cockpit.agentPerfViewDuration")}</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : getChartContent()}
      </CardContent>
    </Card>
  );
}
