import { supabase } from "@/integrations/supabase/client";
import type { AgentArtifact, SEOIssue, CrawlResult } from "./types";
import { ChiefGrowthOfficer, QualityComplianceOfficer } from "./orchestrator";
import { AIGatewayClient, AGENT_PROMPTS, type AgentArtifactV2 } from "./ai-gateway-client";
import type { Database } from "@/integrations/supabase/types";

type DbIssueSeverity = Database['public']['Enums']['issue_severity'];

/**
 * SEO Tech Auditor Agent
 * Performs technical SEO audits via the secure crawler edge function
 */
export class SEOTechAuditor {
  private workspaceId: string;
  private siteId: string;
  private cgo: ChiefGrowthOfficer;
  private qco: QualityComplianceOfficer;

  constructor(workspaceId: string, siteId: string) {
    this.workspaceId = workspaceId;
    this.siteId = siteId;
    this.cgo = new ChiefGrowthOfficer(workspaceId, siteId);
    this.qco = new QualityComplianceOfficer(workspaceId);
  }

  /**
   * Launch a full SEO technical audit
   */
  async launchAudit(targetUrl: string, options: { maxPages?: number; respectRobots?: boolean } = {}): Promise<{
    runId: string;
    status: string;
  }> {
    const { maxPages = 50, respectRobots = true } = options;

    // Launch via CGO
    const { runId } = await this.cgo.launchAgent('tech_auditor', {
      site_id: this.siteId,
      target_url: targetUrl,
      options: { maxPages, respectRobots },
    });

    // Update to running
    await this.cgo.updateAgentStatus(runId, 'running');

    try {
      // Call the secure crawler edge function
      const result = await this.callCrawler(targetUrl, maxPages, respectRobots);

      // Generate artifact from crawl results
      const artifact = this.generateArtifact(result);

      // Validate with QCO
      const validation = await this.qco.validateArtifact(artifact, 'tech_auditor');

      if (!validation.valid) {
        console.warn('Artifact validation warnings:', validation.issues);
      }

      // Save issues to database
      await this.saveIssues(result.issues);

      // Update agent run as completed
      await this.cgo.updateAgentStatus(runId, 'completed', {
        ...artifact,
        raw_data: {
          pages_crawled: result.pages_crawled,
          pages_total: result.pages_total,
          duration_ms: result.duration_ms,
        },
      });

      return { runId, status: 'completed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.cgo.updateAgentStatus(runId, 'failed', undefined, errorMessage);
      throw error;
    }
  }

  /**
   * Call the secure crawler edge function
   */
  private async callCrawler(
    targetUrl: string,
    maxPages: number,
    respectRobots: boolean
  ): Promise<CrawlResult> {
    const { data, error } = await supabase.functions.invoke('seo-crawler', {
      body: {
        url: targetUrl,
        max_pages: maxPages,
        respect_robots: respectRobots,
        workspace_id: this.workspaceId,
        site_id: this.siteId,
      },
    });

    if (error) {
      throw new Error(`Crawler error: ${error.message}`);
    }

    return data as CrawlResult;
  }

  /**
   * Generate agent artifact from crawl results
   */
  private generateArtifact(result: CrawlResult): AgentArtifact {
    const criticalIssues = result.issues.filter((i) => i.severity === 'critical');
    const highIssues = result.issues.filter((i) => i.severity === 'high');

    return {
      summary: `Audit completed: ${result.pages_crawled} pages crawled, ${result.issues.length} issues found (${criticalIssues.length} critical, ${highIssues.length} high priority)`,
      actions: result.issues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        priority: issue.severity,
        effort: issue.auto_fixable ? 'low' : 'medium',
        impact: issue.severity === 'critical' ? 'high' : issue.severity === 'high' ? 'medium' : 'low',
        ice_score: issue.ice_score,
        category: issue.type,
        auto_fixable: issue.auto_fixable,
        fix_instructions: issue.fix_instructions,
      })),
      risks: criticalIssues.map((issue) => ({
        id: issue.id,
        description: issue.description,
        severity: 'critical',
        mitigation: issue.recommendation,
      })),
      dependencies: [],
      metrics_to_watch: [
        'Indexed pages count',
        'Core Web Vitals',
        'Crawl errors in GSC',
        'Average position',
      ],
      requires_approval: false,
    };
  }

  /**
   * Analyze crawl results using AI for deeper insights
   */
  async analyzeWithAI(result: CrawlResult, siteUrl: string): Promise<AgentArtifactV2> {
    const issuesSummary = result.issues.map(i => ({
      type: i.type,
      severity: i.severity,
      title: i.title,
      affected_count: i.affected_urls.length,
    }));

    const response = await AIGatewayClient.runLLM({
      workspaceId: this.workspaceId,
      agentName: 'seo_tech_auditor',
      purpose: 'seo_audit',
      systemPrompt: AGENT_PROMPTS.SEO_AUDITOR,
      userPrompt: `Analyze the following SEO audit results and provide prioritized recommendations:

Site: ${siteUrl}
Pages Crawled: ${result.pages_crawled}
Total Pages: ${result.pages_total}

Issues Found:
${JSON.stringify(issuesSummary, null, 2)}

Please:
1. Prioritize issues by impact using ICE scoring
2. Group related issues that should be fixed together
3. Identify quick wins (high impact, low effort)
4. Note any critical issues that block indexation
5. Suggest the optimal fix order`,
      context: {
        pages_crawled: result.pages_crawled,
        pages_total: result.pages_total,
        issues_count: result.issues.length,
        critical_count: result.issues.filter(i => i.severity === 'critical').length,
        high_count: result.issues.filter(i => i.severity === 'high').length,
      },
    });

    return response.artifact;
  }

  /**
   * Save issues to the database
   */
  private async saveIssues(issues: SEOIssue[]): Promise<void> {
    // Create crawl record
    const { data: crawl, error: crawlError } = await supabase
      .from('crawls')
      .insert({
        workspace_id: this.workspaceId,
        site_id: this.siteId,
        status: 'completed',
        pages_crawled: issues.length > 0 ? 1 : 0,
        issues_found: issues.length,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (crawlError) {
      console.error('Failed to create crawl record:', crawlError);
      return;
    }

    // Save each issue
    for (const issue of issues) {
      const { error: issueError } = await supabase.from('issues').insert({
        workspace_id: this.workspaceId,
        site_id: this.siteId,
        crawl_id: crawl.id,
        issue_type: issue.type,
        category: this.getCategoryFromType(issue.type),
        title: issue.title,
        description: issue.description,
        severity: issue.severity as DbIssueSeverity,
        status: 'open',
        impact_score: this.getImpactScore(issue.severity),
        auto_fixable: issue.auto_fixable,
        recommendation: issue.recommendation,
        fix_instructions: issue.fix_instructions,
      });

      if (issueError) {
        console.error('Failed to save issue:', issueError);
      }
    }
  }

  /**
   * Get category from issue type
   */
  private getCategoryFromType(type: string): string {
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
  }

  /**
   * Get impact score from severity
   */
  private getImpactScore(severity: string): number {
    const scoreMap: Record<string, number> = {
      critical: 90,
      high: 70,
      medium: 50,
      low: 30,
    };
    return scoreMap[severity] || 50;
  }
}

/**
  * Generate empty audit results when no real crawl data is available
  * IMPORTANT: This returns an empty state, not fake data
 */
 export function generateEmptyAuditResults(): CrawlResult {
  return {
     pages_crawled: 0,
     pages_total: 0,
     issues: [],
    errors: [],
     duration_ms: 0,
  };
}
