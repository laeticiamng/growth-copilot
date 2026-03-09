import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Zap, Trash2, Sun, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateData(baseFn: (i: number, rand: number) => number) {
  return MONTHS.map((m, i) => ({
    month: m,
    value: baseFn(i, seededRandom(i * 17 + 42)),
  }));
}

interface KPICardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  positive: boolean;
  icon: React.ElementType;
  data: { month: string; value: number }[];
  color: string;
}

function KPICard({ title, value, trend, trendValue, positive, icon: Icon, data, color }: KPICardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold mb-3">{value}</p>
        <div className="h-[80px]" role="img" aria-label={`${title}: ${value}, ${trendValue}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={color} fill={`url(#gradient-${title.replace(/\s/g, '')})`} strokeWidth={2} dot={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function GreenKPIDashboard() {
  const { t } = useTranslation();

  const energyData = useMemo(() => generateData((i, r) => Math.round(4200 - i * 120 + r * 200 - 100)), []);
  const wasteData = useMemo(() => generateData((i, r) => Math.min(100, Math.round(35 + i * 5 + r * 5))), []);
  const renewableData = useMemo(() => generateData((i, r) => Math.min(100, Math.round(12 + i * 6 + r * 3))), []);
  const intensityData = useMemo(() => generateData((i, r) => Math.max(5, Math.round(28 - i * 1.8 + r * 2))), []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t("eco.greenKpiTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("eco.greenKpiDesc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard
          title={t("eco.energyConsumption")}
          value="2 840 kWh"
          trend="down"
          trendValue="-18%"
          positive={true}
          icon={Zap}
          data={energyData}
          color="hsl(45, 93%, 58%)"
        />
        <KPICard
          title={t("eco.wasteReduction")}
          value="78%"
          trend="up"
          trendValue="+12%"
          positive={true}
          icon={Trash2}
          data={wasteData}
          color="hsl(142, 76%, 45%)"
        />
        <KPICard
          title={t("eco.renewableEnergy")}
          value="72%"
          trend="up"
          trendValue="+25%"
          positive={true}
          icon={Sun}
          data={renewableData}
          color="hsl(187, 85%, 53%)"
        />
        <KPICard
          title={t("eco.carbonIntensity")}
          value="8.2 gCO₂/€"
          trend="down"
          trendValue="-32%"
          positive={true}
          icon={BarChart3}
          data={intensityData}
          color="hsl(262, 83%, 65%)"
        />
      </div>
    </div>
  );
}
