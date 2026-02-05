 import { useEffect, useRef, useCallback } from 'react';
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
 
   const subscribe = useCallback(() => {
     if (!enabled) return;
 
     const channel = supabase
       .channel(channelName)
       .on(
         'postgres_changes',
         {
           event: config.event || '*',
           schema: config.schema || 'public',
           table: config.table,
           filter: config.filter,
         },
         (payload) => {
           onPayload(payload as RealtimePostgresChangesPayload<T>);
         }
       )
       .subscribe();
 
     channelRef.current = channel;
   }, [channelName, config, onPayload, enabled]);
 
   useEffect(() => {
     subscribe();
 
     return () => {
       if (channelRef.current) {
         supabase.removeChannel(channelRef.current);
         channelRef.current = null;
       }
     };
   }, [subscribe]);
 
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
 
   useEffect(() => {
     if (!enabled || configs.length === 0) return;
 
     let channel = supabase.channel(channelName);
 
     configs.forEach((config) => {
       channel = channel.on(
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
           table: config.table,
           filter: config.filter,
         },
         (payload) => {
           config.onPayload(payload as RealtimePostgresChangesPayload<Record<string, unknown>>);
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
   }, [channelName, configs, enabled]);
 
   return channelRef.current;
 }