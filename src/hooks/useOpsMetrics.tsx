import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface OpsMetrics {
  date: string;
  agent_runs_total: number;
  agent_runs_success: number;
  agent_runs_failed: number;
  agent_avg_duration_ms: number | null;
  creative_jobs_total: number;
  creative_jobs_completed: number;
  creative_jobs_manual_review: number;
  total_cost_usd: number;
  render_cost_usd: number;
  ai_cost_usd: number;
  top_manual_review_reasons: string[];
}

interface IncidentReport {
  id: string;
  job_id: string | null;
  job_type: string | null;
  step: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  suggested_fix: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface TokenAuditEntry {
  id: string;
  provider: string;
  action: string;
  scopes: string[];
  error_message: string | null;
  created_at: string;
}

interface OpsContextType {
  metrics: OpsMetrics[];
  incidents: IncidentReport[];
  tokenAudit: TokenAuditEntry[];
  loading: boolean;
  error: string | null;
  fetchMetrics: (startDate: string, endDate: string) => Promise<void>;
  fetchIncidents: (limit?: number) => Promise<void>;
  fetchTokenAudit: (limit?: number) => Promise<void>;
  resolveIncident: (incidentId: string, notes?: string) => Promise<void>;
  computeMetricsForDate: (date: string) => Promise<void>;
}

const OpsContext = createContext<OpsContextType | undefined>(undefined);

export function OpsMetricsProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [metrics, setMetrics] = useState<OpsMetrics[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [tokenAudit, setTokenAudit] = useState<TokenAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (startDate: string, endDate: string) => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('ops_metrics_daily')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      
      setMetrics((data || []).map(d => ({
        date: d.date,
        agent_runs_total: d.agent_runs_total || 0,
        agent_runs_success: d.agent_runs_success || 0,
        agent_runs_failed: d.agent_runs_failed || 0,
        agent_avg_duration_ms: d.agent_avg_duration_ms,
        creative_jobs_total: d.creative_jobs_total || 0,
        creative_jobs_completed: d.creative_jobs_completed || 0,
        creative_jobs_manual_review: d.creative_jobs_manual_review || 0,
        total_cost_usd: Number(d.total_cost_usd) || 0,
        render_cost_usd: Number(d.render_cost_usd) || 0,
        ai_cost_usd: Number(d.ai_cost_usd) || 0,
        top_manual_review_reasons: (d.top_manual_review_reasons as string[]) || []
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const fetchIncidents = useCallback(async (limit = 50) => {
    if (!currentWorkspace) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('incident_reports')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      
      setIncidents((data || []).map(d => ({
        id: d.id,
        job_id: d.job_id,
        job_type: (d as { job_type?: string }).job_type || null,
        step: d.step,
        severity: d.severity as 'low' | 'medium' | 'high' | 'critical',
        reason: d.reason,
        suggested_fix: d.suggested_fix,
        resolved_at: d.resolved_at,
        created_at: d.created_at
      })));
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    }
  }, [currentWorkspace]);

  const fetchTokenAudit = useCallback(async (limit = 100) => {
    if (!currentWorkspace) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('integration_token_audit')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      
      setTokenAudit((data || []).map(d => ({
        id: d.id,
        provider: d.provider,
        action: d.action,
        scopes: (d.scopes as string[]) || [],
        error_message: d.error_message,
        created_at: d.created_at || ''
      })));
    } catch (err) {
      console.error('Failed to fetch token audit:', err);
    }
  }, [currentWorkspace]);

  const resolveIncident = useCallback(async (incidentId: string, notes?: string) => {
    const { data: user } = await supabase.auth.getUser();
    
    const { error: updateError } = await supabase
      .from('incident_reports')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: user?.user?.id,
        resolution_notes: notes
      })
      .eq('id', incidentId);

    if (updateError) throw updateError;
    
    setIncidents(prev => prev.map(i => 
      i.id === incidentId 
        ? { ...i, resolved_at: new Date().toISOString() }
        : i
    ));
  }, []);

  const computeMetricsForDate = useCallback(async (date: string) => {
    if (!currentWorkspace) return;
    
    const { error: rpcError } = await supabase.rpc('compute_ops_metrics', {
      _workspace_id: currentWorkspace.id,
      _date: date
    });

    if (rpcError) throw rpcError;
  }, [currentWorkspace]);

  return (
    <OpsContext.Provider value={{
      metrics,
      incidents,
      tokenAudit,
      loading,
      error,
      fetchMetrics,
      fetchIncidents,
      fetchTokenAudit,
      resolveIncident,
      computeMetricsForDate
    }}>
      {children}
    </OpsContext.Provider>
  );
}

export function useOpsMetrics() {
  const context = useContext(OpsContext);
  if (context === undefined) {
    throw new Error('useOpsMetrics must be used within an OpsMetricsProvider');
  }
  return context;
}
