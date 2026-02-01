/**
 * Statistical utilities for A/B testing confidence calculations
 */

/**
 * Calculate z-score for a given confidence level
 */
function getZScore(confidence: number): number {
  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    99: 2.576,
  };
  return zScores[confidence] || 1.96;
}

/**
 * Calculate statistical significance between two conversion rates
 * Uses two-proportion z-test
 * 
 * @param visitorsA - Number of visitors in variant A (control)
 * @param conversionsA - Number of conversions in variant A
 * @param visitorsB - Number of visitors in variant B (treatment)
 * @param conversionsB - Number of conversions in variant B
 * @returns confidence percentage (0-100)
 */
export function calculateConfidence(
  visitorsA: number,
  conversionsA: number,
  visitorsB: number,
  conversionsB: number
): number {
  // Need minimum sample size for meaningful calculation
  if (visitorsA < 10 || visitorsB < 10) {
    return 0;
  }

  const rateA = conversionsA / visitorsA;
  const rateB = conversionsB / visitorsB;
  
  // Pooled probability
  const pooledProb = (conversionsA + conversionsB) / (visitorsA + visitorsB);
  
  // Standard error
  const standardError = Math.sqrt(
    pooledProb * (1 - pooledProb) * (1 / visitorsA + 1 / visitorsB)
  );
  
  // Avoid division by zero
  if (standardError === 0) {
    return rateA === rateB ? 0 : 99;
  }
  
  // Z-score
  const zScore = Math.abs(rateB - rateA) / standardError;
  
  // Convert z-score to confidence using normal distribution approximation
  // Using a simplified approximation for common ranges
  if (zScore >= 2.576) return 99;
  if (zScore >= 2.326) return 98;
  if (zScore >= 2.054) return 96;
  if (zScore >= 1.96) return 95;
  if (zScore >= 1.645) return 90;
  if (zScore >= 1.282) return 80;
  if (zScore >= 0.842) return 60;
  
  // Linear interpolation for lower values
  return Math.min(Math.round(zScore * 40), 50);
}

/**
 * Calculate minimum sample size needed for statistical significance
 * 
 * @param baselineRate - Current conversion rate (0-1)
 * @param minimumDetectableEffect - Minimum improvement to detect (e.g., 0.1 for 10%)
 * @param confidence - Desired confidence level (default 95)
 * @param power - Statistical power (default 80%)
 * @returns minimum visitors per variant
 */
export function calculateMinimumSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  confidence: number = 95,
  power: number = 80
): number {
  const zAlpha = getZScore(confidence);
  const zBeta = power === 80 ? 0.84 : power === 90 ? 1.28 : 0.84;
  
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  
  const pooledP = (p1 + p2) / 2;
  
  const numerator = 2 * pooledP * (1 - pooledP) * Math.pow(zAlpha + zBeta, 2);
  const denominator = Math.pow(p2 - p1, 2);
  
  if (denominator === 0) return Infinity;
  
  return Math.ceil(numerator / denominator);
}

/**
 * Calculate uplift percentage between two rates
 */
export function calculateUplift(rateA: number, rateB: number): number {
  if (rateA === 0) return rateB > 0 ? 100 : 0;
  return ((rateB - rateA) / rateA) * 100;
}

/**
 * Determine if an A/B test has reached statistical significance
 */
export function isStatisticallySignificant(
  visitorsA: number,
  conversionsA: number,
  visitorsB: number,
  conversionsB: number,
  threshold: number = 95
): boolean {
  return calculateConfidence(visitorsA, conversionsA, visitorsB, conversionsB) >= threshold;
}

/**
 * Get a human-readable recommendation based on test results
 */
export function getTestRecommendation(
  confidence: number,
  rateA: number,
  rateB: number
): { status: 'winner' | 'loser' | 'inconclusive'; message: string } {
  if (confidence >= 95) {
    if (rateB > rateA) {
      return {
        status: 'winner',
        message: `La variante B surpasse la variante A avec ${confidence}% de confiance. Déployez la variante B.`,
      };
    } else {
      return {
        status: 'loser',
        message: `La variante A est meilleure avec ${confidence}% de confiance. Gardez la version actuelle.`,
      };
    }
  }
  
  if (confidence >= 80) {
    return {
      status: 'inconclusive',
      message: `Tendance en faveur de la variante ${rateB > rateA ? 'B' : 'A'} (${confidence}% confiance). Continuez le test.`,
    };
  }
  
  return {
    status: 'inconclusive',
    message: 'Pas assez de données pour conclure. Continuez le test.',
  };
}
