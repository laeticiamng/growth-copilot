import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type EvidenceSourceType = 
  | 'database' 
  | 'api' 
  | 'web_scrape' 
  | 'analytics' 
  | 'ai_inference' 
  | 'user_input' 
  | 'third_party' 
  | 'historical';

export type EvidenceConfidence = 'high' | 'medium' | 'low' | 'inferred';

export interface KeyMetric {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  baseline?: number;
  change_percent?: number;
}

export interface EvidenceBundle {
  id: string;
  workspace_id: string;
  executive_run_id?: string | null;
  agent_run_id?: string | null;
  approval_id?: string | null;
  title: string;
  summary?: string | null;
  generated_at: string;
  key_metrics: KeyMetric[];
  overall_confidence: EvidenceConfidence;
  confidence_score?: number | null;
  limitations?: string[] | null;
  warnings?: string[] | null;
  created_at: string;
  // Joined data
  sources?: EvidenceSource[];
  metrics?: EvidenceMetric[];
  reasoning?: EvidenceReasoning[];
}

export interface EvidenceSource {
  id: string;
  bundle_id: string;
  workspace_id: string;
  source_type: EvidenceSourceType;
  source_name: string;
  source_url?: string | null;
  data_extracted: Record<string, unknown>;
  data_snapshot_at?: string | null;
  confidence: EvidenceConfidence;
  reliability_notes?: string | null;
  query_used?: string | null;
  api_endpoint?: string | null;
  extraction_method?: string | null;
  is_verified: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
}

export interface EvidenceMetric {
  id: string;
  bundle_id: string;
  source_id?: string | null;
  workspace_id: string;
  metric_name: string;
  metric_value?: number | null;
  metric_unit?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  comparison_type?: string | null;
  baseline_value?: number | null;
  change_percent?: number | null;
  trend?: string | null;
  threshold_min?: number | null;
  threshold_max?: number | null;
  is_anomaly: boolean;
  anomaly_reason?: string | null;
  interpretation?: string | null;
  recommended_action?: string | null;
  created_at: string;
}

export interface EvidenceReasoning {
  id: string;
  bundle_id: string;
  workspace_id: string;
  step_order: number;
  step_type: 'observation' | 'analysis' | 'hypothesis' | 'conclusion' | 'recommendation';
  content: string;
  supporting_evidence?: Record<string, unknown> | null;
  confidence: EvidenceConfidence;
  alternative_interpretations?: string[] | null;
  created_at: string;
}

// Confidence labels and colors
export const CONFIDENCE_CONFIG: Record<EvidenceConfidence, { label: string; color: string; icon: string }> = {
  high: { label: 'Haute', color: 'text-green-600 bg-green-100', icon: '✓' },
  medium: { label: 'Moyenne', color: 'text-yellow-600 bg-yellow-100', icon: '~' },
  low: { label: 'Faible', color: 'text-orange-600 bg-orange-100', icon: '?' },
  inferred: { label: 'Inférée', color: 'text-blue-600 bg-blue-100', icon: '⚡' },
};

export const SOURCE_TYPE_LABELS: Record<EvidenceSourceType, { label: string; icon: string }> = {
  database: { label: 'Base de données', icon: '🗄️' },
  api: { label: 'API externe', icon: '🔌' },
  web_scrape: { label: 'Crawl web', icon: '🌐' },
  analytics: { label: 'Analytics', icon: '📊' },
  ai_inference: { label: 'Inférence IA', icon: '🤖' },
  user_input: { label: 'Saisie utilisateur', icon: '👤' },
  third_party: { label: 'Service tiers', icon: '🔗' },
  historical: { label: 'Historique', icon: '📅' },
};

