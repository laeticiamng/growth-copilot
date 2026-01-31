import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';

interface CompetitorAnalysis {
  id: string;
  competitor_url: string;
  competitor_name: string | null;
  keyword_gaps: unknown[] | null;
  content_gaps: unknown[] | null;
  backlink_comparison: Record<string, unknown> | null;
  insights: Record<string, unknown> | null;
  last_analyzed_at: string | null;
  created_at: string | null;
}

interface CompetitorsContextType {
  competitors: CompetitorAnalysis[];
  loading: boolean;
  refetch: () => void;
  addCompetitor: (url: string, name?: string) => Promise<{ error: Error | null; competitor: CompetitorAnalysis | null }>;
  removeCompetitor: (competitorId: string) => Promise<{ error: Error | null }>;
  analyzeCompetitor: (competitorId: string) => Promise<{ error: Error | null }>;
}

const CompetitorsContext = createContext<CompetitorsContextType | undefined>(undefined);

export function CompetitorsProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompetitors = async () => {
    if (!currentWorkspace || !currentSite) {
      setCompetitors([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('competitor_analysis')
      .select('*')
      .eq('site_id', currentSite.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setCompetitors((data || []) as CompetitorAnalysis[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitors();
  }, [currentWorkspace, currentSite]);

  const addCompetitor = async (url: string, name?: string) => {
    if (!currentWorkspace || !currentSite) {
      return { error: new Error('No workspace or site selected'), competitor: null };
    }

    const { data, error } = await supabase
      .from('competitor_analysis')
      .insert({
        competitor_url: url,
        competitor_name: name || new URL(url).hostname,
        workspace_id: currentWorkspace.id,
        site_id: currentSite.id,
      })
      .select()
      .single();

    if (!error) fetchCompetitors();
    return { error: error as Error | null, competitor: data as CompetitorAnalysis | null };
  };

  const removeCompetitor = async (competitorId: string) => {
    const { error } = await supabase
      .from('competitor_analysis')
      .delete()
      .eq('id', competitorId);

    if (!error) fetchCompetitors();
    return { error: error as Error | null };
  };

  const analyzeCompetitor = async (competitorId: string) => {
    // Placeholder for competitor analysis - would call edge function
    const { error } = await supabase
      .from('competitor_analysis')
      .update({ last_analyzed_at: new Date().toISOString() })
      .eq('id', competitorId);

    if (!error) fetchCompetitors();
    return { error: error as Error | null };
  };

  return (
    <CompetitorsContext.Provider value={{
      competitors,
      loading,
      refetch: fetchCompetitors,
      addCompetitor,
      removeCompetitor,
      analyzeCompetitor,
    }}>
      {children}
    </CompetitorsContext.Provider>
  );
}

export function useCompetitors() {
  const context = useContext(CompetitorsContext);
  if (context === undefined) {
    throw new Error('useCompetitors must be used within a CompetitorsProvider');
  }
  return context;
}
