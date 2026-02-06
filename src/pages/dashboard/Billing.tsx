import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useServices, Service } from "@/hooks/useServices";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BillingOverview } from "@/components/billing/BillingOverview";
import {
  Crown,
  Zap,
  Check,
  CreditCard,
  TrendingUp,
  Briefcase,
  BarChart3,
  Shield,
  Puzzle,
  Code,
  HeadphonesIcon,
  Settings,
  Building2,
  Sparkles,
  Loader2,
  ExternalLink,
  Bot,
} from "lucide-react";

// Service icons mapping
const SERVICE_ICONS: Record<string, React.ElementType> = {
  marketing: TrendingUp,
  sales: Briefcase,
  finance: BarChart3,
  security: Shield,
  product: Puzzle,
  engineering: Code,
  data: BarChart3,
  support: HeadphonesIcon,
  governance: Settings,
  "core-os": Zap,
};

// Real pricing (matching landing page)
const PRICE_PER_DEPT = 1900;
const STARTER_PRICE = 490;
const FULL_COMPANY_PRICE = 9000;

// Stripe price IDs
const STRIPE_PRICES = {
  fullCompany: "price_1SwlDUDFa5Y9NR1IzLwG74ue",
  department: "price_1SwlDXDFa5Y9NR1IRhOpv4ET",
  starter: "price_1SwnyuDFa5Y9NR1IEQaigAaY",
};

// Starter plan limits (lite version: 1 AI employee per department)
const STARTER_LIMITS = {
  runs: 50,
  sites: 1,
  users: 2,
  employeesPerDept: 1,
  totalEmployees: 11, // 1 per department (11 departments)
};

// Employees per department (Full version)
// Total = 5+4+3+3+4+5+4+3+3+2+1 = 37 in departments + 2 Direction (CGO + QCO) = 39 total
const DEPT_EMPLOYEES: Record<string, number> = {
  marketing: 5,
  sales: 4,
  finance: 3,
  security: 3,
  product: 4,
  engineering: 5,
  data: 4,
  support: 3,
  governance: 3,
  hr: 2,
  legal: 1,
};
const TOTAL_AI_WORKFORCE = 39; // 37 in departments + 2 Direction (CGO + QCO)

