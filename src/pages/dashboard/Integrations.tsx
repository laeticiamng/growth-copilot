import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import { useSites } from "@/hooks/useSites";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "disconnected" | "pending";
  category: "analytics" | "ads" | "local" | "social" | "cms" | "crm";
  required?: boolean;
}

const integrations: Integration[] = [
  // Analytics
  { id: "gsc", name: "Google Search Console", description: "Données SEO officielles et positionnement", icon: Search, status: "disconnected", category: "analytics", required: true },
  { id: "ga4", name: "Google Analytics 4", description: "Tracking et conversions", icon: BarChart3, status: "disconnected", category: "analytics", required: true },
  
  // Ads
  { id: "gads", name: "Google Ads", description: "Campagnes publicitaires Search & Display", icon: Megaphone, status: "disconnected", category: "ads" },
  
  // Local
  { id: "gbp", name: "Google Business Profile", description: "Fiche locale, avis et posts", icon: MapPin, status: "disconnected", category: "local" },
  
  // Social
  { id: "meta", name: "Meta (Facebook/Instagram)", description: "Social media et publicités", icon: Instagram, status: "disconnected", category: "social" },
  
  // CMS
  { id: "wordpress", name: "WordPress", description: "Modifications et corrections automatiques", icon: FileCode, status: "disconnected", category: "cms" },
  { id: "shopify", name: "Shopify", description: "Optimisation e-commerce", icon: ShoppingCart, status: "disconnected", category: "cms" },
  { id: "webflow", name: "Webflow", description: "Design et contenu", icon: Palette, status: "disconnected", category: "cms" },
  
  // CRM
  { id: "email", name: "Email Provider", description: "Sendgrid, Mailchimp, Brevo...", icon: Mail, status: "disconnected", category: "crm" },
  { id: "calendar", name: "Calendrier", description: "Google Calendar, Calendly...", icon: Calendar, status: "disconnected", category: "crm" },
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
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo: toggle connection status
    setLocalIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: i.status === "connected" ? "disconnected" : "connected" as const }
        : i
    ));
    
    setConnecting(null);
  };

  const groupedIntegrations = localIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = [];
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const connectedCount = localIntegrations.filter(i => i.status === "connected").length;

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
        <Badge variant={connectedCount > 0 ? "success" : "secondary"}>
          {connectedCount}/{localIntegrations.length} connectées
        </Badge>
      </div>

      {/* Demo Mode Alert */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Mode Démonstration</p>
            <p className="text-sm text-muted-foreground">
              Les connexions OAuth sont simulées. En production, vous serez redirigé vers les services pour autoriser l'accès.
            </p>
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
                const isConnecting = connecting === integration.id;
                
                return (
                  <Card 
                    key={integration.id} 
                    variant={isConnected ? "gradient" : "feature"}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${isConnected ? 'bg-primary/20' : 'bg-secondary'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{integration.name}</h3>
                            {integration.required && (
                              <Badge variant="outline" className="text-xs">Recommandé</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {integration.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={isConnected ? "success" : "secondary"}
                              className="text-xs"
                            >
                              {isConnected ? (
                                <><Check className="w-3 h-3 mr-1" /> Connecté</>
                              ) : (
                                <><X className="w-3 h-3 mr-1" /> Non connecté</>
                              )}
                            </Badge>
                            <Button 
                              variant={isConnected ? "outline" : "default"} 
                              size="sm"
                              onClick={() => handleConnect(integration.id)}
                              disabled={isConnecting || !currentSite}
                            >
                              {isConnecting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
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
