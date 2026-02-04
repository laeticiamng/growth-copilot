import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!onConnect) return;
    setIsLoading(true);
    setAction('connect');
    try {
      await onConnect();
      toast.success(`${integration.name} connecté avec succès`);
    } catch (error) {
      toast.error(`Erreur de connexion à ${integration.name}`);
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
      toast.success(`${integration.name} déconnecté`);
    } catch (error) {
      toast.error(`Erreur lors de la déconnexion`);
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
      toast.success(`Token ${integration.name} renouvelé`);
    } catch (error) {
      toast.error(`Erreur de renouvellement du token`);
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
            Connecté
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Erreur
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Expiré
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Link2Off className="w-3 h-3" />
            Non connecté
          </Badge>
        );
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
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
                Sync: {formatLastSync(integration.lastSyncAt)}
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
                Dernière sync: {formatLastSync(integration.lastSyncAt)}
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
                    <TooltipContent>Rafraîchir le token</TooltipContent>
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
                    <TooltipContent>Configurer</TooltipContent>
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
                  Déconnecter
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
              Connecter {integration.name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
