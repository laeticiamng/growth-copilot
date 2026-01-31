import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Target,
  TrendingUp,
  Mail,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "SEO Technique & Contenu",
    description: "Audit complet, corrections automatiques, mots-clés, briefs, et production de contenu optimisé.",
    badge: "SEO",
    color: "text-chart-1",
  },
  {
    icon: MapPin,
    title: "Local SEO",
    description: "Optimisation Google Business Profile, posts, avis clients, et suivi de performance locale.",
    badge: "Local",
    color: "text-chart-2",
  },
  {
    icon: Target,
    title: "Google Ads Intelligent",
    description: "Campagnes Search optimisées, RSA, négatifs automatiques, avec garde-fous budget stricts.",
    badge: "Ads",
    color: "text-chart-3",
  },
  {
    icon: TrendingUp,
    title: "CRO & Conversion",
    description: "Audit pages clés, scoring friction, variantes A/B, et backlog d'optimisation priorisé.",
    badge: "CRO",
    color: "text-chart-4",
  },
  {
    icon: Mail,
    title: "Lifecycle & Nurturing",
    description: "Workflows email/SMS automatisés, scoring leads, et pipeline de vente intégré.",
    badge: "Email",
    color: "text-chart-5",
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    description: "Dashboard temps réel, rapports PDF mensuels, journal des actions, et preuves de ROI.",
    badge: "Data",
    color: "text-chart-1",
  },
  {
    icon: Users,
    title: "Social & Distribution",
    description: "Calendrier social, repurpose contenu, tracking UTM, et analyse performance.",
    badge: "Social",
    color: "text-chart-2",
  },
  {
    icon: Zap,
    title: "Agents IA Autonomes",
    description: "12 agents spécialisés orchestrés par un directeur, avec vérification qualité systématique.",
    badge: "IA",
    color: "text-chart-3",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Tout ce qu'il faut pour{" "}
            <span className="gradient-text">scaler ta croissance</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Une plateforme complète qui automatise l'acquisition, la conversion, les ventes et la rétention.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="feature"
              className="group fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-secondary ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
