import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";

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
    
    // Block non-HTTP(S) protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return true;
    }
    
    return false;
  } catch {
    return true; // Block malformed URLs
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
  crawl_method: 'firecrawl' | 'native';
}

interface FirecrawlPage {
  url: string;
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    statusCode?: number;
    sourceURL?: string;
  };
  links?: string[];
}

// Parse HTML to extract SEO data (native crawler)
function parseHtml(html: string, url: string, baseUrl: string): Partial<PageData> {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || [];
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  
  // Schema detection
  const schemaMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi) || [];
  const schemaTypes: string[] = [];
  for (const schema of schemaMatches) {
    const typeMatch = schema.match(/"@type"\s*:\s*"([^"]+)"/);
    if (typeMatch) {
      schemaTypes.push(typeMatch[1]);
    }
  }
  
  // Links extraction
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
  
  // Word count (rough estimate)
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

// Parse Firecrawl HTML for SEO data
function parseFirecrawlPage(page: FirecrawlPage, baseUrl: string): PageData {
  const html = page.html || '';
  const parsed = parseHtml(html, page.url, baseUrl);
  
  return {
    url: page.url,
    status_code: page.metadata?.statusCode || 200,
    title: page.metadata?.title || parsed.title,
    meta_description: page.metadata?.description || parsed.meta_description,
    h1: parsed.h1,
    h1_count: parsed.h1_count || 0,
    canonical: parsed.canonical,
    robots_meta: parsed.robots_meta,
    has_schema: parsed.has_schema || false,
    schema_types: parsed.schema_types || [],
    internal_links: parsed.internal_links || [],
    external_links: parsed.external_links || [],
    word_count: parsed.word_count || 0,
    load_time_ms: 0, // Firecrawl doesn't provide this
    errors: [],
  };
}

// Analyze pages and generate issues
function analyzePages(pages: PageData[], baseUrl: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const titles = new Map<string, string[]>();
  const metas = new Map<string, string[]>();
  const allLinkedUrls = new Set<string>();
  
  // Collect all linked URLs for orphan detection
  for (const page of pages) {
    for (const link of page.internal_links) {
      allLinkedUrls.add(link);
    }
  }
  
  for (const page of pages) {
    // HTTP errors
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
    
    // Missing title
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
      // Track for duplicate detection
      const existing = titles.get(page.title) || [];
      existing.push(page.url);
      titles.set(page.title, existing);
    }
    
    // Missing meta description
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
    
    // Missing H1
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
    
    // Missing schema
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
    
    // Noindex check
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
    
    // Orphan page detection (simplified)
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
  
  // Check for duplicates
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
  
  // Sort by ICE score descending
  issues.sort((a, b) => b.ice_score - a.ice_score);
  
  return issues;
}

// ============ FIRECRAWL INTEGRATION ============

// Map site URLs using Firecrawl (fast sitemap discovery)
async function firecrawlMapSite(baseUrl: string, apiKey: string, limit: number): Promise<string[]> {
  console.log(`[Firecrawl] Mapping site: ${baseUrl}`);
  
  const response = await fetch('https://api.firecrawl.dev/v1/map', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: baseUrl,
      limit: limit,
      includeSubdomains: false,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('[Firecrawl] Map error:', data);
    throw new Error(`Firecrawl map failed: ${data.error || response.status}`);
  }
  
  console.log(`[Firecrawl] Mapped ${data.links?.length || 0} URLs`);
  return data.links || [];
}

