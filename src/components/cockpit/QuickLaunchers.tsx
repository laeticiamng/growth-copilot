import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Play,
  Calendar,
  Search,
  TrendingUp,
  Shield,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface QuickLauncher {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  runType: string;
  service?: string;
  disabled?: boolean;
}

interface QuickLaunchersProps {
  launchers?: QuickLauncher[];
  loading?: boolean;
  onLaunch: (runType: string) => Promise<void>;
}

const defaultLaunchers: QuickLauncher[] = [
  {
    id: "weekly-plan",
    labelKey: "cockpit.weeklyPlanLabel",
    descriptionKey: "cockpit.weeklyPlanDescription",
    icon: Calendar,
    runType: "MARKETING_WEEK_PLAN",
    service: "marketing",
  },
  {
    id: "seo-audit",
    labelKey: "cockpit.seoAuditLabel",
    descriptionKey: "cockpit.seoAuditDescription",
    icon: Search,
    runType: "SEO_AUDIT_REPORT",
    service: "marketing",
  },
  {
    id: "funnel-diagnostic",
    labelKey: "cockpit.funnelDiagLabel",
    descriptionKey: "cockpit.funnelDiagDescription",
    icon: TrendingUp,
    runType: "FUNNEL_DIAGNOSTIC",
    service: "data",
  },
  {
    id: "security-check",
    labelKey: "cockpit.securityCheckLabel",
    descriptionKey: "cockpit.securityCheckDescription",
    icon: Shield,
    runType: "ACCESS_REVIEW",
    service: "security",
  },
];

export function QuickLaunchers({
  launchers = defaultLaunchers,
  loading,
  onLaunch,
}: QuickLaunchersProps) {
  const { t } = useTranslation();
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const handleLaunch = async (launcher: QuickLauncher) => {
    if (launcher.disabled) {
      toast.error(t("cockpit.serviceNotEnabled"));
      return;
    }

    setLaunchingId(launcher.id);
    try {
      await onLaunch(launcher.runType);
      toast.success(t("cockpit.launchedSuccess", { label: t(launcher.labelKey) }));
    } catch (error) {
      toast.error(t("cockpit.launchError"));
    } finally {
      setLaunchingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("cockpit.launchAction")}</CardTitle>
          <Badge variant="outline" className="text-xs">
            <Play className="w-3 h-3 mr-1" />
            {t("cockpit.quickStart")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {launchers.map((launcher) => {
            const Icon = launcher.icon;
            const isLaunching = launchingId === launcher.id;
            return (
              <button
                key={launcher.id}
                onClick={() => handleLaunch(launcher)}
                disabled={isLaunching || launcher.disabled}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                  launcher.disabled
                    ? "opacity-50 cursor-not-allowed bg-muted/30"
                    : "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                )}
              >
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  {isLaunching ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{t(launcher.labelKey)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {t(launcher.descriptionKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
