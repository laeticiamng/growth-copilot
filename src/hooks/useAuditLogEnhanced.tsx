import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface AuditEntry {
  id: string;
  workspace_id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  actor_id: string | null;
  actor_type: string;
  changes: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  created_at: string;
}

interface AuditFilters {
  entityType?: string;
  actorType?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

interface UseAuditLogOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAuditLogEnhanced(options: UseAuditLogOptions = {}) {
  const { limit = 50, autoRefresh = false, refreshInterval = 30000 } = options;
  const { currentWorkspace } = useWorkspace();
  const [filters, setFilters] = useState<AuditFilters>({});

  const { data: entries, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-log-enhanced', currentWorkspace?.id, filters, limit],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters.actorType) {
        query = query.eq('actor_type', filters.actorType);
      }
      if (filters.action) {
        query = query.ilike('action', `%${filters.action}%`);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AuditEntry[];
    },
    enabled: !!currentWorkspace?.id,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Statistics
  const stats = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        totalEntries: 0,
        byEntityType: {},
        byActorType: {},
        byAction: {},
        todayCount: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const byEntityType: Record<string, number> = {};
    const byActorType: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    let todayCount = 0;

    entries.forEach(entry => {
      // By entity type
      byEntityType[entry.entity_type] = (byEntityType[entry.entity_type] || 0) + 1;
      
      // By actor type
      byActorType[entry.actor_type] = (byActorType[entry.actor_type] || 0) + 1;
      
      // By action
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
      
      // Today count
      if (new Date(entry.created_at) >= today) {
        todayCount++;
      }
    });

    return {
      totalEntries: entries.length,
      byEntityType,
      byActorType,
      byAction,
      todayCount,
    };
  }, [entries]);

  // Unique values for filters
  const filterOptions = useMemo(() => {
    if (!entries) return { entityTypes: [], actorTypes: [], actions: [] };

    return {
      entityTypes: [...new Set(entries.map(e => e.entity_type))].sort(),
      actorTypes: [...new Set(entries.map(e => e.actor_type))].sort(),
      actions: [...new Set(entries.map(e => e.action))].sort(),
    };
  }, [entries]);

  const updateFilters = useCallback((newFilters: Partial<AuditFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!entries || entries.length === 0) return;

    const headers = ['Date', 'Entity Type', 'Action', 'Actor Type', 'Actor ID', 'Entity ID', 'Changes'];
    const rows = entries.map(entry => [
      new Date(entry.created_at).toISOString(),
      entry.entity_type,
      entry.action,
      entry.actor_type,
      entry.actor_id || '',
      entry.entity_id || '',
      entry.changes ? JSON.stringify(entry.changes) : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [entries]);

  return {
    entries: entries || [],
    loading: isLoading,
    error,
    stats,
    filters,
    filterOptions,
    updateFilters,
    clearFilters,
    refetch,
    exportToCSV,
  };
}
