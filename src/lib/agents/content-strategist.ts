/**
 * Content Strategist Agent
 * 
 * Mission: Create keyword strategy and content plan based on real data.
 * 
 * Triggers:
 * - After GSC sync (new keyword data available)
 * - After competitor analysis
 * - Monthly strategic review
 * - Manual "Generate content plan" request
 * 
 * Inputs:
 * - kpis_daily (GSC queries/pages data)
 * - keywords (tracked keywords with metrics)
 * - issues (pages with SEO problems)
 * - brand_kit (tone, audience, values)
 * - competitor_analysis (keyword gaps, content gaps)
 * 
 * Outputs:
 * - JSON artifact (strict schema)
 * - Writes to: keywords, keyword_clusters, content_briefs, action_log
 */

import type { AgentArtifact, AgentAction, AgentRisk } from './types';

// Keyword with metrics
export interface KeywordData {
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  position_avg: number | null;
  clicks_30d: number | null;
  impressions_30d: number | null;
  ctr_30d: number | null;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional' | null;
  source: 'gsc' | 'manual' | 'competitor' | 'ai';
}

// Keyword cluster
export interface KeywordCluster {
  id: string;
  name: string;
  main_intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  keywords: KeywordData[];
  total_volume: number;
  avg_position: number | null;
  opportunity_score: number; // 0-100, higher = more opportunity
  has_content: boolean;
  content_url?: string;
}

// Content opportunity
export interface ContentOpportunity {
  id: string;
  type: 'new_content' | 'refresh' | 'consolidate' | 'delete';
  title: string;
  target_keyword: string;
  cluster_id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  ice_score: number;
  reason: string;
  existing_url?: string;
  word_count_target?: number;
}

// Cannibalization issue
export interface CannibalizationIssue {
  keyword: string;
  competing_urls: string[];
  positions: number[];
  recommendation: string;
}

// Content Strategist Output
export interface ContentStrategistOutput extends AgentArtifact {
  clusters: KeywordCluster[];
  opportunities: ContentOpportunity[];
  cannibalization_issues: CannibalizationIssue[];
  quick_wins: ContentOpportunity[];
  content_calendar: {
    month: string;
    items: { week: number; title: string; type: string; keyword: string }[];
  };
  keyword_gaps: string[]; // Keywords competitors rank for but we don't
  integrations_status: {
    gsc: 'connected' | 'disconnected';
    competitors: 'analyzed' | 'not_analyzed';
  };
}

// Configuration
export interface ContentStrategistConfig {
  workspaceId: string;
  siteId: string;
  siteDomain: string;
  targetMarket?: string;
  language?: string;
}

/**
 * Detects keyword intent based on patterns
 */
export function detectIntent(keyword: string): KeywordData['intent'] {
  const kw = keyword.toLowerCase();
  
  // Transactional
  if (/\b(buy|price|cost|cheap|discount|deal|order|purchase|shop|acheter|prix|promo|commander)\b/.test(kw)) {
    return 'transactional';
  }
  
  // Commercial
  if (/\b(best|top|vs|versus|compare|review|alternative|meilleur|comparatif|avis)\b/.test(kw)) {
    return 'commercial';
  }
  
  // Navigational
  if (/\b(login|signin|sign in|account|dashboard|connexion|compte)\b/.test(kw)) {
    return 'navigational';
  }
  
  // Informational (default for "how", "what", "guide", etc.)
  if (/\b(how|what|why|when|where|guide|tutorial|tips|comment|pourquoi|quand|tutoriel)\b/.test(kw)) {
    return 'informational';
  }
  
  return null;
}

/**
 * Groups keywords into clusters based on semantic similarity
 */
export function clusterKeywords(keywords: KeywordData[]): KeywordCluster[] {
  const clusters: Map<string, KeywordData[]> = new Map();
  
  // Simple clustering by first significant word + intent
  for (const kw of keywords) {
    const words = kw.keyword.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const mainWord = words[0] || kw.keyword.toLowerCase().split(/\s+/)[0];
    const intent = kw.intent || detectIntent(kw.keyword) || 'informational';
    const clusterKey = `${mainWord}_${intent}`;
    
    const existing = clusters.get(clusterKey) || [];
    existing.push({ ...kw, intent });
    clusters.set(clusterKey, existing);
  }
  
  const result: KeywordCluster[] = [];
  let clusterId = 1;
  
  for (const [key, kwList] of clusters.entries()) {
    const [mainWord, intent] = key.split('_');
    const totalVolume = kwList.reduce((sum, k) => sum + (k.search_volume || 0), 0);
    const positionsWithData = kwList.filter(k => k.position_avg !== null);
    const avgPosition = positionsWithData.length > 0
      ? positionsWithData.reduce((sum, k) => sum + (k.position_avg || 0), 0) / positionsWithData.length
      : null;
    
    // Calculate opportunity score
    // High volume + poor position = high opportunity
    let opportunityScore = 50;
    if (totalVolume > 1000) opportunityScore += 20;
    else if (totalVolume > 100) opportunityScore += 10;
    
    if (avgPosition !== null) {
      if (avgPosition > 20) opportunityScore += 20; // Not ranking well = opportunity
      else if (avgPosition > 10) opportunityScore += 10;
      else opportunityScore -= 10; // Already ranking well
    } else {
      opportunityScore += 15; // Not ranking at all = opportunity
    }
    
    result.push({
      id: `cluster-${clusterId++}`,
      name: mainWord.charAt(0).toUpperCase() + mainWord.slice(1),
      main_intent: intent as KeywordCluster['main_intent'],
      keywords: kwList,
      total_volume: totalVolume,
      avg_position: avgPosition ? Number(avgPosition.toFixed(1)) : null,
      opportunity_score: Math.min(100, Math.max(0, opportunityScore)),
      has_content: false, // Would be populated from pages data
    });
  }
  
  // Sort by opportunity score
  result.sort((a, b) => b.opportunity_score - a.opportunity_score);
  
  return result;
}

