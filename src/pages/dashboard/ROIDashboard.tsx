import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useServices } from "@/hooks/useServices";
import { useTranslation } from "react-i18next";
import { 
  TrendingUp, Users, DollarSign, Zap, 
  ArrowRight, Calculator, Bot, Clock,
  CheckCircle2, BarChart3, LineChart
} from "lucide-react";
import { AdvancedCharts } from "@/components/kpi/AdvancedCharts";

const AVG_SALARY_MONTHLY = 4500;
const HOURS_PER_WEEK = 35;
const WEEKS_PER_MONTH = 4.33;
const AI_PRODUCTIVITY_MULTIPLIER = 3;
const AI_AVAILABILITY_HOURS = 24 * 7;

const DEPT_EMPLOYEES: Record<string, { count: number; roles: string[] }> = {
  marketing: { count: 5, roles: ["SEO Specialist", "Content Manager", "Ads Manager", "Social Manager", "CRO Analyst"] },
  sales: { count: 4, roles: ["Sales Rep", "Lead Qualifier", "Account Manager", "Proposal Writer"] },
  finance: { count: 3, roles: ["Financial Analyst", "Reporting Manager", "Budget Controller"] },
  security: { count: 3, roles: ["Security Analyst", "Access Reviewer", "Compliance Officer"] },
  product: { count: 4, roles: ["Product Manager", "UX Researcher", "Feature Analyst", "Roadmap Planner"] },
  engineering: { count: 5, roles: ["DevOps Engineer", "API Developer", "Integration Specialist", "QA Engineer", "Tech Lead"] },
  data: { count: 4, roles: ["Data Analyst", "BI Specialist", "ETL Developer", "Dashboard Builder"] },
  support: { count: 3, roles: ["Support Agent", "Reputation Manager", "Knowledge Manager"] },
  governance: { count: 3, roles: ["Policy Manager", "Automation Specialist", "Workflow Designer"] },
  hr: { count: 2, roles: ["HR Manager", "Onboarding Specialist"] },
  legal: { count: 1, roles: ["AI Legal Director"] },
};

const TOTAL_AI_WORKFORCE = 39;
const PRICES = { starter: 490, department: 1900, fullCompany: 9000 };

