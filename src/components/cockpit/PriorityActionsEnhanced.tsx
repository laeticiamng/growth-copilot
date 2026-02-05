/**
 * Enhanced Priority Actions Component
 * Shows top 5 actions ranked by ICE score with approve/reject buttons
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Loader2,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useApprovals } from "@/hooks/useApprovals";
import { toast } from "sonner";

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  iceScore: number;
  effort: string;
  link: string;
  actionLabel: string;
  service?: string;
  isApprovalItem?: boolean;
  agentType?: string;
}

interface PriorityActionsEnhancedProps {
  maxItems?: number;
  className?: string;
}

const priorityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
  high: {
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  medium: {
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  low: {
    icon: Target,
    color: "text-muted-foreground",
    bg: "bg-secondary",
    border: "border-border",
  },
};

export function PriorityActionsEnhanced({ maxItems = 5, className }: PriorityActionsEnhancedProps) {
  const { currentWorkspace } = useWorkspace();
  const { pendingApprovals, approveAction, rejectAction } = useApprovals();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<PriorityAction[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriorityActions = async () => {
      if (!currentWorkspace?.id) {
        setLoading(false);
        return;
      }

      try {
        // Convert pending approvals to priority actions
        const approvalActions: PriorityAction[] = pendingApprovals.map(a => {
          const riskLevel = a.risk_level as string;
          const iceScore = riskLevel === 'high' ? 90 : riskLevel === 'medium' ? 70 : 50;
          
          return {
            id: a.id,
            title: a.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Action proposée par ${a.agent_type}`,
            priority: riskLevel === 'high' ? 'critical' : riskLevel === 'medium' ? 'high' : 'medium',
            iceScore,
            effort: 'Immédiat',
            link: `/dashboard/approvals?id=${a.id}`,
            actionLabel: 'Voir',
            service: a.agent_type,
            isApprovalItem: true,
            agentType: a.agent_type,
          } as PriorityAction;
        });

        // Fetch agent recommendations from recent runs
        const { data: recentRuns } = await supabase
          .from('agent_runs')
          .select('outputs, agent_type, created_at')
          .eq('workspace_id', currentWorkspace.id)
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        const recommendationActions: PriorityAction[] = [];
        
        if (recentRuns) {
          for (const run of recentRuns) {
            const outputs = run.outputs as Record<string, unknown> | null;
            if (outputs?.actions && Array.isArray(outputs.actions)) {
              for (const action of outputs.actions) {
                const a = action as Record<string, unknown>;
                if (a.title && a.link) {
                  recommendationActions.push({
                    id: `rec-${run.agent_type}-${Date.now()}`,
                    title: String(a.title),
                    description: String(a.description || ''),
                    priority: (a.priority as PriorityAction['priority']) || 'medium',
                    iceScore: Number(a.ice_score) || 60,
                    effort: String(a.effort || '10 min'),
                    link: String(a.link),
                    actionLabel: String(a.action_label || 'Voir'),
                    service: run.agent_type,
                    isApprovalItem: false,
                  });
                }
              }
            }
          }
        }

        // Combine and sort by ICE score
        const allActions = [...approvalActions, ...recommendationActions]
          .sort((a, b) => b.iceScore - a.iceScore)
          .slice(0, maxItems);

        setActions(allActions);
      } catch (err) {
        console.error("Error fetching priority actions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityActions();
  }, [currentWorkspace?.id, pendingApprovals, maxItems]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const { error } = await approveAction(id);
    setProcessingId(null);
    
    if (error) {
      toast.error("Erreur lors de l'approbation");
    } else {
      toast.success("Action approuvée");
      setActions(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Raison du refus :");
    if (!reason) return;
    
    setProcessingId(id);
    const { error } = await rejectAction(id, reason);
    setProcessingId(null);
    
    if (error) {
      toast.error("Erreur lors du refus");
    } else {
      toast.success("Action refusée");
      setActions(prev => prev.filter(a => a.id !== id));
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="feature" className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Actions Prioritaires</CardTitle>
          <Badge variant="gradient">Top {actions.length}</Badge>
        </div>
        <CardDescription className="text-xs">
          Classées par score ICE (Impact × Confiance × Facilité)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {actions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-primary/50" />
            <p className="text-sm">Aucune action prioritaire</p>
            <p className="text-xs mt-1">Vos agents travaillent en arrière-plan</p>
          </div>
        ) : (
          actions.map((action, index) => {
            const config = priorityConfig[action.priority];
            return (
              <div
                key={action.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-all",
                  config.border,
                  config.bg
                )}
              >
                {/* ICE Score */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      action.priority === "critical"
                        ? "bg-destructive/20 text-destructive"
                        : action.priority === "high"
                        ? "bg-warning/20 text-warning"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {action.iceScore}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase">ICE</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-muted-foreground/50">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {action.effort}
                      </Badge>
                      {action.service && (
                        <Badge variant="secondary" className="text-xs">
                          {action.service}
                        </Badge>
                      )}
                    </div>
                    
                    {action.isApprovalItem ? (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleReject(action.id)}
                          disabled={processingId === action.id}
                        >
                          {processingId === action.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="hero"
                          className="h-7 text-xs"
                          onClick={() => handleApprove(action.id)}
                          disabled={processingId === action.id}
                        >
                          {processingId === action.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approuver
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                        <Link to={action.link}>
                          {action.actionLabel}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
