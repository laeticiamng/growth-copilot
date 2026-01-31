import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "./useWorkspace";
import { useToast } from "./use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface AutomationRule {
  id: string;
  site_id: string | null;
  name: string;
  description: string | null;
  trigger_type: "event" | "schedule" | "condition";
  trigger_config: Record<string, unknown>;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
  last_run_status: string | null;
  created_at: string;
}

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string | number | boolean;
}

export interface AutomationAction {
  type: string;
  config: Record<string, unknown>;
}

export interface AutomationRun {
  id: string;
  rule_id: string;
  trigger_data: Record<string, unknown>;
  actions_executed: Record<string, unknown>[];
  status: "running" | "completed" | "failed";
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

export const TRIGGER_TYPES = [
  { value: "event", label: "Événement", description: "Déclenché quand un événement se produit" },
  { value: "schedule", label: "Planifié", description: "Exécuté selon un horaire défini" },
  { value: "condition", label: "Condition", description: "Déclenché quand une condition est remplie" },
] as const;

export const ACTION_TYPES = [
  { value: "send_notification", label: "Envoyer notification", icon: "Bell" },
  { value: "trigger_webhook", label: "Appeler webhook", icon: "Webhook" },
  { value: "create_task", label: "Créer une tâche", icon: "CheckSquare" },
  { value: "send_email", label: "Envoyer email", icon: "Mail" },
  { value: "update_lead", label: "Mettre à jour lead", icon: "User" },
  { value: "move_deal", label: "Déplacer deal", icon: "ArrowRight" },
  { value: "run_agent", label: "Exécuter agent", icon: "Bot" },
  { value: "add_tag", label: "Ajouter tag", icon: "Tag" },
] as const;

function parseJsonArray<T>(value: Json | null | undefined, fallback: T[]): T[] {
  if (!value) return fallback;
  if (Array.isArray(value)) return value as unknown as T[];
  return fallback;
}

export function useAutomations() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRules(
        (data || []).map((r) => ({
          id: r.id,
          site_id: r.site_id,
          name: r.name,
          description: r.description,
          trigger_type: r.trigger_type as AutomationRule["trigger_type"],
          trigger_config: (r.trigger_config || {}) as Record<string, unknown>,
          conditions: parseJsonArray<AutomationCondition>(r.conditions, []),
          actions: parseJsonArray<AutomationAction>(r.actions, []),
          is_active: r.is_active ?? true,
          run_count: r.run_count ?? 0,
          last_run_at: r.last_run_at,
          last_run_status: r.last_run_status,
          created_at: r.created_at ?? new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("[Automations] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(
    async (
      rule: Omit<AutomationRule, "id" | "run_count" | "last_run_at" | "last_run_status" | "created_at">
    ) => {
      if (!currentWorkspace?.id) return null;

      try {
        const { data, error } = await supabase
          .from("automation_rules")
          .insert({
            name: rule.name,
            description: rule.description,
            site_id: rule.site_id,
            trigger_type: rule.trigger_type,
            trigger_config: rule.trigger_config as Json,
            conditions: rule.conditions as unknown as Json,
            actions: rule.actions as unknown as Json,
            is_active: rule.is_active,
            workspace_id: currentWorkspace.id,
          })
          .select()
          .single();

        if (error) throw error;

        toast({ title: "Automation créée", description: `${rule.name} est maintenant active.` });
        await fetchRules();
        return data;
      } catch (error) {
        console.error("[Automations] Create error:", error);
        toast({ title: "Erreur", description: "Impossible de créer l'automation.", variant: "destructive" });
        return null;
      }
    },
    [currentWorkspace?.id, fetchRules, toast]
  );

  const updateRule = useCallback(
    async (id: string, updates: Partial<AutomationRule>) => {
      if (!currentWorkspace?.id) return false;

      try {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.site_id !== undefined) dbUpdates.site_id = updates.site_id;
        if (updates.trigger_type !== undefined) dbUpdates.trigger_type = updates.trigger_type;
        if (updates.trigger_config !== undefined) dbUpdates.trigger_config = updates.trigger_config;
        if (updates.conditions !== undefined) dbUpdates.conditions = updates.conditions as unknown as Json;
        if (updates.actions !== undefined) dbUpdates.actions = updates.actions as unknown as Json;
        if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

        const { error } = await supabase
          .from("automation_rules")
          .update(dbUpdates)
          .eq("id", id)
          .eq("workspace_id", currentWorkspace.id);

        if (error) throw error;

        toast({ title: "Automation mise à jour" });
        await fetchRules();
        return true;
      } catch (error) {
        console.error("[Automations] Update error:", error);
        toast({ title: "Erreur", description: "Impossible de mettre à jour.", variant: "destructive" });
        return false;
      }
    },
    [currentWorkspace?.id, fetchRules, toast]
  );

  const deleteRule = useCallback(
    async (id: string) => {
      if (!currentWorkspace?.id) return false;

      try {
        const { error } = await supabase
          .from("automation_rules")
          .delete()
          .eq("id", id)
          .eq("workspace_id", currentWorkspace.id);

        if (error) throw error;

        toast({ title: "Automation supprimée" });
        await fetchRules();
        return true;
      } catch (error) {
        console.error("[Automations] Delete error:", error);
        toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
        return false;
      }
    },
    [currentWorkspace?.id, fetchRules, toast]
  );

  const toggleRule = useCallback(
    async (id: string, isActive: boolean) => {
      return updateRule(id, { is_active: isActive });
    },
    [updateRule]
  );

  const getRuns = useCallback(
    async (ruleId: string): Promise<AutomationRun[]> => {
      if (!currentWorkspace?.id) return [];

      try {
        const { data, error } = await supabase
          .from("automation_runs")
          .select("*")
          .eq("rule_id", ruleId)
          .eq("workspace_id", currentWorkspace.id)
          .order("started_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return (data || []).map((r) => ({
          id: r.id,
          rule_id: r.rule_id,
          status: r.status as AutomationRun["status"],
          error_message: r.error_message,
          started_at: r.started_at ?? new Date().toISOString(),
          completed_at: r.completed_at,
          duration_ms: r.duration_ms,
          trigger_data: (r.trigger_data || {}) as Record<string, unknown>,
          actions_executed: parseJsonArray<Record<string, unknown>>(r.actions_executed, []),
        }));
      } catch (error) {
        console.error("[Automations] Runs fetch error:", error);
        return [];
      }
    },
    [currentWorkspace?.id]
  );

  return {
    rules,
    loading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    getRuns,
    refetch: fetchRules,
  };
}
