import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
  Unlock,
  Loader2,
} from "lucide-react";
import { GoogleSuperConnector } from "@/components/integrations/GoogleSuperConnector";
import { MetaSuperConnector } from "@/components/integrations/MetaSuperConnector";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import type { TFunction } from "i18next";

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

const getPlatformTools = (t: TFunction): PlatformTool[] => [
  // Google Suite
  { id: "ga4", name: t("integrationsPage.ga4Name"), description: t("integrationsPage.ga4Desc"), icon: BarChart3, status: "active", category: "google", capabilities: [t("integrationsPage.ga4Cap1"), t("integrationsPage.ga4Cap2"), t("integrationsPage.ga4Cap3"), t("integrationsPage.ga4Cap4")], authRoute: "/dashboard/integrations/google" },
  { id: "gsc", name: t("integrationsPage.gscName"), description: t("integrationsPage.gscDesc"), icon: Search, status: "active", category: "google", capabilities: [t("integrationsPage.gscCap1"), t("integrationsPage.gscCap2"), t("integrationsPage.gscCap3"), t("integrationsPage.gscCap4")], authRoute: "/dashboard/integrations/google" },
  { id: "gads", name: t("integrationsPage.gadsName"), description: t("integrationsPage.gadsDesc"), icon: Megaphone, status: "active", category: "google", capabilities: [t("integrationsPage.gadsCap1"), t("integrationsPage.gadsCap2"), t("integrationsPage.gadsCap3"), t("integrationsPage.gadsCap4")], authRoute: "/dashboard/integrations/google" },
  { id: "gbp", name: t("integrationsPage.gbpName"), description: t("integrationsPage.gbpDesc"), icon: MapPin, status: "active", category: "google", capabilities: [t("integrationsPage.gbpCap1"), t("integrationsPage.gbpCap2"), t("integrationsPage.gbpCap3"), t("integrationsPage.gbpCap4")], authRoute: "/dashboard/integrations/google" },
  { id: "youtube", name: t("integrationsPage.youtubeName"), description: t("integrationsPage.youtubeDesc"), icon: Youtube, status: "active", category: "google", capabilities: [t("integrationsPage.youtubeCap1"), t("integrationsPage.youtubeCap2"), t("integrationsPage.youtubeCap3"), t("integrationsPage.youtubeCap4")], authRoute: "/dashboard/integrations/google" },
  // Meta Suite
  { id: "meta-ads", name: t("integrationsPage.metaAdsName"), description: t("integrationsPage.metaAdsDesc"), icon: Megaphone, status: "active", category: "meta", capabilities: [t("integrationsPage.metaAdsCap1"), t("integrationsPage.metaAdsCap2"), t("integrationsPage.metaAdsCap3"), t("integrationsPage.metaAdsCap4")], authRoute: "/dashboard/integrations/meta" },
  { id: "instagram", name: t("integrationsPage.instagramName"), description: t("integrationsPage.instagramDesc"), icon: Instagram, status: "active", category: "meta", capabilities: [t("integrationsPage.instagramCap1"), t("integrationsPage.instagramCap2"), t("integrationsPage.instagramCap3"), t("integrationsPage.instagramCap4")], authRoute: "/dashboard/integrations/meta" },
  { id: "messenger", name: t("integrationsPage.messengerName"), description: t("integrationsPage.messengerDesc"), icon: MessageCircle, status: "active", category: "meta", capabilities: [t("integrationsPage.messengerCap1"), t("integrationsPage.messengerCap2"), t("integrationsPage.messengerCap3"), t("integrationsPage.messengerCap4")], authRoute: "/dashboard/integrations/meta" },
  // CMS
  { id: "wordpress", name: t("integrationsPage.wordpressName"), description: t("integrationsPage.wordpressDesc"), icon: FileCode, status: "coming_soon", category: "cms", capabilities: [t("integrationsPage.wordpressCap1"), t("integrationsPage.wordpressCap2"), t("integrationsPage.wordpressCap3"), t("integrationsPage.wordpressCap4")] },
  { id: "shopify", name: t("integrationsPage.shopifyName"), description: t("integrationsPage.shopifyDesc"), icon: ShoppingCart, status: "coming_soon", category: "cms", capabilities: [t("integrationsPage.shopifyCap1"), t("integrationsPage.shopifyCap2"), t("integrationsPage.shopifyCap3"), t("integrationsPage.shopifyCap4")] },
  { id: "webflow", name: t("integrationsPage.webflowName"), description: t("integrationsPage.webflowDesc"), icon: Palette, status: "coming_soon", category: "cms", capabilities: [t("integrationsPage.webflowCap1"), t("integrationsPage.webflowCap2"), t("integrationsPage.webflowCap3"), t("integrationsPage.webflowCap4")] },
  // CRM
  { id: "email", name: t("integrationsPage.emailName"), description: t("integrationsPage.emailDesc"), icon: Mail, status: "coming_soon", category: "crm", capabilities: [t("integrationsPage.emailCap1"), t("integrationsPage.emailCap2"), t("integrationsPage.emailCap3"), t("integrationsPage.emailCap4")] },
  { id: "calendar", name: t("integrationsPage.calendarName"), description: t("integrationsPage.calendarDesc"), icon: Calendar, status: "coming_soon", category: "crm", capabilities: [t("integrationsPage.calendarCap1"), t("integrationsPage.calendarCap2"), t("integrationsPage.calendarCap3"), t("integrationsPage.calendarCap4")] },
];

