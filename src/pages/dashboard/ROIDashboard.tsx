import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useServices } from "@/hooks/useServices";
import { 
  TrendingUp, Users, DollarSign, Zap, 
  ArrowRight, Calculator, Bot, Clock,
  CheckCircle2, BarChart3, LineChart
} from "lucide-react";
import { AdvancedCharts } from "@/components/kpi/AdvancedCharts";

// Salary data (French average)
const AVG_SALARY_MONTHLY = 4500; // €/month brut chargé
const HOURS_PER_WEEK = 35;
const WEEKS_PER_MONTH = 4.33;

// AI employee productivity multipliers
const AI_PRODUCTIVITY_MULTIPLIER = 3; // 3x faster than human
const AI_AVAILABILITY_HOURS = 24 * 7; // 24/7

// Employees per department
const DEPT_EMPLOYEES: Record<string, { count: number; roles: string[] }> = {
  marketing: { 
    count: 5, 
    roles: ["SEO Specialist", "Content Manager", "Ads Manager", "Social Manager", "CRO Analyst"] 
  },
  sales: { 
    count: 4, 
    roles: ["Sales Rep", "Lead Qualifier", "Account Manager", "Proposal Writer"] 
  },
  finance: { 
    count: 3, 
    roles: ["Financial Analyst", "Reporting Manager", "Budget Controller"] 
  },
  security: { 
    count: 3, 
    roles: ["Security Analyst", "Access Reviewer", "Compliance Officer"] 
  },
  product: { 
    count: 4, 
    roles: ["Product Manager", "UX Researcher", "Feature Analyst", "Roadmap Planner"] 
  },
  engineering: { 
    count: 5, 
    roles: ["DevOps Engineer", "API Developer", "Integration Specialist", "QA Engineer", "Tech Lead"] 
  },
  data: { 
    count: 4, 
    roles: ["Data Analyst", "BI Specialist", "ETL Developer", "Dashboard Builder"] 
  },
  support: { 
    count: 3, 
    roles: ["Support Agent", "Reputation Manager", "Knowledge Manager"] 
  },
  governance: { 
    count: 3, 
    roles: ["Policy Manager", "Automation Specialist", "Workflow Designer"] 
  },
  hr: { 
    count: 2, 
    roles: ["HR Manager", "Onboarding Specialist"] 
  },
  legal: { 
    count: 1, 
    roles: ["Directeur Juridique IA"] 
  },
};

// Total AI Workforce = 37 in departments + 2 Direction (CGO + QCO) = 39
const TOTAL_AI_WORKFORCE = 39;

// Pricing
const PRICES = {
  starter: 490,
  department: 1900,
  fullCompany: 9000,
};

