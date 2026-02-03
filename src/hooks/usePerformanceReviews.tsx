import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export interface PerformanceReview {
  id: string;
  workspace_id: string;
  employee_id: string;
  reviewer_id: string | null;
  review_period_start: string;
  review_period_end: string;
  overall_score: number | null;
  strengths: string[];
  areas_for_improvement: string[];
  goals_met: Record<string, unknown>[];
  next_period_goals: Record<string, unknown>[];
  comments: string | null;
  status: 'draft' | 'submitted' | 'acknowledged' | 'completed';
  submitted_at: string | null;
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewInput {
  employee_id: string;
  review_period_start: string;
  review_period_end: string;
  overall_score?: number;
  strengths?: string[];
  areas_for_improvement?: string[];
  comments?: string;
}

export function usePerformanceReviews(employeeId?: string) {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['performance-reviews', currentWorkspace?.id, employeeId],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      let query = (supabase as any)
        .from('performance_reviews')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('review_period_end', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PerformanceReview[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');

      const { data, error } = await (supabase as any)
        .from('performance_reviews')
        .insert({
          ...input,
          workspace_id: currentWorkspace.id,
          status: 'draft',
          strengths: input.strengths || [],
          areas_for_improvement: input.areas_for_improvement || [],
          goals_met: [],
          next_period_goals: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as PerformanceReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Évaluation créée avec succès');
    },
    onError: (error) => {
      console.error('Create review error:', error);
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PerformanceReview> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('performance_reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PerformanceReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Évaluation mise à jour');
    },
    onError: (error) => {
      console.error('Update review error:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('performance_reviews')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Évaluation soumise');
    },
    onError: (error) => {
      console.error('Submit review error:', error);
      toast.error('Erreur lors de la soumission');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('performance_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Évaluation supprimée');
    },
    onError: (error) => {
      console.error('Delete review error:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Statistics
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'draft' || r.status === 'submitted').length,
    completed: reviews.filter(r => r.status === 'completed').length,
    averageScore: reviews.filter(r => r.overall_score).length > 0
      ? reviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / reviews.filter(r => r.overall_score).length
      : 0,
  };

  return {
    reviews,
    loading: isLoading,
    error,
    refetch,
    stats,
    createReview: createMutation.mutateAsync,
    updateReview: updateMutation.mutateAsync,
    submitReview: submitMutation.mutateAsync,
    deleteReview: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}