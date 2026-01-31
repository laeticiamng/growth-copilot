import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface SocialAccount {
  id: string;
  platform: string;
  connected: boolean;
  handle: string | null;
  followers: number | null;
}

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduled_for: string | null;
  published_at: string | null;
  status: 'draft' | 'scheduled' | 'published';
  type: string;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

interface SocialContextType {
  accounts: SocialAccount[];
  posts: SocialPost[];
  loading: boolean;
  refetch: () => void;
  createPost: (data: Partial<SocialPost>) => Promise<{ error: Error | null }>;
  updatePost: (postId: string, data: Partial<SocialPost>) => Promise<{ error: Error | null }>;
  deletePost: (postId: string) => Promise<{ error: Error | null }>;
  publishPost: (postId: string) => Promise<{ error: Error | null }>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSocial = async () => {
    if (!currentWorkspace) {
      setAccounts([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // For now, use demo data as social tables don't exist yet
    // In production, these would be fetched from social_accounts and social_posts tables
    setAccounts([
      { id: '1', platform: 'instagram', connected: true, handle: '@mycompany', followers: 12400 },
      { id: '2', platform: 'facebook', connected: true, handle: 'My Company', followers: 8200 },
      { id: '3', platform: 'linkedin', connected: false, handle: null, followers: null },
      { id: '4', platform: 'twitter', connected: false, handle: null, followers: null },
    ]);

    setPosts([
      { id: '1', content: '🚀 Nouveau guide SEO 2026 disponible !', platforms: ['instagram', 'facebook'], scheduled_for: '2026-01-26T10:00:00Z', published_at: null, status: 'scheduled', type: 'Carrousel', reach: null, likes: null, comments: null, shares: null },
      { id: '2', content: '💡 Astuce du jour : Comment optimiser...', platforms: ['instagram'], scheduled_for: '2026-01-27T14:00:00Z', published_at: null, status: 'scheduled', type: 'Reel', reach: null, likes: null, comments: null, shares: null },
      { id: '3', content: '🎯 Case study : +150% de trafic', platforms: ['linkedin', 'facebook'], scheduled_for: null, published_at: null, status: 'draft', type: 'Post', reach: null, likes: null, comments: null, shares: null },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchSocial();
  }, [currentWorkspace]);

  const createPost = async (data: Partial<SocialPost>) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    // In production, this would insert into social_posts table
    const newPost: SocialPost = {
      id: Date.now().toString(),
      content: data.content || '',
      platforms: data.platforms || [],
      scheduled_for: data.scheduled_for || null,
      published_at: null,
      status: data.scheduled_for ? 'scheduled' : 'draft',
      type: data.type || 'Post',
      reach: null,
      likes: null,
      comments: null,
      shares: null,
    };

    setPosts(prev => [newPost, ...prev]);
    return { error: null };
  };

  const updatePost = async (postId: string, data: Partial<SocialPost>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...data } : p));
    return { error: null };
  };

  const deletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    return { error: null };
  };

  const publishPost = async (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, status: 'published' as const, published_at: new Date().toISOString() }
        : p
    ));
    return { error: null };
  };

  return (
    <SocialContext.Provider value={{
      accounts,
      posts,
      loading,
      refetch: fetchSocial,
      createPost,
      updatePost,
      deletePost,
      publishPost,
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}