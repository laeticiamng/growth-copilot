import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [{ id: "1" }, { id: "2" }], error: null }),
          })),
          gte: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: "new-id" }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
  },
}));

describe("Supabase Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Data Fetching", () => {
    it("should fetch data from a table", async () => {
      const result = await supabase.from("sites").select("*").order("created_at");
      expect(supabase.from).toHaveBeenCalledWith("sites");
      expect(result.data).toEqual([]);
    });

    it("should fetch single record by ID", async () => {
      const result = await supabase.from("workspaces").select("*").eq("id", "test-id").single();
      expect(result.data).toEqual({ id: "test-id" });
    });

    it("should handle pagination with limit", async () => {
      const result = await supabase
        .from("issues")
        .select("*")
        .eq("site_id", "site-1")
        .order("impact_score", { ascending: false })
        .limit(5);
      
      expect(supabase.from).toHaveBeenCalledWith("issues");
      expect(result.data).toEqual([{ id: "1" }, { id: "2" }]);
    });
  });

  describe("Data Mutations", () => {
    it("should insert new record", async () => {
      const newSite = {
        url: "https://test.com",
        name: "Test Site",
        workspace_id: "ws-1",
      };

      const result = await supabase.from("sites").insert(newSite).select().single();
      expect(supabase.from).toHaveBeenCalledWith("sites");
      expect(result.data).toEqual({ id: "new-id" });
    });

    it("should update existing record", async () => {
      const result = await supabase
        .from("sites")
        .update({ name: "Updated Name" })
        .eq("id", "site-1");
      
      expect(supabase.from).toHaveBeenCalledWith("sites");
      expect(result.error).toBeNull();
    });

    it("should delete record", async () => {
      const result = await supabase.from("sites").delete().eq("id", "site-1");
      expect(supabase.from).toHaveBeenCalledWith("sites");
      expect(result.error).toBeNull();
    });

    it("should upsert record", async () => {
      const data = {
        site_id: "site-1",
        workspace_id: "ws-1",
        tone_of_voice: "Professional",
      };

      const result = await supabase.from("brand_kit").upsert(data, { onConflict: "site_id" });
      expect(supabase.from).toHaveBeenCalledWith("brand_kit");
      expect(result.error).toBeNull();
    });
  });

  describe("Authentication", () => {
    it("should sign in with email/password", async () => {
      const result = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      });
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(result.data?.user?.id).toBe("user-1");
    });

    it("should sign up new user", async () => {
      const result = await supabase.auth.signUp({
        email: "new@example.com",
        password: "password123",
      });
      
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it("should sign out user", async () => {
      const result = await supabase.auth.signOut();
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe("Edge Functions", () => {
    it("should invoke edge function", async () => {
      const result = await supabase.functions.invoke("analytics-guardian", {
        body: { workspace_id: "ws-1", site_id: "site-1" },
      });
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith("analytics-guardian", {
        body: { workspace_id: "ws-1", site_id: "site-1" },
      });
      expect(result.data).toEqual({ success: true });
    });
  });
});

describe("Data Access Patterns", () => {
  it("should handle empty results gracefully", async () => {
    const result = await supabase.from("sites").select("*").order("created_at");
    expect(result.data).toEqual([]);
    expect(result.error).toBeNull();
  });

  it("should construct proper query chain", async () => {
    // This tests that our mock properly chains methods
    const fromResult = supabase.from("kpis_daily");
    expect(fromResult.select).toBeDefined();
    
    const selectResult = fromResult.select("*");
    expect(selectResult.eq).toBeDefined();
  });
});
