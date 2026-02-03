import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';

export interface Contract {
  id: string;
  workspace_id: string;
  contract_number?: string | null;
  title: string;
  contract_type: string;
  counterparty_name?: string | null;
  counterparty_email?: string | null;
  description?: string | null;
  effective_date?: string | null;
  expiry_date?: string | null;
  auto_renew: boolean;
  renewal_notice_days: number;
  value_amount?: number | null;
  value_currency: string;
  payment_terms?: string | null;
  status: ContractStatus;
  document_url?: string | null;
  signed_document_url?: string | null;
  signed_at?: string | null;
  signed_by?: string | null;
  key_clauses?: string[];
  obligations?: Record<string, unknown>[];
  risk_assessment?: string | null;
  risk_level: string;
  assigned_to?: string | null;
  related_employee_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContractInput {
  title: string;
  contract_type: string;
  counterparty_name?: string;
  counterparty_email?: string;
  description?: string;
  effective_date?: string;
  expiry_date?: string;
  value_amount?: number;
  value_currency?: string;
  auto_renew?: boolean;
  related_employee_id?: string;
}

export function useContracts() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const {
    data: contracts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contracts', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await (supabase as any)
        .from('contracts')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Contract[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateContractInput) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');

      const { data, error } = await (supabase as any)
        .from('contracts')
        .insert({
          ...input,
          workspace_id: currentWorkspace.id,
          status: 'draft' as ContractStatus,
          value_currency: input.value_currency || 'EUR',
          auto_renew: input.auto_renew ?? false,
          renewal_notice_days: 30,
          risk_level: 'low',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrat créé avec succès');
    },
    onError: (error) => {
      console.error('Create contract error:', error);
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contract> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrat mis à jour');
    },
    onError: (error) => {
      console.error('Update contract error:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Alerts for expiring contracts
  const expiringContracts = contracts.filter(c => {
    if (c.status !== 'active' || !c.expiry_date) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  // Statistics
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    draft: contracts.filter(c => c.status === 'draft').length,
    pendingSignature: contracts.filter(c => c.status === 'pending_signature').length,
    expiringSoon: expiringContracts.length,
    totalValue: contracts
      .filter(c => c.status === 'active' && c.value_amount)
      .reduce((sum, c) => sum + (c.value_amount || 0), 0),
  };

  return {
    contracts,
    loading: isLoading,
    error,
    refetch,
    stats,
    expiringContracts,
    createContract: createMutation.mutateAsync,
    updateContract: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
