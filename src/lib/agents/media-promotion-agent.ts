/**
 * Media Promotion Agent (Client-side)
 * 
 * Mission: Orchestrate media launch campaigns for YouTube and Spotify/Streaming content.
 * 
 * Triggers:
 * - New media asset created
 * - User requests "Generate launch plan"
 * - Scheduled pre-launch reminder
 * 
 * Inputs:
 * - media_assets (URL, platform, metadata)
 * - brand_kit (if linked to a site)
 * - media_campaigns (existing campaigns)
 * - media_creatives (existing creatives)
 * 
 * Outputs:
 * - JSON artifact (strict schema)
 * - Creates: media_creatives, media_campaigns, action_log entries
 */

import type { AgentArtifact, AgentAction, AgentRisk } from './types';

// Platform types
export type MediaPlatform = 
  | 'youtube_video' 
  | 'youtube_channel' 
  | 'spotify_track' 
  | 'spotify_album' 
  | 'spotify_artist' 
  | 'apple_music' 
  | 'soundcloud' 
  | 'tiktok' 
  | 'other';

// Launch phase
export interface LaunchPhase {
  name: 'pre_launch' | 'launch_day' | 'post_launch';
  label: string;
  days_relative: string; // e.g., "-14 to -7", "0", "+1 to +30"
  actions: LaunchAction[];
  kpis: string[];
}

// Launch action
export interface LaunchAction {
  id: string;
  title: string;
  description: string;
  platform: string;
  day_relative: number; // days from launch (negative = before)
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'scheduled' | 'completed' | 'skipped';
  content_type?: string;
  estimated_time_minutes?: number;
}

// Creative variation
export interface CreativeVariation {
  id: string;
  format: 'title' | 'description' | 'caption' | 'hook' | 'cta' | 'hashtags';
  platform: string;
  content: string;
  variant_label: string; // A, B, C, etc.
  character_count: number;
}

// Smart link configuration
export interface SmartLinkConfig {
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail_url?: string;
  platforms: {
    platform: string;
    url: string;
    label: string;
    icon?: string;
  }[];
  tracking: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
  };
  pixels?: string[];
}

// Thumbnail concept
export interface ThumbnailConcept {
  id: string;
  hook_text: string;
  style: string;
  color_scheme: string;
  expression_emotion?: string;
  background_suggestion: string;
}

// Short-form content idea
export interface ShortFormIdea {
  id: string;
  platform: 'tiktok' | 'instagram_reels' | 'youtube_shorts';
  hook_script: string;
  main_content_outline: string;
  caption: string;
  hashtags: string[];
  audio_style_suggestion: string;
  best_posting_time?: string;
  duration_seconds: number;
}

// Media Promotion Output
export interface MediaPromotionOutput extends AgentArtifact {
  asset_summary: {
    platform: MediaPlatform;
    title: string | null;
    artist: string | null;
    thumbnail_url: string | null;
  };
  launch_plan: {
    launch_date: string | null;
    phases: LaunchPhase[];
    total_actions: number;
    estimated_total_hours: number;
  };
  creatives: {
    titles: CreativeVariation[];
    descriptions: CreativeVariation[];
    social_captions: CreativeVariation[];
    hooks: CreativeVariation[];
    hashtag_sets: CreativeVariation[];
  };
  thumbnails: ThumbnailConcept[];
  short_form_ideas: ShortFormIdea[];
  smart_link: SmartLinkConfig | null;
  platform_specific: {
    youtube?: {
      tags: string[];
      chapters: { time: string; title: string }[];
      end_screen_cta: string;
      shorts_clips: { start: string; end: string; hook: string }[];
    };
    spotify?: {
      playlist_pitch: string;
      one_liner: string;
      bio_short: string;
      bio_medium: string;
      press_release_intro: string;
    };
  };
}

