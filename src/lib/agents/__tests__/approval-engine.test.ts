import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApprovalEngine, type DecisionReport } from "../approval-engine";
import type { AgentArtifactV2, AgentActionV2 } from "../ai-gateway-client";

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

// Mock Supabase client with proper table-specific responses
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "autopilot_settings") {
        return createChainableMock({ 
          data: null, // No autopilot settings = defaults (disabled)
          error: null 
        });
      }
      if (table === "action_log") {
        return createChainableMock({ 
          data: null, 
          error: null, 
          count: 0 
        });
      }
      if (table === "approval_queue") {
        return createChainableMock({ 
          data: { id: "mock-queue-id" }, 
          error: null 
        });
      }
      // Default fallback
      return createChainableMock({ data: null, error: null, count: 0 });
    }),
  },
}));

describe("ApprovalEngine", () => {
  const workspaceId = "test-workspace-id";
  const siteId = "test-site-id";
  let engine: ApprovalEngine;

  beforeEach(() => {
    engine = new ApprovalEngine(workspaceId, siteId);
    vi.clearAllMocks();
  });

  describe("Decision Classification", () => {
    const createMockArtifact = (actions: Partial<AgentActionV2>[]): AgentArtifactV2 => ({
      summary: "Test artifact",
      actions: actions.map((a, i) => ({
        id: a.id ?? `action-${i}`,
        title: a.title ?? `Action ${i}`,
        type: a.type ?? "recommendation",
        impact: a.impact ?? "medium",
        effort: a.effort ?? "medium",
        why: a.why ?? "Test reason",
        how: a.how ?? ["Step 1"],
        depends_on: a.depends_on,
        risks: a.risks,
      })),
      risks: [],
      dependencies: [],
      metrics_to_watch: [],
      requires_approval: false,
    });

    it("should require approval for all non-low-risk actions when autopilot is OFF", async () => {
      const artifact = createMockArtifact([
        { id: "action-1", type: "recommendation", impact: "high" },
        { id: "action-2", type: "recommendation", impact: "medium" },
        { id: "action-3", type: "auto_safe", impact: "low" },
      ]);

      const report = await engine.processActions(artifact, "test_agent");

      // Only auto_safe + low impact should be auto-approved when autopilot OFF
      expect(report.stats.auto_approved).toBe(1);
      expect(report.stats.pending_approval).toBe(2);
      expect(report.stats.blocked).toBe(0);
    });

    it("should auto-approve only whitelisted action types", async () => {
      const artifact = createMockArtifact([
        { id: "seo-action", type: "auto_safe", impact: "low" },
        { id: "ads-action", type: "auto_safe", impact: "low" },
      ]);

      const report = await engine.processActions(artifact, "tech_auditor");

      // tech_auditor maps to "seo_fix" which is in default whitelist
      expect(report.decisions.some((d) => d.actionId === "seo-action" && d.decision === "auto_approved")).toBe(true);
    });

    it("should always require approval for approval_required type actions", async () => {
      const artifact = createMockArtifact([
        { id: "explicit-approval", type: "approval_required", impact: "low" },
      ]);

      const report = await engine.processActions(artifact, "test_agent");

      expect(report.decisions[0].decision).toBe("pending_approval");
      expect(report.decisions[0].reason).toContain("Autopilot is disabled");
    });

    it("should produce valid decision report structure", async () => {
      const artifact = createMockArtifact([
        { id: "test-action", type: "recommendation", impact: "medium" },
      ]);

      const report = await engine.processActions(artifact, "test_agent");

      // Validate report structure
      const validation = ApprovalEngine.validateDecisionReport(report);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("Report Validation", () => {
    it("should reject invalid report structure", () => {
      const invalidReport = { summary: "test" }; // Missing required fields
      const validation = ApprovalEngine.validateDecisionReport(invalidReport);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should accept valid report structure", () => {
      const validReport: DecisionReport = {
        summary: "Test report",
        decisions: [],
        stats: { auto_approved: 0, pending_approval: 0, blocked: 0 },
        budget_remaining: null,
        actions_remaining_this_week: 10,
      };

      const validation = ApprovalEngine.validateDecisionReport(validReport);

      expect(validation.valid).toBe(true);
    });

    it("should reject report with wrong stat types", () => {
      const invalidReport = {
        summary: "test",
        decisions: [],
        stats: { auto_approved: "not a number", pending_approval: 0, blocked: 0 },
        budget_remaining: null,
        actions_remaining_this_week: 10,
      };

      const validation = ApprovalEngine.validateDecisionReport(invalidReport);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("stats.auto_approved must be number");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty actions array", async () => {
      const artifact = createMockArtifact([]);

      const report = await engine.processActions(artifact, "test_agent");

      expect(report.decisions).toHaveLength(0);
      expect(report.stats.auto_approved).toBe(0);
      expect(report.stats.pending_approval).toBe(0);
      expect(report.stats.blocked).toBe(0);
    });

    it("should handle actions with missing optional fields", async () => {
      const artifact: AgentArtifactV2 = {
        summary: "Test",
        actions: [
          {
            id: "minimal-action",
            title: "Minimal",
            type: "auto_safe",
            impact: "low",
            effort: "low",
            why: "Test",
            how: ["Do it"],
            // depends_on and risks are optional
          },
        ],
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const report = await engine.processActions(artifact, "test_agent");

      expect(report.decisions).toHaveLength(1);
      // auto_safe + low impact should be auto-approved even with autopilot OFF
      expect(report.stats.auto_approved).toBe(1);
    });
  });

  // Helper to create mock artifact
  function createMockArtifact(actions: Partial<AgentActionV2>[]): AgentArtifactV2 {
    return {
      summary: "Test artifact",
      actions: actions.map((a, i) => ({
        id: a.id ?? `action-${i}`,
        title: a.title ?? `Action ${i}`,
        type: a.type ?? "recommendation",
        impact: a.impact ?? "medium",
        effort: a.effort ?? "medium",
        why: a.why ?? "Test reason",
        how: a.how ?? ["Step 1"],
        depends_on: a.depends_on,
        risks: a.risks,
      })),
      risks: [],
      dependencies: [],
      metrics_to_watch: [],
      requires_approval: false,
    };
  }
});
