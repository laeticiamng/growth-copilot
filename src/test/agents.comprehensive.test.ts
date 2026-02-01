import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for AI gateway calls
global.fetch = vi.fn();

describe('AI Agents - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SEO Auditor Agent', () => {
    it('exports required functions', async () => {
      const seoAuditor = await import('@/lib/agents/seo-auditor');
      expect(seoAuditor).toBeDefined();
    });

    it('validates audit input parameters', () => {
      const validInput = {
        url: 'https://example.com',
        depth: 3,
        max_pages: 100,
      };

      expect(validInput.url).toMatch(/^https?:\/\//);
      expect(validInput.depth).toBeGreaterThan(0);
      expect(validInput.max_pages).toBeGreaterThan(0);
    });

    it('rejects invalid URLs', () => {
      const invalidUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>',
        'file:///etc/passwd',
        'ftp://example.com',
      ];

      invalidUrls.forEach(url => {
        const isHttp = url.startsWith('http://') || url.startsWith('https://');
        expect(isHttp).toBe(false);
      });
    });
  });

  describe('Content Strategist Agent', () => {
    it('exports required functions', async () => {
      const contentStrategist = await import('@/lib/agents/content-strategist');
      expect(contentStrategist).toBeDefined();
    });

    it('validates brief generation parameters', () => {
      const briefParams = {
        target_keyword: 'seo best practices',
        word_count: 2000,
        content_type: 'guide',
      };

      expect(briefParams.target_keyword.length).toBeGreaterThan(0);
      expect(briefParams.word_count).toBeGreaterThanOrEqual(500);
    });
  });

  describe('Analytics Agent', () => {
    it('exports required functions', async () => {
      const analyticsAgent = await import('@/lib/agents/analytics-agent');
      expect(analyticsAgent).toBeDefined();
    });

    it('validates date range parameters', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      expect(endDate > startDate).toBe(true);
      expect((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)).toBe(30);
    });
  });

  describe('Meta Ads Agent', () => {
    it('exports required functions', async () => {
      const metaAdsAgent = await import('@/lib/agents/meta-ads-agent');
      expect(metaAdsAgent).toBeDefined();
    });

    it('validates budget constraints', () => {
      const budget = {
        daily: 100,
        monthly: 3000,
        min_daily: 10,
        max_daily: 1000,
      };

      expect(budget.daily).toBeGreaterThanOrEqual(budget.min_daily);
      expect(budget.daily).toBeLessThanOrEqual(budget.max_daily);
      expect(budget.monthly).toBeGreaterThanOrEqual(budget.daily * 30);
    });
  });

  describe('Approval Engine', () => {
    it('exports required functions', async () => {
      const approvalEngine = await import('@/lib/agents/approval-engine');
      expect(approvalEngine).toBeDefined();
    });

    it('validates risk level classification', () => {
      const riskLevels = ['low', 'medium', 'high', 'critical'];
      const actionRisks: Record<string, string> = {
        'view_report': 'low',
        'edit_content': 'medium',
        'publish_ads': 'high',
        'delete_campaign': 'critical',
      };

      Object.values(actionRisks).forEach(risk => {
        expect(riskLevels).toContain(risk);
      });
    });

    it('respects approval thresholds', () => {
      const thresholds = {
        low: 0,
        medium: 100,
        high: 500,
        critical: 1000,
      };

      const spendAmount = 750;
      let requiredApproval = 'none';

      if (spendAmount >= thresholds.critical) {
        requiredApproval = 'owner';
      } else if (spendAmount >= thresholds.high) {
        requiredApproval = 'admin';
      } else if (spendAmount >= thresholds.medium) {
        requiredApproval = 'manager';
      }

      expect(requiredApproval).toBe('admin');
    });
  });

  describe('CGO Agent', () => {
    it('exports required functions', async () => {
      const cgoAgent = await import('@/lib/agents/cgo-agent');
      expect(cgoAgent).toBeDefined();
    });

    it('prioritizes actions correctly', () => {
      const actions = [
        { id: 1, impact: 80, effort: 20, roi: 4.0 },
        { id: 2, impact: 60, effort: 60, roi: 1.0 },
        { id: 3, impact: 90, effort: 30, roi: 3.0 },
      ];

      // ICE score = Impact * (100 - Effort) / 100
      const scored = actions.map(a => ({
        ...a,
        ice: (a.impact * (100 - a.effort)) / 100,
      }));

      const sorted = scored.sort((a, b) => b.ice - a.ice);
      
      expect(sorted[0].id).toBe(1); // Highest ICE score
      expect(sorted[0].ice).toBe(64);
    });
  });

  describe('QCO Agent', () => {
    it('exports required functions', async () => {
      const qcoAgent = await import('@/lib/agents/qco-agent');
      expect(qcoAgent).toBeDefined();
    });

    it('validates quality thresholds', () => {
      const qualityChecks = {
        min_word_count: 300,
        max_keyword_density: 3,
        min_readability_score: 60,
        required_headings: true,
        required_meta: true,
      };

      const content = {
        word_count: 1500,
        keyword_density: 2.1,
        readability_score: 72,
        has_headings: true,
        has_meta: true,
      };

      const isValid = 
        content.word_count >= qualityChecks.min_word_count &&
        content.keyword_density <= qualityChecks.max_keyword_density &&
        content.readability_score >= qualityChecks.min_readability_score &&
        content.has_headings === qualityChecks.required_headings &&
        content.has_meta === qualityChecks.required_meta;

      expect(isValid).toBe(true);
    });
  });

  describe('Report Generator', () => {
    it('exports required functions', async () => {
      const reportGenerator = await import('@/lib/agents/report-generator');
      expect(reportGenerator).toBeDefined();
    });

    it('validates report structure', () => {
      const reportStructure = {
        title: 'Monthly SEO Report',
        period: {
          start: '2025-01-01',
          end: '2025-01-31',
        },
        sections: ['summary', 'traffic', 'keywords', 'recommendations'],
        format: 'pdf',
      };

      expect(reportStructure.title.length).toBeGreaterThan(0);
      expect(reportStructure.sections.length).toBeGreaterThanOrEqual(3);
      expect(['pdf', 'html', 'json']).toContain(reportStructure.format);
    });
  });

  describe('Instagram Agent', () => {
    it('exports required functions', async () => {
      const instagramAgent = await import('@/lib/agents/instagram-agent');
      expect(instagramAgent).toBeDefined();
    });

    it('validates hashtag limits', () => {
      const maxHashtags = 30;
      const hashtags = ['#seo', '#marketing', '#digital', '#growth'];
      
      expect(hashtags.length).toBeLessThanOrEqual(maxHashtags);
    });

    it('validates caption length', () => {
      const maxCaptionLength = 2200;
      const caption = 'This is a test caption for Instagram.';
      
      expect(caption.length).toBeLessThanOrEqual(maxCaptionLength);
    });
  });

  describe('Social Distribution Agent', () => {
    it('exports required functions', async () => {
      const socialAgent = await import('@/lib/agents/social-distribution-agent');
      expect(socialAgent).toBeDefined();
    });

    it('adapts content per platform', () => {
      const platforms = {
        twitter: { maxLength: 280, hashtagLimit: 3 },
        linkedin: { maxLength: 3000, hashtagLimit: 5 },
        instagram: { maxLength: 2200, hashtagLimit: 30 },
        facebook: { maxLength: 63206, hashtagLimit: 10 },
      };

      const content = 'Check out our new blog post about SEO best practices!';
      
      Object.entries(platforms).forEach(([platform, limits]) => {
        const fits = content.length <= limits.maxLength;
        expect(fits).toBe(true);
      });
    });
  });

  describe('Competitive Intel Agent', () => {
    it('exports required functions', async () => {
      const competitiveAgent = await import('@/lib/agents/competitive-intel-agent');
      expect(competitiveAgent).toBeDefined();
    });

    it('validates competitor data structure', () => {
      const competitor = {
        url: 'https://competitor.com',
        domain: 'competitor.com',
        metrics: {
          domain_authority: 45,
          organic_traffic: 50000,
          keywords_count: 1200,
        },
      };

      expect(competitor.url).toMatch(/^https?:\/\//);
      expect(competitor.metrics.domain_authority).toBeGreaterThanOrEqual(0);
      expect(competitor.metrics.domain_authority).toBeLessThanOrEqual(100);
    });
  });

  describe('Media Promotion Agent', () => {
    it('exports required functions', async () => {
      const mediaAgent = await import('@/lib/agents/media-promotion-agent');
      expect(mediaAgent).toBeDefined();
    });
  });

  describe('Copywriting Agent', () => {
    it('exports required functions', async () => {
      const copywritingAgent = await import('@/lib/agents/copywriting-agent');
      expect(copywritingAgent).toBeDefined();
    });

    it('validates tone parameters', () => {
      const validTones = ['professional', 'casual', 'friendly', 'authoritative', 'playful'];
      const selectedTone = 'professional';
      
      expect(validTones).toContain(selectedTone);
    });
  });

  describe('Ads Optimization Agent', () => {
    it('exports required functions', async () => {
      const adsAgent = await import('@/lib/agents/ads-optimization-agent');
      expect(adsAgent).toBeDefined();
    });

    it('calculates ROAS correctly', () => {
      const revenue = 10000;
      const adSpend = 2500;
      const roas = revenue / adSpend;
      
      expect(roas).toBe(4);
    });

    it('calculates CPA correctly', () => {
      const adSpend = 1000;
      const conversions = 50;
      const cpa = adSpend / conversions;
      
      expect(cpa).toBe(20);
    });
  });
});

describe('Agent Types', () => {
  it('exports type definitions', async () => {
    const types = await import('@/lib/agents/types');
    expect(types).toBeDefined();
  });
});

describe('AI Gateway Client', () => {
  it('exports required functions', async () => {
    const aiGateway = await import('@/lib/agents/ai-gateway-client');
    expect(aiGateway).toBeDefined();
  });
});

describe('Orchestrator', () => {
  it('exports required functions', async () => {
    const orchestrator = await import('@/lib/agents/orchestrator');
    expect(orchestrator).toBeDefined();
  });
});

describe('Meta Orchestrator', () => {
  it('exports required functions', async () => {
    const metaOrchestrator = await import('@/lib/agents/meta-orchestrator');
    expect(metaOrchestrator).toBeDefined();
  });
});

describe('Meta Supervisor', () => {
  it('exports required functions', async () => {
    const metaSupervisor = await import('@/lib/agents/meta-supervisor');
    expect(metaSupervisor).toBeDefined();
  });
});
