import { useCallback, lazy, Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import { AGENTS_CATALOG, DEPARTMENTS_CATALOG } from "@/data/agents-catalog";
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

// Eagerly loaded cockpit widgets (lightweight)
import {
  ExecutiveSummary,
  PriorityActionsEnhanced,
  QuickLaunchers,
  ApprovalsWidget,
  WelcomeCard,
  DepartmentSemaphores,
} from "@/components/cockpit";
import { MoMComparison } from "@/components/dashboard/MoMComparison";
import { CockpitPDFExport } from "@/components/dashboard/CockpitPDFExport";

// Lazy-loaded heavy components (recharts, @elevenlabs, date-fns locales)
const AgentPerformanceChart = lazy(() => import("@/components/agents/AgentPerformanceChart").then(m => ({ default: m.AgentPerformanceChart })));
const VoiceAssistant = lazy(() => import("@/components/ai/VoiceAssistant").then(m => ({ default: m.VoiceAssistant })));
const SmartAlertsPanel = lazy(() => import("@/components/notifications/SmartAlertsPanel").then(m => ({ default: m.SmartAlertsPanel })));
const RunsHistory = lazy(() => import("@/components/cockpit/RunsHistory").then(m => ({ default: m.RunsHistory })));
const BusinessHealthScore = lazy(() => import("@/components/cockpit/BusinessHealthScore").then(m => ({ default: m.BusinessHealthScore })));
const ROITrackerWidget = lazy(() => import("@/components/cockpit/ROITrackerWidget").then(m => ({ default: m.ROITrackerWidget })));
const RealtimeStatus = lazy(() => import("@/components/cockpit/RealtimeStatus").then(m => ({ default: m.RealtimeStatus })));
const DailyBriefing = lazy(() => import("@/components/cockpit/DailyBriefing").then(m => ({ default: m.DailyBriefing })));

function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-lg" />;
}

// CGO Agent Persona - translated in component
const CGO_PERSONA = {
  name: "Sophie Marchand",
  avatarFr: "👩‍💼",
  avatarEn: "👩‍💼",
};

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  const { currentWorkspace, loading: wsLoading } = useWorkspace();
  const { currentSite, loading: sitesLoading } = useSites();
  const { pendingApprovals, approveAction, rejectAction } = useApprovals();
  const { enabledServices, servicesLoading, hasService } = useServices();

  // Real-time subscriptions for instant dashboard updates
  useDashboardRealtime();

  // Get translated persona role
  const getCGORole = () => t("cockpit.welcomeCgoRole");

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
      labelKey: "cockpit.weeklyPlan",
      descriptionKey: "cockpit.weeklyPlanDesc",
      icon: Calendar,
      runType: "MARKETING_WEEK_PLAN",
      service: "marketing",
      disabled: !hasService("marketing"),
    },
    {
      id: "exec-brief",
      labelKey: "cockpit.execBrief",
      descriptionKey: "cockpit.execBriefDesc",
      icon: FileText,
      runType: "DAILY_EXECUTIVE_BRIEF",
      service: "core-os",
      disabled: false,
    },
  ];

  // Handle run launch
  const handleLaunchRun = useCallback(async (runType: string) => {
    if (!currentWorkspace?.id) {
      toast.error(t("cockpit.noWorkspace"));
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
      toast.success(t("cockpit.runSuccess"));
    } catch (error) {
      console.error("Run launch error:", error);
      toast.error(t("cockpit.runError"));
    }
  }, [currentWorkspace?.id, currentSite?.id, t]);

  // Handle approvals
  const handleApprove = async (id: string) => {
    await approveAction(id);
    toast.success(t("cockpit.approved"));
  };

  const handleReject = async (id: string) => {
    await rejectAction(id, "Rejected by user");
    toast.success(t("cockpit.rejected"));
  };

  // Transform pending approvals for widget
  const approvalsForWidget = pendingApprovals.map((a) => ({
    id: a.id,
    title: a.action_type.replace(/_/g, " "),
    description: t("cockpit.welcomeByAgent", { agent: a.agent_type }),
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
        <h2 className="text-2xl font-bold mb-2">{t("cockpit.welcome")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("cockpit.createFirst")}
        </p>
        <Link to="/dashboard/setup">
          <Button size="lg">
            <Rocket className="w-5 h-5 mr-2" />
            {t("cockpit.start")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card + PDF Export */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <WelcomeCard
            agentName={CGO_PERSONA.name}
            agentRole={getCGORole()}
            agentAvatar={CGO_PERSONA.avatarFr}
            siteName={currentSite?.name || currentWorkspace.name}
            pendingCount={pendingApprovals.length}
            onExport={() => {}}
          />
        </div>
        <CockpitPDFExport workspaceName={currentWorkspace.name} />
      </div>

      {/* Daily Briefing from Sophie Marchand (CGO) */}
      <Suspense fallback={<ChartSkeleton />}>
        <DailyBriefing />
      </Suspense>

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
        <Suspense fallback={<ChartSkeleton />}>
          <BusinessHealthScore className="h-full" />
        </Suspense>

        {/* ROI Tracker Widget */}
        <Suspense fallback={<ChartSkeleton />}>
          <ROITrackerWidget className="h-full" />
        </Suspense>
      </div>

      {/* Approvals Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ApprovalsWidget
          approvals={approvalsForWidget}
          onApprove={handleApprove}
          onReject={handleReject}
        />
        
        {/* Agent Performance Chart */}
        <Suspense fallback={<ChartSkeleton />}>
          <AgentPerformanceChart />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Launchers */}
        <QuickLaunchers launchers={quickLaunchers} onLaunch={handleLaunchRun} />

        {/* Runs History */}
        <Suspense fallback={<ChartSkeleton />}>
          <RunsHistory maxItems={4} />
        </Suspense>
      </div>

      {/* Voice Assistant & Real-Time Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Voice-First AI */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              🎙️ {t("cockpit.voiceAssistant")}
            </CardTitle>
            <CardDescription>
              {t("cockpit.voiceAssistantDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <VoiceAssistant />
            </Suspense>
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        <Suspense fallback={<ChartSkeleton />}>
          <SmartAlertsPanel />
        </Suspense>
      </div>

    {/* Realtime Status - Connections Monitor */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <Suspense fallback={<ChartSkeleton />}>
        <RealtimeStatus />
      </Suspense>
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            🤖 {t("cockpit.aiTeamAvailable")}
            <Badge variant="secondary" className="ml-auto">{AGENTS_CATALOG.length} {t("cockpit.agents")}</Badge>
          </CardTitle>
          <CardDescription>
            {t("cockpit.welcomeAiTeamDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {DEPARTMENTS_CATALOG.length} {t("cockpit.departments")} • {t("cockpit.directionMarketing")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("cockpit.readyToExecute")}
              </p>
            </div>
            <Link to="/dashboard/agents">
              <Button variant="outline" size="sm">
                {t("cockpit.viewTeam")}
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
            label: t("dashboard.home.organicClicks"), 
            currentValue: kpiData?.organicClicks ?? null, 
            previousValue: previousKpiData?.organicClicks ?? null,
            format: "number" 
          },
          { 
            label: t("dashboard.home.conversions"), 
            currentValue: kpiData?.conversions ?? null, 
            previousValue: previousKpiData?.conversions ?? null,
            format: "number" 
          },
          { 
            label: t("dashboard.home.avgPosition"), 
            currentValue: kpiData?.avgPosition ?? null, 
            previousValue: previousKpiData?.avgPosition ?? null,
            format: "number" 
          },
        ]}
      />
    </div>
  );
}
