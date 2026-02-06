 import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  BarChart3, 
  Megaphone, 
  MapPin,
  Mail,
  Calendar,
  ShoppingCart,
  FileCode,
  Palette,
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  Youtube,
  Instagram,
  MessageCircle,
  ExternalLink,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { GoogleSuperConnector } from "@/components/integrations/GoogleSuperConnector";
import { MetaSuperConnector } from "@/components/integrations/MetaSuperConnector";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
 import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface PlatformTool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "coming_soon";
  category: "google" | "meta" | "cms" | "crm";
  capabilities: string[];
  authRoute?: string;
}

const platformTools: PlatformTool[] = [
  // Google Suite - Active
  { 
    id: "ga4", 
    name: "Google Analytics 4", 
    description: "Analyse du trafic, comportement utilisateur et conversions", 
    icon: BarChart3, 
    status: "active", 
    category: "google",
    capabilities: ["Sessions & utilisateurs", "Sources de trafic", "Taux de rebond", "Conversions"],
    authRoute: "/dashboard/integrations/google",
  },
  { 
    id: "gsc", 
    name: "Google Search Console", 
    description: "Positions SEO, clics et impressions organiques", 
    icon: Search, 
    status: "active", 
    category: "google",
    capabilities: ["Positions mots-clés", "CTR organique", "Pages indexées", "Erreurs techniques"],
    authRoute: "/dashboard/integrations/google",
  },
  { 
    id: "gads", 
    name: "Google Ads", 
    description: "Analyse des campagnes publicitaires Search & Display", 
    icon: Megaphone, 
    status: "active", 
    category: "google",
    capabilities: ["CPC & ROAS", "Quality Score", "Conversions", "Budgets"],
    authRoute: "/dashboard/integrations/google",
  },
  { 
    id: "gbp", 
    name: "Google Business Profile", 
    description: "Visibilité locale, avis clients et fiches établissements", 
    icon: MapPin, 
    status: "active", 
    category: "google",
    capabilities: ["Note moyenne", "Nombre d'avis", "Vues fiche", "Posts GBP"],
    authRoute: "/dashboard/integrations/google",
  },
  { 
    id: "youtube", 
    name: "YouTube Analytics", 
    description: "Performance vidéo et analytics de chaîne", 
    icon: Youtube, 
    status: "active", 
    category: "google",
    capabilities: ["Vues & durée", "Abonnés", "Engagement", "Sources de trafic"],
    authRoute: "/dashboard/integrations/google",
  },
  
  // Meta Suite - Active
  { 
    id: "meta-ads", 
    name: "Meta Ads", 
    description: "Analyse des campagnes Facebook & Instagram Ads", 
    icon: Megaphone, 
    status: "active", 
    category: "meta",
    capabilities: ["ROAS & CPA", "Reach & fréquence", "Créatives", "Audiences"],
    authRoute: "/dashboard/integrations/meta",
  },
  { 
    id: "instagram", 
    name: "Instagram Insights", 
    description: "Analytics du compte Instagram et engagement", 
    icon: Instagram, 
    status: "active", 
    category: "meta",
    capabilities: ["Followers", "Engagement rate", "Reach posts", "Stories"],
    authRoute: "/dashboard/integrations/meta",
  },
  { 
    id: "messenger", 
    name: "Messaging Insights", 
    description: "Analytics Messenger & WhatsApp Business", 
    icon: MessageCircle, 
    status: "active", 
    category: "meta",
    capabilities: ["Temps de réponse", "Conversations", "Satisfaction", "Automatisations"],
    authRoute: "/dashboard/integrations/meta",
  },
  
  // CMS - Coming Soon
  {
    id: "wordpress",
    name: "WordPress",
    description: "Modifications et corrections automatiques du site",
    icon: FileCode,
    status: "coming_soon",
    category: "cms",
    capabilities: ["Édition contenu", "SEO on-page", "Plugins", "Thèmes"],
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Optimisation e-commerce et catalogue produits",
    icon: ShoppingCart,
    status: "coming_soon",
    category: "cms",
    capabilities: ["Produits", "Collections", "Checkout", "Analytics"],
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Design et contenu responsive",
    icon: Palette,
    status: "coming_soon",
    category: "cms",
    capabilities: ["CMS items", "Pages", "Assets", "Forms"],
  },

  // CRM - Coming Soon
  {
    id: "email",
    name: "Email Marketing",
    description: "Sendgrid, Mailchimp, Brevo...",
    icon: Mail,
    status: "coming_soon",
    category: "crm",
    capabilities: ["Campagnes", "Automations", "Listes", "Analytics"],
  },
  {
    id: "calendar",
    name: "Calendrier",
    description: "Google Calendar, Calendly...",
    icon: Calendar,
    status: "coming_soon",
    category: "crm",
    capabilities: ["RDV", "Disponibilités", "Rappels", "Sync"],
  },
];

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  google: { label: "Google Suite", color: "from-blue-500 to-red-500", icon: Search },
  meta: { label: "Meta Suite", color: "from-blue-600 to-purple-600", icon: Instagram },
  cms: { label: "CMS & Site", color: "from-emerald-500 to-teal-500", icon: FileCode },
  crm: { label: "CRM & Email", color: "from-orange-500 to-amber-500", icon: Mail },
};

