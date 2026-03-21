import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServices } from "@/hooks/useServices";
import { Link } from "react-router-dom";
import {
  Bot, ArrowRight, CheckCircle2, Clock,
  TrendingUp, Briefcase, BarChart3, Shield,
  Puzzle, Code, HeadphonesIcon, Settings, Users, Scale,
  Zap, Target, FileText, Search, BarChart, Globe,
  Mail, Camera, MessageSquare, LineChart, AlertTriangle
} from "lucide-react";

const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  marketing: TrendingUp,
  sales: Briefcase,
  finance: BarChart3,
  security: Shield,
  product: Puzzle,
  engineering: Code,
  data: BarChart3,
  support: HeadphonesIcon,
  governance: Settings,
  hr: Users,
  legal: Scale,
};

export default function ServiceCatalog() {
  const { t } = useTranslation();
  const { catalog, enabledServices, hasService } = useServices();

  const DEPARTMENT_DATA: Record<string, {
    employees: {
      name: string;
      role: string;
      specialty: string;
      icon: React.ElementType;
    }[];
    inputs: string[];
    outputs: string[];
    examples: { action: string; result: string }[];
    limits: string[];
  }> = useMemo(() => ({
    marketing: {
      employees: [
        { name: t("serviceCatalog.marketing.emp1Name"), role: t("serviceCatalog.marketing.emp1Role"), specialty: t("serviceCatalog.marketing.emp1Specialty"), icon: Target },
        { name: t("serviceCatalog.marketing.emp2Name"), role: t("serviceCatalog.marketing.emp2Role"), specialty: t("serviceCatalog.marketing.emp2Specialty"), icon: Search },
        { name: t("serviceCatalog.marketing.emp3Name"), role: t("serviceCatalog.marketing.emp3Role"), specialty: t("serviceCatalog.marketing.emp3Specialty"), icon: FileText },
        { name: t("serviceCatalog.marketing.emp4Name"), role: t("serviceCatalog.marketing.emp4Role"), specialty: t("serviceCatalog.marketing.emp4Specialty"), icon: BarChart },
        { name: t("serviceCatalog.marketing.emp5Name"), role: t("serviceCatalog.marketing.emp5Role"), specialty: t("serviceCatalog.marketing.emp5Specialty"), icon: MessageSquare },
      ],
      inputs: [
        t("serviceCatalog.marketing.input1"),
        t("serviceCatalog.marketing.input2"),
        t("serviceCatalog.marketing.input3"),
        t("serviceCatalog.marketing.input4"),
        t("serviceCatalog.marketing.input5"),
      ],
      outputs: [
        t("serviceCatalog.marketing.output1"),
        t("serviceCatalog.marketing.output2"),
        t("serviceCatalog.marketing.output3"),
        t("serviceCatalog.marketing.output4"),
        t("serviceCatalog.marketing.output5"),
      ],
      examples: [
        { action: t("serviceCatalog.marketing.example1Action"), result: t("serviceCatalog.marketing.example1Result") },
        { action: t("serviceCatalog.marketing.example2Action"), result: t("serviceCatalog.marketing.example2Result") },
        { action: t("serviceCatalog.marketing.example3Action"), result: t("serviceCatalog.marketing.example3Result") },
      ],
      limits: [
        t("serviceCatalog.marketing.limit1"),
        t("serviceCatalog.marketing.limit2"),
        t("serviceCatalog.marketing.limit3"),
        t("serviceCatalog.marketing.limit4"),
      ]
    },
    sales: {
      employees: [
        { name: t("serviceCatalog.sales.emp1Name"), role: t("serviceCatalog.sales.emp1Role"), specialty: t("serviceCatalog.sales.emp1Specialty"), icon: Target },
        { name: t("serviceCatalog.sales.emp2Name"), role: t("serviceCatalog.sales.emp2Role"), specialty: t("serviceCatalog.sales.emp2Specialty"), icon: Users },
        { name: t("serviceCatalog.sales.emp3Name"), role: t("serviceCatalog.sales.emp3Role"), specialty: t("serviceCatalog.sales.emp3Specialty"), icon: Briefcase },
        { name: t("serviceCatalog.sales.emp4Name"), role: t("serviceCatalog.sales.emp4Role"), specialty: t("serviceCatalog.sales.emp4Specialty"), icon: FileText },
      ],
      inputs: [
        t("serviceCatalog.sales.input1"),
        t("serviceCatalog.sales.input2"),
        t("serviceCatalog.sales.input3"),
        t("serviceCatalog.sales.input4"),
      ],
      outputs: [
        t("serviceCatalog.sales.output1"),
        t("serviceCatalog.sales.output2"),
        t("serviceCatalog.sales.output3"),
        t("serviceCatalog.sales.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.sales.example1Action"), result: t("serviceCatalog.sales.example1Result") },
        { action: t("serviceCatalog.sales.example2Action"), result: t("serviceCatalog.sales.example2Result") },
      ],
      limits: [
        t("serviceCatalog.sales.limit1"),
        t("serviceCatalog.sales.limit2"),
        t("serviceCatalog.sales.limit3"),
      ]
    },
    finance: {
      employees: [
        { name: t("serviceCatalog.finance.emp1Name"), role: t("serviceCatalog.finance.emp1Role"), specialty: t("serviceCatalog.finance.emp1Specialty"), icon: BarChart3 },
        { name: t("serviceCatalog.finance.emp2Name"), role: t("serviceCatalog.finance.emp2Role"), specialty: t("serviceCatalog.finance.emp2Specialty"), icon: FileText },
        { name: t("serviceCatalog.finance.emp3Name"), role: t("serviceCatalog.finance.emp3Role"), specialty: t("serviceCatalog.finance.emp3Specialty"), icon: LineChart },
      ],
      inputs: [
        t("serviceCatalog.finance.input1"),
        t("serviceCatalog.finance.input2"),
        t("serviceCatalog.finance.input3"),
        t("serviceCatalog.finance.input4"),
      ],
      outputs: [
        t("serviceCatalog.finance.output1"),
        t("serviceCatalog.finance.output2"),
        t("serviceCatalog.finance.output3"),
        t("serviceCatalog.finance.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.finance.example1Action"), result: t("serviceCatalog.finance.example1Result") },
        { action: t("serviceCatalog.finance.example2Action"), result: t("serviceCatalog.finance.example2Result") },
      ],
      limits: [
        t("serviceCatalog.finance.limit1"),
        t("serviceCatalog.finance.limit2"),
        t("serviceCatalog.finance.limit3"),
      ]
    },
    security: {
      employees: [
        { name: t("serviceCatalog.security.emp1Name"), role: t("serviceCatalog.security.emp1Role"), specialty: t("serviceCatalog.security.emp1Specialty"), icon: Shield },
        { name: t("serviceCatalog.security.emp2Name"), role: t("serviceCatalog.security.emp2Role"), specialty: t("serviceCatalog.security.emp2Specialty"), icon: Users },
        { name: t("serviceCatalog.security.emp3Name"), role: t("serviceCatalog.security.emp3Role"), specialty: t("serviceCatalog.security.emp3Specialty"), icon: FileText },
      ],
      inputs: [
        t("serviceCatalog.security.input1"),
        t("serviceCatalog.security.input2"),
        t("serviceCatalog.security.input3"),
        t("serviceCatalog.security.input4"),
      ],
      outputs: [
        t("serviceCatalog.security.output1"),
        t("serviceCatalog.security.output2"),
        t("serviceCatalog.security.output3"),
        t("serviceCatalog.security.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.security.example1Action"), result: t("serviceCatalog.security.example1Result") },
        { action: t("serviceCatalog.security.example2Action"), result: t("serviceCatalog.security.example2Result") },
      ],
      limits: [
        t("serviceCatalog.security.limit1"),
        t("serviceCatalog.security.limit2"),
        t("serviceCatalog.security.limit3"),
      ]
    },
    product: {
      employees: [
        { name: t("serviceCatalog.product.emp1Name"), role: t("serviceCatalog.product.emp1Role"), specialty: t("serviceCatalog.product.emp1Specialty"), icon: Puzzle },
        { name: t("serviceCatalog.product.emp2Name"), role: t("serviceCatalog.product.emp2Role"), specialty: t("serviceCatalog.product.emp2Specialty"), icon: Search },
        { name: t("serviceCatalog.product.emp3Name"), role: t("serviceCatalog.product.emp3Role"), specialty: t("serviceCatalog.product.emp3Specialty"), icon: BarChart },
        { name: t("serviceCatalog.product.emp4Name"), role: t("serviceCatalog.product.emp4Role"), specialty: t("serviceCatalog.product.emp4Specialty"), icon: Target },
      ],
      inputs: [
        t("serviceCatalog.product.input1"),
        t("serviceCatalog.product.input2"),
        t("serviceCatalog.product.input3"),
        t("serviceCatalog.product.input4"),
      ],
      outputs: [
        t("serviceCatalog.product.output1"),
        t("serviceCatalog.product.output2"),
        t("serviceCatalog.product.output3"),
        t("serviceCatalog.product.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.product.example1Action"), result: t("serviceCatalog.product.example1Result") },
        { action: t("serviceCatalog.product.example2Action"), result: t("serviceCatalog.product.example2Result") },
      ],
      limits: [
        t("serviceCatalog.product.limit1"),
        t("serviceCatalog.product.limit2"),
        t("serviceCatalog.product.limit3"),
      ]
    },
    engineering: {
      employees: [
        { name: t("serviceCatalog.engineering.emp1Name"), role: t("serviceCatalog.engineering.emp1Role"), specialty: t("serviceCatalog.engineering.emp1Specialty"), icon: Code },
        { name: t("serviceCatalog.engineering.emp2Name"), role: t("serviceCatalog.engineering.emp2Role"), specialty: t("serviceCatalog.engineering.emp2Specialty"), icon: Settings },
        { name: t("serviceCatalog.engineering.emp3Name"), role: t("serviceCatalog.engineering.emp3Role"), specialty: t("serviceCatalog.engineering.emp3Specialty"), icon: Globe },
        { name: t("serviceCatalog.engineering.emp4Name"), role: t("serviceCatalog.engineering.emp4Role"), specialty: t("serviceCatalog.engineering.emp4Specialty"), icon: CheckCircle2 },
        { name: t("serviceCatalog.engineering.emp5Name"), role: t("serviceCatalog.engineering.emp5Role"), specialty: t("serviceCatalog.engineering.emp5Specialty"), icon: FileText },
      ],
      inputs: [
        t("serviceCatalog.engineering.input1"),
        t("serviceCatalog.engineering.input2"),
        t("serviceCatalog.engineering.input3"),
        t("serviceCatalog.engineering.input4"),
      ],
      outputs: [
        t("serviceCatalog.engineering.output1"),
        t("serviceCatalog.engineering.output2"),
        t("serviceCatalog.engineering.output3"),
        t("serviceCatalog.engineering.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.engineering.example1Action"), result: t("serviceCatalog.engineering.example1Result") },
        { action: t("serviceCatalog.engineering.example2Action"), result: t("serviceCatalog.engineering.example2Result") },
      ],
      limits: [
        t("serviceCatalog.engineering.limit1"),
        t("serviceCatalog.engineering.limit2"),
        t("serviceCatalog.engineering.limit3"),
      ]
    },
    data: {
      employees: [
        { name: t("serviceCatalog.data.emp1Name"), role: t("serviceCatalog.data.emp1Role"), specialty: t("serviceCatalog.data.emp1Specialty"), icon: BarChart3 },
        { name: t("serviceCatalog.data.emp2Name"), role: t("serviceCatalog.data.emp2Role"), specialty: t("serviceCatalog.data.emp2Specialty"), icon: LineChart },
        { name: t("serviceCatalog.data.emp3Name"), role: t("serviceCatalog.data.emp3Role"), specialty: t("serviceCatalog.data.emp3Specialty"), icon: Settings },
        { name: t("serviceCatalog.data.emp4Name"), role: t("serviceCatalog.data.emp4Role"), specialty: t("serviceCatalog.data.emp4Specialty"), icon: BarChart },
      ],
      inputs: [
        t("serviceCatalog.data.input1"),
        t("serviceCatalog.data.input2"),
        t("serviceCatalog.data.input3"),
        t("serviceCatalog.data.input4"),
      ],
      outputs: [
        t("serviceCatalog.data.output1"),
        t("serviceCatalog.data.output2"),
        t("serviceCatalog.data.output3"),
        t("serviceCatalog.data.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.data.example1Action"), result: t("serviceCatalog.data.example1Result") },
        { action: t("serviceCatalog.data.example2Action"), result: t("serviceCatalog.data.example2Result") },
      ],
      limits: [
        t("serviceCatalog.data.limit1"),
        t("serviceCatalog.data.limit2"),
        t("serviceCatalog.data.limit3"),
      ]
    },
    support: {
      employees: [
        { name: t("serviceCatalog.support.emp1Name"), role: t("serviceCatalog.support.emp1Role"), specialty: t("serviceCatalog.support.emp1Specialty"), icon: HeadphonesIcon },
        { name: t("serviceCatalog.support.emp2Name"), role: t("serviceCatalog.support.emp2Role"), specialty: t("serviceCatalog.support.emp2Specialty"), icon: MessageSquare },
        { name: t("serviceCatalog.support.emp3Name"), role: t("serviceCatalog.support.emp3Role"), specialty: t("serviceCatalog.support.emp3Specialty"), icon: FileText },
      ],
      inputs: [
        t("serviceCatalog.support.input1"),
        t("serviceCatalog.support.input2"),
        t("serviceCatalog.support.input3"),
        t("serviceCatalog.support.input4"),
      ],
      outputs: [
        t("serviceCatalog.support.output1"),
        t("serviceCatalog.support.output2"),
        t("serviceCatalog.support.output3"),
        t("serviceCatalog.support.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.support.example1Action"), result: t("serviceCatalog.support.example1Result") },
        { action: t("serviceCatalog.support.example2Action"), result: t("serviceCatalog.support.example2Result") },
      ],
      limits: [
        t("serviceCatalog.support.limit1"),
        t("serviceCatalog.support.limit2"),
        t("serviceCatalog.support.limit3"),
      ]
    },
    governance: {
      employees: [
        { name: t("serviceCatalog.governance.emp1Name"), role: t("serviceCatalog.governance.emp1Role"), specialty: t("serviceCatalog.governance.emp1Specialty"), icon: Settings },
        { name: t("serviceCatalog.governance.emp2Name"), role: t("serviceCatalog.governance.emp2Role"), specialty: t("serviceCatalog.governance.emp2Specialty"), icon: Zap },
        { name: t("serviceCatalog.governance.emp3Name"), role: t("serviceCatalog.governance.emp3Role"), specialty: t("serviceCatalog.governance.emp3Specialty"), icon: Globe },
      ],
      inputs: [
        t("serviceCatalog.governance.input1"),
        t("serviceCatalog.governance.input2"),
        t("serviceCatalog.governance.input3"),
        t("serviceCatalog.governance.input4"),
      ],
      outputs: [
        t("serviceCatalog.governance.output1"),
        t("serviceCatalog.governance.output2"),
        t("serviceCatalog.governance.output3"),
        t("serviceCatalog.governance.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.governance.example1Action"), result: t("serviceCatalog.governance.example1Result") },
        { action: t("serviceCatalog.governance.example2Action"), result: t("serviceCatalog.governance.example2Result") },
      ],
      limits: [
        t("serviceCatalog.governance.limit1"),
        t("serviceCatalog.governance.limit2"),
        t("serviceCatalog.governance.limit3"),
      ]
    },
    hr: {
      employees: [
        { name: t("serviceCatalog.hr.emp1Name"), role: t("serviceCatalog.hr.emp1Role"), specialty: t("serviceCatalog.hr.emp1Specialty"), icon: Users },
        { name: t("serviceCatalog.hr.emp2Name"), role: t("serviceCatalog.hr.emp2Role"), specialty: t("serviceCatalog.hr.emp2Specialty"), icon: CheckCircle2 },
      ],
      inputs: [
        t("serviceCatalog.hr.input1"),
        t("serviceCatalog.hr.input2"),
        t("serviceCatalog.hr.input3"),
        t("serviceCatalog.hr.input4"),
      ],
      outputs: [
        t("serviceCatalog.hr.output1"),
        t("serviceCatalog.hr.output2"),
        t("serviceCatalog.hr.output3"),
        t("serviceCatalog.hr.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.hr.example1Action"), result: t("serviceCatalog.hr.example1Result") },
        { action: t("serviceCatalog.hr.example2Action"), result: t("serviceCatalog.hr.example2Result") },
      ],
      limits: [
        t("serviceCatalog.hr.limit1"),
        t("serviceCatalog.hr.limit2"),
        t("serviceCatalog.hr.limit3"),
      ]
    },
    legal: {
      employees: [
        { name: t("serviceCatalog.legal.emp1Name"), role: t("serviceCatalog.legal.emp1Role"), specialty: t("serviceCatalog.legal.emp1Specialty"), icon: Scale },
        { name: t("serviceCatalog.legal.emp2Name"), role: t("serviceCatalog.legal.emp2Role"), specialty: t("serviceCatalog.legal.emp2Specialty"), icon: Shield },
      ],
      inputs: [
        t("serviceCatalog.legal.input1"),
        t("serviceCatalog.legal.input2"),
        t("serviceCatalog.legal.input3"),
        t("serviceCatalog.legal.input4"),
      ],
      outputs: [
        t("serviceCatalog.legal.output1"),
        t("serviceCatalog.legal.output2"),
        t("serviceCatalog.legal.output3"),
        t("serviceCatalog.legal.output4"),
      ],
      examples: [
        { action: t("serviceCatalog.legal.example1Action"), result: t("serviceCatalog.legal.example1Result") },
        { action: t("serviceCatalog.legal.example2Action"), result: t("serviceCatalog.legal.example2Result") },
      ],
      limits: [
        t("serviceCatalog.legal.limit1"),
        t("serviceCatalog.legal.limit2"),
        t("serviceCatalog.legal.limit3"),
      ]
    },
  }), [t]);

  const departments = catalog.filter(s => !s.is_core);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          {t("serviceCatalog.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("serviceCatalog.subtitle")}
        </p>
      </header>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-primary">37</p>
            <p className="text-sm text-muted-foreground">{t("serviceCatalog.aiEmployees")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">{departments.length}</p>
            <p className="text-sm text-muted-foreground">{t("serviceCatalog.departments")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-green-600">
              {enabledServices.filter(s => !s.is_core).length}
            </p>
            <p className="text-sm text-muted-foreground">{t("serviceCatalog.enabled")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="space-y-6">
        {departments.map(dept => {
          const Icon = DEPARTMENT_ICONS[dept.slug] || Puzzle;
          const data = DEPARTMENT_DATA[dept.slug];
          const isEnabled = hasService(dept.slug);

          if (!data) return null;

          return (
            <Card key={dept.id} className={isEnabled ? "border-primary/30" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isEnabled ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`w-6 h-6 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {dept.name}
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          {data.employees.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{dept.description}</CardDescription>
                    </div>
                  </div>
                  {isEnabled ? (
                    <Badge variant="success">{t("serviceCatalog.activated")}</Badge>
                  ) : (
                    <Link to="/dashboard/billing">
                      <Button variant="outline" size="sm">
                        {t("serviceCatalog.activate")}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="team" className="space-y-4">
                  <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="team">{t("serviceCatalog.tabTeam")}</TabsTrigger>
                    <TabsTrigger value="io">{t("serviceCatalog.tabIO")}</TabsTrigger>
                    <TabsTrigger value="examples">{t("serviceCatalog.tabExamples")}</TabsTrigger>
                    <TabsTrigger value="limits">{t("serviceCatalog.tabLimits")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="team">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.employees.map(emp => (
                        <div key={emp.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <div className="p-2 rounded-lg bg-background">
                            <emp.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{emp.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{emp.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="io">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          {t("serviceCatalog.inputs")}
                        </h4>
                        <ul className="space-y-2">
                          {data.inputs.map(input => (
                            <li key={input} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {input}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-green-500 rotate-180" />
                          {t("serviceCatalog.outputs")}
                        </h4>
                        <ul className="space-y-2">
                          {data.outputs.map(output => (
                            <li key={output} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {output}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples">
                    <div className="space-y-3">
                      {data.examples.map((ex, i) => (
                        <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded bg-primary/10">
                              <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{ex.action}</p>
                              <p className="text-sm text-muted-foreground mt-1">→ {ex.result}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="limits">
                    <div className="space-y-2">
                      {data.limits.map(limit => (
                        <div key={limit} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{limit}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
