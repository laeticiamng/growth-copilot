import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "./useWorkspace";
import { useToast } from "./use-toast";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
  headers: Record<string, string>;
  retry_count: number;
  last_triggered_at: string | null;
  last_status: number | null;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

/** Returns localized webhook event options */
export function getWebhookEvents(t: (key: string) => string) {
  return [
    { value: "lead.created", label: t("hooks.webhooks.leadCreated") },
    { value: "lead.updated", label: t("hooks.webhooks.leadUpdated") },
    { value: "deal.created", label: t("hooks.webhooks.dealCreated") },
    { value: "deal.stage_changed", label: t("hooks.webhooks.dealStageChanged") },
    { value: "deal.won", label: t("hooks.webhooks.dealWon") },
    { value: "deal.lost", label: t("hooks.webhooks.dealLost") },
    { value: "approval.pending", label: t("hooks.webhooks.approvalPending") },
    { value: "approval.approved", label: t("hooks.webhooks.approvalApproved") },
    { value: "approval.rejected", label: t("hooks.webhooks.approvalRejected") },
    { value: "agent.completed", label: t("hooks.webhooks.agentCompleted") },
    { value: "agent.error", label: t("hooks.webhooks.agentError") },
    { value: "alert.triggered", label: t("hooks.webhooks.alertTriggered") },
    { value: "report.generated", label: t("hooks.webhooks.reportGenerated") },
  ] as const;
}

/** @deprecated Use getWebhookEvents(t) instead */
export const WEBHOOK_EVENTS = [
  { value: "lead.created", label: "Lead créé" },
  { value: "lead.updated", label: "Lead mis à jour" },
  { value: "deal.created", label: "Deal créé" },
  { value: "deal.stage_changed", label: "Deal changé de stage" },
  { value: "deal.won", label: "Deal gagné" },
  { value: "deal.lost", label: "Deal perdu" },
  { value: "approval.pending", label: "Approbation en attente" },
  { value: "approval.approved", label: "Action approuvée" },
  { value: "approval.rejected", label: "Action rejetée" },
  { value: "agent.completed", label: "Agent terminé" },
  { value: "agent.error", label: "Erreur agent" },
  { value: "alert.triggered", label: "Alerte déclenchée" },
  { value: "report.generated", label: "Rapport généré" },
] as const;

export function useWebhooks() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setWebhooks(
        (data || []).map((w) => ({
          ...w,
          headers: (w.headers || {}) as Record<string, string>,
        }))
      );
    } catch (error) {
      console.error("[Webhooks] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const createWebhook = useCallback(
    async (webhook: Omit<Webhook, "id" | "created_at" | "last_triggered_at" | "last_status">) => {
      if (!currentWorkspace?.id) return null;
      try {
        const { data, error } = await supabase
          .from("webhooks")
          .insert({ ...webhook, workspace_id: currentWorkspace.id })
          .select()
          .single();
        if (error) throw error;
        toast({ title: t("hooks.webhooks.created"), description: t("hooks.webhooks.createdDesc", { name: webhook.name }) });
        await fetchWebhooks();
        return data;
      } catch (error) {
        console.error("[Webhooks] Create error:", error);
        toast({ title: t("hooks.webhooks.error"), description: t("hooks.webhooks.createError"), variant: "destructive" });
        return null;
      }
    },
    [currentWorkspace?.id, fetchWebhooks, toast, t]
  );

  const updateWebhook = useCallback(
    async (id: string, updates: Partial<Webhook>) => {
      if (!currentWorkspace?.id) return false;
      try {
        const { error } = await supabase.from("webhooks").update(updates).eq("id", id).eq("workspace_id", currentWorkspace.id);
        if (error) throw error;
        toast({ title: t("hooks.webhooks.updated") });
        await fetchWebhooks();
        return true;
      } catch (error) {
        console.error("[Webhooks] Update error:", error);
        toast({ title: t("hooks.webhooks.error"), description: t("hooks.webhooks.updateError"), variant: "destructive" });
        return false;
      }
    },
    [currentWorkspace?.id, fetchWebhooks, toast, t]
  );

  const deleteWebhook = useCallback(
    async (id: string) => {
      if (!currentWorkspace?.id) return false;
      try {
        const { error } = await supabase.from("webhooks").delete().eq("id", id).eq("workspace_id", currentWorkspace.id);
        if (error) throw error;
        toast({ title: t("hooks.webhooks.deleted") });
        await fetchWebhooks();
        return true;
      } catch (error) {
        console.error("[Webhooks] Delete error:", error);
        toast({ title: t("hooks.webhooks.error"), description: t("hooks.webhooks.deleteError"), variant: "destructive" });
        return false;
      }
    },
    [currentWorkspace?.id, fetchWebhooks, toast, t]
  );

  const testWebhook = useCallback(
    async (id: string) => {
      if (!currentWorkspace?.id) return false;
      try {
        const { data, error } = await supabase.functions.invoke("webhooks", {
          body: { action: "test", webhook_id: id, workspace_id: currentWorkspace.id },
        });
        if (error) throw error;
        toast({
          title: t("hooks.webhooks.testSent"),
          description: data.success ? t("hooks.webhooks.testSuccess") : t("hooks.webhooks.testFailed"),
          variant: data.success ? "default" : "destructive",
        });
        await fetchWebhooks();
        return data.success;
      } catch (error) {
        console.error("[Webhooks] Test error:", error);
        toast({ title: t("hooks.webhooks.error"), description: t("hooks.webhooks.testError"), variant: "destructive" });
        return false;
      }
    },
    [currentWorkspace?.id, fetchWebhooks, toast, t]
  );

  const getWebhookLogs = useCallback(
    async (webhookId: string): Promise<WebhookLog[]> => {
      if (!currentWorkspace?.id) return [];
      try {
        const { data, error } = await supabase
          .from("webhook_logs")
          .select("*")
          .eq("webhook_id", webhookId)
          .eq("workspace_id", currentWorkspace.id)
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        return (data || []).map((l) => ({
          ...l,
          payload: (l.payload || {}) as Record<string, unknown>,
        }));
      } catch (error) {
        console.error("[Webhooks] Logs fetch error:", error);
        return [];
      }
    },
    [currentWorkspace?.id]
  );

  return { webhooks, loading, createWebhook, updateWebhook, deleteWebhook, testWebhook, getWebhookLogs, refetch: fetchWebhooks };
}
