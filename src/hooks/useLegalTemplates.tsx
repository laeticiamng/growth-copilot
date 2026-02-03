import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type TemplateType = 'cgu' | 'cgv' | 'nda' | 'employment' | 'service' | 'privacy' | 'terms' | 'other';

export interface LegalTemplate {
  id: string;
  workspace_id: string;
  name: string;
  template_type: TemplateType;
  description: string | null;
  content: string;
  variables: Array<{ name: string; description?: string; default_value?: string }>;
  is_default: boolean;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  name: string;
  template_type: TemplateType;
  description?: string;
  content: string;
  variables?: Array<{ name: string; description?: string; default_value?: string }>;
  is_default?: boolean;
}

const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  cgu: 'CGU',
  cgv: 'CGV',
  nda: 'NDA',
  employment: 'Contrat de travail',
  service: 'Prestation de service',
  privacy: 'Politique de confidentialité',
  terms: 'Conditions générales',
  other: 'Autre',
};

export function useLegalTemplates() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['legal-templates', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      const { data, error } = await (supabase as any)
        .from('legal_templates')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : [],
      })) as LegalTemplate[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');

      const { data, error } = await (supabase as any)
        .from('legal_templates')
        .insert({
          ...input,
          workspace_id: currentWorkspace.id,
          created_by: user?.id || null,
          variables: input.variables || [],
          is_default: input.is_default || false,
          version: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LegalTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-templates'] });
      toast.success('Template créé avec succès');
    },
    onError: (error) => {
      console.error('Create template error:', error);
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LegalTemplate> & { id: string }) => {
      // If content changed, increment version
      const currentTemplate = templates.find(t => t.id === id);
      const versionUpdate = updates.content && currentTemplate && updates.content !== currentTemplate.content
        ? { version: (currentTemplate.version || 1) + 1 }
        : {};

      const { data, error } = await (supabase as any)
        .from('legal_templates')
        .update({
          ...updates,
          ...versionUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LegalTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-templates'] });
      toast.success('Template mis à jour');
    },
    onError: (error) => {
      console.error('Update template error:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('legal_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-templates'] });
      toast.success('Template supprimé');
    },
    onError: (error) => {
      console.error('Delete template error:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const source = templates.find(t => t.id === id);
      if (!source || !currentWorkspace?.id) throw new Error('Template not found');

      const { data, error } = await (supabase as any)
        .from('legal_templates')
        .insert({
          name: `${source.name} (copie)`,
          template_type: source.template_type,
          description: source.description,
          content: source.content,
          variables: source.variables,
          is_default: false,
          version: 1,
          workspace_id: currentWorkspace.id,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LegalTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-templates'] });
      toast.success('Template dupliqué');
    },
    onError: (error) => {
      console.error('Duplicate template error:', error);
      toast.error('Erreur lors de la duplication');
    },
  });

  // Statistics by type
  const statsByType = Object.entries(TEMPLATE_TYPE_LABELS).map(([type, label]) => ({
    type: type as TemplateType,
    label,
    count: templates.filter(t => t.template_type === type).length,
  }));

  return {
    templates,
    loading: isLoading,
    error,
    refetch,
    statsByType,
    TEMPLATE_TYPE_LABELS,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    duplicateTemplate: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}