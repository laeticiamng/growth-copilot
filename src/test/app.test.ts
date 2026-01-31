import { describe, it, expect, vi } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
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
        })),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  },
}));

describe("Application Setup", () => {
  it("should have required dependencies installed", () => {
    expect(vi).toBeDefined();
  });
});

describe("Validation Utilities", () => {
  it("should validate email correctly", async () => {
    const { emailSchema } = await import("@/lib/validation");
    
    // Valid emails
    expect(emailSchema.safeParse("test@example.com").success).toBe(true);
    expect(emailSchema.safeParse("user.name@domain.co.uk").success).toBe(true);
    
    // Invalid emails
    expect(emailSchema.safeParse("").success).toBe(false);
    expect(emailSchema.safeParse("invalid").success).toBe(false);
    expect(emailSchema.safeParse("@nodomain.com").success).toBe(false);
  });

  it("should validate URL correctly", async () => {
    const { urlSchema } = await import("@/lib/validation");
    
    // Valid URLs
    expect(urlSchema.safeParse("https://example.com").success).toBe(true);
    expect(urlSchema.safeParse("http://localhost:3000").success).toBe(true);
    
    // Invalid URLs
    expect(urlSchema.safeParse("").success).toBe(false);
    expect(urlSchema.safeParse("not-a-url").success).toBe(false);
  });

  it("should sanitize HTML correctly", async () => {
    const { sanitizeHtml } = await import("@/lib/validation");
    
    const script = "<script>alert('xss')</script>";
    const sanitized = sanitizeHtml(script);
    expect(sanitized).not.toContain("<script>");
    expect(sanitizeHtml("Normal text")).toBe("Normal text");
  });

  it("should validate and sanitize URLs correctly", async () => {
    const { sanitizeUrl } = await import("@/lib/validation");
    
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    expect(sanitizeUrl("http://test.com/path?query=1")).toBe("http://test.com/path?query=1");
    expect(sanitizeUrl("javascript:alert(1)")).toBe(null);
    expect(sanitizeUrl("file:///etc/passwd")).toBe(null);
  });
});

describe("Utility Functions", () => {
  it("should have cn utility for class merging", async () => {
    const { cn } = await import("@/lib/utils");
    
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", false && "class2")).toBe("class1");
    expect(cn("base", { conditional: true })).toContain("base");
  });
});
