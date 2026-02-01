import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_agency: boolean;
  quota_sites: number;
  quota_crawls_month: number;
  quota_agent_runs_month: number;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  loading: boolean;
  createWorkspace: (name: string, slug: string) => Promise<{ error: Error | null; workspace: Workspace | null }>;
  refetch: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('workspaces')
      .select('*');

    if (error) {
      console.error('Error fetching workspaces:', error);
      setLoading(false);
      return;
    }

    const ws = (data || []) as Workspace[];
    setWorkspaces(ws);
    
    // Auto-select first workspace if none selected
    if (ws.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(ws[0]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const createWorkspace = async (name: string, slug: string) => {
    if (!user) return { error: new Error('Not authenticated'), workspace: null };

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name,
        slug,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) {
      return { error: error as Error, workspace: null };
    }

    const workspace = data as Workspace;
    setWorkspaces(prev => [...prev, workspace]);
    setCurrentWorkspace(workspace);
    
    return { error: null, workspace };
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces, 
      currentWorkspace, 
      setCurrentWorkspace, 
      loading, 
      createWorkspace,
      refetch: fetchWorkspaces 
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
