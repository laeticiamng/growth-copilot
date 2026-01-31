/**
 * Social Distribution Agent
 * Mission: Distribute content across social platforms with publishing or export
 */

import type { AgentArtifact, AgentAction, AgentRisk } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface SocialPlatform {
  id: string;
  name: "twitter" | "linkedin" | "instagram" | "facebook" | "tiktok" | "youtube";
  connected: boolean;
  hasPublishAccess: boolean;
  accountName?: string;
  followerCount?: number;
}

export interface ContentPiece {
  id: string;
  title: string;
  type: "blog" | "video" | "podcast" | "product" | "announcement" | "offer";
  url: string;
  excerpt?: string;
  publishedAt: string;
  tags?: string[];
  imageUrl?: string;
}

export interface BrandKit {
  toneOfVoice: string;
  hashtags?: string[];
  emojis?: boolean;
  mentionHandles?: Record<string, string>; // platform -> handle
}

export interface UTMConfig {
  source: string;
  medium: string;
  campaign?: string;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform["name"];
  contentId: string;
  text: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledAt?: string;
  publishedAt?: string;
  status: "draft" | "scheduled" | "published" | "failed";
  utmParams: UTMConfig;
  characterCount: number;
  isWithinLimit: boolean;
}

export interface RepurposedContent {
  original: ContentPiece;
  variations: SocialPost[];
}

export interface SocialCalendarEntry {
  date: string;
  time: string;
  platform: SocialPlatform["name"];
  postId: string;
  contentTitle: string;
  status: SocialPost["status"];
}

export interface SocialDistributionInput {
  content: ContentPiece[];
  platforms: SocialPlatform[];
  brandKit: BrandKit;
  utmDefaults: UTMConfig;
  postsPerWeek: number;
  preferredTimes?: Record<SocialPlatform["name"], string[]>;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const CHARACTER_LIMITS: Record<SocialPlatform["name"], number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
  tiktok: 2200,
  youtube: 5000,
};

const DEFAULT_POST_TIMES: Record<SocialPlatform["name"], string[]> = {
  twitter: ["09:00", "12:00", "17:00"],
  linkedin: ["08:00", "12:00", "17:30"],
  instagram: ["11:00", "14:00", "19:00"],
  facebook: ["09:00", "13:00", "16:00"],
  tiktok: ["12:00", "19:00", "21:00"],
  youtube: ["14:00", "17:00"],
};

const HASHTAG_LIMITS: Record<SocialPlatform["name"], number> = {
  twitter: 3,
  linkedin: 5,
  instagram: 30,
  facebook: 5,
  tiktok: 5,
  youtube: 15,
};

// ─────────────────────────────────────────────────────────────
// Content Repurposing
// ─────────────────────────────────────────────────────────────

/**
 * Generate platform-specific text from content
 */
export function generatePlatformText(
  content: ContentPiece,
  platform: SocialPlatform["name"],
  brandKit: BrandKit
): string {
  const limit = CHARACTER_LIMITS[platform];
  const useEmojis = brandKit.emojis !== false;
  
  let text = "";
  
  switch (platform) {
    case "twitter":
      // Short, punchy, with hook
      text = useEmojis ? "🚀 " : "";
      text += content.title;
      if (content.excerpt && text.length + content.excerpt.length < limit - 30) {
        text += `\n\n${content.excerpt.substring(0, 100)}...`;
      }
      text += `\n\n${content.url}`;
      break;
      
    case "linkedin":
      // Professional, story-driven
      text = content.title + "\n\n";
      if (content.excerpt) {
        text += content.excerpt + "\n\n";
      }
      text += "Points clés:\n";
      text += "• Point 1\n• Point 2\n• Point 3\n\n";
      text += `Lire l'article complet: ${content.url}`;
      break;
      
    case "instagram":
      // Visual-first, CTA in bio
      text = useEmojis ? "✨ " : "";
      text += content.title + "\n\n";
      if (content.excerpt) {
        text += content.excerpt + "\n\n";
      }
      text += useEmojis ? "👉 " : "";
      text += "Lien en bio";
      break;
      
    case "facebook":
      // Conversational, engaging
      text = content.title + "\n\n";
      if (content.excerpt) {
        text += content.excerpt + "\n\n";
      }
      text += `En savoir plus: ${content.url}`;
      break;
      
    case "tiktok":
      // Trendy, short
      text = useEmojis ? "💡 " : "";
      text += content.title;
      break;
      
    case "youtube":
      // Description-focused
      text = content.title + "\n\n";
      if (content.excerpt) {
        text += content.excerpt + "\n\n";
      }
      text += "📌 Chapitres:\n00:00 Introduction\n\n";
      text += `🔗 ${content.url}`;
      break;
  }
  
  // Truncate if needed
  if (text.length > limit) {
    text = text.substring(0, limit - 3) + "...";
  }
  
  return text;
}

