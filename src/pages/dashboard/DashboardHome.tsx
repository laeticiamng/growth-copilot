import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useApprovals } from "@/hooks/useApprovals";
import { useServices } from "@/hooks/useServices";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { captureException, addBreadcrumb } from "@/lib/sentry";
import {
  ArrowRight,
  Bot,
  Calendar,
  FileText,
  Rocket,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  ExecutiveSummary,
  PriorityActionsEnhanced,
  QuickLaunchers,
  ApprovalsWidget,
  RunsHistory,
  BusinessHealthScore,
  ROITrackerWidget,
  WelcomeCard,
  RealtimeStatus,
  DailyBriefing,
  DepartmentSemaphores,
} from "@/components/cockpit";
import { AgentPerformanceChart } from "@/components/agents/AgentPerformanceChart";
import { VoiceAssistant } from "@/components/ai/VoiceAssistant";
import { SmartAlertsPanel } from "@/components/notifications/SmartAlertsPanel";
import { MoMComparison } from "@/components/dashboard/MoMComparison";
import { CockpitPDFExport } from "@/components/dashboard/CockpitPDFExport";

// CGO Agent Persona
const CGO_PERSONA = {
  name: "Sophie Marchand",
  role: "Directrice de la Croissance",
  avatar: "👩‍💼",
};

