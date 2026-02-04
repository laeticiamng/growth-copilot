import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface KPISparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showArea?: boolean;
}

export function KPISparkline({ 
  data, 
  color = "hsl(var(--primary))", 
  height = 40,
  showArea = false,
}: KPISparklineProps) {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({ value, index }));
  }, [data]);

  if (data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground text-xs"
        style={{ height }}
      >
        Données insuffisantes
      </div>
    );
  }

  // Calculate trend
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trend = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const trendColor = trend >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <div className="flex items-center gap-2">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            {showArea && (
              <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            fill={showArea ? `url(#sparkline-gradient-${color})` : "none"}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-right shrink-0">
        <span 
          className="text-xs font-medium"
          style={{ color: trendColor }}
        >
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
