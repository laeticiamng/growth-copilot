import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type ComplianceStatus = 'compliant' | 'review_needed' | 'non_compliant' | 'pending';

export interface ComplianceItem {
  id: string;
  workspace_id: string;
  category: string;
  requirement: string;
  description?: string | null;
  regulation_reference?: string | null;
  status: ComplianceStatus;
  evidence_url?: string | null;
  evidence_notes?: string | null;
  due_date?: string | null;
  last_audit_at?: string | null;
  next_audit_at?: string | null;
  assigned_to?: string | null;
  risk_level: string;
  remediation_plan?: string | null;
  remediation_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GdprRequest {
  id: string;
  workspace_id: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  requester_id_verified: boolean;
  description?: string | null;
  status: string;
  response_deadline: string;
  processed_at?: string | null;
  processed_by?: string | null;
  response_notes?: string | null;
  data_export_url?: string | null;
  created_at: string;
  updated_at: string;
}

export function useCompliance() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Compliance items
  const {
    data: complianceItems = [],
    isLoading: loadingCompliance,
  } = useQuery({
    queryKey: ['compliance-items', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await (supabase as any)
        .from('compliance_items')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []) as ComplianceItem[];
    },
    enabled: !!currentWorkspace?.id,
  });

  // GDPR requests
  const {
    data: gdprRequests = [],
    isLoading: loadingGdpr,
  } = useQuery({
    queryKey: ['gdpr-requests', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await (supabase as any)
        .from('gdpr_requests')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('response_deadline', { ascending: true });

      if (error) throw error;
      return (data || []) as GdprRequest[];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Create compliance item
  const createComplianceMutation = useMutation({
    mutationFn: async (input: Partial<ComplianceItem>) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');

      const { data, error } = await (supabase as any)
        .from('compliance_items')
        .insert({
          ...input,
          workspace_id: currentWorkspace.id,
          status: 'pending' as ComplianceStatus,
          risk_level: input.risk_level || 'medium',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-items'] });
      toast.success('Élément de conformité créé');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  // Update compliance status
  const updateComplianceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ComplianceItem> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('compliance_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-items'] });
      toast.success('Conformité mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  // Statistics
  const complianceStats = {
    total: complianceItems.length,
    compliant: complianceItems.filter(c => c.status === 'compliant').length,
    reviewNeeded: complianceItems.filter(c => c.status === 'review_needed').length,
    nonCompliant: complianceItems.filter(c => c.status === 'non_compliant').length,
    pending: complianceItems.filter(c => c.status === 'pending').length,
    complianceRate: complianceItems.length > 0 
      ? Math.round((complianceItems.filter(c => c.status === 'compliant').length / complianceItems.length) * 100)
      : 100,
  };

  const gdprStats = {
    total: gdprRequests.length,
    pending: gdprRequests.filter(r => r.status === 'received' || r.status === 'processing').length,
    completed: gdprRequests.filter(r => r.status === 'completed').length,
    overdue: gdprRequests.filter(r => {
      if (r.status === 'completed' || r.status === 'rejected') return false;
      return new Date(r.response_deadline) < new Date();
    }).length,
  };

  return {
    complianceItems,
    gdprRequests,
    loading: loadingCompliance || loadingGdpr,
    complianceStats,
    gdprStats,
    createComplianceItem: createComplianceMutation.mutateAsync,
    updateComplianceItem: updateComplianceMutation.mutateAsync,
    isCreating: createComplianceMutation.isPending,
  };
}
