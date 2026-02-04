import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

type ViewMode = "executions" | "duration" | "success";
type TimeRange = "7d" | "30d" | "90d";

export function AgentPerformanceChart() {
  const { currentWorkspace } = useWorkspace();
  const [viewMode, setViewMode] = useState<ViewMode>("executions");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  
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

  const chartData = useMemo(() => {
    if (!runs) return [];
    
    const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
    
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRuns = runs.filter(r => r.created_at?.startsWith(dateStr));
      
      const successCount = dayRuns.filter(r => r.status === 'completed').length;
      const failCount = dayRuns.filter(r => r.status === 'failed').length;
      const avgDuration = dayRuns.length > 0
        ? dayRuns.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / dayRuns.length / 1000
        : 0;
      
      return {
        date: format(date, 'dd/MM', { locale: fr }),
        fullDate: dateStr,
        executions: dayRuns.length,
        success: successCount,
        failed: failCount,
        successRate: dayRuns.length > 0 ? (successCount / dayRuns.length) * 100 : 0,
        avgDuration: Math.round(avgDuration * 10) / 10,
      };
    });
  }, [runs, startDate]);

  const totals = useMemo(() => {
    if (!runs) return { total: 0, success: 0, failed: 0, avgDuration: 0, successRate: 0 };
    
    const success = runs.filter(r => r.status === 'completed').length;
    const failed = runs.filter(r => r.status === 'failed').length;
    const avgDuration = runs.length > 0
      ? runs.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / runs.length / 1000
      : 0;
    
    return {
      total: runs.length,
      success,
      failed,
      avgDuration: Math.round(avgDuration * 10) / 10,
      successRate: runs.length > 0 ? (success / runs.length) * 100 : 0,
    };
  }, [runs]);

  const getChartContent = () => {
    if (viewMode === "executions") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar dataKey="success" fill="hsl(var(--chart-3))" name="Succès" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Échecs" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (viewMode === "duration") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" unit="s" />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value}s`, 'Durée moy.']}
            />
            <Area 
              type="monotone" 
              dataKey="avgDuration" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary) / 0.2)"
              name="Durée moyenne"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            className="text-muted-foreground"
          />
          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" unit="%" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taux de succès']}
          />
          <Area 
            type="monotone" 
            dataKey="successRate" 
            stroke="hsl(var(--chart-3))" 
            fill="hsl(var(--chart-3) / 0.2)"
            name="Taux de succès"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Performance des Agents</CardTitle>
            <CardDescription>
              {totals.total} exécutions sur les {days} derniers jours
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executions">Exécutions</SelectItem>
                <SelectItem value="duration">Durée moy.</SelectItem>
                <SelectItem value="success">Taux succès</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* KPI Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-2xl font-bold">{totals.total}</p>
            <p className="text-xs text-muted-foreground">Exécutions</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-chart-3/10">
            <p className="text-2xl font-bold text-chart-3">{totals.success}</p>
            <p className="text-xs text-muted-foreground">Succès</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold text-destructive">{totals.failed}</p>
            <p className="text-xs text-muted-foreground">Échecs</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">{totals.avgDuration}s</p>
            <p className="text-xs text-muted-foreground">Durée moy.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          getChartContent()
        )}
      </CardContent>
    </Card>
  );
}
