/**
 * Instagram Agent
 * Mission: Analyze IG performance, generate content recommendations, manage publishing
 * Integrates with Meta Instagram Platform API
 */

import type { AgentArtifact, AgentAction, AgentRisk } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface IGAccount {
  id: string;
  igUserId: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
  biography?: string;
  website?: string;
  isVerified?: boolean;
}

export interface IGMedia {
  id: string;
  mediaId: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  caption?: string;
  permalink: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  reach: number;
  impressions: number;
}

export interface IGStory {
  id: string;
  mediaId: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl?: string;
  timestamp: string;
  exits: number;
  impressions: number;
  reach: number;
  replies: number;
  tapsForward: number;
  tapsBack: number;
}

export interface IGAudienceInsights {
  ageGender?: { age: string; gender: string; percentage: number }[];
  topCities?: { city: string; percentage: number }[];
  topCountries?: { country: string; percentage: number }[];
  onlineFollowers?: { hour: number; day: string; count: number }[];
}

export interface BrandKit {
  toneOfVoice: string;
  hashtags?: string[];
  emojis?: boolean;
  visualStyle?: string;
}

export interface IGAgentInput {
  account: IGAccount;
  recentMedia: IGMedia[];
  recentStories: IGStory[];
  audienceInsights?: IGAudienceInsights;
  brandKit?: BrandKit;
  hasPublishAccess: boolean;
}

export interface ContentRecommendation {
  type: "post" | "reel" | "story" | "carousel";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestedCaption?: string;
  suggestedHashtags?: string[];
  bestPostingTime?: string;
  estimatedReach?: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const GOOD_ENGAGEMENT_RATE = 0.03; // 3%
const EXCELLENT_ENGAGEMENT_RATE = 0.06; // 6%
const MIN_REACH_RATIO = 0.3; // 30% of followers
const OPTIMAL_HASHTAG_COUNT = { min: 5, max: 15 };
const OPTIMAL_CAPTION_LENGTH = { min: 100, max: 500 };

// ─────────────────────────────────────────────────────────────
// Analysis Functions
// ─────────────────────────────────────────────────────────────

/**
 * Calculate engagement rate for a post
 */
export function calculateEngagementRate(media: IGMedia, followerCount: number): number {
  if (followerCount === 0) return 0;
  const engagements = media.likeCount + media.commentsCount + media.sharesCount + media.savesCount;
  return engagements / followerCount;
}

/**
 * Calculate reach rate (reach / followers)
 */
export function calculateReachRate(media: IGMedia, followerCount: number): number {
  if (followerCount === 0) return 0;
  return media.reach / followerCount;
}

/**
 * Identify top performing content
 */
export function identifyTopContent(media: IGMedia[], followerCount: number): IGMedia[] {
  return media
    .map(m => ({ media: m, engagement: calculateEngagementRate(m, followerCount) }))
    .filter(m => m.engagement >= GOOD_ENGAGEMENT_RATE)
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5)
    .map(m => m.media);
}

/**
 * Identify underperforming content
 */
export function identifyUnderperformingContent(media: IGMedia[], followerCount: number): IGMedia[] {
  return media
    .map(m => ({ media: m, engagement: calculateEngagementRate(m, followerCount), reach: calculateReachRate(m, followerCount) }))
    .filter(m => m.engagement < GOOD_ENGAGEMENT_RATE * 0.5 || m.reach < MIN_REACH_RATIO * 0.5)
    .slice(0, 5)
    .map(m => m.media);
}

/**
 * Analyze content type performance
 */
