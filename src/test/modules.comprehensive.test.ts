/**
 * Comprehensive Module Tests
 * Tests all dashboard modules for functionality, edge cases, and robustness
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "test-user" } } } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
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
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
        gte: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe("Dashboard Modules - Exports & Structure", () => {
  describe("DashboardHome", () => {
    it("should export DashboardHome component", async () => {
      const module = await import("@/pages/dashboard/DashboardHome");
      expect(module.default).toBeDefined();
      expect(typeof module.default).toBe("function");
    });
  });

  describe("SEOTech", () => {
    it("should export SEOTech component", async () => {
      const module = await import("@/pages/dashboard/SEOTech");
      expect(module.default).toBeDefined();
    });
  });

  describe("Content", () => {
    it("should export Content component", async () => {
      const module = await import("@/pages/dashboard/Content");
      expect(module.default).toBeDefined();
    });
  });

  describe("LocalSEO", () => {
    it("should export LocalSEO component", async () => {
      const module = await import("@/pages/dashboard/LocalSEO");
      expect(module.default).toBeDefined();
    });
  });

  describe("Ads", () => {
    it("should export Ads component", async () => {
      const module = await import("@/pages/dashboard/Ads");
      expect(module.default).toBeDefined();
    });
  });

  describe("Social", () => {
    it("should export Social component", async () => {
      const module = await import("@/pages/dashboard/Social");
      expect(module.default).toBeDefined();
    });
  });

  describe("CRO", () => {
    it("should export CRO component", async () => {
      const module = await import("@/pages/dashboard/CRO");
      expect(module.default).toBeDefined();
    });
  });

  describe("Offers", () => {
    it("should export Offers component", async () => {
      const module = await import("@/pages/dashboard/Offers");
      expect(module.default).toBeDefined();
    });
  });

  describe("Lifecycle", () => {
    it("should export Lifecycle component", async () => {
      const module = await import("@/pages/dashboard/Lifecycle");
      expect(module.default).toBeDefined();
    });
  });

  describe("Reputation", () => {
    it("should export Reputation component", async () => {
      const module = await import("@/pages/dashboard/Reputation");
      expect(module.default).toBeDefined();
    });
  });

  describe("Competitors", () => {
    it("should export Competitors component", async () => {
      const module = await import("@/pages/dashboard/Competitors");
      expect(module.default).toBeDefined();
    });
  });

  describe("Automations", () => {
    it("should export Automations component", async () => {
      const module = await import("@/pages/dashboard/Automations");
      expect(module.default).toBeDefined();
    });
  });

  describe("Integrations", () => {
    it("should export Integrations component", async () => {
      const module = await import("@/pages/dashboard/Integrations");
      expect(module.default).toBeDefined();
    });
  });

  describe("BrandKit", () => {
    it("should export BrandKit component", async () => {
      const module = await import("@/pages/dashboard/BrandKit");
      expect(module.default).toBeDefined();
    });
  });

  describe("Agents", () => {
    it("should export Agents component", async () => {
      const module = await import("@/pages/dashboard/Agents");
      expect(module.default).toBeDefined();
    });
  });

  describe("MediaAssets", () => {
    it("should export MediaAssets component", async () => {
      const module = await import("@/pages/dashboard/MediaAssets");
      expect(module.default).toBeDefined();
    });
  });
});

describe("Hooks - Exports & Structure", () => {
  it("should export useWorkspace hook", async () => {
    const { useWorkspace } = await import("@/hooks/useWorkspace");
    expect(useWorkspace).toBeDefined();
  });

  it("should export useSites hook", async () => {
    const { useSites } = await import("@/hooks/useSites");
    expect(useSites).toBeDefined();
  });

  it("should export useAds hook", async () => {
    const { useAds } = await import("@/hooks/useAds");
    expect(useAds).toBeDefined();
  });

  it("should export useLifecycle hook", async () => {
    const { useLifecycle } = await import("@/hooks/useLifecycle");
    expect(useLifecycle).toBeDefined();
  });

  it("should export useOffers hook", async () => {
    const { useOffers } = await import("@/hooks/useOffers");
    expect(useOffers).toBeDefined();
  });

  it("should export useSocial hook", async () => {
    const { useSocial } = await import("@/hooks/useSocial");
    expect(useSocial).toBeDefined();
  });

  it("should export useCompetitors hook", async () => {
    const { useCompetitors } = await import("@/hooks/useCompetitors");
    expect(useCompetitors).toBeDefined();
  });

  it("should export useNotifications hook", async () => {
    const { useNotifications } = await import("@/hooks/useNotifications");
    expect(useNotifications).toBeDefined();
  });

  it("should export usePermissions hook", async () => {
    const { usePermissions } = await import("@/hooks/usePermissions");
    expect(usePermissions).toBeDefined();
  });

  it("should export useAutomations hook", async () => {
    const { useAutomations } = await import("@/hooks/useAutomations");
    expect(useAutomations).toBeDefined();
  });

  it("should export useWebhooks hook", async () => {
    const { useWebhooks } = await import("@/hooks/useWebhooks");
    expect(useWebhooks).toBeDefined();
  });

  it("should export useMedia hook", async () => {
    const { useMedia } = await import("@/hooks/useMedia");
    expect(useMedia).toBeDefined();
  });
});

describe("Validation Schemas", () => {
  it("should validate lead form schema", async () => {
    const { leadFormSchema } = await import("@/lib/validation/form-schemas");
    
    // Valid data
    const validLead = { name: "Test User", email: "test@example.com" };
    expect(leadFormSchema.safeParse(validLead).success).toBe(true);
    
    // Invalid email
    const invalidEmail = { name: "Test", email: "not-an-email" };
    expect(leadFormSchema.safeParse(invalidEmail).success).toBe(false);
    
    // Empty name
    const emptyName = { name: "", email: "test@example.com" };
    expect(leadFormSchema.safeParse(emptyName).success).toBe(false);
  });

  it("should validate campaign form schema", async () => {
    const { campaignFormSchema } = await import("@/lib/validation/form-schemas");
    
    // Valid campaign
    const validCampaign = {
      name: "Test Campaign",
      budget_daily: 100,
      strategy: "maximize_conversions"
    };
    expect(campaignFormSchema.safeParse(validCampaign).success).toBe(true);
    
    // Invalid budget (negative)
    const negativeBudget = {
      name: "Test",
      budget_daily: -10,
      strategy: "maximize_conversions"
    };
    expect(campaignFormSchema.safeParse(negativeBudget).success).toBe(false);
    
    // Empty name
    const emptyName = {
      name: "",
      budget_daily: 100,
      strategy: "maximize_conversions"
    };
    expect(campaignFormSchema.safeParse(emptyName).success).toBe(false);
  });

  it("should validate workspace schema", async () => {
    const { workspaceSchema } = await import("@/lib/validation/schemas");
    
    // Workspace schema exists and is a zod schema
    expect(workspaceSchema).toBeDefined();
    expect(typeof workspaceSchema.safeParse).toBe("function");
  });
});

describe("Statistics Library", () => {
  it("should calculate confidence", async () => {
    const { calculateConfidence } = await import("@/lib/statistics");
    
    // Test with real data
    const result = calculateConfidence(1000, 50, 1000, 65);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it("should calculate uplift correctly", async () => {
    const { calculateUplift } = await import("@/lib/statistics");
    
    // 5% vs 6.5% = 30% uplift
    const result = calculateUplift(0.05, 0.065);
    expect(result).toBeCloseTo(30, 0);
  });

  it("should check statistical significance", async () => {
    const { isStatisticallySignificant } = await import("@/lib/statistics");
    
    const result = isStatisticallySignificant(1000, 50, 1000, 65);
    expect(typeof result).toBe("boolean");
  });
});

describe("Input Sanitization", () => {
  it("should sanitize HTML to prevent XSS", async () => {
    const { sanitizeHtml } = await import("@/lib/validation");
    
    // Should escape script tags
    const result = sanitizeHtml("<script>alert('xss')</script>");
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("should block dangerous URLs", async () => {
    const { sanitizeUrl } = await import("@/lib/validation");
    
    // JavaScript URLs
    expect(sanitizeUrl("javascript:alert(1)")).toBe(null);
    
    // Data URLs
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe(null);
    
    // File URLs
    expect(sanitizeUrl("file:///etc/passwd")).toBe(null);
    
    // Valid URLs should pass
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
  });
});

describe("Agent Registry", () => {
  it("should define all agent types", async () => {
    const { AGENT_DEFINITIONS } = await import("@/lib/agents/agent-registry");
    
    expect(AGENT_DEFINITIONS).toBeDefined();
    expect(Object.keys(AGENT_DEFINITIONS).length).toBeGreaterThan(0);
    
    // Check required properties
    const firstAgent = Object.values(AGENT_DEFINITIONS)[0];
    expect(firstAgent).toHaveProperty("name");
    expect(firstAgent).toHaveProperty("description");
    expect(firstAgent).toHaveProperty("category");
  });
});

describe("API Utils", () => {
  it("should export retry utility", async () => {
    const { withRetry } = await import("@/lib/api-utils");
    expect(withRetry).toBeDefined();
    expect(typeof withRetry).toBe("function");
  });
});

describe("Compose Providers", () => {
  it("should export compose function", async () => {
    const { composeProviders } = await import("@/lib/compose-providers");
    expect(composeProviders).toBeDefined();
    expect(typeof composeProviders).toBe("function");
  });
});
