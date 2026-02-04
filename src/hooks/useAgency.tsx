import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface AgencyClient {
  id: string;
  name: string;
  slug: string;
  plan: string;
  sites_count: number;
  health_score: number;
  tokens_used: number;
  tokens_limit: number;
  issues_count: number;
  last_activity: string | null;
  trend: 'up' | 'down' | 'stable';
}

interface AgencyMetrics {
  total_clients: number;
  total_sites: number;
  avg_health_score: number;
  total_mrr: number;
  change_clients: number;
  change_sites: number;
  change_health: number;
  change_mrr: number;
}

interface AgencyTask {
  id: string;
  client_name: string;
  task: string;
  due_in: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  clients_count: number;
  avatar_url: string | null;
}

interface AgencyContextType {
  clients: AgencyClient[];
  metrics: AgencyMetrics;
  tasks: AgencyTask[];
  team: TeamMember[];
  loading: boolean;
  isAgency: boolean;
  refetch: () => void;
  addClient: (name: string, slug: string) => Promise<{ error: Error | null; client: AgencyClient | null }>;
  removeClient: (clientId: string) => Promise<{ error: Error | null }>;
  inviteTeamMember: (email: string, role: string) => Promise<{ error: Error | null }>;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export function AgencyProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace, workspaces } = useWorkspace();
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [metrics, setMetrics] = useState<AgencyMetrics>({
    total_clients: 0,
    total_sites: 0,
    avg_health_score: 0,
    total_mrr: 0,
    change_clients: 0,
    change_sites: 0,
    change_health: 0,
    change_mrr: 0,
  });
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const isAgency = currentWorkspace?.is_agency ?? false;

  const fetchAgencyData = async () => {
    if (!currentWorkspace || !isAgency) {
      setClients([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch agency clients (linked workspaces)
    const { data: agencyClients } = await supabase
      .from('agency_clients')
      .select(`
        id,
        agency_role,
        client_workspace_id,
        workspaces!agency_clients_client_workspace_id_fkey (
          id,
          name,
          slug,
          plan
        )
      `)
      .eq('agency_workspace_id', currentWorkspace.id);

    // For each client workspace, fetch site count and issues
    const clientsWithDetails: AgencyClient[] = [];
    
    for (const client of agencyClients || []) {
      const workspace = client.workspaces as any;
      if (!workspace) continue;

      const [sitesRes, issuesRes] = await Promise.all([
        supabase.from('sites').select('id', { count: 'exact' }).eq('workspace_id', workspace.id),
        supabase.from('approval_queue').select('id', { count: 'exact' }).eq('workspace_id', workspace.id).eq('status', 'pending'),
      ]);

      clientsWithDetails.push({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan || 'free',
        sites_count: sitesRes.count || 0,
        health_score: Math.floor(70 + Math.random() * 25), // Would be calculated from real data
        tokens_used: Math.floor(Math.random() * 500000),
        tokens_limit: 1000000,
        issues_count: issuesRes.count || 0,
        last_activity: new Date().toISOString(),
        trend: Math.random() > 0.3 ? 'up' : 'down',
      });
    }

    setClients(clientsWithDetails);

    // Calculate metrics
    const totalSites = clientsWithDetails.reduce((sum, c) => sum + c.sites_count, 0);
    const avgHealth = clientsWithDetails.length > 0
      ? Math.round(clientsWithDetails.reduce((sum, c) => sum + c.health_score, 0) / clientsWithDetails.length)
      : 0;

    setMetrics({
      total_clients: clientsWithDetails.length,
      total_sites: totalSites,
      avg_health_score: avgHealth,
      total_mrr: clientsWithDetails.length * 149, // Average plan price
      change_clients: 2,
      change_sites: 5,
      change_health: 3,
      change_mrr: 12,
    });

    // Generate tasks from issues
    const urgentTasks: AgencyTask[] = clientsWithDetails
      .filter(c => c.issues_count > 5)
      .map(c => ({
        id: c.id,
        client_name: c.name,
        task: `${c.issues_count} issues critiques à traiter`,
        due_in: 'Urgent',
        priority: 'urgent' as const,
      }));

    setTasks(urgentTasks);

    // Demo team data (would come from workspace_members table)
    setTeam([
      { id: '1', name: 'Vous', email: 'admin@agence.fr', role: 'Owner', clients_count: clientsWithDetails.length, avatar_url: null },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchAgencyData();
  }, [currentWorkspace]);

  const addClient = async (name: string, slug: string) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected'), client: null };
    }

    // Get current user for owner_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('Not authenticated'), client: null };
    }

    // Create a new workspace for the client
    const { data: newWorkspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name,
        slug,
        plan: 'free',
        owner_id: user.id,
      })
      .select()
      .single();

    if (wsError || !newWorkspace) {
      return { error: wsError as Error, client: null };
    }

    // Link the client workspace to the agency
    const { error: linkError } = await supabase
      .from('agency_clients')
      .insert([{
        agency_workspace_id: currentWorkspace.id,
        client_workspace_id: newWorkspace.id,
        agency_role: 'agency_owner' as const,
      }]);

    if (linkError) {
      return { error: linkError as Error, client: null };
    }

    await fetchAgencyData();

    return {
      error: null,
      client: {
        id: newWorkspace.id,
        name: newWorkspace.name,
        slug: newWorkspace.slug,
        plan: 'free',
        sites_count: 0,
        health_score: 100,
        tokens_used: 0,
        tokens_limit: 500000,
        issues_count: 0,
        last_activity: null,
        trend: 'stable' as const,
      },
    };
  };

  const removeClient = async (clientId: string) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    const { error } = await supabase
      .from('agency_clients')
      .delete()
      .eq('agency_workspace_id', currentWorkspace.id)
      .eq('client_workspace_id', clientId);

    if (!error) fetchAgencyData();
    return { error: error as Error | null };
  };

  const inviteTeamMember = async (email: string, role: string) => {
    // Integrate with team invitations system
    if (!currentWorkspace?.id) return { error: new Error('No workspace selected') };
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await supabase
        .from('team_invitations')
        .insert([{
          workspace_id: currentWorkspace.id,
          email,
          role: role as 'owner' | 'admin' | 'manager' | 'analyst' | 'member' | 'viewer',
          invited_by: userId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }]);
      
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AgencyContext.Provider value={{
      clients,
      metrics,
      tasks,
      team,
      loading,
      isAgency,
      refetch: fetchAgencyData,
      addClient,
      removeClient,
      inviteTeamMember,
    }}>
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgency() {
  const context = useContext(AgencyContext);
  if (context === undefined) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
}
