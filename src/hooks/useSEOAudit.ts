import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { SEOTechAuditor, generateDemoAuditResults } from "@/lib/agents/seo-auditor";
import type { CrawlResult, SEOIssue } from "@/lib/agents/types";

export function useSEOAudit() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(async (targetUrl?: string) => {
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

      const auditor = new SEOTechAuditor(currentWorkspace.id, currentSite.id);
      await auditor.launchAudit(url, { maxPages: 50 });
      
      // Fetch the results from the database
      const { data: crawl } = await supabase
        .from('crawls')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (crawl) {
        const { data: issues } = await supabase
          .from('issues')
          .select('*')
          .eq('crawl_id', crawl.id)
          .order('impact_score', { ascending: false });

        setResult({
          pages_crawled: crawl.pages_crawled || 0,
          pages_total: crawl.pages_total || 0,
          issues: (issues || []).map(i => ({
            id: i.id,
            type: i.issue_type,
            severity: i.severity as SEOIssue['severity'],
            title: i.title,
            description: i.description || '',
            affected_urls: [],
            recommendation: i.recommendation || '',
            ice_score: i.impact_score || 50,
            auto_fixable: i.auto_fixable || false,
            fix_instructions: i.fix_instructions || undefined,
          })),
          errors: [],
          duration_ms: 0,
        });
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
