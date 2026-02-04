import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Wifi,
  Database,
  Zap,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface ChannelStatus {
  name: string;
  status: "connected" | "connecting" | "disconnected" | "error";
  lastEvent?: Date;
  eventCount: number;
}

export function RealtimeStatus() {
  const { currentWorkspace } = useWorkspace();
  const [channels, setChannels] = useState<ChannelStatus[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    // Initialize channel monitoring
    const approvalsChannel = supabase
      .channel(`approvals-${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approval_queue',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          setChannels(prev => prev.map(ch => 
            ch.name === 'Approbations' 
              ? { ...ch, lastEvent: new Date(), eventCount: ch.eventCount + 1 }
              : ch
          ));
        }
      )
      .subscribe((status) => {
        setChannels(prev => {
          const existing = prev.find(ch => ch.name === 'Approbations');
          if (existing) {
            return prev.map(ch => 
              ch.name === 'Approbations' 
                ? { ...ch, status: status === 'SUBSCRIBED' ? 'connected' : status === 'CHANNEL_ERROR' ? 'error' : 'connecting' }
                : ch
            );
          }
          return [...prev, {
            name: 'Approbations',
            status: status === 'SUBSCRIBED' ? 'connected' : status === 'CHANNEL_ERROR' ? 'error' : 'connecting',
            eventCount: 0,
          }];
        });
      });

    const agentRunsChannel = supabase
      .channel(`agent-runs-${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_runs',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          setChannels(prev => prev.map(ch => 
            ch.name === 'Exécutions agents' 
              ? { ...ch, lastEvent: new Date(), eventCount: ch.eventCount + 1 }
              : ch
          ));
        }
      )
      .subscribe((status) => {
        setChannels(prev => {
          const existing = prev.find(ch => ch.name === 'Exécutions agents');
          if (existing) {
            return prev.map(ch => 
              ch.name === 'Exécutions agents' 
                ? { ...ch, status: status === 'SUBSCRIBED' ? 'connected' : status === 'CHANNEL_ERROR' ? 'error' : 'connecting' }
                : ch
            );
          }
          return [...prev, {
            name: 'Exécutions agents',
            status: status === 'SUBSCRIBED' ? 'connected' : status === 'CHANNEL_ERROR' ? 'error' : 'connecting',
            eventCount: 0,
          }];
        });
      });

    return () => {
      supabase.removeChannel(approvalsChannel);
      supabase.removeChannel(agentRunsChannel);
    };
  }, [currentWorkspace?.id]);

  const handleReconnect = async () => {
    setIsConnecting(true);
    // Force reconnection by removing and re-adding channels
    const allChannels = supabase.getChannels();
    for (const channel of allChannels) {
      await supabase.removeChannel(channel);
    }
    setChannels([]);
    // Channels will be re-created on next effect run
    setTimeout(() => {
      setIsConnecting(false);
    }, 2000);
  };

  const getStatusIcon = (status: ChannelStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Activity className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Wifi className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const connectedCount = channels.filter(ch => ch.status === 'connected').length;
  const totalChannels = channels.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            Connexions temps réel
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={connectedCount === totalChannels ? "success" : "secondary"}>
              {connectedCount}/{totalChannels}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={handleReconnect}
              disabled={isConnecting}
            >
              <RefreshCw className={`w-3 h-3 ${isConnecting ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {channels.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune connexion active
          </p>
        ) : (
          channels.map((channel) => (
            <div 
              key={channel.name}
              className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(channel.status)}
                <span className="text-sm">{channel.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {channel.eventCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {channel.eventCount}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
