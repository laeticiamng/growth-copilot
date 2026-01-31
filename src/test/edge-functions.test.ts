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
