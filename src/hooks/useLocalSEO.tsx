import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';

interface GBPProfile {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  rating_avg: number | null;
  reviews_count: number | null;
  photos_count: number | null;
  audit_score: number | null;
  categories: unknown[] | null;
  hours: Record<string, unknown> | null;
  attributes: Record<string, unknown> | null;
}

interface GBPPost {
  id: string;
  title: string | null;
  content: string | null;
  post_type: string | null;
  status: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  image_url: string | null;
  cta_type: string | null;
  cta_url: string | null;
}

interface LocalSEOContextType {
  profiles: GBPProfile[];
  currentProfile: GBPProfile | null;
  posts: GBPPost[];
  loading: boolean;
  refetch: () => void;
  setCurrentProfile: (profile: GBPProfile | null) => void;
  createPost: (data: Partial<GBPPost>) => Promise<{ error: Error | null }>;
  updatePostStatus: (postId: string, status: string) => Promise<{ error: Error | null }>;
}

const LocalSEOContext = createContext<LocalSEOContextType | undefined>(undefined);

export function LocalSEOProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [profiles, setProfiles] = useState<GBPProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<GBPProfile | null>(null);
  const [posts, setPosts] = useState<GBPPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocalSEO = async () => {
    if (!currentWorkspace) {
      setProfiles([]);
      setCurrentProfile(null);
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: profilesData } = await supabase
      .from('gbp_profiles')
      .select('*')
      .eq('workspace_id', currentWorkspace.id);

    const gbpProfiles = (profilesData || []) as GBPProfile[];
    setProfiles(gbpProfiles);

    if (gbpProfiles.length > 0 && !currentProfile) {
      const siteProfile = currentSite 
        ? gbpProfiles.find(p => p.id === currentSite.id) 
        : gbpProfiles[0];
      setCurrentProfile(siteProfile || gbpProfiles[0]);
    }

    if (currentProfile) {
      const { data: postsData } = await supabase
        .from('gbp_posts')
        .select('*')
        .eq('gbp_profile_id', currentProfile.id)
        .order('created_at', { ascending: false });

      setPosts((postsData || []) as GBPPost[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLocalSEO();
  }, [currentWorkspace, currentSite, currentProfile?.id]);

  const createPost = async (data: Partial<GBPPost>) => {
    if (!currentWorkspace || !currentProfile) {
      return { error: new Error('No workspace or profile selected') };
    }

    const { error } = await supabase.from('gbp_posts').insert({
      ...data,
      workspace_id: currentWorkspace.id,
      gbp_profile_id: currentProfile.id,
    });

    if (!error) fetchLocalSEO();
    return { error: error as Error | null };
  };

  const updatePostStatus = async (postId: string, status: string) => {
    const { error } = await supabase
      .from('gbp_posts')
      .update({ status })
      .eq('id', postId);

    if (!error) fetchLocalSEO();
    return { error: error as Error | null };
  };

  return (
    <LocalSEOContext.Provider value={{
      profiles,
      currentProfile,
      posts,
      loading,
      refetch: fetchLocalSEO,
      setCurrentProfile,
      createPost,
      updatePostStatus,
    }}>
      {children}
    </LocalSEOContext.Provider>
  );
}

export function useLocalSEO() {
  const context = useContext(LocalSEOContext);
  if (context === undefined) {
    throw new Error('useLocalSEO must be used within a LocalSEOProvider');
  }
  return context;
}
