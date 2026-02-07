import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, ArrowRight, Crown, Puzzle, TrendingUp, Briefcase, BarChart3, 
  Shield, Code, HeadphonesIcon, Settings, Sparkles, Users, Bot
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { TFunction } from "i18next";

const MODULE_META = [
  { id: "marketing", icon: TrendingUp, price: "1 900", color: "text-blue-500", employees: 5, roleKeys: ["marketingDirector", "seoStrategist", "contentManager", "adsOptimizer", "socialMediaManager"] },
  { id: "sales", icon: Briefcase, price: "1 900", color: "text-green-500", employees: 4, roleKeys: ["salesDirector", "leadQualifier", "salesCloser", "accountManager"] },
  { id: "finance", icon: BarChart3, price: "1 900", color: "text-yellow-500", employees: 3, roleKeys: ["cfo", "analyticalAccountant", "managementController"] },
  { id: "security", icon: Shield, price: "1 900", color: "text-red-500", employees: 3, roleKeys: ["ciso", "complianceOfficer", "securityAuditor"] },
  { id: "product", icon: Puzzle, price: "1 900", color: "text-purple-500", employees: 4, roleKeys: ["cpo", "productManager", "uxResearcher", "productAnalyst"] },
  { id: "engineering", icon: Code, price: "1 900", color: "text-orange-500", employees: 5, roleKeys: ["cto", "leadDeveloper", "devopsEngineer", "qaSpecialist", "technicalWriter"] },
  { id: "data", icon: BarChart3, price: "1 900", color: "text-cyan-500", employees: 4, roleKeys: ["cdo", "dataEngineer", "dataAnalyst", "mlEngineer"] },
  { id: "support", icon: HeadphonesIcon, price: "1 900", color: "text-pink-500", employees: 3, roleKeys: ["headOfSupport", "customerSuccessManager", "technicalSupport"] },
  { id: "governance", icon: Settings, price: "1 900", color: "text-gray-500", employees: 3, roleKeys: ["chiefOfStaff", "projectManager", "operationsAnalyst"] },
  { id: "hr", icon: Users, price: "1 900", color: "text-indigo-500", employees: 2, roleKeys: ["hrDirector", "talentManager"] },
  { id: "legal", icon: Shield, price: "1 900", color: "text-slate-500", employees: 1, roleKeys: ["legalDirector"] },
] as const; // i18n-ready

function getServiceModules(t: TFunction) {
  return MODULE_META.map((m) => ({
    ...m,
    name: t(`landing.pricing.modules.${m.id}`),
    roles: m.roleKeys.map((k) => t(`landing.pricing.modules.${k}`)),
  }));
}

const DEPT_EMPLOYEES = MODULE_META.reduce((sum, s) => sum + s.employees, 0);
const TOTAL_EMPLOYEES = DEPT_EMPLOYEES + 2;
const TOTAL_DEPARTMENTS = MODULE_META.length;
const TOTAL_SEPARATE_PRICE = TOTAL_DEPARTMENTS * 1900;

