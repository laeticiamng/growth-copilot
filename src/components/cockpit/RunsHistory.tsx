import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useExecutiveRuns, RUN_TYPE_LABELS, RUN_TYPE_ICONS, RunStatus } from "@/hooks/useExecutiveRuns";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es, de } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EvidenceBundleViewer } from "@/components/evidence";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useTranslation } from "react-i18next";

interface RunsHistoryProps {
  maxItems?: number;
  showHeader?: boolean;
}

const dateFnsLocales: Record<string, Locale> = { fr, en: enUS, es, de };

export function RunsHistory({ maxItems = 5, showHeader = true }: RunsHistoryProps) {
  const { t, i18n } = useTranslation();
  const { runs, loading, refetch } = useExecutiveRuns();
  const { currentWorkspace } = useWorkspace();
  const [selectedRun, setSelectedRun] = useState<typeof runs[0] | null>(null);

  const dateLocale = useMemo(() => dateFnsLocales[i18n.language] || enUS, [i18n.language]);

  const STATUS_CONFIG: Record<RunStatus, { icon: typeof CheckCircle2; color: string; label: string }> = useMemo(() => ({
    completed: { icon: CheckCircle2, color: "text-chart-3", label: t("cockpit.statusCompleted") },
    failed: { icon: XCircle, color: "text-destructive", label: t("cockpit.statusFailed") },
    running: { icon: Loader2, color: "text-primary", label: t("cockpit.statusRunning") },
    queued: { icon: Clock, color: "text-muted-foreground", label: t("cockpit.statusQueued") },
  }), [t]);

  const handleRealtimeUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useRealtimeSubscription(
    `runs-history-${currentWorkspace?.id}`,
    {
      table: 'executive_runs',
      filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
    },
    handleRealtimeUpdate,
    !!currentWorkspace?.id
  );

  const displayedRuns = runs.slice(0, maxItems);

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
             <CardTitle className="text-lg flex items-center gap-2">
               <span className="relative">
                 {t("cockpit.recentRuns")}
                 <span className="absolute -right-2 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
               </span>
             </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        )}
        <CardContent>
          {displayedRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t("cockpit.noRecentRun")}</p>
              <p className="text-xs mt-1">{t("cockpit.launchFromCockpit")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedRuns.map((run) => {
                const status = STATUS_CONFIG[run.status as RunStatus] || STATUS_CONFIG.queued;
                const StatusIcon = status.icon;
                const label = RUN_TYPE_LABELS[run.run_type as keyof typeof RUN_TYPE_LABELS] || run.run_type;
                const emoji = RUN_TYPE_ICONS[run.run_type as keyof typeof RUN_TYPE_ICONS] || "⚙️";

                return (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="text-2xl">{emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(run.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={cn(
                          "w-4 h-4",
                          status.color,
                          run.status === "running" && "animate-spin"
                        )}
                      />
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">
                {selectedRun && (RUN_TYPE_ICONS[selectedRun.run_type as keyof typeof RUN_TYPE_ICONS] || "⚙️")}
              </span>
              {selectedRun && (RUN_TYPE_LABELS[selectedRun.run_type as keyof typeof RUN_TYPE_LABELS] || selectedRun.run_type)}
            </DialogTitle>
            <DialogDescription>
              {selectedRun && formatDistanceToNow(new Date(selectedRun.created_at), {
                addSuffix: true,
                locale: dateLocale,
              })}
              {selectedRun?.duration_ms && ` • ${(selectedRun.duration_ms / 1000).toFixed(1)}s`}
            </DialogDescription>
          </DialogHeader>

          {selectedRun && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">{t("cockpit.summary")}</TabsTrigger>
                <TabsTrigger value="evidence" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {t("cockpit.evidence")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const status = STATUS_CONFIG[selectedRun.status as RunStatus] || STATUS_CONFIG.queued;
                    const StatusIcon = status.icon;
                    return (
                      <Badge
                        variant={selectedRun.status === "completed" ? "success" : selectedRun.status === "failed" ? "destructive" : "secondary"}
                      >
                        <StatusIcon className={cn("w-3 h-3 mr-1", selectedRun.status === "running" && "animate-spin")} />
                        {status.label}
                      </Badge>
                    );
                  })()}
                </div>

                {selectedRun.executive_summary && (
                  <div>
                    <p className="text-sm font-medium mb-1">{t("cockpit.summary")}</p>
                    <p className="text-sm text-muted-foreground">{selectedRun.executive_summary}</p>
                  </div>
                )}

                {selectedRun.outputs && (
                  <div>
                    <p className="text-sm font-medium mb-2">{t("cockpit.results")}</p>
                    <ScrollArea className="h-48 rounded-lg border bg-muted/30 p-3">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(selectedRun.outputs, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {selectedRun.error_message && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive mb-1">{t("cockpit.error")}</p>
                    <p className="text-xs text-destructive/80">{selectedRun.error_message}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="evidence">
                <EvidenceBundleViewer 
                  executiveRunId={selectedRun.id}
                  defaultExpanded={true}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