export default function ROIDashboard() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { enabledServices, isFullCompany, subscription } = useServices();

  const enabledDepartments = enabledServices.filter(s => !s.is_core);
  const totalAIEmployees = enabledDepartments.reduce((sum, dept) => sum + (DEPT_EMPLOYEES[dept.slug]?.count || 0), 0);
  const humanMonthlyCost = totalAIEmployees * AVG_SALARY_MONTHLY;
  const humanYearlyCost = humanMonthlyCost * 12;
  const growthOSMonthlyCost = isFullCompany ? PRICES.fullCompany : (subscription?.plan === "starter" ? PRICES.starter : enabledDepartments.length * PRICES.department);
  const growthOSYearlyCost = growthOSMonthlyCost * 12;
  const monthlySavings = humanMonthlyCost - growthOSMonthlyCost;
  const yearlySavings = humanYearlyCost - growthOSYearlyCost;
  const savingsPercentage = humanMonthlyCost > 0 ? Math.round((monthlySavings / humanMonthlyCost) * 100) : 0;
  const humanHoursPerMonth = totalAIEmployees * HOURS_PER_WEEK * WEEKS_PER_MONTH;
  const aiEquivalentHours = humanHoursPerMonth * AI_PRODUCTIVITY_MULTIPLIER;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          {t("roi.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("roi.subtitle")}</p>
      </header>

      <Tabs defaultValue="roi" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roi"><Calculator className="w-4 h-4 mr-2" />ROI</TabsTrigger>
          <TabsTrigger value="charts"><LineChart className="w-4 h-4 mr-2" />{t("roi.advancedCharts")}</TabsTrigger>
        </TabsList>

        <TabsContent value="roi" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("roi.activeAIEmployees")}</p>
                    <p className="text-3xl font-bold text-primary">{totalAIEmployees}</p>
                  </div>
                  <Bot className="w-10 h-10 text-primary opacity-60" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("roi.monthlySavings")}</p>
                    <p className="text-3xl font-bold status-success">
                      {monthlySavings > 0 ? `+${monthlySavings.toLocaleString()}€` : "—"}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 status-success opacity-60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("roi.productivity")}</p>
                    <p className="text-3xl font-bold">{AI_PRODUCTIVITY_MULTIPLIER}x</p>
                  </div>
                  <Zap className="w-10 h-10 status-warning opacity-60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("roi.availability")}</p>
                    <p className="text-3xl font-bold">24/7</p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-500 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("roi.humanTeamEquivalent")}
                </CardTitle>
                <CardDescription>
                  {t("roi.avgCostPerEmployee", { cost: AVG_SALARY_MONTHLY.toLocaleString() })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enabledDepartments.map(dept => {
                  const info = DEPT_EMPLOYEES[dept.slug];
                  if (!info) return null;
                  const deptCost = info.count * AVG_SALARY_MONTHLY;
                  return (
                    <div key={dept.slug} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("roi.employeesCount", { count: info.count })} • {info.roles.slice(0, 2).join(", ")}...
                        </p>
                      </div>
                      <p className="font-semibold">{deptCost.toLocaleString()}€/{t("roi.monthShort")}</p>
                    </div>
                  );
                })}
                {enabledDepartments.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">{t("roi.enableDepartments")}</p>
                )}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{t("roi.totalMonthly")}</p>
                    <p className="text-2xl font-bold text-destructive">{humanMonthlyCost.toLocaleString()}€</p>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">{humanYearlyCost.toLocaleString()}€/{t("roi.yearShort")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Growth OS
                  {isFullCompany && <Badge variant="gradient">Full Company</Badge>}
                </CardTitle>
                <CardDescription>
                  {isFullCompany
                    ? t("roi.fullCompanyDesc", { total: TOTAL_AI_WORKFORCE })
                    : t("roi.partialDesc", { total: totalAIEmployees, depts: enabledDepartments.length })
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{t("roi.monthlySubscription")}</p>
                    <p className="text-2xl font-bold text-primary">{growthOSMonthlyCost.toLocaleString()}€</p>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">{growthOSYearlyCost.toLocaleString()}€/{t("roi.yearShort")}</p>
                </div>
                {monthlySavings > 0 && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        {t("roi.youSave", { percent: savingsPercentage })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("roi.perMonth")}</p>
                        <p className="font-bold text-green-600">+{monthlySavings.toLocaleString()}€</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("roi.perYear")}</p>
                        <p className="font-bold text-green-600">+{yearlySavings.toLocaleString()}€</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2 pt-4 border-t">
                  <p className="font-medium text-sm">{t("roi.additionalBenefits")}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /><span>{t("roi.benefit3xFaster")}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><span>{t("roi.benefit247")}</span></div>
                    <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-500" /><span>{t("roi.benefitTraceability")}</span></div>
                    <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /><span>{t("roi.benefitScalable")}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("roi.productivityGains")}</CardTitle>
              <CardDescription>{t("roi.productivityGainsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-2">{t("roi.humanHoursMonth")}</p>
                  <p className="text-3xl font-bold">{Math.round(humanHoursPerMonth)}</p>
                  <p className="text-xs text-muted-foreground">({HOURS_PER_WEEK}h × {WEEKS_PER_MONTH.toFixed(1)} {t("roi.weeks")} × {totalAIEmployees} {t("roi.emp")})</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">{t("roi.aiEquivalentHours")}</p>
                  <p className="text-3xl font-bold text-primary">{Math.round(aiEquivalentHours)}</p>
                  <p className="text-xs text-muted-foreground">(×{AI_PRODUCTIVITY_MULTIPLIER} {t("roi.productivity")})</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-muted-foreground mb-2">{t("roi.hourlyGain")}</p>
                  <p className="text-3xl font-bold text-green-600">+{Math.round(aiEquivalentHours - humanHoursPerMonth)}h</p>
                  <p className="text-xs text-muted-foreground">{t("roi.perMonth")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isFullCompany && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{t("roi.upgradeToFull")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("roi.upgradeDesc", { total: TOTAL_AI_WORKFORCE, price: PRICES.fullCompany.toLocaleString(), humanCost: (TOTAL_AI_WORKFORCE * AVG_SALARY_MONTHLY).toLocaleString() })}
                    </p>
                  </div>
                  <Button variant="hero" asChild>
                    <a href="/dashboard/billing">
                      {t("roi.seePlans")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="charts">
          <AdvancedCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
