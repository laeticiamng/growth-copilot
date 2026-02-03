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
  Eye,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useExecutiveRuns, RUN_TYPE_LABELS, RUN_TYPE_ICONS, RunStatus } from "@/hooks/useExecutiveRuns";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EvidenceBundleViewer } from "@/components/evidence";

interface RunsHistoryProps {
  maxItems?: number;
  showHeader?: boolean;
}

const STATUS_CONFIG: Record<RunStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-500", label: "Terminé" },
  failed: { icon: XCircle, color: "text-destructive", label: "Échec" },
  running: { icon: Loader2, color: "text-primary", label: "En cours" },
  queued: { icon: Clock, color: "text-muted-foreground", label: "En attente" },
};

export function RunsHistory({ maxItems = 5, showHeader = true }: RunsHistoryProps) {
  const { runs, loading, refetch } = useExecutiveRuns();
  const [selectedRun, setSelectedRun] = useState<typeof runs[0] | null>(null);

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
              <CardTitle className="text-lg">Exécutions récentes</CardTitle>
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
              <p className="text-sm">Aucune exécution récente</p>
              <p className="text-xs mt-1">Lancez une action depuis le cockpit</p>
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
                          locale: fr,
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

      {/* Run Details Modal */}
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
                locale: fr,
              })}
              {selectedRun?.duration_ms && ` • ${(selectedRun.duration_ms / 1000).toFixed(1)}s`}
            </DialogDescription>
          </DialogHeader>

          {selectedRun && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Résumé</TabsTrigger>
                <TabsTrigger value="evidence" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Preuves
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                {/* Status */}
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

                {/* Executive Summary */}
                {selectedRun.executive_summary && (
                  <div>
                    <p className="text-sm font-medium mb-1">Résumé</p>
                    <p className="text-sm text-muted-foreground">{selectedRun.executive_summary}</p>
                  </div>
                )}

                {/* Outputs */}
                {selectedRun.outputs && (
                  <div>
                    <p className="text-sm font-medium mb-2">Résultats</p>
                    <ScrollArea className="h-48 rounded-lg border bg-muted/30 p-3">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(selectedRun.outputs, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {/* Error */}
                {selectedRun.error_message && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive mb-1">Erreur</p>
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