const Integrations = () => {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [activeTab, setActiveTab] = useState("overview");
  const [authorizing, setAuthorizing] = useState<string | null>(null);

  // Fetch all integrations status
  const { data: integrations, isLoading: integrationsLoading, refetch } = useQuery({
    queryKey: ["integrations-status", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from("integrations")
        .select("id, provider, status, account_id, last_sync_at")
        .eq("workspace_id", currentWorkspace.id);
      
      if (error) {
        console.error("Error fetching integrations:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
    refetchInterval: 5000,
  });

  const googleConnected = integrations?.some(i => i.provider === "google_combined" && i.status === "active") ?? false;
  const metaConnected = integrations?.some(i => i.provider === "meta" && i.status === "active") ?? false;

  const groupedTools = platformTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, PlatformTool[]>);

  // Calculate real connection status based on database, not static config
  const getToolConnectionStatus = (toolId: string, category: string): "connected" | "available" | "coming_soon" => {
    // Coming soon tools stay coming soon
    const tool = platformTools.find(t => t.id === toolId);
    if (tool?.status === "coming_soon") return "coming_soon";
    
    // Check real connections from database
    if (category === "google") {
      return googleConnected ? "connected" : "available";
    }
    if (category === "meta") {
      return metaConnected ? "connected" : "available";
    }
    
    return "available";
  };

  // Count only really connected tools
  const connectedCount = (googleConnected ? 5 : 0) + (metaConnected ? 3 : 0); // 5 Google tools, 3 Meta tools
  const availableCount = platformTools.filter(t => t.status === "active").length - connectedCount;
  const comingSoonCount = platformTools.filter(t => t.status === "coming_soon").length;

  // Handle OAuth authorization
  const handleAuthorize = async (provider: string) => {
    if (!currentWorkspace?.id) {
      toast.error("Workspace non sélectionné");
      return;
    }
    
    if (!currentSite) {
      toast.error("Sélectionnez d'abord un site dans le menu Sites");
      return;
    }

    setAuthorizing(provider);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-init", {
        body: {
          provider,
          workspace_id: currentWorkspace.id,
          redirect_url: window.location.href,
        },
      });

      if (error) throw error;
      
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      } else {
        throw new Error(data?.error || "URL d'autorisation manquante");
      }
    } catch (err) {
      console.error("OAuth init error:", err);
      toast.error("Erreur lors de l'autorisation");
    } finally {
      setAuthorizing(null);
    }
  };

   // Real-time subscription for integrations
   const handleRealtimeUpdate = useCallback(() => {
     refetch();
   }, [refetch]);
 
   useRealtimeSubscription(
     `integrations-${currentWorkspace?.id}`,
     {
       table: 'integrations',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              {t("integrationsPage.title")}
              <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
            </h1>
           <p className="text-muted-foreground text-sm sm:text-base">
             {t("integrationsPage.subtitle")}
           </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {connectedCount > 0 && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {connectedCount} connectés
            </Badge>
          )}
          {availableCount > 0 && (
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              {availableCount} disponibles
            </Badge>
          )}
          <Badge variant="secondary">
            {comingSoonCount} à venir
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="google">Google Suite</TabsTrigger>
          <TabsTrigger value="meta">Meta Suite</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* How it works */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="flex items-start gap-4 py-5">
              <div className="p-2.5 rounded-xl bg-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Comment ça fonctionne ?</p>
                <div className="text-sm text-muted-foreground mt-2 space-y-2">
                  <p>
                    <strong>1. Vous entrez une URL ou un contenu</strong> — c'est tout ce dont nous avons besoin pour démarrer l'analyse.
                  </p>
                  <p>
                    <strong>2. Nos agents IA analysent automatiquement</strong> — SEO, performance, opportunités de croissance.
                  </p>
                  <p>
                    <strong>3. Pour des actions sur vos comptes</strong> — autorisez l'accès à vos ressources (Google, Meta) 
                    quand vous souhaitez que nos agents modifient ou optimisent directement.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                    Aucune API à fournir
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                    Analyse automatique
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                    Vous gardez le contrôle
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className={`${googleConnected ? "border-green-500/50 bg-gradient-to-br from-green-500/5 to-blue-500/5" : "border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-red-500/5"} hover:border-blue-500/50 transition-colors cursor-pointer`} onClick={() => setActiveTab("google")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${googleConnected ? "bg-gradient-to-br from-green-500 to-blue-500" : "bg-gradient-to-br from-blue-500 to-red-500"}`}>
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Google Super-Connecteur</h3>
                    <p className="text-sm text-muted-foreground">
                      {googleConnected ? "Connecté • GA4, GSC actifs" : "GA4, GSC, Ads, GBP, YouTube"}
                    </p>
                  </div>
                  <Button 
                    variant={googleConnected ? "outline" : "default"} 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleAuthorize("google_combined"); }} 
                    disabled={authorizing === "google_combined" || integrationsLoading || !currentSite}
                    className={!googleConnected ? "bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 border-0" : ""}
                  >
                    {authorizing === "google_combined" || integrationsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : googleConnected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                        Connecté
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-1" />
                        Autoriser
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`${metaConnected ? "border-green-500/50 bg-gradient-to-br from-green-500/5 to-purple-500/5" : "border-purple-500/30 bg-gradient-to-br from-blue-600/5 to-purple-600/5"} hover:border-purple-500/50 transition-colors cursor-pointer`} onClick={() => setActiveTab("meta")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${metaConnected ? "bg-gradient-to-br from-green-500 to-purple-500" : "bg-gradient-to-br from-blue-600 to-purple-600"}`}>
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Meta Super-Connecteur</h3>
                    <p className="text-sm text-muted-foreground">
                      {metaConnected ? "Connecté • Ads, Instagram actifs" : "Ads, Instagram, Messenger, CAPI"}
                    </p>
                  </div>
                  <Button 
                    variant={metaConnected ? "outline" : "default"} 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleAuthorize("meta"); }} 
                    disabled={authorizing === "meta" || integrationsLoading || !currentSite}
                    className={!metaConnected ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0" : ""}
                  >
                    {authorizing === "meta" || integrationsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : metaConnected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                        Connecté
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-1" />
                        Autoriser
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tool Categories */}
          <div className="space-y-8">
            {Object.entries(groupedTools).map(([category, tools]) => {
              const config = categoryConfig[category];
              const CategoryIcon = config.icon;
              // Calculate connected count based on real database connections
              const connectedInCategory = tools.filter(t => 
                getToolConnectionStatus(t.id, t.category) === "connected"
              ).length;
              const availableInCategory = tools.filter(t => 
                getToolConnectionStatus(t.id, t.category) === "available"
              ).length;
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{config.label}</h2>
                      <p className="text-sm text-muted-foreground">
                        {connectedInCategory > 0 ? (
                          <span className="text-green-600 font-medium">{connectedInCategory} connecté{connectedInCategory > 1 ? 's' : ''}</span>
                        ) : null}
                        {connectedInCategory > 0 && availableInCategory > 0 ? ' • ' : ''}
                        {availableInCategory > 0 ? (
                          <span>{availableInCategory} disponible{availableInCategory > 1 ? 's' : ''}</span>
                        ) : null}
                        {connectedInCategory === 0 && availableInCategory === 0 ? 'Bientôt disponible' : null}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      const connectionStatus = getToolConnectionStatus(tool.id, tool.category);
                      const isConnected = connectionStatus === "connected";
                      const isAvailable = connectionStatus === "available";
                      const isComingSoon = connectionStatus === "coming_soon";
                      
                      return (
                        <Card 
                          key={tool.id} 
                          className={`transition-all ${
                            isConnected 
                              ? "border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent hover:border-green-500/50" 
                              : isAvailable
                              ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40"
                              : "opacity-60"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2.5 rounded-lg ${
                                isConnected ? 'bg-green-500/15' : isAvailable ? 'bg-primary/15' : 'bg-muted'
                              }`}>
                                <Icon className={`w-5 h-5 ${isConnected ? 'text-green-600' : isAvailable ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{tool.name}</h3>
                                  <Badge 
                                    variant={isConnected ? "success" : isAvailable ? "outline" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {isConnected ? (
                                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</>
                                    ) : isAvailable ? (
                                      <><Unlock className="w-3 h-3 mr-1" /> Disponible</>
                                    ) : (
                                      <><Clock className="w-3 h-3 mr-1" /> Bientôt</>
                                    )}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                  {tool.description}
                                </p>
                                
                                {/* Capabilities */}
                                <div className="flex flex-wrap gap-1">
                                  {tool.capabilities.slice(0, 3).map((cap, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                    >
                                      {cap}
                                    </span>
                                  ))}
                                  {tool.capabilities.length > 3 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                      +{tool.capabilities.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="google" className="mt-6">
          <GoogleSuperConnector />
        </TabsContent>

        <TabsContent value="meta" className="mt-6">
          <MetaSuperConnector />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
