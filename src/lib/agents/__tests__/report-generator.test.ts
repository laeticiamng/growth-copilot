import { describe, it, expect } from 'vitest';
import {
  ReportGenerator,
  generateExecutiveSummary,
  buildKPISummary,
  generateHTMLReport,
  generateReport,
  type CompletedAction,
  type NextMonthPriority,
} from '../report-generator';
import type { KPISnapshot, DataQualityAlert } from '../analytics-agent';

describe('ReportGenerator', () => {
  // Sample data
  const currentKpis: KPISnapshot = {
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

  const previousKpis: KPISnapshot = {
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

  const completedActions: CompletedAction[] = [
    {
      date: '2026-01-05',
      type: 'SEO_FIX',
      description: 'Correction des balises title dupliquées',
      result: 'success',
    },
    {
      date: '2026-01-12',
      type: 'CONTENT_PUBLISHED',
      description: 'Publication article "Guide complet SEO 2026"',
      result: 'success',
    },
  ];

  const openIssues: NextMonthPriority[] = [
    {
      title: 'Optimiser les Core Web Vitals',
      priority: 'high',
      impact_score: 85,
      category: 'seo_tech',
    },
    {
      title: 'Créer 5 nouveaux contenus',
      priority: 'medium',
      impact_score: 70,
      category: 'content',
    },
  ];

  const dataQualityAlerts: DataQualityAlert[] = [];

  const config = {
    workspaceId: 'test-workspace',
    siteId: 'test-site',
    siteName: 'Mon Site',
    siteDomain: 'example.com',
    month: '2026-01',
  };

  describe('generateExecutiveSummary', () => {
    it('should generate summary with positive changes', () => {
      const summary = generateExecutiveSummary(currentKpis, previousKpis, 2, 3, 0);
      
      expect(summary).toContain('augmenté');
      expect(summary).toContain('action');
      expect(summary).toContain('problème');
    });

    it('should handle negative changes', () => {
      const declineCurrent: KPISnapshot = {
        ...currentKpis,
        organic_clicks: 3000, // -33% vs 4500
        total_conversions: 80, // -33% vs 120
      };
      
      const summary = generateExecutiveSummary(declineCurrent, previousKpis, 0, 0, 0);
      
      expect(summary).toContain('diminué');
    });

    it('should handle missing current data', () => {
      const summary = generateExecutiveSummary(null, previousKpis, 0, 0, 0);
      
      expect(summary).toContain('Données insuffisantes');
    });

    it('should mention data quality alerts', () => {
      const summary = generateExecutiveSummary(currentKpis, previousKpis, 0, 0, 3);
      
      expect(summary).toContain('alerte');
      expect(summary).toContain('3');
    });

    it('should handle stable period with no changes', () => {
      const summary = generateExecutiveSummary(currentKpis, null, 0, 0, 0);
      
      // Without previous data, should just show available data message
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe('buildKPISummary', () => {
    it('should build summary with all metrics', () => {
      const summary = buildKPISummary(currentKpis, previousKpis);
      
      expect(summary.length).toBeGreaterThan(0);
      
      const clicksRow = summary.find(s => s.metric === 'Clics organiques');
      expect(clicksRow).toBeDefined();
      expect(clicksRow?.change).toContain('+');
      expect(clicksRow?.trend).toBe('up');
    });

    it('should return empty array when no current data', () => {
      const summary = buildKPISummary(null, previousKpis);
      
      expect(summary).toHaveLength(0);
    });

    it('should format large numbers correctly', () => {
      const largeKpis: KPISnapshot = {
        ...currentKpis,
        organic_impressions: 2500000,
        revenue: 150000,
      };
      
      const summary = buildKPISummary(largeKpis, previousKpis);
      
      const impressionsRow = summary.find(s => s.metric === 'Impressions');
      expect(impressionsRow?.current).toContain('M');
      
      const revenueRow = summary.find(s => s.metric === 'Revenu');
      expect(revenueRow?.current).toContain('k');
    });

    it('should show trend correctly', () => {
      const declineKpis: KPISnapshot = {
        ...currentKpis,
        organic_clicks: 3000, // Down from 4500
      };
      
      const summary = buildKPISummary(declineKpis, previousKpis);
      
      const clicksRow = summary.find(s => s.metric === 'Clics organiques');
      expect(clicksRow?.trend).toBe('down');
      expect(clicksRow?.change).toContain('-');
    });

    it('should handle position metric (lower is better)', () => {
      const summary = buildKPISummary(currentKpis, previousKpis);
      
      const positionRow = summary.find(s => s.metric === 'Position moyenne');
      expect(positionRow).toBeDefined();
      // Position improved from 14.2 to 12.5, so should be up (improvement)
      expect(positionRow?.trend).toBe('up');
    });
  });

  describe('generateHTMLReport', () => {
    it('should generate valid HTML', () => {
      const kpiSummary = buildKPISummary(currentKpis, previousKpis);
      const html = generateHTMLReport(
        config,
        'Test summary',
        kpiSummary,
        completedActions,
        openIssues,
        dataQualityAlerts
      );
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should include site info', () => {
      const html = generateHTMLReport(
        config,
        'Test summary',
        buildKPISummary(currentKpis, previousKpis),
        completedActions,
        openIssues,
        dataQualityAlerts
      );
      
      expect(html).toContain(config.siteName);
      expect(html).toContain(config.siteDomain);
    });

    it('should include KPI cards', () => {
      const html = generateHTMLReport(
        config,
        'Test summary',
        buildKPISummary(currentKpis, previousKpis),
        completedActions,
        openIssues,
        dataQualityAlerts
      );
      
      expect(html).toContain('kpi-card');
      expect(html).toContain('Clics organiques');
    });

    it('should include completed actions', () => {
      const html = generateHTMLReport(
        config,
        'Test summary',
        buildKPISummary(currentKpis, previousKpis),
        completedActions,
        openIssues,
        dataQualityAlerts
      );
      
      expect(html).toContain('Correction des balises title');
      expect(html).toContain('SEO_FIX');
    });

    it('should include next month priorities', () => {
      const html = generateHTMLReport(
        config,
        'Test summary',
        buildKPISummary(currentKpis, previousKpis),
        completedActions,
        openIssues,
        dataQualityAlerts
      );
      
      expect(html).toContain('Core Web Vitals');
      expect(html).toContain('HIGH');
    });

    it('should include data quality alerts when present', () => {
      const alerts: DataQualityAlert[] = [
        {
          id: 'test_alert',
          type: 'tracking_broken',
          severity: 'high',
          title: 'Tracking cassé',
          description: 'Le tracking ne fonctionne pas',
          metric_name: 'sessions',
          expected_value: 5000,
          actual_value: 0,
          date_range: { start: '2026-01-01', end: '2026-01-31' },
        },
      ];
      
      const html = generateHTMLReport(
        config,
        'Test summary',
        buildKPISummary(currentKpis, previousKpis),
        completedActions,
        openIssues,
        alerts
      );
      
      expect(html).toContain('Tracking cassé');
      expect(html).toContain('Alertes Qualité de Données');
    });

    it('should show empty states when no data', () => {
      const html = generateHTMLReport(
        config,
        'Test summary',
        [],
        [],
        [],
        []
      );
      
      expect(html).toContain('Aucune donnée KPI disponible');
      expect(html).toContain('Aucune action enregistrée');
    });
  });

  describe('ReportGenerator.generate', () => {
    it('should produce valid output structure', () => {
      const generator = new ReportGenerator(config);
      const output = generator.generate(
        currentKpis,
        previousKpis,
        completedActions,
        openIssues,
        dataQualityAlerts
      );
      
      expect(output.report_id).toBeDefined();
      expect(output.month).toBe('2026-01');
      expect(output.site.name).toBe('Mon Site');
      expect(output.executive_summary).toBeTruthy();
      expect(output.kpi_summary.length).toBeGreaterThan(0);
      expect(output.html_content).toContain('<!DOCTYPE html>');
    });

    it('should include actions from artifact schema', () => {
      const generator = new ReportGenerator(config);
      const output = generator.generate(
        null, // No data
        null,
        [],
        openIssues,
        []
      );
      
      // Should have action to connect data sources
      expect(output.actions.some(a => a.id === 'connect_data_sources')).toBe(true);
    });

    it('should include risks from data quality alerts', () => {
      const criticalAlerts: DataQualityAlert[] = [
        {
          id: 'critical_alert',
          type: 'tracking_broken',
          severity: 'critical',
          title: 'Tracking totalement cassé',
          description: 'Aucune donnée depuis 7 jours',
          metric_name: 'all',
          expected_value: null,
          actual_value: null,
          date_range: { start: '2026-01-01', end: '2026-01-31' },
        },
      ];
      
      const generator = new ReportGenerator(config);
      const output = generator.generate(
        currentKpis,
        previousKpis,
        [],
        [],
        criticalAlerts
      );
      
      expect(output.risks.length).toBeGreaterThan(0);
      expect(output.risks[0].severity).toBe('critical');
    });

    it('should limit next month priorities to 5', () => {
      const manyIssues: NextMonthPriority[] = Array.from({ length: 10 }, (_, i) => ({
        title: `Issue ${i + 1}`,
        priority: 'medium' as const,
        impact_score: 50,
        category: 'test',
      }));
      
      const generator = new ReportGenerator(config);
      const output = generator.generate(
        currentKpis,
        previousKpis,
        [],
        manyIssues,
        []
      );
      
      expect(output.next_month_priorities.length).toBeLessThanOrEqual(5);
    });

    it('should set requires_approval to false (reports are read-only)', () => {
      const generator = new ReportGenerator(config);
      const output = generator.generate(
        currentKpis,
        previousKpis,
        [],
        [],
        []
      );
      
      expect(output.requires_approval).toBe(false);
    });
  });

  describe('generateReport factory function', () => {
    it('should produce same output as class method', () => {
      const output = generateReport(
        config,
        currentKpis,
        previousKpis,
        completedActions,
        openIssues,
        dataQualityAlerts
      );
      
      expect(output.month).toBe('2026-01');
      expect(output.html_content).toContain('<!DOCTYPE html>');
    });
  });
});
