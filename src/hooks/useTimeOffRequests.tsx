import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'parental' | 'other';
export type TimeOffStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface TimeOffRequest {
  id: string;
  workspace_id: string;
  employee_id: string;
  request_type: TimeOffType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: TimeOffStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeOffInput {
  employee_id: string;
  request_type: TimeOffType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
}

export function useTimeOffRequests(employeeId?: string) {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['time-off-requests', currentWorkspace?.id, employeeId],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      let query = (supabase as any)
        .from('time_off_requests')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('start_date', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as TimeOffRequest[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateTimeOffInput) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');

      const { data, error } = await (supabase as any)
        .from('time_off_requests')
        .insert({
          ...input,
          workspace_id: currentWorkspace.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as TimeOffRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Demande de congé créée');
    },
    onError: (error) => {
      console.error('Create time off error:', error);
      toast.error('Erreur lors de la création');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('time_off_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Demande approuvée');
    },
    onError: (error) => {
      console.error('Approve time off error:', error);
      toast.error('Erreur lors de l\'approbation');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await (supabase as any)
        .from('time_off_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Demande refusée');
    },
    onError: (error) => {
      console.error('Reject time off error:', error);
      toast.error('Erreur lors du refus');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('time_off_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Demande annulée');
    },
    onError: (error) => {
      console.error('Cancel time off error:', error);
      toast.error('Erreur lors de l\'annulation');
    },
  });

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    totalDaysApproved: requests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.total_days, 0),
  };

  return {
    requests,
    loading: isLoading,
    error,
    refetch,
    stats,
    createRequest: createMutation.mutateAsync,
    approveRequest: approveMutation.mutateAsync,
    rejectRequest: rejectMutation.mutateAsync,
    cancelRequest: cancelMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}