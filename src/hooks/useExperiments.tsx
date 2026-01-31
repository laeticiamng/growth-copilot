import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { useToast } from './use-toast';

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived';

export interface Experiment {
  id: string;
  workspace_id: string;
  site_id: string | null;
  name: string;
  objective: string;
  hypothesis: string | null;
  primary_metric: string;
  status: ExperimentStatus;
  started_at: string | null;
  ended_at: string | null;
  winner_variant_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ExperimentVariant {
  id: string;
  experiment_id: string;
  workspace_id: string;
  name: string;
  creative_job_id: string | null;
  asset_ids: string[];
  utm_params: Record<string, string>;
  traffic_allocation: number;
  is_control: boolean;
  created_at: string;
}

export interface ExperimentResult {
  id: string;
  experiment_id: string;
  variant_id: string;
  workspace_id: string;
  snapshot_date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr: number | null;
  cvr: number | null;
  cpa: number | null;
  roas: number | null;
  confidence_level: number | null;
  is_significant: boolean;
  data_source: string | null;
  created_at: string;
}

interface CreateExperimentInput {
  name: string;
  objective: string;
  hypothesis?: string;
  primary_metric?: string;
  site_id?: string;
}

interface CreateVariantInput {
  experiment_id: string;
  name: string;
  creative_job_id?: string;
  asset_ids?: string[];
  utm_params?: Record<string, string>;
  traffic_allocation?: number;
  is_control?: boolean;
}

interface ExperimentsContextType {
  experiments: Experiment[];
  variants: ExperimentVariant[];
  results: ExperimentResult[];
  loading: boolean;
  createExperiment: (input: CreateExperimentInput) => Promise<{ error: Error | null; experiment: Experiment | null }>;
  updateExperiment: (id: string, updates: Partial<Experiment>) => Promise<{ error: Error | null }>;
  deleteExperiment: (id: string) => Promise<{ error: Error | null }>;
  startExperiment: (id: string) => Promise<{ error: Error | null }>;
  pauseExperiment: (id: string) => Promise<{ error: Error | null }>;
  completeExperiment: (id: string, winnerId?: string) => Promise<{ error: Error | null }>;
  createVariant: (input: CreateVariantInput) => Promise<{ error: Error | null; variant: ExperimentVariant | null }>;
  updateVariant: (id: string, updates: Partial<ExperimentVariant>) => Promise<{ error: Error | null }>;
  deleteVariant: (id: string) => Promise<{ error: Error | null }>;
  getExperimentVariants: (experimentId: string) => ExperimentVariant[];
  getExperimentResults: (experimentId: string) => ExperimentResult[];
  getWinnerRecommendation: (experimentId: string) => { variant_id: string | null; confidence: number; reason: string } | null;
  refetch: () => void;
}

const ExperimentsContext = createContext<ExperimentsContextType | undefined>(undefined);

export function ExperimentsProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [variants, setVariants] = useState<ExperimentVariant[]>([]);
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiments = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setExperiments([]);
      setVariants([]);
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [expRes, varRes, resRes] = await Promise.all([
        supabase
          .from('experiments')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('experiment_variants')
          .select('*')
          .eq('workspace_id', currentWorkspace.id),
        supabase
          .from('experiment_results')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('snapshot_date', { ascending: false })
      ]);

      if (expRes.error) console.error('[useExperiments] Experiments error:', expRes.error);
      if (varRes.error) console.error('[useExperiments] Variants error:', varRes.error);
      if (resRes.error) console.error('[useExperiments] Results error:', resRes.error);

