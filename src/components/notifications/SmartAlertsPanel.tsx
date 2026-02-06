import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Bell, AlertTriangle, CheckCircle, Info, X, ExternalLink, Clock, Sparkles, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es, de, it, pt, nl } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const dateLocaleMap: Record<string, typeof enUS> = { fr, en: enUS, es, de, it, pt, nl };

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'success' | 'info' | 'predictive';
  title: string;
  message: string;
  action?: { label: string; link: string };
  timestamp: Date;
  read: boolean;
  prediction?: { confidence: number; impact: string; recommendation: string };
}

export function SmartAlertsPanel() {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const locale = dateLocaleMap[i18n.language] || enUS;

  const fetchAlerts = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    const newAlerts: Alert[] = [];

    try {
      const { data: approvals } = await supabase
        .from('approval_queue')
        .select('id, action_type, agent_type, risk_level, created_at')
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      approvals?.forEach((a) => {
        newAlerts.push({
          id: `approval-${a.id}`,
          type: a.risk_level === 'high' ? 'critical' : 'warning',
          title: `Action: ${a.action_type.replace(/_/g, ' ')}`,
          message: t("cockpit.alertsAgentProposesAction", { agent: a.agent_type }),
          action: { label: t("cockpit.alertsValidate"), link: '/dashboard/approvals' },
          timestamp: new Date(a.created_at || Date.now()),
          read: false,
        });
      });

      const { data: runs } = await supabase
        .from('executive_runs')
        .select('id, run_type, status, completed_at')
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'done')
        .order('completed_at', { ascending: false })
        .limit(2);

      runs?.forEach((r) => {
        newAlerts.push({
          id: `run-${r.id}`,
          type: 'success',
          title: `${t("cockpit.statusCompleted")}: ${r.run_type.replace(/_/g, ' ')}`,
          message: '',
          timestamp: new Date(r.completed_at || Date.now()),
          read: true,
        });
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentRuns } = await supabase
        .from('agent_runs')
        .select('status, agent_type, created_at')
        .eq('workspace_id', currentWorkspace.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentRuns && recentRuns.length > 0) {
        const failedRuns = recentRuns.filter(r => r.status === 'failed');
        const failRate = (failedRuns.length / recentRuns.length) * 100;
        
        if (failRate > 20) {
          newAlerts.push({
            id: 'predictive-fail-rate',
            type: 'predictive',
            title: t("cockpit.alertsHighFailRate"),
            message: t("cockpit.alertsFailRateMessage", { rate: failRate.toFixed(0) }),
            action: { label: t("cockpit.alertsAnalyze"), link: '/dashboard/agents' },
            timestamp: new Date(),
            read: false,
            prediction: {
              confidence: 85,
              impact: t("cockpit.alertsPerformanceDegradation"),
              recommendation: t("cockpit.alertsCheckAgentConfig"),
            },
          });
        }

        if (recentRuns.length < 5) {
          newAlerts.push({
            id: 'predictive-activity',
            type: 'predictive',
            title: t("cockpit.alertsLowActivity"),
            message: t("cockpit.alertsLowActivityMessage", { count: recentRuns.length }),
            action: { label: t("cockpit.alertsLaunchPlan"), link: '/dashboard' },
            timestamp: new Date(),
            read: false,
            prediction: {
              confidence: 70,
              impact: t("cockpit.alertsMissedOpportunities"),
              recommendation: t("cockpit.alertsEnableAutopilot"),
            },
          });
        }
      }

      newAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setAlerts(newAlerts);
    } catch (error) {
      console.error('[Alerts] Error:', error);
    } finally {
      setLoading(false);
      setIsLive(true);
    }
  }, [currentWorkspace?.id, t]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  useRealtimeSubscription(
    `alerts-approvals-${currentWorkspace?.id}`,
    { table: 'approval_queue', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined },
    () => fetchAlerts(),
    !!currentWorkspace?.id
  );

  useRealtimeSubscription(
    `alerts-runs-${currentWorkspace?.id}`,
    { table: 'executive_runs', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined },
    () => fetchAlerts(),
    !!currentWorkspace?.id
  );

  const dismissAlert = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'predictive': return <Sparkles className="h-4 w-4 text-accent-foreground" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertBorderColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'border-l-destructive';
      case 'warning': return 'border-l-warning';
      case 'success': return 'border-l-primary';
      case 'predictive': return 'border-l-accent';
      default: return 'border-l-muted-foreground';
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="relative">
            <Bell className="h-5 w-5" />
            {isLive && <span className="absolute -right-1 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />}
          </span>
          {t("cockpit.alertsTitle")}
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mb-3 mx-auto text-primary/40" />
            <p>{t("cockpit.alertsNoAlerts")}</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={cn("p-3 rounded-lg bg-muted/30 border-l-4", getAlertBorderColor(alert.type))}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{alert.title}</span>
                        {alert.type === 'predictive' && (
                          <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />IA</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      
                      {alert.prediction && (
                        <div className="mt-2 p-2 rounded bg-accent/20 space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{t("cockpit.alertsConfidence")} {alert.prediction.confidence}%</span>
                            <Progress value={alert.prediction.confidence} className="h-1 flex-1" />
                          </div>
                          <p className="text-xs text-muted-foreground">💡 {alert.prediction.recommendation}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale })}
                        </span>
                        {alert.action && (
                          <Link to={alert.action.link} className="text-xs text-primary hover:underline flex items-center gap-1">
                            {alert.action.label} <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismissAlert(alert.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