export function analyzeContentTypePerformance(
  media: IGMedia[],
  followerCount: number
): { type: string; avgEngagement: number; count: number }[] {
  const byType = new Map<string, { total: number; count: number }>();

  for (const m of media) {
    const type = m.mediaType;
    const engagement = calculateEngagementRate(m, followerCount);
    const existing = byType.get(type) || { total: 0, count: 0 };
    byType.set(type, { total: existing.total + engagement, count: existing.count + 1 });
  }

  return Array.from(byType.entries())
    .map(([type, data]) => ({
      type,
      avgEngagement: data.total / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

/**
 * Analyze optimal posting times from audience insights
 */
export function analyzeOptimalPostingTimes(
  insights?: IGAudienceInsights
): { day: string; hour: number; score: number }[] {
  if (!insights?.onlineFollowers) {
    // Default optimal times
    return [
      { day: "Wednesday", hour: 11, score: 10 },
      { day: "Friday", hour: 10, score: 9 },
      { day: "Tuesday", hour: 14, score: 8 },
    ];
  }

  return insights.onlineFollowers
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((of, idx) => ({
      day: of.day,
      hour: of.hour,
      score: 10 - idx,
    }));
}

/**
 * Analyze hashtag performance
 */
export function analyzeHashtagPerformance(
  media: IGMedia[],
  followerCount: number
): { hashtag: string; avgReach: number; uses: number }[] {
  const hashtagStats = new Map<string, { totalReach: number; count: number }>();

  for (const m of media) {
    if (!m.caption) continue;
    
    const hashtags = m.caption.match(/#\w+/g) || [];
    for (const tag of hashtags) {
      const existing = hashtagStats.get(tag) || { totalReach: 0, count: 0 };
      hashtagStats.set(tag, {
        totalReach: existing.totalReach + m.reach,
        count: existing.count + 1,
      });
    }
  }

  return Array.from(hashtagStats.entries())
    .filter(([_, data]) => data.count >= 2)
    .map(([hashtag, data]) => ({
      hashtag,
      avgReach: data.totalReach / data.count,
      uses: data.count,
    }))
    .sort((a, b) => b.avgReach - a.avgReach)
    .slice(0, 10);
}

/**
 * Analyze story performance
 */
export function analyzeStoryPerformance(
  stories: IGStory[]
): { avgRetention: number; avgReplies: number; insights: string[] } {
  if (stories.length === 0) {
    return { avgRetention: 0, avgReplies: 0, insights: ["Aucune story analysée"] };
  }

  const insights: string[] = [];
  
  // Calculate retention rate (1 - exit rate)
  const avgExitRate = stories.reduce((sum, s) => 
    sum + (s.reach > 0 ? s.exits / s.reach : 0), 0
  ) / stories.length;
  const avgRetention = 1 - avgExitRate;
  
  // Average replies
  const avgReplies = stories.reduce((sum, s) => sum + s.replies, 0) / stories.length;
  
  // Generate insights
  if (avgRetention > 0.85) {
    insights.push("Excellent taux de rétention des stories");
  } else if (avgRetention < 0.6) {
    insights.push("Taux de sortie élevé - améliorer l'accroche des stories");
  }
  
  if (avgReplies > 2) {
    insights.push("Bon engagement via les réponses aux stories");
  } else {
    insights.push("Ajouter des stickers interactifs pour augmenter les réponses");
  }

  // Check forward/back taps
  const avgTapsForward = stories.reduce((sum, s) => sum + s.tapsForward, 0) / stories.length;
  const avgTapsBack = stories.reduce((sum, s) => sum + s.tapsBack, 0) / stories.length;
  
  if (avgTapsBack > avgTapsForward * 0.3) {
    insights.push("Les utilisateurs reviennent en arrière - contenu intéressant");
  }

  return { avgRetention, avgReplies, insights };
}

// ─────────────────────────────────────────────────────────────
// Content Recommendations
// ─────────────────────────────────────────────────────────────

export function generateContentRecommendations(input: IGAgentInput): ContentRecommendation[] {
  const recommendations: ContentRecommendation[] = [];
  const { account, recentMedia, brandKit } = input;

  // Analyze content type performance
  const typePerformance = analyzeContentTypePerformance(recentMedia, account.followersCount);
  const bestType = typePerformance[0];
  
  if (bestType) {
    // Recommend more of what works
    const typeMap: Record<string, "post" | "reel" | "carousel"> = {
      "IMAGE": "post",
      "VIDEO": "reel",
      "REELS": "reel",
      "CAROUSEL_ALBUM": "carousel",
    };
    
    recommendations.push({
      type: typeMap[bestType.type] || "post",
      priority: "high",
      title: `Plus de ${bestType.type.toLowerCase()}`,
      description: `Ce format génère ${(bestType.avgEngagement * 100).toFixed(1)}% d'engagement moyen`,
      estimatedReach: `+${Math.round(bestType.avgEngagement * account.followersCount)} interactions`,
    });
  }

  // If reels are underutilized
  const reelsCount = recentMedia.filter(m => m.mediaType === "REELS").length;
  const reelsRatio = reelsCount / recentMedia.length;
  
  if (reelsRatio < 0.3) {
    recommendations.push({
      type: "reel",
      priority: "high",
      title: "Augmenter la fréquence des Reels",
      description: "Les Reels génèrent 2-3x plus de reach que les posts classiques",
      estimatedReach: "+50-100% de reach potentiel",
    });
  }

  // Hashtag optimization
  const topHashtags = analyzeHashtagPerformance(recentMedia, account.followersCount);
  if (topHashtags.length > 0) {
    recommendations.push({
      type: "post",
      priority: "medium",
      title: "Optimiser les hashtags",
      description: `Utiliser les hashtags performants: ${topHashtags.slice(0, 5).map(h => h.hashtag).join(", ")}`,
      suggestedHashtags: topHashtags.slice(0, 10).map(h => h.hashtag),
    });
  }

  // Posting time optimization
  const optimalTimes = analyzeOptimalPostingTimes(input.audienceInsights);
  if (optimalTimes.length > 0) {
    const best = optimalTimes[0];
    recommendations.push({
      type: "post",
      priority: "medium",
      title: "Optimiser les horaires de publication",
      description: `Meilleur créneau: ${best.day} à ${best.hour}h`,
      bestPostingTime: `${best.day} ${best.hour}:00`,
    });
  }

  // Story recommendations
  const storyAnalysis = analyzeStoryPerformance(input.recentStories);
  if (storyAnalysis.avgRetention < 0.7) {
    recommendations.push({
      type: "story",
      priority: "medium",
      title: "Améliorer les stories",
      description: storyAnalysis.insights[0] || "Ajouter plus d'éléments interactifs",
    });
  }

  // Carousel recommendation if not used much
  const carouselCount = recentMedia.filter(m => m.mediaType === "CAROUSEL_ALBUM").length;
  if (carouselCount < 2) {
    recommendations.push({
      type: "carousel",
      priority: "medium",
      title: "Tester les carrousels",
      description: "Les carrousels génèrent plus d'engagement et de saves",
      estimatedReach: "+40% de temps passé sur le contenu",
    });
  }

  return recommendations;
}

// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────

function calculateIGICE(priority: "high" | "medium" | "low", hasPublishAccess: boolean): number {
  const impactMap = { high: 9, medium: 6, low: 3 };
  const ease = hasPublishAccess ? 8 : 5;
  const confidence = 7;
  return Math.round((impactMap[priority] * confidence * ease) / 10);
}

export function generateInstagramOutput(input: IGAgentInput): AgentArtifact {
  const recommendations = generateContentRecommendations(input);
  
  // Calculate account stats
  const avgEngagement = input.recentMedia.length > 0
    ? input.recentMedia.reduce((sum, m) => 
        sum + calculateEngagementRate(m, input.account.followersCount), 0
      ) / input.recentMedia.length
    : 0;

  const actions: AgentAction[] = recommendations.map((rec, idx) => ({
    id: `ig-${Date.now()}-${idx}`,
    title: rec.title,
    description: rec.description,
    priority: rec.priority,
    effort: rec.type === "reel" ? "high" as const : rec.type === "carousel" ? "medium" as const : "low" as const,
    impact: rec.priority,
    ice_score: calculateIGICE(rec.priority, input.hasPublishAccess),
    category: `ig_${rec.type}`,
    auto_fixable: false, // Content creation requires human input
    fix_instructions: rec.estimatedReach || rec.bestPostingTime,
  }));

  const risks: AgentRisk[] = [];

  // Check engagement rate
  if (avgEngagement < GOOD_ENGAGEMENT_RATE * 0.5) {
    risks.push({
      id: `engagement-${Date.now()}`,
      description: "Taux d'engagement en dessous de la moyenne du secteur",
      severity: "high",
      mitigation: "Analyser le contenu performant et adapter la stratégie",
    });
  }

  // Check posting frequency
  if (input.recentMedia.length < 8) {
    risks.push({
      id: `frequency-${Date.now()}`,
      description: "Fréquence de publication faible (< 2/semaine)",
      severity: "medium",
      mitigation: "Augmenter à 3-5 posts par semaine minimum",
    });
  }

  // Check publish access
  if (!input.hasPublishAccess) {
    risks.push({
      id: `access-${Date.now()}`,
      description: "Pas d'accès publication - mode export uniquement",
      severity: "low",
      mitigation: "Demander instagram_content_publish pour la publication directe",
    });
  }

  // Calculate follower growth potential
  const followRatio = input.account.followersCount / (input.account.followsCount || 1);

  return {
    summary: `Instagram @${input.account.username}: ${input.account.followersCount.toLocaleString()} abonnés, ${(avgEngagement * 100).toFixed(2)}% engagement moyen. ${recommendations.length} recommandations pour améliorer les performances.`,
    actions,
    risks,
    dependencies: ["meta_integration", "instagram_platform_api"],
    metrics_to_watch: ["engagement_rate", "reach", "follower_growth", "saves", "shares"],
    requires_approval: false, // IG content requires human review
  };
}
