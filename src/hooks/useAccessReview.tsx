import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type ReviewStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AccessReview {
  id: string;
  workspace_id: string;
  review_date: string;
  initiated_by?: string | null;
  status: ReviewStatus;
  total_users: number;
  total_roles: number;
  total_integrations: number;
  issues_found: number;
  findings: Finding[];
  recommendations: string[];
  completed_at?: string | null;
  created_at: string;
}

export interface Finding {
  type: 'inactive_user' | 'excessive_permissions' | 'orphan_access' | 'stale_token' | 'missing_2fa';
  severity: RiskLevel;
  user_email?: string;
  description: string;
  recommendation: string;
}

export interface AccessEntry {
  id: string;
  review_id: string;
  workspace_id: string;
  user_id?: string | null;
  user_email?: string | null;
  role?: string | null;
  permissions: string[];
  sites_access: Array<{ id: string; name: string }>;
  integrations_access: Array<{ provider: string; status: string }>;
  last_login_at?: string | null;
  last_action_at?: string | null;
  is_inactive: boolean;
  inactive_days?: number | null;
  risk_level: RiskLevel;
  risk_reasons?: string[] | null;
  recommended_action?: string | null;
  action_taken?: string | null;
  created_at: string;
}

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Faible', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { label: 'Moyen', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: 'Élevé', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  critical: { label: 'Critique', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export function useAccessReview() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all reviews
  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['access-reviews', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await (supabase as any)
        .from('access_reviews')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('review_date', { ascending: false });

      if (error) throw error;
      return (data || []) as AccessReview[];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Get latest review
  const latestReview = reviews[0] || null;

  // Fetch entries for a specific review
  const fetchReviewEntries = async (reviewId: string): Promise<AccessEntry[]> => {
    const { data, error } = await (supabase as any)
      .from('access_review_entries')
      .select('*')
      .eq('review_id', reviewId)
      .order('risk_level', { ascending: false });

    if (error) throw error;
    return (data || []) as AccessEntry[];
  };

  // Start a new access review
  const startReviewMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkspace?.id || !user?.id) throw new Error('No workspace');

      // Create the review
      const { data: review, error: reviewError } = await (supabase as any)
        .from('access_reviews')
        .insert({
          workspace_id: currentWorkspace.id,
          initiated_by: user.id,
          status: 'in_progress',
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Gather access data
      const [usersRes, integsRes, sitesRes] = await Promise.all([
        supabase.from('user_roles').select('*').eq('workspace_id', currentWorkspace.id),
        supabase.from('integrations').select('*').eq('workspace_id', currentWorkspace.id),
        supabase.from('sites').select('*').eq('workspace_id', currentWorkspace.id),
      ]);

      const users = usersRes.data || [];
      const integrations = integsRes.data || [];
      const sites = sitesRes.data || [];

      const findings: Finding[] = [];
      const entries: Partial<AccessEntry>[] = [];

      // Analyze each user
      for (const userRole of users) {
        let riskLevel: RiskLevel = 'low';
        const riskReasons: string[] = [];

        // Check for owner/admin roles
        if (userRole.role === 'owner' || userRole.role === 'admin') {
          riskLevel = 'medium';
          riskReasons.push('Privilèges élevés');
        }

        // Get user's last action
        const { data: lastAction } = await (supabase as any)
          .from('audit_log')
          .select('created_at')
          .eq('workspace_id', currentWorkspace.id)
          .eq('actor_id', userRole.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const lastActionAt = lastAction?.created_at;
        let inactiveDays = 0;

        if (lastActionAt) {
          inactiveDays = Math.floor((Date.now() - new Date(lastActionAt).getTime()) / (1000 * 60 * 60 * 24));
          if (inactiveDays > 30) {
            riskLevel = 'high';
            riskReasons.push(`Inactif depuis ${inactiveDays} jours`);
            findings.push({
              type: 'inactive_user',
              severity: 'high',
              user_email: userRole.user_id,
              description: `Utilisateur inactif depuis ${inactiveDays} jours`,
              recommendation: 'Vérifier si l\'accès est toujours nécessaire',
            });
          }
        }

        entries.push({
          review_id: review.id,
          workspace_id: currentWorkspace.id,
          user_id: userRole.user_id,
          role: userRole.role,
          last_action_at: lastActionAt,
          is_inactive: inactiveDays > 30,
          inactive_days: inactiveDays,
          risk_level: riskLevel,
          risk_reasons: riskReasons,
          integrations_access: integrations.map(i => ({ provider: i.provider, status: i.status })),
          sites_access: sites.map(s => ({ id: s.id, name: s.name })),
        });
      }

      // Check for stale tokens
      const staleIntegrations = integrations.filter((i: any) => {
        if (!i.last_sync_at) return true;
        const daysSinceSync = Math.floor((Date.now() - new Date(i.last_sync_at).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceSync > 7;
      });

      for (const stale of staleIntegrations) {
        findings.push({
          type: 'stale_token',
          severity: 'medium',
          description: `Intégration ${stale.provider} non synchronisée depuis longtemps`,
          recommendation: 'Vérifier la validité du token',
        });
      }

      // Insert entries
      if (entries.length > 0) {
        await (supabase as any).from('access_review_entries').insert(entries);
      }

      // Update review with summary
      const { data: finalReview, error: updateError } = await (supabase as any)
        .from('access_reviews')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_users: users.length,
          total_integrations: integrations.length,
          issues_found: findings.length,
          findings,
          recommendations: findings.map(f => f.recommendation),
        })
        .eq('id', review.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return finalReview as AccessReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-reviews'] });
      toast.success('Revue d\'accès terminée');
    },
    onError: (error) => {
      console.error('Access review error:', error);
      toast.error('Erreur lors de la revue');
    },
  });

  // Summary stats
  const stats = {
    totalReviews: reviews.length,
    lastReviewDate: latestReview?.review_date,
    totalIssues: latestReview?.issues_found || 0,
    criticalIssues: (latestReview?.findings || []).filter((f: Finding) => f.severity === 'critical').length,
    highIssues: (latestReview?.findings || []).filter((f: Finding) => f.severity === 'high').length,
  };

  return {
    reviews,
    latestReview,
    loading: isLoading,
    error,
    refetch,
    stats,
    fetchReviewEntries,
    startReview: startReviewMutation.mutateAsync,
    isStarting: startReviewMutation.isPending,
  };
}
