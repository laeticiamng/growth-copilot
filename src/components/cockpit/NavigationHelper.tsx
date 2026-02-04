import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Search,
  CheckCircle,
  FileBarChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface NavigationSection {
  id: string;
  path: string;
  icon: React.ElementType;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  color: string;
  isNew?: boolean;
}

const SECTIONS: NavigationSection[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    emoji: "📊",
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble",
    description: "Votre centre de commande. Voyez en un coup d'œil la santé de votre entreprise, les actions prioritaires et les performances de votre équipe IA.",
    features: ["Score de santé", "Actions prioritaires", "KPIs temps réel", "Alertes intelligentes"],
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "agents",
    path: "/dashboard/agents",
    icon: Bot,
    emoji: "🤖",
    title: "Mon équipe IA",
    subtitle: "39 experts virtuels",
    description: "Votre équipe complète d'agents IA organisée en 11 départements. Chaque agent est spécialisé et travaille 24h/24 pour développer votre entreprise.",
    features: ["Organigramme", "Performance agents", "Historique actions", "Capacités"],
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "research",
    path: "/dashboard/research",
    icon: Search,
    emoji: "🔍",
    title: "Intelligence",
    subtitle: "Veille stratégique",
    description: "Recherche IA en temps réel pour surveiller vos concurrents, identifier les tendances de marché et découvrir de nouvelles opportunités.",
    features: ["Veille concurrentielle", "Tendances marché", "Opportunités", "Sources vérifiées"],
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "approvals",
    path: "/dashboard/approvals",
    icon: CheckCircle,
    emoji: "✓",
    title: "À valider",
    subtitle: "Contrôle humain",
    description: "Restez maître des décisions importantes. Approuvez ou refusez les actions proposées par vos agents avant leur exécution.",
    features: ["Actions en attente", "Historique décisions", "Mode Autopilot", "Niveau de risque"],
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "reports",
    path: "/dashboard/reports",
    icon: FileBarChart,
    emoji: "📊",
    title: "Rapports",
    subtitle: "Analyse & Export",
    description: "Générez des rapports PDF professionnels, suivez l'évolution de vos KPIs et consultez l'historique complet des actions de vos agents.",
    features: ["Rapports PDF", "Comparaison périodes", "Audit trail", "Planification auto"],
    color: "from-pink-500 to-rose-600",
  },
];

export function NavigationHelper() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Navigation rapide</h3>
      </div>
      
      <div className="grid gap-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} to={section.path}>
              <Card className="group hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                      section.color
                    )}>
                      <span className="text-2xl">{section.emoji}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{section.title}</h4>
                        <Badge variant="secondary" className="text-[10px]">
                          {section.subtitle}
                        </Badge>
                        {section.isNew && (
                          <Badge variant="gradient" className="text-[10px]">Nouveau</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {section.description}
                      </p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {section.features.map((feature) => (
                          <span key={feature} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for sidebar
export function NavigationHelperCompact() {
  return (
    <div className="space-y-2">
      {SECTIONS.map((section) => (
        <Link key={section.id} to={section.path}>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
            <span className="text-lg">{section.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{section.title}</p>
              <p className="text-xs text-muted-foreground truncate">{section.subtitle}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      ))}
    </div>
  );
}
