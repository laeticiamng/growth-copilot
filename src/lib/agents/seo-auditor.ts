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
 * Run audit using demo data when no real crawl is available
 */
export function generateDemoAuditResults(): CrawlResult {
  const issues: SEOIssue[] = [
    {
      id: 'demo-1',
      type: 'missing_title',
      severity: 'critical',
      title: 'Pages sans balise title',
      description: '12 pages n\'ont pas de balise title définie',
      affected_urls: ['/page-1', '/page-2', '/contact'],
      recommendation: 'Ajouter une balise title unique et descriptive (50-60 caractères) pour chaque page',
      ice_score: 85,
      auto_fixable: false,
      fix_instructions: '1. Identifier les pages concernées\n2. Rédiger un title unique incluant le mot-clé principal\n3. Implémenter via le CMS ou le code source',
    },
    {
      id: 'demo-2',
      type: 'duplicate_meta',
      severity: 'high',
      title: 'Meta descriptions dupliquées',
      description: '8 pages partagent la même meta description',
      affected_urls: ['/services', '/services/seo', '/services/ads'],
      recommendation: 'Rédiger une meta description unique pour chaque page (150-160 caractères)',
      ice_score: 72,
      auto_fixable: true,
      fix_instructions: '1. Exporter la liste des pages avec meta dupliquée\n2. Rédiger des descriptions uniques mettant en avant la proposition de valeur\n3. Inclure un CTA quand pertinent',
    },
    {
      id: 'demo-3',
      type: 'missing_h1',
      severity: 'high',
      title: 'Pages sans H1',
      description: '5 pages n\'ont pas de balise H1',
      affected_urls: ['/blog/article-1', '/blog/article-2'],
      recommendation: 'Chaque page doit avoir exactement un H1 contenant le mot-clé principal',
      ice_score: 68,
      auto_fixable: false,
    },
    {
      id: 'demo-4',
      type: 'http_error',
      severity: 'critical',
      title: 'Erreurs 404',
      description: '15 liens internes pointent vers des pages 404',
      affected_urls: ['/old-page', '/deleted-product', '/legacy-service'],
      recommendation: 'Mettre en place des redirections 301 ou corriger les liens cassés',
      ice_score: 90,
      auto_fixable: false,
      fix_instructions: '1. Identifier les pages sources des liens cassés\n2. Décider: redirection 301 ou mise à jour du lien\n3. Implémenter via .htaccess, next.config, ou CMS',
    },
    {
      id: 'demo-5',
      type: 'slow_page',
      severity: 'high',
      title: 'Pages lentes (LCP > 2.5s)',
      description: 'Le Largest Contentful Paint dépasse 4.2s sur mobile',
      affected_urls: ['/accueil', '/produits'],
      recommendation: 'Optimiser les images, activer le lazy loading, réduire le JavaScript bloquant',
      ice_score: 75,
      auto_fixable: false,
      fix_instructions: '1. Analyser avec PageSpeed Insights\n2. Compresser les images (WebP, AVIF)\n3. Implémenter le lazy loading\n4. Différer le JS non critique',
    },
    {
      id: 'demo-6',
      type: 'missing_schema',
      severity: 'medium',
      title: 'Schema.org manquant',
      description: 'Aucun balisage Schema détecté sur les pages produits',
      affected_urls: ['/produits/item-1', '/produits/item-2'],
      recommendation: 'Implémenter le schema Product avec price, availability, reviews',
      ice_score: 55,
      auto_fixable: true,
      fix_instructions: '1. Utiliser un générateur de schema JSON-LD\n2. Inclure: name, description, price, availability\n3. Valider avec le Rich Results Test',
    },
    {
      id: 'demo-7',
      type: 'canonical_issue',
      severity: 'medium',
      title: 'Canonical mal configuré',
      description: '3 pages ont un canonical pointant vers une URL incorrecte',
      affected_urls: ['/produit?variant=1', '/produit?color=red'],
      recommendation: 'Corriger les canonical pour pointer vers l\'URL canonique sans paramètres',
      ice_score: 60,
      auto_fixable: true,
    },
    {
      id: 'demo-8',
      type: 'orphan_page',
      severity: 'low',
      title: 'Pages orphelines détectées',
      description: '7 pages ne reçoivent aucun lien interne',
      affected_urls: ['/landing-old', '/promo-2023', '/test-page'],
      recommendation: 'Ajouter des liens internes depuis des pages thématiquement proches ou supprimer si non pertinent',
      ice_score: 40,
      auto_fixable: false,
    },
  ];

  return {
    pages_crawled: 156,
    pages_total: 178,
    issues,
    errors: [],
    duration_ms: 45000,
  };
}
