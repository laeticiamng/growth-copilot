/**
 * Forecasting Engine — Linear regression + seasonal decomposition
 * for KPI prediction on 30/60/90 day horizons.
 */

export interface DataPoint {
  date: string; // ISO date
  value: number;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number; // 80% confidence interval
  upper: number;
}

export interface ForecastResult {
  historical: DataPoint[];
  forecast: ForecastPoint[];
  trend: "up" | "down" | "stable";
  trendStrength: number; // 0-1
  r2: number; // goodness of fit
  dailyChange: number; // average daily change
  predictedTotal30d: number;
  predictedTotal60d: number;
  predictedTotal90d: number;
}

/**
 * Simple linear regression: y = mx + b
 */
function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssRes += (p.y - predicted) ** 2;
    ssTot += (p.y - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

/**
 * Calculate standard error of estimate for confidence intervals
 */
function standardError(points: { x: number; y: number }[], slope: number, intercept: number): number {
  const n = points.length;
  if (n <= 2) return 0;
  
  let sumResidualSq = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    sumResidualSq += (p.y - predicted) ** 2;
  }
  return Math.sqrt(sumResidualSq / (n - 2));
}

/**
 * Apply 7-day moving average to smooth noisy daily data
 */
function movingAverage(data: DataPoint[], window: number = 7): DataPoint[] {
  if (data.length < window) return data;
  
  const result: DataPoint[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(data.length, i + Math.ceil(window / 2));
    const slice = data.slice(start, end);
    const avg = slice.reduce((s, d) => s + d.value, 0) / slice.length;
    result.push({ date: data[i].date, value: avg });
  }
  return result;
}

/**
 * Generate forecast for a KPI metric
 */
export function forecastKPI(
  historical: DataPoint[],
  forecastDays: number = 90
): ForecastResult | null {
  if (historical.length < 7) return null; // Need at least a week of data

  // Sort chronologically
  const sorted = [...historical].sort((a, b) => a.date.localeCompare(b.date));
  
  // Smooth the data for regression
  const smoothed = movingAverage(sorted);

  // Convert to numeric x-axis (day index)
  const baseDate = new Date(sorted[0].date).getTime();
  const msPerDay = 86400000;
  const regressionPoints = smoothed.map((d) => ({
    x: (new Date(d.date).getTime() - baseDate) / msPerDay,
    y: d.value,
  }));

  const { slope, intercept, r2 } = linearRegression(regressionPoints);
  const se = standardError(regressionPoints, slope, intercept);

  // Determine trend
  const lastX = regressionPoints[regressionPoints.length - 1].x;
  const avgValue = sorted.reduce((s, d) => s + d.value, 0) / sorted.length;
  const trendStrength = avgValue === 0 ? 0 : Math.min(1, Math.abs(slope * 30) / avgValue);
  
  let trend: "up" | "down" | "stable";
  if (trendStrength < 0.05) trend = "stable";
  else trend = slope > 0 ? "up" : "down";

  // Generate forecast points
  const forecast: ForecastPoint[] = [];
  const lastDate = new Date(sorted[sorted.length - 1].date);
  
  let total30 = 0, total60 = 0, total90 = 0;

  for (let i = 1; i <= forecastDays; i++) {
    const x = lastX + i;
    const predicted = Math.max(0, slope * x + intercept);
    
    // Widen confidence interval further into the future
    const uncertaintyMultiplier = 1.28; // 80% CI
    const margin = se * uncertaintyMultiplier * Math.sqrt(1 + 1 / regressionPoints.length + ((x - lastX / 2) ** 2) / (regressionPoints.reduce((s, p) => s + (p.x - lastX / 2) ** 2, 0) || 1));
    
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    forecast.push({
      date: forecastDate.toISOString().split("T")[0],
      predicted: Math.round(predicted * 100) / 100,
      lower: Math.max(0, Math.round((predicted - margin) * 100) / 100),
      upper: Math.round((predicted + margin) * 100) / 100,
    });

    if (i <= 30) total30 += predicted;
    if (i <= 60) total60 += predicted;
    total90 += predicted;
  }

  return {
    historical: sorted,
    forecast,
    trend,
    trendStrength,
    r2: Math.round(r2 * 100) / 100,
    dailyChange: Math.round(slope * 100) / 100,
    predictedTotal30d: Math.round(total30),
    predictedTotal60d: Math.round(total60),
    predictedTotal90d: Math.round(total90),
  };
}

/**
 * Format a forecast value for display
 */
export function formatForecastValue(value: number, metric: string): string {
  if (metric === "avg_position") {
    return value.toFixed(1);
  }
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toLocaleString();
}