// Configuration
export interface MediaPromotionConfig {
  workspaceId: string;
  assetId: string;
  platform: MediaPlatform;
  title: string | null;
  artistName: string | null;
  thumbnailUrl: string | null;
  launchDate?: string;
  targetMarkets?: string[];
  genre?: string;
  brandKit?: {
    tone_of_voice?: string;
    target_audience?: string;
    values?: string[];
  };
}

/**
 * Generates creative variations for different formats
 */
export function generateCreativeVariations(
  title: string,
  artist: string,
  platform: MediaPlatform,
  genre?: string
): MediaPromotionOutput['creatives'] {
  const isMusic = platform.startsWith('spotify_') || platform === 'apple_music' || platform === 'soundcloud';
  const isVideo = platform.startsWith('youtube_');
  
  // Title variations
  const titles: CreativeVariation[] = [
    {
      id: 'title-a',
      format: 'title',
      platform: platform,
      content: `${title}${artist ? ` - ${artist}` : ''}`,
      variant_label: 'A (Standard)',
      character_count: `${title}${artist ? ` - ${artist}` : ''}`.length,
    },
    {
      id: 'title-b',
      format: 'title',
      platform: platform,
      content: `🔥 ${title}${artist ? ` | ${artist}` : ''} [Official]`,
      variant_label: 'B (Emoji Hook)',
      character_count: `🔥 ${title}${artist ? ` | ${artist}` : ''} [Official]`.length,
    },
    {
      id: 'title-c',
      format: 'title',
      platform: platform,
      content: `${title}${genre ? ` (${genre})` : ''}${artist ? ` - ${artist}` : ''}`,
      variant_label: 'C (Genre Tag)',
      character_count: `${title}${genre ? ` (${genre})` : ''}${artist ? ` - ${artist}` : ''}`.length,
    },
  ];
  
  // Description templates
  const descriptions: CreativeVariation[] = [];
  if (isVideo) {
    descriptions.push(
      {
        id: 'desc-a',
        format: 'description',
        platform: 'youtube',
        content: `🎬 ${title}\n\n${artist ? `Par ${artist}\n\n` : ''}📌 TIMESTAMPS\n00:00 - Intro\n[Ajouter vos chapitres]\n\n🔔 Abonnez-vous pour plus de contenu !\n\n#${title.replace(/\s+/g, '')} #${artist?.replace(/\s+/g, '') || 'video'}`,
        variant_label: 'A (YouTube Standard)',
        character_count: 200,
      },
      {
        id: 'desc-b',
        format: 'description',
        platform: 'youtube',
        content: `Dans cette vidéo, découvrez ${title}.\n\n👉 Liens importants:\n• Site web: [URL]\n• Instagram: [URL]\n• Twitter: [URL]\n\n⏰ Nouveaux contenus chaque semaine !`,
        variant_label: 'B (CTA Focus)',
        character_count: 180,
      }
    );
  } else if (isMusic) {
    descriptions.push(
      {
        id: 'desc-a',
        format: 'description',
        platform: 'spotify',
        content: `"${title}" - Le nouveau single de ${artist || 'l\'artiste'}.\n\nÉcoutez maintenant sur toutes les plateformes.\n\n🎧 Spotify | Apple Music | Deezer | YouTube Music`,
        variant_label: 'A (Release Standard)',
        character_count: 160,
      }
    );
  }
  
  // Social captions
  const socialCaptions: CreativeVariation[] = [
    {
      id: 'caption-ig',
      format: 'caption',
      platform: 'instagram',
      content: `🎵 "${title}" est enfin disponible ! 🔥\n\nLien en bio pour écouter 👆\n\n${genre ? `#${genre.replace(/\s+/g, '')} ` : ''}#newmusic #release #${artist?.replace(/\s+/g, '').toLowerCase() || 'music'}`,
      variant_label: 'Instagram',
      character_count: 150,
    },
    {
      id: 'caption-twitter',
      format: 'caption',
      platform: 'twitter',
      content: `🚀 "${title}" out now!\n\n${isMusic ? '🎧 ' : '🎬 '}Link in bio\n\n#NewRelease ${genre ? `#${genre}` : ''}`,
      variant_label: 'Twitter/X',
      character_count: 80,
    },
    {
      id: 'caption-tiktok',
      format: 'caption',
      platform: 'tiktok',
      content: `POV: tu découvres "${title}" pour la première fois 🎧✨ #${genre?.replace(/\s+/g, '') || 'music'} #fyp #newmusic`,
      variant_label: 'TikTok',
      character_count: 90,
    },
  ];
  
  // Hooks
  const hooks: CreativeVariation[] = [
    {
      id: 'hook-1',
      format: 'hook',
      platform: 'universal',
      content: `Attendez la drop à 0:45... 🔥`,
      variant_label: 'Anticipation',
      character_count: 30,
    },
    {
      id: 'hook-2',
      format: 'hook',
      platform: 'universal',
      content: `J'ai mis 6 mois à créer ça...`,
      variant_label: 'Behind the scenes',
      character_count: 28,
    },
    {
      id: 'hook-3',
      format: 'hook',
      platform: 'universal',
      content: `${title} en 15 secondes 👇`,
      variant_label: 'Quick preview',
      character_count: 25,
    },
  ];
  
  // Hashtag sets
  const hashtagSets: CreativeVariation[] = [
    {
      id: 'hashtags-broad',
      format: 'hashtags',
      platform: 'universal',
      content: `#music #newmusic #release #artist #${genre?.replace(/\s+/g, '').toLowerCase() || 'song'} #fyp #viral`,
      variant_label: 'Broad Reach',
      character_count: 60,
    },
    {
      id: 'hashtags-niche',
      format: 'hashtags',
      platform: 'universal',
      content: `#${genre?.replace(/\s+/g, '').toLowerCase() || 'indie'} #undergroundmusic #newartist #${artist?.replace(/\s+/g, '').toLowerCase() || 'music'}`,
      variant_label: 'Niche Focus',
      character_count: 50,
    },
  ];
  
  return {
    titles,
    descriptions,
    social_captions: socialCaptions,
    hooks,
    hashtag_sets: hashtagSets,
  };
}

