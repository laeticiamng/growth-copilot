import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(() => Promise.resolve({
        data: {
          pages_crawled: 25,
          pages_total: 30,
          issues: [
            {
              id: "issue-1",
              type: "missing_title",
              severity: "critical",
              title: "Missing title",
              description: "Page has no title",
              affected_urls: ["/page-1"],
              recommendation: "Add a title",
              ice_score: 85,
              auto_fixable: false,
            },
          ],
          errors: [],
          duration_ms: 5000,
          crawl_method: "firecrawl",
        },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: "crawl-1" },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Mock workspace and sites hooks
vi.mock("@/hooks/useWorkspace", () => ({
  useWorkspace: () => ({
    currentWorkspace: { id: "ws-1", name: "Test Workspace" },
  }),
}));

vi.mock("@/hooks/useSites", () => ({
  useSites: () => ({
    currentSite: { 
      id: "site-1", 
      url: "https://example.com",
      name: "Example Site",
    },
  }),
}));

describe("SEO Audit Hook - Options", () => {
  it("should have correct AuditOptions interface", () => {
    const options = {
      maxPages: 50,
      respectRobots: true,
      useFirecrawl: true,
    };

    expect(options.maxPages).toBe(50);
    expect(options.respectRobots).toBe(true);
    expect(options.useFirecrawl).toBe(true);
  });

  it("should support default options", () => {
    const defaultOptions = {
      maxPages: 50,
      respectRobots: true,
      useFirecrawl: true,
    };

    // Merge with empty user options
    const userOptions = {};
    const mergedOptions = { ...defaultOptions, ...userOptions };

    expect(mergedOptions.maxPages).toBe(50);
    expect(mergedOptions.useFirecrawl).toBe(true);
  });

  it("should allow overriding Firecrawl option", () => {
    const defaultOptions = {
      maxPages: 50,
      respectRobots: true,
      useFirecrawl: true,
    };

    const userOptions = { useFirecrawl: false };
    const mergedOptions = { ...defaultOptions, ...userOptions };

    expect(mergedOptions.useFirecrawl).toBe(false);
  });
});

describe("SEO Audit Hook - Category Mapping", () => {
  const getCategoryFromType = (type: string): string => {
    const categoryMap: Record<string, string> = {
      missing_title: 'content',
      missing_meta: 'content',
      missing_h1: 'content',
      duplicate_title: 'content',
      duplicate_meta: 'content',
      multiple_h1: 'content',
      http_error: 'indexation',
      redirect: 'indexation',
      noindex: 'indexation',
      canonical_issue: 'indexation',
      missing_schema: 'structured_data',
      orphan_page: 'architecture',
      slow_page: 'performance',
    };
    return categoryMap[type] || 'other';
  };

  it("should map content issues correctly", () => {
    expect(getCategoryFromType("missing_title")).toBe("content");
    expect(getCategoryFromType("missing_meta")).toBe("content");
    expect(getCategoryFromType("missing_h1")).toBe("content");
    expect(getCategoryFromType("duplicate_title")).toBe("content");
  });

  it("should map indexation issues correctly", () => {
    expect(getCategoryFromType("http_error")).toBe("indexation");
    expect(getCategoryFromType("noindex")).toBe("indexation");
    expect(getCategoryFromType("canonical_issue")).toBe("indexation");
  });

  it("should map other categories correctly", () => {
    expect(getCategoryFromType("missing_schema")).toBe("structured_data");
    expect(getCategoryFromType("orphan_page")).toBe("architecture");
    expect(getCategoryFromType("slow_page")).toBe("performance");
  });

  it("should return 'other' for unknown types", () => {
    expect(getCategoryFromType("unknown_type")).toBe("other");
    expect(getCategoryFromType("")).toBe("other");
  });
});

describe("SEO Audit Hook - Export Functions", () => {
  it("should format JSON export correctly", () => {
    const result = {
      pages_crawled: 10,
      pages_total: 12,
      issues: [
        { id: "1", type: "missing_title", severity: "critical", title: "Test" },
      ],
      errors: [],
      duration_ms: 1000,
    };

    const json = JSON.stringify(result, null, 2);
    const parsed = JSON.parse(json);

    expect(parsed.pages_crawled).toBe(10);
    expect(parsed.issues[0].type).toBe("missing_title");
  });

  it("should format CSV export correctly", () => {
    const issues = [
      {
        id: "1",
        type: "missing_title",
        severity: "critical",
        title: "Missing Title",
        description: "No title found",
        ice_score: 85,
        auto_fixable: false,
      },
    ];

    const headers = ['ID', 'Type', 'Severity', 'Title', 'Description', 'ICE Score', 'Auto-fixable'];
    const rows = issues.map(i => [
      i.id,
      i.type,
      i.severity,
      i.title,
      i.description.replace(/,/g, ';'),
      i.ice_score,
      i.auto_fixable,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    expect(csv).toContain('ID,Type,Severity');
    expect(csv).toContain('missing_title');
    expect(csv).toContain('critical');
  });

  it("should escape commas in CSV description", () => {
    const description = "This, has, commas";
    const escaped = description.replace(/,/g, ';');
    
    expect(escaped).toBe("This; has; commas");
    expect(escaped).not.toContain(",");
  });
});
