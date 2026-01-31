/**
 * Meta Agent Orchestrator
 * Connects Meta data from useMeta hook to specialized agents
 */

import { 
  generateMetaAdsOutput, 
  type MetaAdsInput,
  type MetaAdAccount,
  type MetaCampaign,
  type MetaAdset,
  type MetaAd,
  type MetaInsight,
} from "./meta-ads-agent";

import {
  generateInstagramOutput,
  type IGAgentInput,
  type IGAccount,
  type IGMedia,
  type IGStory,
} from "./instagram-agent";

import type { AgentArtifact } from "./types";

// ─────────────────────────────────────────────────────────────
// Meta Data Transformation
// ─────────────────────────────────────────────────────────────

/**
 * Transform useMeta hook data to Meta Ads Agent input
 */
export function transformToMetaAdsInput(
  adAccounts: Array<{
    id: string;
    account_id: string;
    account_name: string | null;
    currency: string | null;
    timezone: string | null;
    business_id: string | null;
    account_status: number | null;
    spend_cap: number | null;
    amount_spent: number | null;
  }>,
  campaigns: Array<{
    id: string;
    campaign_id: string;
    ad_account_id: string;
    name: string;
    effective_status: string | null;
    objective: string | null;
    daily_budget: number | null;
    lifetime_budget: number | null;
  }>,
  adsets: Array<{
    id: string;
    adset_id: string;
    campaign_id: string;
    name: string;
    effective_status: string | null;
    optimization_goal: string | null;
    billing_event: string | null;
    bid_amount: number | null;
    targeting: Record<string, unknown> | null;
  }>,
  ads: Array<{
    id: string;
    ad_id: string;
    adset_id: string;
    name: string;
    effective_status: string | null;
    creative_id: string | null;
    preview_url: string | null;
  }>,
  insights: Array<{
    id: string;
    ad_account_id: string;
    campaign_id: string | null;
    adset_id: string | null;
    ad_id: string | null;
    date_start: string | null;
    date_stop: string | null;
    impressions: number | null;
    clicks: number | null;
    spend: number | null;
    reach: number | null;
    cpc: number | null;
    cpm: number | null;
    ctr: number | null;
    conversions: number | null;
    cost_per_conversion: number | null;
  }>,
  options: {
    budgetCap?: number;
    hasWriteAccess?: boolean;
  } = {}
): MetaAdsInput | null {
  if (adAccounts.length === 0) return null;

  const account = adAccounts[0];
  
  const mappedAccount: MetaAdAccount = {
    id: account.id,
    accountId: account.account_id,
    accountName: account.account_name || "Unknown",
    currency: account.currency || "EUR",
    timezone: account.timezone || "Europe/Paris",
    status: account.account_status === 1 ? "ACTIVE" : "PAUSED",
    spendCap: account.spend_cap || undefined,
    amountSpent: account.amount_spent || undefined,
  };

  const mappedCampaigns: MetaCampaign[] = campaigns.map(c => ({
    id: c.id,
    campaignId: c.campaign_id,
    name: c.name,
    status: (c.effective_status as "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED") || "PAUSED",
    objective: c.objective as any || "OUTCOME_TRAFFIC",
    dailyBudget: c.daily_budget ? c.daily_budget / 100 : undefined, // Meta stores in cents
    lifetimeBudget: c.lifetime_budget ? c.lifetime_budget / 100 : undefined,
  }));

  const mappedAdsets: MetaAdset[] = adsets.map(a => ({
    id: a.id,
    adsetId: a.adset_id,
    campaignId: a.campaign_id,
    name: a.name,
    status: a.effective_status || "PAUSED",
    optimizationGoal: a.optimization_goal || "",
    billingEvent: a.billing_event || "IMPRESSIONS",
    bidAmount: a.bid_amount ? a.bid_amount / 100 : undefined,
    targeting: a.targeting as any,
  }));

  const mappedAds: MetaAd[] = ads.map(a => ({
    id: a.id,
    adId: a.ad_id,
    adsetId: a.adset_id,
    name: a.name,
    status: a.effective_status || "PAUSED",
    creativeId: a.creative_id || undefined,
    previewUrl: a.preview_url || undefined,
  }));

  const mappedInsights: MetaInsight[] = insights.map(i => ({
    objectId: i.campaign_id || i.adset_id || i.ad_id || i.ad_account_id,
    objectType: i.ad_id ? "ad" : i.adset_id ? "adset" : i.campaign_id ? "campaign" : "account",
    dateStart: i.date_start || "",
    dateStop: i.date_stop || "",
    impressions: i.impressions || 0,
    clicks: i.clicks || 0,
    spend: (i.spend || 0) / 100, // Convert from cents
    reach: i.reach || 0,
    cpc: i.cpc ? i.cpc / 100 : 0,
    cpm: i.cpm ? i.cpm / 100 : 0,
    ctr: i.ctr || 0,
    conversions: i.conversions || undefined,
    costPerConversion: i.cost_per_conversion ? i.cost_per_conversion / 100 : undefined,
  }));

  return {
    account: mappedAccount,
    campaigns: mappedCampaigns,
    adsets: mappedAdsets,
    ads: mappedAds,
    insights: mappedInsights,
    budgetCap: options.budgetCap || 1000,
    hasWriteAccess: options.hasWriteAccess || false,
  };
}