/**
 * Generates thumbnail concepts
 */
export function generateThumbnailConcepts(
  title: string,
  platform: MediaPlatform
): ThumbnailConcept[] {
  const isMusic = platform.startsWith('spotify_') || platform === 'apple_music';
  
  return [
    {
      id: 'thumb-1',
      hook_text: title.toUpperCase().slice(0, 20),
      style: 'Bold typography, high contrast',
      color_scheme: 'Dark background with neon accents',
      expression_emotion: isMusic ? undefined : 'Surprised/Excited',
      background_suggestion: isMusic ? 'Abstract audio waveform' : 'Blurred action shot',
    },
    {
      id: 'thumb-2',
      hook_text: '🔥 OUT NOW',
      style: 'Clean, minimal, professional',
      color_scheme: 'Monochrome with single accent color',
      expression_emotion: isMusic ? undefined : 'Confident',
      background_suggestion: isMusic ? 'Artist photo with gradient overlay' : 'Solid color backdrop',
    },
    {
      id: 'thumb-3',
      hook_text: `NEW: ${title.slice(0, 15)}...`,
      style: 'Editorial, magazine-like',
      color_scheme: 'Warm tones (orange, red)',
      expression_emotion: isMusic ? undefined : 'Mysterious',
      background_suggestion: 'Textured/Grainy aesthetic',
    },
  ];
}

/**
 * Generates short-form content ideas
 */
