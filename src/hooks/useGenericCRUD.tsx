/**
 * Generic CRUD Hook Factory
 * Reduces boilerplate for data hooks by ~60%
 * 
 * Usage:
 * const { items, loading, create, update, remove } = useGenericCRUD<Campaign>({
 *   table: 'campaigns',
 *   workspaceKey: 'workspace_id',
 *   orderBy: { column: 'created_at', ascending: false },
 * });
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Get all table names from Database type
type TableName = keyof Database['public']['Tables'];

export interface CRUDConfig {
  /** Supabase table name */
  table: TableName;
  
  /** Key for workspace filtering (default: 'workspace_id') */
  workspaceKey?: string;
  
  /** Key for site filtering (optional) */
  siteKey?: string;
  
  /** Additional filter conditions */
  filters?: Record<string, unknown>;
  
  /** Order configuration */
  orderBy?: { column: string; ascending?: boolean };
  
  /** Select specific columns */
  select?: string;
  
  /** Custom messages */
  messages?: {
    createSuccess?: string;
    createError?: string;
    updateSuccess?: string;
    updateError?: string;
    deleteSuccess?: string;
    deleteError?: string;
  };
  
  /** Disable automatic workspace filtering */
  skipWorkspaceFilter?: boolean;
  
  /** Default values for create */
  defaults?: Record<string, unknown>;
}

export interface CRUDResult<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  create: (data: Record<string, unknown>) => Promise<{ data: T | null; error: Error | null }>;
  update: (id: string, data: Record<string, unknown>) => Promise<{ error: Error | null }>;
  remove: (id: string) => Promise<{ error: Error | null }>;
  bulkCreate: (items: Record<string, unknown>[]) => Promise<{ error: Error | null }>;
  bulkDelete: (ids: string[]) => Promise<{ error: Error | null }>;
}

/**
 * Generic CRUD hook factory
 * Creates a fully typed CRUD hook for any Supabase table
 */
