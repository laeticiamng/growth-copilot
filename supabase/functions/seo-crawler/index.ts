import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Anti-SSRF: Block private IPs, localhost, and metadata endpoints
const BLOCKED_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^localhost$/i,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /metadata\.google/i,
  /169\.254\.169\.254/,
  /metadata\.aws/i,
  /instance-data/i,
];

function isBlockedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(hostname)) {
        return true;
      }
    }
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

interface PageData {
  url: string;
  status_code: number;
  title?: string;
  meta_description?: string;
  h1?: string;
  h1_count: number;
  canonical?: string;
  robots_meta?: string;
  has_schema: boolean;
  schema_types: string[];
  internal_links: string[];
  external_links: string[];
  word_count: number;
  load_time_ms: number;
  errors: string[];
}

interface SEOIssue {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected_urls: string[];
  recommendation: string;
  ice_score: number;
  auto_fixable: boolean;
  fix_instructions?: string;
}

interface CrawlResult {
  pages_crawled: number;
  pages_total: number;
  issues: SEOIssue[];
  errors: string[];
  duration_ms: number;
}

/**
 * Validates auth and workspace access for the crawler
 */
// deno-lint-ignore no-explicit-any
async function validateRequest(req: Request, workspaceId: string, siteId?: string): Promise<{ 
  valid: boolean; 
  userId: string | null; 
  error: string | null;
  serviceClient: any;
  siteUrl?: string;
}> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, userId: null, error: 'Missing Authorization header', serviceClient: null };
  }

  const token = authHeader.replace('Bearer ', '');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    const { data, error } = await userClient.auth.getUser(token);
    
    if (error || !data.user) {
      return { valid: false, userId: null, error: 'Invalid or expired token', serviceClient: null };
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify workspace access
    const { data: hasAccess, error: accessError } = await serviceClient.rpc('has_workspace_access', {
      _user_id: data.user.id,
      _workspace_id: workspaceId,
    });

    if (accessError || !hasAccess) {
      return { valid: false, userId: data.user.id, error: 'Access denied to workspace', serviceClient: null };
    }

    // If site_id provided, validate it belongs to the workspace and get its URL
    let siteUrl: string | undefined;
    if (siteId) {
      const { data: site, error: siteError } = await serviceClient
        .from('sites')
        .select('domain')
        .eq('id', siteId)
        .eq('workspace_id', workspaceId)
        .single();

      if (siteError || !site) {
        return { valid: false, userId: data.user.id, error: 'Site not found or access denied', serviceClient: null };
      }
      siteUrl = site.domain;
    }

    return { valid: true, userId: data.user.id, error: null, serviceClient, siteUrl };
  } catch (err) {
    return { valid: false, userId: null, error: 'Authentication failed', serviceClient: null };
  }
}

// Parse HTML to extract SEO data
function parseHtml(html: string, url: string, baseUrl: string): Partial<PageData> {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || [];
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  
  const schemaMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi) || [];
  const schemaTypes: string[] = [];
  for (const schema of schemaMatches) {
    const typeMatch = schema.match(/"@type"\s*:\s*"([^"]+)"/);
    if (typeMatch) {
      schemaTypes.push(typeMatch[1]);
    }
  }
  
  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"'#]+)["']/gi);
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  
  for (const match of linkMatches) {
    const href = match[1];
    if (href.startsWith('http')) {
      if (href.includes(new URL(baseUrl).hostname)) {
        internalLinks.push(href);
      } else {
        externalLinks.push(href);
      }
    } else if (href.startsWith('/')) {
      internalLinks.push(new URL(href, baseUrl).href);
    }
  }
  
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const wordCount = textContent.split(' ').filter(w => w.length > 0).length;
  
  return {
    title: titleMatch?.[1]?.trim(),
    meta_description: metaDescMatch?.[1]?.trim(),
    h1: h1Matches[0]?.replace(/<[^>]+>/g, '').trim(),
    h1_count: h1Matches.length,
    canonical: canonicalMatch?.[1],
    robots_meta: robotsMatch?.[1],
    has_schema: schemaTypes.length > 0,
    schema_types: schemaTypes,
    internal_links: [...new Set(internalLinks)].slice(0, 100),
    external_links: [...new Set(externalLinks)].slice(0, 50),
    word_count: wordCount,
  };
}