export function generateShortFormIdeas(
  title: string,
  artist: string | null,
  platform: MediaPlatform,
  genre?: string
): ShortFormIdea[] {
  const ideas: ShortFormIdea[] = [
    {
      id: 'short-1',
      platform: 'tiktok',
      hook_script: `POV: Tu découvres "${title}" pour la première fois`,
      main_content_outline: 'Reaction-style video with the best 15 seconds of the track',
      caption: `"${title}" c'est mon nouveau son préféré 🔥`,
      hashtags: ['fyp', 'newmusic', genre?.toLowerCase() || 'music', 'pourtoi'],
      audio_style_suggestion: 'Utiliser un extrait du morceau comme audio original',
      best_posting_time: '18h-21h',
      duration_seconds: 15,
    },
    {
      id: 'short-2',
      platform: 'instagram_reels',
      hook_script: `Le making-of de "${title}" en 30 secondes`,
      main_content_outline: 'Behind the scenes clips, studio moments, quick cuts',
      caption: `6 mois de travail résumés en 30 secondes 🎬 "${title}" disponible maintenant 🎧`,
      hashtags: ['behindthescenes', 'makingof', 'studiolife', 'newrelease'],
      audio_style_suggestion: 'Instrumental version ou snippet du track',
      best_posting_time: '12h-14h',
      duration_seconds: 30,
    },
    {
      id: 'short-3',
      platform: 'youtube_shorts',
      hook_script: `La partie que tout le monde attend... 👀`,
      main_content_outline: 'Build-up to the drop/chorus with visual effects',
      caption: `"${title}" - Le drop qui tue 🔥 Full version en description !`,
      hashtags: ['shorts', 'music', 'drop', 'viral'],
      audio_style_suggestion: 'Extrait du refrain ou drop',
      best_posting_time: '16h-18h',
      duration_seconds: 20,
    },
    {
      id: 'short-4',
      platform: 'tiktok',
      hook_script: `Reply à @fan: voici comment j'ai fait ce son`,
      main_content_outline: 'Tutorial-style breakdown of one element',
      caption: `Comment j'ai produit "${title}" 🎹 #tutorial`,
      hashtags: ['musicproduction', 'tutorial', 'howto', 'producer'],
      audio_style_suggestion: 'Voix off + instrumental',
      duration_seconds: 45,
    },
    {
      id: 'short-5',
      platform: 'instagram_reels',
      hook_script: `"${title}" mais c'est en acoustique 🎸`,
      main_content_outline: 'Acoustic/stripped version performance',
      caption: `Version acoustique de "${title}" 🎸 Quel format vous préférez ?`,
      hashtags: ['acoustic', 'livemusic', 'unplugged', 'singer'],
      audio_style_suggestion: 'Live acoustic recording',
      best_posting_time: '20h-22h',
      duration_seconds: 30,
    },
  ];
  
  return ideas;
}

/**
 * Generates launch plan phases
 */
