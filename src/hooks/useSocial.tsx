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
  connectAccount: (platform: string, handle: string) => Promise<{ error: Error | null }>;
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

    try {
      const [accountsRes, postsRes] = await Promise.all([
        supabase
          .from('social_accounts')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('platform', { ascending: true }),
        supabase
          .from('social_posts')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('created_at', { ascending: false })
          .limit(100), // Pagination limit
      ]);

      if (accountsRes.error) {
        console.error('[useSocial] Accounts fetch error:', accountsRes.error);
      }
      if (postsRes.error) {
        console.error('[useSocial] Posts fetch error:', postsRes.error);
      }

      // Map accounts from DB using actual schema columns
      const dbAccounts = (accountsRes.data || []).map(a => ({
        id: a.id,
        platform: a.platform,
        connected: a.is_active || false,
        handle: a.account_name,
        followers: a.followers_count,
      }));

      // Ensure all 4 platforms are represented (show disconnected if not in DB)
      const platformList = ['instagram', 'facebook', 'linkedin', 'twitter'];
      const allAccounts = platformList.map(platform => {
        const existing = dbAccounts.find(a => a.platform.toLowerCase() === platform);
        return existing || { 
          id: platform, 
          platform, 
          connected: false, 
          handle: null, 
          followers: null 
        };
      });

      setAccounts(allAccounts);

      // Map posts from DB using actual schema columns
      setPosts((postsRes.data || []).map(p => ({
        id: p.id,
        content: p.content,
        platforms: [], // Single account per post in this schema
        scheduled_for: null, // Not in current schema
        published_at: p.published_at,
        status: (p.status as 'draft' | 'scheduled' | 'published') || 'draft',
        type: 'Post',
        reach: p.reach,
        likes: p.engagement_likes,
        comments: p.engagement_comments,
        shares: p.engagement_shares,
      })));
    } catch (error) {
      console.error('[useSocial] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocial();
  }, [currentWorkspace]);

  const createPost = async (data: Partial<SocialPost>) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    // Validate content
    if (!data.content?.trim()) {
      return { error: new Error('Content is required') };
    }

    if (data.content.length > 2200) {
      return { error: new Error('Content exceeds maximum length (2200 chars)') };
    }

    const insertData = {
      workspace_id: currentWorkspace.id,
      content: data.content.trim(),
      status: 'draft',
    };

    try {
      const { error } = await supabase.from('social_posts').insert(insertData as any);

      if (!error) fetchSocial();
      return { error: error as Error | null };
    } catch (err) {
      console.error('[useSocial] Create post error:', err);
      return { error: err as Error };
    }
  };

  const updatePost = async (postId: string, data: Partial<SocialPost>) => {
    const updateData: Record<string, unknown> = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await supabase
      .from('social_posts')
      .update(updateData)
      .eq('id', postId);

    if (!error) fetchSocial();
    return { error: error as Error | null };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);

    if (!error) fetchSocial();
    return { error: error as Error | null };
  };

  const publishPost = async (postId: string) => {
    const { error } = await supabase
      .from('social_posts')
      .update({ 
        status: 'published', 
        published_at: new Date().toISOString() 
      })
      .eq('id', postId);

    if (!error) fetchSocial();
    return { error: error as Error | null };
  };

  const connectAccount = async (platform: string, handle: string) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    // Check if account exists
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', currentWorkspace.id)
      .eq('platform', platform)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('social_accounts')
        .update({ account_name: handle, is_active: true })
        .eq('id', existing.id);
      
      if (!error) fetchSocial();
      return { error: error as Error | null };
    } else {
      // Create new
      const { error } = await supabase.from('social_accounts').insert({
        workspace_id: currentWorkspace.id,
        platform,
        account_name: handle,
        is_active: true,
      });

      if (!error) fetchSocial();
      return { error: error as Error | null };
    }
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
      connectAccount,
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
