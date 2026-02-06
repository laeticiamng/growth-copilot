import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";

interface KPISparklineProps {
  title: string;
  value: string | number;
  previousValue?: number;
  currentValue?: number;
  sparklineData?: { value: number }[];
  unit?: string;
  icon?: React.ReactNode;
  trendLabel?: string;
}

export function KPISparkline({
  title,
  value,
  previousValue,
  currentValue,
  sparklineData,
  unit = "",
  icon,
  trendLabel,
}: KPISparklineProps) {
  const { i18n } = useTranslation();
  // Calculate trend
  const trend = previousValue && currentValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : null;

  const getTrendColor = () => {
    if (!trend) return "text-muted-foreground";
    if (trend > 0) return "text-green-500";
    if (trend < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-3 h-3" />;
    if (trend > 0) return <TrendingUp className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString(getIntlLocale(i18n.language)) : value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        
        {/* Trend indicator */}
        {trend !== null && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trend).toFixed(1)}%</span>
            {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
          </div>
        )}

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={trend && trend > 0 ? "hsl(142, 76%, 36%)" : trend && trend < 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
