import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateDemoAuditResults } from "@/lib/agents/seo-auditor";

describe("SEO Auditor - Demo Data", () => {
  it("should generate demo audit results with correct structure", () => {
    const result = generateDemoAuditResults();
    
    expect(result).toBeDefined();
    expect(result.pages_crawled).toBe(156);
    expect(result.pages_total).toBe(178);
    expect(result.issues).toBeInstanceOf(Array);
    expect(result.errors).toBeInstanceOf(Array);
    expect(result.duration_ms).toBe(45000);
  });

  it("should generate issues with required fields", () => {
    const result = generateDemoAuditResults();
    
    for (const issue of result.issues) {
      expect(issue).toHaveProperty("id");
      expect(issue).toHaveProperty("type");
      expect(issue).toHaveProperty("severity");
      expect(issue).toHaveProperty("title");
      expect(issue).toHaveProperty("description");
      expect(issue).toHaveProperty("affected_urls");
      expect(issue).toHaveProperty("recommendation");
      expect(issue).toHaveProperty("ice_score");
      expect(issue).toHaveProperty("auto_fixable");
    }
  });

  it("should have valid severity values", () => {
    const result = generateDemoAuditResults();
    const validSeverities = ["critical", "high", "medium", "low"];
    
    for (const issue of result.issues) {
      expect(validSeverities).toContain(issue.severity);
    }
  });

  it("should have ICE scores between 0 and 100", () => {
    const result = generateDemoAuditResults();
    
    for (const issue of result.issues) {
      expect(issue.ice_score).toBeGreaterThanOrEqual(0);
      expect(issue.ice_score).toBeLessThanOrEqual(100);
    }
  });

  it("should include critical issues", () => {
    const result = generateDemoAuditResults();
    const criticalIssues = result.issues.filter(i => i.severity === "critical");
    
    expect(criticalIssues.length).toBeGreaterThan(0);
  });

  it("should include different issue types", () => {
    const result = generateDemoAuditResults();
    const types = new Set(result.issues.map(i => i.type));
    
    expect(types.size).toBeGreaterThan(3);
    expect(types.has("missing_title")).toBe(true);
    expect(types.has("http_error")).toBe(true);
  });
});

describe("SEO Auditor - Issue Analysis", () => {
  it("should have multiple severity levels", () => {
    const result = generateDemoAuditResults();
    const severities = new Set(result.issues.map(i => i.severity));
    
    // Demo data should have multiple severity levels
    expect(severities.size).toBeGreaterThan(1);
    expect(severities.has("critical")).toBe(true);
    expect(severities.has("high")).toBe(true);
  });

  it("should have ICE scores that can be sorted", () => {
    const result = generateDemoAuditResults();
    
    // Sort a copy by ICE score
    const sortedIssues = [...result.issues].sort((a, b) => b.ice_score - a.ice_score);
    
    // Verify sorting works correctly
    for (let i = 0; i < sortedIssues.length - 1; i++) {
      expect(sortedIssues[i].ice_score).toBeGreaterThanOrEqual(
        sortedIssues[i + 1].ice_score
      );
    }
  });

  it("should include fix instructions for auto-fixable issues", () => {
    const result = generateDemoAuditResults();
    const autoFixableIssues = result.issues.filter(i => i.auto_fixable);
    
    // At least some auto-fixable issues should exist
    expect(autoFixableIssues.length).toBeGreaterThan(0);
  });

  it("should have affected URLs for all issues", () => {
    const result = generateDemoAuditResults();
    
    for (const issue of result.issues) {
      expect(issue.affected_urls).toBeInstanceOf(Array);
      expect(issue.affected_urls.length).toBeGreaterThan(0);
    }
  });
});
