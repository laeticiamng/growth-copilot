import type { LaunchType, LaunchTypeConfig, LaunchCategory } from './types';

/**
 * LaunchTypeEngine — Manages launch type configurations and playbook selection.
 * Each launch type loads a distinct playbook with specific channels, phases, and KPIs.
 */

const LAUNCH_TYPE_CONFIGS: Record<LaunchType, LaunchTypeConfig> = {
  // ─── Music Types ────────────────────────────────────────────────────
  single: {
    type: 'single',
    category: 'music',
    label: 'Single Release',
    description: 'Launch strategy for a single track release',
    icon: 'music',
    defaultChannels: ['tiktok', 'instagram_reels', 'youtube_shorts', 'smart_link', 'email'],
    phases: [
      { name: 'Pre-Release', key: 'pre_launch', daysOffset: -14, durationDays: 14, defaultTasks: ['Create teasers', 'Set up pre-save links', 'Pitch to playlist curators', 'Schedule social teasers', 'Prepare smart link page'] },
      { name: 'Launch Day', key: 'launch_day', daysOffset: 0, durationDays: 1, defaultTasks: ['Publish on all platforms', 'Activate smart links', 'Post coordinated social', 'Send email blast', 'Engage with early listeners'] },
      { name: 'Post-Release', key: 'post_launch', daysOffset: 1, durationDays: 30, defaultTasks: ['Monitor streaming metrics', 'Boost top-performing content', 'Retarget engaged listeners', 'UGC seeding', 'Analyze and iterate'] },
    ],
    kpiKeys: ['hook_retention_rate', 'completion_rate', 'ctr', 'smart_link_ctr', 'pre_save_rate', 'save_rate', 'playlist_add_rate', 'stream_conversion', 'cost_per_engaged_listener'],
  },
  ep: {
    type: 'ep',
    category: 'music',
    label: 'EP Release',
    description: 'Multi-track EP launch with phased release strategy',
    icon: 'disc',
    defaultChannels: ['tiktok', 'instagram_reels', 'youtube_shorts', 'youtube', 'smart_link', 'email'],
    phases: [
      { name: 'Pre-Release', key: 'pre_launch', daysOffset: -21, durationDays: 21, defaultTasks: ['Announce EP', 'Release lead single', 'Create visual content series', 'Set up pre-save for EP', 'Build anticipation with behind-the-scenes'] },
      { name: 'Launch Day', key: 'launch_day', daysOffset: 0, durationDays: 1, defaultTasks: ['Release full EP', 'Listening party event', 'Coordinated social blitz', 'Email full announcement', 'Press outreach'] },
      { name: 'Post-Release', key: 'post_launch', daysOffset: 1, durationDays: 45, defaultTasks: ['Track-by-track content rollout', 'Music video drops', 'Playlist pitching per track', 'Retargeting campaigns', 'Fan engagement activations'] },
    ],
    kpiKeys: ['hook_retention_rate', 'completion_rate', 'ctr', 'smart_link_ctr', 'pre_save_rate', 'save_rate', 'playlist_add_rate', 'follow_rate', 'stream_conversion', 'repeat_listen_proxy', 'cost_per_engaged_listener'],
  },
  album: {
    type: 'album',
    category: 'music',
    label: 'Album Release',
    description: 'Full album launch with extended campaign',
    icon: 'library',
    defaultChannels: ['tiktok', 'instagram_reels', 'youtube_shorts', 'youtube', 'smart_link', 'email', 'meta_ads'],
    phases: [
      { name: 'Pre-Release', key: 'pre_launch', daysOffset: -30, durationDays: 30, defaultTasks: ['Announce album', 'Release 2-3 lead singles', 'Visual identity rollout', 'Pre-save campaign', 'Press kit distribution', 'Content calendar execution'] },
      { name: 'Launch Week', key: 'launch_day', daysOffset: 0, durationDays: 7, defaultTasks: ['Full album release', 'Launch event/live', 'Daily content per track', 'Email series', 'Ad campaigns activation', 'Influencer activations'] },
      { name: 'Post-Release', key: 'post_launch', daysOffset: 7, durationDays: 60, defaultTasks: ['Music videos staggered release', 'Deluxe/remix releases', 'Tour/live announcements', 'Fan-generated content', 'Retargeting deep listeners', 'Monthly performance reviews'] },
    ],
    kpiKeys: ['hook_retention_rate', 'completion_rate', 'ctr', 'smart_link_ctr', 'pre_save_rate', 'save_rate', 'playlist_add_rate', 'follow_rate', 'stream_conversion', 'repeat_listen_proxy', 'cost_per_engaged_listener'],
  },
  clip: {
    type: 'clip',
    category: 'music',
    label: 'Music Video / Clip',
    description: 'Music video or visual clip release',
    icon: 'video',
    defaultChannels: ['youtube', 'tiktok', 'instagram_reels', 'youtube_shorts', 'smart_link'],
    phases: [
      { name: 'Pre-Release', key: 'pre_launch', daysOffset: -7, durationDays: 7, defaultTasks: ['Teasers and trailers', 'Behind-the-scenes content', 'Premiere announcement', 'Social countdown'] },
      { name: 'Premiere', key: 'launch_day', daysOffset: 0, durationDays: 1, defaultTasks: ['YouTube premiere', 'Live viewing party', 'Social media blitz', 'Short-form clips from video'] },
      { name: 'Post-Premiere', key: 'post_launch', daysOffset: 1, durationDays: 14, defaultTasks: ['Short-form repurposing', 'Reaction/commentary content', 'Boost top moments', 'Cross-platform distribution'] },
    ],
    kpiKeys: ['hook_retention_rate', 'completion_rate', 'ctr', 'save_rate', 'follow_rate', 'stream_conversion'],
  },
  music_evergreen: {
    type: 'music_evergreen',
    category: 'music',
    label: 'Evergreen Music Campaign',
    description: 'Ongoing promotion for catalog music',
    icon: 'repeat',
    defaultChannels: ['tiktok', 'instagram_reels', 'youtube_shorts', 'smart_link', 'retargeting'],
    phases: [
      { name: 'Setup', key: 'pre_launch', daysOffset: -3, durationDays: 3, defaultTasks: ['Audit existing content', 'Identify top performers', 'Create content bank', 'Set up tracking'] },
      { name: 'Activation', key: 'launch_day', daysOffset: 0, durationDays: 7, defaultTasks: ['Launch content rotation', 'Test hook variants', 'Activate UGC seeding', 'Start retargeting'] },
      { name: 'Optimization', key: 'post_launch', daysOffset: 7, durationDays: 90, defaultTasks: ['Weekly content refresh', 'Double down on winners', 'Pause underperformers', 'Seasonal angle testing', 'Cross-promote with new releases'] },
    ],
    kpiKeys: ['hook_retention_rate', 'ctr', 'smart_link_ctr', 'stream_conversion', 'cost_per_engaged_listener'],
  },

  // ─── Platform Types ─────────────────────────────────────────────────
  website_launch: {
    type: 'website_launch',
    category: 'platform',
    label: 'Website Launch',
    description: 'Launch a new website or major redesign',
    icon: 'globe',
    defaultChannels: ['meta_ads', 'google_ads', 'email', 'landing_page', 'organic_social'],
    phases: [
      { name: 'Pre-Launch', key: 'pre_launch', daysOffset: -14, durationDays: 14, defaultTasks: ['Landing page live', 'Waitlist campaign', 'SEO foundations', 'Social teasing', 'Email warming'] },
      { name: 'Launch Day', key: 'launch_day', daysOffset: 0, durationDays: 1, defaultTasks: ['Go live', 'Announcement emails', 'Social blitz', 'PR push', 'Ad campaigns live'] },
      { name: 'Post-Launch', key: 'post_launch', daysOffset: 1, durationDays: 30, defaultTasks: ['Monitor analytics', 'CRO iterations', 'Content marketing ramp', 'Retargeting', 'User feedback collection'] },
    ],
    kpiKeys: ['landing_ctr', 'signup_rate', 'activation_rate', 'cac', 'roas'],
  },
  saas_launch: {
    type: 'saas_launch',
    category: 'platform',
    label: 'SaaS Launch',
    description: 'Launch a SaaS product or major feature',
    icon: 'cloud',
    defaultChannels: ['meta_ads', 'google_ads', 'email', 'landing_page', 'organic_social', 'retargeting'],
    phases: [
      { name: 'Pre-Launch', key: 'pre_launch', daysOffset: -21, durationDays: 21, defaultTasks: ['Beta program', 'Waitlist funnel', 'Demo video production', 'Email sequence setup', 'Ad creative production', 'ICP documentation'] },
      { name: 'Launch', key: 'launch_day', daysOffset: 0, durationDays: 7, defaultTasks: ['Product Hunt / launch platform', 'Email launch sequence', 'Ad campaigns activation', 'Social proof collection', 'Onboarding optimization', 'Support scaling'] },
      { name: 'Growth Phase', key: 'post_launch', daysOffset: 7, durationDays: 60, defaultTasks: ['Funnel optimization', 'Activation rate improvement', 'Retargeting campaigns', 'Content marketing', 'Referral program', 'Feature iteration based on feedback'] },
    ],
    kpiKeys: ['landing_ctr', 'signup_rate', 'activation_rate', 'trial_to_paid', 'cac', 'roas', 'retention_proxy'],
  },
  mobile_app_launch: {
    type: 'mobile_app_launch',
    category: 'platform',
    label: 'Mobile App Launch',
    description: 'Launch a mobile application',
    icon: 'smartphone',
    defaultChannels: ['meta_ads', 'google_ads', 'tiktok', 'instagram_reels', 'email', 'landing_page'],
    phases: [
      { name: 'Pre-Launch', key: 'pre_launch', daysOffset: -14, durationDays: 14, defaultTasks: ['App store listing optimization', 'Preview videos', 'Waitlist campaign', 'Influencer seeding', 'Press outreach'] },
      { name: 'Launch', key: 'launch_day', daysOffset: 0, durationDays: 3, defaultTasks: ['App store push', 'Download campaigns', 'Social announcements', 'Email blast', 'PR coverage activation'] },
      { name: 'Growth', key: 'post_launch', daysOffset: 3, durationDays: 30, defaultTasks: ['ASO optimization', 'Install ad optimization', 'Onboarding A/B testing', 'Review management', 'Retargeting lapsed installs'] },
    ],
    kpiKeys: ['landing_ctr', 'signup_rate', 'activation_rate', 'retention_proxy', 'cac', 'roas'],
  },
  landing_page_promo: {
    type: 'landing_page_promo',
    category: 'platform',
    label: 'Landing Page Promo',
    description: 'Promote a specific landing page or offer',
    icon: 'layout',
    defaultChannels: ['meta_ads', 'google_ads', 'email', 'retargeting', 'organic_social'],
    phases: [
      { name: 'Setup', key: 'pre_launch', daysOffset: -7, durationDays: 7, defaultTasks: ['Landing page optimization', 'Ad creative production', 'Audience segmentation', 'Tracking setup', 'Email sequence'] },
      { name: 'Launch', key: 'launch_day', daysOffset: 0, durationDays: 1, defaultTasks: ['Ads live', 'Email send', 'Social push', 'Monitor initial metrics'] },
      { name: 'Optimization', key: 'post_launch', daysOffset: 1, durationDays: 21, defaultTasks: ['A/B test headlines', 'Optimize ad audiences', 'Retargeting layers', 'CRO improvements', 'Budget reallocation'] },
    ],
    kpiKeys: ['landing_ctr', 'signup_rate', 'cac', 'roas'],
  },
  digital_product_launch: {
    type: 'digital_product_launch',
    category: 'platform',
    label: 'Digital Product Launch',
    description: 'Launch a course, ebook, template, or digital product',
    icon: 'package',
    defaultChannels: ['email', 'meta_ads', 'landing_page', 'organic_social', 'retargeting'],
    phases: [
      { name: 'Pre-Launch', key: 'pre_launch', daysOffset: -14, durationDays: 14, defaultTasks: ['Waitlist building', 'Content marketing lead-up', 'Social proof collection', 'Email warming sequence', 'Ad creative production'] },
      { name: 'Launch', key: 'launch_day', daysOffset: 0, durationDays: 5, defaultTasks: ['Cart open email', 'Limited-time offer', 'Ad campaigns live', 'Social proof blitz', 'Live Q&A / demo'] },
      { name: 'Post-Launch', key: 'post_launch', daysOffset: 5, durationDays: 14, defaultTasks: ['Closing sequence', 'Retargeting engaged non-buyers', 'Testimonial collection', 'Evergreen funnel setup', 'Results analysis'] },
    ],
    kpiKeys: ['landing_ctr', 'signup_rate', 'cac', 'roas', 'assisted_conversion_rate'],
  },
  brand_campaign: {
    type: 'brand_campaign',
    category: 'platform',
    label: 'Brand Campaign',
    description: 'Brand awareness or positioning campaign',
    icon: 'award',
    defaultChannels: ['meta_ads', 'google_ads', 'tiktok', 'instagram_reels', 'youtube', 'organic_social'],
    phases: [
      { name: 'Planning', key: 'pre_launch', daysOffset: -14, durationDays: 14, defaultTasks: ['Brand messaging framework', 'Creative production', 'Audience research', 'Channel strategy', 'Measurement plan'] },
      { name: 'Activation', key: 'launch_day', daysOffset: 0, durationDays: 7, defaultTasks: ['Multi-channel launch', 'Influencer activations', 'Content series start', 'PR coverage', 'Event marketing'] },
      { name: 'Sustain', key: 'post_launch', daysOffset: 7, durationDays: 60, defaultTasks: ['Brand lift measurement', 'Content optimization', 'Community building', 'Retargeting for conversion', 'Long-term brand metrics'] },
    ],
    kpiKeys: ['landing_ctr', 'signup_rate', 'cac', 'roas', 'retention_proxy'],
  },
};

export class LaunchTypeEngine {
  /** Get configuration for a specific launch type */
  static getConfig(type: LaunchType): LaunchTypeConfig {
    return LAUNCH_TYPE_CONFIGS[type];
  }

  /** Get all launch types */
  static getAllTypes(): LaunchTypeConfig[] {
    return Object.values(LAUNCH_TYPE_CONFIGS);
  }

  /** Get launch types by category */
  static getTypesByCategory(category: LaunchCategory): LaunchTypeConfig[] {
    return Object.values(LAUNCH_TYPE_CONFIGS).filter(c => c.category === category);
  }

  /** Get default playbook phases for a launch type */
  static getDefaultPhases(type: LaunchType) {
    return LAUNCH_TYPE_CONFIGS[type].phases;
  }

  /** Get default channels for a launch type */
  static getDefaultChannels(type: LaunchType) {
    return LAUNCH_TYPE_CONFIGS[type].defaultChannels;
  }

  /** Get relevant KPI keys for a launch type */
  static getKPIKeys(type: LaunchType) {
    return LAUNCH_TYPE_CONFIGS[type].kpiKeys;
  }
}
