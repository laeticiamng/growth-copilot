import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';

interface Keyword {
  id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  position_avg: number | null;
  clicks_30d: number | null;
  impressions_30d: number | null;
  ctr_30d: number | null;
  intent: string | null;
  is_tracked: boolean | null;
}

interface KeywordCluster {
  id: string;
  name: string;
  main_intent: string | null;
  keywords_count: number | null;
  total_volume: number | null;
}

interface ContentBrief {
  id: string;
  title: string;
  target_keyword: string | null;
  status: string | null;
  word_count_target: number | null;
  brief_content: Record<string, unknown> | null;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string | null;
}

interface ContentDraft {
  id: string;
  title: string;
  content: string | null;
  status: string | null;
  meta_description: string | null;
  ai_generated: boolean | null;
  version: number | null;
  brief_id: string | null;
}

interface ContentContextType {
  keywords: Keyword[];
  clusters: KeywordCluster[];
  briefs: ContentBrief[];
  drafts: ContentDraft[];
  loading: boolean;
  refetch: () => void;
  createBrief: (data: Partial<ContentBrief>) => Promise<{ error: Error | null }>;
  updateBriefStatus: (briefId: string, status: string) => Promise<{ error: Error | null }>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const [briefs, setBriefs] = useState<ContentBrief[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    if (!currentWorkspace || !currentSite) {
      setKeywords([]);
      setClusters([]);
      setBriefs([]);
      setDrafts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const [keywordsRes, clustersRes, briefsRes, draftsRes] = await Promise.all([
      supabase.from('keywords').select('*').eq('site_id', currentSite.id).order('search_volume', { ascending: false }).limit(100),
      supabase.from('keyword_clusters').select('*').eq('site_id', currentSite.id).order('total_volume', { ascending: false }),
      supabase.from('content_briefs').select('*').eq('site_id', currentSite.id).order('created_at', { ascending: false }),
      supabase.from('content_drafts').select('*').eq('site_id', currentSite.id).order('updated_at', { ascending: false }),
    ]);

    setKeywords((keywordsRes.data || []) as Keyword[]);
    setClusters((clustersRes.data || []) as KeywordCluster[]);
    setBriefs((briefsRes.data || []) as ContentBrief[]);
    setDrafts((draftsRes.data || []) as ContentDraft[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [currentWorkspace, currentSite]);

  const createBrief = async (data: Partial<ContentBrief>) => {
    if (!currentWorkspace || !currentSite) {
      return { error: new Error('No workspace or site selected') };
    }

    const { error } = await supabase.from('content_briefs').insert({
      title: data.title || 'Untitled Brief',
      target_keyword: data.target_keyword,
      word_count_target: data.word_count_target,
      workspace_id: currentWorkspace.id,
      site_id: currentSite.id,
    });

    if (!error) fetchContent();
    return { error: error as Error | null };
  };

  const updateBriefStatus = async (briefId: string, status: 'draft' | 'review' | 'approved' | 'published' | 'archived') => {
    const { error } = await supabase
      .from('content_briefs')
      .update({ status })
      .eq('id', briefId);

    if (!error) fetchContent();
    return { error: error as Error | null };
  };

  return (
    <ContentContext.Provider value={{
      keywords,
      clusters,
      briefs,
      drafts,
      loading,
      refetch: fetchContent,
      createBrief,
      updateBriefStatus,
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
