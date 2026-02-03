import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  ExternalLink,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action?: { label: string; link: string };
  timestamp: Date;
  read: boolean;
}

export function SmartAlertsPanel() {
  const { currentWorkspace } = useWorkspace();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const fetchAlerts = async () => {
      setLoading(true);
      const newAlerts: Alert[] = [];

      try {
        // Fetch pending approvals
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
            message: `L'agent ${a.agent_type} propose une action.`,
            action: { label: 'Valider', link: '/dashboard/approvals' },
            timestamp: new Date(a.created_at || Date.now()),
            read: false,
          });
        });

        // Fetch recent runs
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
            title: `Terminé: ${r.run_type.replace(/_/g, ' ')}`,
            message: 'Analyse disponible.',
            timestamp: new Date(r.completed_at || Date.now()),
            read: true,
          });
        });

        newAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setAlerts(newAlerts);
      } catch (error) {
        console.error('[Alerts] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [currentWorkspace?.id]);

  const dismissAlert = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Alertes
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
            <p>Aucune alerte</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px]">
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={cn("p-3 rounded-lg bg-muted/30 border-l-4", alert.type === 'critical' ? 'border-l-destructive' : alert.type === 'success' ? 'border-l-primary' : 'border-l-amber-500')}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{alert.title}</span>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: fr })}
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
