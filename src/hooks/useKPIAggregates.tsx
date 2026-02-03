import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface KPIAggregate {
  id: string;
  workspace_id: string;
  date: string;
  period_type: PeriodType;
  
  // SEO
  seo_sessions: number;
  seo_clicks: number;
  seo_impressions: number;
  seo_avg_position?: number | null;
  
  // Ads
  ads_spend: number;
  ads_impressions: number;
  ads_clicks: number;
  ads_conversions: number;
  ads_ctr?: number | null;
  ads_cpc?: number | null;
  ads_roas?: number | null;
  
  // Sales
  sales_revenue: number;
  sales_orders: number;
  sales_aov?: number | null;
  sales_new_customers: number;
  
  // Engagement
  nps_score?: number | null;
  support_tickets: number;
  support_resolution_time_hrs?: number | null;
  
  // Scores
  health_score?: number | null;
  growth_score?: number | null;
  roi_score?: number | null;
  
  synced_at: string;
  created_at: string;
}

export interface KPISyncJob {
  id: string;
  workspace_id: string;
  job_type: 'seo' | 'ads' | 'sales' | 'all';
  schedule_cron: string;
  enabled: boolean;
  last_run_at?: string | null;
  last_run_status?: string | null;
  last_run_error?: string | null;
  next_run_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function useKPIAggregates(options?: { periodType?: PeriodType; days?: number }) {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const periodType = options?.periodType || 'daily';
  const days = options?.days || 30;

  // Fetch aggregates
  const {
    data: aggregates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['kpi-aggregates', currentWorkspace?.id, periodType, days],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await (supabase as any)
        .from('kpi_aggregates')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('period_type', periodType)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return (data || []) as KPIAggregate[];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch sync jobs
  const {
    data: syncJobs = [],
    isLoading: loadingSyncJobs,
  } = useQuery({
    queryKey: ['kpi-sync-jobs', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await (supabase as any)
        .from('kpi_sync_jobs')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (error) throw error;
      return (data || []) as KPISyncJob[];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Trigger manual sync
  const triggerSyncMutation = useMutation({
    mutationFn: async (jobType: 'seo' | 'ads' | 'sales' | 'all') => {
      if (!currentWorkspace?.id) throw new Error('No workspace');

      const { data, error } = await supabase.functions.invoke('kpi-sync', {
        body: {
          workspace_id: currentWorkspace.id,
          job_type: jobType,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-aggregates'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-sync-jobs'] });
      toast.success('Synchronisation des KPI lancée');
    },
    onError: (error) => {
      console.error('KPI sync error:', error);
      toast.error('Erreur lors de la synchronisation');
    },
  });

  // Update sync job schedule
  const updateSyncJobMutation = useMutation({
    mutationFn: async ({ jobType, enabled, scheduleCron }: { jobType: string; enabled?: boolean; scheduleCron?: string }) => {
      if (!currentWorkspace?.id) throw new Error('No workspace');

      const { data, error } = await (supabase as any)
        .from('kpi_sync_jobs')
        .upsert({
          workspace_id: currentWorkspace.id,
          job_type: jobType,
          enabled: enabled ?? true,
          schedule_cron: scheduleCron || '0 6 * * *',
        }, { onConflict: 'workspace_id,job_type' })
        .select()
        .single();

      if (error) throw error;
      return data as KPISyncJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-sync-jobs'] });
      toast.success('Configuration mise à jour');
    },
    onError: () => toast.error('Erreur de configuration'),
  });

  // Calculate summary from latest data
  const latestData = aggregates[0];
  const previousData = aggregates[1];

  const calculateChange = (current?: number | null, previous?: number | null): number | null => {
    if (!current || !previous || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  const summary = {
    seo: {
      sessions: latestData?.seo_sessions || 0,
      clicks: latestData?.seo_clicks || 0,
      change: calculateChange(latestData?.seo_sessions, previousData?.seo_sessions),
    },
    ads: {
      spend: latestData?.ads_spend || 0,
      conversions: latestData?.ads_conversions || 0,
      roas: latestData?.ads_roas || 0,
      change: calculateChange(latestData?.ads_conversions, previousData?.ads_conversions),
    },
    sales: {
      revenue: latestData?.sales_revenue || 0,
      orders: latestData?.sales_orders || 0,
      aov: latestData?.sales_aov || 0,
      change: calculateChange(latestData?.sales_revenue, previousData?.sales_revenue),
    },
    health: latestData?.health_score || 50,
    lastSync: latestData?.synced_at,
  };

  return {
    aggregates,
    syncJobs,
    loading: isLoading,
    loadingSyncJobs,
    error,
    refetch,
    summary,
    triggerSync: triggerSyncMutation.mutateAsync,
    isSyncing: triggerSyncMutation.isPending,
    updateSyncJob: updateSyncJobMutation.mutateAsync,
  };
}
