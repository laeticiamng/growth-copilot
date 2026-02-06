import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpsMetrics } from "@/hooks/useOpsMetrics";
import { useTranslation } from "react-i18next";
import { 
  DollarSign, Zap, TrendingUp,
  Bot, BarChart3, AlertTriangle, CheckCircle2
} from "lucide-react";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-3-pro': { input: 1.25, output: 5.00 },
  'gemini-3-flash': { input: 0.075, output: 0.30 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
};

export default function AICostDashboard() {
  const { t } = useTranslation();
  const { metrics, loading } = useOpsMetrics();

  const latestMetric = Array.isArray(metrics) ? metrics[0] : metrics;
  const aiCost = latestMetric?.ai_cost_usd || 0;

  const formatCost = (cost: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cost);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-primary" />
          {t("aiCost.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("aiCost.subtitle")}</p>
      </header>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("aiCost.today")}</p>
                <p className="text-2xl font-bold">{formatCost(aiCost)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("aiCost.thisWeekEstimate")}</p>
                <p className="text-2xl font-bold">{formatCost(aiCost * 5)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("aiCost.thisMonthEstimate")}</p>
                <p className="text-2xl font-bold">{formatCost(aiCost * 22)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("aiCost.monthlyProjection")}</p>
                <p className="text-2xl font-bold text-primary">{formatCost(aiCost * 30)}</p>
              </div>
              <Zap className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList>
          <TabsTrigger value="breakdown">{t("aiCost.byModel")}</TabsTrigger>
          <TabsTrigger value="agents">{t("aiCost.byAgent")}</TabsTrigger>
          <TabsTrigger value="alerts">{t("aiCost.alerts")}</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("aiCost.modelBreakdown")}</CardTitle>
              <CardDescription>{t("aiCost.modelBreakdownDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(MODEL_COSTS).map(([model, costs]) => (
                  <div key={model} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{model}</p>
                        <p className="text-sm text-muted-foreground">
                          Input: ${costs.input}/1M • Output: ${costs.output}/1M
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{t("aiCost.notUsed")}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("aiCost.agentCosts")}</CardTitle>
              <CardDescription>{t("aiCost.agentCostsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ModuleEmptyState
                icon={Bot}
                moduleName={t("aiCost.byAgent")}
                description={t("aiCost.noAgentDataDesc")}
                features={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("aiCost.alertConfig")}</CardTitle>
              <CardDescription>{t("aiCost.alertConfigDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">{t("aiCost.dailyThreshold")}</p>
                    <p className="text-sm text-muted-foreground">{t("aiCost.dailyThresholdDesc")}</p>
                  </div>
                </div>
                <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />{t("aiCost.active")}</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">{t("aiCost.monthlyThreshold")}</p>
                    <p className="text-sm text-muted-foreground">{t("aiCost.monthlyThresholdDesc")}</p>
                  </div>
                </div>
                <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />{t("aiCost.active")}</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{t("aiCost.usageSpike")}</p>
                    <p className="text-sm text-muted-foreground">{t("aiCost.usageSpikeDesc")}</p>
                  </div>
                </div>
                <Badge variant="outline">{t("aiCost.disabled")}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t("aiCost.optimizationTips")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">{t("aiCost.tip1Title")}</p>
              <p className="text-sm text-muted-foreground">{t("aiCost.tip1Desc")}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">{t("aiCost.tip2Title")}</p>
              <p className="text-sm text-muted-foreground">{t("aiCost.tip2Desc")}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">{t("aiCost.tip3Title")}</p>
              <p className="text-sm text-muted-foreground">{t("aiCost.tip3Desc")}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium mb-2">{t("aiCost.tip4Title")}</p>
              <p className="text-sm text-muted-foreground">{t("aiCost.tip4Desc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
