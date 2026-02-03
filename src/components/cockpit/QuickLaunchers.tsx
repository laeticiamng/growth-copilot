import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Play,
  Calendar,
  Search,
  FileText,
  TrendingUp,
  Users,
  Shield,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuickLauncher {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  runType: string;
  service?: string;
  disabled?: boolean;
}

interface QuickLaunchersProps {
  launchers: QuickLauncher[];
  loading?: boolean;
  onLaunch: (runType: string) => Promise<void>;
}

const defaultLaunchers: QuickLauncher[] = [
  {
    id: "weekly-plan",
    label: "Plan de la semaine",
    description: "Générer le plan marketing hebdomadaire",
    icon: Calendar,
    runType: "MARKETING_WEEK_PLAN",
    service: "marketing",
  },
  {
    id: "seo-audit",
    label: "Audit SEO",
    description: "Lancer un audit technique complet",
    icon: Search,
    runType: "SEO_AUDIT_REPORT",
    service: "marketing",
  },
  {
    id: "funnel-diagnostic",
    label: "Diagnostic funnel",
    description: "Analyser les points de friction",
    icon: TrendingUp,
    runType: "FUNNEL_DIAGNOSTIC",
    service: "data",
  },
  {
    id: "security-check",
    label: "Vérification sécurité",
    description: "Audit des accès et permissions",
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
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const handleLaunch = async (launcher: QuickLauncher) => {
    if (launcher.disabled) {
      toast.error("Ce service n'est pas activé");
      return;
    }

    setLaunchingId(launcher.id);
    try {
      await onLaunch(launcher.runType);
      toast.success(`${launcher.label} lancé avec succès`);
    } catch (error) {
      toast.error("Erreur lors du lancement");
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
          <CardTitle className="text-lg">Lancer une action</CardTitle>
          <Badge variant="outline" className="text-xs">
            <Play className="w-3 h-3 mr-1" />
            Quick Start
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
                  <p className="font-medium text-sm">{launcher.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {launcher.description}
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