export function generateLaunchPlan(
  platform: MediaPlatform,
  launchDate: string | null
): LaunchPhase[] {
  const isMusic = platform.startsWith('spotify_') || platform === 'apple_music';
  
  return [
    {
      name: 'pre_launch',
      label: 'Pré-lancement',
      days_relative: '-14 à -1',
      actions: [
        {
          id: 'pre-1',
          title: 'Teaser #1 - Annonce',
          description: 'Post mystère sur les réseaux pour annoncer la date',
          platform: 'instagram',
          day_relative: -14,
          priority: 'high',
          status: 'pending',
          content_type: 'image',
          estimated_time_minutes: 30,
        },
        {
          id: 'pre-2',
          title: 'Teaser #2 - Snippet audio',
          description: 'Story avec 10 secondes du son',
          platform: 'instagram',
          day_relative: -10,
          priority: 'high',
          status: 'pending',
          content_type: 'story',
          estimated_time_minutes: 15,
        },
        {
          id: 'pre-3',
          title: isMusic ? 'Pré-save campaign' : 'Notification YouTube',
          description: isMusic 
            ? 'Lancer le lien de pré-save sur toutes les plateformes'
            : 'Programmer la Première YouTube et activer les notifications',
          platform: isMusic ? 'spotify' : 'youtube',
          day_relative: -7,
          priority: 'critical',
          status: 'pending',
          content_type: 'link',
          estimated_time_minutes: 45,
        },
        {
          id: 'pre-4',
          title: 'Behind the scenes',
          description: 'TikTok/Reel du making-of',
          platform: 'tiktok',
          day_relative: -5,
          priority: 'medium',
          status: 'pending',
          content_type: 'video',
          estimated_time_minutes: 60,
        },
        {
          id: 'pre-5',
          title: 'Countdown final',
          description: 'Story compte à rebours J-1',
          platform: 'instagram',
          day_relative: -1,
          priority: 'high',
          status: 'pending',
          content_type: 'story',
          estimated_time_minutes: 15,
        },
      ],
      kpis: ['Pré-saves', 'Story views', 'Link clicks', 'Email signups'],
    },
    {
      name: 'launch_day',
      label: 'Jour J',
      days_relative: '0',
      actions: [
        {
          id: 'launch-1',
          title: 'Post principal',
          description: 'Annonce officielle avec cover/thumbnail et lien',
          platform: 'instagram',
          day_relative: 0,
          priority: 'critical',
          status: 'pending',
          content_type: 'carousel',
          estimated_time_minutes: 30,
        },
        {
          id: 'launch-2',
          title: 'Stories série (5+)',
          description: 'Stories avec swipe-up, réactions, remerciements',
          platform: 'instagram',
          day_relative: 0,
          priority: 'high',
          status: 'pending',
          content_type: 'story',
          estimated_time_minutes: 45,
        },
        {
          id: 'launch-3',
          title: 'Short-form viral',
          description: 'TikTok/Reel avec hook percutant',
          platform: 'tiktok',
          day_relative: 0,
          priority: 'critical',
          status: 'pending',
          content_type: 'video',
          estimated_time_minutes: 60,
        },
        {
          id: 'launch-4',
          title: 'Engagement actif',
          description: 'Répondre aux commentaires pendant 2h',
          platform: 'all',
          day_relative: 0,
          priority: 'high',
          status: 'pending',
          content_type: 'engagement',
          estimated_time_minutes: 120,
        },
        {
          id: 'launch-5',
          title: 'Email blast',
          description: 'Newsletter à la liste avec lien exclusif',
          platform: 'email',
          day_relative: 0,
          priority: 'medium',
          status: 'pending',
          content_type: 'email',
          estimated_time_minutes: 30,
        },
      ],
      kpis: ['Streams/Views day 1', 'Engagement rate', 'Save rate', 'Share count'],
    },
    {
      name: 'post_launch',
      label: 'Post-lancement',
      days_relative: '+1 à +30',
      actions: [
        {
          id: 'post-1',
          title: 'User content repost',
          description: 'Reposter les réactions des fans',
          platform: 'instagram',
          day_relative: 2,
          priority: 'medium',
          status: 'pending',
          content_type: 'story',
          estimated_time_minutes: 20,
        },
        {
          id: 'post-2',
          title: 'Milestone celebration',
          description: 'Post pour célébrer les 1K/10K/100K',
          platform: 'instagram',
          day_relative: 7,
          priority: 'medium',
          status: 'pending',
          content_type: 'image',
          estimated_time_minutes: 30,
        },
        {
          id: 'post-3',
          title: 'Contenu dérivé #1',
          description: 'Version acoustique ou remix teaser',
          platform: 'tiktok',
          day_relative: 14,
          priority: 'medium',
          status: 'pending',
          content_type: 'video',
          estimated_time_minutes: 90,
        },
        {
          id: 'post-4',
          title: 'Analyse performance',
          description: 'Review des KPIs et ajustement stratégie',
          platform: 'analytics',
          day_relative: 7,
          priority: 'high',
          status: 'pending',
          content_type: 'analysis',
          estimated_time_minutes: 60,
        },
        {
          id: 'post-5',
          title: 'Push playlist curators',
          description: isMusic 
            ? 'Relance des playlists avec metrics J+7'
            : 'Outreach pour collaborations/features',
          platform: isMusic ? 'email' : 'youtube',
          day_relative: 10,
          priority: 'medium',
          status: 'pending',
          content_type: 'outreach',
          estimated_time_minutes: 45,
        },
      ],
      kpis: ['7-day retention', 'Playlist adds', 'Follower growth', 'Engagement trend'],
    },
  ];
}

