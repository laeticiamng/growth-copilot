import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";

interface LatencyDataPoint {
  timestamp: string;
  database: number;
  auth: number;
  edgeFunctions: number;
  storage: number;
}

interface LatencyHistoryChartProps {
  data?: LatencyDataPoint[];
}

export function LatencyHistoryChart({ data }: LatencyHistoryChartProps) {
  const { i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const [historyData, setHistoryData] = useState<LatencyDataPoint[]>([]);

  useEffect(() => {
    // Load from localStorage if no data provided
    if (!data) {
      const stored = localStorage.getItem('latency_history');
      if (stored) {
        try {
          setHistoryData(JSON.parse(stored).slice(-20)); // Keep last 20 entries
        } catch {
          setHistoryData([]);
        }
      }
    } else {
      setHistoryData(data);
    }
  }, [data]);

  if (historyData.length < 2) {
    return (
      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Historique de latence
          </CardTitle>
          <CardDescription>
            Au moins 2 health checks requis pour afficher l'historique
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          Lancez plusieurs health checks pour voir l'évolution
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="feature">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Historique de latence
        </CardTitle>
        <CardDescription>
          Évolution des temps de réponse sur les derniers checks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="timestamp" 
              className="text-xs"
              tickFormatter={(val) => new Date(val).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            />
            <YAxis 
              className="text-xs"
              tickFormatter={(val) => `${val}ms`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={(val) => new Date(val).toLocaleString(locale)}
              formatter={(value: number) => [`${value}ms`, '']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="database" 
              name="Database" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="auth" 
              name="Auth" 
              stroke="hsl(142, 76%, 36%)" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="edgeFunctions" 
              name="Edge Functions" 
              stroke="hsl(38, 92%, 50%)" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="storage" 
              name="Storage" 
              stroke="hsl(280, 65%, 60%)" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