export default function ROIDashboard() {
  const { currentWorkspace } = useWorkspace();
  const { enabledServices, isFullCompany, subscription } = useServices();

  // Calculate enabled departments (excluding core)
  const enabledDepartments = enabledServices.filter(s => !s.is_core);
  
  // Calculate total AI employees
  const totalAIEmployees = enabledDepartments.reduce((sum, dept) => {
    return sum + (DEPT_EMPLOYEES[dept.slug]?.count || 0);
  }, 0);

  // Calculate human equivalent cost
  const humanMonthlyCost = totalAIEmployees * AVG_SALARY_MONTHLY;
  const humanYearlyCost = humanMonthlyCost * 12;

  // Calculate Growth OS cost
  const growthOSMonthlyCost = isFullCompany 
    ? PRICES.fullCompany 
    : (subscription?.plan === "starter" 
        ? PRICES.starter 
        : enabledDepartments.length * PRICES.department);
  const growthOSYearlyCost = growthOSMonthlyCost * 12;

  // Calculate savings
  const monthlySavings = humanMonthlyCost - growthOSMonthlyCost;
  const yearlySavings = humanYearlyCost - growthOSYearlyCost;
  const savingsPercentage = humanMonthlyCost > 0 
    ? Math.round((monthlySavings / humanMonthlyCost) * 100) 
    : 0;

  // Calculate productivity gains
  const humanHoursPerMonth = totalAIEmployees * HOURS_PER_WEEK * WEEKS_PER_MONTH;
  const aiEquivalentHours = humanHoursPerMonth * AI_PRODUCTIVITY_MULTIPLIER;
  const availabilityGain = AI_AVAILABILITY_HOURS / (HOURS_PER_WEEK / 7);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          Calculateur ROI & Analytiques
        </h1>
        <p className="text-muted-foreground mt-1">
          Comparez le coût de Growth OS aux équipes traditionnelles et visualisez vos performances
        </p>
      </header>

      <Tabs defaultValue="roi" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roi">
            <Calculator className="w-4 h-4 mr-2" />
            ROI
          </TabsTrigger>
          <TabsTrigger value="charts">
            <LineChart className="w-4 h-4 mr-2" />
            Graphiques avancés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roi" className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employés IA actifs</p>
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
                <p className="text-sm text-muted-foreground">Économies mensuelles</p>
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
                <p className="text-sm text-muted-foreground">Productivité</p>
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
                <p className="text-sm text-muted-foreground">Disponibilité</p>
                <p className="text-3xl font-bold">24/7</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Human Team Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Équipe humaine équivalente
            </CardTitle>
            <CardDescription>
              Coût employeur moyen: {AVG_SALARY_MONTHLY.toLocaleString()}€/mois par employé
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
                      {info.count} employés • {info.roles.slice(0, 2).join(", ")}...
                    </p>
                  </div>
                  <p className="font-semibold">{deptCost.toLocaleString()}€/mois</p>
                </div>
              );
            })}

            {enabledDepartments.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Activez des départements pour voir la comparaison
              </p>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Total mensuel</p>
                <p className="text-2xl font-bold text-destructive">
                  {humanMonthlyCost.toLocaleString()}€
                </p>
              </div>
              <p className="text-sm text-muted-foreground text-right">
                {humanYearlyCost.toLocaleString()}€/an
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Growth OS Cost */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Growth OS
              {isFullCompany && <Badge variant="gradient">Full Company</Badge>}
            </CardTitle>
            <CardDescription>
              {isFullCompany 
                ? `${TOTAL_AI_WORKFORCE} employés IA, 11 départements, Core OS inclus`
                : `${totalAIEmployees} employés IA, ${enabledDepartments.length} département(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <p className="font-medium">Abonnement mensuel</p>
                <p className="text-2xl font-bold text-primary">
                  {growthOSMonthlyCost.toLocaleString()}€
                </p>
              </div>
              <p className="text-sm text-muted-foreground text-right">
                {growthOSYearlyCost.toLocaleString()}€/an
              </p>
            </div>

            {monthlySavings > 0 && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Vous économisez {savingsPercentage}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Par mois</p>
                    <p className="font-bold text-green-600">+{monthlySavings.toLocaleString()}€</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Par an</p>
                    <p className="font-bold text-green-600">+{yearlySavings.toLocaleString()}€</p>
                  </div>
                </div>
              </div>
            )}

            {/* Productivity Benefits */}
            <div className="space-y-2 pt-4 border-t">
              <p className="font-medium text-sm">Avantages supplémentaires</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>3x plus rapide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Disponible 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span>Traçabilité totale</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Scalable instantanément</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Metrics */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle>Gains de productivité</CardTitle>
          <CardDescription>
            Comparaison des heures de travail équivalentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-2">Heures humaines/mois</p>
              <p className="text-3xl font-bold">{Math.round(humanHoursPerMonth)}</p>
              <p className="text-xs text-muted-foreground">({HOURS_PER_WEEK}h × {WEEKS_PER_MONTH.toFixed(1)} sem × {totalAIEmployees} emp.)</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Heures IA équivalentes</p>
              <p className="text-3xl font-bold text-primary">{Math.round(aiEquivalentHours)}</p>
              <p className="text-xs text-muted-foreground">(×{AI_PRODUCTIVITY_MULTIPLIER} productivité)</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground mb-2">Gain horaire</p>
              <p className="text-3xl font-bold text-green-600">+{Math.round(aiEquivalentHours - humanHoursPerMonth)}h</p>
              <p className="text-xs text-muted-foreground">par mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      {!isFullCompany && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Passez à Full Company</h3>
                <p className="text-sm text-muted-foreground">
                  {TOTAL_AI_WORKFORCE} employés IA pour {PRICES.fullCompany.toLocaleString()}€/mois au lieu de {(TOTAL_AI_WORKFORCE * AVG_SALARY_MONTHLY).toLocaleString()}€
                </p>
              </div>
              <Button variant="hero" asChild>
                <a href="/dashboard/billing">
                  Voir les plans
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