/**
 * Generates smart link configuration
 */
export function generateSmartLinkConfig(
  config: MediaPromotionConfig
): SmartLinkConfig {
  const slug = `${config.title?.toLowerCase().replace(/\s+/g, '-').slice(0, 30) || 'release'}-${Date.now().toString(36)}`;
  
  const platforms = [];
  
  // Add platform links based on asset type
  if (config.platform.startsWith('spotify_')) {
    platforms.push(
      { platform: 'spotify', url: '', label: 'Écouter sur Spotify', icon: 'spotify' },
      { platform: 'apple_music', url: '', label: 'Apple Music', icon: 'apple' },
      { platform: 'deezer', url: '', label: 'Deezer', icon: 'deezer' },
      { platform: 'youtube_music', url: '', label: 'YouTube Music', icon: 'youtube' },
      { platform: 'amazon_music', url: '', label: 'Amazon Music', icon: 'amazon' },
    );
  } else if (config.platform.startsWith('youtube_')) {
    platforms.push(
      { platform: 'youtube', url: '', label: 'Regarder sur YouTube', icon: 'youtube' },
      { platform: 'spotify', url: '', label: 'Écouter sur Spotify', icon: 'spotify' },
      { platform: 'apple_music', url: '', label: 'Apple Music', icon: 'apple' },
    );
  }
  
  return {
    slug,
    title: config.title || 'New Release',
    subtitle: config.artistName || undefined,
    thumbnail_url: config.thumbnailUrl || undefined,
    platforms,
    tracking: {
      utm_source: 'smartlink',
      utm_medium: 'social',
      utm_campaign: slug,
    },
    pixels: [],
  };
}

/**
 * Main Media Promotion Agent class
 */
export class MediaPromotionAgent {
  private config: MediaPromotionConfig;

  constructor(config: MediaPromotionConfig) {
    this.config = config;
  }