export function Pricing() {
  const { t } = useTranslation();
  const serviceModules = getServiceModules(t);
  return (
    <section id="pricing" className="py-24 bg-secondary/30 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">{t("landing.navbar.pricing")}</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("landing.pricing.heading")}</h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.pricing.headingSubtitle", { total: TOTAL_EMPLOYEES, depts: TOTAL_DEPARTMENTS })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {/* Starter */}
          <Card variant="feature" className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge variant="secondary" className="px-3 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                {t("landing.pricing.trialBadge")}
              </Badge>
            </div>
            <CardHeader className="text-center pt-10 pb-2">
              <div className="mx-auto p-3 rounded-xl bg-green-500/10 w-fit mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Starter</CardTitle>
              <CardDescription className="text-base">{t("landing.pricing.starterDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <span className="text-5xl font-bold">490€</span>
                <span className="text-muted-foreground">/{t("landing.pricing.month")}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-sm"><Bot className="w-3 h-3 mr-1" />{TOTAL_DEPARTMENTS} {t("landing.pricing.aiEmployees")} (lite)</Badge>
                <Badge variant="outline" className="text-sm">{TOTAL_DEPARTMENTS} {t("landing.pricing.departments")} (lite)</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{t("landing.pricing.starterNote")}</p>
              <ul className="space-y-2 mb-8 text-left">
                {[
                  t("landing.pricing.starterF1", { depts: TOTAL_DEPARTMENTS }),
                  t("landing.pricing.starterF2"),
                  t("landing.pricing.starterF3"),
                  t("landing.pricing.starterF4"),
                  t("landing.pricing.starterF5"),
                  t("landing.pricing.starterF6"),
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Link to="/auth?tab=signup"><Button variant="outline" className="w-full" size="lg">{t("landing.pricing.starterCTA")}<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </CardContent>
          </Card>

          {/* Full Company */}
          <Card variant="gradient" className="relative border-2 border-primary/30 mt-4 lg:mt-0">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge variant="gradient" className="px-3 py-1 whitespace-nowrap text-xs">
                <Sparkles className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{t("landing.pricing.bestValue")}</span>
              </Badge>
            </div>
            <CardHeader className="text-center pt-10 pb-2">
              <div className="mx-auto p-3 rounded-xl bg-gradient-to-br from-primary to-accent w-fit mb-4"><Crown className="w-8 h-8 text-primary-foreground" /></div>
              <CardTitle className="text-2xl">Full Company</CardTitle>
              <CardDescription className="text-base">{t("landing.pricing.fullCompanyDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <span className="text-5xl font-bold">9 000€</span>
                <span className="text-muted-foreground">/{t("landing.pricing.month")}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-sm"><Users className="w-3 h-3 mr-1" />{TOTAL_EMPLOYEES} {t("landing.pricing.aiEmployees")}</Badge>
                <Badge variant="outline" className="text-sm">{TOTAL_DEPARTMENTS} {t("landing.pricing.departments")}</Badge>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mb-6">
                {t("landing.pricing.fullCompanySavings", { amount: (TOTAL_SEPARATE_PRICE - 9000).toLocaleString() })}
              </p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {serviceModules.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <Icon className={cn("w-4 h-4", s.color)} />
                      <span className="text-xs font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.employees} <Bot className="w-3 h-3 inline" /></span>
                    </div>
                  );
                })}
              </div>
              <ul className="space-y-2 mb-8 text-left">
                {[
                  t("landing.pricing.fullF1", { total: TOTAL_EMPLOYEES }),
                  t("landing.pricing.fullF2", { depts: TOTAL_DEPARTMENTS }),
                  t("landing.pricing.fullF3"),
                  t("landing.pricing.fullF4"),
                  t("landing.pricing.fullF5"),
                  t("landing.pricing.fullF6"),
                  t("landing.pricing.fullF7"),
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary flex-shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Link to="/auth?tab=signup"><Button variant="hero" className="w-full" size="lg">{t("landing.pricing.fullCTA")}<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </CardContent>
          </Card>

          {/* À la carte */}
          <Card variant="feature" className="relative">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-xl bg-secondary w-fit mb-4"><Puzzle className="w-8 h-8 text-muted-foreground" /></div>
              <CardTitle className="text-2xl">À la carte</CardTitle>
              <CardDescription className="text-base">{t("landing.pricing.aLaCarteDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <span className="text-5xl font-bold">1 900€</span>
                <span className="text-muted-foreground">/{t("landing.pricing.deptMonth")}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{t("landing.pricing.aLaCarteNote")}</p>
              <div className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-2">
                {serviceModules.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="group p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-lg bg-background", s.color)}><Icon className="w-4 h-4" /></div>
                          <div>
                            <span className="font-medium text-sm">{s.name}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Bot className="w-3 h-3" /><span>{s.employees} {t("landing.pricing.employees")}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold">{s.price}€</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.roles.map((role) => (
                          <Badge key={role} variant="outline" className="text-[10px] px-1.5 py-0 opacity-70 group-hover:opacity-100 transition-opacity">{role}</Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/auth?tab=signup"><Button variant="outline" className="w-full" size="lg">{t("landing.pricing.buildTeam")}<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </CardContent>
          </Card>
        </div>

        {/* Core OS Note */}
        <div className="max-w-4xl mx-auto">
          <Card variant="feature" className="border-dashed">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="p-3 rounded-xl bg-primary/10"><Settings className="w-6 h-6 text-primary" /></div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Core OS {t("landing.pricing.coreOSAlways")}</p>
                  <p className="text-sm text-muted-foreground">{t("landing.pricing.coreOSDesc")}</p>
                </div>
                <Badge variant="secondary" className="text-sm px-3">{t("landing.pricing.included")}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            {t("landing.pricing.roiNote", { total: TOTAL_EMPLOYEES, cost: (TOTAL_EMPLOYEES * 4500).toLocaleString(), savings: ((TOTAL_EMPLOYEES * 4500) - 9000).toLocaleString() })}
          </p>
          <p className="text-sm text-muted-foreground/80 mt-2 italic">{t("landing.pricing.roiDisclaimer")}</p>
        </div>
      </div>
    </section>
  );
}
