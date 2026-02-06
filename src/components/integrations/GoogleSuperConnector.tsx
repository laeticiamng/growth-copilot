import { useState } from "react";
import { useTranslation } from "react-i18next";
 import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Search, 
  Megaphone, 
  MapPin, 
  Youtube,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Info,
  RefreshCw,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";

export function GoogleSuperConnector() {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [connecting, setConnecting] = useState(false);

   // Fetch Google integration status from database
   const { data: integration, isLoading, refetch } = useQuery({
     queryKey: ["google-integration", currentWorkspace?.id],
     queryFn: async () => {
       if (!currentWorkspace?.id) return null;
       
       const { data, error } = await supabase
         .from("integrations")
         .select("*")
         .eq("workspace_id", currentWorkspace.id)
         .eq("provider", "google_combined")
         .maybeSingle();
       
       if (error) {
         console.error("Error fetching Google integration:", error);
         return null;
       }
       
       return data;
     },
     enabled: !!currentWorkspace?.id,
     refetchInterval: 5000, // Auto-refresh every 5 seconds to catch OAuth callback
   });
 
   const isConnected = integration?.status === "active";
   const lastSync = integration?.last_sync_at;
   const accountName = integration?.account_id;
 
  const handleConnectAll = async () => {
    if (!currentWorkspace) {
      toast.error(t("components.connectors.noWorkspace"));
      return;
    }
    
    if (!currentSite) {
      toast.error(t("components.connectors.selectSiteFirst"));
      return;
    }

    setConnecting(true);
    try {
      // Use google_combined to request all scopes at once
      const { data, error } = await supabase.functions.invoke("oauth-init", {
        body: {
          workspace_id: currentWorkspace.id,
          provider: "google_combined",
          redirect_url: window.location.href,
        },
      });

      if (error) throw error;

      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        toast.error(data.error || t("components.connectors.oauthError"));
      }
    } catch (error) {
      console.error("OAuth init error:", error);
      toast.error(t("components.connectors.oauthInitError"));
    } finally {
      setConnecting(false);
    }
  };

   // Determine which modules are connected based on scopes
   // For now, if google_combined is connected, GA4 and GSC are available
   const moduleStatus = {
     ga4: { connected: isConnected, lastSync, accountName },
     gsc: { connected: isConnected, lastSync, accountName },
     gads: { connected: false }, // Not in current scopes
     gbp: { connected: false },  // Not in current scopes
     youtube: { connected: false }, // Not in current scopes
   };
 
   const connectedCount = Object.values(moduleStatus).filter(m => m.connected).length;

  const modules = [
    { 
      key: "ga4", 
      title: "Google Analytics 4", 
      description: t("components.connectors.ga4Desc"),
      icon: BarChart3,
       status: moduleStatus.ga4 as { connected: boolean; lastSync?: string | null; accountName?: string | null },
    },
    { 
      key: "gsc", 
      title: "Search Console", 
      description: t("components.connectors.gscDesc"),
      icon: Search,
       status: moduleStatus.gsc as { connected: boolean; lastSync?: string | null; accountName?: string | null },
    },
    { 
      key: "gads", 
      title: "Google Ads", 
      description: t("components.connectors.gadsDesc"),
      icon: Megaphone,
       status: moduleStatus.gads as { connected: boolean; lastSync?: string | null; accountName?: string | null },
    },
    { 
      key: "gbp", 
      title: "Business Profile", 
      description: t("components.connectors.gbpDesc"),
      icon: MapPin,
       status: moduleStatus.gbp as { connected: boolean; lastSync?: string | null; accountName?: string | null },
    },
    { 
      key: "youtube", 
      title: "YouTube", 
      description: t("components.connectors.youtubeDesc"),
      icon: Youtube,
       status: moduleStatus.youtube as { connected: boolean; lastSync?: string | null; accountName?: string | null },
    },
  ];

  return (
     <Card className={`border-2 ${isConnected ? "border-green-500/50 bg-gradient-to-br from-green-500/5 to-blue-500/5" : "border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-red-500/5"}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-xl ${isConnected ? "bg-gradient-to-br from-green-500 to-blue-500" : "bg-gradient-to-br from-blue-500 to-red-500"} text-white`}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg">Google Suite</CardTitle>
              <CardDescription>
                 {isConnected ? t("components.connectors.connectedServices", { count: connectedCount }) : t("components.connectors.googleServices")}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {isConnected && (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {connectedCount}/5 {t("components.connectors.active")}
              </Badge>
            )}
             {isConnected && (
               <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            <Button
               variant={isConnected ? "outline" : "default"}
              size="sm"
              onClick={handleConnectAll}
               disabled={connecting || !currentSite || isLoading}
               className={!isConnected ? "bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 border-0" : ""}
            >
               {connecting || isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
               ) : isConnected ? (
                 <>
                   <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                    {t("components.connectors.connected")}
                  </>
               ) : (
                 <>
                   {t("components.connectors.authorizeAccess")}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Info box */}
        <div className="flex items-start gap-3 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground mb-1">{t("components.connectors.howItWorks")}</p>
            <p>{t("components.connectors.googleInfoText")}</p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {modules.map((module) => {
            const Icon = module.icon;
            const isConnected = module.status.connected;
            
            return (
              <div 
                key={module.key}
                className={`p-3 rounded-lg border transition-colors ${
                  isConnected 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md ${
                    isConnected ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isConnected ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{module.title}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={isConnected ? "success" : "outline"} 
                    className="text-xs"
                  >
                    {isConnected ? t("components.connectors.connected") : t("components.connectors.notConnected")}
                  </Badge>
                </div>
                {module.status.lastSync && (
                  <p className="text-xs text-muted-foreground mt-2">
                     Sync : {formatDistanceToNow(new Date(module.status.lastSync as string), { 
                      addSuffix: true, 
                      locale: getDateLocale(i18n.language)
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
