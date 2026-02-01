/**
 * Enhanced useContent hook with complete CRUD operations
 * Adds: deleteBrief, updateBrief, createDraft, updateDraft, deleteDraft, addKeyword, deleteKeyword
 */
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { toast } from 'sonner';

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
  // Brief CRUD
  createBrief: (data: Partial<ContentBrief>) => Promise<{ error: Error | null }>;
  updateBrief: (briefId: string, data: Partial<ContentBrief>) => Promise<{ error: Error | null }>;
  deleteBrief: (briefId: string) => Promise<{ error: Error | null }>;
  updateBriefStatus: (briefId: string, status: string) => Promise<{ error: Error | null }>;
  // Draft CRUD
  createDraft: (data: Partial<ContentDraft>) => Promise<{ error: Error | null; draft: ContentDraft | null }>;
  updateDraft: (draftId: string, data: Partial<ContentDraft>) => Promise<{ error: Error | null }>;
  deleteDraft: (draftId: string) => Promise<{ error: Error | null }>;
  // Keyword CRUD
  addTrackedKeyword: (keyword: string, intent?: string) => Promise<{ error: Error | null }>;
  removeTrackedKeyword: (keywordId: string) => Promise<{ error: Error | null }>;
  updateKeywordTracking: (keywordId: string, isTracked: boolean) => Promise<{ error: Error | null }>;
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

  const fetchContent = useCallback(async () => {
    if (!currentWorkspace || !currentSite) {
      setKeywords([]);
      setClusters([]);
      setBriefs([]);
      setDrafts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
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
    } catch (error) {
      console.error('[useContent] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, currentSite]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // === BRIEF CRUD ===

  const createBrief = async (data: Partial<ContentBrief>) => {
    if (!currentWorkspace || !currentSite) {
      return { error: new Error('No workspace or site selected') };
    }

    const { error } = await supabase.from('content_briefs').insert({
      title: data.title || 'Untitled Brief',
      target_keyword: data.target_keyword || null,
      word_count_target: data.word_count_target || null,
      workspace_id: currentWorkspace.id,
      site_id: currentSite.id,
    } as any);

    if (error) {
      toast.error('Erreur lors de la création du brief');
    } else {
      toast.success('Brief créé avec succès');
      fetchContent();
    }
    return { error: error as Error | null };
  };

  const updateBrief = async (briefId: string, data: Partial<ContentBrief>) => {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.target_keyword !== undefined) updateData.target_keyword = data.target_keyword;
    if (data.word_count_target !== undefined) updateData.word_count_target = data.word_count_target;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to;
    if (data.brief_content !== undefined) updateData.brief_content = data.brief_content;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await supabase
      .from('content_briefs')
      .update(updateData)
      .eq('id', briefId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Brief mis à jour');
      fetchContent();
    }
    return { error: error as Error | null };
  };

  const deleteBrief = async (briefId: string) => {
    const { error } = await supabase
      .from('content_briefs')
      .delete()
      .eq('id', briefId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Brief supprimé');
      fetchContent();
    }
    return { error: error as Error | null };
  };

  const updateBriefStatus = async (briefId: string, status: string) => {
    return updateBrief(briefId, { status });
  };

  // === DRAFT CRUD ===

  const createDraft = async (data: Partial<ContentDraft>) => {
    if (!currentWorkspace || !currentSite) {
      return { error: new Error('No workspace or site selected'), draft: null };
    }

    const { data: draft, error } = await supabase
      .from('content_drafts')
      .insert({
        title: data.title || 'Untitled Draft',
        content: data.content,
        brief_id: data.brief_id,
        meta_description: data.meta_description,
        ai_generated: data.ai_generated || false,
        workspace_id: currentWorkspace.id,
        site_id: currentSite.id,
        status: 'draft',
        version: 1,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de la création du brouillon');
    } else {
      toast.success('Brouillon créé');
      fetchContent();
    }
    return { error: error as Error | null, draft: draft as ContentDraft | null };
  };

  const updateDraft = async (draftId: string, data: Partial<ContentDraft>) => {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.meta_description !== undefined) updateData.meta_description = data.meta_description;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await supabase
      .from('content_drafts')
      .update(updateData)
      .eq('id', draftId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Brouillon mis à jour');
      fetchContent();
    }
    return { error: error as Error | null };
  };

  const deleteDraft = async (draftId: string) => {
    const { error } = await supabase
      .from('content_drafts')
      .delete()
      .eq('id', draftId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Brouillon supprimé');
      fetchContent();
    }
    return { error: error as Error | null };
  };

  // === KEYWORD CRUD ===

  const addTrackedKeyword = async (keyword: string, intent?: string) => {
    if (!currentWorkspace || !currentSite) {
      return { error: new Error('No workspace or site selected') };
    }

    const { error } = await supabase.from('keywords').insert({
      keyword,
      intent,
      is_tracked: true,
      workspace_id: currentWorkspace.id,
      site_id: currentSite.id,
    });

    if (error) {
      toast.error('Erreur lors de l\'ajout du mot-clé');
    } else {
      toast.success('Mot-clé ajouté au suivi');
      fetchContent();
    }
    return { error: error as Error | null };
  };

  const removeTrackedKeyword = async (keywordId: string) => {
    const { error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', keywordId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Mot-clé supprimé');
      fetchContent();
    }
    return { error: error as Error | null };
  };

  const updateKeywordTracking = async (keywordId: string, isTracked: boolean) => {
    const { error } = await supabase
      .from('keywords')
      .update({ is_tracked: isTracked })
      .eq('id', keywordId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(isTracked ? 'Mot-clé suivi' : 'Mot-clé retiré du suivi');
      fetchContent();
    }
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
      updateBrief,
      deleteBrief,
      updateBriefStatus,
      createDraft,
      updateDraft,
      deleteDraft,
      addTrackedKeyword,
      removeTrackedKeyword,
      updateKeywordTracking,
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
