import { describe, it, expect, vi, beforeEach } from "vitest";

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
        })),
      })),
    })),
  },
}));

describe("Validation Edge Cases", () => {
  it("should handle password validation rules", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("alllowercase1").success).toBe(false);
    expect(passwordSchema.safeParse("ALLUPPERCASE1").success).toBe(false);
    expect(passwordSchema.safeParse("NoNumberHere").success).toBe(false);
    expect(passwordSchema.safeParse("ValidPass1").success).toBe(true);
  });

  it("should validate site schema", async () => {
    const { siteSchema } = await import("@/lib/validation");
    
    const validSite = {
      url: "https://example.com",
      name: "Test Site",
      language: "fr" as const,
      business_type: "saas" as const,
    };
    
    expect(siteSchema.safeParse(validSite).success).toBe(true);
    expect(siteSchema.safeParse({ ...validSite, url: "not-a-url" }).success).toBe(false);
  });

  it("should validate workspace schema", async () => {
    const { workspaceSchema } = await import("@/lib/validation");
    
    expect(workspaceSchema.safeParse({ name: "My Workspace", slug: "my-workspace" }).success).toBe(true);
    expect(workspaceSchema.safeParse({ name: "A", slug: "ab" }).success).toBe(false);
  });
});

describe("Form Validation Helper", () => {
  it("should return structured errors on validation failure", async () => {
    const { validateForm, emailSchema } = await import("@/lib/validation");
    const { z } = await import("zod");
    
    const testSchema = z.object({
      email: emailSchema,
      name: z.string().min(1, "Name required"),
    });
    
    const result = validateForm(testSchema, { email: "invalid", name: "" });
    
    expect(result.success).toBe(false);
  });

  it("should return data on validation success", async () => {
    const { validateForm, emailSchema } = await import("@/lib/validation");
    const { z } = await import("zod");
    
    const testSchema = z.object({
      email: emailSchema,
      name: z.string().min(1),
    });
    
    const result = validateForm(testSchema, { email: "test@example.com", name: "John" });
    expect(result.success).toBe(true);
  });
});