  /**
   * Run the media promotion analysis
   */
  run(): MediaPromotionOutput {
    const { platform, title, artistName, thumbnailUrl, launchDate, genre } = this.config;
    
    // Generate all components
    const creatives = generateCreativeVariations(
      title || 'Untitled',
      artistName || '',
      platform,
      genre
    );
    
    const thumbnails = generateThumbnailConcepts(title || 'Untitled', platform);
    const shortFormIdeas = generateShortFormIdeas(title || 'Untitled', artistName, platform, genre);
    const phases = generateLaunchPlan(platform, launchDate || null);
    const smartLink = generateSmartLinkConfig(this.config);
    
    // Calculate totals
    const allActions = phases.flatMap(p => p.actions);
    const totalActions = allActions.length;
    const estimatedMinutes = allActions.reduce((sum, a) => sum + (a.estimated_time_minutes || 30), 0);
    const estimatedHours = Math.ceil(estimatedMinutes / 60);
    
    // Build agent actions from launch plan
    const actions: AgentAction[] = allActions
      .filter(a => a.priority === 'critical' || a.priority === 'high')
      .slice(0, 10)
      .map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        priority: a.priority,
        effort: a.estimated_time_minutes && a.estimated_time_minutes > 45 ? 'high' as const : 
                a.estimated_time_minutes && a.estimated_time_minutes > 20 ? 'medium' as const : 'low' as const,
        impact: a.priority === 'critical' ? 'high' as const : 'medium' as const,
        ice_score: a.priority === 'critical' ? 90 : a.priority === 'high' ? 70 : 50,
        category: 'media',
        auto_fixable: false,
        fix_instructions: `Jour ${a.day_relative >= 0 ? '+' : ''}${a.day_relative}: ${a.description}`,
      }));
    
    // Build risks
    const risks: AgentRisk[] = [];
    
    if (!launchDate) {
      risks.push({
        id: 'no_launch_date',
        description: 'Aucune date de lancement définie. Le calendrier est indicatif.',
        severity: 'medium',
        mitigation: 'Définir une date de sortie pour activer les rappels automatiques.',
      });
    }
    
    if (!title) {
      risks.push({
        id: 'no_title',
        description: 'Le titre n\'est pas défini. Les créatifs générés utilisent des placeholders.',
        severity: 'high',
        mitigation: 'Ajouter le titre du contenu pour des créatifs personnalisés.',
      });
    }
    
    // Platform-specific data
    const platformSpecific: MediaPromotionOutput['platform_specific'] = {};
    
    if (platform.startsWith('youtube_')) {
      platformSpecific.youtube = {
        tags: [
          title?.toLowerCase() || '',
          artistName?.toLowerCase() || '',
          genre?.toLowerCase() || '',
          'official',
          'music',
          'new release',
          '2026',
        ].filter(Boolean),
        chapters: [
          { time: '00:00', title: 'Intro' },
          { time: '00:30', title: 'Verse 1' },
          { time: '01:00', title: 'Chorus' },
          { time: '01:45', title: 'Verse 2' },
          { time: '02:30', title: 'Bridge' },
          { time: '03:00', title: 'Outro' },
        ],
        end_screen_cta: 'Abonnez-vous et activez la cloche 🔔',
        shorts_clips: [
          { start: '00:45', end: '01:00', hook: 'Le refrain qui reste en tête' },
          { start: '02:30', end: '02:45', hook: 'Le bridge émotionnel' },
          { start: '00:00', end: '00:15', hook: 'L\'intro qui accroche' },
        ],
      };
    } else if (platform.startsWith('spotify_')) {
      platformSpecific.spotify = {
        playlist_pitch: `"${title}" de ${artistName || 'l\'artiste'} est un titre ${genre || 'moderne'} qui capture l'essence de [thème]. Parfait pour vos playlists [mood/activité].`,
        one_liner: `${title} - Le nouveau hit de ${artistName || 'l\'artiste'}`,
        bio_short: `${artistName || 'Artiste'} revient avec "${title}", un titre ${genre || 'captivant'} à découvrir maintenant.`,
        bio_medium: `Après [contexte], ${artistName || 'l\'artiste'} dévoile "${title}", son nouveau single ${genre || ''}. Ce titre explore [thème] avec une production soignée et des paroles sincères. Disponible sur toutes les plateformes.`,
        press_release_intro: `${artistName || 'L\'artiste'} annonce la sortie de "${title}", un nouveau single qui marque une nouvelle étape dans sa carrière artistique.`,
      };
    }
    
    // Build summary
    const summary = `Plan de lancement pour "${title || 'Untitled'}" sur ${platform}: ${totalActions} actions sur 3 phases, ~${estimatedHours}h de travail estimé.`;
    
    return {
      summary,
      actions,
      risks,
      dependencies: [],
      metrics_to_watch: platform.startsWith('youtube_') 
        ? ['Views', 'Watch time', 'CTR', 'Subscribers gained', 'Engagement rate']
        : ['Streams', 'Saves', 'Playlist adds', 'Monthly listeners', 'Follower growth'],
      requires_approval: false,
      asset_summary: {
        platform,
        title,
        artist: artistName,
        thumbnail_url: thumbnailUrl,
      },
      launch_plan: {
        launch_date: launchDate || null,
        phases,
        total_actions: totalActions,
        estimated_total_hours: estimatedHours,
      },
      creatives,
      thumbnails,
      short_form_ideas: shortFormIdeas,
      smart_link: smartLink,
      platform_specific: platformSpecific,
    };
  }
}

/**
 * Factory function
 */
export function runMediaPromotionAgent(config: MediaPromotionConfig): MediaPromotionOutput {
  const agent = new MediaPromotionAgent(config);
  return agent.run();
}
