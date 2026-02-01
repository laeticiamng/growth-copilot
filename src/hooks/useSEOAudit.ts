import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { SEOTechAuditor, generateDemoAuditResults } from "@/lib/agents/seo-auditor";
import type { CrawlResult, SEOIssue } from "@/lib/agents/types";

export interface AuditOptions {
  maxPages?: number;
  respectRobots?: boolean;
  useFirecrawl?: boolean;
}

export interface ExtendedCrawlResult extends CrawlResult {
  crawl_method?: 'firecrawl' | 'native';
}

export function useSEOAudit() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtendedCrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(async (targetUrl?: string, options: AuditOptions = {}) => {
    if (!currentWorkspace || !currentSite) {
      setError("Aucun workspace ou site sélectionné");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = targetUrl || currentSite.url;
      if (!url) {
        // Use demo data if no URL
        const demoResult = generateDemoAuditResults();
        setResult(demoResult);
        return;
      }

      const { maxPages = 50, respectRobots = true, useFirecrawl = true } = options;

      // Call the edge function directly with Firecrawl option
      const { data, error: invokeError } = await supabase.functions.invoke('seo-crawler', {
        body: {
          url,
          max_pages: maxPages,
          respect_robots: respectRobots,
          workspace_id: currentWorkspace.id,
          site_id: currentSite.id,
          use_firecrawl: useFirecrawl,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data && data.issues) {
        setResult({
          pages_crawled: data.pages_crawled || 0,
          pages_total: data.pages_total || 0,
          issues: data.issues.map((i: any) => ({
            id: i.id,
            type: i.type,
            severity: i.severity as SEOIssue['severity'],
            title: i.title,
            description: i.description || '',
            affected_urls: i.affected_urls || [],
            recommendation: i.recommendation || '',
            ice_score: i.ice_score || 50,
            auto_fixable: i.auto_fixable || false,
            fix_instructions: i.fix_instructions,
          })),
          errors: data.errors || [],
          duration_ms: data.duration_ms || 0,
          crawl_method: data.crawl_method,
        });

        // Save issues to database for persistence
        if (data.issues.length > 0) {
          await saveCrawlResults(data, currentWorkspace.id, currentSite.id);
        }
      }
    } catch (err) {
      console.error('Audit error:', err);
      // Fallback to demo data
      const demoResult = generateDemoAuditResults();
      setResult(demoResult);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'audit');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, currentSite]);

  const saveCrawlResults = async (data: any, workspaceId: string, siteId: string) => {
    try {
      // Create crawl record
      const { data: crawl, error: crawlError } = await supabase
        .from('crawls')
        .insert({
          workspace_id: workspaceId,
          site_id: siteId,
          status: 'completed',
          pages_crawled: data.pages_crawled,
          pages_total: data.pages_total,
          issues_found: data.issues.length,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (crawlError) {
        console.error('Failed to create crawl record:', crawlError);
        return;
      }

      // Save issues
      for (const issue of data.issues) {
        await supabase.from('issues').insert({
          workspace_id: workspaceId,
          site_id: siteId,
          crawl_id: crawl.id,
          issue_type: issue.type,
          category: getCategoryFromType(issue.type),
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          status: 'open',
          impact_score: issue.ice_score,
          auto_fixable: issue.auto_fixable,
          recommendation: issue.recommendation,
          fix_instructions: issue.fix_instructions,
        });
      }
    } catch (err) {
      console.error('Failed to save crawl results:', err);
    }
  };

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

  const runDemoAudit = useCallback(() => {
    setLoading(true);
    setError(null);
    
    // Simulate loading
    setTimeout(() => {
      const demoResult = generateDemoAuditResults();
      setResult(demoResult);
      setLoading(false);
    }, 2000);
  }, []);

  const exportResults = useCallback((format: 'json' | 'csv') => {
    if (!result) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-audit-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['ID', 'Type', 'Severity', 'Title', 'Description', 'ICE Score', 'Auto-fixable'];
      const rows = result.issues.map(i => [
        i.id,
        i.type,
        i.severity,
        i.title,
        i.description.replace(/,/g, ';'),
        i.ice_score,
        i.auto_fixable,
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-audit-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [result]);

  return {
    loading,
    result,
    error,
    runAudit,
    runDemoAudit,
    exportResults,
  };
}
