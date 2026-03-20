import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Briefcase, BarChart3, Shield, Puzzle,
  Code, HeadphonesIcon, Settings, ArrowRight, CheckCircle2,
  Building2, Users, Scale
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: "marketing", icon: TrendingUp, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "sales", icon: Briefcase, color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "finance", icon: BarChart3, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { id: "security", icon: Shield, color: "text-red-500", bgColor: "bg-red-500/10" },
  { id: "product", icon: Puzzle, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "engineering", icon: Code, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { id: "data", icon: BarChart3, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  { id: "support", icon: HeadphonesIcon, color: "text-pink-500", bgColor: "bg-pink-500/10" },
  { id: "governance", icon: Settings, color: "text-gray-500", bgColor: "bg-gray-500/10" },
  { id: "hr", icon: Users, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  { id: "legal", icon: Scale, color: "text-slate-500", bgColor: "bg-slate-500/10" },
];

export function Services() {
  const { t } = useTranslation();

  return (
    <section id="departments" className="py-24 bg-background relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            <Building2 className="w-3 h-3 mr-1" />
            {t("landing.services.badge")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("landing.services.title")}</h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {MODULES.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.id} variant="feature" className="group fade-in-up hover:border-primary/30 transition-all" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", mod.bgColor)}>
                      <Icon className={cn("w-6 h-6", mod.color)} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {t("landing.services.ai")}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {t(`landing.services.depts.${mod.id}.name`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t(`landing.services.depts.${mod.id}.desc`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card variant="gradient" className="max-w-3xl mx-auto border-2 border-primary/20 mb-12">
          <CardContent className="p-6 text-center">
            <Badge variant="gradient" className="mb-4">{t("landing.services.alwaysIncluded")}</Badge>
            <h3 className="text-xl font-bold mb-2">Core OS</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("landing.services.coreOSDesc")}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {["workspace", "rbac", "approvals", "auditLog", "scheduler", "integrations"].map((key) => (
                <span key={key} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" />{t(`landing.services.coreFeatures.${key}`)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/auth?tab=signup">
            <Button variant="hero" size="lg">
              {t("landing.services.buildPackage")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
