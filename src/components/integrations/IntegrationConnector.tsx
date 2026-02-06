import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Link2, 
  Link2Off, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Settings,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  provider: string;
  status: "connected" | "disconnected" | "error" | "expired";
  lastSyncAt?: Date;
  expiresAt?: Date;
  scopes?: string[];
  features?: string[];
}

interface IntegrationConnectorProps {
  integration: IntegrationConfig;
  onConnect?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  onConfigure?: () => void;
  compact?: boolean;
}

export function IntegrationConnector({
  integration,
  onConnect,
  onDisconnect,
  onRefresh,
  onConfigure,
  compact = false,
}: IntegrationConnectorProps) {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!onConnect) return;
    setIsLoading(true);
    setAction('connect');
    try {
      await onConnect();
      toast.success(t("integrationConnector.connectedSuccess", { name: integration.name }));
    } catch (error) {
      toast.error(t("integrationConnector.connectionError", { name: integration.name }));
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleDisconnect = async () => {
    if (!onDisconnect) return;
    setIsLoading(true);
    setAction('disconnect');
    try {
      await onDisconnect();
      toast.success(t("integrationConnector.disconnected", { name: integration.name }));
    } catch (error) {
      toast.error(t("integrationConnector.disconnectError"));
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsLoading(true);
    setAction('refresh');
    try {
      await onRefresh();
      toast.success(t("integrationConnector.tokenRefreshed", { name: integration.name }));
    } catch (error) {
      toast.error(t("integrationConnector.refreshError"));
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const getStatusBadge = () => {
    switch (integration.status) {
      case 'connected':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t("integrationConnector.connected")}
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {t("integrationConnector.error")}
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            {t("integrationConnector.expired")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Link2Off className="w-3 h-3" />
            {t("integrationConnector.notConnected")}
          </Badge>
        );
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return null;
    return formatDistanceToNow(date, { addSuffix: true, locale: getDateLocale(i18n.language) });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
            {integration.icon}
          </div>
          <div>
            <p className="font-medium text-sm">{integration.name}</p>
            {integration.lastSyncAt && (
              <p className="text-xs text-muted-foreground">
                {t("integrationConnector.lastSync")} {formatLastSync(integration.lastSyncAt)}
              </p>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>
    );
  }

  return (
    <Card className={integration.status === 'connected' ? 'border-green-500/30' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            {integration.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{integration.name}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {integration.description}
            </p>
            
            {integration.status === 'connected' && integration.lastSyncAt && (
              <p className="text-xs text-muted-foreground mt-2">
                {t("integrationConnector.lastSync")} {formatLastSync(integration.lastSyncAt)}
              </p>
            )}
            
            {integration.features && integration.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {integration.features.slice(0, 3).map((feature, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {integration.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{integration.features.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          {integration.status === 'connected' ? (
            <>
              {onRefresh && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                      >
                        {action === 'refresh' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("integrationConnector.refreshToken")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {onConfigure && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={onConfigure}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("common.configure")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <div className="flex-1" />
              
              {onDisconnect && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  {action === 'disconnect' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Link2Off className="w-4 h-4 mr-2" />
                  )}
                  {t("integrationConnector.disconnect")}
                </Button>
              )}
            </>
          ) : (
            <Button 
              variant="hero" 
              size="sm"
              className="w-full"
              onClick={handleConnect}
              disabled={isLoading}
            >
              {action === 'connect' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              {t("integrationConnector.connect")} {integration.name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
