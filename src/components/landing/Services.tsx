import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Briefcase, BarChart3, Shield, Puzzle, 
  Code, HeadphonesIcon, Settings, ArrowRight, CheckCircle2,
  Building2, Bot, Users, Scale
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  { id: "marketing", icon: TrendingUp, color: "text-blue-500", bgColor: "bg-blue-500/10", employees: 5 },
  { id: "sales", icon: Briefcase, color: "text-green-500", bgColor: "bg-green-500/10", employees: 4 },
  { id: "finance", icon: BarChart3, color: "text-yellow-500", bgColor: "bg-yellow-500/10", employees: 3 },
  { id: "security", icon: Shield, color: "text-red-500", bgColor: "bg-red-500/10", employees: 3 },
  { id: "product", icon: Puzzle, color: "text-purple-500", bgColor: "bg-purple-500/10", employees: 4 },
  { id: "engineering", icon: Code, color: "text-orange-500", bgColor: "bg-orange-500/10", employees: 5 },
  { id: "data", icon: BarChart3, color: "text-cyan-500", bgColor: "bg-cyan-500/10", employees: 4 },
  { id: "support", icon: HeadphonesIcon, color: "text-pink-500", bgColor: "bg-pink-500/10", employees: 3 },
  { id: "governance", icon: Settings, color: "text-gray-500", bgColor: "bg-gray-500/10", employees: 3 },
  { id: "hr", icon: Users, color: "text-indigo-500", bgColor: "bg-indigo-500/10", employees: 2 },
  { id: "legal", icon: Scale, color: "text-slate-500", bgColor: "bg-slate-500/10", employees: 1 },
];

const PRICE_PER_DEPT = 1900;
const FULL_COMPANY_PRICE = 9000;
const DEPT_EMPLOYEES = DEPARTMENTS.reduce((sum, d) => sum + d.employees, 0);
const TOTAL_EMPLOYEES = DEPT_EMPLOYEES + 2;

export function Services() {
  const { t } = useTranslation();

  const totalSeparatePrice = DEPARTMENTS.length * PRICE_PER_DEPT;
  const savings = totalSeparatePrice - FULL_COMPANY_PRICE;

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
            {t("landing.services.subtitle", { total: TOTAL_EMPLOYEES, depts: DEPARTMENTS.length })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {DEPARTMENTS.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <Card key={dept.id} variant="feature" className="group fade-in-up hover:border-primary/30 transition-all" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", dept.bgColor)}>
                      <Icon className={cn("w-6 h-6", dept.color)} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      {dept.employees} {t("landing.services.ai")}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {t(`landing.services.depts.${dept.id}.name`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t(`landing.services.depts.${dept.id}.desc`)}
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

        <div className="max-w-2xl mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4 text-center">
            <Card variant="feature" className="p-6">
              <p className="text-3xl font-bold">{PRICE_PER_DEPT.toLocaleString()}€</p>
              <p className="text-sm text-muted-foreground">{t("landing.services.perDeptMonth")}</p>
            </Card>
            <Card variant="gradient" className="p-6 border-primary/30">
              <p className="text-3xl font-bold gradient-text">{FULL_COMPANY_PRICE.toLocaleString()}€</p>
              <p className="text-sm text-muted-foreground">{t("landing.services.fullCompanyMonth")}</p>
              <Badge variant="outline" className="mt-2 text-xs text-green-600">
                {t("landing.services.save", { amount: savings.toLocaleString() })}
              </Badge>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Link to="/onboarding">
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