      setExperiments((expRes.data || []) as unknown as Experiment[]);
      setVariants((varRes.data || []) as unknown as ExperimentVariant[]);
      setResults((resRes.data || []) as unknown as ExperimentResult[]);
    } catch (err) {
      console.error('[useExperiments] Exception:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const createExperiment = async (input: CreateExperimentInput) => {
    if (!currentWorkspace?.id) {
      return { error: new Error('No workspace selected'), experiment: null };
    }

    const { data, error } = await supabase
      .from('experiments')
      .insert({
        workspace_id: currentWorkspace.id,
        site_id: input.site_id || currentSite?.id || null,
        name: input.name,
        objective: input.objective,
        hypothesis: input.hypothesis,
        primary_metric: input.primary_metric || 'ctr'
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'expérience',
        variant: 'destructive'
      });
      return { error: error as Error, experiment: null };
    }

    toast({
      title: 'Expérience créée',
      description: `"${input.name}" prête à recevoir des variants`
    });

    await fetchExperiments();
    return { error: null, experiment: data as unknown as Experiment };
  };

  const updateExperiment = async (id: string, updates: Partial<Experiment>) => {
    const { error } = await supabase
      .from('experiments')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    await fetchExperiments();
    return { error: null };
  };

  const deleteExperiment = async (id: string) => {
    const { error } = await supabase
      .from('experiments')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    toast({ title: 'Expérience supprimée' });
    await fetchExperiments();
    return { error: null };
  };

  const startExperiment = async (id: string) => {
    const { error } = await supabase
      .from('experiments')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    toast({ title: 'Expérience démarrée' });
    await fetchExperiments();
    return { error: null };
  };

  const pauseExperiment = async (id: string) => {
    const { error } = await supabase
      .from('experiments')
      .update({ status: 'paused' })
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    toast({ title: 'Expérience en pause' });
    await fetchExperiments();
    return { error: null };
  };

  const completeExperiment = async (id: string, winnerId?: string) => {
    const { error } = await supabase
      .from('experiments')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        winner_variant_id: winnerId || null
      })
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    toast({ 
      title: 'Expérience terminée',
      description: winnerId ? 'Gagnant sélectionné' : 'Sans gagnant déclaré'
    });
    await fetchExperiments();
    return { error: null };
  };

  const createVariant = async (input: CreateVariantInput) => {
    if (!currentWorkspace?.id) {
      return { error: new Error('No workspace selected'), variant: null };
    }

    const { data, error } = await supabase
      .from('experiment_variants')
      .insert({
        experiment_id: input.experiment_id,
        workspace_id: currentWorkspace.id,
        name: input.name,
        creative_job_id: input.creative_job_id,
        asset_ids: input.asset_ids || [],
        utm_params: input.utm_params || {},
        traffic_allocation: input.traffic_allocation || 50,
        is_control: input.is_control || false
      })
      .select()
      .single();

    if (error) {
      return { error: error as Error, variant: null };
    }

    await fetchExperiments();
    return { error: null, variant: data as unknown as ExperimentVariant };
  };

  const updateVariant = async (id: string, updates: Partial<ExperimentVariant>) => {
    const { error } = await supabase
      .from('experiment_variants')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    await fetchExperiments();
    return { error: null };
  };

  const deleteVariant = async (id: string) => {
    const { error } = await supabase
      .from('experiment_variants')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    await fetchExperiments();
    return { error: null };
  };

  const getExperimentVariants = useCallback((experimentId: string) => {
    return variants.filter(v => v.experiment_id === experimentId);
  }, [variants]);

  const getExperimentResults = useCallback((experimentId: string) => {
    return results.filter(r => r.experiment_id === experimentId);
  }, [results]);

  const getWinnerRecommendation = useCallback((experimentId: string): { variant_id: string | null; confidence: number; reason: string } | null => {
    const expVariants = getExperimentVariants(experimentId);
    const expResults = getExperimentResults(experimentId);

    if (expVariants.length < 2 || expResults.length === 0) {
      return { variant_id: null, confidence: 0, reason: 'Données insuffisantes pour une recommandation' };
    }

    // Get latest results per variant
    const latestByVariant = new Map<string, ExperimentResult>();
    for (const r of expResults) {
      const existing = latestByVariant.get(r.variant_id);
      if (!existing || new Date(r.snapshot_date) > new Date(existing.snapshot_date)) {
        latestByVariant.set(r.variant_id, r);
      }
    }

    if (latestByVariant.size < 2) {
      return { variant_id: null, confidence: 0, reason: 'Résultats incomplets' };
    }

    // Find best performer by primary metric (CTR by default)
    let bestVariant: { id: string; metric: number } | null = null;
    let secondBest: { id: string; metric: number } | null = null;

    for (const [variantId, result] of latestByVariant) {
      const metric = result.ctr || 0;
      if (!bestVariant || metric > bestVariant.metric) {
        secondBest = bestVariant;
        bestVariant = { id: variantId, metric };
      } else if (!secondBest || metric > secondBest.metric) {
        secondBest = { id: variantId, metric };
      }
    }

    if (!bestVariant || !secondBest) {
      return { variant_id: null, confidence: 0, reason: 'Calcul impossible' };
    }

    // Simple confidence based on difference
    const diff = bestVariant.metric - secondBest.metric;
    const confidence = Math.min(95, Math.max(50, 50 + diff * 1000));

    const bestResult = latestByVariant.get(bestVariant.id);
    if (bestResult?.is_significant) {
      return {
        variant_id: bestVariant.id,
        confidence: 95,
        reason: `Statistiquement significatif (CTR: ${(bestVariant.metric * 100).toFixed(2)}%)`
      };
    }

    if (confidence >= 80) {
      return {
        variant_id: bestVariant.id,
        confidence,
        reason: `Tendance forte (CTR: ${(bestVariant.metric * 100).toFixed(2)}%)`
      };
    }

    return {
      variant_id: null,
      confidence,
      reason: 'Pas de différence significative - continuer le test'
    };
  }, [getExperimentVariants, getExperimentResults]);

  return (
    <ExperimentsContext.Provider value={{
      experiments,
      variants,
      results,
      loading,
      createExperiment,
      updateExperiment,
      deleteExperiment,
      startExperiment,
      pauseExperiment,
      completeExperiment,
      createVariant,
      updateVariant,
      deleteVariant,
      getExperimentVariants,
      getExperimentResults,
      getWinnerRecommendation,
      refetch: fetchExperiments
    }}>
      {children}
    </ExperimentsContext.Provider>
  );
}

export function useExperiments() {
  const context = useContext(ExperimentsContext);
  if (context === undefined) {
    throw new Error('useExperiments must be used within an ExperimentsProvider');
  }
  return context;
}
