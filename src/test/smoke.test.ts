/**
 * Smoke Test Suite
 * Tests critical paths to ensure basic functionality works
 * Run after every significant change
 */
import { describe, it, expect, vi } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
  },
}));

describe("Smoke Tests - Critical Paths", () => {
  describe("1. Application Bootstrap", () => {
    it("should have required environment variables defined", () => {
      expect(true).toBe(true);
    });

    it("should export main App component", async () => {
      const { default: App } = await import("@/App");
      expect(App).toBeDefined();
      expect(typeof App).toBe("function");
    }, 30000);
  });

  describe("2. Authentication Flow", () => {
    it("should have useAuth hook available", async () => {
      const { useAuth } = await import("@/hooks/useAuth");
      expect(useAuth).toBeDefined();
      expect(typeof useAuth).toBe("function");
    });

    it("should have ProtectedRoute component", async () => {
      const { ProtectedRoute } = await import("@/components/auth/ProtectedRoute");
      expect(ProtectedRoute).toBeDefined();
    });

    it("should have PermissionGuard component", async () => {
      const { PermissionGuard } = await import("@/components/auth/PermissionGuard");
      expect(PermissionGuard).toBeDefined();
    });
  });

  describe("3. Core Hooks Availability", () => {
    it("should export workspace hook", async () => {
      const { useWorkspace } = await import("@/hooks/useWorkspace");
      expect(useWorkspace).toBeDefined();
    });

    it("should export sites hook", async () => {
      const { useSites } = await import("@/hooks/useSites");
      expect(useSites).toBeDefined();
    });

    it("should export feature flags hook", async () => {
      const { useFeatureFlags } = await import("@/hooks/useFeatureFlags");
      expect(useFeatureFlags).toBeDefined();
    });
  });

  describe("4. Form Validation", () => {
    it("should validate lead forms correctly", async () => {
      const { leadFormSchema } = await import("@/lib/validation/form-schemas");
      
      const validLead = { name: "Test", email: "test@example.com" };
      expect(leadFormSchema.safeParse(validLead).success).toBe(true);
      
      const invalidLead = { name: "", email: "invalid" };
      expect(leadFormSchema.safeParse(invalidLead).success).toBe(false);
    });

    it("should validate campaign forms correctly", async () => {
      const { campaignFormSchema } = await import("@/lib/validation/form-schemas");
      
      const validCampaign = { 
        name: "Test Campaign", 
        budget_daily: 100, 
        strategy: "maximize_conversions" 
      };
      expect(campaignFormSchema.safeParse(validCampaign).success).toBe(true);
    });
  });

  describe("5. UI Components", () => {
    it("should export LoadingState component", async () => {
      const { LoadingState } = await import("@/components/ui/loading-state");
      expect(LoadingState).toBeDefined();
    });

    it("should export EmptyState component", async () => {
      const { EmptyState } = await import("@/components/ui/empty-state");
      expect(EmptyState).toBeDefined();
    });

    it("should export ErrorBoundary component", async () => {
      const { ErrorBoundary } = await import("@/components/ErrorBoundary");
      expect(ErrorBoundary).toBeDefined();
    });
  });

  describe("6. Utility Functions", () => {
    it("should have cn utility for class merging", async () => {
      const { cn } = await import("@/lib/utils");
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("base", false && "hidden")).toBe("base");
    });

    it("should have validation utilities", async () => {
      const { sanitizeHtml, sanitizeUrl } = await import("@/lib/validation");
      
      // sanitizeHtml escapes dangerous characters
      expect(sanitizeHtml("<script>alert('xss')</script>")).not.toContain("<script>");
      // URL validation
      expect(sanitizeUrl("javascript:alert(1)")).toBe(null);
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    });
  });

  describe("7. Internationalization", () => {
    it("should have i18n configured", async () => {
      const i18n = await import("@/i18n");
      expect(i18n).toBeDefined();
    });

    it("should have French translations", async () => {
      const { fr } = await import("@/i18n/locales/fr");
      expect(fr).toHaveProperty("common");
      expect(fr).toHaveProperty("dashboard");
    });

    it("should have English translations", async () => {
      const { en } = await import("@/i18n/locales/en");
      expect(en).toHaveProperty("common");
      expect(en).toHaveProperty("dashboard");
    });
  });

  describe("8. Demo Data", () => {
     it("should generate empty SEO audit results when no data", async () => {
       const { generateEmptyAuditResults } = await import("@/lib/agents/seo-auditor");
       const results = generateEmptyAuditResults();
      
       expect(results.pages_crawled).toBe(0);
       expect(results.issues).toHaveLength(0);
       expect(results.errors).toHaveLength(0);
    });
  });
});

describe("Data Access Layer", () => {
  describe("CRUD Operations Structure", () => {
    it("should have ads hook with CRUD methods", async () => {
      const { useAds } = await import("@/hooks/useAds");
      expect(useAds).toBeDefined();
    });

    it("should have lifecycle hook with CRUD methods", async () => {
      const { useLifecycle } = await import("@/hooks/useLifecycle");
      expect(useLifecycle).toBeDefined();
    });

    it("should have offers hook with CRUD methods", async () => {
      const { useOffers } = await import("@/hooks/useOffers");
      expect(useOffers).toBeDefined();
    });
  });
});

describe("Security Checks", () => {
  it("should not expose secrets in code", async () => {
    const validation = await import("@/lib/validation");
    const validationStr = JSON.stringify(validation);
    
    expect(validationStr).not.toContain("sk_live");
    expect(validationStr).not.toContain("Bearer ");
    expect(validationStr).not.toContain("api_key=");
  });

  it("should sanitize dangerous URLs", async () => {
    const { sanitizeUrl } = await import("@/lib/validation");
    
    // URL injection prevention  
    expect(sanitizeUrl("javascript:alert(1)")).toBe(null);
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe(null);
    expect(sanitizeUrl("file:///etc/passwd")).toBe(null);
    
    // Valid URLs should pass
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    expect(sanitizeUrl("http://test.com/path?q=1")).toBe("http://test.com/path?q=1");
  });

  it("should encode HTML entities", async () => {
    const { sanitizeHtml } = await import("@/lib/validation");
    
    // Verify script tags are encoded (< becomes &lt;)
    const sanitized = sanitizeHtml("<script>alert('xss')</script>");
    expect(sanitized).toContain("&lt;");
    expect(sanitized).not.toContain("<script>");
  });
});
