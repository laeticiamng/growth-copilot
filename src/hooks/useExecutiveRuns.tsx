import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { toast } from 'sonner';

export type RunType = 
  | 'DAILY_EXECUTIVE_BRIEF'
  | 'WEEKLY_EXECUTIVE_REVIEW'
  | 'MARKETING_WEEK_PLAN'
  | 'SEO_AUDIT_REPORT'
  | 'FUNNEL_DIAGNOSTIC'
  | 'ACCESS_REVIEW'
  | 'SALES_PIPELINE_REVIEW';

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ExecutiveRun {
  id: string;
  workspace_id: string;
  site_id?: string | null;
  run_type: string;
  status: RunStatus;
  inputs?: Record<string, unknown> | null;
  outputs?: Record<string, unknown> | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number | null;
  created_at: string;
  executive_summary?: string | null;
  proposed_actions?: unknown[] | null;
  evidence_bundle?: Record<string, unknown> | null;
}

export function useExecutiveRuns() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const queryClient = useQueryClient();

  // Fetch recent runs
  const {
    data: runs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['executive-runs', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await supabase
        .from('executive_runs')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as ExecutiveRun[];
    },
    enabled: !!currentWorkspace?.id,
    refetchInterval: 10000, // Refetch every 10s to catch run updates
  });

  // Launch a run
  const launchMutation = useMutation({
    mutationFn: async (runType: RunType) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');

      const { data, error } = await supabase.functions.invoke('run-executor', {
        body: {
          run_type: runType,
          workspace_id: currentWorkspace.id,
          site_id: currentSite?.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['executive-runs'] });
      toast.success('Exécution lancée');
    },
    onError: (error) => {
      console.error('Run launch error:', error);
      toast.error('Erreur lors du lancement');
    },
  });

  // Get the latest run of a specific type
  const getLatestRun = (runType: RunType): ExecutiveRun | undefined => {
    return runs.find((r) => r.run_type === runType);
  };

  // Get runs by status
  const getRunsByStatus = (status: RunStatus): ExecutiveRun[] => {
    return runs.filter((r) => r.status === status);
  };

  // Check if a run type is currently running
  const isRunning = (runType: RunType): boolean => {
    return runs.some((r) => r.run_type === runType && r.status === 'running');
  };

  return {
    runs,
    loading: isLoading,
    error,
    refetch,
    launchRun: launchMutation.mutateAsync,
    isLaunching: launchMutation.isPending,
    getLatestRun,
    getRunsByStatus,
    isRunning,
  };
}

// Human-readable labels for run types
export const RUN_TYPE_LABELS: Record<RunType, string> = {
  DAILY_EXECUTIVE_BRIEF: 'Brief quotidien',
  WEEKLY_EXECUTIVE_REVIEW: 'Revue hebdomadaire',
  MARKETING_WEEK_PLAN: 'Plan marketing',
  SEO_AUDIT_REPORT: 'Audit SEO',
  FUNNEL_DIAGNOSTIC: 'Diagnostic funnel',
  ACCESS_REVIEW: 'Revue des accès',
  SALES_PIPELINE_REVIEW: 'Revue pipeline',
};

// Run type icons (for UI)
export const RUN_TYPE_ICONS: Record<RunType, string> = {
  DAILY_EXECUTIVE_BRIEF: '📊',
  WEEKLY_EXECUTIVE_REVIEW: '📈',
  MARKETING_WEEK_PLAN: '📅',
  SEO_AUDIT_REPORT: '🔍',
  FUNNEL_DIAGNOSTIC: '📉',
  ACCESS_REVIEW: '🔐',
  SALES_PIPELINE_REVIEW: '💼',
};
