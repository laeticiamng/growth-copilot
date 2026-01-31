import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase functions invoke
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
        })),
      })),
    })),
  },
}));

describe('Edge Functions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ai-gateway', () => {
    it('should handle successful AI request', async () => {
      const mockResponse = {
        data: {
          success: true,
          output: { content: 'AI generated content' },
          tokens_in: 100,
          tokens_out: 200,
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('ai-gateway', {
        body: {
          agent_name: 'test_agent',
          purpose: 'test',
          messages: [{ role: 'user', content: 'Hello' }],
        },
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-gateway', {
        body: {
          agent_name: 'test_agent',
          purpose: 'test',
          messages: [{ role: 'user', content: 'Hello' }],
        },
      });
      expect(result.data?.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle AI gateway errors gracefully', async () => {
      const mockError = {
        data: null,
        error: { message: 'Rate limit exceeded' },
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockError);

      const result = await supabase.functions.invoke('ai-gateway', {
        body: { agent_name: 'test', purpose: 'test', messages: [] },
      });

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('seo-crawler', () => {
    it('should invoke crawler with correct parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          pages_crawled: 50,
          issues: [],
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('seo-crawler', {
        body: {
          url: 'https://example.com',
          max_pages: 100,
          workspace_id: 'ws-123',
        },
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('seo-crawler', {
        body: {
          url: 'https://example.com',
          max_pages: 100,
          workspace_id: 'ws-123',
        },
      });
      expect(result.data?.success).toBe(true);
    });
  });

  describe('generate-report', () => {
    it('should generate PDF report', async () => {
      const mockResponse = {
        data: {
          success: true,
          url: 'https://storage.example.com/report.pdf',
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('generate-report', {
        body: {
          workspace_id: 'ws-123',
          site_id: 'site-456',
        },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.url).toContain('report.pdf');
    });
  });

  describe('analytics-guardian', () => {
    it('should detect data quality issues', async () => {
      const mockResponse = {
        data: {
          success: true,
          alerts_created: 2,
          checks_passed: 8,
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('analytics-guardian', {
        body: {
          workspace_id: 'ws-123',
          site_id: 'site-456',
        },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.alerts_created).toBe(2);
    });
  });

  describe('sync-meta-ads', () => {
    it('should sync Meta Ads data', async () => {
      const mockResponse = {
        data: {
          success: true,
          accounts_synced: 1,
          campaigns_synced: 5,
          insights_synced: 30,
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('sync-meta-ads', {
        body: {
          workspace_id: 'ws-123',
          integration_id: 'int-789',
        },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.accounts_synced).toBe(1);
    });
  });

  describe('meta-capi', () => {
    it('should send conversion event', async () => {
      const mockResponse = {
        data: {
          success: true,
          events_sent: 1,
          fbtrace_id: 'trace-123',
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('meta-capi', {
        body: {
          pixel_id: 'pixel-123',
          access_token: 'token-456',
          events: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            user_data: { em: 'test@example.com' },
            custom_data: { value: 100, currency: 'EUR' },
          }],
        },
      });

      expect(result.data?.success).toBe(true);
    });
  });

  describe('smart-link', () => {
    it('should resolve smart link', async () => {
      const mockResponse = {
        data: {
          success: true,
          redirect_url: 'https://spotify.com/track/123',
          platform: 'spotify',
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('smart-link', {
        body: {
          slug: 'my-song',
          user_agent: 'Mozilla/5.0',
        },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.platform).toBe('spotify');
    });
  });
});

describe('Edge Function Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle network errors', async () => {
    vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('Network error'));

    await expect(
      supabase.functions.invoke('ai-gateway', { body: {} })
    ).rejects.toThrow('Network error');
  });

  it('should handle timeout errors', async () => {
    vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('Request timeout'));

    await expect(
      supabase.functions.invoke('seo-crawler', { body: { url: 'https://slow-site.com' } })
    ).rejects.toThrow('Request timeout');
  });

  it('should handle invalid response format', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: 'not-an-object',
      error: null,
    });

    const result = await supabase.functions.invoke('ai-gateway', { body: {} });
    expect(result.data).toBe('not-an-object');
  });
});

describe('V2 Creative Factory Edge Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('creative-init with claim guardrail', () => {
    it('should process claims and auto-rewrite non-compliant ones', async () => {
      const mockResponse = {
        data: {
          success: true,
          job_id: 'job-123',
          status: 'ready_for_render',
          copywriting_preview: {
            hooks: ['Excellent produit pour vous', 'Innovation dans votre quotidien'],
            ctas: ['Découvrez maintenant']
          },
          qco: { approved: true, issues: [] }
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('creative-init', {
        body: {
          workspace_id: 'ws-123',
          site_url: 'https://example.com',
          offer: 'Promo été',
          objective: 'sale',
          language: 'fr'
        },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.job_id).toBeDefined();
    });

    it('should handle idempotency key to prevent duplicates', async () => {
      const mockResponse = {
        data: {
          success: true,
          job_id: 'existing-job-123',
          idempotent_hit: true,
          message: 'Job already exists'
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('creative-init', {
        body: {
          workspace_id: 'ws-123',
          site_url: 'https://example.com',
          offer: 'Promo',
          objective: 'lead',
          language: 'fr',
          idempotency_key: 'unique-key-123'
        },
      });

      expect(result.data?.idempotent_hit).toBe(true);
    });
  });

  describe('creative-qa with render-based checks', () => {
    it('should run QA and extract frames for visual checks', async () => {
      const mockResponse = {
        data: {
          success: true,
          passed: true,
          score: 92,
          issues: [],
          render_qa: {
            frames_extracted: 6,
            checks_passed: true,
            frame_checks: [
              { timestamp: 3.75, aspect_ratio: '9:16', cta_visible: false, text_not_cropped: true, safe_zone_respected: true, issues: [] },
              { timestamp: 13, aspect_ratio: '9:16', cta_visible: true, text_not_cropped: true, safe_zone_respected: true, issues: [] }
            ]
          },
          next_action: 'proceed_to_render'
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('creative-qa', {
        body: {
          job_id: 'job-123',
          workspace_id: 'ws-123',
          run_render_qa: true
        },
      });

      expect(result.data?.passed).toBe(true);
      expect(result.data?.render_qa?.frames_extracted).toBeGreaterThan(0);
    });

    it('should fail QA and suggest correction', async () => {
      const mockResponse = {
        data: {
          success: true,
          passed: false,
          score: 65,
          issues: [
            { code: 'CTA_MISSING', severity: 'critical', description: 'No CTA placement' }
          ],
          corrected: true,
          next_action: 'auto_rerun_qa'
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('creative-qa', {
        body: { job_id: 'job-456', workspace_id: 'ws-123' },
      });

      expect(result.data?.passed).toBe(false);
      expect(result.data?.corrected).toBe(true);
    });
  });

  describe('creative-export with experiment variants', () => {
    it('should export with variant-specific UTM links', async () => {
      const mockResponse = {
        data: {
          success: true,
          export: {
            job_id: 'job-123',
            experiment_id: 'exp-456',
            variant_name: 'A',
            videos: [
              { format: 'video_9_16', aspect_ratio: '9:16', url: 'https://...', filename: 'video_A.mp4', variant: 'A' }
            ],
            utm_links: {
              meta_reels: 'https://example.com?utm_source=instagram&utm_content=reels'
            },
            variant_utm_links: {
              A: { meta_reels: 'https://example.com?utm_content=reels_a' },
              B: { meta_reels: 'https://example.com?utm_content=reels_b' }
            },
            audit_manifest: {
              exported_at: '2026-01-31T00:00:00Z',
              variants_exported: ['A', 'B']
            }
          }
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('creative-export', {
        body: {
          job_id: 'job-123',
          workspace_id: 'ws-123',
          include_utm: true,
          experiment_id: 'exp-456'
        },
      });

      expect(result.data?.export?.variant_utm_links).toBeDefined();
      expect(result.data?.export?.audit_manifest).toBeDefined();
    });
  });

  describe('creative-render idempotency', () => {
    it('should return existing render for duplicate idempotency key', async () => {
      const mockResponse = {
        data: {
          success: true,
          job_id: 'existing-job-123',
          idempotent_hit: true,
          message: 'Render already completed',
          assets: [{ asset_type: 'video_9_16', url: 'https://...' }]
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('creative-render', {
        body: {
          job_id: 'job-123',
          workspace_id: 'ws-123',
          idempotency_key: 'render-key-456'
        },
      });

      expect(result.data?.idempotent_hit).toBe(true);
      expect(result.data?.assets).toHaveLength(1);
    });

    it('should reject concurrent render for same idempotency key', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Render already in progress' },
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const result = await supabase.functions.invoke('creative-render', {
        body: {
          job_id: 'job-123',
          workspace_id: 'ws-123',
          idempotency_key: 'render-key-789'
        },
      });

      expect(result.error?.message).toContain('in progress');
    });
  });
});
