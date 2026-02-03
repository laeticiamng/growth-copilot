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
import {
  ArrowRight,
  Bot,
  Calendar,
  FileText,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  ExecutiveSummary,
  PriorityActions,
  QuickLaunchers,
  ApprovalsWidget,
} from "@/components/cockpit";

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

  // Fetch real KPI data
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['dashboard-kpis', currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return null;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: kpis } = await supabase
        .from('kpis_daily')
        .select('organic_clicks, organic_impressions, total_conversions, avg_position')
        .eq('site_id', currentSite.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (!kpis || kpis.length === 0) return null;
      
      return {
        organicClicks: kpis.reduce((sum, k) => sum + (k.organic_clicks || 0), 0),
        conversions: kpis.reduce((sum, k) => sum + (k.total_conversions || 0), 0),
        avgPosition: (kpis.reduce((sum, k) => sum + Number(k.avg_position || 0), 0) / kpis.length).toFixed(1),
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

  // Build priority actions from recommendations
  const priorityActions = [
    ...(kpiData ? [] : [{
      id: "connect-gsc",
      title: "Autoriser l'accès Google Search Console",
      description: "Connectez vos données de performance pour des insights personnalisés.",
      priority: "high" as const,
      iceScore: 85,
      effort: "5 min",
      link: "/dashboard/integrations",
      actionLabel: "Autoriser",
      service: "Marketing",
    }]),
    {
      id: "seo-audit",
      title: "Lancer l'audit SEO initial",
      description: "Votre site n'a jamais été audité. C'est la première étape pour identifier les opportunités.",
      priority: "critical" as const,
      iceScore: 90,
      effort: "Auto",
      link: "/dashboard/seo",
      actionLabel: "Lancer",
      service: "Marketing",
    },
    {
      id: "brand-kit",
      title: "Configurer le Brand Kit",
      description: "Personnalisez le ton et les guidelines pour un contenu cohérent.",
      priority: "medium" as const,
      iceScore: 65,
      effort: "10 min",
      link: "/dashboard/brand-kit",
      actionLabel: "Configurer",
      service: "Marketing",
    },
  ];

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

    try {
      const { data, error } = await supabase.functions.invoke("run-executor", {
        body: {
          run_type: runType,
          workspace_id: currentWorkspace.id,
          site_id: currentSite?.id,
        },
      });

      if (error) throw error;
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
      {/* CGO Welcome */}
      <Card variant="gradient" className="border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{CGO_PERSONA.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{CGO_PERSONA.name}</span>
                <Badge variant="outline" className="text-xs">
                  <Bot className="w-3 h-3 mr-1" />
                  {CGO_PERSONA.role}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Bonjour ! Voici l'état de{" "}
                <span className="font-medium text-foreground">
                  {currentSite?.name || currentWorkspace.name}
                </span>
                .{" "}
                {pendingApprovals.length > 0 ? (
                  <>
                    Vous avez{" "}
                    <span className="font-medium text-primary">
                      {pendingApprovals.length} décision{pendingApprovals.length > 1 ? "s" : ""}
                    </span>{" "}
                    en attente.
                  </>
                ) : (
                  "Tout est à jour."
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Health Summary */}
      {serviceHealth.length > 0 && (
        <ExecutiveSummary
          siteName={currentSite?.name || currentWorkspace.name}
          services={serviceHealth}
          loading={servicesLoading}
        />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <PriorityActions actions={priorityActions} maxItems={3} />

        {/* Approvals Widget */}
        <ApprovalsWidget
          approvals={approvalsForWidget}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      {/* Quick Launchers */}
      <QuickLaunchers launchers={quickLaunchers} onLaunch={handleLaunchRun} />
    </div>
  );
}