export default function Billing() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { 
    catalog, 
    catalogLoading, 
    enabledServices, 
    subscription, 
    subscriptionLoading,
    enableService,
    disableService,
    isFullCompany,
    hasService,
  } = useServices();
  
  const [togglingService, setTogglingService] = useState<string | null>(null);
  const [creatingCheckout, setCreatingCheckout] = useState<string | null>(null);

  // Check if current plan is Starter
  const isStarter = subscription?.plan === "starter";
  
  // Check if current plan is Founder (unlimited admin access)
  const isFounder = subscription?.plan === "founder";

  // Filter out core services (they're always free)
  const paidServices = catalog.filter(s => !s.is_core);
  
  // Calculate current "à la carte" total
  const enabledPaidCount = paidServices.filter(s => hasService(s.slug)).length;
  const alaCarteTotal = enabledPaidCount * PRICE_PER_DEPT;
  const totalEmployees = isFounder || isFullCompany 
    ? TOTAL_AI_WORKFORCE 
    : paidServices
        .filter(s => hasService(s.slug))
        .reduce((sum, s) => sum + (DEPT_EMPLOYEES[s.slug] || 3), 0);

  // Toggle a service (for demo/trial mode)
  const handleToggleService = async (service: Service, enabled: boolean) => {
    if (isFullCompany) {
      toast.info(t("billing.page.allServicesIncluded"));
      return;
    }

    setTogglingService(service.id);
    try {
      if (enabled) {
        const { error } = await enableService(service.id);
        if (error) throw error;
        toast.success(t("billing.page.serviceEnabled", { name: service.name }));
      } else {
        const { error } = await disableService(service.id);
        if (error) throw error;
        toast.success(t("billing.page.serviceDisabled", { name: service.name }));
      }
    } catch (error) {
      toast.error(t("billing.page.modifyError"));
    } finally {
      setTogglingService(null);
    }
  };

  // Create Stripe Checkout session
  const handleCheckout = async (type: "full" | "department" | "starter") => {
    if (!currentWorkspace) {
      toast.error("Aucun workspace sélectionné");
      return;
    }

    const priceMap = {
      full: STRIPE_PRICES.fullCompany,
      department: STRIPE_PRICES.department,
      starter: STRIPE_PRICES.starter,
    };

    setCreatingCheckout(type);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          priceId: priceMap[type],
          workspaceId: currentWorkspace.id,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(t("billing.page.checkoutError"));
    } finally {
      setCreatingCheckout(null);
    }
  };

  const isLoading = catalogLoading || subscriptionLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isPaid = subscription?.status === "active" && subscription?.plan !== "free";

  return (
    <PermissionGuard permission="manage_billing">
      <div className="space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{t("billing.page.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("billing.page.subtitle")}
          </p>
        </header>

        {/* Billing Overview Component */}
        <BillingOverview />

        {/* Full Company Upgrade Card - only show if not full company and not founder */}
        {!isFullCompany && !isFounder && !isPaid && (
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("billing.page.upgradeToFull")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("billing.page.fullCompanyDetails", { employees: TOTAL_AI_WORKFORCE })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {FULL_COMPANY_PRICE.toLocaleString()}€
                      <span className="text-sm font-normal text-muted-foreground">{t("billing.page.perMonth")}</span>
                    </div>
                    <Badge variant="success" className="text-xs">
                      {t("billing.page.savings", { amount: ((9 * PRICE_PER_DEPT) - FULL_COMPANY_PRICE).toLocaleString() })}
                    </Badge>
                  </div>
                  <Button 
                    variant="hero" 
                    onClick={() => handleCheckout("full")}
                    disabled={creatingCheckout === "full"}
                  >
                    {creatingCheckout === "full" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">{t("billing.page.availableDepartments")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("billing.page.pricePerDepartment", { price: PRICE_PER_DEPT.toLocaleString() })}
              </p>
            </div>
            {isFullCompany && (
              <Badge variant="success">
                <Crown className="w-3 h-3 mr-1" />
                {t("billing.page.allIncluded")}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {paidServices.map(service => {
              const Icon = SERVICE_ICONS[service.slug] || Puzzle;
              const employees = DEPT_EMPLOYEES[service.slug] || 3;
              const isEnabled = hasService(service.slug);
              const isToggling = togglingService === service.id;

              return (
                <Card 
                  key={service.id} 
                  className={`transition-all ${isEnabled ? "border-primary/30 bg-primary/5" : ""}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isEnabled ? "bg-primary/20" : "bg-secondary"}`}>
                          <Icon className={`w-5 h-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                        <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            {t("billing.page.aiEmployees", { count: employees })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isToggling && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                        <Switch
                          checked={isEnabled || isFullCompany}
                          onCheckedChange={(checked) => handleToggleService(service, checked)}
                          disabled={isFullCompany || isToggling}
                        />
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Core OS (always included) */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Core OS
            <Badge variant="outline">{t("billing.page.alwaysFree")}</Badge>
          </h2>
          <Card variant="feature">
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {[
                  t("billing.page.coreFeatures.workspaceSites"),
                  t("billing.page.coreFeatures.rbac"),
                  t("billing.page.coreFeatures.auditLog"),
                  t("billing.page.coreFeatures.scheduler"),
                  t("billing.page.coreFeatures.aiGateway"),
                  t("billing.page.coreFeatures.integrations"),
                  t("billing.page.coreFeatures.voiceCommands"),
                  t("billing.page.coreFeatures.cockpit")
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Payment Info */}
        <section>
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                {t("billing.page.securePayment")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-xl bg-secondary/50 text-center border border-dashed border-border">
                <CreditCard className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mb-3">
                  {isPaid ? t("billing.page.cardRegistered") : t("billing.page.noCardRegistered")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPaid ? t("billing.page.manageViaPortal") : t("billing.page.cardOnFirstPayment")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                🔒 {t("billing.page.secureViaStripe")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </PermissionGuard>
  );
}