// Crawl site using Firecrawl (full recursive crawl)
async function firecrawlCrawlSite(
  baseUrl: string, 
  apiKey: string, 
  maxPages: number
): Promise<CrawlResult> {
  const startTime = Date.now();
  
  console.log(`[Firecrawl] Starting crawl: ${baseUrl}, max ${maxPages} pages`);
  
  // Start the crawl job
  const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: baseUrl,
      limit: maxPages,
      scrapeOptions: {
        formats: ['html', 'markdown'],
      },
    }),
  });
  
  const crawlData = await crawlResponse.json();
  
  if (!crawlResponse.ok) {
    console.error('[Firecrawl] Crawl error:', crawlData);
    throw new Error(`Firecrawl crawl failed: ${crawlData.error || crawlResponse.status}`);
  }
  
  // Firecrawl returns results directly for small crawls, or a job ID for async
  let crawledPages: FirecrawlPage[] = [];
  
  if (crawlData.data) {
    // Direct results
    crawledPages = crawlData.data;
    console.log(`[Firecrawl] Direct results: ${crawledPages.length} pages`);
  } else if (crawlData.id) {
    // Async job - poll for results
    console.log(`[Firecrawl] Async job started: ${crawlData.id}`);
    
    const maxWaitMs = 120000; // 2 minutes max
    const pollInterval = 3000;
    const jobStartTime = Date.now();
    
    while (Date.now() - jobStartTime < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlData.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        crawledPages = statusData.data || [];
        console.log(`[Firecrawl] Job completed: ${crawledPages.length} pages`);
        break;
      } else if (statusData.status === 'failed') {
        throw new Error(`Firecrawl job failed: ${statusData.error || 'Unknown error'}`);
      }
      
      console.log(`[Firecrawl] Job status: ${statusData.status}, ${statusData.completed || 0}/${statusData.total || '?'} pages`);
    }
  }
  
  // Parse Firecrawl pages into our PageData format
  const url = new URL(baseUrl);
  const normalizedBase = `${url.protocol}//${url.hostname}`;
  
  const pages: PageData[] = crawledPages.map(page => parseFirecrawlPage(page, normalizedBase));
  
  // Analyze and generate issues
  const issues = analyzePages(pages, normalizedBase);
  
  return {
    pages_crawled: pages.length,
    pages_total: crawlData.total || pages.length,
    issues,
    errors: [],
    duration_ms: Date.now() - startTime,
    crawl_method: 'firecrawl',
  };
}

// ============ NATIVE CRAWLER ============

// Fetch sitemap URLs (native)
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
            // Nested sitemap - fetch it too
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

// Check robots.txt (native)
async function checkRobotsTxt(baseUrl: string): Promise<{ allowed: boolean; crawlDelay?: number }> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      return { allowed: true }; // No robots.txt = allowed
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

