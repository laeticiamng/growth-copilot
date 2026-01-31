import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useToast } from './use-toast';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Policy {
  id: string;
  workspace_id: string;
  site_id: string | null;
  action_type: string;
  risk_level: RiskLevel;
  requires_approval: boolean;
  autopilot_allowed: boolean;
  constraints: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PolicyEvent {
  id: string;
  workspace_id: string;
  policy_id: string | null;
  action_type: string;
  decision: string;
  reason: string | null;
  context: Record<string, unknown>;
  user_id: string | null;
  created_at: string;
}

export interface PlatformPolicy {
  id: string;
  platform: string;
  industry: string | null;
  policy_name: string;
  rules: Record<string, unknown>;
  warnings: string[];
  required_approvals: string[];
  frequency_caps: Record<string, unknown>;
  is_active: boolean;
}

interface PoliciesContextType {
  policies: Policy[];
  policyEvents: PolicyEvent[];
  platformPolicies: PlatformPolicy[];
  loading: boolean;
  checkPolicy: (actionType: string, siteId?: string) => Promise<{
    requires_approval: boolean;
    autopilot_allowed: boolean;
    risk_level: RiskLevel;
    constraints: Record<string, unknown>;
  } | null>;
  createPolicy: (policy: Partial<Policy>) => Promise<{ error: Error | null }>;
  updatePolicy: (id: string, updates: Partial<Policy>) => Promise<{ error: Error | null }>;
  deletePolicy: (id: string) => Promise<{ error: Error | null }>;
  refetch: () => void;
}

const PoliciesContext = createContext<PoliciesContextType | undefined>(undefined);

export function PoliciesProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyEvents, setPolicyEvents] = useState<PolicyEvent[]>([]);
  const [platformPolicies, setPlatformPolicies] = useState<PlatformPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setPolicies([]);
      setPolicyEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [policiesRes, eventsRes, platformRes] = await Promise.all([
        supabase
          .from('policies')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('action_type'),
        supabase
          .from('policy_events')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('platform_policies')
          .select('*')
          .eq('is_active', true)
      ]);

      if (policiesRes.error) console.error('[usePolicies] Policies error:', policiesRes.error);
      if (eventsRes.error) console.error('[usePolicies] Events error:', eventsRes.error);
      if (platformRes.error) console.error('[usePolicies] Platform error:', platformRes.error);

      setPolicies((policiesRes.data || []) as unknown as Policy[]);
      setPolicyEvents((eventsRes.data || []) as unknown as PolicyEvent[]);
      setPlatformPolicies((platformRes.data || []) as unknown as PlatformPolicy[]);
    } catch (err) {
      console.error('[usePolicies] Exception:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const checkPolicy = useCallback(async (actionType: string, siteId?: string) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase.rpc('check_policy', {
        _workspace_id: currentWorkspace.id,
        _action_type: actionType,
        _site_id: siteId || null
      });

      if (error) {
        console.error('[usePolicies] Check policy error:', error);
        // Fail-closed: require approval if check fails
        return {
          requires_approval: true,
          autopilot_allowed: false,
          risk_level: 'high' as RiskLevel,
          constraints: {}
        };
      }

      if (data && data.length > 0) {
        return data[0] as {
          requires_approval: boolean;
          autopilot_allowed: boolean;
          risk_level: RiskLevel;
          constraints: Record<string, unknown>;
        };
      }

      // No policy found - default to safe
      return {
        requires_approval: true,
        autopilot_allowed: false,
        risk_level: 'medium' as RiskLevel,
        constraints: {}
      };
    } catch (err) {
      console.error('[usePolicies] Check exception:', err);
      return null;
    }
  }, [currentWorkspace?.id]);

  const createPolicy = async (policy: Partial<Policy>) => {
    if (!currentWorkspace?.id) {
      return { error: new Error('No workspace selected') };
    }

    if (!policy.action_type) {
      return { error: new Error('action_type is required') };
    }

    const insertData = {
      action_type: policy.action_type,
      workspace_id: currentWorkspace.id,
      site_id: policy.site_id || null,
      risk_level: policy.risk_level || 'medium',
      requires_approval: policy.requires_approval ?? true,
      autopilot_allowed: policy.autopilot_allowed ?? false,
      constraints: (policy.constraints || {}) as unknown
    };

    const { error } = await supabase
      .from('policies')
      .insert(insertData as { action_type: string; workspace_id: string });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la politique',
        variant: 'destructive'
      });
      return { error: error as Error };
    }

    toast({
      title: 'Politique créée',
      description: `Politique pour "${policy.action_type}" ajoutée`
    });

    await fetchPolicies();
    return { error: null };
  };

  const updatePolicy = async (id: string, updates: Partial<Policy>) => {
    // Build update object with proper types
    const updateData: Record<string, unknown> = {};
    if (updates.action_type !== undefined) updateData.action_type = updates.action_type;
    if (updates.risk_level !== undefined) updateData.risk_level = updates.risk_level;
    if (updates.requires_approval !== undefined) updateData.requires_approval = updates.requires_approval;
    if (updates.autopilot_allowed !== undefined) updateData.autopilot_allowed = updates.autopilot_allowed;
    if (updates.constraints !== undefined) updateData.constraints = updates.constraints;
    if (updates.site_id !== undefined) updateData.site_id = updates.site_id;

    const { error } = await supabase
      .from('policies')
      .update(updateData as { action_type?: string })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la politique',
        variant: 'destructive'
      });
      return { error: error as Error };
    }

    toast({
      title: 'Politique mise à jour'
    });

    await fetchPolicies();
    return { error: null };
  };

  const deletePolicy = async (id: string) => {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la politique',
        variant: 'destructive'
      });
      return { error: error as Error };
    }

    toast({
      title: 'Politique supprimée'
    });

    await fetchPolicies();
    return { error: null };
  };

  return (
    <PoliciesContext.Provider value={{
      policies,
      policyEvents,
      platformPolicies,
      loading,
      checkPolicy,
      createPolicy,
      updatePolicy,
      deletePolicy,
      refetch: fetchPolicies
    }}>
      {children}
    </PoliciesContext.Provider>
  );
}

export function usePolicies() {
  const context = useContext(PoliciesContext);
  if (context === undefined) {
    throw new Error('usePolicies must be used within a PoliciesProvider');
  }
  return context;
}
