import { describe, it, expect } from 'vitest';
import {
  MediaPromotionAgent,
  generateCreativeVariations,
  generateThumbnailConcepts,
  generateShortFormIdeas,
  generateLaunchPlan,
  generateSmartLinkConfig,
  runMediaPromotionAgent,
  type MediaPromotionConfig,
  type MediaPlatform,
} from '../media-promotion-agent';

describe('MediaPromotionAgent', () => {
  const sampleConfig: MediaPromotionConfig = {
    workspaceId: 'test-workspace',
    assetId: 'test-asset',
    platform: 'spotify_track',
    title: 'Summer Vibes',
    artistName: 'DJ Cool',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    launchDate: '2026-02-15',
    genre: 'Electronic',
    targetMarkets: ['FR', 'BE', 'CH'],
  };

  describe('generateCreativeVariations', () => {
    it('should generate title variations', () => {
      const creatives = generateCreativeVariations('Summer Vibes', 'DJ Cool', 'spotify_track', 'Electronic');
      
      expect(creatives.titles.length).toBeGreaterThanOrEqual(3);
      expect(creatives.titles.every(t => t.content.includes('Summer Vibes'))).toBe(true);
    });

    it('should generate social captions for multiple platforms', () => {
      const creatives = generateCreativeVariations('Summer Vibes', 'DJ Cool', 'spotify_track');
      
      expect(creatives.social_captions.length).toBeGreaterThanOrEqual(3);
      
      const platforms = creatives.social_captions.map(c => c.platform);
      expect(platforms).toContain('instagram');
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('tiktok');
    });

    it('should generate hooks for short-form content', () => {
      const creatives = generateCreativeVariations('Test Song', 'Artist', 'spotify_track');
      
      expect(creatives.hooks.length).toBeGreaterThanOrEqual(3);
      expect(creatives.hooks.every(h => h.character_count < 100)).toBe(true);
    });

    it('should generate hashtag sets', () => {
      const creatives = generateCreativeVariations('Test', 'Artist', 'youtube_video', 'Pop');
      
      expect(creatives.hashtag_sets.length).toBeGreaterThanOrEqual(2);
      expect(creatives.hashtag_sets.every(h => h.content.includes('#'))).toBe(true);
    });

    it('should adapt descriptions for YouTube', () => {
      const creatives = generateCreativeVariations('Video Title', 'Creator', 'youtube_video');
      
      const ytDesc = creatives.descriptions.find(d => d.platform === 'youtube');
      expect(ytDesc).toBeDefined();
      expect(ytDesc?.content).toContain('TIMESTAMPS');
    });

    it('should adapt descriptions for Spotify', () => {
      const creatives = generateCreativeVariations('Track Name', 'Artist', 'spotify_track');
      
      const spotifyDesc = creatives.descriptions.find(d => d.platform === 'spotify');
      expect(spotifyDesc).toBeDefined();
      expect(spotifyDesc?.content.toLowerCase()).toContain('écoute');
    });

    it('should include character count for all variations', () => {
      const creatives = generateCreativeVariations('Test', 'Test', 'youtube_video');
      
      const allVariations = [
        ...creatives.titles,
        ...creatives.descriptions,
        ...creatives.social_captions,
        ...creatives.hooks,
        ...creatives.hashtag_sets,
      ];
      
      expect(allVariations.every(v => typeof v.character_count === 'number')).toBe(true);
    });
  });

  describe('generateThumbnailConcepts', () => {
    it('should generate 3 thumbnail concepts', () => {
      const thumbnails = generateThumbnailConcepts('Cool Video', 'youtube_video');
      
      expect(thumbnails.length).toBe(3);
    });

    it('should include required fields for each concept', () => {
      const thumbnails = generateThumbnailConcepts('Test', 'youtube_video');
      
      for (const thumb of thumbnails) {
        expect(thumb.id).toBeDefined();
        expect(thumb.hook_text).toBeDefined();
        expect(thumb.style).toBeDefined();
        expect(thumb.color_scheme).toBeDefined();
        expect(thumb.background_suggestion).toBeDefined();
      }
    });

    it('should include expression_emotion for video platforms', () => {
      const thumbnails = generateThumbnailConcepts('Video', 'youtube_video');
      
      expect(thumbnails.some(t => t.expression_emotion !== undefined)).toBe(true);
    });

    it('should not include expression_emotion for music platforms', () => {
      const thumbnails = generateThumbnailConcepts('Track', 'spotify_track');
      
      // Music doesn't need face expressions
      expect(thumbnails.every(t => t.expression_emotion === undefined)).toBe(true);
    });
  });

  describe('generateShortFormIdeas', () => {
    it('should generate multiple short-form ideas', () => {
      const ideas = generateShortFormIdeas('Track', 'Artist', 'spotify_track', 'Pop');
      
      expect(ideas.length).toBeGreaterThanOrEqual(5);
    });

    it('should include TikTok, Reels, and Shorts', () => {
      const ideas = generateShortFormIdeas('Test', 'Artist', 'youtube_video');
      
      const platforms = ideas.map(i => i.platform);
      expect(platforms).toContain('tiktok');
      expect(platforms).toContain('instagram_reels');
      expect(platforms).toContain('youtube_shorts');
    });

    it('should include hook script for each idea', () => {
      const ideas = generateShortFormIdeas('Track', 'Artist', 'spotify_track');
      
      expect(ideas.every(i => i.hook_script.length > 0)).toBe(true);
    });

    it('should include hashtags for each idea', () => {
      const ideas = generateShortFormIdeas('Test', 'Test', 'spotify_album');
      
      expect(ideas.every(i => i.hashtags.length > 0)).toBe(true);
    });

    it('should set reasonable duration for each idea', () => {
      const ideas = generateShortFormIdeas('Test', 'Test', 'youtube_video');
      
      for (const idea of ideas) {
        expect(idea.duration_seconds).toBeGreaterThanOrEqual(15);
        expect(idea.duration_seconds).toBeLessThanOrEqual(60);
      }
    });
  });

  describe('generateLaunchPlan', () => {
    it('should generate 3 phases', () => {
      const phases = generateLaunchPlan('spotify_track', '2026-02-15');
      
      expect(phases.length).toBe(3);
      expect(phases.map(p => p.name)).toEqual(['pre_launch', 'launch_day', 'post_launch']);
    });

    it('should have actions in each phase', () => {
      const phases = generateLaunchPlan('youtube_video', '2026-02-15');
      
      for (const phase of phases) {
        expect(phase.actions.length).toBeGreaterThan(0);
      }
    });

    it('should have KPIs for each phase', () => {
      const phases = generateLaunchPlan('spotify_track', null);
      
      for (const phase of phases) {
        expect(phase.kpis.length).toBeGreaterThan(0);
      }
    });

    it('should have negative day_relative for pre_launch actions', () => {
      const phases = generateLaunchPlan('spotify_album', '2026-03-01');
      const preLaunch = phases.find(p => p.name === 'pre_launch');
      
      expect(preLaunch?.actions.every(a => a.day_relative < 0)).toBe(true);
    });

    it('should have zero day_relative for launch_day actions', () => {
      const phases = generateLaunchPlan('youtube_video', '2026-02-15');
      const launchDay = phases.find(p => p.name === 'launch_day');
      
      expect(launchDay?.actions.every(a => a.day_relative === 0)).toBe(true);
    });

    it('should have positive day_relative for post_launch actions', () => {
      const phases = generateLaunchPlan('spotify_track', '2026-02-15');
      const postLaunch = phases.find(p => p.name === 'post_launch');
      
      expect(postLaunch?.actions.every(a => a.day_relative > 0)).toBe(true);
    });

    it('should include estimated time for actions', () => {
      const phases = generateLaunchPlan('youtube_video', null);
      const allActions = phases.flatMap(p => p.actions);
      
      expect(allActions.every(a => typeof a.estimated_time_minutes === 'number')).toBe(true);
    });

    it('should have critical actions in launch phase', () => {
      const phases = generateLaunchPlan('spotify_track', '2026-02-15');
      const launchDay = phases.find(p => p.name === 'launch_day');
      
      expect(launchDay?.actions.some(a => a.priority === 'critical')).toBe(true);
    });

    it('should adapt actions for music vs video platforms', () => {
      const musicPhases = generateLaunchPlan('spotify_track', '2026-02-15');
      const videoPhases = generateLaunchPlan('youtube_video', '2026-02-15');
      
      const musicPreLaunch = musicPhases.find(p => p.name === 'pre_launch');
      const videoPreLaunch = videoPhases.find(p => p.name === 'pre_launch');
      
      // Music should mention pre-save
      expect(musicPreLaunch?.actions.some(a => 
        a.title.toLowerCase().includes('pré-save') || 
        a.description.toLowerCase().includes('pré-save')
      )).toBe(true);
      
      // Video should mention YouTube
      expect(videoPreLaunch?.actions.some(a => 
        a.title.toLowerCase().includes('youtube') || 
        a.description.toLowerCase().includes('youtube')
      )).toBe(true);
    });
  });

  describe('generateSmartLinkConfig', () => {
    it('should generate slug from title', () => {
      const config = generateSmartLinkConfig(sampleConfig);
      
      expect(config.slug).toContain('summer-vibes');
    });

    it('should include multiple streaming platforms for music', () => {
      const config = generateSmartLinkConfig(sampleConfig);
      
      expect(config.platforms.length).toBeGreaterThanOrEqual(4);
      expect(config.platforms.some(p => p.platform === 'spotify')).toBe(true);
      expect(config.platforms.some(p => p.platform === 'apple_music')).toBe(true);
    });

    it('should include YouTube first for video platforms', () => {
      const videoConfig: MediaPromotionConfig = {
        ...sampleConfig,
        platform: 'youtube_video',
      };
      
      const config = generateSmartLinkConfig(videoConfig);
      
      expect(config.platforms[0].platform).toBe('youtube');
    });

    it('should set up UTM tracking', () => {
      const config = generateSmartLinkConfig(sampleConfig);
      
      expect(config.tracking.utm_source).toBe('smartlink');
      expect(config.tracking.utm_medium).toBe('social');
      expect(config.tracking.utm_campaign).toBeTruthy();
    });

    it('should include title and subtitle', () => {
      const config = generateSmartLinkConfig(sampleConfig);
      
      expect(config.title).toBe('Summer Vibes');
      expect(config.subtitle).toBe('DJ Cool');
    });
  });

  describe('MediaPromotionAgent.run', () => {
    it('should produce valid output structure', () => {
      const agent = new MediaPromotionAgent(sampleConfig);
      const output = agent.run();
      
      expect(output.summary).toBeTruthy();
      expect(output.asset_summary).toBeDefined();
      expect(output.launch_plan).toBeDefined();
      expect(output.creatives).toBeDefined();
      expect(output.thumbnails).toBeDefined();
      expect(output.short_form_ideas).toBeDefined();
      expect(output.smart_link).toBeDefined();
    });

    it('should calculate total actions correctly', () => {
      const agent = new MediaPromotionAgent(sampleConfig);
      const output = agent.run();
      
      const manualCount = output.launch_plan.phases.reduce(
        (sum, p) => sum + p.actions.length, 
        0
      );
      
      expect(output.launch_plan.total_actions).toBe(manualCount);
    });

    it('should estimate hours correctly', () => {
      const agent = new MediaPromotionAgent(sampleConfig);
      const output = agent.run();
      
      expect(output.launch_plan.estimated_total_hours).toBeGreaterThan(0);
    });

    it('should generate actions from launch plan', () => {
      const agent = new MediaPromotionAgent(sampleConfig);
      const output = agent.run();
      
      expect(output.actions.length).toBeGreaterThan(0);
      expect(output.actions.every(a => a.category === 'media')).toBe(true);
    });

    it('should add risk when no launch date', () => {
      const configNoDate: MediaPromotionConfig = {
        ...sampleConfig,
        launchDate: undefined,
      };
      
      const agent = new MediaPromotionAgent(configNoDate);
      const output = agent.run();
      
      expect(output.risks.some(r => r.id === 'no_launch_date')).toBe(true);
    });

    it('should add risk when no title', () => {
      const configNoTitle: MediaPromotionConfig = {
        ...sampleConfig,
        title: null,
      };
      
      const agent = new MediaPromotionAgent(configNoTitle);
      const output = agent.run();
      
      expect(output.risks.some(r => r.id === 'no_title')).toBe(true);
    });

    it('should include YouTube-specific data for video platforms', () => {
      const videoConfig: MediaPromotionConfig = {
        ...sampleConfig,
        platform: 'youtube_video',
      };
      
      const agent = new MediaPromotionAgent(videoConfig);
      const output = agent.run();
      
      expect(output.platform_specific.youtube).toBeDefined();
      expect(output.platform_specific.youtube?.tags).toBeDefined();
      expect(output.platform_specific.youtube?.chapters).toBeDefined();
      expect(output.platform_specific.youtube?.shorts_clips).toBeDefined();
    });

    it('should include Spotify-specific data for music platforms', () => {
      const agent = new MediaPromotionAgent(sampleConfig);
      const output = agent.run();
      
      expect(output.platform_specific.spotify).toBeDefined();
      expect(output.platform_specific.spotify?.playlist_pitch).toBeDefined();
      expect(output.platform_specific.spotify?.one_liner).toBeDefined();
      expect(output.platform_specific.spotify?.bio_short).toBeDefined();
    });

    it('should set appropriate metrics to watch for each platform', () => {
      const musicAgent = new MediaPromotionAgent(sampleConfig);
      const musicOutput = musicAgent.run();
      
      expect(musicOutput.metrics_to_watch).toContain('Streams');
      expect(musicOutput.metrics_to_watch).toContain('Playlist adds');
      
      const videoConfig: MediaPromotionConfig = {
        ...sampleConfig,
        platform: 'youtube_video',
      };
      const videoAgent = new MediaPromotionAgent(videoConfig);
      const videoOutput = videoAgent.run();
      
      expect(videoOutput.metrics_to_watch).toContain('Views');
      expect(videoOutput.metrics_to_watch).toContain('Watch time');
    });
  });

  describe('runMediaPromotionAgent factory', () => {
    it('should produce same output as class method', () => {
      const output = runMediaPromotionAgent(sampleConfig);
      
      expect(output.summary).toContain('Summer Vibes');
      expect(output.asset_summary.platform).toBe('spotify_track');
    });
  });

  describe('Platform detection coverage', () => {
    const platforms: MediaPlatform[] = [
      'youtube_video',
      'youtube_channel',
      'spotify_track',
      'spotify_album',
      'spotify_artist',
      'apple_music',
      'soundcloud',
      'tiktok',
      'other',
    ];

    it.each(platforms)('should handle %s platform', (platform) => {
      const config: MediaPromotionConfig = {
        workspaceId: 'test',
        assetId: 'test',
        platform,
        title: 'Test',
        artistName: 'Test Artist',
        thumbnailUrl: null,
      };
      
      const output = runMediaPromotionAgent(config);
      
      expect(output.asset_summary.platform).toBe(platform);
      expect(output.launch_plan.phases.length).toBe(3);
    });
  });
});
