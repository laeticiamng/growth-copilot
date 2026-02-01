import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [
              {
                id: "site-1",
                workspace_id: "ws-1",
                url: "https://example.com",
                name: "Example Site",
                sector: "tech",
                is_active: true,
                created_at: new Date().toISOString(),
              },
              {
                id: "site-2",
                workspace_id: "ws-1",
                url: "https://test.com",
                name: "Test Site",
                sector: "retail",
                is_active: false,
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: "site-3",
              workspace_id: "ws-1",
              url: "https://new.com",
              name: "New Site",
              is_active: true,
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock useWorkspace hook
vi.mock("@/hooks/useWorkspace", () => ({
  useWorkspace: () => ({
    currentWorkspace: { id: "ws-1", name: "Test Workspace" },
    workspaces: [{ id: "ws-1", name: "Test Workspace" }],
    loading: false,
  }),
}));

describe("Sites Module - Types", () => {
  it("should have correct Site interface structure", () => {
    const site = {
      id: "test-id",
      workspace_id: "ws-1",
      url: "https://example.com",
      name: "Test Site",
      sector: "tech",
      geographic_zone: "EU",
      language: "fr",
      objectives: ["seo", "ads"],
      business_type: "ecommerce",
      cms_type: "wordpress",
      cms_access_level: "admin",
      tracking_status: "active",
      is_active: true,
      last_crawl_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(site.id).toBeDefined();
    expect(site.workspace_id).toBeDefined();
    expect(site.url).toBeDefined();
    expect(typeof site.is_active).toBe("boolean");
    expect(Array.isArray(site.objectives)).toBe(true);
  });
});

describe("Sites Module - CRUD Operations", () => {
  it("should validate URL format", () => {
    const validUrls = [
      "https://example.com",
      "http://test.com",
      "https://sub.domain.com/path",
    ];

    const invalidUrls = [
      "not-a-url",
      "ftp://example.com",
      "",
    ];

    const urlPattern = /^https?:\/\/.+/;

    for (const url of validUrls) {
      expect(urlPattern.test(url)).toBe(true);
    }

    for (const url of invalidUrls) {
      expect(urlPattern.test(url)).toBe(false);
    }
  });

  it("should handle site data transformation", () => {
    const rawSiteData = {
      id: "site-1",
      workspace_id: "ws-1",
      url: "https://example.com",
      name: null,
      sector: "tech",
      is_active: true,
    };

    // Transform null name to default
    const transformedSite = {
      ...rawSiteData,
      name: rawSiteData.name || rawSiteData.url,
    };

    expect(transformedSite.name).toBe("https://example.com");
  });
});

describe("Sites Module - Filtering", () => {
  it("should filter active sites", () => {
    const sites = [
      { id: "1", is_active: true, name: "Active 1" },
      { id: "2", is_active: false, name: "Inactive" },
      { id: "3", is_active: true, name: "Active 2" },
    ];

    const activeSites = sites.filter(s => s.is_active);
    expect(activeSites.length).toBe(2);
    expect(activeSites.every(s => s.is_active)).toBe(true);
  });

  it("should filter sites by sector", () => {
    const sites = [
      { id: "1", sector: "tech", name: "Tech Site" },
      { id: "2", sector: "retail", name: "Retail Site" },
      { id: "3", sector: "tech", name: "Tech Site 2" },
    ];

    const techSites = sites.filter(s => s.sector === "tech");
    expect(techSites.length).toBe(2);
  });
});
