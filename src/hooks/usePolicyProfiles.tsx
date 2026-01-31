import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface PolicyProfile {
  id: string;
  name: string;
  platform: string | null;
  industry: string | null;
  is_system_preset: boolean;
  workspace_id: string | null;
  policy_rules: Record<string, unknown>;
  warnings: string[];
  required_approvals: string[];
  anti_spam_config: {
    max_posts_per_day: number;
    min_interval_hours: number;
    audience_blacklist: string[];
  };
  created_at: string;
}

interface ClaimCheckResult {
  allowed: boolean;
  requires_rewrite: boolean;
  reason: string | null;
}

interface PolicyProfilesContextType {
  profiles: PolicyProfile[];
  systemPresets: PolicyProfile[];
  loading: boolean;
  fetchProfiles: () => Promise<void>;
  getApplicableProfile: (platform?: string, industry?: string) => Promise<PolicyProfile | null>;
  checkClaim: (claim: string, hasEvidence?: boolean, evidenceSource?: string) => Promise<ClaimCheckResult>;
  createProfile: (profile: Partial<PolicyProfile>) => Promise<PolicyProfile>;
  updateProfile: (id: string, updates: Partial<PolicyProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

const PolicyProfilesContext = createContext<PolicyProfilesContextType | undefined>(undefined);

export function PolicyProfilesProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [profiles, setProfiles] = useState<PolicyProfile[]>([]);
  const [systemPresets, setSystemPresets] = useState<PolicyProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('policy_profiles')
        .select('*')
        .or(`workspace_id.eq.${currentWorkspace.id},is_system_preset.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const allProfiles = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        platform: p.platform,
        industry: p.industry,
        is_system_preset: p.is_system_preset || false,
        workspace_id: p.workspace_id,
        policy_rules: (p.policy_rules as Record<string, unknown>) || {},
        warnings: (p.warnings as string[]) || [],
        required_approvals: (p.required_approvals as string[]) || [],
        anti_spam_config: (p.anti_spam_config as PolicyProfile['anti_spam_config']) || {
          max_posts_per_day: 5,
          min_interval_hours: 2,
          audience_blacklist: []
        },
        created_at: p.created_at || ''
      }));
      
      setProfiles(allProfiles.filter(p => !p.is_system_preset));
      setSystemPresets(allProfiles.filter(p => p.is_system_preset));
    } catch (err) {
      console.error('Failed to fetch policy profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const getApplicableProfile = useCallback(async (platform?: string, industry?: string): Promise<PolicyProfile | null> => {
    if (!currentWorkspace) return null;
    
    const { data, error } = await supabase.rpc('get_policy_profile', {
      _workspace_id: currentWorkspace.id,
      _platform: platform || null,
      _industry: industry || null
    });

    if (error || !data || data.length === 0) return null;
    
    const p = data[0];
    return {
      id: p.id,
      name: p.name,
      platform: p.platform,
      industry: p.industry,
      is_system_preset: p.is_system_preset || false,
      workspace_id: p.workspace_id,
      policy_rules: (p.policy_rules as Record<string, unknown>) || {},
      warnings: (p.warnings as string[]) || [],
      required_approvals: (p.required_approvals as string[]) || [],
      anti_spam_config: (p.anti_spam_config as PolicyProfile['anti_spam_config']) || {
        max_posts_per_day: 5,
        min_interval_hours: 2,
        audience_blacklist: []
      },
      created_at: p.created_at || ''
    };
  }, [currentWorkspace]);

  const checkClaim = useCallback(async (
    claim: string, 
    hasEvidence = false, 
    evidenceSource?: string
  ): Promise<ClaimCheckResult> => {
    if (!currentWorkspace) {
      return { allowed: true, requires_rewrite: false, reason: null };
    }
    
    const { data, error } = await supabase.rpc('check_claim_guardrail', {
      _workspace_id: currentWorkspace.id,
      _claim: claim,
      _has_evidence: hasEvidence,
      _evidence_source: evidenceSource || null
    });

    if (error || !data || data.length === 0) {
      return { allowed: true, requires_rewrite: false, reason: null };
    }
    
    return {
      allowed: data[0].allowed,
      requires_rewrite: data[0].requires_rewrite,
      reason: data[0].reason
    };
  }, [currentWorkspace]);

  const createProfile = useCallback(async (profile: Partial<PolicyProfile>): Promise<PolicyProfile> => {
    if (!currentWorkspace) throw new Error('No workspace selected');
    
    const insertData = {
      workspace_id: currentWorkspace.id,
      name: profile.name || 'New Policy',
      platform: profile.platform || null,
      industry: profile.industry || null,
      policy_rules: (profile.policy_rules || {}) as unknown,
      warnings: (profile.warnings || []) as unknown,
      required_approvals: (profile.required_approvals || []) as unknown,
      anti_spam_config: (profile.anti_spam_config || {
        max_posts_per_day: 5,
        min_interval_hours: 2,
        audience_blacklist: []
      }) as unknown
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('policy_profiles')
      .insert(insertData as any)
      .select()
      .single();

    if (error) throw error;
    
    const newProfile: PolicyProfile = {
      id: data.id,
      name: data.name,
      platform: data.platform,
      industry: data.industry,
      is_system_preset: false,
      workspace_id: data.workspace_id,
      policy_rules: (data.policy_rules as Record<string, unknown>) || {},
      warnings: (data.warnings as string[]) || [],
      required_approvals: (data.required_approvals as string[]) || [],
      anti_spam_config: (data.anti_spam_config as PolicyProfile['anti_spam_config']) || {
        max_posts_per_day: 5,
        min_interval_hours: 2,
        audience_blacklist: []
      },
      created_at: data.created_at || ''
    };
    
    setProfiles(prev => [newProfile, ...prev]);
    return newProfile;
  }, [currentWorkspace]);

  const updateProfile = useCallback(async (id: string, updates: Partial<PolicyProfile>) => {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.platform !== undefined) updateData.platform = updates.platform;
    if (updates.industry !== undefined) updateData.industry = updates.industry;
    if (updates.policy_rules !== undefined) updateData.policy_rules = updates.policy_rules as unknown;
    if (updates.warnings !== undefined) updateData.warnings = updates.warnings as unknown;
    if (updates.required_approvals !== undefined) updateData.required_approvals = updates.required_approvals as unknown;
    if (updates.anti_spam_config !== undefined) updateData.anti_spam_config = updates.anti_spam_config as unknown;
    
    const { error } = await supabase
      .from('policy_profiles')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    
    setProfiles(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  const deleteProfile = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('policy_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    setProfiles(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <PolicyProfilesContext.Provider value={{
      profiles,
      systemPresets,
      loading,
      fetchProfiles,
      getApplicableProfile,
      checkClaim,
      createProfile,
      updateProfile,
      deleteProfile
    }}>
      {children}
    </PolicyProfilesContext.Provider>
  );
}

export function usePolicyProfiles() {
  const context = useContext(PolicyProfilesContext);
  if (context === undefined) {
    throw new Error('usePolicyProfiles must be used within a PolicyProfilesProvider');
  }
  return context;
}
