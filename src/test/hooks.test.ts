import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null }))
    }
  }
}));

describe('Hooks - Data Layer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useContent', () => {
    it('exports expected interface', async () => {
      const { useContent, ContentProvider } = await import('@/hooks/useContent');
      expect(typeof useContent).toBe('function');
      expect(typeof ContentProvider).toBe('function');
    });
  });

  describe('useLocalSEO', () => {
    it('exports expected interface', async () => {
      const { useLocalSEO, LocalSEOProvider } = await import('@/hooks/useLocalSEO');
      expect(typeof useLocalSEO).toBe('function');
      expect(typeof LocalSEOProvider).toBe('function');
    });
  });

  describe('useAds', () => {
    it('exports expected interface', async () => {
      const { useAds, AdsProvider } = await import('@/hooks/useAds');
      expect(typeof useAds).toBe('function');
      expect(typeof AdsProvider).toBe('function');
    });
  });

  describe('useCRO', () => {
    it('exports expected interface', async () => {
      const { useCRO, CROProvider } = await import('@/hooks/useCRO');
      expect(typeof useCRO).toBe('function');
      expect(typeof CROProvider).toBe('function');
    });
  });

  describe('useCompetitors', () => {
    it('exports expected interface', async () => {
      const { useCompetitors, CompetitorsProvider } = await import('@/hooks/useCompetitors');
      expect(typeof useCompetitors).toBe('function');
      expect(typeof CompetitorsProvider).toBe('function');
    });
  });

  describe('useApprovals', () => {
    it('exports expected interface', async () => {
      const { useApprovals, ApprovalsProvider } = await import('@/hooks/useApprovals');
      expect(typeof useApprovals).toBe('function');
      expect(typeof ApprovalsProvider).toBe('function');
    });
  });
});

describe('Validation - Security Tests', () => {
  describe('Email validation', () => {
    it('rejects invalid emails', async () => {
      const { emailSchema } = await import('@/lib/validation');
      
      const invalidEmails = ['', 'invalid', 'test@', '@test.com', 'test@test'];
      
      for (const email of invalidEmails) {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      }
    });

    it('accepts valid emails', async () => {
      const { emailSchema } = await import('@/lib/validation');
      
      const validEmails = ['test@example.com', 'user.name@domain.org', 'contact@company.co.uk'];
      
      for (const email of validEmails) {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Password validation', () => {
    it('requires minimum length', async () => {
      const { passwordSchema } = await import('@/lib/validation');
      
      const result = passwordSchema.safeParse('Short1');
      expect(result.success).toBe(false);
    });

    it('requires mixed case and number', async () => {
      const { passwordSchema } = await import('@/lib/validation');
      
      // Missing uppercase
      expect(passwordSchema.safeParse('lowercase1').success).toBe(false);
      // Missing lowercase
      expect(passwordSchema.safeParse('UPPERCASE1').success).toBe(false);
      // Missing number
      expect(passwordSchema.safeParse('NoNumbers').success).toBe(false);
      // Valid password
      expect(passwordSchema.safeParse('ValidPass1').success).toBe(true);
    });
  });

  describe('URL sanitization', () => {
    it('rejects non-http protocols', async () => {
      const { sanitizeUrl } = await import('@/lib/validation');
      
      expect(sanitizeUrl('javascript:alert(1)')).toBe(null);
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe(null);
      expect(sanitizeUrl('file:///etc/passwd')).toBe(null);
    });

    it('accepts valid http(s) URLs', async () => {
      const { sanitizeUrl } = await import('@/lib/validation');
      
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://test.org/path?query=1')).toContain('http://test.org/path');
    });
  });

  describe('HTML sanitization', () => {
    it('escapes HTML entities', async () => {
      const { sanitizeHtml } = await import('@/lib/validation');
      
      const malicious = '<script>alert("xss")</script>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });
  });
});

describe('Workspace Schema Validation', () => {
  it('validates workspace names', async () => {
    const { workspaceSchema } = await import('@/lib/validation');
    
    // Too short
    expect(workspaceSchema.safeParse({ name: 'A', slug: 'aa' }).success).toBe(false);
    
    // Valid
    expect(workspaceSchema.safeParse({ name: 'My Workspace', slug: 'my-workspace' }).success).toBe(true);
    
    // Invalid slug (uppercase)
    expect(workspaceSchema.safeParse({ name: 'Valid', slug: 'UPPERCASE' }).success).toBe(false);
  });
});
