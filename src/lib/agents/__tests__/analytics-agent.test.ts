import { describe, it, expect } from 'vitest';
import {
  AnalyticsAgent,
  validateKPIData,
  calculateMoMChanges,
  generateAnalyticsActions,
  type KPISnapshot,
  type AnalyticsAgentOutput,
} from '../analytics-agent';

describe('AnalyticsAgent', () => {
  // Sample KPI data
  const healthyCurrentKpis: KPISnapshot = {
    period: '2026-01',
    organic_clicks: 5000,
    organic_impressions: 100000,
    organic_sessions: 4500,
    avg_position: 12.5,
    total_conversions: 150,
    total_leads: 80,
    revenue: 25000,
    ads_cost: 3000,
    ads_conversions: 45,
  };

  const healthyPreviousKpis: KPISnapshot = {
    period: '2025-12',
    organic_clicks: 4500,
    organic_impressions: 90000,
    organic_sessions: 4000,
    avg_position: 14.2,
    total_conversions: 120,
    total_leads: 60,
    revenue: 20000,
    ads_cost: 2500,
    ads_conversions: 35,
  };

  const connectedIntegrations: AnalyticsAgentOutput['integrations_status'] = {
    gsc: 'connected',
    ga4: 'connected',
    ads: 'connected',
  };

  const disconnectedIntegrations: AnalyticsAgentOutput['integrations_status'] = {
    gsc: 'disconnected',
    ga4: 'disconnected',
    ads: 'disconnected',
  };

  describe('validateKPIData', () => {
    it('should return healthy status for valid data', () => {
      const result = validateKPIData(healthyCurrentKpis, healthyPreviousKpis);
      
      expect(result.status).toBe('healthy');
      expect(result.alerts).toHaveLength(0);
    });

    it('should return critical status when no current data', () => {
      const result = validateKPIData(null, healthyPreviousKpis);
      
      expect(result.status).toBe('critical');
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].type).toBe('missing_data');
    });

    it('should detect zero clicks anomaly', () => {
      const anomalyData: KPISnapshot = {
        ...healthyCurrentKpis,
        organic_clicks: 0,
        organic_impressions: 50000,
      };
      
      const result = validateKPIData(anomalyData, healthyPreviousKpis);
      
      expect(result.alerts.some(a => a.id === 'zero_clicks_anomaly')).toBe(true);
    });

    it('should detect dramatic clicks drop', () => {
      const dropData: KPISnapshot = {
        ...healthyCurrentKpis,
        organic_clicks: 1000, // 77% drop from 4500
      };
      
      const result = validateKPIData(dropData, healthyPreviousKpis);
      
      expect(result.alerts.some(a => a.id === 'clicks_drop')).toBe(true);
      expect(result.alerts.find(a => a.id === 'clicks_drop')?.severity).toBe('critical');
    });

    it('should detect conversion drop', () => {
      const dropData: KPISnapshot = {
        ...healthyCurrentKpis,
        total_conversions: 30, // 75% drop from 120
      };
      
      const result = validateKPIData(dropData, healthyPreviousKpis);
      
      expect(result.alerts.some(a => a.id === 'conversions_drop')).toBe(true);
    });
  });

  describe('calculateMoMChanges', () => {
    it('should calculate positive changes correctly', () => {
      const changes = calculateMoMChanges(healthyCurrentKpis, healthyPreviousKpis);
      
      // Clicks: 5000 vs 4500 = +11.1%
      expect(changes.organic_clicks).toBeCloseTo(11.1, 0);
      
      // Conversions: 150 vs 120 = +25%
      expect(changes.total_conversions).toBeCloseTo(25, 0);
      
      // Revenue: 25000 vs 20000 = +25%
      expect(changes.revenue).toBeCloseTo(25, 0);
    });

    it('should handle position improvement (lower is better)', () => {
      const changes = calculateMoMChanges(healthyCurrentKpis, healthyPreviousKpis);
      
      // Position went from 14.2 to 12.5 (improvement)
      // Inverted: calcChange(14.2, 12.5) = +13.6%
      expect(changes.avg_position).toBeGreaterThan(0);
    });

    it('should return null changes when no previous data', () => {
      const changes = calculateMoMChanges(healthyCurrentKpis, null);
      
      expect(changes.organic_clicks).toBeNull();
      expect(changes.total_conversions).toBeNull();
    });

    it('should return null changes when no current data', () => {
      const changes = calculateMoMChanges(null, healthyPreviousKpis);
      
      expect(changes.organic_clicks).toBeNull();
    });

    it('should handle zero previous value', () => {
      const zeroData: KPISnapshot = {
        ...healthyPreviousKpis,
        organic_clicks: 0,
      };
      
      const changes = calculateMoMChanges(healthyCurrentKpis, zeroData);
      
      // When previous is 0 and current > 0, return 100%
      expect(changes.organic_clicks).toBe(100);
    });
  });

  describe('generateAnalyticsActions', () => {
    it('should recommend connecting GSC when disconnected', () => {
      const actions = generateAnalyticsActions(
        healthyCurrentKpis,
        healthyPreviousKpis,
        [],
        disconnectedIntegrations
      );
      
      const gscAction = actions.find(a => a.id === 'connect_gsc');
      expect(gscAction).toBeDefined();
      expect(gscAction?.priority).toBe('critical');
    });

    it('should recommend connecting GA4 when disconnected', () => {
      const actions = generateAnalyticsActions(
        healthyCurrentKpis,
        healthyPreviousKpis,
        [],
        disconnectedIntegrations
      );
      
      const ga4Action = actions.find(a => a.id === 'connect_ga4');
      expect(ga4Action).toBeDefined();
      expect(ga4Action?.priority).toBe('high');
    });

    it('should create actions for critical data quality alerts', () => {
      const criticalAlert = {
        id: 'test_critical',
        type: 'tracking_broken' as const,
        severity: 'critical' as const,
        title: 'Tracking cassé',
        description: 'Le tracking GA4 ne fonctionne plus',
        metric_name: 'sessions',
        expected_value: 5000,
        actual_value: 0,
        date_range: { start: '2026-01-01', end: '2026-01-31' },
      };
      
      const actions = generateAnalyticsActions(
        healthyCurrentKpis,
        healthyPreviousKpis,
        [criticalAlert],
        connectedIntegrations
      );
      
      const fixAction = actions.find(a => a.id === 'fix_test_critical');
      expect(fixAction).toBeDefined();
      expect(fixAction?.priority).toBe('critical');
    });

    it('should recommend capitalizing on traffic growth', () => {
      const highGrowthCurrent: KPISnapshot = {
        ...healthyCurrentKpis,
        organic_clicks: 7000, // +55% vs 4500
      };
      
      const actions = generateAnalyticsActions(
        highGrowthCurrent,
        healthyPreviousKpis,
        [],
        connectedIntegrations
      );
      
      const growthAction = actions.find(a => a.id === 'capitalize_traffic_growth');
      expect(growthAction).toBeDefined();
    });

    it('should recommend investigating conversion drops', () => {
      const lowConversionCurrent: KPISnapshot = {
        ...healthyCurrentKpis,
        total_conversions: 90, // -25% vs 120
      };
      
      const actions = generateAnalyticsActions(
        lowConversionCurrent,
        healthyPreviousKpis,
        [],
        connectedIntegrations
      );
      
      const investigateAction = actions.find(a => a.id === 'investigate_conversion_drop');
      expect(investigateAction).toBeDefined();
      expect(investigateAction?.priority).toBe('high');
    });

    it('should sort actions by ICE score', () => {
      const actions = generateAnalyticsActions(
        healthyCurrentKpis,
        healthyPreviousKpis,
        [],
        disconnectedIntegrations
      );
      
      // Verify sorted by ICE score descending
      for (let i = 1; i < actions.length; i++) {
        expect(actions[i - 1].ice_score).toBeGreaterThanOrEqual(actions[i].ice_score);
      }
    });
  });

  describe('AnalyticsAgent.run', () => {
    it('should produce valid output with all integrations connected', async () => {
      const agent = new AnalyticsAgent({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
        month: '2026-01',
      });
      
      const output = await agent.run(
        healthyCurrentKpis,
        healthyPreviousKpis,
        connectedIntegrations
      );
      
      expect(output.summary).toBeTruthy();
      expect(output.data_quality_status).toBe('healthy');
      expect(output.mom_changes.organic_clicks).toBeDefined();
      expect(output.dependencies).toHaveLength(0);
    });

    it('should produce output with missing data warning', async () => {
      const agent = new AnalyticsAgent({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
      });
      
      const output = await agent.run(
        null,
        null,
        disconnectedIntegrations
      );
      
      expect(output.data_quality_status).toBe('critical');
      expect(output.data_quality_alerts.length).toBeGreaterThan(0);
      expect(output.dependencies).toContain('integration:gsc');
      expect(output.dependencies).toContain('integration:ga4');
    });

    it('should set requires_approval for critical actions', async () => {
      const agent = new AnalyticsAgent({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
      });
      
      const output = await agent.run(
        healthyCurrentKpis,
        healthyPreviousKpis,
        disconnectedIntegrations // Will create critical "connect GSC" action
      );
      
      expect(output.requires_approval).toBe(true);
    });

    it('should include metrics_to_watch', async () => {
      const agent = new AnalyticsAgent({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
      });
      
      const output = await agent.run(
        healthyCurrentKpis,
        healthyPreviousKpis,
        connectedIntegrations
      );
      
      expect(output.metrics_to_watch).toContain('organic_clicks');
      expect(output.metrics_to_watch).toContain('total_conversions');
      expect(output.metrics_to_watch).toContain('revenue');
    });

    it('should add risks for critical data quality issues', async () => {
      const agent = new AnalyticsAgent({
        workspaceId: 'test-workspace',
        siteId: 'test-site',
      });
      
      // Create data that will trigger critical alert
      const badData: KPISnapshot = {
        ...healthyCurrentKpis,
        organic_clicks: 500, // ~89% drop
      };
      
      const output = await agent.run(
        badData,
        healthyPreviousKpis,
        connectedIntegrations
      );
      
      expect(output.risks.length).toBeGreaterThan(0);
    });
  });
});
