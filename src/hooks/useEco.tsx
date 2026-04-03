import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ecoDb = supabase as any;

export interface EcoEmissionSource {
  id: string;
  workspace_id: string;
  site_id: string | null;
  source_name: string;
  category: string;
  scope: 1 | 2 | 3;
  annual_emissions_tco2e: number;
  methodology: string | null;
  updated_at: string;
}

export interface EcoRoadmapAction {
  id: string;
  workspace_id: string;
  site_id: string | null;
  title: string;
  target_year: number;
  status: "planned" | "in_progress" | "completed";
  co2_reduction_tco2e: number | null;
  budget_eur: number | null;
  roi_percent: number | null;
  owner_name: string | null;
  funding_sources: string[] | null;
  notes: string | null;
  created_at: string;
}

export interface EcoSubsidyProject {
  id: string;
  workspace_id: string;
  site_id: string | null;
  program_name: string;
  provider: string;
  amount_eur: number | null;
  deadline: string | null;
  eligibility_score: number | null;
  status: "identified" | "drafting" | "submitted" | "won" | "rejected";
  source_url: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface EcoMonthlyMetric {
  id: string;
  workspace_id: string;
  site_id: string | null;
  month: string;
  energy_kwh: number | null;
  waste_recycled_pct: number | null;
  renewable_energy_pct: number | null;
  carbon_intensity_g_per_eur: number | null;
  created_at: string;
}

export interface EcoReportingSnapshot {
  id: string;
  workspace_id: string;
  site_id: string | null;
  period_label: string;
  csrd_completeness_pct: number;
  climate_score: number;
  social_score: number;
  governance_score: number;
  notes: string | null;
  created_at: string;
}

function useEcoList<T>(table: string, orderBy: string) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();

  return useQuery({
    queryKey: ["eco", table, currentWorkspace?.id, currentSite?.id],
    enabled: !!currentWorkspace?.id,
    queryFn: async () => {
      let query = ecoDb
        .from(table)
        .select("*")
        .eq("workspace_id", currentWorkspace!.id)
        .order(orderBy, { ascending: false });

      if (currentSite?.id) {
        query = query.or(`site_id.eq.${currentSite.id},site_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as T[];
    },
  });
}

export function useEco() {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();

  const emissionsQuery = useEcoList<EcoEmissionSource>("eco_emission_sources", "updated_at");
  const roadmapQuery = useEcoList<EcoRoadmapAction>("eco_roadmap_actions", "target_year");
  const subsidiesQuery = useEcoList<EcoSubsidyProject>("eco_subsidy_projects", "created_at");
  const metricsQuery = useEcoList<EcoMonthlyMetric>("eco_monthly_metrics", "month");
  const reportsQuery = useEcoList<EcoReportingSnapshot>("eco_reporting_snapshots", "created_at");

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["eco"] });
  };

  const basePayload = useMemo(() => ({
    workspace_id: currentWorkspace?.id,
    site_id: currentSite?.id ?? null,
  }), [currentWorkspace?.id, currentSite?.id]);

  const createEmission = useMutation({
    mutationFn: async (payload: Omit<EcoEmissionSource, "id" | "workspace_id" | "site_id" | "updated_at">) => {
      const { data, error } = await ecoDb
        .from("eco_emission_sources")
        .insert({ ...basePayload, ...payload })
        .select("*")
        .single();
      if (error) throw error;
      return data as EcoEmissionSource;
    },
    onSuccess: invalidateAll,
  });

  const createRoadmapAction = useMutation({
    mutationFn: async (payload: Omit<EcoRoadmapAction, "id" | "workspace_id" | "site_id" | "created_at">) => {
      const { data, error } = await ecoDb
        .from("eco_roadmap_actions")
        .insert({ ...basePayload, ...payload })
        .select("*")
        .single();
      if (error) throw error;
      return data as EcoRoadmapAction;
    },
    onSuccess: invalidateAll,
  });

  const createSubsidyProject = useMutation({
    mutationFn: async (payload: Omit<EcoSubsidyProject, "id" | "workspace_id" | "site_id" | "created_at">) => {
      const { data, error } = await ecoDb
        .from("eco_subsidy_projects")
        .insert({ ...basePayload, ...payload })
        .select("*")
        .single();
      if (error) throw error;
      return data as EcoSubsidyProject;
    },
    onSuccess: invalidateAll,
  });

  const createMetric = useMutation({
    mutationFn: async (payload: Omit<EcoMonthlyMetric, "id" | "workspace_id" | "site_id" | "created_at">) => {
      const { data, error } = await ecoDb
        .from("eco_monthly_metrics")
        .insert({ ...basePayload, ...payload })
        .select("*")
        .single();
      if (error) throw error;
      return data as EcoMonthlyMetric;
    },
    onSuccess: invalidateAll,
  });

  const createReport = useMutation({
    mutationFn: async (payload: Omit<EcoReportingSnapshot, "id" | "workspace_id" | "site_id" | "created_at">) => {
      const { data, error } = await ecoDb
        .from("eco_reporting_snapshots")
        .insert({ ...basePayload, ...payload })
        .select("*")
        .single();
      if (error) throw error;
      return data as EcoReportingSnapshot;
    },
    onSuccess: invalidateAll,
  });

  return {
    currentWorkspace,
    currentSite,
    emissions: emissionsQuery.data || [],
    roadmapActions: roadmapQuery.data || [],
    subsidyProjects: subsidiesQuery.data || [],
    monthlyMetrics: metricsQuery.data || [],
    reportingSnapshots: reportsQuery.data || [],
    loading:
      emissionsQuery.isLoading ||
      roadmapQuery.isLoading ||
      subsidiesQuery.isLoading ||
      metricsQuery.isLoading ||
      reportsQuery.isLoading,
    error:
      emissionsQuery.error ||
      roadmapQuery.error ||
      subsidiesQuery.error ||
      metricsQuery.error ||
      reportsQuery.error,
    refetch: invalidateAll,
    createEmission,
    createRoadmapAction,
    createSubsidyProject,
    createMetric,
    createReport,
  };
}
