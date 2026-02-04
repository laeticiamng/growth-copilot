import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export interface ScheduledRun {
  id: string;
  workspace_id: string;
  run_type: string;
  service_slug: string | null;
  schedule_cron: string;
  timezone: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledRunInput {
  run_type: string;
  schedule_cron: string;
  enabled?: boolean;
  timezone?: string;
  service_slug?: string;
  config?: Record<string, unknown>;
}

// Parse cron expression to human-readable format
export function parseCronToHuman(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length !== 5) return cron;
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  // Daily at specific time
  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Quotidien à ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  
  // Weekly on specific day
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = days[parseInt(dayOfWeek)] || dayOfWeek;
    return `${dayName} à ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  
  // Monthly on specific day
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    return `Le ${dayOfMonth} de chaque mois à ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  
  return cron;
}

// Generate cron from simple schedule
export function generateCron(frequency: 'daily' | 'weekly' | 'monthly', hour: number = 8, dayOfWeek: number = 1, dayOfMonth: number = 1): string {
  switch (frequency) {
    case 'daily':
      return `0 ${hour} * * *`;
    case 'weekly':
      return `0 ${hour} * * ${dayOfWeek}`;
    case 'monthly':
      return `0 ${hour} ${dayOfMonth} * *`;
    default:
      return '0 8 * * *';
  }
}

export function useScheduledRuns() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: scheduledRuns = [], isLoading, refetch } = useQuery({
    queryKey: ['scheduled-runs', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('scheduled_runs')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as ScheduledRun[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (input: ScheduledRunInput) => {
      if (!currentWorkspace?.id) throw new Error('No workspace');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData: any = {
        workspace_id: currentWorkspace.id,
        run_type: input.run_type,
        schedule_cron: input.schedule_cron,
        enabled: input.enabled ?? true,
        timezone: input.timezone || 'Europe/Paris',
        service_slug: input.service_slug || null,
        config: input.config || {},
      };
      
      const { data, error } = await supabase
        .from('scheduled_runs')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-runs'] });
      toast.success('Planification créée');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, enabled, schedule_cron, config }: { id: string; enabled?: boolean; schedule_cron?: string; config?: Record<string, unknown> }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};
      if (enabled !== undefined) updateData.enabled = enabled;
      if (schedule_cron !== undefined) updateData.schedule_cron = schedule_cron;
      if (config !== undefined) updateData.config = config;
      
      const { data, error } = await supabase
        .from('scheduled_runs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-runs'] });
      toast.success('Planification mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_runs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-runs'] });
      toast.success('Planification supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await updateMutation.mutateAsync({ id, enabled });
  };

  return {
    scheduledRuns,
    loading: isLoading,
    refetch,
    createSchedule: createMutation.mutateAsync,
    updateSchedule: updateMutation.mutateAsync,
    deleteSchedule: deleteMutation.mutateAsync,
    toggleEnabled,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
