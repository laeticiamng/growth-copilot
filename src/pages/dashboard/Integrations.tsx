import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface PlatformTool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "coming_soon";
  category: "google" | "meta" | "cms" | "crm";
  capabilities: string[];
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
  },
  { 
    id: "gsc", 
    name: "Google Search Console", 
    description: "Positions SEO, clics et impressions organiques", 
    icon: Search, 
    status: "active", 
    category: "google",
    capabilities: ["Positions mots-clés", "CTR organique", "Pages indexées", "Erreurs techniques"],
  },
  { 
    id: "gads", 
    name: "Google Ads", 
    description: "Analyse des campagnes publicitaires Search & Display", 
    icon: Megaphone, 
    status: "active", 
    category: "google",
    capabilities: ["CPC & ROAS", "Quality Score", "Conversions", "Budgets"],
  },
  { 
    id: "gbp", 
    name: "Google Business Profile", 
    description: "Visibilité locale, avis clients et fiches établissements", 
    icon: MapPin, 
    status: "active", 
    category: "google",
    capabilities: ["Note moyenne", "Nombre d'avis", "Vues fiche", "Posts GBP"],
  },
  { 
    id: "youtube", 
    name: "YouTube Analytics", 
    description: "Performance vidéo et analytics de chaîne", 
    icon: Youtube, 
    status: "active", 
    category: "google",
    capabilities: ["Vues & durée", "Abonnés", "Engagement", "Sources de trafic"],
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
  },
  { 
    id: "instagram", 
    name: "Instagram Insights", 
    description: "Analytics du compte Instagram et engagement", 
    icon: Instagram, 
    status: "active", 
    category: "meta",
    capabilities: ["Followers", "Engagement rate", "Reach posts", "Stories"],
  },
  { 
    id: "messenger", 
    name: "Messaging Insights", 
    description: "Analytics Messenger & WhatsApp Business", 
    icon: MessageCircle, 
    status: "active", 
    category: "meta",
    capabilities: ["Temps de réponse", "Conversations", "Satisfaction", "Automatisations"],
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
  const groupedTools = platformTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, PlatformTool[]>);

  const activeCount = platformTools.filter(t => t.status === "active").length;
  const comingSoonCount = platformTools.filter(t => t.status === "coming_soon").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outils d'Analyse</h1>
          <p className="text-muted-foreground">
            Nos outils internes analysent automatiquement votre site et vos performances.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="gap-1">
            <Zap className="w-3 h-3" />
            {activeCount} actifs
          </Badge>
          <Badge variant="secondary">
            {comingSoonCount} à venir
          </Badge>
        </div>
      </div>

      {/* How it works */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="flex items-start gap-4 py-5">
          <div className="p-2.5 rounded-xl bg-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Comment ça fonctionne ?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Entrez simplement l'URL de votre site. Nos outils analysent automatiquement vos données publiques 
              et génèrent des recommandations personnalisées. <strong>Aucune connexion de votre part n'est requise.</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-background">
                <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                Analyse automatique
              </Badge>
              <Badge variant="outline" className="bg-background">
                <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                Données en temps réel
              </Badge>
              <Badge variant="outline" className="bg-background">
                <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                Recommandations IA
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Categories */}
      <div className="space-y-8">
        {Object.entries(groupedTools).map(([category, tools]) => {
          const config = categoryConfig[category];
          const CategoryIcon = config.icon;
          const activeInCategory = tools.filter(t => t.status === "active").length;
          
          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{config.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeInCategory} outil{activeInCategory > 1 ? 's' : ''} actif{activeInCategory > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = tool.status === "active";
                  
                  return (
                    <Card 
                      key={tool.id} 
                      className={`transition-all ${
                        isActive 
                          ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40" 
                          : "opacity-60"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${
                            isActive ? 'bg-primary/15' : 'bg-muted'
                          }`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{tool.name}</h3>
                              <Badge 
                                variant={isActive ? "success" : "outline"} 
                                className="text-xs"
                              >
                                {isActive ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</>
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
    </div>
  );
};

export default Integrations;
