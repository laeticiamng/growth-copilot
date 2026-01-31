/**
 * Meta Ads Agent
 * Mission: Analyze and optimize Meta (Facebook/Instagram) advertising campaigns
 * Integrates with Meta Marketing API data
 */

import type { AgentArtifact, AgentAction, AgentRisk } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface MetaAdAccount {
  id: string;
  accountId: string;
  accountName: string;
  currency: string;
  timezone: string;
  status: string;
  spendCap?: number;
  amountSpent?: number;
}

export interface MetaCampaign {
  id: string;
  campaignId: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  objective: MetaObjective;
  dailyBudget?: number;
  lifetimeBudget?: number;
}

export type MetaObjective = 
  | "OUTCOME_AWARENESS"
  | "OUTCOME_TRAFFIC" 
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_LEADS"
  | "OUTCOME_APP_PROMOTION"
  | "OUTCOME_SALES";

export interface MetaAdset {
  id: string;
  adsetId: string;
  campaignId: string;
  name: string;
  status: string;
  optimizationGoal: string;
  billingEvent: string;
  bidAmount?: number;
  targeting?: MetaTargeting;
}

export interface MetaTargeting {
  ageMin?: number;
  ageMax?: number;
  genders?: number[];
  geoLocations?: {
    countries?: string[];
    cities?: { key: string; name: string }[];
  };
  interests?: { id: string; name: string }[];
  behaviors?: { id: string; name: string }[];
  customAudiences?: { id: string; name: string }[];
  excludedCustomAudiences?: { id: string; name: string }[];
}

export interface MetaAd {
  id: string;
  adId: string;
  adsetId: string;
  name: string;
  status: string;
  creativeId?: string;
  previewUrl?: string;
}

export interface MetaInsight {
  objectId: string;
  objectType: "account" | "campaign" | "adset" | "ad";
  dateStart: string;
  dateStop: string;
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  cpc: number;
  cpm: number;
  ctr: number;
  conversions?: number;
  costPerConversion?: number;
  frequency?: number;
  actions?: { actionType: string; value: number }[];
}

export interface MetaAdsInput {
  account: MetaAdAccount;
  campaigns: MetaCampaign[];
  adsets: MetaAdset[];
  ads: MetaAd[];
  insights: MetaInsight[];
  budgetCap: number;
  hasWriteAccess: boolean;
}

