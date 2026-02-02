import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BarChart3, 
  Megaphone, 
  MapPin,
  Instagram,
  Youtube,
  Check,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ConnectionInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  provider: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastSync?: string;
  accountName?: string;
  mode: "live" | "demo";
  errorMessage?: string;
}

const CONNECTION_CONFIGS = [
  { id: "ga4", name: "Google Analytics 4", icon: BarChart3, provider: "google_analytics" },
  { id: "gsc", name: "Google Search Console", icon: Search, provider: "google_search_console" },
  { id: "gads", name: "Google Ads", icon: Megaphone, provider: "google_ads" },
  { id: "gbp", name: "Google Business Profile", icon: MapPin, provider: "google_business_profile" },
  { id: "youtube", name: "YouTube", icon: Youtube, provider: "youtube" },
  { id: "meta", name: "Meta (Facebook/Instagram)", icon: Instagram, provider: "meta" },
];

const ConnectionStatus = () => {
  const { currentWorkspace } = useWorkspace();
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) return;

    const loadConnectionStatus = async () => {
      setLoading(true);
      try {
        const { data: integrations, error } = await supabase
          .from("integrations")
          .select("id, provider, status, account_id, last_sync_at, refresh_failure_count, last_auth_failure_at")
          .eq("workspace_id", currentWorkspace.id);

        if (error) throw error;

        const connectionList: ConnectionInfo[] = CONNECTION_CONFIGS.map(config => {
          const integration = integrations?.find(i => i.provider === config.provider);
          
          if (!integration) {
            return {
              ...config,
              status: "disconnected" as const,
              mode: "demo" as const,
            };
          }

          const hasError = (integration.refresh_failure_count || 0) > 0;
          const isActive = (integration.status as string) === "active";
          const status = isActive 
            ? (hasError ? "error" : "connected") 
            : "pending";

          return {
            ...config,
            status: status as "connected" | "error" | "pending",
            lastSync: integration.last_sync_at,
            accountName: integration.account_id || undefined,
            mode: isActive ? "live" : "demo",
            errorMessage: hasError 
              ? `${integration.refresh_failure_count} échec(s) de refresh token` 
              : undefined,
          };
        });

        setConnections(connectionList);
      } catch (err) {
        console.error("Failed to load connection status:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConnectionStatus();
  }, [currentWorkspace?.id]);

  const connectedCount = connections.filter(c => c.status === "connected").length;
  const errorCount = connections.filter(c => c.status === "error").length;

  const getStatusIcon = (status: ConnectionInfo["status"]) => {
    switch (status) {
      case "connected": return <Check className="w-4 h-4 text-primary" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "pending": return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <X className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ConnectionInfo["status"]) => {
    switch (status) {
      case "connected": return <Badge variant="success">Autorisé</Badge>;
      case "error": return <Badge variant="destructive">Erreur</Badge>;
      case "pending": return <Badge variant="secondary">En attente</Badge>;
      default: return <Badge variant="outline">Non autorisé</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Accès</h1>
          <p className="text-muted-foreground">
            Ressources que vous avez autorisées pour l'analyse et l'optimisation.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={connectedCount > 0 ? "success" : "secondary"}>
            <Wifi className="w-3 h-3 mr-1" />
            {connectedCount} actives
          </Badge>
          {errorCount > 0 && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errorCount} erreur(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <RefreshCw className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Vos données, votre contrôle</p>
              <p className="text-sm text-muted-foreground">
                Vous avez autorisé l'accès à certaines de vos ressources. Nos agents IA les utilisent 
                pour analyser et optimiser. Vous pouvez révoquer l'accès à tout moment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          connections.map((connection) => {
            const Icon = connection.icon;
            return (
              <Card 
                key={connection.id} 
                variant={connection.status === "connected" ? "gradient" : "default"}
                className={connection.status === "error" ? "border-destructive/50" : ""}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        connection.status === "connected" 
                          ? "bg-primary/20" 
                          : connection.status === "error"
                          ? "bg-destructive/20"
                          : "bg-muted"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{connection.name}</CardTitle>
                        {connection.accountName && (
                          <CardDescription className="text-xs truncate max-w-[150px]">
                            {connection.accountName}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    {getStatusIcon(connection.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(connection.status)}
                    <Badge variant={connection.mode === "live" ? "default" : "outline"} className="text-xs">
                      {connection.mode === "live" ? (
                        <><Wifi className="w-3 h-3 mr-1" /> Live</>
                      ) : (
                        <><WifiOff className="w-3 h-3 mr-1" /> Démo</>
                      )}
                    </Badge>
                  </div>
                  
                  {connection.lastSync && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Dernière sync : {formatDistanceToNow(new Date(connection.lastSync), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  )}
                  
                  {connection.errorMessage && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {connection.errorMessage}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
