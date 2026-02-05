import { describe, it, expect, vi } from 'vitest';
import {
  SEOTechAuditor,
   generateEmptyAuditResults,
} from '../seo-auditor';
import type { CrawlResult, SEOIssue } from '../types';

// Test fixture - creates a sample CrawlResult for testing
function createTestCrawlResult(): CrawlResult {
  return {
    pages_crawled: 50,
    pages_total: 60,
    issues: [
      {
        id: 'test-1',
        type: 'missing_title',
        severity: 'critical',
        title: 'Missing title',
        description: 'Page has no title',
        affected_urls: ['/page-1'],
        recommendation: 'Add a title tag',
        ice_score: 90,
        auto_fixable: false,
        fix_instructions: 'Edit the HTML to add a title tag',
      },
      {
        id: 'test-2',
        type: 'duplicate_meta',
        severity: 'high',
        title: 'Duplicate meta',
        description: 'Multiple pages share meta',
        affected_urls: ['/page-2', '/page-3'],
        recommendation: 'Make meta descriptions unique',
        ice_score: 75,
        auto_fixable: true,
      },
      {
        id: 'test-3',
        type: 'slow_page',
        severity: 'medium',
        title: 'Slow page',
        description: 'LCP > 2.5s',
        affected_urls: ['/page-4'],
        recommendation: 'Optimize images',
        ice_score: 60,
        auto_fixable: false,
      },
      {
        id: 'test-4',
        type: 'orphan_page',
        severity: 'low',
        title: 'Orphan page',
        description: 'No internal links',
        affected_urls: ['/page-5'],
        recommendation: 'Add internal links',
        ice_score: 30,
        auto_fixable: false,
      },
    ],
    errors: [],
    duration_ms: 1000,
  };
}

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-crawl-id' }, error: null })),
        })),
      })),
    })),
  },
}));

