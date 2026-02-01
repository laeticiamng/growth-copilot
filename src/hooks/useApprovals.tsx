import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';

interface ApprovalItem {
  id: string;
  agent_type: string;
  action_type: string;
  action_data: Record<string, unknown>;
  risk_level: string;
  status: string;
  site_id: string | null;
  created_at: string | null;
  expires_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  auto_approved: boolean | null;
}

interface AutopilotSettings {
  id: string;
  enabled: boolean | null;
  require_approval_above_risk: string | null;
  max_actions_per_week: number | null;
  max_daily_budget: number | null;
  allowed_actions: string[] | null;
}

interface ApprovalsContextType {
  pendingApprovals: ApprovalItem[];
  recentDecisions: ApprovalItem[];
  autopilotSettings: AutopilotSettings | null;
  loading: boolean;
  refetch: () => void;
  approveAction: (approvalId: string) => Promise<{ error: Error | null }>;
  rejectAction: (approvalId: string, reason: string) => Promise<{ error: Error | null }>;
  updateAutopilotSettings: (settings: Partial<AutopilotSettings>) => Promise<{ error: Error | null }>;
}

const ApprovalsContext = createContext<ApprovalsContextType | undefined>(undefined);

export function ApprovalsProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<ApprovalItem[]>([]);
  const [autopilotSettings, setAutopilotSettings] = useState<AutopilotSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    if (!currentWorkspace) {
      setPendingApprovals([]);
      setRecentDecisions([]);
      setAutopilotSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [pendingRes, recentRes, settingsRes] = await Promise.all([
      supabase
        .from('approval_queue')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('approval_queue')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .neq('status', 'pending')
        .order('reviewed_at', { ascending: false })
        .limit(20),
      supabase
        .from('autopilot_settings')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .single(),
    ]);

    setPendingApprovals((pendingRes.data || []) as ApprovalItem[]);
    setRecentDecisions((recentRes.data || []) as ApprovalItem[]);
    setAutopilotSettings(settingsRes.data as AutopilotSettings | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovals();
  }, [currentWorkspace]);

  // Subscribe to realtime updates for approvals
  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const channel = supabase
      .channel(`approvals:${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approval_queue',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        (payload) => {
          console.log('[Approvals] Realtime update:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            const newApproval = payload.new as ApprovalItem;
            if (newApproval.status === 'pending') {
              setPendingApprovals(prev => [newApproval, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ApprovalItem;
            if (updated.status === 'pending') {
              setPendingApprovals(prev => 
                prev.map(a => a.id === updated.id ? updated : a)
              );
            } else {
              // Moved from pending to decided
              setPendingApprovals(prev => prev.filter(a => a.id !== updated.id));
              setRecentDecisions(prev => [updated, ...prev.slice(0, 19)]);
            }
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setPendingApprovals(prev => prev.filter(a => a.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace?.id]);

  const approveAction = async (approvalId: string) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('approval_queue')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', approvalId);

    if (!error) fetchApprovals();
    return { error: error as Error | null };
  };

  const rejectAction = async (approvalId: string, reason: string) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('approval_queue')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: reason,
      })
      .eq('id', approvalId);

    if (!error) fetchApprovals();
    return { error: error as Error | null };
  };

  const updateAutopilotSettings = async (settings: Partial<AutopilotSettings>) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    if (autopilotSettings) {
      const { error } = await supabase
        .from('autopilot_settings')
        .update(settings)
        .eq('id', autopilotSettings.id);

      if (!error) fetchApprovals();
      return { error: error as Error | null };
    } else {
      const { error } = await supabase
        .from('autopilot_settings')
        .insert({
          ...settings,
          workspace_id: currentWorkspace.id,
        });

      if (!error) fetchApprovals();
      return { error: error as Error | null };
    }
  };

  return (
    <ApprovalsContext.Provider value={{
      pendingApprovals,
      recentDecisions,
      autopilotSettings,
      loading,
      refetch: fetchApprovals,
      approveAction,
      rejectAction,
      updateAutopilotSettings,
    }}>
      {children}
    </ApprovalsContext.Provider>
  );
}

export function useApprovals() {
  const context = useContext(ApprovalsContext);
  if (context === undefined) {
    throw new Error('useApprovals must be used within an ApprovalsProvider');
  }
  return context;
}
