/**
 * Competitive Intelligence Agent
 * Mission: Analyze competitors publicly and safely to identify opportunities
 */

import type { AgentArtifact, AgentAction, AgentRisk } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface CompetitorProfile {
  url: string;
  name: string;
  lastAnalyzedAt?: string;
}

export interface CompetitorCrawlResult {
  url: string;
  title: string;
  description: string;
  h1: string[];
  topics: string[];
  contentLength: number;
  hasSchema: boolean;
  schemaTypes: string[];
  socialProof: SocialProof[];
  pricing?: PricingInfo;
  features: string[];
  ctas: string[];
}

export interface SocialProof {
  type: "testimonial" | "case_study" | "stat" | "logo" | "award";
  text: string;
}

export interface PricingInfo {
  hasPublicPricing: boolean;
  tiers?: string[];
  lowestPrice?: string;
  pricingModel?: string;
}

export interface KeywordGap {
  keyword: string;
  competitorRanking: number;
  ourRanking: number | null;
  volume: number;
  difficulty: number;
  opportunity: "high" | "medium" | "low";
}

export interface ContentGap {
  topic: string;
  competitorUrls: string[];
  suggestedTitle: string;
  estimatedVolume: number;
  intent: "informational" | "transactional" | "commercial";
}

export interface CompetitorInsight {
  type: "strength" | "weakness" | "opportunity" | "threat";
  category: "content" | "seo" | "ux" | "pricing" | "positioning";
  description: string;
  actionable: boolean;
  priority: "high" | "medium" | "low";
}

export interface CompetitiveAnalysis {
  competitor: CompetitorProfile;
  crawlResult?: CompetitorCrawlResult;
  keywordGaps: KeywordGap[];
  contentGaps: ContentGap[];
  insights: CompetitorInsight[];
  analyzedAt: string;
}

export interface CompetitiveIntelInput {
  siteUrl: string;
  siteName: string;
  competitors: CompetitorProfile[];
  ourKeywords?: { keyword: string; position: number; volume: number }[];
  maxCompetitorsToAnalyze?: number;
}

// ─────────────────────────────────────────────────────────────
// Safety & Compliance
// ─────────────────────────────────────────────────────────────

/**
 * Check if URL is safe to crawl (anti-SSRF)
 */
export function isSafeUrl(url: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    
    // Block non-http(s) protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { safe: false, reason: "Protocol not allowed" };
    }
    
    // Block localhost and private IPs
    const hostname = parsed.hostname.toLowerCase();
    const blockedPatterns = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
      "10.",
      "172.16.",
      "172.17.",
      "172.18.",
      "172.19.",
      "172.20.",
      "172.21.",
      "172.22.",
      "172.23.",
      "172.24.",
      "172.25.",
      "172.26.",
      "172.27.",
      "172.28.",
      "172.29.",
      "172.30.",
      "172.31.",
      "192.168.",
      "169.254.",
      "metadata",
      "internal",
    ];
    
    for (const pattern of blockedPatterns) {
      if (hostname.includes(pattern)) {
        return { safe: false, reason: "Private/internal URL blocked" };
      }
    }
    
    return { safe: true };
  } catch {
    return { safe: false, reason: "Invalid URL format" };
  }
}

/**
 * Check robots.txt compliance (simplified)
 */
export function shouldRespectRobots(url: string): boolean {
  // In real implementation, would fetch and parse robots.txt
  // Always respect robots.txt
  return true;
}

/**
 * Validate competitor doesn't belong to our site
 */
