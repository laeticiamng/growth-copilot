import { describe, it, expect, vi, beforeEach } from "vitest";
 import { generateEmptyAuditResults } from "@/lib/agents/seo-auditor";

 describe("SEO Auditor - Empty Results", () => {
   it("should generate empty audit results with correct structure", () => {
     const result = generateEmptyAuditResults();
    
    expect(result).toBeDefined();
     expect(result.pages_crawled).toBe(0);
     expect(result.pages_total).toBe(0);
    expect(result.issues).toBeInstanceOf(Array);
    expect(result.errors).toBeInstanceOf(Array);
     expect(result.duration_ms).toBe(0);
  });

   it("should return empty arrays when no crawl data exists", () => {
     const result = generateEmptyAuditResults();
     
     expect(result.issues).toHaveLength(0);
     expect(result.errors).toHaveLength(0);
  });
 });

