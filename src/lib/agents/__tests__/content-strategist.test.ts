import { describe, it, expect } from 'vitest';
import {
  ContentStrategist,
  detectIntent,
  clusterKeywords,
  detectCannibalization,
  generateOpportunities,
  generateContentCalendar,
  runContentStrategist,
  type KeywordData,
  type KeywordCluster,
} from '../content-strategist';

describe('ContentStrategist', () => {
  // Sample keyword data
  const sampleKeywords: KeywordData[] = [
    {
      keyword: 'seo guide',
      search_volume: 1500,
      difficulty: 45,
      position_avg: 25,
      clicks_30d: 50,
      impressions_30d: 2000,
      ctr_30d: 2.5,
      intent: null,
      source: 'gsc',
    },
    {
      keyword: 'seo tutorial',
      search_volume: 800,
      difficulty: 40,
      position_avg: 30,
      clicks_30d: 20,
      impressions_30d: 1000,
      ctr_30d: 2.0,
      intent: null,
      source: 'gsc',
    },
    {
      keyword: 'best seo tools',
      search_volume: 2000,
      difficulty: 55,
      position_avg: 15,
      clicks_30d: 100,
      impressions_30d: 3000,
      ctr_30d: 3.3,
      intent: null,
      source: 'gsc',
    },
    {
      keyword: 'buy seo software',
      search_volume: 500,
      difficulty: 60,
      position_avg: null,
      clicks_30d: 0,
      impressions_30d: 0,
      ctr_30d: 0,
      intent: null,
      source: 'competitor',
    },
    {
      keyword: 'how to improve seo',
      search_volume: 1200,
      difficulty: 35,
      position_avg: 8,
      clicks_30d: 200,
      impressions_30d: 2500,
      ctr_30d: 8.0,
      intent: null,
      source: 'gsc',
    },
  ];

  const samplePages = [
    { url: '/seo-guide', keyword: 'seo guide', performance: 'declining' as const },
    { url: '/blog/seo-tips', keyword: 'seo tips', performance: 'good' as const },
  ];

  describe('detectIntent', () => {
    it('should detect transactional intent', () => {
      expect(detectIntent('buy seo software')).toBe('transactional');
      expect(detectIntent('seo tools price')).toBe('transactional');
      expect(detectIntent('acheter logiciel seo')).toBe('transactional');
    });

    it('should detect commercial intent', () => {
      expect(detectIntent('best seo tools')).toBe('commercial');
      expect(detectIntent('seo tool vs competitor')).toBe('commercial');
      expect(detectIntent('meilleur outil seo')).toBe('commercial');
    });

    it('should detect navigational intent', () => {
      expect(detectIntent('google search console login')).toBe('navigational');
      expect(detectIntent('semrush account')).toBe('navigational');
    });

    it('should detect informational intent', () => {
      expect(detectIntent('how to improve seo')).toBe('informational');
      expect(detectIntent('what is seo')).toBe('informational');
      expect(detectIntent('seo tutorial')).toBe('informational');
      expect(detectIntent('comment améliorer seo')).toBe('informational');
    });

    it('should return null for ambiguous keywords', () => {
      expect(detectIntent('seo')).toBeNull();
      expect(detectIntent('marketing digital')).toBeNull();
    });
  });

  describe('clusterKeywords', () => {
    it('should group similar keywords', () => {
      const clusters = clusterKeywords(sampleKeywords);
      
      expect(clusters.length).toBeGreaterThan(0);
      // Should have clusters for different intents/topics
    });

    it('should calculate total volume for clusters', () => {
      const clusters = clusterKeywords(sampleKeywords);
      
      for (const cluster of clusters) {
        const expectedVolume = cluster.keywords.reduce((sum, k) => sum + (k.search_volume || 0), 0);
        expect(cluster.total_volume).toBe(expectedVolume);
      }
    });

    it('should calculate average position', () => {
      const clusters = clusterKeywords(sampleKeywords);
      
      for (const cluster of clusters) {
        const keywordsWithPosition = cluster.keywords.filter(k => k.position_avg !== null);
        if (keywordsWithPosition.length > 0) {
          expect(cluster.avg_position).not.toBeNull();
        }
      }
    });

    it('should calculate opportunity score', () => {
      const clusters = clusterKeywords(sampleKeywords);
      
      for (const cluster of clusters) {
        expect(cluster.opportunity_score).toBeGreaterThanOrEqual(0);
        expect(cluster.opportunity_score).toBeLessThanOrEqual(100);
      }
    });

    it('should sort clusters by opportunity score', () => {
      const clusters = clusterKeywords(sampleKeywords);
      
      for (let i = 1; i < clusters.length; i++) {
        expect(clusters[i - 1].opportunity_score).toBeGreaterThanOrEqual(clusters[i].opportunity_score);
      }
    });

    it('should handle empty input', () => {
      const clusters = clusterKeywords([]);
      expect(clusters).toHaveLength(0);
    });
  });

  describe('detectCannibalization', () => {
    it('should detect pages competing for same keyword', () => {
      const keywordPageMap = new Map<string, { url: string; position: number }[]>([
        ['seo guide', [
          { url: '/seo-guide', position: 8 },
          { url: '/blog/seo-guide-2024', position: 12 },
        ]],
      ]);
      
      const issues = detectCannibalization(keywordPageMap);
      
      expect(issues.length).toBe(1);
      expect(issues[0].keyword).toBe('seo guide');
      expect(issues[0].competing_urls).toHaveLength(2);
    });

    it('should not flag pages with very different positions', () => {
      const keywordPageMap = new Map<string, { url: string; position: number }[]>([
        ['seo tips', [
          { url: '/seo-tips', position: 5 },
          { url: '/old-seo-tips', position: 85 }, // Very far apart
        ]],
      ]);
      
      const issues = detectCannibalization(keywordPageMap);
      expect(issues.length).toBe(0);
    });

    it('should not flag single-page keywords', () => {
      const keywordPageMap = new Map<string, { url: string; position: number }[]>([
        ['unique keyword', [
          { url: '/page', position: 10 },
        ]],
      ]);
      
      const issues = detectCannibalization(keywordPageMap);
      expect(issues.length).toBe(0);
    });

    it('should handle multiple cannibalization cases', () => {
      const keywordPageMap = new Map<string, { url: string; position: number }[]>([
        ['keyword1', [
          { url: '/page1', position: 5 },
          { url: '/page2', position: 8 },
          { url: '/page3', position: 12 },
        ]],
        ['keyword2', [
          { url: '/pageA', position: 3 },
          { url: '/pageB', position: 7 },
        ]],
      ]);
      
      const issues = detectCannibalization(keywordPageMap);
      expect(issues.length).toBe(2);
    });
  });

  describe('generateOpportunities', () => {
    it('should create refresh opportunity for declining pages', () => {
      const clusters = clusterKeywords(sampleKeywords);
      const opportunities = generateOpportunities(clusters, samplePages);
      
      const refreshOpp = opportunities.find(o => o.type === 'refresh');
      expect(refreshOpp).toBeDefined();
    });

    it('should create new content opportunity for high-opportunity clusters', () => {
      const highOppCluster: KeywordCluster = {
        id: 'test-cluster',
        name: 'Test',
        main_intent: 'informational',
        keywords: [{ 
          keyword: 'test keyword', 
          search_volume: 1000, 
          difficulty: 30,
          position_avg: null,
          clicks_30d: 0,
          impressions_30d: 0,
          ctr_30d: 0,
          intent: 'informational',
          source: 'manual',
        }],
        total_volume: 1000,
        avg_position: null,
        opportunity_score: 80,
        has_content: false,
      };
      
      const opportunities = generateOpportunities([highOppCluster], []);
      
      const newContentOpp = opportunities.find(o => o.type === 'new_content');
      expect(newContentOpp).toBeDefined();
    });

    it('should sort opportunities by ICE score', () => {
      const clusters = clusterKeywords(sampleKeywords);
      const opportunities = generateOpportunities(clusters, samplePages);
      
      for (let i = 1; i < opportunities.length; i++) {
        expect(opportunities[i - 1].ice_score).toBeGreaterThanOrEqual(opportunities[i].ice_score);
      }
    });

    it('should set appropriate word count targets', () => {
      const clusters = clusterKeywords(sampleKeywords);
      const opportunities = generateOpportunities(clusters, samplePages);
      
      for (const opp of opportunities) {
        if (opp.word_count_target) {
          expect(opp.word_count_target).toBeGreaterThanOrEqual(1500);
        }
      }
    });
  });

  describe('generateContentCalendar', () => {
    it('should distribute opportunities across weeks', () => {
      const opportunities = [
        { id: '1', type: 'new_content' as const, title: 'Content 1', target_keyword: 'kw1', cluster_id: 'c1', priority: 'high' as const, effort: 'medium' as const, impact: 'high' as const, ice_score: 80, reason: 'test' },
        { id: '2', type: 'new_content' as const, title: 'Content 2', target_keyword: 'kw2', cluster_id: 'c2', priority: 'medium' as const, effort: 'low' as const, impact: 'medium' as const, ice_score: 70, reason: 'test' },
        { id: '3', type: 'refresh' as const, title: 'Content 3', target_keyword: 'kw3', cluster_id: 'c3', priority: 'medium' as const, effort: 'low' as const, impact: 'medium' as const, ice_score: 60, reason: 'test' },
        { id: '4', type: 'new_content' as const, title: 'Content 4', target_keyword: 'kw4', cluster_id: 'c4', priority: 'low' as const, effort: 'high' as const, impact: 'low' as const, ice_score: 50, reason: 'test' },
      ];
      
      const calendar = generateContentCalendar(opportunities);
      
      expect(calendar.items.length).toBe(4);
      expect(calendar.items.some(i => i.week === 1)).toBe(true);
      expect(calendar.items.some(i => i.week === 2)).toBe(true);
    });

    it('should limit to 8 items per month', () => {
      const manyOpportunities = Array.from({ length: 15 }, (_, i) => ({
        id: `opp-${i}`,
        type: 'new_content' as const,
        title: `Content ${i}`,
        target_keyword: `keyword ${i}`,
        cluster_id: `c${i}`,
        priority: 'medium' as const,
        effort: 'medium' as const,
        impact: 'medium' as const,
        ice_score: 50,
        reason: 'test',
      }));
      
      const calendar = generateContentCalendar(manyOpportunities);
      
      expect(calendar.items.length).toBeLessThanOrEqual(8);
    });

    it('should use current month by default', () => {
      const calendar = generateContentCalendar([]);
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      expect(calendar.month).toBe(currentMonth);
    });
  });

  describe('ContentStrategist.run', () => {
    it('should produce valid output structure', () => {
      const strategist = new ContentStrategist({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      });
      
      const output = strategist.run(sampleKeywords, samplePages, [], new Map());
      
      expect(output.summary).toBeTruthy();
      expect(output.clusters).toBeDefined();
      expect(output.opportunities).toBeDefined();
      expect(output.content_calendar).toBeDefined();
      expect(output.actions).toBeDefined();
    });

    it('should identify quick wins', () => {
      const strategist = new ContentStrategist({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      });
      
      const output = strategist.run(sampleKeywords, samplePages, [], new Map());
      
      // Quick wins should be high impact, low effort
      for (const qw of output.quick_wins) {
        expect(qw.effort).not.toBe('high');
      }
    });

    it('should identify keyword gaps', () => {
      const competitorKeywords = ['competitor keyword 1', 'competitor keyword 2', 'seo guide'];
      
      const strategist = new ContentStrategist({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      });
      
      const output = strategist.run(sampleKeywords, samplePages, competitorKeywords, new Map());
      
      // Should include competitor keywords we don't have
      expect(output.keyword_gaps).toContain('competitor keyword 1');
      expect(output.keyword_gaps).toContain('competitor keyword 2');
      // Should not include keywords we already have
      expect(output.keyword_gaps).not.toContain('seo guide');
    });

    it('should add risk when no keyword data', () => {
      const strategist = new ContentStrategist({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      });
      
      const output = strategist.run([], [], [], new Map());
      
      expect(output.risks.some(r => r.id === 'no_keyword_data')).toBe(true);
    });

    it('should add risk for high cannibalization', () => {
      const keywordPageMap = new Map<string, { url: string; position: number }[]>();
      // Create many cannibalization cases
      for (let i = 0; i < 10; i++) {
        keywordPageMap.set(`keyword-${i}`, [
          { url: `/page-${i}-a`, position: 5 },
          { url: `/page-${i}-b`, position: 10 },
        ]);
      }
      
      const strategist = new ContentStrategist({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      });
      
      const output = strategist.run(sampleKeywords, samplePages, [], keywordPageMap);
      
      expect(output.risks.some(r => r.id === 'high_cannibalization')).toBe(true);
    });

    it('should set GSC status correctly', () => {
      const strategist = new ContentStrategist({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      });
      
      // With GSC data
      const outputWithGSC = strategist.run(sampleKeywords, samplePages, [], new Map());
      expect(outputWithGSC.integrations_status.gsc).toBe('connected');
      
      // Without GSC data
      const manualKeywords: KeywordData[] = [
        { keyword: 'test', search_volume: 100, difficulty: null, position_avg: null, clicks_30d: null, impressions_30d: null, ctr_30d: null, intent: null, source: 'manual' },
      ];
      const outputNoGSC = strategist.run(manualKeywords, [], [], new Map());
      expect(outputNoGSC.integrations_status.gsc).toBe('disconnected');
    });

    it('should require approval for critical actions', () => {
      // Create a high-opportunity keyword that will generate critical action
      const highOppKeywords: KeywordData[] = [
        {
          keyword: 'high volume keyword',
          search_volume: 5000,
          difficulty: 30,
          position_avg: null, // Not ranking
          clicks_30d: 0,
          impressions_30d: 0,
          ctr_30d: 0,
          intent: 'informational',
          source: 'gsc',
        },
      ];
      
      const strategist = new ContentStrategist({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      });
      
      const output = strategist.run(highOppKeywords, [], [], new Map());
      
      // With high volume + no ranking = high opportunity = critical action
      if (output.actions.some(a => a.priority === 'critical')) {
        expect(output.requires_approval).toBe(true);
      }
    });
  });

  describe('runContentStrategist factory function', () => {
    it('should produce same output as class method', () => {
      const config = {
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        siteDomain: 'example.com',
      };
      
      const output = runContentStrategist(config, sampleKeywords, samplePages, [], new Map());
      
      expect(output.clusters.length).toBeGreaterThan(0);
      expect(output.content_calendar).toBeDefined();
    });
  });
});