export interface MetaAdsRecommendation {
  type: "budget" | "targeting" | "creative" | "bidding" | "audience" | "structure";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  estimatedImpact: string;
  risk: "low" | "medium" | "high";
  autoApplicable: boolean;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MIN_IMPRESSIONS = 1000;
const LOW_CTR_THRESHOLD = 0.008; // 0.8%
const HIGH_FREQUENCY_THRESHOLD = 3.0;
const HIGH_CPM_THRESHOLD = 15; // €15
const MIN_CONVERSIONS_FOR_OPTIMIZATION = 50;

// ─────────────────────────────────────────────────────────────
// Analysis Functions
// ─────────────────────────────────────────────────────────────

/**
 * Identify campaigns with audience fatigue (high frequency)
 */
export function identifyAudienceFatigue(
  campaigns: MetaCampaign[],
  insights: MetaInsight[]
): { campaign: MetaCampaign; frequency: number }[] {
  const fatigued: { campaign: MetaCampaign; frequency: number }[] = [];

  for (const campaign of campaigns) {
    const campaignInsights = insights.find(
      i => i.objectId === campaign.campaignId && i.objectType === "campaign"
    );
    
    if (campaignInsights?.frequency && campaignInsights.frequency > HIGH_FREQUENCY_THRESHOLD) {
      fatigued.push({ campaign, frequency: campaignInsights.frequency });
    }
  }

  return fatigued.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Identify underperforming adsets
 */
export function identifyUnderperformingAdsets(
  adsets: MetaAdset[],
  insights: MetaInsight[]
): MetaAdset[] {
  return adsets.filter(adset => {
    const adsetInsights = insights.find(
      i => i.objectId === adset.adsetId && i.objectType === "adset"
    );
    
    if (!adsetInsights || adsetInsights.impressions < MIN_IMPRESSIONS) return false;
    
    const hasLowCTR = adsetInsights.ctr < LOW_CTR_THRESHOLD;
    const hasHighCPM = adsetInsights.cpm > HIGH_CPM_THRESHOLD;
    const hasNoConversions = adsetInsights.spend > 50 && (adsetInsights.conversions || 0) === 0;
    
    return hasLowCTR || hasHighCPM || hasNoConversions;
  });
}

/**
 * Identify top performing ads for scaling
 */
export function identifyTopPerformingAds(
  ads: MetaAd[],
  insights: MetaInsight[]
): { ad: MetaAd; insight: MetaInsight }[] {
  const adsWithInsights: { ad: MetaAd; insight: MetaInsight }[] = [];

  for (const ad of ads) {
    const adInsight = insights.find(
      i => i.objectId === ad.adId && i.objectType === "ad"
    );
    
    if (adInsight && adInsight.impressions >= MIN_IMPRESSIONS) {
      adsWithInsights.push({ ad, insight: adInsight });
    }
  }

  // Sort by ROAS or conversion rate
  return adsWithInsights
    .filter(a => a.insight.ctr > LOW_CTR_THRESHOLD * 1.5)
    .sort((a, b) => {
      const aConvRate = (a.insight.conversions || 0) / a.insight.clicks;
      const bConvRate = (b.insight.conversions || 0) / b.insight.clicks;
      return bConvRate - aConvRate;
    })
    .slice(0, 5);
}

/**
 * Analyze targeting opportunities
 */
export function analyzeTargetingOpportunities(
  adsets: MetaAdset[],
  insights: MetaInsight[]
): { adset: MetaAdset; suggestion: string }[] {
  const opportunities: { adset: MetaAdset; suggestion: string }[] = [];

  for (const adset of adsets) {
    const targeting = adset.targeting;
    if (!targeting) continue;

    // Check for broad targeting
    if (!targeting.interests?.length && !targeting.behaviors?.length && !targeting.customAudiences?.length) {
      opportunities.push({
        adset,
        suggestion: "Ajouter des centres d'intérêt ou audiences personnalisées pour affiner le ciblage",
      });
    }

    // Check for age range too wide
    if (targeting.ageMin && targeting.ageMax && (targeting.ageMax - targeting.ageMin) > 35) {
      opportunities.push({
        adset,
        suggestion: "Réduire la tranche d'âge pour un ciblage plus précis",
      });
    }

    // Check for no lookalike audiences
    const hasLookalike = targeting.customAudiences?.some(a => a.name.toLowerCase().includes("lookalike"));
    if (!hasLookalike && (targeting.customAudiences?.length || 0) > 0) {
      opportunities.push({
        adset,
        suggestion: "Créer des audiences similaires (Lookalike) à partir des audiences performantes",
      });
    }
  }

  return opportunities;
}

/**
 * Calculate budget recommendations
 */
export function calculateBudgetRecommendations(
  campaigns: MetaCampaign[],
  insights: MetaInsight[],
  budgetCap: number
): { campaignId: string; currentBudget: number; recommendedBudget: number; reason: string }[] {
  const recommendations: { campaignId: string; currentBudget: number; recommendedBudget: number; reason: string }[] = [];
  
  // Calculate performance scores
  const campaignScores: { campaign: MetaCampaign; score: number; insight?: MetaInsight }[] = [];
  
  for (const campaign of campaigns) {
    if (campaign.status !== "ACTIVE") continue;
    
    const insight = insights.find(
      i => i.objectId === campaign.campaignId && i.objectType === "campaign"
    );
    
    if (!insight) continue;
    
    // Score based on CTR, CPC, conversions
    let score = 0;
    score += insight.ctr > 0.02 ? 3 : insight.ctr > 0.01 ? 2 : 1;
    score += insight.cpc < 1 ? 3 : insight.cpc < 2 ? 2 : 1;
    score += (insight.conversions || 0) > 10 ? 3 : (insight.conversions || 0) > 0 ? 2 : 0;
    
    campaignScores.push({ campaign, score, insight });
  }

  // Sort by score
  campaignScores.sort((a, b) => b.score - a.score);

  // Top performers get budget increase, low performers get decrease
  for (let i = 0; i < campaignScores.length; i++) {
    const { campaign, score } = campaignScores[i];
    const currentBudget = campaign.dailyBudget || 0;
    
    if (score >= 7 && currentBudget > 0) {
      recommendations.push({
        campaignId: campaign.id,
        currentBudget,
        recommendedBudget: Math.min(currentBudget * 1.3, budgetCap * 0.4),
        reason: "Performance excellente - potentiel de scale",
      });
    } else if (score <= 3 && currentBudget > 10) {
      recommendations.push({
        campaignId: campaign.id,
        currentBudget,
        recommendedBudget: currentBudget * 0.5,
        reason: "Performance faible - réduire ou optimiser avant de continuer",
      });
    }
  }

  return recommendations;
}

// ─────────────────────────────────────────────────────────────
// Recommendations Generator
// ─────────────────────────────────────────────────────────────

export function generateMetaAdsRecommendations(input: MetaAdsInput): MetaAdsRecommendation[] {
  const recommendations: MetaAdsRecommendation[] = [];

  // Check for audience fatigue
  const fatigued = identifyAudienceFatigue(input.campaigns, input.insights);
  if (fatigued.length > 0) {
    for (const { campaign, frequency } of fatigued.slice(0, 3)) {
      recommendations.push({
        type: "audience",
        priority: frequency > 5 ? "high" : "medium",
        title: `Fatigue d'audience: ${campaign.name}`,
        description: `Fréquence de ${frequency.toFixed(1)}. Élargir l'audience ou rafraîchir les créatives.`,
        estimatedImpact: "Réduction CPM de 15-25%",
        risk: "low",
        autoApplicable: false,
      });
    }
  }

  // Underperforming adsets
  const underperformers = identifyUnderperformingAdsets(input.adsets, input.insights);
  if (underperformers.length > 0) {
    recommendations.push({
      type: "structure",
      priority: "high",
      title: `${underperformers.length} adset(s) sous-performants`,
      description: "CTR faible, CPM élevé ou sans conversions malgré le budget dépensé",
      estimatedImpact: `Économie potentielle de ${underperformers.length * 20}€/jour`,
      risk: "low",
      autoApplicable: true,
    });
  }

  // Top performers to scale
  const topPerformers = identifyTopPerformingAds(input.ads, input.insights);
  if (topPerformers.length > 0) {
    recommendations.push({
      type: "budget",
      priority: "high",
      title: `${topPerformers.length} ad(s) top performers à scaler`,
      description: "Augmenter le budget sur les créatives les plus performantes",
      estimatedImpact: "+20-40% de conversions potentielles",
      risk: "medium",
      autoApplicable: false,
    });
  }

  // Targeting opportunities
  const targetingOpps = analyzeTargetingOpportunities(input.adsets, input.insights);
  if (targetingOpps.length > 0) {
    recommendations.push({
      type: "targeting",
      priority: "medium",
      title: `${targetingOpps.length} optimisation(s) de ciblage`,
      description: targetingOpps[0].suggestion,
      estimatedImpact: "Amélioration du CPM et CTR",
      risk: "low",
      autoApplicable: false,
    });
  }

  // Budget reallocation
  const budgetRecs = calculateBudgetRecommendations(input.campaigns, input.insights, input.budgetCap);
  const increaseBudget = budgetRecs.filter(r => r.recommendedBudget > r.currentBudget);
  const decreaseBudget = budgetRecs.filter(r => r.recommendedBudget < r.currentBudget);

  if (increaseBudget.length > 0) {
    recommendations.push({
      type: "budget",
      priority: "medium",
      title: `Augmenter budget sur ${increaseBudget.length} campagne(s)`,
      description: "Campagnes performantes avec potentiel de scale",
      estimatedImpact: "+15-25% de résultats avec même ROAS",
      risk: "medium",
      autoApplicable: false,
    });
  }

  if (decreaseBudget.length > 0) {
    recommendations.push({
      type: "budget",
      priority: "medium",
      title: `Réduire budget sur ${decreaseBudget.length} campagne(s)`,
      description: "Campagnes non rentables consommant du budget",
      estimatedImpact: `Économie de ${decreaseBudget.reduce((s, r) => s + (r.currentBudget - r.recommendedBudget), 0).toFixed(0)}€/jour`,
      risk: "low",
      autoApplicable: false,
    });
  }

  // Creative refresh recommendation
  const activeCampaignsWithOldAds = input.campaigns.filter(c => c.status === "ACTIVE");
  if (activeCampaignsWithOldAds.length > 3) {
    recommendations.push({
      type: "creative",
      priority: "medium",
      title: "Rafraîchir les créatives",
      description: "Tester de nouvelles variations pour maintenir les performances",
      estimatedImpact: "Prévention de la fatigue publicitaire",
      risk: "low",
      autoApplicable: false,
    });
  }

  return recommendations;
}

// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────

function calculateMetaICE(
  priority: "high" | "medium" | "low",
  effort: "low" | "medium" | "high",
  risk: "low" | "medium" | "high"
): number {
  const impactMap = { high: 9, medium: 6, low: 3 };
  const effortMap = { high: 3, medium: 6, low: 9 };
  const riskPenalty = { high: 0.7, medium: 0.85, low: 1 };
  const confidence = 7;
  return Math.round((impactMap[priority] * confidence * effortMap[effort] * riskPenalty[risk]) / 10);
}

export function generateMetaAdsOutput(input: MetaAdsInput): AgentArtifact {
  const recommendations = generateMetaAdsRecommendations(input);

  const actions: AgentAction[] = recommendations.map((rec, idx) => {
    const priority = rec.priority;
    const effort = rec.type === "budget" ? "low" as const : rec.type === "creative" ? "high" as const : "medium" as const;

    return {
      id: `meta-ads-${Date.now()}-${idx}`,
      title: rec.title,
      description: rec.description,
      priority,
      effort,
      impact: priority,
      ice_score: calculateMetaICE(priority, effort, rec.risk),
      category: `meta_${rec.type}`,
      auto_fixable: rec.autoApplicable && input.hasWriteAccess && rec.risk !== "high",
      fix_instructions: rec.estimatedImpact,
    };
  });

  const risks: AgentRisk[] = [];

  // Account-level risks
  if (input.account.spendCap && input.account.amountSpent) {
    const spendRatio = input.account.amountSpent / input.account.spendCap;
    if (spendRatio > 0.8) {
      risks.push({
        id: `spend-cap-${Date.now()}`,
        description: "Proche du plafond de dépenses du compte",
        severity: spendRatio > 0.95 ? "critical" : "high",
        mitigation: "Augmenter le plafond ou réduire les budgets",
      });
    }
  }

  if (!input.hasWriteAccess) {
    risks.push({
      id: `access-${Date.now()}`,
      description: "Accès en lecture seule - mode recommandation uniquement",
      severity: "medium",
      mitigation: "Demander ads_management permission pour les actions automatiques",
    });
  }

  // Check for missing pixel/CAPI
  const hasConversions = input.insights.some(i => (i.conversions || 0) > 0);
  if (!hasConversions && input.insights.length > 0) {
    risks.push({
      id: `tracking-${Date.now()}`,
      description: "Aucune conversion trackée - vérifier Pixel/CAPI",
      severity: "high",
      mitigation: "Configurer Conversions API et vérifier le Pixel",
    });
  }

  // Calculate totals for summary
  const totalSpend = input.insights.reduce((sum, i) => sum + i.spend, 0);
  const totalConversions = input.insights.reduce((sum, i) => sum + (i.conversions || 0), 0);
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;

  return {
    summary: `Analyse Meta Ads: ${input.campaigns.length} campagnes, ${totalSpend.toFixed(0)}€ dépensés, ${totalConversions} conversions (CPA: ${avgCPA.toFixed(2)}€). ${recommendations.length} recommandations générées.`,
    actions,
    risks,
    dependencies: ["meta_integration", "meta_ads_api"],
    metrics_to_watch: ["cpm", "ctr", "cpa", "roas", "frequency"],
    requires_approval: actions.some(a => a.auto_fixable),
  };
}
