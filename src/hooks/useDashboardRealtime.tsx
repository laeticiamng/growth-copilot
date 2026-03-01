import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useMultiTableSubscription } from './useRealtimeSubscription';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';

/**
 * Subscribes to dashboard-critical tables via Postgres realtime
 * and invalidates the matching React Query caches on every change.
 *
 * Tables: agent_runs, executive_runs, kpis_daily, approval_queue
 */
export function useDashboardRealtime() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const queryClient = useQueryClient();

  const workspaceId = currentWorkspace?.id;
  const siteId = currentSite?.id;

  const onAgentRunChange = useCallback(
    (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      queryClient.invalidateQueries({ queryKey: ['executive-runs'] });
      queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
    },
    [queryClient],
  );

  const onExecutiveRunChange = useCallback(
    (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      queryClient.invalidateQueries({ queryKey: ['executive-runs'] });
    },
    [queryClient],
  );

  const onKpiChange = useCallback(
    (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis-current'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis-previous'] });
    },
    [queryClient],
  );

  const onApprovalChange = useCallback(
    (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    [queryClient],
  );

  const configs = workspaceId
    ? [
        {
          table: 'agent_runs',
          filter: `workspace_id=eq.${workspaceId}`,
          onPayload: onAgentRunChange,
        },
        {
          table: 'executive_runs',
          filter: `workspace_id=eq.${workspaceId}`,
          onPayload: onExecutiveRunChange,
        },
        ...(siteId
          ? [
              {
                table: 'kpis_daily',
                filter: `site_id=eq.${siteId}`,
                onPayload: onKpiChange,
              },
            ]
          : []),
        {
          table: 'approval_queue',
          filter: `workspace_id=eq.${workspaceId}`,
          onPayload: onApprovalChange,
        },
      ]
    : [];

  useMultiTableSubscription(
    `dashboard-realtime-${workspaceId ?? 'none'}`,
    configs,
    !!workspaceId,
  );
}