// Analyze pages and generate issues
function analyzePages(pages: PageData[], baseUrl: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const titles = new Map<string, string[]>();
  const metas = new Map<string, string[]>();
  const allLinkedUrls = new Set<string>();
  
  for (const page of pages) {
    for (const link of page.internal_links) {
      allLinkedUrls.add(link);
    }
  }
  
  for (const page of pages) {
    if (page.status_code >= 400) {
      issues.push({
        id: `http-error-${page.url}`,
        type: 'http_error',
        severity: page.status_code >= 500 ? 'critical' : 'high',
        title: `Erreur HTTP ${page.status_code}`,
        description: `La page ${page.url} retourne une erreur ${page.status_code}`,
        affected_urls: [page.url],
        recommendation: page.status_code === 404 
          ? 'Mettre en place une redirection 301 ou corriger le lien'
          : 'Vérifier le serveur et corriger l\'erreur',
        ice_score: 90,
        auto_fixable: false,
      });
      continue;
    }
    
    if (!page.title) {
      issues.push({
        id: `missing-title-${page.url}`,
        type: 'missing_title',
        severity: 'critical',
        title: 'Balise title manquante',
        description: `La page ${page.url} n'a pas de balise title`,
        affected_urls: [page.url],
        recommendation: 'Ajouter une balise title unique de 50-60 caractères',
        ice_score: 85,
        auto_fixable: false,
      });
    } else {
      const existing = titles.get(page.title) || [];
      existing.push(page.url);
      titles.set(page.title, existing);
    }
    
    if (!page.meta_description) {
      issues.push({
        id: `missing-meta-${page.url}`,
        type: 'missing_meta',
        severity: 'high',
        title: 'Meta description manquante',
        description: `La page ${page.url} n'a pas de meta description`,
        affected_urls: [page.url],
        recommendation: 'Ajouter une meta description de 150-160 caractères',
        ice_score: 70,
        auto_fixable: true,
      });
    } else {
      const existing = metas.get(page.meta_description) || [];
      existing.push(page.url);
      metas.set(page.meta_description, existing);
    }
    
    if (page.h1_count === 0) {
      issues.push({
        id: `missing-h1-${page.url}`,
        type: 'missing_h1',
        severity: 'high',
        title: 'Balise H1 manquante',
        description: `La page ${page.url} n'a pas de H1`,
        affected_urls: [page.url],
        recommendation: 'Ajouter exactement un H1 contenant le mot-clé principal',
        ice_score: 68,
        auto_fixable: false,
      });
    } else if (page.h1_count > 1) {
      issues.push({
        id: `multiple-h1-${page.url}`,
        type: 'multiple_h1',
        severity: 'medium',
        title: 'Plusieurs H1 détectés',
        description: `La page ${page.url} a ${page.h1_count} balises H1`,
        affected_urls: [page.url],
        recommendation: 'Conserver un seul H1 et transformer les autres en H2',
        ice_score: 45,
        auto_fixable: true,
      });
    }
    
    if (!page.has_schema) {
      issues.push({
        id: `missing-schema-${page.url}`,
        type: 'missing_schema',
        severity: 'medium',
        title: 'Schema.org manquant',
        description: `Aucun balisage structuré détecté sur ${page.url}`,
        affected_urls: [page.url],
        recommendation: 'Implémenter le schema approprié (Organization, Product, Article...)',
        ice_score: 55,
        auto_fixable: true,
      });
    }
    
    if (page.robots_meta?.toLowerCase().includes('noindex')) {
      issues.push({
        id: `noindex-${page.url}`,
        type: 'noindex',
        severity: 'high',
        title: 'Page en noindex',
        description: `La page ${page.url} est bloquée de l'indexation`,
        affected_urls: [page.url],
        recommendation: 'Vérifier si le noindex est intentionnel, sinon le retirer',
        ice_score: 80,
        auto_fixable: false,
      });
    }
    
    const pageUrlNormalized = page.url.replace(/\/$/, '');
    const isLinked = allLinkedUrls.has(page.url) || 
                     allLinkedUrls.has(pageUrlNormalized) ||
                     allLinkedUrls.has(pageUrlNormalized + '/');
    
    if (!isLinked && page.url !== baseUrl && !page.url.endsWith('/')) {
      issues.push({
        id: `orphan-${page.url}`,
        type: 'orphan_page',
        severity: 'low',
        title: 'Page potentiellement orpheline',
        description: `La page ${page.url} ne semble recevoir aucun lien interne`,
        affected_urls: [page.url],
        recommendation: 'Ajouter des liens internes depuis des pages thématiquement proches',
        ice_score: 40,
        auto_fixable: false,
      });
    }
  }
  
  for (const [title, urls] of titles) {
    if (urls.length > 1) {
      issues.push({
        id: `duplicate-title-${urls[0]}`,
        type: 'duplicate_title',
        severity: 'high',
        title: 'Titles dupliqués',
        description: `${urls.length} pages partagent le même title: "${title.substring(0, 50)}..."`,
        affected_urls: urls,
        recommendation: 'Rédiger un title unique pour chaque page',
        ice_score: 72,
        auto_fixable: false,
      });
    }
  }
  
  for (const [meta, urls] of metas) {
    if (urls.length > 1) {
      issues.push({
        id: `duplicate-meta-${urls[0]}`,
        type: 'duplicate_meta',
        severity: 'medium',
        title: 'Meta descriptions dupliquées',
        description: `${urls.length} pages partagent la même meta description`,
        affected_urls: urls,
        recommendation: 'Rédiger une meta description unique pour chaque page',
        ice_score: 60,
        auto_fixable: true,
      });
    }
  }
  
  issues.sort((a, b) => b.ice_score - a.ice_score);
  
  return issues;
}