/**
 * Generate hashtags for platform
 */
export function generateHashtags(
  content: ContentPiece,
  platform: SocialPlatform["name"],
  brandKit: BrandKit
): string[] {
  const limit = HASHTAG_LIMITS[platform];
  const hashtags: string[] = [];
  
  // Brand hashtags first
  if (brandKit.hashtags) {
    hashtags.push(...brandKit.hashtags.slice(0, 2));
  }
  
  // Content tags
  if (content.tags) {
    for (const tag of content.tags) {
      if (hashtags.length >= limit) break;
      const hashtagified = tag.replace(/\s+/g, "").toLowerCase();
      if (!hashtags.includes(hashtagified)) {
        hashtags.push(hashtagified);
      }
    }
  }
  
  // Content type hashtag
  const typeHashtags: Record<ContentPiece["type"], string> = {
    blog: "blog",
    video: "video",
    podcast: "podcast",
    product: "newproduct",
    announcement: "news",
    offer: "promo",
  };
  if (hashtags.length < limit) {
    hashtags.push(typeHashtags[content.type]);
  }
  
  return hashtags.slice(0, limit).map(h => h.startsWith("#") ? h : `#${h}`);
}

/**
 * Add UTM parameters to URL
 */
export function addUTMParams(url: string, utm: UTMConfig, platform: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", utm.source || platform);
    parsed.searchParams.set("utm_medium", utm.medium || "social");
    if (utm.campaign) {
      parsed.searchParams.set("utm_campaign", utm.campaign);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Repurpose content for multiple platforms
 */
export function repurposeContent(
  content: ContentPiece,
  platforms: SocialPlatform[],
  brandKit: BrandKit,
  utmDefaults: UTMConfig
): RepurposedContent {
  const variations: SocialPost[] = [];
  
  for (const platform of platforms) {
    if (!platform.connected) continue;
    
    const text = generatePlatformText(content, platform.name, brandKit);
    const hashtags = generateHashtags(content, platform.name, brandKit);
    const utmParams: UTMConfig = {
      source: platform.name,
      medium: "social",
      campaign: utmDefaults.campaign || content.type,
    };
    
    const trackedUrl = addUTMParams(content.url, utmParams, platform.name);
    const finalText = text.replace(content.url, trackedUrl);
    
    const characterCount = finalText.length + hashtags.join(" ").length + 1;
    const limit = CHARACTER_LIMITS[platform.name];
    
    variations.push({
      id: `post-${content.id}-${platform.name}-${Date.now()}`,
      platform: platform.name,
      contentId: content.id,
      text: finalText,
      hashtags,
      mediaUrls: content.imageUrl ? [content.imageUrl] : [],
      status: "draft",
      utmParams,
      characterCount,
      isWithinLimit: characterCount <= limit,
    });
  }
  
  return { original: content, variations };
}

// ─────────────────────────────────────────────────────────────
// Calendar Generation
// ─────────────────────────────────────────────────────────────

/**
 * Distribute posts across the week
 */
export function generateWeeklyCalendar(
  posts: SocialPost[],
  postsPerWeek: number,
  preferredTimes: Record<SocialPlatform["name"], string[]> = DEFAULT_POST_TIMES
): SocialCalendarEntry[] {
  const calendar: SocialCalendarEntry[] = [];
  const today = new Date();
  
  // Group posts by platform
  const byPlatform = new Map<SocialPlatform["name"], SocialPost[]>();
  for (const post of posts) {
    const existing = byPlatform.get(post.platform) || [];
    existing.push(post);
    byPlatform.set(post.platform, existing);
  }
  
  // Distribute across 7 days
  let dayOffset = 0;
  let postCount = 0;
  
  for (const [platform, platformPosts] of byPlatform) {
    const times = preferredTimes[platform] || DEFAULT_POST_TIMES[platform];
    
    for (const post of platformPosts) {
      if (postCount >= postsPerWeek) break;
      
      const postDate = new Date(today);
      postDate.setDate(postDate.getDate() + dayOffset);
      
      const time = times[postCount % times.length];
      
      calendar.push({
        date: postDate.toISOString().split("T")[0],
        time,
        platform,
        postId: post.id,
        contentTitle: post.text.substring(0, 50) + "...",
        status: post.status,
      });
      
      postCount++;
      dayOffset = (dayOffset + 1) % 7;
    }
  }
  
  // Sort by date/time
  return calendar.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

/**
 * Generate iCal export content
 */
export function generateICalExport(calendar: SocialCalendarEntry[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SocialAgent//EN",
    "CALSCALE:GREGORIAN",
  ];
  
  for (const entry of calendar) {
    const dateStr = entry.date.replace(/-/g, "");
    const timeStr = entry.time.replace(":", "") + "00";
    
    lines.push("BEGIN:VEVENT");
    lines.push(`DTSTART:${dateStr}T${timeStr}`);
    lines.push(`DTEND:${dateStr}T${timeStr}`);
    lines.push(`SUMMARY:[${entry.platform.toUpperCase()}] ${entry.contentTitle}`);
    lines.push(`UID:${entry.postId}`);
    lines.push("END:VEVENT");
  }
  
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Generate CSV export content
 */
export function generateCSVExport(posts: SocialPost[]): string {
  const headers = ["Platform", "Text", "Hashtags", "Media URL", "UTM Source", "UTM Medium", "UTM Campaign"];
  const rows = [headers.join(",")];
  
  for (const post of posts) {
    const row = [
      post.platform,
      `"${post.text.replace(/"/g, '""')}"`,
      `"${post.hashtags.join(" ")}"`,
      post.mediaUrls[0] || "",
      post.utmParams.source,
      post.utmParams.medium,
      post.utmParams.campaign || "",
    ];
    rows.push(row.join(","));
  }
  
  return rows.join("\n");
}

// ─────────────────────────────────────────────────────────────
// Main Distribution
// ─────────────────────────────────────────────────────────────

/**
 * Run social distribution for all content
 */
export function runSocialDistribution(
  input: SocialDistributionInput
): {
  repurposed: RepurposedContent[];
  calendar: SocialCalendarEntry[];
  allPosts: SocialPost[];
  publishablePosts: SocialPost[];
  exportOnlyPosts: SocialPost[];
  platformStats: Record<string, { total: number; publishable: number }>;
} {
  const repurposed: RepurposedContent[] = [];
  const allPosts: SocialPost[] = [];
  
  // Repurpose each content piece
  for (const content of input.content) {
    const result = repurposeContent(
      content,
      input.platforms,
      input.brandKit,
      input.utmDefaults
    );
    repurposed.push(result);
    allPosts.push(...result.variations);
  }
  
  // Separate publishable from export-only
  const publishablePosts = allPosts.filter(post => {
    const platform = input.platforms.find(p => p.name === post.platform);
    return platform?.hasPublishAccess && post.isWithinLimit;
  });
  
  const exportOnlyPosts = allPosts.filter(post => {
    const platform = input.platforms.find(p => p.name === post.platform);
    return !platform?.hasPublishAccess || !post.isWithinLimit;
  });
  
  // Generate calendar
  const calendar = generateWeeklyCalendar(
    allPosts,
    input.postsPerWeek,
    input.preferredTimes
  );
  
  // Platform stats
  const platformStats: Record<string, { total: number; publishable: number }> = {};
  for (const platform of input.platforms) {
    const platformPosts = allPosts.filter(p => p.platform === platform.name);
    const publishable = publishablePosts.filter(p => p.platform === platform.name);
    platformStats[platform.name] = {
      total: platformPosts.length,
      publishable: publishable.length,
    };
  }
  
  return {
    repurposed,
    calendar,
    allPosts,
    publishablePosts,
    exportOnlyPosts,
    platformStats,
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────

/**
 * Calculate ICE score for social actions
 */
function calculateSocialICE(impact: "high" | "medium" | "low", effort: "low" | "medium" | "high"): number {
  const impactMap = { high: 9, medium: 6, low: 3 };
  const effortMap = { high: 3, medium: 6, low: 9 };
  const confidence = 8;
  return Math.round((impactMap[impact] * confidence * effortMap[effort]) / 10);
}

/**
 * Generate Social Distribution agent output
 */
export function generateSocialDistributionOutput(
  input: SocialDistributionInput
): AgentArtifact {
  const result = runSocialDistribution(input);
  
  const actions: AgentAction[] = [];
  
  // Calendar action
  if (result.calendar.length > 0) {
    actions.push({
      id: `calendar-${Date.now()}`,
      title: `Calendrier social: ${result.calendar.length} posts planifiés`,
      description: `Distribution optimisée sur ${Object.keys(result.platformStats).length} plateformes`,
      priority: "high" as const,
      effort: "low" as const,
      impact: "high" as const,
      ice_score: calculateSocialICE("high", "low"),
      category: "social_calendar",
      auto_fixable: false,
      fix_instructions: "Revoir le calendrier → Ajuster les horaires → Valider les textes → Exporter en iCal ou CSV",
    });
  }
  
  // Publishable posts action
  if (result.publishablePosts.length > 0) {
    const platforms = [...new Set(result.publishablePosts.map(p => p.platform))];
    actions.push({
      id: `publish-${Date.now()}`,
      title: `Publier ${result.publishablePosts.length} posts`,
      description: `Posts prêts pour publication automatique sur: ${platforms.join(", ")}`,
      priority: "high" as const,
      effort: "low" as const,
      impact: "high" as const,
      ice_score: calculateSocialICE("high", "low"),
      category: "social_publish",
      auto_fixable: false,
      fix_instructions: "Valider le contenu de chaque post → Confirmer les horaires → Lancer la publication",
    });
  }
  
  // Export-only posts action
  if (result.exportOnlyPosts.length > 0) {
    actions.push({
      id: `export-${Date.now()}`,
      title: `Exporter ${result.exportOnlyPosts.length} posts (manuel)`,
      description: "Plateformes non connectées ou limites de caractères dépassées",
      priority: "medium" as const,
      effort: "medium" as const,
      impact: "medium" as const,
      ice_score: calculateSocialICE("medium", "medium"),
      category: "social_export",
      auto_fixable: false,
      fix_instructions: "Télécharger le CSV → Copier/coller manuellement sur chaque plateforme",
    });
  }
  
  // Platform connection recommendations
  const disconnectedPlatforms = input.platforms.filter(p => !p.connected);
  if (disconnectedPlatforms.length > 0) {
    actions.push({
      id: `connect-${Date.now()}`,
      title: `Connecter ${disconnectedPlatforms.length} plateforme(s)`,
      description: "Automatiser la publication pour gagner du temps",
      priority: "medium" as const,
      effort: "low" as const,
      impact: "medium" as const,
      ice_score: calculateSocialICE("medium", "low"),
      category: "social_integration",
      auto_fixable: false,
      fix_instructions: disconnectedPlatforms.map(p => `Connecter ${p.name} via OAuth`).join(" → "),
    });
  }
  
  // Character limit warnings
  const overLimitPosts = result.allPosts.filter(p => !p.isWithinLimit);
  if (overLimitPosts.length > 0) {
    actions.push({
      id: `fix-limits-${Date.now()}`,
      title: `Corriger ${overLimitPosts.length} posts trop longs`,
      description: "Posts dépassant la limite de caractères de la plateforme",
      priority: "low" as const,
      effort: "low" as const,
      impact: "low" as const,
      ice_score: calculateSocialICE("low", "low"),
      category: "social_fix",
      auto_fixable: false,
      fix_instructions: "Éditer les textes pour respecter les limites → Réduire le nombre de hashtags",
    });
  }
  
  const risks: AgentRisk[] = [];
  if (result.exportOnlyPosts.length === result.allPosts.length) {
    risks.push({
      id: `no-publish-${Date.now()}`,
      description: "Aucune plateforme connectée - publication manuelle requise",
      severity: "medium" as const,
      mitigation: "Connecter au moins une plateforme pour automatiser",
    });
  }
  
  const connectedCount = input.platforms.filter(p => p.connected).length;
  
  return {
    summary: `${result.allPosts.length} posts générés | ${connectedCount}/${input.platforms.length} plateformes | ${result.publishablePosts.length} publiables | ${result.calendar.length} planifiés`,
    actions,
    risks,
    dependencies: input.platforms.map(p => `social:${p.name}`),
    metrics_to_watch: [
      "engagement_rate",
      "click_through_rate",
      "reach",
      "impressions",
      "shares",
    ],
    requires_approval: result.publishablePosts.length > 0,
  };
}
