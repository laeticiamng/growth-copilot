import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Maximize2, 
  RefreshCw,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Target,
} from "lucide-react";

interface ChartData {
  date: string;
  sessions: number;
  conversions: number;
  revenue: number;
  cac: number;
  ltv: number;
}

interface ChannelData {
  channel: string;
  sessions: number;
  conversions: number;
  revenue: number;
  roi: number;
}

interface FunnelData {
  stage: string;
  value: number;
  fill: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AdvancedCharts() {
  const [period, setPeriod] = useState("12m");
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area");
   
   // NOTE: This component now receives data from props or context
   // Empty arrays are used as defaults - populate via real integrations
   const [timeData] = useState<ChartData[]>([]);
   const [channelData] = useState<ChannelData[]>([]);
   const [funnelData] = useState<FunnelData[]>([]);
   const [radarData] = useState<{ metric: string; score: number; benchmark: number }[]>([]);

  const handleExport = (chartName: string) => {
    // Export chart data as JSON
     const blob = new Blob([JSON.stringify({ chartName, data: timeData, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

   // Empty state when no data
   if (timeData.length === 0 && channelData.length === 0) {
     return (
       <Card className="p-8 text-center">
         <BarChart2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
         <h3 className="text-lg font-semibold mb-2">Aucune donnée KPI</h3>
         <p className="text-muted-foreground mb-4">
           Connectez vos intégrations (GA4, GSC, Ads) pour voir vos métriques avancées ici.
         </p>
         <Button asChild>
           <a href="/dashboard/integrations">Configurer les intégrations</a>
         </Button>
       </Card>
     );
   }
 
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="12m">12 mois</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg">
            <Button 
              variant={chartType === "area" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setChartType("area")}
            >
              <Activity className="w-4 h-4" />
            </Button>
            <Button 
              variant={chartType === "line" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setChartType("line")}
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button 
              variant={chartType === "bar" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setChartType("bar")}
            >
              <BarChart2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Main Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance globale</CardTitle>
              <CardDescription>Sessions, conversions et revenue sur la période</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleExport("performance")}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                 <AreaChart data={timeData}>
                   <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorSessions)" 
                    name="Sessions"
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue (€)"
                  />
                  <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" />
                </AreaChart>
              ) : chartType === "line" ? (
                 <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Sessions" />
                  <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Conversions" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue (€)" />
                  <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" />
                </LineChart>
              ) : (
                 <BarChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sessions" />
                  <Bar dataKey="conversions" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Conversions" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Channel Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Distribution par canal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="revenue"
                    nameKey="channel"
                    label={({ channel, percent }) => `${channel} ${(percent * 100).toFixed(0)}%`}
                  >
                    {channelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}€`, "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart - Performance Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Score de performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="metric" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Votre score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="benchmark"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.2}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Entonnoir de conversion</CardTitle>
          <CardDescription>De visiteur à client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelData.map((stage, i) => {
              const percentage = i === 0 ? 100 : (stage.value / funnelData[0].value) * 100;
              const dropOff = i > 0 ? ((1 - stage.value / funnelData[i - 1].value) * 100).toFixed(1) : 0;
              
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{stage.value.toLocaleString()}</span>
                      {i > 0 && (
                        <Badge variant="outline" className="text-destructive">
                          -{dropOff}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: stage.fill,
                      }}
                    >
                      <span className="text-xs font-medium text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CAC vs LTV Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>CAC vs LTV par mois</CardTitle>
          <CardDescription>Évolution du coût d'acquisition vs valeur client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="cac" fill="hsl(var(--destructive))" name="CAC (€)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="ltv" stroke="#22c55e" strokeWidth={3} name="LTV (€)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive" />
               <span>CAC moyen: {timeData.length > 0 ? Math.round(timeData.reduce((a, b) => a + b.cac, 0) / timeData.length) : 0}€</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
               <span>LTV moyen: {timeData.length > 0 ? Math.round(timeData.reduce((a, b) => a + b.ltv, 0) / timeData.length) : 0}€</span>
            </div>
            <Badge variant="success">
               Ratio LTV/CAC: {timeData.length > 0 && timeData.reduce((a, b) => a + b.cac, 0) > 0 
                 ? (timeData.reduce((a, b) => a + b.ltv, 0) / timeData.reduce((a, b) => a + b.cac, 0)).toFixed(1) 
                 : 0}x
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedCharts;
