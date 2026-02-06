import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { LayoutDashboard, Bot, Search, CheckCircle, FileBarChart, ArrowRight, Sparkles } from "lucide-react";

interface NavigationSection {
  id: string;
  path: string;
  icon: React.ElementType;
  emoji: string;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  featuresKey: string;
  color: string;
  isNew?: boolean;
}

const SECTIONS: NavigationSection[] = [
  { id: "dashboard", path: "/dashboard", icon: LayoutDashboard, emoji: "📊", titleKey: "cockpit.navDashboardTitle", subtitleKey: "cockpit.navDashboardSubtitle", descriptionKey: "cockpit.navDashboardDesc", featuresKey: "cockpit.navDashboardFeatures", color: "from-violet-500 to-purple-600" },
  { id: "agents", path: "/dashboard/agents", icon: Bot, emoji: "🤖", titleKey: "cockpit.navAgentsTitle", subtitleKey: "cockpit.navAgentsSubtitle", descriptionKey: "cockpit.navAgentsDesc", featuresKey: "cockpit.navAgentsFeatures", color: "from-emerald-500 to-teal-600" },
  { id: "research", path: "/dashboard/research", icon: Search, emoji: "🔍", titleKey: "cockpit.navResearchTitle", subtitleKey: "cockpit.navResearchSubtitle", descriptionKey: "cockpit.navResearchDesc", featuresKey: "cockpit.navResearchFeatures", color: "from-blue-500 to-cyan-600" },
  { id: "approvals", path: "/dashboard/approvals", icon: CheckCircle, emoji: "✓", titleKey: "cockpit.navApprovalsTitle", subtitleKey: "cockpit.navApprovalsSubtitle", descriptionKey: "cockpit.navApprovalsDesc", featuresKey: "cockpit.navApprovalsFeatures", color: "from-amber-500 to-orange-600" },
  { id: "reports", path: "/dashboard/reports", icon: FileBarChart, emoji: "📊", titleKey: "cockpit.navReportsTitle", subtitleKey: "cockpit.navReportsSubtitle", descriptionKey: "cockpit.navReportsDesc", featuresKey: "cockpit.navReportsFeatures", color: "from-pink-500 to-rose-600" },
];

export function NavigationHelper() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t("cockpit.navQuickNav")}</h3>
      </div>
      
      <div className="grid gap-3">
        {SECTIONS.map((section) => (
          <Link key={section.id} to={section.path}>
            <Card className="group hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0", section.color)}>
                    <span className="text-2xl">{section.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{t(section.titleKey)}</h4>
                      <Badge variant="secondary" className="text-[10px]">{t(section.subtitleKey)}</Badge>
                      {section.isNew && <Badge variant="gradient" className="text-[10px]">{t("cockpit.navNew")}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{t(section.descriptionKey)}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t(section.featuresKey).split(',').map((feature) => (
                        <span key={feature} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{feature}</span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function NavigationHelperCompact() {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {SECTIONS.map((section) => (
        <Link key={section.id} to={section.path}>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
            <span className="text-lg">{section.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t(section.titleKey)}</p>
              <p className="text-xs text-muted-foreground truncate">{t(section.subtitleKey)}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      ))}
    </div>
  );
}