/**
 * Transform useMeta hook data to Instagram Agent input
 */
export function transformToInstagramInput(
  igAccounts: Array<{
    id: string;
    ig_user_id: string;
    username: string | null;
    name: string | null;
    profile_picture_url: string | null;
    followers_count: number | null;
    follows_count: number | null;
    media_count: number | null;
    biography: string | null;
    website: string | null;
    is_business_account: boolean | null;
  }>,
  igMedia: Array<{
    id: string;
    media_id: string;
    media_type: string | null;
    caption: string | null;
    permalink: string | null;
    media_url: string | null;
    thumbnail_url: string | null;
    timestamp: string | null;
    like_count: number | null;
    comments_count: number | null;
    engagement: number | null;
    reach: number | null;
    impressions: number | null;
  }>,
  igStories: Array<{
    id: string;
    media_id: string;
    media_type: string | null;
    media_url: string | null;
    expires_at: string | null;
    impressions: number | null;
    reach: number | null;
    replies: number | null;
    exits: number | null;
  }>,
  options: {
    hasPublishAccess?: boolean;
    brandKit?: {
      toneOfVoice: string;
      hashtags?: string[];
      emojis?: boolean;
      visualStyle?: string;
    };
  } = {}
): IGAgentInput | null {
  if (igAccounts.length === 0) return null;

  const acc = igAccounts[0];
  
  const account: IGAccount = {
    id: acc.id,
    igUserId: acc.ig_user_id,
    username: acc.username || "",
    name: acc.name || undefined,
    profilePictureUrl: acc.profile_picture_url || undefined,
    followersCount: acc.followers_count || 0,
    followsCount: acc.follows_count || 0,
    mediaCount: acc.media_count || 0,
    biography: acc.biography || undefined,
    website: acc.website || undefined,
    isVerified: false,
  };

  const recentMedia: IGMedia[] = igMedia.map(m => ({
    id: m.id,
    mediaId: m.media_id,
    mediaType: (m.media_type as "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS") || "IMAGE",
    caption: m.caption || undefined,
    permalink: m.permalink || "",
    mediaUrl: m.media_url || undefined,
    thumbnailUrl: m.thumbnail_url || undefined,
    timestamp: m.timestamp || new Date().toISOString(),
    likeCount: m.like_count || 0,
    commentsCount: m.comments_count || 0,
    sharesCount: 0, // Not available in this schema
    savesCount: 0, // Not available in this schema
    reach: m.reach || 0,
    impressions: m.impressions || 0,
  }));

  const recentStories: IGStory[] = igStories.map(s => ({
    id: s.id,
    mediaId: s.media_id,
    mediaType: (s.media_type as "IMAGE" | "VIDEO") || "IMAGE",
    mediaUrl: s.media_url || undefined,
    timestamp: s.expires_at || new Date().toISOString(),
    exits: s.exits || 0,
    impressions: s.impressions || 0,
    reach: s.reach || 0,
    replies: s.replies || 0,
    tapsForward: 0,
    tapsBack: 0,
  }));

  return {
    account,
    recentMedia,
    recentStories,
    brandKit: options.brandKit,
    hasPublishAccess: options.hasPublishAccess || false,
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Runners
// ─────────────────────────────────────────────────────────────

/**
 * Run Meta Ads optimization agent
 */
export async function runMetaAdsAgent(
  input: MetaAdsInput
): Promise<AgentArtifact> {
  // In a real implementation, this would call the AI gateway
  // For now, we use the local analysis functions
  return generateMetaAdsOutput(input);
}

/**
 * Run Instagram content agent
 */
export async function runInstagramAgent(
  input: IGAgentInput
): Promise<AgentArtifact> {
  return generateInstagramOutput(input);
}

/**
 * Run all Meta agents and combine results
 */
export async function runAllMetaAgents(
  metaAdsInput: MetaAdsInput | null,
  instagramInput: IGAgentInput | null
): Promise<{
  metaAds?: AgentArtifact;
  instagram?: AgentArtifact;
  combined: AgentArtifact;
}> {
  const results: {
    metaAds?: AgentArtifact;
    instagram?: AgentArtifact;
  } = {};

  if (metaAdsInput) {
    results.metaAds = await runMetaAdsAgent(metaAdsInput);
  }

  if (instagramInput) {
    results.instagram = await runInstagramAgent(instagramInput);
  }

  // Combine results
  const allActions = [
    ...(results.metaAds?.actions || []),
    ...(results.instagram?.actions || []),
  ].sort((a, b) => b.ice_score - a.ice_score);

  const allRisks = [
    ...(results.metaAds?.risks || []),
    ...(results.instagram?.risks || []),
  ];

  const combined: AgentArtifact = {
    summary: `Meta Analysis: ${allActions.length} actions, ${allRisks.length} risks identified`,
    actions: allActions,
    risks: allRisks,
    dependencies: ["meta_integration"],
    metrics_to_watch: ["cpm", "ctr", "engagement_rate", "reach", "conversions"],
    requires_approval: allActions.some(a => a.auto_fixable),
  };

  return { ...results, combined };
}
