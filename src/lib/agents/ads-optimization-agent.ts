/**
 * Ads Optimization Agent
 * Mission: Optimize SEA/YouTube Ads campaigns with recommendations and risk controls
 */

import type { AgentArtifact, AgentAction, AgentRisk } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface AdsAccount {
  id: string;
  accountId: string;
  accountName: string;
  platform: "google_ads" | "meta_ads" | "youtube_ads";
  currency: string;
  budgetLimitDaily?: number;
  budgetLimitMonthly?: number;
  isActive: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "ended";
  campaignType: "search" | "display" | "shopping" | "video" | "performance_max";
  budgetDaily: number;
  strategy: "manual_cpc" | "maximize_conversions" | "target_cpa" | "target_roas";
  targetCpa?: number;
  targetRoas?: number;
  impressions30d: number;
  clicks30d: number;
  cost30d: number;
  conversions30d: number;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  status: "enabled" | "paused";
}

export interface Keyword {
  id: string;
  adGroupId: string;
  keyword: string;
  matchType: "broad" | "phrase" | "exact";
  qualityScore?: number;
  maxCpc?: number;
  impressions30d: number;
  clicks30d: number;
  cost30d: number;
  conversions30d: number;
}

export interface Ad {
  id: string;
  adGroupId: string;
  adType: "responsive_search" | "responsive_display" | "video";
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  qualityScore?: number;
  status: "enabled" | "paused" | "disapproved";
}

export interface DataQualityStatus {
  trackingHealthy: boolean;
  conversionTracking: boolean;
  ga4Connected: boolean;
  issues: string[];
}

export interface AdsOptimizationInput {
  account: AdsAccount;
  campaigns: Campaign[];
  adGroups: AdGroup[];
  keywords: Keyword[];
  ads: Ad[];
  dataQuality: DataQualityStatus;
  budgetCap: number;
  hasWriteAccess: boolean;
}

export interface AdsRecommendation {
  type: "budget" | "bidding" | "keyword" | "negative" | "ad_copy" | "structure" | "targeting";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  estimatedImpact: string;
  risk: "low" | "medium" | "high";
  autoApplicable: boolean;
}

export interface RSARecommendation {
  adGroupId: string;
  headlines: string[];
  descriptions: string[];
  pinning?: { headline?: number; description?: number };
}

