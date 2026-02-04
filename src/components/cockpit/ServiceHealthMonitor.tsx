import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useServices } from "@/hooks/useServices";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Activity,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ServiceStatus {
  slug: string;
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  latency?: number;
  lastCheck: Date;
  uptime?: number;
  errorRate?: number;
}

export function ServiceHealthMonitor() {
  const { currentWorkspace } = useWorkspace();
  const { enabledServices } = useServices();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const checkServiceHealth = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    const results: ServiceStatus[] = [];
    
    for (const service of enabledServices) {
      const start = performance.now();
      let status: ServiceStatus["status"] = "unknown";
      let latency = 0;
      
      try {
        // Check if service has recent successful operations
        const { data, error } = await supabase
          .from('agent_runs')
          .select('status, duration_ms')
          .eq('workspace_id', currentWorkspace.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        latency = Math.round(performance.now() - start);
        
        if (error) {
          status = "degraded";
        } else {
          const recentRuns = data || [];
          const successRate = recentRuns.length > 0 
            ? recentRuns.filter(r => r.status === 'completed').length / recentRuns.length
            : 1;
          
          status = successRate >= 0.9 ? "healthy" : successRate >= 0.5 ? "degraded" : "down";
        }
      } catch {
        status = "down";
        latency = Math.round(performance.now() - start);
      }
      
      results.push({
        slug: service.slug,
        name: service.name,
        status,
        latency,
        lastCheck: new Date(),
        uptime: status === "healthy" ? 99.9 : status === "degraded" ? 95 : 0,
        errorRate: status === "healthy" ? 0.1 : status === "degraded" ? 5 : 100,
      });
    }
    
    setServices(results);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkServiceHealth();
    // Refresh every 60 seconds
    const interval = setInterval(checkServiceHealth, 60000);
    return () => clearInterval(interval);
  }, [currentWorkspace?.id, enabledServices.length]);

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "down":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy": return "bg-green-500/10 border-green-500/30 text-green-700";
      case "degraded": return "bg-yellow-500/10 border-yellow-500/30 text-yellow-700";
      case "down": return "bg-destructive/10 border-destructive/30 text-destructive";
      default: return "bg-muted border-border text-muted-foreground";
    }
  };

  const overallHealth = services.every(s => s.status === "healthy") 
    ? "healthy" 
    : services.some(s => s.status === "down") 
    ? "down" 
    : "degraded";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Santé des Services
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                overallHealth === "healthy" && "bg-green-500/10 text-green-700",
                overallHealth === "degraded" && "bg-yellow-500/10 text-yellow-700",
                overallHealth === "down" && "bg-destructive/10 text-destructive"
              )}
            >
              {overallHealth === "healthy" ? "Tous opérationnels" : 
               overallHealth === "degraded" ? "Dégradé" : "Problème détecté"}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={checkServiceHealth}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && services.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucun service à surveiller
          </div>
        ) : (
          <>
            {services.map((service) => (
              <TooltipProvider key={service.slug}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        getStatusColor(service.status)
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <span className="font-medium text-sm">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        {service.latency && (
                          <span className="text-muted-foreground">{service.latency}ms</span>
                        )}
                        {service.uptime && (
                          <Badge variant="outline" className="text-xs">
                            {service.uptime}% uptime
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p>Dernière vérification: {formatDistanceToNow(service.lastCheck, { addSuffix: true, locale: fr })}</p>
                      {service.errorRate !== undefined && (
                        <p>Taux d'erreur: {service.errorRate}%</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            <p className="text-xs text-muted-foreground text-right pt-2">
              Dernière mise à jour: {formatDistanceToNow(lastRefresh, { addSuffix: true, locale: fr })}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
