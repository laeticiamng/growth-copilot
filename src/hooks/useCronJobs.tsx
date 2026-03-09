import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";

export interface CronJob {
  jobId: number;
  enabled: boolean;
  title: string;
  url: string;
  lastStatus: number;
  lastDuration: number;
  lastExecution: number;
  nextExecution: number;
  requestTimeout: number;
  requestMethod: number;
  schedule: {
    timezone: string;
    hours: number[];
    mdays: number[];
    minutes: number[];
    months: number[];
    wdays: number[];
    expiresAt: number;
  };
}

export interface CreateCronJobInput {
  title: string;
  url: string;
  enabled?: boolean;
  schedule: {
    timezone: string;
    hours: number[];
    mdays: number[];
    minutes: number[];
    months: number[];
    wdays: number[];
  };
  requestMethod?: number;
  extendedData?: {
    headers?: Record<string, string>;
    body?: string;
  };
  notification?: {
    onFailure: boolean;
    onSuccess: boolean;
    onDisable: boolean;
  };
}

const REQUEST_METHODS = ["GET", "POST", "OPTIONS", "HEAD", "PUT", "DELETE", "TRACE", "CONNECT", "PATCH"];

export function useRequestMethodLabel(method: number): string {
  return REQUEST_METHODS[method] || "GET";
}

export function useCronJobs() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cron-manager", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: undefined,
      });

      // supabase.functions.invoke uses POST, so we need a workaround
      // Instead, use fetch directly with the correct method
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cron-manager?workspace_id=${currentWorkspace.id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch cron jobs");
      }

      const result = await response.json();
      setJobs(result.jobs || []);
    } catch (err) {
      console.error("Failed to fetch cron jobs:", err);
      toast({ title: "Erreur", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, toast]);

  const createJob = useCallback(async (job: CreateCronJobInput) => {
    if (!currentWorkspace?.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cron-manager`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspace_id: currentWorkspace.id,
            job: {
              ...job,
              enabled: job.enabled ?? true,
              saveResponses: true,
              schedule: { ...job.schedule, expiresAt: 0 },
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create cron job");
      }

      toast({ title: "Cron job créé", description: `"${job.title}" a été planifié avec succès.` });
      await fetchJobs();
    } catch (err) {
      console.error("Failed to create cron job:", err);
      toast({ title: "Erreur", description: (err as Error).message, variant: "destructive" });
    }
  }, [currentWorkspace?.id, fetchJobs, toast]);

  const toggleJob = useCallback(async (jobId: number, enabled: boolean) => {
    if (!currentWorkspace?.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cron-manager/${jobId}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspace_id: currentWorkspace.id,
            job: { enabled },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to toggle cron job");
      }

      setJobs((prev) => prev.map((j) => j.jobId === jobId ? { ...j, enabled } : j));
      toast({ title: enabled ? "Cron job activé" : "Cron job désactivé" });
    } catch (err) {
      console.error("Failed to toggle cron job:", err);
      toast({ title: "Erreur", description: (err as Error).message, variant: "destructive" });
    }
  }, [currentWorkspace?.id, toast]);

  const deleteJob = useCallback(async (jobId: number) => {
    if (!currentWorkspace?.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cron-manager/${jobId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workspace_id: currentWorkspace.id }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete cron job");
      }

      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
      toast({ title: "Cron job supprimé" });
    } catch (err) {
      console.error("Failed to delete cron job:", err);
      toast({ title: "Erreur", description: (err as Error).message, variant: "destructive" });
    }
  }, [currentWorkspace?.id, toast]);

  return { jobs, loading, fetchJobs, createJob, toggleJob, deleteJob };
}
