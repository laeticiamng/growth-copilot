import type { SignalEventType, SignalEvent } from './types';

/**
 * SignalGraph — Unified event taxonomy and attribution model.
 * Normalizes events from multiple sources into a single model.
 */

// ─── Event Taxonomy ─────────────────────────────────────────────────────────

interface EventDefinition {
  type: SignalEventType;
  category: 'awareness' | 'engagement' | 'music' | 'platform' | 'email' | 'attribution';
  label: string;
  description: string;
  ga4EventName: string;       // GA4-compatible event name
  metaEventName: string;      // Meta CAPI-compatible event name
  valueType: 'count' | 'boolean' | 'currency';
}

export const EVENT_TAXONOMY: Record<SignalEventType, EventDefinition> = {
  // Awareness
  view: { type: 'view', category: 'awareness', label: 'View', description: 'Content viewed', ga4EventName: 'page_view', metaEventName: 'ViewContent', valueType: 'count' },
  impression: { type: 'impression', category: 'awareness', label: 'Impression', description: 'Content shown', ga4EventName: 'ad_impression', metaEventName: 'ViewContent', valueType: 'count' },
  watch_3s: { type: 'watch_3s', category: 'awareness', label: 'Watch 3s', description: 'Watched at least 3 seconds', ga4EventName: 'video_progress', metaEventName: 'ViewContent', valueType: 'count' },
  watch_25pct: { type: 'watch_25pct', category: 'awareness', label: 'Watch 25%', description: 'Watched 25% of content', ga4EventName: 'video_progress', metaEventName: 'ViewContent', valueType: 'count' },
  watch_50pct: { type: 'watch_50pct', category: 'awareness', label: 'Watch 50%', description: 'Watched 50% of content', ga4EventName: 'video_progress', metaEventName: 'ViewContent', valueType: 'count' },
  watch_75pct: { type: 'watch_75pct', category: 'awareness', label: 'Watch 75%', description: 'Watched 75% of content', ga4EventName: 'video_progress', metaEventName: 'ViewContent', valueType: 'count' },
  watch_100pct: { type: 'watch_100pct', category: 'awareness', label: 'Watch 100%', description: 'Watched complete content', ga4EventName: 'video_complete', metaEventName: 'ViewContent', valueType: 'count' },

  // Engagement
  click: { type: 'click', category: 'engagement', label: 'Click', description: 'Clicked on content', ga4EventName: 'click', metaEventName: 'Lead', valueType: 'count' },
  outbound_click: { type: 'outbound_click', category: 'engagement', label: 'Outbound Click', description: 'Clicked external link', ga4EventName: 'click', metaEventName: 'Lead', valueType: 'count' },
  like: { type: 'like', category: 'engagement', label: 'Like', description: 'Content liked', ga4EventName: 'select_content', metaEventName: 'Lead', valueType: 'count' },
  comment: { type: 'comment', category: 'engagement', label: 'Comment', description: 'Comment posted', ga4EventName: 'select_content', metaEventName: 'Lead', valueType: 'count' },
  share: { type: 'share', category: 'engagement', label: 'Share', description: 'Content shared', ga4EventName: 'share', metaEventName: 'Lead', valueType: 'count' },
  save: { type: 'save', category: 'engagement', label: 'Save', description: 'Content saved/bookmarked', ga4EventName: 'add_to_wishlist', metaEventName: 'AddToWishlist', valueType: 'count' },

  // Music-specific
  pre_save: { type: 'pre_save', category: 'music', label: 'Pre-Save', description: 'Pre-saved upcoming release', ga4EventName: 'add_to_wishlist', metaEventName: 'AddToWishlist', valueType: 'count' },
  smart_link_click: { type: 'smart_link_click', category: 'music', label: 'Smart Link Click', description: 'Clicked smart link', ga4EventName: 'click', metaEventName: 'Lead', valueType: 'count' },
  stream_start: { type: 'stream_start', category: 'music', label: 'Stream Start', description: 'Started streaming', ga4EventName: 'select_content', metaEventName: 'ViewContent', valueType: 'count' },
  playlist_add: { type: 'playlist_add', category: 'music', label: 'Playlist Add', description: 'Added to playlist', ga4EventName: 'add_to_cart', metaEventName: 'AddToCart', valueType: 'count' },
  follow: { type: 'follow', category: 'music', label: 'Follow', description: 'Followed artist/page', ga4EventName: 'sign_up', metaEventName: 'CompleteRegistration', valueType: 'count' },

  // Platform-specific
  signup: { type: 'signup', category: 'platform', label: 'Sign Up', description: 'User signed up', ga4EventName: 'sign_up', metaEventName: 'CompleteRegistration', valueType: 'count' },
  waitlist_join: { type: 'waitlist_join', category: 'platform', label: 'Waitlist Join', description: 'Joined waitlist', ga4EventName: 'generate_lead', metaEventName: 'Lead', valueType: 'count' },
  trial_start: { type: 'trial_start', category: 'platform', label: 'Trial Start', description: 'Started free trial', ga4EventName: 'begin_checkout', metaEventName: 'InitiateCheckout', valueType: 'count' },
  activation: { type: 'activation', category: 'platform', label: 'Activation', description: 'Completed key action', ga4EventName: 'tutorial_complete', metaEventName: 'CompleteRegistration', valueType: 'count' },
  purchase: { type: 'purchase', category: 'platform', label: 'Purchase', description: 'Completed purchase', ga4EventName: 'purchase', metaEventName: 'Purchase', valueType: 'currency' },
  repeat_purchase: { type: 'repeat_purchase', category: 'platform', label: 'Repeat Purchase', description: 'Repeat purchase', ga4EventName: 'purchase', metaEventName: 'Purchase', valueType: 'currency' },

  // Email
  email_open: { type: 'email_open', category: 'email', label: 'Email Open', description: 'Email opened', ga4EventName: 'select_content', metaEventName: 'ViewContent', valueType: 'count' },
  email_click: { type: 'email_click', category: 'email', label: 'Email Click', description: 'Clicked link in email', ga4EventName: 'click', metaEventName: 'Lead', valueType: 'count' },

  // Attribution
  conversion_post_retargeting: { type: 'conversion_post_retargeting', category: 'attribution', label: 'Post-Retargeting Conversion', description: 'Converted after retargeting', ga4EventName: 'purchase', metaEventName: 'Purchase', valueType: 'count' },
};

