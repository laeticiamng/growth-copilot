import { describe, it, expect } from 'vitest';
import { LaunchTypeEngine } from '../launch-type-engine';
import type { LaunchType, LaunchCategory } from '../types';

describe('LaunchTypeEngine', () => {
  describe('getConfig', () => {
    it('returns config for a music type', () => {
      const config = LaunchTypeEngine.getConfig('single');
      expect(config.type).toBe('single');
      expect(config.category).toBe('music');
      expect(config.label).toBe('Single Release');
      expect(config.defaultChannels.length).toBeGreaterThan(0);
      expect(config.phases.length).toBe(3);
      expect(config.kpiKeys.length).toBeGreaterThan(0);
    });

    it('returns config for a platform type', () => {
      const config = LaunchTypeEngine.getConfig('saas_launch');
      expect(config.type).toBe('saas_launch');
      expect(config.category).toBe('platform');
      expect(config.label).toBe('SaaS Launch');
    });
  });

  describe('getAllTypes', () => {
    it('returns all 11 launch types', () => {
      const all = LaunchTypeEngine.getAllTypes();
      expect(all).toHaveLength(11);
    });

    it('each type has required fields', () => {
      for (const config of LaunchTypeEngine.getAllTypes()) {
        expect(config.type).toBeTruthy();
        expect(config.category).toMatch(/^(music|platform)$/);
        expect(config.label).toBeTruthy();
        expect(config.description).toBeTruthy();
        expect(config.icon).toBeTruthy();
        expect(config.defaultChannels.length).toBeGreaterThan(0);
        expect(config.phases.length).toBeGreaterThanOrEqual(3);
        expect(config.kpiKeys.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getTypesByCategory', () => {
    it('returns 5 music types', () => {
      const music = LaunchTypeEngine.getTypesByCategory('music');
      expect(music).toHaveLength(5);
      expect(music.every(c => c.category === 'music')).toBe(true);
    });

    it('returns 6 platform types', () => {
      const platform = LaunchTypeEngine.getTypesByCategory('platform');
      expect(platform).toHaveLength(6);
      expect(platform.every(c => c.category === 'platform')).toBe(true);
    });
  });

  describe('getDefaultPhases', () => {
    it('returns phases with correct structure', () => {
      const phases = LaunchTypeEngine.getDefaultPhases('album');
      expect(phases.length).toBeGreaterThanOrEqual(3);
      for (const phase of phases) {
        expect(phase.name).toBeTruthy();
        expect(phase.key).toBeTruthy();
        expect(typeof phase.daysOffset).toBe('number');
        expect(typeof phase.durationDays).toBe('number');
        expect(phase.defaultTasks.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getDefaultChannels', () => {
    it('returns channels for music type', () => {
      const channels = LaunchTypeEngine.getDefaultChannels('single');
      expect(channels).toContain('tiktok');
      expect(channels).toContain('smart_link');
    });

    it('returns channels for platform type', () => {
      const channels = LaunchTypeEngine.getDefaultChannels('saas_launch');
      expect(channels).toContain('meta_ads');
      expect(channels).toContain('email');
    });
  });

  describe('getKPIKeys', () => {
    it('music types include music-specific KPIs', () => {
      const kpis = LaunchTypeEngine.getKPIKeys('single');
      expect(kpis).toContain('hook_retention_rate');
      expect(kpis).toContain('stream_conversion');
    });

    it('platform types include platform-specific KPIs', () => {
      const kpis = LaunchTypeEngine.getKPIKeys('saas_launch');
      expect(kpis).toContain('signup_rate');
      expect(kpis).toContain('cac');
    });
  });
});
