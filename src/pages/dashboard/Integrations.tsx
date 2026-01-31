import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BarChart3, 
  Megaphone, 
  MapPin,
  Instagram,
  Mail,
  Calendar,
  ShoppingCart,
  FileCode,
  Palette,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "disconnected" | "pending" | "coming_soon";
  category: "analytics" | "ads" | "local" | "social" | "cms" | "crm";
  required?: boolean;
  provider?: string;
  comingSoonNote?: string;
}

const integrations: Integration[] = [
  // Analytics - Active
  { 
    id: "gsc", 
    name: "Google Search Console", 
    description: "Données SEO officielles et positionnement", 
    icon: Search, 
    status: "disconnected", 
    category: "analytics", 
    required: true,
    provider: "google_search_console",
  },
  { 
    id: "ga4", 
    name: "Google Analytics 4", 
    description: "Tracking et conversions", 
    icon: BarChart3, 
    status: "disconnected", 
    category: "analytics", 
    required: true,
    provider: "google_analytics",
  },
  
  // Ads - Coming Soon
  { 
    id: "gads", 
    name: "Google Ads", 
    description: "Campagnes publicitaires Search & Display", 
    icon: Megaphone, 
    status: "coming_soon", 
    category: "ads",
    comingSoonNote: "Intégration prévue Q2 2026. API Google Ads en cours d'évaluation.",
  },
  
  // Local - Coming Soon
  { 
    id: "gbp", 
    name: "Google Business Profile", 
    description: "Fiche locale, avis et posts", 
    icon: MapPin, 
    status: "coming_soon", 
    category: "local",
    comingSoonNote: "⚠️ Google Q&A API discontinued. Posts et avis uniquement. Quotas stricts (5 req/sec).",
  },
  
  // Social - Coming Soon
  { 
    id: "meta", 
    name: "Meta (Facebook/Instagram)", 
    description: "Social media et publicités", 
    icon: Instagram, 
    status: "coming_soon", 
    category: "social",
    comingSoonNote: "⚠️ Instagram direct publishing dépend des permissions (Business vs Creator). Export mode disponible.",
  },
  
  // CMS
  { 
    id: "wordpress", 
    name: "WordPress", 
    description: "Modifications et corrections automatiques", 
    icon: FileCode, 
    status: "disconnected", 
    category: "cms",
  },
  { 
    id: "shopify", 
    name: "Shopify", 
    description: "Optimisation e-commerce", 
    icon: ShoppingCart, 
    status: "disconnected", 
    category: "cms",
  },
  { 
    id: "webflow", 
    name: "Webflow", 
    description: "Design et contenu", 
    icon: Palette, 
    status: "disconnected", 
    category: "cms",
  },
  
  // CRM
  { 
    id: "email", 
    name: "Email Provider", 
    description: "Sendgrid, Mailchimp, Brevo...", 
    icon: Mail, 
    status: "disconnected", 
    category: "crm",
  },
  { 
    id: "calendar", 
    name: "Calendrier", 
    description: "Google Calendar, Calendly...", 
    icon: Calendar, 
    status: "disconnected", 
    category: "crm",
  },
];

const categoryLabels: Record<string, string> = {
  analytics: "Analytics & Données",
  ads: "Publicité",
  local: "Local SEO",
  social: "Réseaux Sociaux",
  cms: "CMS & Site",
  crm: "CRM & Email",
};