// ─── UTM Builder ────────────────────────────────────────────────────────────

export interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

export function buildUTMUrl(baseUrl: string, params: UTMParams): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium);
  url.searchParams.set('utm_campaign', params.campaign);
  if (params.content) url.searchParams.set('utm_content', params.content);
  if (params.term) url.searchParams.set('utm_term', params.term);
  return url.toString();
}

// ─── Attribution ────────────────────────────────────────────────────────────

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'assisted';

export interface AttributionResult {
  channel: string;
  model: AttributionModel;
  credit: number;  // 0-1
  conversions: number;
  assistedConversions: number;
}

/**
 * Simple attribution calculator.
 * Groups events by session/user and attributes conversions to touchpoints.
 */
export function computeAttribution(
  events: SignalEvent[],
  conversionTypes: SignalEventType[],
  model: AttributionModel = 'last_touch'
): AttributionResult[] {
  // Group events by user
  const userEvents = new Map<string, SignalEvent[]>();
  for (const event of events) {
    const key = event.user_id_hash || event.session_id || 'anonymous';
    const existing = userEvents.get(key) || [];
    existing.push(event);
    userEvents.set(key, existing);
  }

  const channelCredits = new Map<string, { directConversions: number; assistedConversions: number; totalCredit: number }>();

  for (const [, userEventList] of userEvents) {
    const sorted = [...userEventList].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const conversions = sorted.filter(e => conversionTypes.includes(e.event_type));
    if (conversions.length === 0) continue;

    const touchpoints = sorted.filter(e => !conversionTypes.includes(e.event_type) && e.channel);
    if (touchpoints.length === 0) continue;

    const channels = [...new Set(touchpoints.map(t => t.channel!))];

    for (const channel of channels) {
      if (!channelCredits.has(channel)) {
        channelCredits.set(channel, { directConversions: 0, assistedConversions: 0, totalCredit: 0 });
      }
    }

    const conversionCount = conversions.length;

    switch (model) {
      case 'first_touch': {
        const firstChannel = touchpoints[0].channel!;
        const entry = channelCredits.get(firstChannel)!;
        entry.directConversions += conversionCount;
        entry.totalCredit += conversionCount;
        // Mark others as assisted
        for (const ch of channels.filter(c => c !== firstChannel)) {
          channelCredits.get(ch)!.assistedConversions += conversionCount;
        }
        break;
      }
      case 'last_touch': {
        const lastChannel = touchpoints[touchpoints.length - 1].channel!;
        const entry = channelCredits.get(lastChannel)!;
        entry.directConversions += conversionCount;
        entry.totalCredit += conversionCount;
        for (const ch of channels.filter(c => c !== lastChannel)) {
          channelCredits.get(ch)!.assistedConversions += conversionCount;
        }
        break;
      }
      case 'linear': {
        const creditPerChannel = conversionCount / channels.length;
        for (const ch of channels) {
          channelCredits.get(ch)!.totalCredit += creditPerChannel;
          channelCredits.get(ch)!.assistedConversions += conversionCount;
        }
        break;
      }
      case 'assisted': {
        // All touchpoints get assisted credit
        for (const ch of channels) {
          channelCredits.get(ch)!.assistedConversions += conversionCount;
          channelCredits.get(ch)!.totalCredit += conversionCount / channels.length;
        }
        break;
      }
    }
  }

  const totalCredit = Array.from(channelCredits.values()).reduce((acc, v) => acc + v.totalCredit, 0);

  return Array.from(channelCredits.entries()).map(([channel, data]) => ({
    channel,
    model,
    credit: totalCredit > 0 ? data.totalCredit / totalCredit : 0,
    conversions: data.directConversions,
    assistedConversions: data.assistedConversions,
  })).sort((a, b) => b.credit - a.credit);
}

// ─── Funnel Analysis ────────────────────────────────────────────────────────

export interface FunnelStep {
  event_type: SignalEventType;
  label: string;
  count: number;
  dropoff_pct: number;
}

export function computeFunnel(events: SignalEvent[], steps: SignalEventType[]): FunnelStep[] {
  const counts = new Map<SignalEventType, number>();
  for (const event of events) {
    counts.set(event.event_type, (counts.get(event.event_type) || 0) + 1);
  }

  return steps.map((step, index) => {
    const count = counts.get(step) || 0;
    const prevCount = index > 0 ? (counts.get(steps[index - 1]) || 0) : count;
    return {
      event_type: step,
      label: EVENT_TAXONOMY[step]?.label || step,
      count,
      dropoff_pct: prevCount > 0 ? Math.round((1 - count / prevCount) * 100) : 0,
    };
  });
}