// Native crawl function (fallback)
async function nativeCrawlSite(
  baseUrl: string,
  maxPages: number,
  respectRobots: boolean
): Promise<CrawlResult> {
  const startTime = Date.now();
  const pages: PageData[] = [];
  const errors: string[] = [];
  const visited = new Set<string>();
  const toVisit: string[] = [];
  
  // Normalize base URL
  const url = new URL(baseUrl);
  const normalizedBase = `${url.protocol}//${url.hostname}`;
  
  // Check robots.txt
  if (respectRobots) {
    const { allowed } = await checkRobotsTxt(normalizedBase);
    if (!allowed) {
      return {
        pages_crawled: 0,
        pages_total: 0,
        issues: [],
        errors: ['Crawling blocked by robots.txt'],
        duration_ms: Date.now() - startTime,
        crawl_method: 'native',
      };
    }
  }
  
  // Try sitemap first
  const sitemapUrls = await fetchSitemapUrls(normalizedBase);
  if (sitemapUrls.length > 0) {
    toVisit.push(...sitemapUrls.slice(0, maxPages));
  } else {
    // Start with homepage
    toVisit.push(normalizedBase);
  }
  
  // Crawl pages
  while (toVisit.length > 0 && pages.length < maxPages) {
    const currentUrl = toVisit.shift()!;
    
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);
    
    // Security check
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
          
          // Add internal links to crawl queue
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
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Failed to crawl ${currentUrl}: ${errorMessage}`);
    }
  }
  
  // Analyze and generate issues
  const issues = analyzePages(pages, normalizedBase);
  
  return {
    pages_crawled: pages.length,
    pages_total: sitemapUrls.length || visited.size,
    issues,
    errors,
    duration_ms: Date.now() - startTime,
    crawl_method: 'native',
  };
}

// ============ MAIN HANDLER ============

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

  try {
    const { 
      url, 
      max_pages = 50, 
      respect_robots = true, 
      workspace_id, 
      site_id,
      use_firecrawl = true, // Default to Firecrawl if available
    } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Block dangerous URLs FIRST (before any authentication)
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

    // Create Supabase client for validation
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // SECURITY: Require workspace_id and site_id for authenticated crawls
    // Validate that the user has access AND the URL matches the site
    if (workspace_id && site_id) {
      const authResult = await validateWorkspaceAccess(
        req,
        workspace_id,
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY
      );

      if (!authResult.authenticated) {
        return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
      }

      if (!authResult.hasAccess) {
        return forbiddenResponse(authResult.error || "Access denied", corsHeaders);
      }

      // SECURITY: Validate that URL belongs to the claimed site
      const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('url')
        .eq('id', site_id)
        .eq('workspace_id', workspace_id)
        .single();

      if (siteError || !site) {
        console.error('Site validation failed:', siteError);
        return new Response(
          JSON.stringify({ success: false, error: 'Site not found or access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify URL matches site's registered URL (same domain)
      try {
        const requestedDomain = new URL(url).hostname.toLowerCase();
        const siteDomain = new URL(site.url).hostname.toLowerCase();
        
        if (requestedDomain !== siteDomain && !requestedDomain.endsWith('.' + siteDomain)) {
          console.error(`URL domain mismatch: requested ${requestedDomain}, site ${siteDomain}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'URL does not match registered site domain' 
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (urlError) {
        console.error('URL parsing error:', urlError);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // SECURITY: Check workspace quota
      const { data: quota } = await supabase
        .rpc('get_workspace_quota', { p_workspace_id: workspace_id });

      if (quota && quota[0]) {
        const planLimits: Record<string, number> = {
          free: 25,
          starter: 50,
          pro: 100,
          enterprise: 500,
        };
        const planLimit = planLimits[quota[0].plan_tier] || 25;
        
        if (max_pages > planLimit) {
          console.log(`[SEO Crawler] Limiting max_pages from ${max_pages} to ${planLimit} for ${quota[0].plan_tier} plan`);
        }
      }
    } else if (workspace_id || site_id) {
      // If only one is provided, require both
      return new Response(
        JSON.stringify({ success: false, error: 'Both workspace_id and site_id are required for authenticated crawls' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Note: If neither workspace_id nor site_id provided, allow public crawl (limited)

    // Apply quota limits based on plan (or hard limit for unauthenticated)
    const effectiveMaxPages = workspace_id 
      ? Math.min(max_pages, 100) 
      : Math.min(max_pages, 10); // Strict limit for unauthenticated
    
    let result: CrawlResult;
    
    // Use Firecrawl if available and requested
    if (use_firecrawl && FIRECRAWL_API_KEY) {
      console.log(`[SEO Crawler] Using Firecrawl for ${url}, max ${effectiveMaxPages} pages, workspace: ${workspace_id || 'public'}`);
      
      try {
        result = await firecrawlCrawlSite(url, FIRECRAWL_API_KEY, effectiveMaxPages);
      } catch (firecrawlError) {
        console.error('[SEO Crawler] Firecrawl failed, falling back to native:', firecrawlError);
        // Fallback to native crawler
        result = await nativeCrawlSite(url, effectiveMaxPages, respect_robots);
      }
    } else {
      // Use native crawler
      console.log(`[SEO Crawler] Using native crawler for ${url}, max ${effectiveMaxPages} pages, workspace: ${workspace_id || 'public'}`);
      result = await nativeCrawlSite(url, effectiveMaxPages, respect_robots);
    }

    console.log(`[SEO Crawler] Completed (${result.crawl_method}): ${result.pages_crawled} pages, ${result.issues.length} issues`);

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
