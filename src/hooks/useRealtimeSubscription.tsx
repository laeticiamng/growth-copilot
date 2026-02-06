import { useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionConfig {
  table: string;
  schema?: string;
  filter?: string;
  event?: PostgresChangeEvent;
}

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  channelName: string,
  config: SubscriptionConfig,
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void,
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onPayloadRef = useRef(onPayload);
  onPayloadRef.current = onPayload;

  // Stabilize config to avoid re-subscriptions on every render
  const configKey = useMemo(
    () => `${config.table}:${config.schema || 'public'}:${config.filter || ''}:${config.event || '*'}`,
    [config.table, config.schema, config.filter, config.event]
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: (config.event || '*') as PostgresChangeEvent,
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload) => {
          onPayloadRef.current(payload as RealtimePostgresChangesPayload<T>);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, configKey, enabled]);

  return channelRef.current;
}

// Multi-table subscription hook
export function useMultiTableSubscription(
  channelName: string,
  configs: Array<{
    table: string;
    filter?: string;
    onPayload: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  }>,
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  // Store callbacks in refs to avoid re-subscriptions
  const configsRef = useRef(configs);
  configsRef.current = configs;

  // Stabilize on table+filter identity only
  const configsKey = useMemo(
    () => configs.map(c => `${c.table}:${c.filter || ''}`).join('|'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configs.map(c => `${c.table}:${c.filter || ''}`).join('|')]
  );

  useEffect(() => {
    if (!enabled || configsRef.current.length === 0) return;

    let channel = supabase.channel(channelName);

    configsRef.current.forEach((cfg, idx) => {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: cfg.table,
          filter: cfg.filter,
        },
        (payload) => {
          configsRef.current[idx]?.onPayload(
            payload as RealtimePostgresChangesPayload<Record<string, unknown>>
          );
        }
      );
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, configsKey, enabled]);

  return channelRef.current;
}
