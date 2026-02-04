import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend 
} from "recharts";
import { Loader2, Bot } from "lucide-react";
import { subDays } from "date-fns";

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--accent))',
];

const AGENT_LABELS: Record<string, string> = {
  seo_auditor: "SEO Auditor",
  content_strategist: "Content Strategist",
  analytics: "Analytics",
  social_distribution: "Social Distribution",
  copywriting: "Copywriting",
  competitive_intel: "Competitive Intel",
  cgo: "CGO Agent",
  meta_ads: "Meta Ads",
  media_promotion: "Media Promotion",
  report_generator: "Report Generator",
};

export function AgentBreakdownChart() {
  const { currentWorkspace } = useWorkspace();
  const startDate = subDays(new Date(), 30);

  const { data: runs, isLoading } = useQuery({
    queryKey: ['agent-breakdown', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('agent_runs')
        .select('agent_type, status, duration_ms')
        .eq('workspace_id', currentWorkspace.id)
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const chartData = useMemo(() => {
    if (!runs || runs.length === 0) return [];

    const byAgent = runs.reduce((acc, run) => {
      const agent = run.agent_type;
      if (!acc[agent]) {
        acc[agent] = { total: 0, completed: 0, failed: 0, duration: 0 };
      }
      acc[agent].total++;
      if (run.status === 'completed') acc[agent].completed++;
      if (run.status === 'failed') acc[agent].failed++;
      acc[agent].duration += run.duration_ms || 0;
      return acc;
    }, {} as Record<string, { total: number; completed: number; failed: number; duration: number }>);

    return Object.entries(byAgent)
      .map(([agent, stats]) => ({
        name: AGENT_LABELS[agent] || agent.replace(/_/g, ' '),
        value: stats.total,
        completed: stats.completed,
        failed: stats.failed,
        successRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        avgDuration: stats.total > 0 ? Math.round(stats.duration / stats.total / 1000) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [runs]);

  const totalRuns = chartData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">{data.value} exécutions</p>
        <p className="text-sm text-primary">Succès: {data.successRate}%</p>
        <p className="text-sm text-muted-foreground">Durée moy: {data.avgDuration}s</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Répartition par Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] text-center">
          <Bot className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Aucune exécution d'agent</p>
          <p className="text-xs text-muted-foreground">Les données apparaîtront ici</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Répartition par Agent
            </CardTitle>
            <CardDescription>{totalRuns} exécutions (30 jours)</CardDescription>
          </div>
          <Badge variant="outline">{chartData.length} agents actifs</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with stats */}
          <div className="space-y-2">
            {chartData.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="flex-1 truncate">{item.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.value}
                </Badge>
                <span className={`text-xs ${item.successRate >= 80 ? 'text-green-600' : item.successRate >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
                  {item.successRate}%
                </span>
              </div>
            ))}
            {chartData.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{chartData.length - 5} autres agents
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
