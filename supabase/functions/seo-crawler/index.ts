const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

  try {
    const { url, max_pages = 50, workspace_id, site_id } = await req.json();

    if (!url) return new Response(JSON.stringify({ error: 'URL required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Block private IPs
    try {
      const u = new URL(url);
      if (/^(127\.|10\.|192\.168\.|localhost)/i.test(u.hostname)) {
        return new Response(JSON.stringify({ error: 'URL blocked' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } catch { return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

    const start = Date.now();
    const limit = Math.min(max_pages, 50);
    let pages: any[] = [];
    let method: 'firecrawl' | 'native' = 'native';

    // Firecrawl
    if (FIRECRAWL_API_KEY) {
      try {
        console.log('[SEO] Firecrawl:', url);
        const res = await fetch('https://api.firecrawl.dev/v1/crawl', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, limit, scrapeOptions: { formats: ['html'] } }),
        });
        const data = await res.json();
        
        if (data.data) { pages = data.data; method = 'firecrawl'; }
        else if (data.id) {
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const s = await (await fetch(`https://api.firecrawl.dev/v1/crawl/${data.id}`, { headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}` } })).json();
            if (s.status === 'completed') { pages = s.data || []; method = 'firecrawl'; break; }
            if (s.status === 'failed') break;
          }
        }
      } catch (e) { console.error('[Firecrawl]', e); }
    }

    // Native fallback
    if (pages.length === 0) {
      console.log('[SEO] Native:', url);
      const res = await fetch(url, { headers: { 'User-Agent': 'GrowthOS-Bot/1.0' } });
      pages = [{ url, html: await res.text(), metadata: { statusCode: res.status } }];
    }

    // Parse & analyze
    interface Issue { id: string; type: string; severity: string; title: string; description: string; affected_urls: string[]; recommendation: string; ice_score: number; auto_fixable: boolean; }
    const issues: Issue[] = [];
    const titles = new Map<string, string[]>();
    
    for (const p of pages) {
      const html = p.html || '';
      const pageUrl = p.url || url;
      const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
      const meta = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim();
      const h1s = (html.match(/<h1[^>]*>/gi) || []).length;
      const schema = html.includes('application/ld+json');
      const noindex = /<meta[^>]*robots[^>]*noindex/i.test(html);

      if (!title) issues.push({ id: `t-${pageUrl}`, type: 'missing_title', severity: 'critical', title: 'Title manquant', description: pageUrl, affected_urls: [pageUrl], recommendation: 'Ajouter un title 50-60 caractères', ice_score: 85, auto_fixable: false });
      else { const e = titles.get(title) || []; e.push(pageUrl); titles.set(title, e); }
      if (!meta) issues.push({ id: `m-${pageUrl}`, type: 'missing_meta', severity: 'high', title: 'Meta description manquante', description: pageUrl, affected_urls: [pageUrl], recommendation: 'Ajouter meta 150-160 caractères', ice_score: 70, auto_fixable: true });
      if (h1s === 0) issues.push({ id: `h-${pageUrl}`, type: 'missing_h1', severity: 'high', title: 'H1 manquant', description: pageUrl, affected_urls: [pageUrl], recommendation: 'Ajouter un H1 unique', ice_score: 68, auto_fixable: false });
      if (!schema) issues.push({ id: `s-${pageUrl}`, type: 'missing_schema', severity: 'medium', title: 'Schema.org manquant', description: pageUrl, affected_urls: [pageUrl], recommendation: 'Ajouter balisage structuré', ice_score: 55, auto_fixable: true });
      if (noindex) issues.push({ id: `n-${pageUrl}`, type: 'noindex', severity: 'high', title: 'Page en noindex', description: pageUrl, affected_urls: [pageUrl], recommendation: 'Vérifier si intentionnel', ice_score: 80, auto_fixable: false });
    }

    for (const [t, urls] of titles) if (urls.length > 1) issues.push({ id: 'dup', type: 'duplicate_title', severity: 'high', title: 'Titles dupliqués', description: `${urls.length} pages partagent "${t.substring(0, 30)}..."`, affected_urls: urls, recommendation: 'Titles uniques par page', ice_score: 72, auto_fixable: false });

    issues.sort((a, b) => b.ice_score - a.ice_score);

    console.log(`[SEO] Done: ${pages.length} pages, ${issues.length} issues (${method})`);

    return new Response(JSON.stringify({
      pages_crawled: pages.length,
      pages_total: pages.length,
      issues,
      errors: [],
      duration_ms: Date.now() - start,
      crawl_method: method,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[SEO error]', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Crawl failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
