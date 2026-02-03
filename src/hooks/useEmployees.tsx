import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type EmployeeStatus = 'active' | 'onboarding' | 'offboarding' | 'on_leave' | 'terminated';
export type ContractType = 'cdi' | 'cdd' | 'freelance' | 'internship' | 'apprenticeship';

export interface Employee {
  id: string;
  workspace_id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  job_title: string;
  department?: string | null;
  hire_date: string;
  end_date?: string | null;
  status: EmployeeStatus;
  manager_id?: string | null;
  salary_annual?: number | null;
  contract_type: ContractType;
  work_location?: string | null;
  skills?: string[];
  performance_score?: number | null;
  last_review_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department?: string;
  hire_date?: string;
  contract_type?: ContractType;
  salary_annual?: number;
  work_location?: string;
  manager_id?: string;
}

export function useEmployees() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const {
    data: employees = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['employees', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await (supabase as any)
        .from('employees')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('last_name', { ascending: true });

      if (error) throw error;
      return (data || []) as Employee[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');

      const { data, error } = await (supabase as any)
        .from('employees')
        .insert({
          ...input,
          workspace_id: currentWorkspace.id,
          status: 'onboarding' as EmployeeStatus,
          hire_date: input.hire_date || new Date().toISOString().split('T')[0],
          contract_type: input.contract_type || 'cdi',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé créé avec succès');
    },
    onError: (error) => {
      console.error('Create employee error:', error);
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé mis à jour');
    },
    onError: (error) => {
      console.error('Update employee error:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé supprimé');
    },
    onError: (error) => {
      console.error('Delete employee error:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Statistics
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onboarding: employees.filter(e => e.status === 'onboarding').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
  };

  return {
    employees,
    loading: isLoading,
    error,
    refetch,
    stats,
    createEmployee: createMutation.mutateAsync,
    updateEmployee: updateMutation.mutateAsync,
    deleteEmployee: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