export function isValidCompetitor(
  competitorUrl: string,
  siteUrl: string
): boolean {
  try {
    const competitor = new URL(competitorUrl);
    const site = new URL(siteUrl);
    
    // Same domain = not a competitor
    if (competitor.hostname === site.hostname) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Analysis Functions
// ─────────────────────────────────────────────────────────────

/**
 * Extract topics from crawl result
 */
export function extractTopics(result: CompetitorCrawlResult): string[] {
  const topics = new Set<string>();
  
  // From H1s
  result.h1.forEach(h => {
    const words = h.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    words.forEach(w => topics.add(w));
  });
  
  // From existing topics
  result.topics.forEach(t => topics.add(t.toLowerCase()));
  
  return Array.from(topics).slice(0, 20);
}

/**
 * Identify keyword gaps between us and competitor
 */
export function identifyKeywordGaps(
  competitorKeywords: { keyword: string; position: number; volume: number }[],
  ourKeywords: { keyword: string; position: number; volume: number }[]
): KeywordGap[] {
  const ourKeywordMap = new Map(
    ourKeywords.map(k => [k.keyword.toLowerCase(), k])
  );
  
  const gaps: KeywordGap[] = [];
  
  for (const compKw of competitorKeywords) {
    const ourKw = ourKeywordMap.get(compKw.keyword.toLowerCase());
    
    // Gap if competitor ranks and we don't, or they rank much better
    const isGap = !ourKw || (ourKw.position > compKw.position + 10);
    
    if (isGap && compKw.position <= 20) {
      const difficulty = compKw.position <= 3 ? 80 : compKw.position <= 10 ? 50 : 30;
      
      gaps.push({
        keyword: compKw.keyword,
        competitorRanking: compKw.position,
        ourRanking: ourKw?.position || null,
        volume: compKw.volume,
        difficulty,
        opportunity: compKw.volume > 1000 
          ? "high" 
          : compKw.volume > 100 
          ? "medium" 
          : "low",
      });
    }
  }
  
  return gaps.sort((a, b) => {
    // Sort by opportunity then volume
    const opportunityOrder = { high: 0, medium: 1, low: 2 };
    if (opportunityOrder[a.opportunity] !== opportunityOrder[b.opportunity]) {
      return opportunityOrder[a.opportunity] - opportunityOrder[b.opportunity];
    }
    return b.volume - a.volume;
  });
}

/**
 * Identify content gaps (topics they cover, we don't)
 */
export function identifyContentGaps(
  competitorTopics: Map<string, string[]>, // topic -> competitor URLs
  ourTopics: string[]
): ContentGap[] {
  const ourTopicsSet = new Set(ourTopics.map(t => t.toLowerCase()));
  const gaps: ContentGap[] = [];
  
  for (const [topic, urls] of competitorTopics) {
    if (!ourTopicsSet.has(topic.toLowerCase()) && urls.length >= 1) {
      gaps.push({
        topic,
        competitorUrls: urls,
        suggestedTitle: `Guide: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
        estimatedVolume: urls.length * 100, // Rough estimate
        intent: "informational",
      });
    }
  }
  
  return gaps.sort((a, b) => b.competitorUrls.length - a.competitorUrls.length);
}

/**
 * Generate SWOT-style insights from crawl results
 */
export function generateInsights(
  competitorResult: CompetitorCrawlResult,
  siteName: string
): CompetitorInsight[] {
  const insights: CompetitorInsight[] = [];
  
  // Content insights
  if (competitorResult.contentLength > 2000) {
    insights.push({
      type: "threat",
      category: "content",
      description: `Concurrent a du contenu long-format (${competitorResult.contentLength} mots) - investit dans le SEO`,
      actionable: true,
      priority: "medium",
    });
  }
  
  // Schema insights
  if (competitorResult.hasSchema) {
    insights.push({
      type: competitorResult.schemaTypes.length > 2 ? "threat" : "opportunity",
      category: "seo",
      description: `Concurrent utilise ${competitorResult.schemaTypes.length} type(s) de schema: ${competitorResult.schemaTypes.join(", ")}`,
      actionable: true,
      priority: "medium",
    });
  } else {
    insights.push({
      type: "opportunity",
      category: "seo",
      description: "Concurrent n'utilise pas de données structurées - opportunité de se différencier",
      actionable: true,
      priority: "low",
    });
  }
  
  // Social proof insights
  if (competitorResult.socialProof.length > 3) {
    insights.push({
      type: "threat",
      category: "positioning",
      description: `Concurrent affiche ${competitorResult.socialProof.length} preuves sociales (témoignages, logos, stats)`,
      actionable: true,
      priority: "high",
    });
  }
  
  // Pricing insights
  if (competitorResult.pricing?.hasPublicPricing) {
    insights.push({
      type: "opportunity",
      category: "pricing",
      description: `Concurrent affiche ses prix publiquement: ${competitorResult.pricing.lowestPrice || "visible"}`,
      actionable: true,
      priority: "medium",
    });
  }
  
  // CTA insights
  const uniqueCTAs = new Set(competitorResult.ctas.map(c => c.toLowerCase()));
  if (uniqueCTAs.size > 2) {
    insights.push({
      type: "strength",
      category: "ux",
      description: `Concurrent a ${uniqueCTAs.size} CTAs différents - stratégie de conversion segmentée`,
      actionable: true,
      priority: "low",
    });
  }
  
  // Features insights
  if (competitorResult.features.length > 5) {
    insights.push({
      type: "threat",
      category: "positioning",
      description: `Concurrent met en avant ${competitorResult.features.length} fonctionnalités clés`,
      actionable: true,
      priority: "medium",
    });
  }
  
  return insights;
}

/**
 * Generate opportunity brief from content gap
 */
export function generateOpportunityBrief(gap: ContentGap): {
  title: string;
  description: string;
  targetKeyword: string;
  intent: string;
  competitorCount: number;
} {
  return {
    title: gap.suggestedTitle,
    description: `Créer du contenu sur "${gap.topic}" - ${gap.competitorUrls.length} concurrent(s) couvrent ce sujet`,
    targetKeyword: gap.topic,
    intent: gap.intent,
    competitorCount: gap.competitorUrls.length,
  };
}

// ─────────────────────────────────────────────────────────────
// Main Analysis
// ─────────────────────────────────────────────────────────────

/**
 * Analyze a single competitor
 */
export function analyzeCompetitor(
  competitor: CompetitorProfile,
  crawlResult: CompetitorCrawlResult | undefined,
  ourKeywords: { keyword: string; position: number; volume: number }[]
): CompetitiveAnalysis {
  const analysis: CompetitiveAnalysis = {
    competitor,
    crawlResult,
    keywordGaps: [],
    contentGaps: [],
    insights: [],
    analyzedAt: new Date().toISOString(),
  };
  
  if (!crawlResult) {
    return analysis;
  }
  
  // Generate insights
  analysis.insights = generateInsights(crawlResult, competitor.name);
  
  // Extract topics for content gaps (simplified - would need actual crawl data)
  const competitorTopics = new Map<string, string[]>();
  crawlResult.topics.forEach(topic => {
    competitorTopics.set(topic, [competitor.url]);
  });
  
  // For demo, assume we have no overlapping topics
  analysis.contentGaps = identifyContentGaps(competitorTopics, []);
  
  return analysis;
}

/**
 * Run full competitive intelligence analysis
 */
export function runCompetitiveIntelligence(
  input: CompetitiveIntelInput
): {
  analyses: CompetitiveAnalysis[];
  aggregatedInsights: CompetitorInsight[];
  topOpportunities: ContentGap[];
  blockedCompetitors: { url: string; reason: string }[];
} {
  const analyses: CompetitiveAnalysis[] = [];
  const blockedCompetitors: { url: string; reason: string }[] = [];
  const allInsights: CompetitorInsight[] = [];
  const allContentGaps: ContentGap[] = [];
  
  const maxToAnalyze = input.maxCompetitorsToAnalyze || 5;
  let analyzed = 0;
  
  for (const competitor of input.competitors) {
    if (analyzed >= maxToAnalyze) break;
    
    // Safety checks
    const safetyCheck = isSafeUrl(competitor.url);
    if (!safetyCheck.safe) {
      blockedCompetitors.push({ url: competitor.url, reason: safetyCheck.reason! });
      continue;
    }
    
    if (!isValidCompetitor(competitor.url, input.siteUrl)) {
      blockedCompetitors.push({ url: competitor.url, reason: "Same domain as site" });
      continue;
    }
    
     // NOTE: In production, this would call the seo-crawler edge function
     // to actually crawl the competitor's website. For now, we skip
     // competitors that don't have cached crawl data.
     // TODO: Implement real crawl via edge function call
     blockedCompetitors.push({ 
       url: competitor.url, 
       reason: "Crawl en temps réel non disponible - utilisez l'edge function seo-crawler" 
     });
     continue;
    
     // Real implementation would be:
     // const crawlResult = await callEdgeFunction('seo-crawler', { url: competitor.url });
     // if (crawlResult) {
     //   const analysis = analyzeCompetitor(competitor, crawlResult, input.ourKeywords || []);
     //   analyses.push(analysis);
     //   allInsights.push(...analysis.insights);
     //   allContentGaps.push(...analysis.contentGaps);
     //   analyzed++;
     // }
  }
  
  // Aggregate and prioritize
  const aggregatedInsights = allInsights
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 10);
  
  const topOpportunities = allContentGaps
    .sort((a, b) => b.competitorUrls.length - a.competitorUrls.length)
    .slice(0, 5);
  
  return {
    analyses,
    aggregatedInsights,
    topOpportunities,
    blockedCompetitors,
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────

/**
 * Calculate ICE score for competitive intelligence
 */
function calculateCompetitiveICE(priority: "high" | "medium" | "low", effort: "high" | "medium" | "low"): number {
  const impactMap = { high: 9, medium: 6, low: 3 };
  const effortMap = { high: 3, medium: 6, low: 9 };
  const confidence = 7;
  return Math.round((impactMap[priority] * confidence * effortMap[effort]) / 10);
}

/**
 * Generate Competitive Intelligence agent output
 */
export function generateCompetitiveIntelOutput(
  input: CompetitiveIntelInput
): AgentArtifact {
  const result = runCompetitiveIntelligence(input);
  
  const actions: AgentAction[] = [];
  
  // Add content opportunity actions
  for (const gap of result.topOpportunities) {
    const brief = generateOpportunityBrief(gap);
    const priority = gap.competitorUrls.length >= 2 ? "high" as const : "medium" as const;
    actions.push({
      id: `content-opp-${Date.now()}-${gap.topic.replace(/\s/g, "-")}`,
      title: `Créer: ${brief.title}`,
      description: brief.description,
      priority,
      effort: "medium" as const,
      impact: priority,
      ice_score: calculateCompetitiveICE(priority, "medium"),
      category: "content_gap",
      auto_fixable: false,
      fix_instructions: `Analyser le contenu concurrent sur "${gap.topic}" → Créer un brief avec angle différenciant → Rédiger contenu supérieur`,
    });
  }
  
  // Add insight-based actions
  const threatInsights = result.aggregatedInsights.filter(i => i.type === "threat");
  for (const insight of threatInsights.slice(0, 3)) {
    const priority = insight.priority === "high" ? "high" as const : insight.priority === "medium" ? "medium" as const : "low" as const;
    actions.push({
      id: `threat-${Date.now()}-${insight.category}`,
      title: `Répondre: ${insight.description.substring(0, 50)}...`,
      description: insight.description,
      priority,
      effort: "medium" as const,
      impact: priority,
      ice_score: calculateCompetitiveICE(priority, "medium"),
      category: `competitive_${insight.category}`,
      auto_fixable: false,
      fix_instructions: `Analyser la stratégie ${insight.category} du concurrent → Identifier les éléments à répliquer/améliorer`,
    });
  }
  
  // Add opportunity actions
  const opportunityInsights = result.aggregatedInsights.filter(i => i.type === "opportunity");
  for (const insight of opportunityInsights.slice(0, 2)) {
    const priority = insight.priority === "high" ? "high" as const : insight.priority === "medium" ? "medium" as const : "low" as const;
    actions.push({
      id: `opp-${Date.now()}-${insight.category}`,
      title: `Exploiter: ${insight.description.substring(0, 50)}...`,
      description: `Avantage compétitif potentiel: ${insight.description}`,
      priority,
      effort: "low" as const,
      impact: priority,
      ice_score: calculateCompetitiveICE(priority, "low"),
      category: `opportunity_${insight.category}`,
      auto_fixable: false,
      fix_instructions: "Valider l'opportunité avec les données internes → Prioriser dans le backlog → Implémenter",
    });
  }
  
  const risks: AgentRisk[] = [];
  if (result.blockedCompetitors.length > 0) {
    risks.push({
      id: `blocked-${Date.now()}`,
      description: `${result.blockedCompetitors.length} concurrent(s) non analysé(s) (URL bloquée)`,
      severity: "medium" as const,
      mitigation: "Vérifier les URLs des concurrents bloqués",
    });
  }
  if (result.analyses.length === 0) {
    risks.push({
      id: `no-analysis-${Date.now()}`,
      description: "Aucun concurrent analysé - vérifier les URLs",
      severity: "high" as const,
      mitigation: "Ajouter des URLs de concurrents valides",
    });
  }
  
  return {
    summary: `${result.analyses.length} concurrent(s) analysé(s) | ${result.topOpportunities.length} opportunités contenu | ${result.aggregatedInsights.length} insights | ${result.blockedCompetitors.length} bloqué(s)`,
    actions,
    risks,
    dependencies: ["competitors:urls_configured"],
    metrics_to_watch: [
      "keyword_gap_coverage",
      "content_gap_filled",
      "competitive_position_change",
    ],
    requires_approval: false,
  };
}
