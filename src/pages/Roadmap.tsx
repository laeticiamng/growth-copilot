import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Rocket, Clock, CheckCircle2, Circle, Vote, Calendar, Tag, MessageSquare } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

type Status = "done" | "in_progress" | "planned" | "considering";

interface RoadmapItem {
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  status: Status;
  quarter?: string;
  votes?: number;
  tags?: string[];
}

export default function Roadmap() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
    done: { label: isEn ? "Completed" : "Terminé", color: "bg-green-500", icon: CheckCircle2 },
    in_progress: { label: isEn ? "In progress" : "En cours", color: "bg-blue-500", icon: Clock },
    planned: { label: isEn ? "Planned" : "Planifié", color: "bg-yellow-500", icon: Circle },
    considering: { label: isEn ? "Under review" : "À l'étude", color: "bg-gray-400", icon: Vote },
  };

  const ROADMAP_ITEMS: Record<string, RoadmapItem[]> = {
    "Q1 2026": [
      { titleFr: "Evidence Bundles", titleEn: "Evidence Bundles", descriptionFr: "Traçabilité complète des décisions IA", descriptionEn: "Complete traceability of AI decisions", status: "done", tags: ["Core OS"] },
      { titleFr: "Voice Commands", titleEn: "Voice Commands", descriptionFr: "Contrôle vocal via ElevenLabs", descriptionEn: "Voice control via ElevenLabs", status: "done", tags: ["UX"] },
      { titleFr: "HR & Legal Modules", titleEn: "HR & Legal Modules", descriptionFr: "Nouveaux départements RH et Juridique", descriptionEn: "New HR and Legal departments", status: "done", tags: [isEn ? "Product" : "Produit"] },
      { titleFr: "Service Catalog", titleEn: "Service Catalog", descriptionFr: "Documentation détaillée par département", descriptionEn: "Detailed documentation per department", status: "done", tags: [isEn ? "Product" : "Produit"] },
      { titleFr: "Mode Démo", titleEn: "Demo Mode", descriptionFr: "Toggle démo/production avec watermark", descriptionEn: "Demo/production toggle with watermark", status: "done", tags: ["UX"] },
      { titleFr: "Dashboard Coûts IA", titleEn: "AI Cost Dashboard", descriptionFr: "Suivi en temps réel des dépenses IA", descriptionEn: "Real-time AI cost tracking", status: "done", tags: ["Ops"] },
    ],
    "Q2 2026": [
      { titleFr: "Salesforce Integration", titleEn: "Salesforce Integration", descriptionFr: "Sync bidirectionnel CRM", descriptionEn: "Bidirectional CRM sync", status: "planned", tags: [isEn ? "Integration" : "Intégration"], votes: 45 },
      { titleFr: "HubSpot Integration", titleEn: "HubSpot Integration", descriptionFr: "Marketing automation sync", descriptionEn: "Marketing automation sync", status: "planned", tags: [isEn ? "Integration" : "Intégration"], votes: 38 },
      { titleFr: "Slack Notifications", titleEn: "Slack Notifications", descriptionFr: "Alertes et commandes Slack", descriptionEn: "Slack alerts and commands", status: "in_progress", tags: [isEn ? "Integration" : "Intégration"], votes: 67 },
      { titleFr: "Mobile App (PWA)", titleEn: "Mobile App (PWA)", descriptionFr: "Application mobile responsive", descriptionEn: "Responsive mobile application", status: "planned", tags: ["UX"], votes: 89 },
      { titleFr: "Multi-Factor Auth", titleEn: "Multi-Factor Auth", descriptionFr: "2FA pour sécurité renforcée", descriptionEn: "2FA for enhanced security", status: "planned", tags: [isEn ? "Security" : "Sécurité"], votes: 52 },
      { titleFr: "API v2", titleEn: "API v2", descriptionFr: "API REST publique documentée", descriptionEn: "Documented public REST API", status: "in_progress", tags: [isEn ? "Product" : "Produit"], votes: 34 },
    ],
    "Q3 2026": [
      { titleFr: "Shopify Integration", titleEn: "Shopify Integration", descriptionFr: "E-commerce analytics et automation", descriptionEn: "E-commerce analytics and automation", status: "planned", tags: [isEn ? "Integration" : "Intégration"], votes: 23 },
      { titleFr: "Custom Dashboards", titleEn: "Custom Dashboards", descriptionFr: "Créez vos propres tableaux de bord", descriptionEn: "Create your own dashboards", status: "planned", tags: ["UX"], votes: 56 },
      { titleFr: "White Label", titleEn: "White Label", descriptionFr: "Personnalisation marque pour agences", descriptionEn: "Brand customization for agencies", status: "considering", tags: [isEn ? "Product" : "Produit"], votes: 41 },
      { titleFr: "AI Training", titleEn: "AI Training", descriptionFr: "Entraînement sur vos données", descriptionEn: "Training on your data", status: "considering", tags: [isEn ? "AI" : "IA"], votes: 78 },
    ],
    "Future": [
      { titleFr: "LinkedIn Integration", titleEn: "LinkedIn Integration", descriptionFr: "Gestion posts et analytics LinkedIn", descriptionEn: "LinkedIn posts and analytics management", status: "considering", tags: [isEn ? "Integration" : "Intégration"], votes: 112 },
      { titleFr: "TikTok Ads", titleEn: "TikTok Ads", descriptionFr: "Gestion campagnes TikTok", descriptionEn: "TikTok campaign management", status: "considering", tags: [isEn ? "Integration" : "Intégration"], votes: 67 },
      { titleFr: "Self-Hosted Version", titleEn: "Self-Hosted Version", descriptionFr: "Déploiement on-premise", descriptionEn: "On-premise deployment", status: "considering", tags: [isEn ? "Product" : "Produit"], votes: 34 },
      { titleFr: "SOC 2 Compliance", titleEn: "SOC 2 Compliance", descriptionFr: "Certification sécurité", descriptionEn: "Security certification", status: "planned", tags: [isEn ? "Security" : "Sécurité"], votes: 29 },
    ],
  };

  // Translations
  const txt = {
    backToHome: isEn ? "Back to home" : "Retour à l'accueil",
    publicRoadmap: isEn ? "Public Roadmap" : "Roadmap Publique",
    subtitle: isEn 
      ? "Discover what's coming to Growth OS and vote for your favorite features."
      : "Découvrez ce qui arrive sur Growth OS et votez pour vos fonctionnalités préférées.",
    completed: isEn ? "Completed" : "Terminés",
    inProgress: isEn ? "In progress" : "En cours",
    planned: isEn ? "Planned" : "Planifiés",
    total: "Total",
    haveIdea: isEn ? "Have an idea?" : "Vous avez une idée ?",
    suggestFeature: isEn 
      ? "Suggest a feature and vote for the ones that interest you."
      : "Proposez une fonctionnalité et votez pour celles qui vous intéressent.",
    suggestIdea: isEn ? "Suggest an idea" : "Proposer une idée",
    implementationStatus: isEn ? "Implementation status" : "Statut d'implémentation",
    seoTitle: isEn ? "Roadmap" : "Roadmap",
    seoDescription: isEn 
      ? "Discover Growth OS public roadmap: upcoming features, integrations, and improvements. Vote for your favorites!"
      : "Découvrez la roadmap publique de Growth OS : fonctionnalités à venir, intégrations et améliorations. Votez pour vos préférées !",
  };

  function StatusBadge({ status }: { status: Status }) {
    const config = STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  }

  const allItems = Object.values(ROADMAP_ITEMS).flat();
  const doneCount = allItems.filter(i => i.status === "done").length;
  const inProgressCount = allItems.filter(i => i.status === "in_progress").length;
  const plannedCount = allItems.filter(i => i.status === "planned").length;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={txt.seoTitle}
        description={txt.seoDescription}
        canonical="/roadmap"
      />
      <div className="container max-w-5xl py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {txt.backToHome}
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
            <Rocket className="w-10 h-10 text-primary" />
            {txt.publicRoadmap}
          </h1>
          <p className="text-xl text-muted-foreground">
            {txt.subtitle}
          </p>
        </header>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">{doneCount}</p>
              <p className="text-sm text-muted-foreground">{txt.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">{txt.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">{plannedCount}</p>
              <p className="text-sm text-muted-foreground">{txt.planned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{allItems.length}</p>
              <p className="text-sm text-muted-foreground">{txt.total}</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(ROADMAP_ITEMS).map(([quarter, items]) => (
            <Card key={quarter}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {quarter}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(items.filter(i => i.status === "done").length / items.length) * 100} 
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {items.filter(i => i.status === "done").length}/{items.length}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border ${
                        item.status === "done" ? "bg-green-500/5 border-green-500/20" : 
                        item.status === "in_progress" ? "bg-blue-500/5 border-blue-500/20" : 
                        "bg-secondary/50 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{isEn ? item.titleEn : item.titleFr}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isEn ? item.descriptionEn : item.descriptionFr}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {item.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="w-2.5 h-2.5 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {item.votes && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Vote className="w-3.5 h-3.5" />
                            {item.votes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{txt.haveIdea}</h3>
                <p className="text-sm text-muted-foreground">
                  {txt.suggestFeature}
                </p>
              </div>
              <Button variant="hero" asChild>
                <Link to="/contact">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {txt.suggestIdea}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <a href="https://github.com/your-org/growth-os/releases" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            GitHub Releases
          </a>
          <span className="text-muted-foreground">•</span>
          <Link to="/dashboard/status" className="text-primary hover:underline">
            {txt.implementationStatus}
          </Link>
        </div>
      </div>
    </div>
  );
}
