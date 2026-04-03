import { describe, it, expect } from 'vitest';
import { EVENT_TAXONOMY, buildUTMUrl, computeAttribution, computeFunnel } from '../signal-graph';
import type { SignalEvent, SignalEventType } from '../types';

describe('SignalGraph', () => {
  describe('EVENT_TAXONOMY', () => {
    it('defines all event types', () => {
      expect(Object.keys(EVENT_TAXONOMY)).toHaveLength(27);
    });

    it('each event has required fields', () => {
      for (const [key, def] of Object.entries(EVENT_TAXONOMY)) {
        expect(def.type).toBe(key);
        expect(def.category).toBeTruthy();
        expect(def.label).toBeTruthy();
        expect(def.ga4EventName).toBeTruthy();
        expect(def.metaEventName).toBeTruthy();
        expect(['count', 'boolean', 'currency']).toContain(def.valueType);
      }
    });

    it('maps music events to correct category', () => {
      expect(EVENT_TAXONOMY.pre_save.category).toBe('music');
      expect(EVENT_TAXONOMY.stream_start.category).toBe('music');
      expect(EVENT_TAXONOMY.playlist_add.category).toBe('music');
    });

    it('maps platform events to correct category', () => {
      expect(EVENT_TAXONOMY.signup.category).toBe('platform');
      expect(EVENT_TAXONOMY.trial_start.category).toBe('platform');
      expect(EVENT_TAXONOMY.purchase.category).toBe('platform');
    });
  });

  describe('buildUTMUrl', () => {
    it('adds UTM parameters to URL', () => {
      const url = buildUTMUrl('https://example.com', {
        source: 'instagram',
        medium: 'social',
        campaign: 'summer_release',
      });
      expect(url).toContain('utm_source=instagram');
      expect(url).toContain('utm_medium=social');
      expect(url).toContain('utm_campaign=summer_release');
    });

    it('adds optional content and term params', () => {
      const url = buildUTMUrl('https://example.com', {
        source: 'meta',
        medium: 'paid',
        campaign: 'launch',
        content: 'variant_a',
        term: 'music',
      });
      expect(url).toContain('utm_content=variant_a');
      expect(url).toContain('utm_term=music');
    });

    it('preserves existing URL parameters', () => {
      const url = buildUTMUrl('https://example.com?existing=true', {
        source: 'meta',
        medium: 'paid',
        campaign: 'test',
      });
      expect(url).toContain('existing=true');
      expect(url).toContain('utm_source=meta');
    });

    it('omits optional params when not provided', () => {
      const url = buildUTMUrl('https://example.com', {
        source: 'meta',
        medium: 'paid',
        campaign: 'test',
      });
      expect(url).not.toContain('utm_content');
      expect(url).not.toContain('utm_term');
    });
  });

  describe('computeAttribution', () => {
    const makeEvent = (overrides: Partial<SignalEvent>): SignalEvent => ({
      id: Math.random().toString(),
      launch_project_id: 'p1',
      event_type: 'click',
      source: 'meta',
      channel: 'meta_ads',
      created_at: new Date().toISOString(),
      ...overrides,
    } as SignalEvent);

    it('last_touch attribution gives credit to last channel', () => {
      const events: SignalEvent[] = [
        makeEvent({ event_type: 'click', channel: 'tiktok', user_id_hash: 'u1', created_at: '2026-01-01T00:00:00Z' }),
        makeEvent({ event_type: 'click', channel: 'instagram_reels', user_id_hash: 'u1', created_at: '2026-01-02T00:00:00Z' }),
        makeEvent({ event_type: 'purchase', channel: undefined, user_id_hash: 'u1', created_at: '2026-01-03T00:00:00Z' }),
      ];

      const results = computeAttribution(events, ['purchase'], 'last_touch');
      const igResult = results.find(r => r.channel === 'instagram_reels');
      expect(igResult).toBeDefined();
      expect(igResult!.conversions).toBe(1);
      expect(igResult!.credit).toBeGreaterThan(0);
    });

    it('first_touch attribution gives credit to first channel', () => {
      const events: SignalEvent[] = [
        makeEvent({ event_type: 'click', channel: 'tiktok', user_id_hash: 'u1', created_at: '2026-01-01T00:00:00Z' }),
        makeEvent({ event_type: 'click', channel: 'instagram_reels', user_id_hash: 'u1', created_at: '2026-01-02T00:00:00Z' }),
        makeEvent({ event_type: 'purchase', channel: undefined, user_id_hash: 'u1', created_at: '2026-01-03T00:00:00Z' }),
      ];

      const results = computeAttribution(events, ['purchase'], 'first_touch');
      const ttResult = results.find(r => r.channel === 'tiktok');
      expect(ttResult).toBeDefined();
      expect(ttResult!.conversions).toBe(1);
    });

    it('linear attribution splits credit equally', () => {
      const events: SignalEvent[] = [
        makeEvent({ event_type: 'click', channel: 'tiktok', user_id_hash: 'u1', created_at: '2026-01-01T00:00:00Z' }),
        makeEvent({ event_type: 'click', channel: 'instagram_reels', user_id_hash: 'u1', created_at: '2026-01-02T00:00:00Z' }),
        makeEvent({ event_type: 'purchase', channel: undefined, user_id_hash: 'u1', created_at: '2026-01-03T00:00:00Z' }),
      ];

      const results = computeAttribution(events, ['purchase'], 'linear');
      expect(results).toHaveLength(2);
      // Each should get 50% credit
      expect(results[0].credit).toBeCloseTo(0.5, 1);
      expect(results[1].credit).toBeCloseTo(0.5, 1);
    });

    it('returns empty array when no conversions', () => {
      const events: SignalEvent[] = [
        makeEvent({ event_type: 'click', channel: 'tiktok', user_id_hash: 'u1' }),
      ];
      const results = computeAttribution(events, ['purchase'], 'last_touch');
      expect(results).toHaveLength(0);
    });

    it('handles multiple users independently', () => {
      const events: SignalEvent[] = [
        makeEvent({ event_type: 'click', channel: 'tiktok', user_id_hash: 'u1', created_at: '2026-01-01T00:00:00Z' }),
        makeEvent({ event_type: 'purchase', user_id_hash: 'u1', created_at: '2026-01-02T00:00:00Z' }),
        makeEvent({ event_type: 'click', channel: 'meta_ads', user_id_hash: 'u2', created_at: '2026-01-01T00:00:00Z' }),
        makeEvent({ event_type: 'purchase', user_id_hash: 'u2', created_at: '2026-01-02T00:00:00Z' }),
      ];

      const results = computeAttribution(events, ['purchase'], 'last_touch');
      expect(results).toHaveLength(2);
      const totalConversions = results.reduce((sum, r) => sum + r.conversions, 0);
      expect(totalConversions).toBe(2);
    });
  });

  describe('computeFunnel', () => {
    it('calculates funnel with correct dropoff', () => {
      const events = [
        ...Array(1000).fill(null).map((_, i) => ({
          id: `v-${i}`, launch_project_id: 'p1', event_type: 'view' as SignalEventType,
          source: 'web', properties: {}, created_at: new Date().toISOString(),
        })),
        ...Array(300).fill(null).map((_, i) => ({
          id: `c-${i}`, launch_project_id: 'p1', event_type: 'click' as SignalEventType,
          source: 'web', properties: {}, created_at: new Date().toISOString(),
        })),
        ...Array(50).fill(null).map((_, i) => ({
          id: `s-${i}`, launch_project_id: 'p1', event_type: 'signup' as SignalEventType,
          source: 'web', properties: {}, created_at: new Date().toISOString(),
        })),
      ];

      const funnel = computeFunnel(events, ['view', 'click', 'signup']);
      expect(funnel).toHaveLength(3);
      expect(funnel[0].count).toBe(1000);
      expect(funnel[0].dropoff_pct).toBe(0); // First step has 0 dropoff
      expect(funnel[1].count).toBe(300);
      expect(funnel[1].dropoff_pct).toBe(70); // 70% dropoff from view to click
      expect(funnel[2].count).toBe(50);
      expect(funnel[2].dropoff_pct).toBe(83); // ~83% dropoff from click to signup
    });

    it('handles empty events', () => {
      const funnel = computeFunnel([], ['view', 'click']);
      expect(funnel).toHaveLength(2);
      expect(funnel[0].count).toBe(0);
      expect(funnel[1].count).toBe(0);
    });

    it('uses event taxonomy labels', () => {
      const funnel = computeFunnel([], ['view', 'click', 'purchase']);
      expect(funnel[0].label).toBe('View');
      expect(funnel[1].label).toBe('Click');
      expect(funnel[2].label).toBe('Purchase');
    });
  });
});
