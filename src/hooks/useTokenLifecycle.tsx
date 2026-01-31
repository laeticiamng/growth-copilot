import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface TokenAuditEntry {
  id: string;
  integration_id: string | null;
  provider: string;
  action: 'created' | 'refreshed' | 'rotated' | 'revoked' | 'auth_failure';
  scopes: string[];
  error_message: string | null;
  created_at: string;
}

interface IntegrationTokenStatus {
  id: string;
  provider: string;
  status: string;
  token_expires_at: string | null;
  token_refresh_at: string | null;
  refresh_failure_count: number;
  last_auth_failure_at: string | null;
  scopes_granted: string[];
}

interface TokenLifecycleContextType {
  tokenStatuses: IntegrationTokenStatus[];
  auditLog: TokenAuditEntry[];
  loading: boolean;
  fetchTokenStatuses: () => Promise<void>;
  fetchAuditLog: (integrationId?: string, limit?: number) => Promise<void>;
  revokeToken: (integrationId: string) => Promise<void>;
  rotateToken: (integrationId: string) => Promise<void>;
  getExpiringTokens: (withinHours?: number) => IntegrationTokenStatus[];
  getFailedTokens: () => IntegrationTokenStatus[];
}

const TokenLifecycleContext = createContext<TokenLifecycleContextType | undefined>(undefined);

export function TokenLifecycleProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [tokenStatuses, setTokenStatuses] = useState<IntegrationTokenStatus[]>([]);
  const [auditLog, setAuditLog] = useState<TokenAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokenStatuses = useCallback(async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('id, provider, status, token_expires_at, token_refresh_at, refresh_failure_count, last_auth_failure_at, scopes_granted')
        .eq('workspace_id', currentWorkspace.id)
        .not('status', 'eq', 'disconnected');

      if (error) throw error;
      
      setTokenStatuses((data || []).map(d => ({
        id: d.id,
        provider: d.provider,
        status: d.status,
        token_expires_at: d.token_expires_at,
        token_refresh_at: d.token_refresh_at,
        refresh_failure_count: d.refresh_failure_count || 0,
        last_auth_failure_at: d.last_auth_failure_at,
        scopes_granted: (d.scopes_granted as string[]) || []
      })));
    } catch (err) {
      console.error('Failed to fetch token statuses:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const fetchAuditLog = useCallback(async (integrationId?: string, limit = 50) => {
    if (!currentWorkspace) return;
    
    try {
      let query = supabase
        .from('integration_token_audit')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setAuditLog((data || []).map(d => ({
        id: d.id,
        integration_id: d.integration_id,
        provider: d.provider,
        action: d.action as TokenAuditEntry['action'],
        scopes: (d.scopes as string[]) || [],
        error_message: d.error_message,
        created_at: d.created_at || ''
      })));
    } catch (err) {
      console.error('Failed to fetch token audit log:', err);
    }
  }, [currentWorkspace]);

  const revokeToken = useCallback(async (integrationId: string) => {
    if (!currentWorkspace) return;
    
    // Update integration status
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ status: 'disconnected' })
      .eq('id', integrationId);

    if (updateError) throw updateError;
    
    // Log the revocation
    await supabase.rpc('log_token_audit', {
      _workspace_id: currentWorkspace.id,
      _integration_id: integrationId,
      _provider: tokenStatuses.find(t => t.id === integrationId)?.provider || 'unknown',
      _action: 'revoked'
    });
    
    setTokenStatuses(prev => prev.filter(t => t.id !== integrationId));
  }, [currentWorkspace, tokenStatuses]);

  const rotateToken = useCallback(async (integrationId: string) => {
    if (!currentWorkspace) return;
    
    // This would typically trigger a re-auth flow
    // For now, we just log the intent
    const integration = tokenStatuses.find(t => t.id === integrationId);
    if (!integration) return;
    
    await supabase.rpc('log_token_audit', {
      _workspace_id: currentWorkspace.id,
      _integration_id: integrationId,
      _provider: integration.provider,
      _action: 'rotated'
    });
    
    // In a real implementation, this would redirect to OAuth flow
    console.log('Token rotation initiated for:', integrationId);
  }, [currentWorkspace, tokenStatuses]);

  const getExpiringTokens = useCallback((withinHours = 24): IntegrationTokenStatus[] => {
    const cutoff = new Date(Date.now() + withinHours * 60 * 60 * 1000);
    return tokenStatuses.filter(t => 
      t.token_expires_at && new Date(t.token_expires_at) < cutoff
    );
  }, [tokenStatuses]);

  const getFailedTokens = useCallback((): IntegrationTokenStatus[] => {
    return tokenStatuses.filter(t => t.refresh_failure_count > 0);
  }, [tokenStatuses]);

  return (
    <TokenLifecycleContext.Provider value={{
      tokenStatuses,
      auditLog,
      loading,
      fetchTokenStatuses,
      fetchAuditLog,
      revokeToken,
      rotateToken,
      getExpiringTokens,
      getFailedTokens
    }}>
      {children}
    </TokenLifecycleContext.Provider>
  );
}

export function useTokenLifecycle() {
  const context = useContext(TokenLifecycleContext);
  if (context === undefined) {
    throw new Error('useTokenLifecycle must be used within a TokenLifecycleProvider');
  }
  return context;
}