describe('SEOTechAuditor', () => {
   describe('generateEmptyAuditResults', () => {
     it('should return empty CrawlResult structure', () => {
       const result = generateEmptyAuditResults();
      
       expect(result.pages_crawled).toBe(0);
       expect(result.pages_total).toBe(0);
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
       expect(result.issues).toHaveLength(0);
      expect(result.errors).toBeDefined();
       expect(result.errors).toHaveLength(0);
       expect(result.duration_ms).toBe(0);
    });
   });

   describe('CrawlResult structure validation', () => {
     it('should validate issues with required fields', () => {
       const result = createTestCrawlResult();
      
      for (const issue of result.issues) {
        expect(issue.id).toBeDefined();
        expect(issue.type).toBeDefined();
        expect(issue.severity).toMatch(/^(critical|high|medium|low)$/);
        expect(issue.title).toBeDefined();
        expect(issue.description).toBeDefined();
        expect(issue.affected_urls).toBeDefined();
        expect(Array.isArray(issue.affected_urls)).toBe(true);
        expect(issue.recommendation).toBeDefined();
        expect(issue.ice_score).toBeGreaterThanOrEqual(0);
        expect(issue.ice_score).toBeLessThanOrEqual(100);
        expect(typeof issue.auto_fixable).toBe('boolean');
      }
    });
  });

  describe('SEOTechAuditor class', () => {
    it('should be instantiable with workspace and site IDs', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
      expect(auditor).toBeDefined();
    });

    it('should have generateArtifact that produces valid structure', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
       const mockResult = createTestCrawlResult();
      
      // Access private method through prototype for testing
      const artifact = (auditor as any).generateArtifact(mockResult);
      
      expect(artifact.summary).toBeDefined();
      expect(artifact.actions).toBeDefined();
      expect(artifact.risks).toBeDefined();
      expect(artifact.dependencies).toBeDefined();
      expect(artifact.metrics_to_watch).toBeDefined();
      expect(typeof artifact.requires_approval).toBe('boolean');
    });

    it('should map issue severity to action priority', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
      const mockResult: CrawlResult = {
        pages_crawled: 10,
        pages_total: 10,
        issues: [
          {
            id: 'test-1',
            type: 'missing_title',
            severity: 'critical',
            title: 'Test Critical Issue',
            description: 'Test description',
            affected_urls: ['/test'],
            recommendation: 'Fix it',
            ice_score: 90,
            auto_fixable: false,
          },
          {
            id: 'test-2',
            type: 'missing_meta',
            severity: 'low',
            title: 'Test Low Issue',
            description: 'Test description',
            affected_urls: ['/test2'],
            recommendation: 'Fix it',
            ice_score: 30,
            auto_fixable: true,
          },
        ],
        errors: [],
        duration_ms: 1000,
      };
      
      const artifact = (auditor as any).generateArtifact(mockResult);
      
      const criticalAction = artifact.actions.find((a: any) => a.id === 'test-1');
      const lowAction = artifact.actions.find((a: any) => a.id === 'test-2');
      
      expect(criticalAction.priority).toBe('critical');
      expect(lowAction.priority).toBe('low');
    });

    it('should set effort based on auto_fixable', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
      const mockResult: CrawlResult = {
        pages_crawled: 5,
        pages_total: 5,
        issues: [
          {
            id: 'auto-fix',
            type: 'test',
            severity: 'medium',
            title: 'Auto-fixable',
            description: 'Can be fixed automatically',
            affected_urls: ['/test'],
            recommendation: 'Fix',
            ice_score: 50,
            auto_fixable: true,
          },
          {
            id: 'manual-fix',
            type: 'test',
            severity: 'medium',
            title: 'Manual fix',
            description: 'Needs manual intervention',
            affected_urls: ['/test2'],
            recommendation: 'Fix manually',
            ice_score: 50,
            auto_fixable: false,
          },
        ],
        errors: [],
        duration_ms: 500,
      };
      
      const artifact = (auditor as any).generateArtifact(mockResult);
      
      const autoAction = artifact.actions.find((a: any) => a.id === 'auto-fix');
      const manualAction = artifact.actions.find((a: any) => a.id === 'manual-fix');
      
      expect(autoAction.effort).toBe('low');
      expect(manualAction.effort).toBe('medium');
    });

    it('should generate risks from critical issues', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
      const mockResult: CrawlResult = {
        pages_crawled: 5,
        pages_total: 5,
        issues: [
          {
            id: 'critical-1',
            type: 'http_error',
            severity: 'critical',
            title: 'Critical Error',
            description: 'Server error',
            affected_urls: ['/broken'],
            recommendation: 'Fix server',
            ice_score: 95,
            auto_fixable: false,
          },
        ],
        errors: [],
        duration_ms: 500,
      };
      
      const artifact = (auditor as any).generateArtifact(mockResult);
      
      expect(artifact.risks.length).toBe(1);
      expect(artifact.risks[0].id).toBe('critical-1');
      expect(artifact.risks[0].severity).toBe('critical');
    });

    it('should include standard metrics to watch', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
       const mockResult = createTestCrawlResult();
      
      const artifact = (auditor as any).generateArtifact(mockResult);
      
      expect(artifact.metrics_to_watch).toContain('Indexed pages count');
      expect(artifact.metrics_to_watch).toContain('Core Web Vitals');
      expect(artifact.metrics_to_watch).toContain('Crawl errors in GSC');
    });

    it('should get correct category from issue type', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
      
      expect((auditor as any).getCategoryFromType('missing_title')).toBe('content');
      expect((auditor as any).getCategoryFromType('http_error')).toBe('indexation');
      expect((auditor as any).getCategoryFromType('missing_schema')).toBe('structured_data');
      expect((auditor as any).getCategoryFromType('orphan_page')).toBe('architecture');
      expect((auditor as any).getCategoryFromType('slow_page')).toBe('performance');
      expect((auditor as any).getCategoryFromType('unknown_type')).toBe('other');
    });

    it('should get correct impact score from severity', () => {
      const auditor = new SEOTechAuditor('test-workspace', 'test-site');
      
      expect((auditor as any).getImpactScore('critical')).toBe(90);
      expect((auditor as any).getImpactScore('high')).toBe(70);
      expect((auditor as any).getImpactScore('medium')).toBe(50);
      expect((auditor as any).getImpactScore('low')).toBe(30);
      expect((auditor as any).getImpactScore('unknown')).toBe(50);
    });
  });

  describe('Issue severity distribution', () => {
     it('should correctly count severity distribution', () => {
       const result = createTestCrawlResult();
      
      const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
      
      for (const issue of result.issues) {
        severityCounts[issue.severity]++;
      }
      
       // Should have the expected distribution from our test fixture
       expect(severityCounts.critical).toBe(1);
       expect(severityCounts.high).toBe(1);
       expect(severityCounts.medium).toBe(1);
       expect(severityCounts.low).toBe(1);
      expect(severityCounts.critical).toBeGreaterThan(0);
      expect(severityCounts.high).toBeGreaterThan(0);
      expect(severityCounts.medium).toBeGreaterThan(0);
      expect(severityCounts.low).toBeGreaterThan(0);
    });
  });
});
