import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import i18next from "i18next";

interface AutopilotSettings {
  id: string;
  workspace_id: string;
  site_id: string | null;
  enabled: boolean;
  allowed_actions: string[];
  max_actions_per_week: number;
  max_daily_budget: number;
  require_approval_above_risk: 'low' | 'medium' | 'high';
}

const DEFAULT_SETTINGS: Omit<AutopilotSettings, 'id' | 'workspace_id'> = {
  site_id: null,
  enabled: false,
  allowed_actions: ['seo_fix', 'content_update', 'meta_update'],
  max_actions_per_week: 20,
  max_daily_budget: 50,
  require_approval_above_risk: 'medium',
};

export function useAutopilotSettings(siteId?: string) {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const queryKey = ['autopilot-settings', currentWorkspace?.id, siteId];

  const { data: settings, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;

      let query = supabase
        .from('autopilot_settings')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (siteId) {
        query = query.eq('site_id', siteId);
      } else {
        query = query.is('site_id', null);
      }

      const { data, error } = await query.maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data as AutopilotSettings | null;
    },
    enabled: !!currentWorkspace?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<AutopilotSettings, 'id' | 'workspace_id'>>) => {
      if (!currentWorkspace?.id) throw new Error('No workspace');

      const upsertData = {
        workspace_id: currentWorkspace.id,
        site_id: siteId || null,
        ...DEFAULT_SETTINGS,
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Remove id if creating new
      const { id, ...dataWithoutId } = upsertData as AutopilotSettings;

      const { data, error } = await supabase
        .from('autopilot_settings')
        .upsert(dataWithoutId, { 
          onConflict: 'workspace_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(i18next.t("hooks.autopilot.settingsUpdated"));
    },
    onError: (error) => {
      console.error('Autopilot settings update error:', error);
      toast.error(i18next.t("hooks.autopilot.updateError"));
    },
  });

  const toggleEnabled = useCallback((enabled: boolean) => {
    updateMutation.mutate({ enabled });
  }, [updateMutation]);

  const updateAllowedActions = useCallback((actions: string[]) => {
    updateMutation.mutate({ allowed_actions: actions });
  }, [updateMutation]);

  const updateRiskThreshold = useCallback((level: 'low' | 'medium' | 'high') => {
    updateMutation.mutate({ require_approval_above_risk: level });
  }, [updateMutation]);

  const updateLimits = useCallback((limits: { max_actions_per_week?: number; max_daily_budget?: number }) => {
    updateMutation.mutate(limits);
  }, [updateMutation]);

  // Available actions that can be automated
  const availableActions = [
    { id: 'seo_fix', label: i18next.t("hooks.autopilot.seoFixes"), category: 'seo' },
    { id: 'meta_update', label: i18next.t("hooks.autopilot.metaUpdates"), category: 'seo' },
    { id: 'content_update', label: i18next.t("hooks.autopilot.contentOptimization"), category: 'content' },
    { id: 'image_optimization', label: i18next.t("hooks.autopilot.imageOptimization"), category: 'content' },
    { id: 'ad_bid_adjustment', label: i18next.t("hooks.autopilot.adBidAdjustment"), category: 'ads' },
    { id: 'ad_pause_underperforming', label: i18next.t("hooks.autopilot.pauseUnderperforming"), category: 'ads' },
    { id: 'social_scheduling', label: i18next.t("hooks.autopilot.socialScheduling"), category: 'social' },
    { id: 'email_automation', label: i18next.t("hooks.autopilot.emailAutomation"), category: 'lifecycle' },
  ];

  return {
    settings: settings || { ...DEFAULT_SETTINGS, workspace_id: currentWorkspace?.id || '' } as AutopilotSettings,
    loading: isLoading,
    error,
    isUpdating: updateMutation.isPending,
    toggleEnabled,
    updateAllowedActions,
    updateRiskThreshold,
    updateLimits,
    updateSettings: updateMutation.mutate,
    availableActions,
  };
}
