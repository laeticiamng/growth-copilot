import { supabase } from '@/integrations/supabase/client';

// Demo data for showcasing the platform without real integrations
export const seedDemoData = async (workspaceId: string, siteId: string) => {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();

  try {
    // Seed action_log with demo actions
    await supabase.from('action_log').insert([
      {
        workspace_id: workspaceId,
        actor_type: 'agent',
        actor_id: 'tech_auditor',
        action_type: 'crawl_complete',
        action_category: 'seo',
        description: 'Crawl terminé : 145 pages analysées, 23 issues détectées',
        result: 'success',
        is_automated: true,
        created_at: now,
      },
      {
        workspace_id: workspaceId,
        actor_type: 'agent',
        actor_id: 'keyword_strategist',
        action_type: 'keywords_analyzed',
        action_category: 'content',
        description: 'Analyse mots-clés : 87 opportunités identifiées, 12 quick wins',
        result: 'success',
        is_automated: true,
        created_at: yesterday,
      },
      {
        workspace_id: workspaceId,
        actor_type: 'agent',
        actor_id: 'local_manager',
        action_type: 'gbp_audit',
        action_category: 'local',
        description: 'Audit GBP : score 72/100, 5 optimisations recommandées',
        result: 'success',
        is_automated: true,
        created_at: lastWeek,
      },
      {
        workspace_id: workspaceId,
        actor_type: 'user',
        actor_id: 'system',
        action_type: 'workspace_created',
        action_category: 'config',
        description: 'Workspace créé avec succès',
        result: 'success',
        is_automated: false,
        created_at: lastWeek,
      },
    ]);

    // Seed agent_runs with demo runs
    await supabase.from('agent_runs').insert([
      {
        workspace_id: workspaceId,
        site_id: siteId,
        agent_type: 'tech_auditor',
        status: 'completed',
        inputs: { url: 'https://example.com', depth: 3 },
        outputs: { pages_crawled: 145, issues_found: 23, score: 78 },
        started_at: new Date(Date.now() - 60000).toISOString(),
        completed_at: now,
        duration_ms: 45000,
        cost_estimate: 0.02,
      },
      {
        workspace_id: workspaceId,
        site_id: siteId,
        agent_type: 'keyword_strategist',
        status: 'completed',
        inputs: { site_id: siteId },
        outputs: { keywords_found: 87, quick_wins: 12, clusters: 8 },
        started_at: new Date(Date.now() - 120000).toISOString(),
        completed_at: new Date(Date.now() - 60000).toISOString(),
        duration_ms: 32000,
        cost_estimate: 0.015,
      },
      {
        workspace_id: workspaceId,
        site_id: siteId,
        agent_type: 'content_builder',
        status: 'running',
        inputs: { keyword: 'seo local 2024' },
        outputs: null,
        started_at: now,
        completed_at: null,
        duration_ms: null,
        cost_estimate: null,
      },
    ]);

    // Seed issues for SEO module
    await supabase.from('issues').insert([
      {
        workspace_id: workspaceId,
        site_id: siteId,
        title: 'Balises title dupliquées',
        issue_type: 'duplicate_title',
        category: 'seo_tech',
        severity: 'high',
        description: '12 pages partagent le même titre',
        recommendation: 'Créer des titres uniques pour chaque page',
        impact_score: 85,
        effort_score: 30,
        auto_fixable: false,
        status: 'open',
      },
      {
        workspace_id: workspaceId,
        site_id: siteId,
        title: 'Images sans attribut alt',
        issue_type: 'missing_alt',
        category: 'seo_tech',
        severity: 'medium',
        description: '45 images sans texte alternatif',
        recommendation: 'Ajouter des attributs alt descriptifs',
        impact_score: 60,
        effort_score: 40,
        auto_fixable: true,
        status: 'open',
      },
      {
        workspace_id: workspaceId,
        site_id: siteId,
        title: 'Pages lentes (>3s)',
        issue_type: 'slow_pages',
        category: 'performance',
        severity: 'high',
        description: '8 pages avec un temps de chargement supérieur à 3 secondes',
        recommendation: 'Optimiser les images et activer la mise en cache',
        impact_score: 90,
        effort_score: 60,
        auto_fixable: false,
        status: 'open',
      },
    ]);

    // Seed keywords
    await supabase.from('keywords').insert([
      {
        workspace_id: workspaceId,
        site_id: siteId,
        keyword: 'agence seo paris',
        search_volume: 2400,
        difficulty: 65,
        position_avg: 12,
        clicks_30d: 45,
        impressions_30d: 890,
        intent: 'transactional',
        is_tracked: true,
      },
      {
        workspace_id: workspaceId,
        site_id: siteId,
        keyword: 'référencement naturel',
        search_volume: 8100,
        difficulty: 78,
        position_avg: 24,
        clicks_30d: 23,
        impressions_30d: 1250,
        intent: 'informational',
        is_tracked: true,
      },
      {
        workspace_id: workspaceId,
        site_id: siteId,
        keyword: 'audit seo gratuit',
        search_volume: 1900,
        difficulty: 45,
        position_avg: 8,
        clicks_30d: 89,
        impressions_30d: 560,
        intent: 'transactional',
        is_tracked: true,
      },
    ]);

    // Seed KPIs
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const kpis = dates.map(date => ({
      workspace_id: workspaceId,
      site_id: siteId,
      date,
      organic_clicks: Math.floor(Math.random() * 200 + 100),
      organic_impressions: Math.floor(Math.random() * 5000 + 2000),
      organic_sessions: Math.floor(Math.random() * 300 + 150),
      avg_position: Math.random() * 10 + 15,
      total_leads: Math.floor(Math.random() * 10 + 2),
      total_conversions: Math.floor(Math.random() * 5 + 1),
      conversion_rate: Math.random() * 3 + 1,
    }));

    await supabase.from('kpis_daily').insert(kpis);

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Check if workspace has demo data
export const hasDemoData = async (workspaceId: string): Promise<boolean> => {
  const { count } = await supabase
    .from('action_log')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);
  
  return (count || 0) > 0;
};