async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap.xml.gz`,
  ];
  
  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl, {
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const xml = await response.text();
        const urlMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
        const urls: string[] = [];
        
        for (const match of urlMatches) {
          const url = match[1].trim();
          if (url.endsWith('.xml')) {
            const nestedUrls = await fetchSitemapUrls(url.replace(/\/[^/]+$/, ''));
            urls.push(...nestedUrls);
          } else {
            urls.push(url);
          }
        }
        
        return [...new Set(urls)];
      }
    } catch {
      // Try next sitemap URL
    }
  }
  
  return [];
}

async function checkRobotsTxt(baseUrl: string): Promise<{ allowed: boolean; crawlDelay?: number }> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      return { allowed: true };
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    let inUserAgentAll = false;
    let crawlDelay: number | undefined;
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.replace('user-agent:', '').trim();
        inUserAgentAll = agent === '*' || agent.includes('bot');
      }
      
      if (inUserAgentAll) {
        if (trimmed.startsWith('disallow: /') && trimmed === 'disallow: /') {
          return { allowed: false };
        }
        if (trimmed.startsWith('crawl-delay:')) {
          crawlDelay = parseInt(trimmed.replace('crawl-delay:', '').trim(), 10);
        }
      }
    }
    
    return { allowed: true, crawlDelay };
  } catch {
    return { allowed: true };
  }
}

async function crawlSite(
  baseUrl: string,
  maxPages: number,
  respectRobots: boolean
): Promise<CrawlResult> {
  const startTime = Date.now();
  const pages: PageData[] = [];
  const errors: string[] = [];
  const visited = new Set<string>();
  const toVisit: string[] = [];
  
  const url = new URL(baseUrl);
  const normalizedBase = `${url.protocol}//${url.hostname}`;
  
  if (respectRobots) {
    const { allowed } = await checkRobotsTxt(normalizedBase);
    if (!allowed) {
      return {
        pages_crawled: 0,
        pages_total: 0,
        issues: [],
        errors: ['Crawling blocked by robots.txt'],
        duration_ms: Date.now() - startTime,
      };
    }
  }
  
  const sitemapUrls = await fetchSitemapUrls(normalizedBase);
  if (sitemapUrls.length > 0) {
    toVisit.push(...sitemapUrls.slice(0, maxPages));
  } else {
    toVisit.push(normalizedBase);
  }
  
  while (toVisit.length > 0 && pages.length < maxPages) {
    const currentUrl = toVisit.shift()!;
    
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);
    
    if (isBlockedUrl(currentUrl)) {
      errors.push(`Blocked URL (security): ${currentUrl}`);
      continue;
    }
    
    try {
      const fetchStart = Date.now();
      const response = await fetch(currentUrl, {
        signal: AbortSignal.timeout(15000),
        headers: {
          'User-Agent': 'GrowthOS-SEO-Auditor/1.0 (compatible; +https://growtos.app/bot)',
        },
      });
      
      const loadTime = Date.now() - fetchStart;
      
      const pageData: PageData = {
        url: currentUrl,
        status_code: response.status,
        h1_count: 0,
        has_schema: false,
        schema_types: [],
        internal_links: [],
        external_links: [],
        word_count: 0,
        load_time_ms: loadTime,
        errors: [],
      };
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const html = await response.text();
          const parsed = parseHtml(html, currentUrl, normalizedBase);
          Object.assign(pageData, parsed);
          
          if (sitemapUrls.length === 0) {
            for (const link of pageData.internal_links) {
              if (!visited.has(link) && !toVisit.includes(link)) {
                toVisit.push(link);
              }
            }
          }
        }
      }
      
      pages.push(pageData);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Failed to crawl ${currentUrl}: ${errorMessage}`);
    }
  }
  
  const issues = analyzePages(pages, normalizedBase);
  
  return {
    pages_crawled: pages.length,
    pages_total: sitemapUrls.length || visited.size,
    issues,
    errors,
    duration_ms: Date.now() - startTime,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, max_pages = 50, respect_robots = true, workspace_id, site_id } = await req.json();

    if (!url || !workspace_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL and workspace_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate authentication and workspace access
    const authResult = await validateRequest(req, workspace_id, site_id);
    if (!authResult.valid || !authResult.serviceClient) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If site_id provided, validate URL matches the site's domain
    if (site_id && authResult.siteUrl) {
      const requestedDomain = new URL(url).hostname.toLowerCase();
      const siteDomain = authResult.siteUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      
      if (!requestedDomain.includes(siteDomain) && !siteDomain.includes(requestedDomain)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'URL does not match the site domain' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Security: Block dangerous URLs
    if (isBlockedUrl(url)) {
      console.error('Blocked URL attempt:', url);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'URL blocked for security reasons (private IP, localhost, or metadata endpoint)' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting crawl for ${url}, max ${max_pages} pages, workspace: ${workspace_id}, user: ${authResult.userId}`);

    // Apply quota limits based on plan
    const effectiveMaxPages = Math.min(max_pages, 100);

    const result = await crawlSite(url, effectiveMaxPages, respect_robots);

    console.log(`Crawl completed: ${result.pages_crawled} pages, ${result.issues.length} issues`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to crawl';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
