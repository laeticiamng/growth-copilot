import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';

interface CROAudit {
  id: string;
  page_id: string | null;
  page_type: string | null;
  friction_score: number | null;
  findings: unknown[] | null;
  recommendations: unknown[] | null;
  created_at: string | null;
}

interface CROExperiment {
  id: string;
  name: string;
  hypothesis: string | null;
  page_url: string | null;
  element_type: string | null;
  test_type: string | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  winner_variant_id: string | null;
}

interface CROVariant {
  id: string;
  experiment_id: string;
  name: string;
  is_control: boolean | null;
  changes: Record<string, unknown> | null;
  visitors: number | null;
  conversions: number | null;
  conversion_rate: number | null;
}

interface CROContextType {
  audits: CROAudit[];
  experiments: CROExperiment[];
  variants: CROVariant[];
  loading: boolean;
  refetch: () => void;
  createExperiment: (data: Partial<CROExperiment>) => Promise<{ error: Error | null; experiment: CROExperiment | null }>;
  updateExperimentStatus: (experimentId: string, status: string) => Promise<{ error: Error | null }>;
  declareWinner: (experimentId: string, variantId: string) => Promise<{ error: Error | null }>;
}

const CROContext = createContext<CROContextType | undefined>(undefined);

export function CROProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [audits, setAudits] = useState<CROAudit[]>([]);
  const [experiments, setExperiments] = useState<CROExperiment[]>([]);
  const [variants, setVariants] = useState<CROVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCRO = async () => {
    if (!currentWorkspace || !currentSite) {
      setAudits([]);
      setExperiments([]);
      setVariants([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [auditsRes, experimentsRes, variantsRes] = await Promise.all([
      supabase.from('cro_audits').select('*').eq('site_id', currentSite.id).order('created_at', { ascending: false }),
      supabase.from('cro_experiments').select('*').eq('site_id', currentSite.id).order('created_at', { ascending: false }),
      supabase.from('cro_variants').select('*').eq('workspace_id', currentWorkspace.id),
    ]);

    setAudits((auditsRes.data || []) as CROAudit[]);
    setExperiments((experimentsRes.data || []) as CROExperiment[]);
    setVariants((variantsRes.data || []) as CROVariant[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCRO();
  }, [currentWorkspace, currentSite]);

  const createExperiment = async (data: Partial<CROExperiment>) => {
    if (!currentWorkspace || !currentSite) {
      return { error: new Error('No workspace or site selected'), experiment: null };
    }

    const { data: experiment, error } = await supabase
      .from('cro_experiments')
      .insert({
        name: data.name || 'Untitled Experiment',
        hypothesis: data.hypothesis,
        page_url: data.page_url,
        element_type: data.element_type,
        test_type: data.test_type,
        workspace_id: currentWorkspace.id,
        site_id: currentSite.id,
      })
      .select()
      .single();

    if (!error) fetchCRO();
    return { error: error as Error | null, experiment: experiment as CROExperiment | null };
  };

  const updateExperimentStatus = async (experimentId: string, status: string) => {
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'running') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.ended_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('cro_experiments')
      .update(updateData)
      .eq('id', experimentId);

    if (!error) fetchCRO();
    return { error: error as Error | null };
  };

  const declareWinner = async (experimentId: string, variantId: string) => {
    const { error } = await supabase
      .from('cro_experiments')
      .update({ 
        winner_variant_id: variantId,
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', experimentId);

    if (!error) fetchCRO();
    return { error: error as Error | null };
  };

  return (
    <CROContext.Provider value={{
      audits,
      experiments,
      variants,
      loading,
      refetch: fetchCRO,
      createExperiment,
      updateExperimentStatus,
      declareWinner,
    }}>
      {children}
    </CROContext.Provider>
  );
}

export function useCRO() {
  const context = useContext(CROContext);
  if (context === undefined) {
    throw new Error('useCRO must be used within a CROProvider');
  }
  return context;
}
