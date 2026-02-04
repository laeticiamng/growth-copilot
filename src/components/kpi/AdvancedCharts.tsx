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

const sampleTimeData: ChartData[] = [
  { date: "Jan", sessions: 4200, conversions: 120, revenue: 12000, cac: 45, ltv: 180 },
  { date: "Fév", sessions: 4800, conversions: 145, revenue: 14500, cac: 42, ltv: 195 },
  { date: "Mar", sessions: 5200, conversions: 168, revenue: 16800, cac: 38, ltv: 210 },
  { date: "Avr", sessions: 4900, conversions: 155, revenue: 15500, cac: 40, ltv: 205 },
  { date: "Mai", sessions: 5800, conversions: 195, revenue: 19500, cac: 35, ltv: 225 },
  { date: "Jun", sessions: 6400, conversions: 225, revenue: 22500, cac: 32, ltv: 240 },
  { date: "Jul", sessions: 7200, conversions: 260, revenue: 26000, cac: 30, ltv: 255 },
  { date: "Aoû", sessions: 6800, conversions: 240, revenue: 24000, cac: 31, ltv: 250 },
  { date: "Sep", sessions: 7500, conversions: 280, revenue: 28000, cac: 28, ltv: 265 },
  { date: "Oct", sessions: 8200, conversions: 310, revenue: 31000, cac: 26, ltv: 280 },
  { date: "Nov", sessions: 9000, conversions: 350, revenue: 35000, cac: 24, ltv: 295 },
  { date: "Déc", sessions: 9800, conversions: 390, revenue: 39000, cac: 22, ltv: 310 },
];

const channelData: ChannelData[] = [
  { channel: "Organic", sessions: 35000, conversions: 1400, revenue: 140000, roi: 450 },
  { channel: "Paid Search", sessions: 18000, conversions: 720, revenue: 72000, roi: 280 },
  { channel: "Social", sessions: 12000, conversions: 360, revenue: 36000, roi: 180 },
  { channel: "Email", sessions: 8000, conversions: 640, revenue: 64000, roi: 520 },
  { channel: "Direct", sessions: 15000, conversions: 450, revenue: 45000, roi: 320 },
  { channel: "Referral", sessions: 6000, conversions: 240, revenue: 24000, roi: 400 },
];

const funnelData: FunnelData[] = [
  { stage: "Visiteurs", value: 10000, fill: COLORS[0] },
  { stage: "Leads", value: 3500, fill: COLORS[1] },
  { stage: "MQL", value: 1200, fill: COLORS[2] },
  { stage: "SQL", value: 600, fill: COLORS[3] },
  { stage: "Opportunités", value: 250, fill: COLORS[4] },
  { stage: "Clients", value: 85, fill: COLORS[5] },
];

const radarData = [
  { metric: "SEO", score: 78, benchmark: 65 },
  { metric: "Ads", score: 65, benchmark: 70 },
  { metric: "Social", score: 82, benchmark: 60 },
  { metric: "Email", score: 90, benchmark: 75 },
  { metric: "CRO", score: 72, benchmark: 68 },
  { metric: "Content", score: 85, benchmark: 72 },
];

export function AdvancedCharts() {
  const [period, setPeriod] = useState("12m");
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area");

  const handleExport = (chartName: string) => {
    // In production, this would export chart as PNG/SVG
    console.log(`Exporting ${chartName} chart`);
  };

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
                <AreaChart data={sampleTimeData}>
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
                <LineChart data={sampleTimeData}>
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
                <BarChart data={sampleTimeData}>
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
              <ComposedChart data={sampleTimeData}>
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
              <span>CAC moyen: {Math.round(sampleTimeData.reduce((a, b) => a + b.cac, 0) / sampleTimeData.length)}€</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>LTV moyen: {Math.round(sampleTimeData.reduce((a, b) => a + b.ltv, 0) / sampleTimeData.length)}€</span>
            </div>
            <Badge variant="success">
              Ratio LTV/CAC: {(sampleTimeData.reduce((a, b) => a + b.ltv, 0) / sampleTimeData.reduce((a, b) => a + b.cac, 0)).toFixed(1)}x
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedCharts;