const getCategoryConfig = (t: TFunction): Record<string, { label: string; color: string; icon: React.ElementType }> => ({
  google: { label: t("integrationsPage.googleSuite"), color: "from-blue-500 to-red-500", icon: Search },
  meta: { label: t("integrationsPage.metaSuite"), color: "from-blue-600 to-purple-600", icon: Instagram },
  cms: { label: t("integrationsPage.cmsSite"), color: "from-emerald-500 to-teal-500", icon: FileCode },
  crm: { label: t("integrationsPage.crmEmail"), color: "from-orange-500 to-amber-500", icon: Mail },
});

const Integrations = () => {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [activeTab, setActiveTab] = useState("overview");
  const [authorizing, setAuthorizing] = useState<string | null>(null);

  const tools = getPlatformTools(t);
  const categoryConfig = getCategoryConfig(t);

  // Fetch all integrations status
  const { data: integrations, isLoading: integrationsLoading, refetch } = useQuery({
    queryKey: ["integrations-status", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data, error } = await supabase
        .from("integrations")
        .select("id, provider, status, account_id, last_sync_at")
        .eq("workspace_id", currentWorkspace.id);
      if (error) { console.error("Error fetching integrations:", error); return []; }
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
    refetchInterval: 5000,
  });

  const googleConnected = integrations?.some(i => i.provider === "google_combined" && i.status === "active") ?? false;
  const metaConnected = integrations?.some(i => i.provider === "meta" && i.status === "active") ?? false;

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, PlatformTool[]>);

  const getToolConnectionStatus = (toolId: string, category: string): "connected" | "available" | "coming_soon" => {
    const tool = tools.find(t => t.id === toolId);
    if (tool?.status === "coming_soon") return "coming_soon";
    if (category === "google") return googleConnected ? "connected" : "available";
    if (category === "meta") return metaConnected ? "connected" : "available";
    return "available";
  };

  const connectedCount = (googleConnected ? 5 : 0) + (metaConnected ? 3 : 0);
  const availableCount = tools.filter(t => t.status === "active").length - connectedCount;
  const comingSoonCount = tools.filter(t => t.status === "coming_soon").length;

  const handleAuthorize = async (provider: string) => {
    if (!currentWorkspace?.id) { toast.error(t("integrationsPage.workspaceNotSelected")); return; }
    if (!currentSite) { toast.error(t("integrationsPage.selectSiteFirst")); return; }
    setAuthorizing(provider);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-init", {
        body: { provider, workspace_id: currentWorkspace.id, redirect_url: window.location.href },
      });
      if (error) throw error;
      if (data?.auth_url) { window.location.href = data.auth_url; }
      else { throw new Error(data?.error || t("integrationsPage.authUrlMissing")); }
    } catch (err) {
      console.error("OAuth init error:", err);
      toast.error(t("integrationsPage.authError"));
    } finally { setAuthorizing(null); }
  };

  const handleRealtimeUpdate = useCallback(() => { refetch(); }, [refetch]);
  useRealtimeSubscription(
    `integrations-${currentWorkspace?.id}`,
    { table: 'integrations', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined },
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
          <p className="text-muted-foreground text-sm sm:text-base">{t("integrationsPage.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {connectedCount > 0 && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {t("integrationsPage.connectedCount", { count: connectedCount })}
            </Badge>
          )}
          {availableCount > 0 && (
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              {t("integrationsPage.availableCount", { count: availableCount })}
            </Badge>
          )}
          <Badge variant="secondary">
            {t("integrationsPage.comingSoonCount", { count: comingSoonCount })}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t("integrationsPage.overview")}</TabsTrigger>
          <TabsTrigger value="google">{t("integrationsPage.googleSuite")}</TabsTrigger>
          <TabsTrigger value="meta">{t("integrationsPage.metaSuite")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* How it works */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="flex items-start gap-4 py-5">
              <div className="p-2.5 rounded-xl bg-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{t("integrationsPage.howItWorks")}</p>
                <div className="text-sm text-muted-foreground mt-2 space-y-2">
                  <p><strong>{t("integrationsPage.step1")}</strong> {t("integrationsPage.step1Desc")}</p>
                  <p><strong>{t("integrationsPage.step2")}</strong> {t("integrationsPage.step2Desc")}</p>
                  <p><strong>{t("integrationsPage.step3")}</strong> {t("integrationsPage.step3Desc")}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />{t("integrationsPage.noApiNeeded")}
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />{t("integrationsPage.autoAnalysis")}
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />{t("integrationsPage.youKeepControl")}
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
                    <h3 className="font-semibold text-lg">{t("integrationsPage.googleSuperConnector")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {googleConnected ? t("integrationsPage.googleConnectedDesc") : t("integrationsPage.googleDefaultDesc")}
                    </p>
                  </div>
                  <Button 
                    variant={googleConnected ? "outline" : "default"} size="sm"
                    onClick={(e) => { e.stopPropagation(); handleAuthorize("google_combined"); }}
                    disabled={authorizing === "google_combined" || integrationsLoading || !currentSite}
                    className={!googleConnected ? "bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 border-0" : ""}
                  >
                    {authorizing === "google_combined" || integrationsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : googleConnected ? (
                      <><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />{t("integrationsPage.connectedStatus")}</>
                    ) : (
                      <><Unlock className="w-4 h-4 mr-1" />{t("integrationsPage.authorize")}</>
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
                    <h3 className="font-semibold text-lg">{t("integrationsPage.metaSuperConnector")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {metaConnected ? t("integrationsPage.metaConnectedDesc") : t("integrationsPage.metaDefaultDesc")}
                    </p>
                  </div>
                  <Button 
                    variant={metaConnected ? "outline" : "default"} size="sm"
                    onClick={(e) => { e.stopPropagation(); handleAuthorize("meta"); }}
                    disabled={authorizing === "meta" || integrationsLoading || !currentSite}
                    className={!metaConnected ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0" : ""}
                  >
                    {authorizing === "meta" || integrationsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : metaConnected ? (
                      <><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />{t("integrationsPage.connectedStatus")}</>
                    ) : (
                      <><Unlock className="w-4 h-4 mr-1" />{t("integrationsPage.authorize")}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tool Categories */}
          <div className="space-y-8">
            {Object.entries(groupedTools).map(([category, catTools]) => {
              const config = categoryConfig[category];
              const CategoryIcon = config.icon;
              const connectedInCategory = catTools.filter(ct => getToolConnectionStatus(ct.id, ct.category) === "connected").length;
              const availableInCategory = catTools.filter(ct => getToolConnectionStatus(ct.id, ct.category) === "available").length;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{config.label}</h2>
                      <p className="text-sm text-muted-foreground">
                        {connectedInCategory > 0 && (
                          <span className="text-green-600 font-medium">{t("integrationsPage.connectedInCategory", { count: connectedInCategory })}</span>
                        )}
                        {connectedInCategory > 0 && availableInCategory > 0 ? ' • ' : ''}
                        {availableInCategory > 0 && (
                          <span>{t("integrationsPage.availableInCategory", { count: availableInCategory })}</span>
                        )}
                        {connectedInCategory === 0 && availableInCategory === 0 ? t("integrationsPage.comingSoonLabel") : null}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {catTools.map((tool) => {
                      const Icon = tool.icon;
                      const connectionStatus = getToolConnectionStatus(tool.id, tool.category);
                      const isConnected = connectionStatus === "connected";
                      const isAvailable = connectionStatus === "available";

                      return (
                        <Card key={tool.id} className={`transition-all ${
                          isConnected ? "border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent hover:border-green-500/50"
                          : isAvailable ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40"
                          : "opacity-60"
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2.5 rounded-lg ${isConnected ? 'bg-green-500/15' : isAvailable ? 'bg-primary/15' : 'bg-muted'}`}>
                                <Icon className={`w-5 h-5 ${isConnected ? 'text-green-600' : isAvailable ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{tool.name}</h3>
                                  <Badge variant={isConnected ? "success" : isAvailable ? "outline" : "secondary"} className="text-xs">
                                    {isConnected ? (<><CheckCircle2 className="w-3 h-3 mr-1" /> {t("integrationsPage.activeStatus")}</>)
                                    : isAvailable ? (<><Unlock className="w-3 h-3 mr-1" /> {t("integrationsPage.availableStatus")}</>)
                                    : (<><Clock className="w-3 h-3 mr-1" /> {t("integrationsPage.soonStatus")}</>)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {tool.capabilities.slice(0, 3).map((cap, idx) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cap}</span>
                                  ))}
                                  {tool.capabilities.length > 3 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                      {t("integrationsPage.moreCapabilities", { count: tool.capabilities.length - 3 })}
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
