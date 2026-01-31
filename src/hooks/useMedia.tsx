import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useToast } from './use-toast';

interface MediaAsset {
  id: string;
  workspace_id: string;
  site_id: string | null;
  platform: string;
  url: string;
  title: string | null;
  description: string | null;
  platform_id: string | null;
  thumbnail_url: string | null;
  embed_html: string | null;
  artist_name: string | null;
  release_date: string | null;
  language: string;
  genre: string | null;
  target_markets: string[];
  smart_link_slug: string | null;
  smart_link_config: Record<string, unknown>;
  metadata_json: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MediaCreative {
  id: string;
  media_asset_id: string;
  workspace_id: string;
  format: string;
  name: string | null;
  copy_json: Record<string, unknown>;
  file_refs: string[];
  platform_target: string | null;
  status: string;
  created_at: string;
}

interface MediaCampaign {
  id: string;
  workspace_id: string;
  media_asset_id: string;
  name: string;
  objective: string | null;
  budget: number;
  spent: number;
  status: string;
  start_at: string | null;
  end_at: string | null;
}

interface MediaContextType {
  assets: MediaAsset[];
  loading: boolean;
  selectedAsset: MediaAsset | null;
  setSelectedAsset: (asset: MediaAsset | null) => void;
  createAsset: (url: string) => Promise<MediaAsset | null>;
  updateAsset: (id: string, updates: Partial<MediaAsset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  runAgent: (agentType: string, assetId: string, options?: Record<string, unknown>) => Promise<unknown>;
  refetch: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!currentWorkspace) {
      setAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('workspace_id', currentWorkspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media assets',
        variant: 'destructive',
      });
    } else {
      setAssets((data || []) as unknown as MediaAsset[]);
    }
    setLoading(false);
  }, [currentWorkspace, toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const createAsset = async (url: string): Promise<MediaAsset | null> => {
    if (!currentWorkspace) return null;

    try {
      // Call media-detect edge function
      const response = await supabase.functions.invoke('media-detect', {
        body: { 
          url, 
          workspace_id: currentWorkspace.id,
          save: true
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { asset } = response.data;
      
      if (asset) {
        setAssets(prev => [asset as MediaAsset, ...prev]);
        toast({
          title: 'Success',
          description: `Media asset "${asset.title || 'Untitled'}" created`,
        });
        return asset as MediaAsset;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create asset',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateAsset = async (id: string, updates: Record<string, unknown>) => {
    const { error } = await supabase
      .from('media_assets')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update asset',
        variant: 'destructive',
      });
    } else {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      if (selectedAsset?.id === id) {
        setSelectedAsset({ ...selectedAsset, ...updates } as MediaAsset);
      }
      toast({
        title: 'Success',
        description: 'Asset updated',
      });
    }
  };

  const deleteAsset = async (id: string) => {
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete asset',
        variant: 'destructive',
      });
    } else {
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAsset?.id === id) {
        setSelectedAsset(null);
      }
      toast({
        title: 'Success',
        description: 'Asset deleted',
      });
    }
  };

  const runAgent = async (
    agentType: string, 
    assetId: string, 
    options: Record<string, unknown> = {}
  ): Promise<unknown> => {
    if (!currentWorkspace) throw new Error('No workspace selected');

    const response = await supabase.functions.invoke('media-agents', {
      body: {
        agent_type: agentType,
        media_asset_id: assetId,
        workspace_id: currentWorkspace.id,
        options
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  };

  return (
    <MediaContext.Provider value={{
      assets,
      loading,
      selectedAsset,
      setSelectedAsset,
      createAsset,
      updateAsset,
      deleteAsset,
      runAgent,
      refetch: fetchAssets,
    }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}