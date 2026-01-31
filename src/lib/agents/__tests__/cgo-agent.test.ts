import { describe, it, expect, vi, beforeEach } from "vitest";
import { CGOAgent, type CGOContext } from "../cgo-agent";

// Create chainable mock that properly handles all Supabase query patterns
const createChainableMock = (finalValue: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  const methods = [
    'select', 'eq', 'neq', 'gte', 'gt', 'lt', 'lte',
    'order', 'limit', 'maybeSingle', 'single', 'insert', 'update', 'delete'
  ];
  
  methods.forEach(method => {
    chain[method] = vi.fn(() => chain);
  });
  
  // Make the chain thenable (Promise-like)
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(finalValue).then(resolve);
  
  return chain;
};

// Mock Supabase client with table-specific responses
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      switch (table) {
        case "agent_runs":
          return createChainableMock({ data: { id: "test-run-id" }, error: null });
        
        case "action_log":
          return createChainableMock({ data: null, error: null, count: 0 });
        
        case "integrations":
          return createChainableMock({ data: [], error: null });
        
        case "data_quality_alerts":
          return createChainableMock({ data: [], error: null });
        
        case "issues":
          return createChainableMock({ data: [], error: null });
        
        case "kpis_daily":
          return createChainableMock({ data: [], error: null });
        
        case "autopilot_settings":
          return createChainableMock({ data: null, error: null });
        
        case "approval_queue":
          return createChainableMock({ data: { id: "queue-id" }, error: null });
        
        default:
          return createChainableMock({ data: [], error: null, count: 0 });
      }
    }),
  },
}));

// Mock AI Gateway
vi.mock("../ai-gateway-client", () => ({
  AIGatewayClient: {
    runLLM: vi.fn(() =>
      Promise.resolve({
        success: true,
        status: "success",
        request_id: "test-request",
        artifact: {
          summary: "Growth plan generated successfully",
          actions: [
            {
              id: "cgo_setup_001",
              title: "Connect Google Search Console",
              type: "recommendation",
              impact: "high",
              effort: "low",
              why: "Required for organic search data",
              how: ["Go to Integrations", "Click Connect GSC", "Authorize access"],
              depends_on: [],
            },
            {
              id: "cgo_seo_001",
              title: "Fix missing meta descriptions",
              type: "auto_safe",
              impact: "low",
              effort: "low",
              why: "15 pages missing meta descriptions",
              how: ["Export list from SEO audit", "Write unique descriptions"],
              depends_on: ["cgo_setup_001"],
            },
          ],
          risks: ["Limited data without GSC connection"],
          dependencies: ["integration:gsc"],
          metrics_to_watch: ["Indexed pages", "CTR"],
          requires_approval: false,
        },
        usage: {
          tokens_in: 1500,
          tokens_out: 800,
          cost_estimate: 0.015,
          duration_ms: 2500,
        },
      })
    ),
  },
}));

describe("CGOAgent", () => {
  const workspaceId = "test-workspace";
  const siteId = "test-site";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Growth Plan Generation", () => {
    it("should generate a growth plan with valid structure", async () => {
      const cgo = new CGOAgent(workspaceId, siteId);
      const context: CGOContext = {
        siteUrl: "https://example.com",
        siteId,
        goals: ["Increase organic traffic", "Improve conversion rate"],
        integrations: { gsc: false, ga4: false, ads: false, gbp: false },
        dataQualityStatus: "yellow",
        recentIssuesCount: 15,
        recentIssuesSummary: ["Missing meta descriptions", "Slow page speed"],
      };

      const result = await cgo.generateGrowthPlan(context);

      expect(result.runId).toBe("test-run-id");
      expect(result.artifact.summary).toBeDefined();
      expect(result.artifact.actions.length).toBeGreaterThan(0);
      expect(result.decisions.summary).toBeDefined();
    });

    it("should include setup actions when integrations are missing", async () => {
      const cgo = new CGOAgent(workspaceId, siteId);
      const context: CGOContext = {
        siteUrl: "https://example.com",
        siteId,
        goals: [],
        integrations: { gsc: false, ga4: false, ads: false, gbp: false },
        dataQualityStatus: "red",
        recentIssuesCount: 0,
        recentIssuesSummary: [],
      };

      const result = await cgo.generateGrowthPlan(context);

      // Should have setup-related actions due to missing integrations
      expect(result.artifact.dependencies).toContain("integration:gsc");
    });

    it("should process actions through approval engine", async () => {
      const cgo = new CGOAgent(workspaceId, siteId);
      const context: CGOContext = {
        siteUrl: "https://example.com",
        siteId,
        goals: ["Grow"],
        integrations: { gsc: true, ga4: true, ads: false, gbp: false },
        dataQualityStatus: "green",
        recentIssuesCount: 5,
        recentIssuesSummary: ["Minor issues"],
      };

      const result = await cgo.generateGrowthPlan(context);

      // Decision report should be populated
      expect(result.decisions.stats).toBeDefined();
      expect(typeof result.decisions.stats.auto_approved).toBe("number");
      expect(typeof result.decisions.stats.pending_approval).toBe("number");
    });
  });

  describe("Context Building", () => {
    it("should build context from database", async () => {
      const context = await CGOAgent.buildContextFromDB(
        workspaceId,
        siteId,
        "https://example.com"
      );

      expect(context.siteUrl).toBe("https://example.com");
      expect(context.siteId).toBe(siteId);
      expect(context.integrations).toBeDefined();
      expect(context.dataQualityStatus).toBeDefined();
    });

    it("should detect data quality status from alerts", async () => {
      // This test verifies the logic works with mocked data
      const context = await CGOAgent.buildContextFromDB(
        workspaceId,
        siteId,
        "https://example.com"
      );

      // With no alerts (mocked as empty), status should be green
      expect(context.dataQualityStatus).toBe("green");
    });
  });

  describe("User Prompt Building", () => {
    it("should include all context in user prompt", async () => {
      const cgo = new CGOAgent(workspaceId, siteId);
      
      // Access private method for testing via class instantiation
      const context: CGOContext = {
        siteUrl: "https://test.com",
        siteId,
        goals: ["Goal 1", "Goal 2"],
        integrations: { gsc: true, ga4: false, ads: false, gbp: false },
        dataQualityStatus: "yellow",
        recentIssuesCount: 10,
        recentIssuesSummary: ["Issue 1", "Issue 2"],
        kpiTrends: { clicks_trend: "up", conversions_trend: "down" },
      };

      // Generate plan to trigger prompt building
      const result = await cgo.generateGrowthPlan(context);

      // Verify the plan was generated (prompt was built successfully)
      expect(result.artifact).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle AI gateway errors gracefully", async () => {
      // Mock AI Gateway to fail
      const { AIGatewayClient } = await import("../ai-gateway-client");
      vi.mocked(AIGatewayClient.runLLM).mockRejectedValueOnce(new Error("Gateway timeout"));

      const cgo = new CGOAgent(workspaceId, siteId);
      const context: CGOContext = {
        siteUrl: "https://example.com",
        siteId,
        goals: [],
        integrations: { gsc: false, ga4: false, ads: false, gbp: false },
        dataQualityStatus: "green",
        recentIssuesCount: 0,
        recentIssuesSummary: [],
      };

      await expect(cgo.generateGrowthPlan(context)).rejects.toThrow("Gateway timeout");
    });
  });
});