export function useEvidenceBundles(options?: {
  executiveRunId?: string;
  agentRunId?: string;
  approvalId?: string;
}) {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Fetch bundles with optional filtering
  const {
    data: bundles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['evidence-bundles', currentWorkspace?.id, options],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      let query = (supabase as any)
        .from('evidence_bundles')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (options?.executiveRunId) {
        query = query.eq('executive_run_id', options.executiveRunId);
      }
      if (options?.agentRunId) {
        query = query.eq('agent_run_id', options.agentRunId);
      }
      if (options?.approvalId) {
        query = query.eq('approval_id', options.approvalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EvidenceBundle[];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch a single bundle with all related data
  const fetchBundleWithDetails = async (bundleId: string): Promise<EvidenceBundle | null> => {
    const [bundleRes, sourcesRes, metricsRes, reasoningRes] = await Promise.all([
      (supabase as any).from('evidence_bundles').select('*').eq('id', bundleId).single(),
      (supabase as any).from('evidence_sources').select('*').eq('bundle_id', bundleId).order('created_at'),
      (supabase as any).from('evidence_metrics').select('*').eq('bundle_id', bundleId).order('created_at'),
      (supabase as any).from('evidence_reasoning').select('*').eq('bundle_id', bundleId).order('step_order'),
    ]);

    if (bundleRes.error) return null;

    return {
      ...bundleRes.data,
      sources: sourcesRes.data || [],
      metrics: metricsRes.data || [],
      reasoning: reasoningRes.data || [],
    } as EvidenceBundle;
  };

  // Get bundle for a specific run
  const getBundleForRun = async (runId: string, runType: 'executive' | 'agent'): Promise<EvidenceBundle | null> => {
    const column = runType === 'executive' ? 'executive_run_id' : 'agent_run_id';
    
    const { data, error } = await (supabase as any)
      .from('evidence_bundles')
      .select('*')
      .eq(column, runId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return fetchBundleWithDetails(data.id);
  };

  // Create a new evidence bundle
  const createBundle = async (input: {
    title: string;
    summary?: string;
    executiveRunId?: string;
    agentRunId?: string;
    keyMetrics?: KeyMetric[];
    confidence?: EvidenceConfidence;
  }): Promise<EvidenceBundle | null> => {
    if (!currentWorkspace?.id) return null;

    const { data, error } = await (supabase as any)
      .from('evidence_bundles')
      .insert({
        workspace_id: currentWorkspace.id,
        title: input.title,
        summary: input.summary,
        executive_run_id: input.executiveRunId,
        agent_run_id: input.agentRunId,
        key_metrics: input.keyMetrics || [],
        overall_confidence: input.confidence || 'medium',
      })
      .select()
      .single();

    if (error) {
      console.error('Create bundle error:', error);
      return null;
    }

    queryClient.invalidateQueries({ queryKey: ['evidence-bundles'] });
    return data as EvidenceBundle;
  };

  // Add a source to a bundle
  const addSource = async (bundleId: string, input: {
    sourceType: EvidenceSourceType;
    sourceName: string;
    dataExtracted: Record<string, unknown>;
    confidence?: EvidenceConfidence;
    sourceUrl?: string;
    queryUsed?: string;
  }): Promise<EvidenceSource | null> => {
    if (!currentWorkspace?.id) return null;

    const { data, error } = await (supabase as any)
      .from('evidence_sources')
      .insert({
        bundle_id: bundleId,
        workspace_id: currentWorkspace.id,
        source_type: input.sourceType,
        source_name: input.sourceName,
        data_extracted: input.dataExtracted,
        confidence: input.confidence || 'medium',
        source_url: input.sourceUrl,
        query_used: input.queryUsed,
        data_snapshot_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Add source error:', error);
      return null;
    }

    return data as EvidenceSource;
  };

  // Add reasoning step
  const addReasoning = async (bundleId: string, input: {
    stepOrder: number;
    stepType: EvidenceReasoning['step_type'];
    content: string;
    confidence?: EvidenceConfidence;
    supportingEvidence?: Record<string, unknown>;
  }): Promise<EvidenceReasoning | null> => {
    if (!currentWorkspace?.id) return null;

    const { data, error } = await (supabase as any)
      .from('evidence_reasoning')
      .insert({
        bundle_id: bundleId,
        workspace_id: currentWorkspace.id,
        step_order: input.stepOrder,
        step_type: input.stepType,
        content: input.content,
        confidence: input.confidence || 'medium',
        supporting_evidence: input.supportingEvidence,
      })
      .select()
      .single();

    if (error) {
      console.error('Add reasoning error:', error);
      return null;
    }

    return data as EvidenceReasoning;
  };

  return {
    bundles,
    loading: isLoading,
    error,
    refetch,
    fetchBundleWithDetails,
    getBundleForRun,
    createBundle,
    addSource,
    addReasoning,
  };
}
