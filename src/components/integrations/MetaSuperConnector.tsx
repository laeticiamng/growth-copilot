import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Target, 
  Instagram, 
  MessageCircle, 
  Webhook,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useMeta } from "@/hooks/useMeta";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MetaModuleCard } from "./MetaModuleCard";

interface MetaSuperConnectorProps {
  onConnect?: () => void;
  isConnected?: boolean;
}

export function MetaSuperConnector({ onConnect, isConnected = false }: MetaSuperConnectorProps) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { moduleStatus, syncAds, syncInstagram, loading } = useMeta();
  const [connecting, setConnecting] = useState(false);
  const [syncingAds, setSyncingAds] = useState(false);
  const [syncingIG, setSyncingIG] = useState(false);

  const handleConnect = async () => {
    if (!currentSite || !currentWorkspace) {
      toast.error("Sélectionnez d'abord un site");
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-init", {
        body: {
          workspace_id: currentWorkspace.id,
          provider: "meta",
          redirect_url: window.location.href,
        },
      });

      if (error) throw error;

      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        toast.error(data.error || "Erreur OAuth");
      }
    } catch (error) {
      console.error("OAuth init error:", error);
      toast.error("Erreur lors de l'initialisation OAuth");
    } finally {
      setConnecting(false);
    }
  };

  const handleSyncAds = async () => {
    setSyncingAds(true);
    const result = await syncAds();
    if (!result.success && result.error) {
      toast.error(result.error);
    }
    setSyncingAds(false);
  };

  const handleSyncIG = async () => {
    setSyncingIG(true);
    const result = await syncInstagram();
    if (!result.success && result.error) {
      toast.error(result.error);
    }
    setSyncingIG(false);
  };

  const anyConnected = 
    moduleStatus.ads.connected || 
    moduleStatus.instagram.connected || 
    moduleStatus.messaging.connected;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg">Meta Super-Connecteur</CardTitle>
              <CardDescription>5 modules : Ads, CAPI, Instagram, Messaging, Webhooks</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {anyConnected && (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Actif
              </Badge>
            )}
            <Button
              variant={anyConnected ? "outline" : "default"}
              size="sm"
              onClick={handleConnect}
              disabled={connecting || !currentSite}
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : anyConnected ? (
                "Reconnecter"
              ) : (
                <>
                  Connecter
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
            <p className="font-medium text-foreground mb-1">Architecture Progressive Enhancement</p>
            <p>Mode connecté → automatisation complète. Mode déconnecté → export et recommandations.</p>
            <p className="mt-1">Toutes les actions d'écriture passent par l'Approval Center.</p>
          </div>
        </div>

        {/* 5 Modules Grid */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Marketing API + Insights */}
          <MetaModuleCard
            title="Meta Ads"
            description="Marketing API + Insights (campagnes, adsets, reporting)"
            icon={Megaphone}
            status={moduleStatus.ads.connected ? "connected" : "disconnected"}
            lastSync={moduleStatus.ads.lastSync}
            stats={moduleStatus.ads.connected ? [
              { label: "Comptes", value: moduleStatus.ads.accountCount },
            ] : undefined}
            onSync={handleSyncAds}
            syncing={syncingAds}
          />

          {/* 2. Conversions API */}
          <MetaModuleCard
            title="Conversions API"
            description="Tracking server-side (CAPI) pour les événements"
            icon={Target}
            status={moduleStatus.capi.configured ? "configured" : "disconnected"}
            stats={moduleStatus.capi.configured ? [
              { label: "Events 24h", value: moduleStatus.capi.eventsToday },
            ] : undefined}
          />

          {/* 3. Instagram Platform */}
          <MetaModuleCard
            title="Instagram"
            description="Content Publishing + Insights média/stories"
            icon={Instagram}
            status={moduleStatus.instagram.connected ? "connected" : "disconnected"}
            lastSync={moduleStatus.instagram.lastSync}
            stats={moduleStatus.instagram.connected ? [
              { label: "Comptes", value: moduleStatus.instagram.accountCount },
            ] : undefined}
            onSync={handleSyncIG}
            syncing={syncingIG}
            note="Publishing dépend des permissions (Business vs Creator)"
          />

          {/* 4. Business Messaging */}
          <MetaModuleCard
            title="Messaging"
            description="Messenger + WhatsApp + Instagram DM"
            icon={MessageCircle}
            status={moduleStatus.messaging.connected ? "connected" : "coming_soon"}
            stats={moduleStatus.messaging.connected ? [
              { label: "Conversations", value: moduleStatus.messaging.conversationCount },
              { label: "Non lus", value: moduleStatus.messaging.unreadCount },
            ] : undefined}
            note="WhatsApp Cloud API nécessite configuration supplémentaire"
          />

          {/* 5. Webhooks */}
          <MetaModuleCard
            title="Webhooks"
            description="Events temps réel (leads, messages, commentaires)"
            icon={Webhook}
            status={moduleStatus.webhooks.configured ? "configured" : "disconnected"}
            stats={moduleStatus.webhooks.configured ? [
              { label: "Events 24h", value: moduleStatus.webhooks.eventsToday },
            ] : undefined}
          />
        </div>

        {/* Webhook URL info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border">
          <span className="font-medium">Webhook URL:</span>{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            https://goiklfzouhshghsvpxjo.supabase.co/functions/v1/meta-webhooks
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
