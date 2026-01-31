import { describe, it, expect, vi } from "vitest";
import { QCOAgent } from "../qco-agent";
import type { AgentArtifactV2 } from "../ai-gateway-client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock AI Gateway
vi.mock("../ai-gateway-client", () => ({
  AIGatewayClient: {
    runLLM: vi.fn(() =>
      Promise.resolve({
        success: true,
        status: "success",
        artifact: {
          summary: "Validation complete",
          actions: [],
          risks: [],
          dependencies: [],
          metrics_to_watch: [],
          requires_approval: false,
        },
      })
    ),
  },
}));

describe("QCOAgent", () => {
  const workspaceId = "test-workspace";

  describe("Schema Validation", () => {
    it("should pass valid artifact schema", () => {
      const validArtifact: AgentArtifactV2 = {
        summary: "This is a valid summary with enough content",
        actions: [
          {
            id: "action-1",
            title: "Fix meta tags",
            type: "recommendation",
            impact: "high",
            effort: "low",
            why: "Missing meta descriptions hurt SEO",
            how: ["Step 1: Identify pages", "Step 2: Add descriptions"],
          },
        ],
        risks: ["May affect crawl budget"],
        dependencies: ["integration:gsc"],
        metrics_to_watch: ["Indexed pages"],
        requires_approval: false,
      };

      const result = QCOAgent.quickValidate(validArtifact);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject artifact with missing summary", () => {
      const invalidArtifact = {
        actions: [],
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const result = QCOAgent.quickValidate(invalidArtifact);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Summary missing or too short");
    });

    it("should reject artifact with short summary", () => {
      const invalidArtifact = {
        summary: "Short",
        actions: [],
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const result = QCOAgent.quickValidate(invalidArtifact);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Summary missing or too short");
    });

    it("should reject non-array actions", () => {
      const invalidArtifact = {
        summary: "Valid summary with enough content",
        actions: "not an array",
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const result = QCOAgent.quickValidate(invalidArtifact);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Actions is not an array");
    });

    it("should reject non-boolean requires_approval", () => {
      const invalidArtifact = {
        summary: "Valid summary with enough content",
        actions: [],
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: "yes",
      };

      const result = QCOAgent.quickValidate(invalidArtifact);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("requires_approval is not boolean");
    });

    it("should reject null input", () => {
      const result = QCOAgent.quickValidate(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Not an object");
    });
  });

  describe("Compliance Checks", () => {
    const qco = new QCOAgent(workspaceId);

    it("should block actions containing fake review references", async () => {
      const artifact: AgentArtifactV2 = {
        summary: "Content strategy recommendations",
        actions: [
          {
            id: "bad-action",
            title: "Generate fake reviews for visibility",
            type: "recommendation",
            impact: "high",
            effort: "low",
            why: "Boost ratings",
            how: ["Create fake review accounts"],
          },
        ],
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const report = await qco.validateArtifact(artifact, "test_agent");

      expect(report.overall_valid).toBe(false);
      expect(report.blocked_actions).toContain("bad-action");
      expect(report.compliance_risks.some((r) => r.includes("Fake reviews"))).toBe(true);
    });

    it("should block keyword stuffing recommendations", async () => {
      const artifact: AgentArtifactV2 = {
        summary: "SEO optimization plan",
        actions: [
          {
            id: "stuffing-action",
            title: "Apply keyword stuffing technique",
            type: "recommendation",
            impact: "high",
            effort: "low",
            why: "Rank higher",
            how: ["Add keyword 50 times"],
          },
        ],
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const report = await qco.validateArtifact(artifact, "seo_agent");

      expect(report.overall_valid).toBe(false);
      expect(report.blocked_actions).toContain("stuffing-action");
    });

    it("should warn about ranking guarantees", async () => {
      const artifact: AgentArtifactV2 = {
        summary: "Growth plan",
        actions: [
          {
            id: "guarantee-action",
            title: "Implement SEO to guarantee ranking #1",
            type: "recommendation",
            impact: "high",
            effort: "high",
            why: "Achieve top position",
            how: ["Follow best practices"],
          },
        ],
        risks: [],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const report = await qco.validateArtifact(artifact, "seo_agent");

      // Should have warning but not be blocked
      expect(report.compliance_risks.some((r) => r.includes("guarantee"))).toBe(true);
    });

    it("should pass clean artifact with no violations", async () => {
      const cleanArtifact: AgentArtifactV2 = {
        summary: "Legitimate SEO recommendations",
        actions: [
          {
            id: "clean-action",
            title: "Optimize meta descriptions",
            type: "recommendation",
            impact: "medium",
            effort: "low",
            why: "Improve CTR in search results",
            how: ["Audit current meta tags", "Write unique descriptions"],
            depends_on: ["integration:gsc"],
          },
        ],
        risks: [],
        dependencies: ["integration:gsc"],
        metrics_to_watch: ["CTR"],
        requires_approval: false,
      };

      const report = await qco.validateArtifact(cleanArtifact, "seo_agent");

      expect(report.blocked_actions).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    const qco = new QCOAgent(workspaceId);

    it("should handle empty actions array", async () => {
      const emptyArtifact: AgentArtifactV2 = {
        summary: "No actions to recommend at this time",
        actions: [],
        risks: ["No opportunities identified"],
        dependencies: [],
        metrics_to_watch: [],
        requires_approval: false,
      };

      const report = await qco.validateArtifact(emptyArtifact, "test_agent");

      expect(report.overall_valid).toBe(true);
      expect(report.validations).toHaveLength(0);
    });

    it("should handle artifact with only risks", async () => {
      const riskyArtifact: AgentArtifactV2 = {
        summary: "Analysis reveals significant risks",
        actions: [],
        risks: ["Data quality is too poor for recommendations", "Missing required integrations"],
        dependencies: ["integration:ga4", "integration:gsc"],
        metrics_to_watch: [],
        requires_approval: true,
      };

      const report = await qco.validateArtifact(riskyArtifact, "cgo_agent");

      expect(report.overall_valid).toBe(true);
    });
  });
});