const Integrations = () => {
  const { currentSite } = useSites();
  const { currentWorkspace } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth");
    const provider = searchParams.get("provider");
    const errorType = searchParams.get("error_type");

    if (oauthStatus === "success" && provider) {
      toast.success("Connexion réussie !", {
        description: `${provider === "google_analytics" ? "Google Analytics" : "Search Console"} est maintenant connecté.`,
      });
      // Clear URL params
      setSearchParams({});
      // Refresh integration status
      loadIntegrationStatus();
    } else if (oauthStatus === "error") {
      toast.error("Erreur de connexion OAuth", {
        description: errorType || "Une erreur s'est produite lors de la connexion.",
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Load actual integration status from DB
  const loadIntegrationStatus = async () => {
    if (!currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("workspace_id", currentWorkspace.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setLocalIntegrations(prev => prev.map(integration => {
          // Find DB record matching this integration's provider and with active status
          const dbIntegration = data.find(d => 
            d.provider === integration.provider && 
            (d.status as string) === "active"
          );
          if (dbIntegration) {
            return { ...integration, status: "connected" as const };
          }
          return integration;
        }));
      }
    } catch (error) {
      console.error("Failed to load integration status:", error);
    }
  };

  // Load integration status on mount
  useEffect(() => {
    loadIntegrationStatus();
  }, [currentWorkspace?.id]);

  const handleConnect = async (integration: Integration) => {
    if (!currentSite || !currentWorkspace) {
      toast.error("Sélectionnez d'abord un site");
      return;
    }

    if (integration.status === "coming_soon") {
      toast.info(integration.comingSoonNote || "Cette intégration sera disponible prochainement");
      return;
    }

    // If already connected, disconnect
    if (integration.status === "connected") {
      setConnecting(integration.id);
      try {
        // Delete integration record (or set to pending for reconnection)
        const { error } = await supabase
          .from("integrations")
          .delete()
          .eq("workspace_id", currentWorkspace.id)
          .eq("provider", integration.provider as any);
        
        if (error) throw error;
        
        setLocalIntegrations(prev => prev.map(i => 
          i.id === integration.id ? { ...i, status: "disconnected" as const } : i
        ));
        toast.success("Intégration désactivée");
      } catch (error) {
        console.error("Disconnect error:", error);
        toast.error("Erreur lors de la déconnexion");
      } finally {
        setConnecting(null);
      }
      return;
    }

    // For Google integrations, use OAuth flow
    if (integration.provider && ["google_analytics", "google_search_console"].includes(integration.provider)) {
      setConnecting(integration.id);
      try {
        const { data, error } = await supabase.functions.invoke("oauth-init", {
          body: {
            workspace_id: currentWorkspace.id,
            provider: integration.provider,
            redirect_url: window.location.href,
          },
        });

        if (error) throw error;

        if (data.auth_url) {
          // Redirect to Google OAuth
          window.location.href = data.auth_url;
        } else {
          toast.error(data.error || "Erreur OAuth");
        }
      } catch (error) {
        console.error("OAuth init error:", error);
        toast.error("Erreur lors de l'initialisation OAuth. Vérifiez la configuration Google Cloud.");
      } finally {
        setConnecting(null);
      }
      return;
    }

    // For other integrations, show configuration message
    setConnecting(integration.id);
    try {
      setLocalIntegrations(prev => prev.map(i => 
        i.id === integration.id ? { ...i, status: "pending" as const } : i
      ));
      toast.success("Configuration requise", { 
        description: "Cette intégration nécessite une configuration manuelle." 
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleSync = async (integrationId: string) => {
    if (!currentSite || !currentWorkspace) return;

    setSyncing(integrationId);
    
    try {
      const endpoint = integrationId === "gsc" ? "sync-gsc" : "sync-ga4";
      const payload = integrationId === "gsc" 
        ? { workspace_id: currentWorkspace.id, site_id: currentSite.id, site_url: currentSite.url }
        : { workspace_id: currentWorkspace.id, site_id: currentSite.id, property_id: "GA4-PROPERTY-ID" };

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: payload,
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success("Synchronisation terminée", { description: data.message });
      } else {
        toast.error(data.error || "Échec de la synchronisation");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Erreur lors de la synchronisation");
    } finally {
      setSyncing(null);
    }
  };

  const groupedIntegrations = localIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = [];
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const connectedCount = localIntegrations.filter(i => i.status === "connected").length;
  const comingSoonCount = localIntegrations.filter(i => i.status === "coming_soon").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intégrations</h1>
          <p className="text-muted-foreground">
            Connectez vos outils pour débloquer toutes les fonctionnalités.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={connectedCount > 0 ? "success" : "secondary"}>
            {connectedCount} connectées
          </Badge>
          <Badge variant="secondary">
            {comingSoonCount} à venir
          </Badge>
        </div>
      </div>

      {/* Token Setup Instructions */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex items-start gap-4 py-4">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Configuration OAuth</p>
            <p className="text-sm text-muted-foreground">
              GSC et GA4 nécessitent des tokens OAuth. Après connexion :
            </p>
            <ol className="text-sm text-muted-foreground mt-2 list-decimal list-inside space-y-1">
              <li>Configurez vos credentials dans Google Cloud Console</li>
              <li>Ajoutez les tokens via les secrets Lovable Cloud</li>
              <li>Cliquez "Sync Now" pour récupérer les données</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Site Selection Warning */}
      {!currentSite && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm">
              Sélectionnez d'abord un site dans la page <strong>Sites</strong> pour configurer les intégrations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Integration Categories */}
      <div className="space-y-8">
        {Object.entries(groupedIntegrations).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-4">{categoryLabels[category]}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((integration) => {
                const Icon = integration.icon;
                const isConnected = integration.status === "connected";
                const isPending = integration.status === "pending";
                const isComingSoon = integration.status === "coming_soon";
                const isConnecting = connecting === integration.id;
                const isSyncing = syncing === integration.id;
                const canSync = (integration.id === "gsc" || integration.id === "ga4") && (isConnected || isPending);
                
                return (
                  <Card 
                    key={integration.id} 
                    variant={isConnected ? "gradient" : isComingSoon ? "default" : "feature"}
                    className={isComingSoon ? "opacity-75" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${isConnected ? 'bg-primary/20' : isComingSoon ? 'bg-muted' : 'bg-secondary'}`}>
                          <Icon className={`w-6 h-6 ${isComingSoon ? 'text-muted-foreground' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{integration.name}</h3>
                            {integration.required && !isComingSoon && (
                              <Badge variant="outline" className="text-xs">Recommandé</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {integration.description}
                          </p>
                          
                          {isComingSoon && integration.comingSoonNote && (
                            <p className="text-xs text-muted-foreground bg-muted p-2 rounded mb-3">
                              {integration.comingSoonNote}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={isConnected ? "success" : isPending ? "secondary" : isComingSoon ? "outline" : "secondary"}
                              className="text-xs"
                            >
                              {isConnected ? (
                                <><Check className="w-3 h-3 mr-1" /> Connecté</>
                              ) : isPending ? (
                                <><Clock className="w-3 h-3 mr-1" /> En attente</>
                              ) : isComingSoon ? (
                                <><Clock className="w-3 h-3 mr-1" /> Bientôt</>
                              ) : (
                                <><X className="w-3 h-3 mr-1" /> Non connecté</>
                              )}
                            </Badge>
                            <div className="flex gap-2">
                              {canSync && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSync(integration.id)}
                                  disabled={isSyncing}
                                >
                                  {isSyncing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Sync Now"
                                  )}
                                </Button>
                              )}
                              <Button 
                                variant={isConnected ? "outline" : isComingSoon ? "ghost" : "default"} 
                                size="sm"
                                onClick={() => handleConnect(integration)}
                                disabled={isConnecting || !currentSite || isComingSoon}
                              >
                                {isConnecting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isComingSoon ? (
                                  "Bientôt"
                                ) : isConnected ? (
                                  "Déconnecter"
                                ) : (
                                  <>
                                    Connecter
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
