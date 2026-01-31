import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface FeatureFlags {
  seo_tech: boolean;
  content: boolean;
  local_seo: boolean;
  ads: boolean;
  social: boolean;
  cro: boolean;
  offers: boolean;
  lifecycle: boolean;
  reputation: boolean;
  reports: boolean;
  autopilot: boolean;
}

const defaultFlags: FeatureFlags = {
  seo_tech: true,
  content: true,
  local_seo: true,
  ads: false,
  social: false,
  cro: false,
  offers: false,
  lifecycle: false,
  reputation: false,
  reports: true,
  autopilot: false,
};

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  loading: boolean;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  updateFlags: (newFlags: Partial<FeatureFlags>) => Promise<{ error: Error | null }>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      if (!currentWorkspace) {
        setFlags(defaultFlags);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('feature_flags')
        .select('flags')
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (error) {
        console.error('Error fetching feature flags:', error);
        setFlags(defaultFlags);
      } else if (data?.flags) {
        setFlags({ ...defaultFlags, ...(data.flags as Partial<FeatureFlags>) });
      }
      
      setLoading(false);
    };

    fetchFlags();
  }, [currentWorkspace]);

  const isEnabled = (flag: keyof FeatureFlags) => flags[flag];

  const updateFlags = async (newFlags: Partial<FeatureFlags>) => {
    if (!currentWorkspace) return { error: new Error('No workspace selected') };

    const updatedFlags = { ...flags, ...newFlags };
    
    const { error } = await supabase
      .from('feature_flags')
      .update({ flags: updatedFlags })
      .eq('workspace_id', currentWorkspace.id);

    if (error) {
      return { error: error as Error };
    }

    setFlags(updatedFlags);
    return { error: null };
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, isEnabled, updateFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}
