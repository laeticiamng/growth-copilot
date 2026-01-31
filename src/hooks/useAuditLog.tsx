import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

export interface AuditLogEntry {
  id: string;
  workspace_id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  actor_id: string | null;
  actor_type: string;
  changes: Record<string, unknown>;
  context: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface IncidentReport {
  id: string;
  workspace_id: string;
  job_id: string | null;
  agent_run_id: string | null;
  step: string;
  severity: string;
  reason: string;
  suggested_fix: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

interface AuditFilters {
  entity_type?: string;
  action?: string;
  actor_id?: string;
  from_date?: string;
  to_date?: string;
}

interface AuditLogContextType {
  entries: AuditLogEntry[];
  incidents: IncidentReport[];
  loading: boolean;
  filters: AuditFilters;
  setFilters: (filters: AuditFilters) => void;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  resolveIncident: (id: string) => Promise<{ error: Error | null }>;
  exportAuditPack: (entityType?: string, entityId?: string) => Promise<{ data: AuditLogEntry[] | null; error: Error | null }>;
  refetch: () => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

const PAGE_SIZE = 50;

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchAuditLog = useCallback(async (reset = true) => {
    if (!currentWorkspace?.id) {
      setEntries([]);
      setIncidents([]);
      setLoading(false);
      return;
    }

    if (reset) {
      setLoading(true);
      setOffset(0);
    }

    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .range(reset ? 0 : offset, reset ? PAGE_SIZE - 1 : offset + PAGE_SIZE - 1);

      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.actor_id) {
        query = query.eq('actor_id', filters.actor_id);
      }
      if (filters.from_date) {
        query = query.gte('created_at', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('created_at', filters.to_date);
      }

      const { data: auditData, error: auditError } = await query;

      if (auditError) {
        console.error('[useAuditLog] Error:', auditError);
      } else {
        const newEntries = (auditData || []) as unknown as AuditLogEntry[];
        setEntries(reset ? newEntries : [...entries, ...newEntries]);
        setHasMore(newEntries.length === PAGE_SIZE);
        if (!reset) setOffset(offset + PAGE_SIZE);
      }

      // Fetch incidents
      const { data: incidentData, error: incidentError } = await supabase
        .from('incident_reports')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (incidentError) {
        console.error('[useAuditLog] Incidents error:', incidentError);
      } else {
        setIncidents((incidentData || []) as unknown as IncidentReport[]);
      }
    } catch (err) {
      console.error('[useAuditLog] Exception:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, filters, offset, entries]);

  useEffect(() => {
    fetchAuditLog(true);
  }, [currentWorkspace?.id, filters]);

  const fetchMore = async () => {
    if (!hasMore || loading) return;
    await fetchAuditLog(false);
  };

  const resolveIncident = async (id: string) => {
    const { error } = await supabase
      .from('incident_reports')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    await fetchAuditLog(true);
    return { error: null };
  };

  const exportAuditPack = async (entityType?: string, entityId?: string) => {
    if (!currentWorkspace?.id) {
      return { data: null, error: new Error('No workspace selected') };
    }

    let query = supabase
      .from('audit_log')
      .select('*')
      .eq('workspace_id', currentWorkspace.id)
      .order('created_at', { ascending: true });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as unknown as AuditLogEntry[], error: null };
  };

  return (
    <AuditLogContext.Provider value={{
      entries,
      incidents,
      loading,
      filters,
      setFilters,
      fetchMore,
      hasMore,
      resolveIncident,
      exportAuditPack,
      refetch: () => fetchAuditLog(true)
    }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
}