/**
 * Detects keyword cannibalization
 */
export function detectCannibalization(
  keywordPageMap: Map<string, { url: string; position: number }[]>
): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = [];
  
  for (const [keyword, pages] of keywordPageMap.entries()) {
    // Cannibalization: multiple pages ranking for same keyword
    if (pages.length > 1) {
      const sortedPages = [...pages].sort((a, b) => a.position - b.position);
      
      // Only flag if positions are close (competing for same spots)
      const positionRange = sortedPages[sortedPages.length - 1].position - sortedPages[0].position;
      if (positionRange < 20) {
        issues.push({
          keyword,
          competing_urls: sortedPages.map(p => p.url),
          positions: sortedPages.map(p => p.position),
          recommendation: sortedPages.length === 2
            ? 'Consolider ces deux pages ou établir une hiérarchie claire avec des liens internes'
            : `${sortedPages.length} pages se concurrencent. Identifier la page principale et rediriger les autres ou les différencier.`,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Generates content opportunities from clusters
 */
export function generateOpportunities(
  clusters: KeywordCluster[],
  existingPages: { url: string; keyword?: string; performance?: 'good' | 'declining' | 'poor' }[]
): ContentOpportunity[] {
  const opportunities: ContentOpportunity[] = [];
  let oppId = 1;
  
  for (const cluster of clusters) {
    const mainKeyword = cluster.keywords[0]?.keyword || cluster.name;
    
    // Check if we have content for this cluster
    const existingPage = existingPages.find(p => 
      p.keyword?.toLowerCase() === mainKeyword.toLowerCase()
    );
    
    if (existingPage) {
      // Refresh opportunity for declining pages
      if (existingPage.performance === 'declining' || existingPage.performance === 'poor') {
        const effort = existingPage.performance === 'poor' ? 'high' : 'medium';
        opportunities.push({
          id: `opp-${oppId++}`,
          type: 'refresh',
          title: `Actualiser: ${cluster.name}`,
          target_keyword: mainKeyword,
          cluster_id: cluster.id,
          priority: existingPage.performance === 'poor' ? 'high' : 'medium',
          effort,
          impact: 'medium',
          ice_score: existingPage.performance === 'poor' ? 70 : 55,
          reason: `Page existante en ${existingPage.performance === 'poor' ? 'mauvaise' : 'baisse de'} performance`,
          existing_url: existingPage.url,
          word_count_target: 1500,
        });
      }
    } else if (cluster.opportunity_score >= 60) {
      // New content opportunity for high-opportunity clusters
      const isHighVolume = cluster.total_volume > 500;
      const priority = cluster.opportunity_score >= 80 ? 'critical' : 
                       cluster.opportunity_score >= 70 ? 'high' : 'medium';
      
      opportunities.push({
        id: `opp-${oppId++}`,
        type: 'new_content',
        title: `Créer: Guide ${cluster.name}`,
        target_keyword: mainKeyword,
        cluster_id: cluster.id,
        priority,
        effort: isHighVolume ? 'high' : 'medium',
        impact: isHighVolume ? 'high' : 'medium',
        ice_score: cluster.opportunity_score,
        reason: `${cluster.total_volume} recherches/mois, pas de contenu existant`,
        word_count_target: isHighVolume ? 2500 : 1500,
      });
    }
  }
  
  // Sort by ICE score
  opportunities.sort((a, b) => b.ice_score - a.ice_score);
  
  return opportunities;
}

/**
 * Generates a content calendar from opportunities
 */
export function generateContentCalendar(
  opportunities: ContentOpportunity[],
  month: string = new Date().toISOString().slice(0, 7)
): ContentStrategistOutput['content_calendar'] {
  const items: { week: number; title: string; type: string; keyword: string }[] = [];
  
  // Distribute top opportunities across 4 weeks
  const topOpportunities = opportunities.slice(0, 8);
  
  topOpportunities.forEach((opp, index) => {
    items.push({
      week: (index % 4) + 1,
      title: opp.title,
      type: opp.type,
      keyword: opp.target_keyword,
    });
  });
  
  return { month, items };
}

/**
 * Main Content Strategist Agent class
 */
export class ContentStrategist {
  private config: ContentStrategistConfig;

  constructor(config: ContentStrategistConfig) {
    this.config = config;
  }

  /**
   * Run the content strategist analysis
   */
  run(
    keywords: KeywordData[],
    existingPages: { url: string; keyword?: string; performance?: 'good' | 'declining' | 'poor' }[],
    competitorKeywords: string[] = [],
    keywordPageMap: Map<string, { url: string; position: number }[]> = new Map()
  ): ContentStrategistOutput {
    // Cluster keywords
    const clusters = clusterKeywords(keywords);
    
    // Detect cannibalization
    const cannibalizationIssues = detectCannibalization(keywordPageMap);
    
    // Generate opportunities
    const opportunities = generateOpportunities(clusters, existingPages);
    
    // Quick wins: high impact, low effort
    const quickWins = opportunities.filter(o => 
      o.impact === 'high' && o.effort === 'low' ||
      o.ice_score >= 75 && o.effort !== 'high'
    ).slice(0, 5);
    
    // Generate calendar
    const calendar = generateContentCalendar(opportunities);
    
    // Identify keyword gaps (competitor keywords we don't rank for)
    const ourKeywords = new Set(keywords.map(k => k.keyword.toLowerCase()));
    const keywordGaps = competitorKeywords
      .filter(k => !ourKeywords.has(k.toLowerCase()))
      .slice(0, 20);
    
    // Build actions from opportunities
    const actions: AgentAction[] = opportunities.slice(0, 10).map(opp => ({
      id: opp.id,
      title: opp.title,
      description: opp.reason,
      priority: opp.priority,
      effort: opp.effort,
      impact: opp.impact,
      ice_score: opp.ice_score,
      category: 'content',
      auto_fixable: false,
      fix_instructions: opp.type === 'new_content'
        ? `1. Créer un brief pour "${opp.target_keyword}"\n2. Rédiger ~${opp.word_count_target} mots\n3. Optimiser pour le mot-clé principal\n4. Ajouter liens internes`
        : `1. Analyser la performance actuelle\n2. Mettre à jour le contenu\n3. Ajouter sections manquantes\n4. Optimiser les métas`,
    }));
    
    // Add cannibalization actions
    for (const issue of cannibalizationIssues.slice(0, 3)) {
      actions.push({
        id: `cannibal-${issue.keyword.slice(0, 20)}`,
        title: `Résoudre cannibalisation: ${issue.keyword}`,
        description: `${issue.competing_urls.length} pages se concurrencent pour ce mot-clé`,
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        ice_score: 75,
        category: 'content',
        auto_fixable: false,
        fix_instructions: issue.recommendation,
      });
    }
    
    // Build risks
    const risks: AgentRisk[] = [];
    
    if (keywords.length === 0) {
      risks.push({
        id: 'no_keyword_data',
        description: 'Aucune donnée de mots-clés disponible. Les recommandations sont basées sur des estimations.',
        severity: 'high',
        mitigation: 'Connecter Google Search Console pour obtenir des données réelles.',
      });
    }
    
    if (cannibalizationIssues.length > 5) {
      risks.push({
        id: 'high_cannibalization',
        description: `${cannibalizationIssues.length} cas de cannibalisation détectés. Cela peut nuire au référencement.`,
        severity: 'high',
        mitigation: 'Prioriser la résolution des cannibalisations avant de créer du nouveau contenu.',
      });
    }
    
    // Build summary
    let summary = `${clusters.length} clusters identifiés, ${opportunities.length} opportunités de contenu`;
    if (quickWins.length > 0) {
      summary += `, ${quickWins.length} quick wins`;
    }
    if (cannibalizationIssues.length > 0) {
      summary += `. ⚠️ ${cannibalizationIssues.length} cannibalisations détectées`;
    }
    
    // Determine integrations status
    const hasGSCData = keywords.some(k => k.source === 'gsc');
    
    return {
      summary,
      actions,
      risks,
      dependencies: hasGSCData ? [] : ['integration:gsc'],
      metrics_to_watch: [
        'organic_clicks',
        'organic_impressions',
        'avg_position',
        'indexed_pages',
      ],
      requires_approval: actions.some(a => a.priority === 'critical'),
      clusters,
      opportunities,
      cannibalization_issues: cannibalizationIssues,
      quick_wins: quickWins,
      content_calendar: calendar,
      keyword_gaps: keywordGaps,
      integrations_status: {
        gsc: hasGSCData ? 'connected' : 'disconnected',
        competitors: competitorKeywords.length > 0 ? 'analyzed' : 'not_analyzed',
      },
    };
  }
}

/**
 * Factory function
 */
export function runContentStrategist(
  config: ContentStrategistConfig,
  keywords: KeywordData[],
  existingPages: { url: string; keyword?: string; performance?: 'good' | 'declining' | 'poor' }[],
  competitorKeywords: string[] = [],
  keywordPageMap: Map<string, { url: string; position: number }[]> = new Map()
): ContentStrategistOutput {
  const strategist = new ContentStrategist(config);
  return strategist.run(keywords, existingPages, competitorKeywords, keywordPageMap);
}