export default function DashboardHome() {
  const { currentWorkspace, loading: wsLoading } = useWorkspace();
  const { currentSite, loading: sitesLoading } = useSites();
  const { pendingApprovals, approveAction, rejectAction } = useApprovals();
  const { enabledServices, servicesLoading, hasService } = useServices();

  // Fetch real KPI data - current period (last 30 days)
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['dashboard-kpis-current', currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return null;
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const { data: kpis } = await supabase
        .from('kpis_daily')
        .select('organic_clicks, organic_impressions, total_conversions, avg_position')
        .eq('site_id', currentSite.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (!kpis || kpis.length === 0) return null;
      
      return {
        organicClicks: kpis.reduce((sum, k) => sum + (k.organic_clicks || 0), 0),
        conversions: kpis.reduce((sum, k) => sum + (k.total_conversions || 0), 0),
        avgPosition: kpis.filter(k => k.avg_position).length > 0
          ? (kpis.reduce((sum, k) => sum + Number(k.avg_position || 0), 0) / kpis.filter(k => k.avg_position).length)
          : null,
        daysTracked: kpis.length,
      };
    },
    enabled: !!currentSite?.id,
  });

  // Fetch previous period KPI data (J-60 to J-30)
  const { data: previousKpiData } = useQuery({
    queryKey: ['dashboard-kpis-previous', currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return null;
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(today.getDate() - 60);
      
      const { data: kpis } = await supabase
        .from('kpis_daily')
        .select('organic_clicks, organic_impressions, total_conversions, avg_position')
        .eq('site_id', currentSite.id)
        .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
        .lt('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (!kpis || kpis.length === 0) return null;
      
      return {
        organicClicks: kpis.reduce((sum, k) => sum + (k.organic_clicks || 0), 0),
        conversions: kpis.reduce((sum, k) => sum + (k.total_conversions || 0), 0),
        avgPosition: kpis.filter(k => k.avg_position).length > 0
          ? (kpis.reduce((sum, k) => sum + Number(k.avg_position || 0), 0) / kpis.filter(k => k.avg_position).length)
          : null,
        daysTracked: kpis.length,
      };
    },
    enabled: !!currentSite?.id,
  });

  // Build service health status
  const serviceHealth = enabledServices.map((service) => ({
    slug: service.slug,
    name: service.name,
    status: "green" as const, // Will be dynamic based on integration status
    message: service.is_core ? "Core" : undefined,
  }));

  // Quick launchers based on enabled services
  const quickLaunchers = [
    {
      id: "weekly-plan",
      label: "Plan hebdomadaire",
      description: "Générer le plan de la semaine",
      icon: Calendar,
      runType: "MARKETING_WEEK_PLAN",
      service: "marketing",
      disabled: !hasService("marketing"),
    },
    {
      id: "exec-brief",
      label: "Brief exécutif",
      description: "Résumé quotidien de la situation",
      icon: FileText,
      runType: "DAILY_EXECUTIVE_BRIEF",
      service: "core-os",
      disabled: false,
    },
  ];

  // Handle run launch
  const handleLaunchRun = useCallback(async (runType: string) => {
    if (!currentWorkspace?.id) {
      toast.error("Aucun workspace sélectionné");
      return;
    }

    // Add breadcrumb for run launch
    addBreadcrumb({
      category: 'agent',
      message: `Launching run: ${runType}`,
      level: 'info',
      data: { runType, workspaceId: currentWorkspace.id, siteId: currentSite?.id },
    });

    try {
      const { data, error } = await supabase.functions.invoke("run-executor", {
        body: {
          run_type: runType,
          workspace_id: currentWorkspace.id,
          site_id: currentSite?.id,
        },
      });

      if (error) {
        // Capture edge function errors to Sentry
        captureException(error, {
          action: 'launchRun',
          runType,
          workspaceId: currentWorkspace.id,
          siteId: currentSite?.id,
        });
        throw error;
      }
      toast.success("Exécution lancée avec succès");
    } catch (error) {
      console.error("Run launch error:", error);
      toast.error("Erreur lors du lancement. Réessayez plus tard.");
    }
  }, [currentWorkspace?.id, currentSite?.id]);

  // Handle approvals
  const handleApprove = async (id: string) => {
    await approveAction(id);
    toast.success("Action approuvée");
  };

  const handleReject = async (id: string) => {
    await rejectAction(id, "Refusé par l'utilisateur");
    toast.success("Action refusée");
  };

  // Transform pending approvals for widget
  const approvalsForWidget = pendingApprovals.map((a) => ({
    id: a.id,
    title: a.action_type.replace(/_/g, " "),
    description: `Par ${a.agent_type}`,
    actionType: a.action_type,
    riskLevel: a.risk_level as "low" | "medium" | "high",
    createdAt: a.created_at || "",
  }));

  const isLoading = wsLoading || sitesLoading || servicesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Bienvenue sur Growth OS</h2>
        <p className="text-muted-foreground mb-6">
          Créez votre premier espace de travail pour commencer.
        </p>
        <Link to="/onboarding">
          <Button size="lg">
            <Rocket className="w-5 h-5 mr-2" />
            Démarrer
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card - Apple-like */}
      <WelcomeCard
        agentName={CGO_PERSONA.name}
        agentRole={CGO_PERSONA.role}
        agentAvatar={CGO_PERSONA.avatar}
        siteName={currentSite?.name || currentWorkspace.name}
        pendingCount={pendingApprovals.length}
        onExport={() => {}}
      />

      {/* Daily Briefing from Sophie Marchand (CGO) */}
      <DailyBriefing />

      {/* Department Semaphores - Health Overview */}
      <DepartmentSemaphores />

      {/* Service Health Summary */}
      {serviceHealth.length > 0 && (
        <ExecutiveSummary
          siteName={currentSite?.name || currentWorkspace.name}
          services={serviceHealth}
          loading={servicesLoading}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        {/* Priority Actions - Enhanced with Approve/Reject */}
        <PriorityActionsEnhanced maxItems={5} />

        {/* Business Health Score */}
        <BusinessHealthScore className="h-full" />

        {/* ROI Tracker Widget */}
        <ROITrackerWidget className="h-full" />
      </div>

      {/* Approvals Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ApprovalsWidget
          approvals={approvalsForWidget}
          onApprove={handleApprove}
          onReject={handleReject}
        />
        
        {/* Agent Performance Chart */}
        <AgentPerformanceChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Launchers */}
        <QuickLaunchers launchers={quickLaunchers} onLaunch={handleLaunchRun} />

        {/* Runs History */}
        <RunsHistory maxItems={4} />
      </div>

      {/* Voice Assistant & Real-Time Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Voice-First AI */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              🎙️ Assistant Vocal IA
            </CardTitle>
            <CardDescription>
              Pilotez votre entreprise par la voix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceAssistant />
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        <SmartAlertsPanel />
      </div>

    {/* Realtime Status - Connections Monitor */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <RealtimeStatus />
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            🤖 Agents IA disponibles
            <Badge variant="secondary" className="ml-auto">39 agents</Badge>
          </CardTitle>
          <CardDescription>
            Votre équipe d'agents spécialisés travaille 24h/24
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                11 départements • Direction, Marketing, Sales, Finance, Sécurité, Product, Engineering, Data, Support, Governance, RH
              </p>
              <p className="text-xs text-muted-foreground">
                Prêts à exécuter vos demandes en toute conformité
              </p>
            </div>
            <Link to="/dashboard/agents">
              <Button variant="outline" size="sm">
                Voir l'équipe
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>

      {/* MoM Comparison - KPI Trends with real data */}
      <MoMComparison 
        hasData={!!kpiData}
        kpis={[
          { 
            label: "Clics organiques", 
            currentValue: kpiData?.organicClicks ?? null, 
            previousValue: previousKpiData?.organicClicks ?? null,
            format: "number" 
          },
          { 
            label: "Conversions", 
            currentValue: kpiData?.conversions ?? null, 
            previousValue: previousKpiData?.conversions ?? null,
            format: "number" 
          },
          { 
            label: "Position moyenne", 
            currentValue: kpiData?.avgPosition ?? null, 
            previousValue: previousKpiData?.avgPosition ?? null,
            format: "number" 
          },
        ]}
      />
    </div>
  );
}