export interface NegativeKeywordRecommendation {
  keyword: string;
  matchType: "exact" | "phrase";
  level: "campaign" | "adgroup";
  reason: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MIN_QUALITY_SCORE = 5;
const LOW_CTR_THRESHOLD = 0.02; // 2%
const HIGH_CPC_MULTIPLIER = 1.5;
const MIN_IMPRESSIONS_FOR_ANALYSIS = 100;

// ─────────────────────────────────────────────────────────────
// Analysis Functions
// ─────────────────────────────────────────────────────────────

/**
 * Calculate CTR from impressions and clicks
 */
export function calculateCTR(impressions: number, clicks: number): number {
  if (impressions === 0) return 0;
  return clicks / impressions;
}

/**
 * Calculate CPC from cost and clicks
 */
export function calculateCPC(cost: number, clicks: number): number {
  if (clicks === 0) return 0;
  return cost / clicks;
}

/**
 * Calculate CPA from cost and conversions
 */
export function calculateCPA(cost: number, conversions: number): number {
  if (conversions === 0) return Infinity;
  return cost / conversions;
}

/**
 * Calculate ROAS (simplified - would need revenue data)
 */
export function calculateROAS(revenue: number, cost: number): number {
  if (cost === 0) return 0;
  return revenue / cost;
}

/**
 * Identify underperforming keywords
 */
export function identifyUnderperformingKeywords(keywords: Keyword[]): Keyword[] {
  return keywords.filter(kw => {
    if (kw.impressions30d < MIN_IMPRESSIONS_FOR_ANALYSIS) return false;
    
    const ctr = calculateCTR(kw.impressions30d, kw.clicks30d);
    const hasLowQS = kw.qualityScore !== undefined && kw.qualityScore < MIN_QUALITY_SCORE;
    const hasLowCTR = ctr < LOW_CTR_THRESHOLD;
    const hasNoConversions = kw.conversions30d === 0 && kw.cost30d > 50;
    
    return hasLowQS || hasLowCTR || hasNoConversions;
  });
}

/**
 * Identify high-performing keywords for expansion
 */
export function identifyTopPerformers(keywords: Keyword[]): Keyword[] {
  return keywords
    .filter(kw => kw.impressions30d >= MIN_IMPRESSIONS_FOR_ANALYSIS)
    .filter(kw => {
      const ctr = calculateCTR(kw.impressions30d, kw.clicks30d);
      const hasGoodQS = kw.qualityScore === undefined || kw.qualityScore >= 7;
      const hasGoodCTR = ctr >= 0.05; // 5%+
      const hasConversions = kw.conversions30d > 0;
      
      return hasGoodQS && hasGoodCTR && hasConversions;
    })
    .sort((a, b) => b.conversions30d - a.conversions30d);
}

/**
 * Identify potential negative keywords from search terms
 */
export function suggestNegativeKeywords(
  keywords: Keyword[]
): NegativeKeywordRecommendation[] {
  const negatives: NegativeKeywordRecommendation[] = [];
  
  // Keywords with high spend, no conversions
  const wastefulKeywords = keywords.filter(
    kw => kw.cost30d > 100 && kw.conversions30d === 0 && kw.matchType === "broad"
  );
  
  for (const kw of wastefulKeywords) {
    negatives.push({
      keyword: kw.keyword,
      matchType: "exact",
      level: "campaign",
      reason: `${kw.cost30d.toFixed(0)}€ dépensés sans conversion`,
    });
  }
  
  // Common irrelevant patterns (would be more sophisticated in production)
  const irrelevantPatterns = ["gratuit", "free", "pas cher", "avis"];
  for (const pattern of irrelevantPatterns) {
    const hasPattern = keywords.some(
      kw => kw.keyword.toLowerCase().includes(pattern) && kw.conversions30d === 0
    );
    if (hasPattern) {
      negatives.push({
        keyword: pattern,
        matchType: "phrase",
        level: "campaign",
        reason: "Terme souvent non-qualifié",
      });
    }
  }
  
  return negatives;
}

/**
 * Analyze campaign budget efficiency
 */
export function analyzeBudgetEfficiency(campaigns: Campaign[]): {
  underBudget: Campaign[];
  overBudget: Campaign[];
  efficient: Campaign[];
} {
  const underBudget: Campaign[] = [];
  const overBudget: Campaign[] = [];
  const efficient: Campaign[] = [];
  
  for (const campaign of campaigns) {
    if (campaign.status !== "active") continue;
    
    const dailySpend = campaign.cost30d / 30;
    const budgetUtilization = dailySpend / campaign.budgetDaily;
    
    if (budgetUtilization < 0.5) {
      underBudget.push(campaign);
    } else if (budgetUtilization > 0.95) {
      overBudget.push(campaign);
    } else {
      efficient.push(campaign);
    }
  }
  
  return { underBudget, overBudget, efficient };
}

/**
 * Generate RSA recommendations for an ad group
 */
export function generateRSARecommendations(
  adGroup: AdGroup,
  existingAds: Ad[],
  topKeywords: Keyword[]
): RSARecommendation | null {
  // Check if we have enough data
  if (topKeywords.length === 0) return null;
  
  // Generate headline variations
  const headlines: string[] = [];
  
  // Keyword-focused headlines
  for (const kw of topKeywords.slice(0, 3)) {
    headlines.push(`${kw.keyword} - Expert Solution`);
    headlines.push(`Top ${kw.keyword} Service`);
  }
  
  // Benefit headlines
  headlines.push("Résultats Garantis");
  headlines.push("Essai Gratuit 30 Jours");
  headlines.push("Support 24/7 Inclus");
  
  // Urgency headlines
  headlines.push("Offre Limitée");
  headlines.push("Commencez Aujourd'hui");
  
  // Generate descriptions
  const descriptions: string[] = [
    "Découvrez notre solution leader du marché. Rejoignez des milliers de clients satisfaits.",
    "ROI prouvé avec +150% de résultats en moyenne. Demandez votre démo gratuite.",
    "Solution tout-en-un pour votre croissance. Configuration en 5 minutes.",
    "Équipe d'experts dédiée. Accompagnement personnalisé inclus.",
  ];
  
  return {
    adGroupId: adGroup.id,
    headlines: headlines.slice(0, 15), // RSA max 15 headlines
    descriptions: descriptions.slice(0, 4), // RSA max 4 descriptions
  };
}

/**
 * Generate optimization recommendations
 */
export function generateAdsRecommendations(
  input: AdsOptimizationInput
): AdsRecommendation[] {
  const recommendations: AdsRecommendation[] = [];
  
  // Data quality check - critical
  if (!input.dataQuality.trackingHealthy) {
    recommendations.push({
      type: "structure",
      priority: "high",
      title: "Corriger le tracking avant d'optimiser",
      description: input.dataQuality.issues.join(". "),
      estimatedImpact: "Prerequis pour toute optimisation",
      risk: "high",
      autoApplicable: false,
    });
    
    // Stop here if tracking is broken
    return recommendations;
  }
  
  // Budget analysis
  const budgetAnalysis = analyzeBudgetEfficiency(input.campaigns);
  
  if (budgetAnalysis.overBudget.length > 0) {
    for (const campaign of budgetAnalysis.overBudget) {
      const cpa = calculateCPA(campaign.cost30d, campaign.conversions30d);
      if (campaign.targetCpa && cpa < campaign.targetCpa * 0.8) {
        recommendations.push({
          type: "budget",
          priority: "high",
          title: `Augmenter budget: ${campaign.name}`,
          description: `CPA actuel (${cpa.toFixed(0)}€) < cible (${campaign.targetCpa}€). Potentiel de scale.`,
          estimatedImpact: "+20-30% conversions potentielles",
          risk: "low",
          autoApplicable: false,
        });
      }
    }
  }
  
  if (budgetAnalysis.underBudget.length > 0) {
    for (const campaign of budgetAnalysis.underBudget) {
      recommendations.push({
        type: "budget",
        priority: "medium",
        title: `Réallouer budget: ${campaign.name}`,
        description: "Budget sous-utilisé. Optimiser les keywords ou réduire le budget.",
        estimatedImpact: "Économie ou meilleure allocation",
        risk: "low",
        autoApplicable: false,
      });
    }
  }
  
  // Keyword analysis
  const underperformers = identifyUnderperformingKeywords(input.keywords);
  if (underperformers.length > 3) {
    recommendations.push({
      type: "keyword",
      priority: "high",
      title: `${underperformers.length} keywords sous-performants`,
      description: "Keywords avec QS faible, CTR bas ou sans conversions",
      estimatedImpact: `-${underperformers.reduce((sum, kw) => sum + kw.cost30d, 0).toFixed(0)}€ de dépenses inutiles`,
      risk: "low",
      autoApplicable: true,
    });
  }
  
  // Negative keywords
  const negatives = suggestNegativeKeywords(input.keywords);
  if (negatives.length > 0) {
    recommendations.push({
      type: "negative",
      priority: "medium",
      title: `Ajouter ${negatives.length} mots-clés négatifs`,
      description: "Bloquer les termes non-qualifiés pour réduire le gaspillage",
      estimatedImpact: "Réduction CPA estimée de 10-20%",
      risk: "low",
      autoApplicable: true,
    });
  }
  
  // RSA recommendations
  const topKeywords = identifyTopPerformers(input.keywords);
  const adGroupsNeedingAds = input.adGroups.filter(ag => {
    const groupAds = input.ads.filter(ad => ad.adGroupId === ag.id);
    return groupAds.length < 2;
  });
  
  if (adGroupsNeedingAds.length > 0) {
    recommendations.push({
      type: "ad_copy",
      priority: "medium",
      title: `Créer RSA pour ${adGroupsNeedingAds.length} groupes d'annonces`,
      description: "Améliorer la couverture et les performances avec des annonces responsives",
      estimatedImpact: "+15% CTR moyen",
      risk: "low",
      autoApplicable: false,
    });
  }
  
  // Bidding strategy recommendations
  const manualCampaigns = input.campaigns.filter(
    c => c.strategy === "manual_cpc" && c.conversions30d >= 30
  );
  if (manualCampaigns.length > 0) {
    recommendations.push({
      type: "bidding",
      priority: "medium",
      title: "Passer aux enchères automatiques",
      description: `${manualCampaigns.length} campagne(s) avec assez de conversions pour Smart Bidding`,
      estimatedImpact: "+10-20% conversions avec Target CPA",
      risk: "medium",
      autoApplicable: false,
    });
  }
  
  return recommendations;
}

// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────

/**
 * Calculate ICE score for ads recommendations
 */
function calculateAdsICE(priority: "high" | "medium" | "low", effort: "low" | "medium" | "high", risk: "low" | "medium" | "high"): number {
  const impactMap = { high: 9, medium: 6, low: 3 };
  const effortMap = { high: 3, medium: 6, low: 9 };
  const riskPenalty = { high: 0.7, medium: 0.85, low: 1 };
  const confidence = 7;
  return Math.round((impactMap[priority] * confidence * effortMap[effort] * riskPenalty[risk]) / 10);
}

/**
 * Generate Ads Optimization agent output
 */
export function generateAdsOptimizationOutput(
  input: AdsOptimizationInput
): AgentArtifact {
  const recommendations = generateAdsRecommendations(input);
  
  // Check if we should limit actions due to data quality
  const isTrackingOk = input.dataQuality.trackingHealthy;
  
  const actions: AgentAction[] = recommendations.map((rec, idx) => {
    const priority = rec.priority === "high" ? "high" as const : rec.priority === "medium" ? "medium" as const : "low" as const;
    const effort = (rec.type === "budget" || rec.type === "bidding") ? "low" as const : "medium" as const;
    
    return {
      id: `ads-${Date.now()}-${idx}`,
      title: rec.title,
      description: rec.description,
      priority,
      effort,
      impact: priority,
      ice_score: calculateAdsICE(priority, effort, rec.risk),
      category: `ads_${rec.type}`,
      auto_fixable: rec.autoApplicable && input.hasWriteAccess && rec.risk !== "high",
      fix_instructions: generateHowSteps(rec).join(" → "),
    };
  });
  
  const risks: AgentRisk[] = [];
  if (!isTrackingOk) {
    risks.push({
      id: `tracking-${Date.now()}`,
      description: "Tracking non fiable - optimisations limitées aux actions safe",
      severity: "high" as const,
      mitigation: "Corriger le tracking avant d'optimiser les campagnes",
    });
  }
  if (!input.hasWriteAccess) {
    risks.push({
      id: `access-${Date.now()}`,
      description: "Pas d'accès en écriture - mode recommandation uniquement",
      severity: "medium" as const,
      mitigation: "Connecter le compte Ads avec les droits d'écriture",
    });
  }
  if (input.account.budgetLimitDaily && input.account.budgetLimitDaily > 0) {
    const totalDailyBudget = input.campaigns.reduce((sum, c) => sum + c.budgetDaily, 0);
    if (totalDailyBudget > input.account.budgetLimitDaily * 0.9) {
      risks.push({
        id: `budget-${Date.now()}`,
        description: "Proche du plafond budget quotidien",
        severity: "medium" as const,
        mitigation: "Réduire les budgets ou augmenter le plafond",
      });
    }
  }
  
  // Calculate summary stats
  const totalSpend = input.campaigns.reduce((sum, c) => sum + c.cost30d, 0);
  const totalConversions = input.campaigns.reduce((sum, c) => sum + c.conversions30d, 0);
  const avgCPA = calculateCPA(totalSpend, totalConversions);
  
  return {
    summary: `${input.campaigns.length} campagnes | ${totalSpend.toFixed(0)}€ spend/30j | ${totalConversions} conv. | CPA moy: ${avgCPA === Infinity ? "N/A" : avgCPA.toFixed(0) + "€"} | ${recommendations.length} reco(s)`,
    actions,
    risks,
    dependencies: isTrackingOk ? [] : ["integration:ga4", "integration:conversion_tracking"],
    metrics_to_watch: ["cpa", "roas", "quality_score", "impression_share", "conversion_rate"],
    requires_approval: !isTrackingOk || recommendations.some(r => r.risk === "high"),
  };
}

function generateHowSteps(rec: AdsRecommendation): string[] {
  switch (rec.type) {
    case "budget":
      return [
        "Analyser les tendances de performance sur 7j",
        "Ajuster le budget de façon incrémentale (+20%)",
        "Surveiller CPA sur 48-72h post-changement",
      ];
    case "bidding":
      return [
        "Vérifier l'historique de conversions (30+ requis)",
        "Définir le Target CPA basé sur l'historique",
        "Activer la stratégie d'enchères",
        "Période d'apprentissage: 7-14 jours",
      ];
    case "keyword":
      return [
        "Exporter la liste des keywords sous-performants",
        "Mettre en pause ou supprimer les keywords concernés",
        "Réallouer le budget vers les performers",
      ];
    case "negative":
      return [
        "Ajouter les mots-clés négatifs au niveau campagne",
        "Vérifier l'impact sur les impressions (24-48h)",
        "Ajuster si nécessaire",
      ];
    case "ad_copy":
      return [
        "Créer les variantes de headlines (15 max)",
        "Créer les descriptions (4 max)",
        "Configurer les épinglages si nécessaire",
        "Lancer et surveiller l'Ad Strength",
      ];
    case "structure":
      return [
        "Identifier le problème de tracking",
        "Implémenter le fix (tag, pixel, conversion)",
        "Valider avec Tag Assistant / Debug mode",
        "Attendre 48h de données avant d'optimiser",
      ];
    case "targeting":
      return [
        "Analyser les segments performants",
        "Ajuster le ciblage démographique/géographique",
        "Exclure les audiences non pertinentes",
      ];
    default:
      return ["Implémenter la recommandation"];
  }
}
