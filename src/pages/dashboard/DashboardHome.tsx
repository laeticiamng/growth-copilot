import { useCallback, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useApprovals } from "@/hooks/useApprovals";
import { useServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { captureException, addBreadcrumb } from "@/lib/sentry";
import { Bot, Calendar, FileText, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Core cockpit widgets - only the essentials
import {
  PriorityActionsEnhanced,
  QuickLaunchers,
  ApprovalsWidget,
  WelcomeCard,
  DepartmentSemaphores,
} from "@/components/cockpit";

// Lazy-loaded: daily briefing only
const DailyBriefing = lazy(() => import("@/components/cockpit/DailyBriefing").then(m => ({ default: m.DailyBriefing })));

function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-lg" />;
}

const CGO_PERSONA = {
  name: "Sophie Marchand",
  avatarFr: "👩‍💼",
};

export default function DashboardHome() {
  const { t } = useTranslation();
  const { currentWorkspace, loading: wsLoading } = useWorkspace();
  const { currentSite, loading: sitesLoading } = useSites();
  const { pendingApprovals, approveAction, rejectAction } = useApprovals();
  const { servicesLoading, hasService } = useServices();

  const getCGORole = () => t("cockpit.welcomeCgoRole");

  // Quick launchers - just 2 clear actions
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
      const { error } = await supabase.functions.invoke("run-executor", {
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
        <Link to="/onboarding">
          <Button size="lg">
            <Rocket className="w-5 h-5 mr-2" />
            {t("cockpit.start")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Welcome - clean and simple */}
      <WelcomeCard
        agentName={CGO_PERSONA.name}
        agentRole={getCGORole()}
        agentAvatar={CGO_PERSONA.avatarFr}
        siteName={currentSite?.name || currentWorkspace.name}
        pendingCount={pendingApprovals.length}
        onExport={() => {}}
      />

      {/* 2. What needs your attention right now */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <PriorityActionsEnhanced maxItems={5} />
        <ApprovalsWidget
          approvals={approvalsForWidget}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      {/* 3. Department health at a glance */}
      <DepartmentSemaphores />

      {/* 4. Quick actions */}
      <QuickLaunchers launchers={quickLaunchers} onLaunch={handleLaunchRun} />

      {/* 5. Daily briefing from your CGO */}
      <Suspense fallback={<ChartSkeleton />}>
        <DailyBriefing />
      </Suspense>
    </div>
  );
}