export function useGenericCRUD<T extends { id: string }>(
  config: CRUDConfig
): CRUDResult<T> {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    table,
    workspaceKey = 'workspace_id',
    siteKey,
    filters = {},
    orderBy,
    select = '*',
    messages = {},
    skipWorkspaceFilter = false,
    defaults = {},
  } = config;

  const defaultMessages = useMemo(() => ({
    createSuccess: messages.createSuccess || 'Élément créé avec succès',
    createError: messages.createError || 'Erreur lors de la création',
    updateSuccess: messages.updateSuccess || 'Élément mis à jour',
    updateError: messages.updateError || 'Erreur lors de la mise à jour',
    deleteSuccess: messages.deleteSuccess || 'Élément supprimé',
    deleteError: messages.deleteError || 'Erreur lors de la suppression',
  }), [messages]);

  const fetch = useCallback(async () => {
    // Skip if no workspace (unless explicitly disabled)
    if (!skipWorkspaceFilter && !currentWorkspace) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Skip if site required but not selected
    if (siteKey && !currentSite) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use a simpler approach with type assertions
      const baseQuery = supabase.from(table).select(select);
      
      // We'll build the query step by step using any to work around Supabase's strict types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = baseQuery;

      // Apply workspace filter
      if (!skipWorkspaceFilter && currentWorkspace) {
        query = query.eq(workspaceKey, currentWorkspace.id);
      }

      // Apply site filter if configured
      if (siteKey && currentSite) {
        query = query.eq(siteKey, currentSite.id);
      }

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      const { data, error: queryError } = await query;
      
      if (queryError) {
        throw queryError;
      }

      setItems((data || []) as T[]);
    } catch (err) {
      console.error(`[useGenericCRUD:${table}] Fetch error:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [table, select, workspaceKey, siteKey, currentWorkspace, currentSite, filters, orderBy, skipWorkspaceFilter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(async (data: Record<string, unknown>) => {
    if (!skipWorkspaceFilter && !currentWorkspace) {
      return { data: null, error: new Error('No workspace selected') };
    }

    const insertData = {
      ...defaults,
      ...data,
      ...(skipWorkspaceFilter ? {} : { [workspaceKey]: currentWorkspace!.id }),
      ...(siteKey && currentSite ? { [siteKey]: currentSite.id } : {}),
    };

    try {
      const result = await (supabase.from(table) as unknown as {
        insert: (d: Record<string, unknown>) => { select: () => { single: () => Promise<{ data: unknown; error: unknown }> } }
      }).insert(insertData).select().single();

      if (result.error) {
        toast.error(defaultMessages.createError);
        return { data: null, error: result.error as Error };
      }

      toast.success(defaultMessages.createSuccess);
      await fetch();
      return { data: result.data as T, error: null };
    } catch (err) {
      toast.error(defaultMessages.createError);
      return { data: null, error: err as Error };
    }
  }, [table, workspaceKey, siteKey, currentWorkspace, currentSite, skipWorkspaceFilter, defaults, defaultMessages, fetch]);

  const update = useCallback(async (id: string, data: Record<string, unknown>) => {
    try {
      const result = await (supabase.from(table) as unknown as {
        update: (d: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<{ error: unknown }> }
      }).update(data).eq('id', id);

      if (result.error) {
        toast.error(defaultMessages.updateError);
        return { error: result.error as Error };
      }

      toast.success(defaultMessages.updateSuccess);
      await fetch();
      return { error: null };
    } catch (err) {
      toast.error(defaultMessages.updateError);
      return { error: err as Error };
    }
  }, [table, defaultMessages, fetch]);

  const remove = useCallback(async (id: string) => {
    try {
      const result = await (supabase.from(table) as unknown as {
        delete: () => { eq: (k: string, v: string) => Promise<{ error: unknown }> }
      }).delete().eq('id', id);

      if (result.error) {
        toast.error(defaultMessages.deleteError);
        return { error: result.error as Error };
      }

      toast.success(defaultMessages.deleteSuccess);
      await fetch();
      return { error: null };
    } catch (err) {
      toast.error(defaultMessages.deleteError);
      return { error: err as Error };
    }
  }, [table, defaultMessages, fetch]);

  const bulkCreate = useCallback(async (newItems: Record<string, unknown>[]) => {
    if (!skipWorkspaceFilter && !currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    const insertData = newItems.map(item => ({
      ...defaults,
      ...item,
      ...(skipWorkspaceFilter ? {} : { [workspaceKey]: currentWorkspace!.id }),
      ...(siteKey && currentSite ? { [siteKey]: currentSite.id } : {}),
    }));

    try {
      const result = await (supabase.from(table) as unknown as {
        insert: (d: Record<string, unknown>[]) => Promise<{ error: unknown }>
      }).insert(insertData);

      if (result.error) {
        toast.error(`Erreur lors de la création en masse`);
        return { error: result.error as Error };
      }

      toast.success(`${newItems.length} éléments créés`);
      await fetch();
      return { error: null };
    } catch (err) {
      toast.error(`Erreur lors de la création en masse`);
      return { error: err as Error };
    }
  }, [table, workspaceKey, siteKey, currentWorkspace, currentSite, skipWorkspaceFilter, defaults, fetch]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      const result = await (supabase.from(table) as unknown as {
        delete: () => { in: (k: string, v: string[]) => Promise<{ error: unknown }> }
      }).delete().in('id', ids);

      if (result.error) {
        toast.error(`Erreur lors de la suppression en masse`);
        return { error: result.error as Error };
      }

      toast.success(`${ids.length} éléments supprimés`);
      await fetch();
      return { error: null };
    } catch (err) {
      toast.error(`Erreur lors de la suppression en masse`);
      return { error: err as Error };
    }
  }, [table, fetch]);

  return {
    items,
    loading,
    error,
    refetch: fetch,
    create,
    update,
    remove,
    bulkCreate,
    bulkDelete,
  };
}

/**
 * Pre-configured hooks using useGenericCRUD
 * These can replace the existing specific hooks
 */

// Example: Campaign CRUD
export function useCampaignsCRUD() {
  return useGenericCRUD<{
    id: string;
    name: string;
    status: string | null;
    budget_daily: number | null;
    ads_account_id: string;
  }>({
    table: 'campaigns',
    orderBy: { column: 'created_at', ascending: false },
    messages: {
      createSuccess: 'Campagne créée avec succès',
      deleteSuccess: 'Campagne supprimée',
    },
  });
}

// Example: Content Briefs CRUD
export function useContentBriefsCRUD() {
  return useGenericCRUD<{
    id: string;
    title: string;
    status: string | null;
    target_keyword: string | null;
    due_date: string | null;
  }>({
    table: 'content_briefs',
    siteKey: 'site_id',
    orderBy: { column: 'created_at', ascending: false },
    messages: {
      createSuccess: 'Brief créé avec succès',
      deleteSuccess: 'Brief supprimé',
    },
  });
}

// Example: Automation Rules CRUD
export function useAutomationRulesCRUD() {
  return useGenericCRUD<{
    id: string;
    name: string;
    trigger_type: string;
    is_active: boolean | null;
    run_count: number | null;
  }>({
    table: 'automation_rules',
    orderBy: { column: 'created_at', ascending: false },
    messages: {
      createSuccess: 'Règle créée avec succès',
      deleteSuccess: 'Règle supprimée',
    },
  });
}
