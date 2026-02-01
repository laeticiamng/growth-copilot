/**
 * Enhanced useCRO hook with complete CRUD operations
 * Adds: deleteExperiment, createVariant, updateVariant, deleteVariant, createAudit
 */
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { toast } from 'sonner';

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
  // Experiment CRUD
  createExperiment: (data: Partial<CROExperiment>) => Promise<{ error: Error | null; experiment: CROExperiment | null }>;
  updateExperiment: (experimentId: string, data: Partial<CROExperiment>) => Promise<{ error: Error | null }>;
  deleteExperiment: (experimentId: string) => Promise<{ error: Error | null }>;
  updateExperimentStatus: (experimentId: string, status: string) => Promise<{ error: Error | null }>;
  declareWinner: (experimentId: string, variantId: string) => Promise<{ error: Error | null }>;
  // Variant CRUD
  createVariant: (experimentId: string, data: Partial<CROVariant>) => Promise<{ error: Error | null; variant: CROVariant | null }>;
  updateVariant: (variantId: string, data: Partial<CROVariant>) => Promise<{ error: Error | null }>;
  deleteVariant: (variantId: string) => Promise<{ error: Error | null }>;
  // Audit
  createAudit: (pageUrl: string, pageType?: string) => Promise<{ error: Error | null }>;
  getExperimentVariants: (experimentId: string) => CROVariant[];
}

const CROContext = createContext<CROContextType | undefined>(undefined);

export function CROProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [audits, setAudits] = useState<CROAudit[]>([]);
  const [experiments, setExperiments] = useState<CROExperiment[]>([]);
  const [variants, setVariants] = useState<CROVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCRO = useCallback(async () => {
    if (!currentWorkspace || !currentSite) {
      setAudits([]);
      setExperiments([]);
      setVariants([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [auditsRes, experimentsRes, variantsRes] = await Promise.all([
        supabase.from('cro_audits').select('*').eq('site_id', currentSite.id).order('created_at', { ascending: false }),
        supabase.from('cro_experiments').select('*').eq('site_id', currentSite.id).order('created_at', { ascending: false }),
        supabase.from('cro_variants').select('*').eq('workspace_id', currentWorkspace.id),
      ]);

      setAudits((auditsRes.data || []) as CROAudit[]);
      setExperiments((experimentsRes.data || []) as CROExperiment[]);
      setVariants((variantsRes.data || []) as CROVariant[]);
    } catch (error) {
      console.error('[useCRO] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, currentSite]);

  useEffect(() => {
    fetchCRO();
  }, [fetchCRO]);

  // === EXPERIMENT CRUD ===

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
        test_type: data.test_type || 'ab',
        status: 'draft',
        workspace_id: currentWorkspace.id,
        site_id: currentSite.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Expérience créée');
      fetchCRO();
    }
    return { error: error as Error | null, experiment: experiment as CROExperiment | null };
  };

  const updateExperiment = async (experimentId: string, data: Partial<CROExperiment>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.hypothesis !== undefined) updateData.hypothesis = data.hypothesis;
    if (data.page_url !== undefined) updateData.page_url = data.page_url;
    if (data.element_type !== undefined) updateData.element_type = data.element_type;
    if (data.test_type !== undefined) updateData.test_type = data.test_type;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await supabase
      .from('cro_experiments')
      .update(updateData)
      .eq('id', experimentId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Expérience mise à jour');
      fetchCRO();
    }
    return { error: error as Error | null };
  };

  const deleteExperiment = async (experimentId: string) => {
    // First delete related variants
    await supabase.from('cro_variants').delete().eq('experiment_id', experimentId);
    
    const { error } = await supabase
      .from('cro_experiments')
      .delete()
      .eq('id', experimentId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Expérience supprimée');
      fetchCRO();
    }
    return { error: error as Error | null };
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

    if (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } else {
      toast.success(`Expérience ${status === 'running' ? 'lancée' : status === 'completed' ? 'terminée' : 'mise à jour'}`);
      fetchCRO();
    }
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

    if (error) {
      toast.error('Erreur lors de la déclaration du gagnant');
    } else {
      toast.success('Gagnant déclaré');
      fetchCRO();
    }
    return { error: error as Error | null };
  };

  // === VARIANT CRUD ===

  const createVariant = async (experimentId: string, data: Partial<CROVariant>) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected'), variant: null };
    }

    const { data: variant, error } = await supabase
      .from('cro_variants')
      .insert({
        experiment_id: experimentId,
        name: data.name || 'Variant',
        is_control: data.is_control || false,
        workspace_id: currentWorkspace.id,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de la création de la variante');
    } else {
      toast.success('Variante créée');
      fetchCRO();
    }
    return { error: error as Error | null, variant: variant as CROVariant | null };
  };

  const updateVariant = async (variantId: string, data: Partial<CROVariant>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.changes !== undefined) updateData.changes = data.changes;
    if (data.is_control !== undefined) updateData.is_control = data.is_control;

    const { error } = await supabase
      .from('cro_variants')
      .update(updateData)
      .eq('id', variantId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Variante mise à jour');
      fetchCRO();
    }
    return { error: error as Error | null };
  };

  const deleteVariant = async (variantId: string) => {
    const { error } = await supabase
      .from('cro_variants')
      .delete()
      .eq('id', variantId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Variante supprimée');
      fetchCRO();
    }
    return { error: error as Error | null };
  };

  // === AUDIT ===

  const createAudit = async (pageUrl: string, pageType?: string) => {
    if (!currentWorkspace || !currentSite) {
      return { error: new Error('No workspace or site selected') };
    }

    // In real implementation, this would call an edge function to analyze the page
    const { error } = await supabase.from('cro_audits').insert({
      page_type: pageType || 'landing',
      friction_score: null, // Will be filled by analysis
      findings: [],
      recommendations: [],
      workspace_id: currentWorkspace.id,
      site_id: currentSite.id,
    });

    if (error) {
      toast.error('Erreur lors de la création de l\'audit');
    } else {
      toast.success('Audit créé');
      fetchCRO();
    }
    return { error: error as Error | null };
  };

  const getExperimentVariants = (experimentId: string): CROVariant[] => {
    return variants.filter(v => v.experiment_id === experimentId);
  };

  return (
    <CROContext.Provider value={{
      audits,
      experiments,
      variants,
      loading,
      refetch: fetchCRO,
      createExperiment,
      updateExperiment,
      deleteExperiment,
      updateExperimentStatus,
      declareWinner,
      createVariant,
      updateVariant,
      deleteVariant,
      createAudit,
      getExperimentVariants,
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
