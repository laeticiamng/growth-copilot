import { useState } from "react";
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
const FULL_COMPANY_PRICE = 9000;

// Stripe price IDs
const STRIPE_PRICES = {
  fullCompany: "price_1SwlDUDFa5Y9NR1IzLwG74ue",
  department: "price_1SwlDXDFa5Y9NR1IRhOpv4ET",
};

// Employees per department
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
};

export default function Billing() {
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

  // Filter out core services (they're always free)
  const paidServices = catalog.filter(s => !s.is_core);
  
  // Calculate current "à la carte" total
  const enabledPaidCount = paidServices.filter(s => hasService(s.slug)).length;
  const alaCarteTotal = enabledPaidCount * PRICE_PER_DEPT;
  const totalEmployees = paidServices
    .filter(s => hasService(s.slug))
    .reduce((sum, s) => sum + (DEPT_EMPLOYEES[s.slug] || 3), 0);

  // Toggle a service (for demo/trial mode)
  const handleToggleService = async (service: Service, enabled: boolean) => {
    if (isFullCompany) {
      toast.info("Tous les services sont inclus dans Full Company");
      return;
    }

    setTogglingService(service.id);
    try {
      if (enabled) {
        const { error } = await enableService(service.id);
        if (error) throw error;
        toast.success(`${service.name} activé`);
      } else {
        const { error } = await disableService(service.id);
        if (error) throw error;
        toast.success(`${service.name} désactivé`);
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    } finally {
      setTogglingService(null);
    }
  };

  // Create Stripe Checkout session
  const handleCheckout = async (type: "full" | "department") => {
    if (!currentWorkspace) {
      toast.error("Aucun workspace sélectionné");
      return;
    }

    setCreatingCheckout(type);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          priceId: type === "full" ? STRIPE_PRICES.fullCompany : STRIPE_PRICES.department,
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
      toast.error("Erreur lors de la création du paiement. L'intégration Stripe sera bientôt disponible.");
    } finally {
      setCreatingCheckout(null);
    }
  };

  // Manage billing (customer portal)
  const handleManageBilling = async () => {
    if (!subscription?.stripe_customer_id) {
      toast.info("Aucun abonnement actif");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("stripe-portal", {
        body: {
          customerId: subscription.stripe_customer_id,
          returnUrl: `${window.location.origin}/dashboard/billing`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error("Erreur lors de l'ouverture du portail de facturation");
    }
  };

  const isLoading = catalogLoading || subscriptionLoading;
  const isPaid = subscription?.status === "active" && subscription?.plan !== "free";

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

  return (
    <PermissionGuard permission="manage_billing">
      <div className="space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Facturation</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos services et votre abonnement Portable Company.
          </p>
        </header>

        {/* Current Plan Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card variant="gradient" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    {isFullCompany ? (
                      <Crown className="w-6 h-6 text-primary" />
                    ) : (
                      <Building2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {isFullCompany ? "Full Company" : "À la carte"}
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      {isFullCompany 
                        ? "37 employés IA • 9 départements" 
                        : `${totalEmployees} employés IA • ${enabledPaidCount} département(s)`
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {(isFullCompany ? FULL_COMPANY_PRICE : alaCarteTotal).toLocaleString()}€
                    <span className="text-sm font-normal text-muted-foreground">/mois</span>
                  </div>
                  {!isFullCompany && alaCarteTotal > FULL_COMPANY_PRICE && (
                    <p className="text-xs text-destructive mt-1">
                      Économisez {(alaCarteTotal - FULL_COMPANY_PRICE).toLocaleString()}€ avec Full Company
                    </p>
                  )}
                  <Badge 
                    variant={isPaid ? "success" : subscription?.status === "trialing" ? "secondary" : "outline"} 
                    className="mt-2"
                  >
                    {isPaid ? "Actif" : subscription?.status === "trialing" ? "Essai" : "Gratuit"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {enabledServices.map(service => {
                  const Icon = SERVICE_ICONS[service.slug] || Puzzle;
                  const employees = DEPT_EMPLOYEES[service.slug] || 0;
                  return (
                    <Badge key={service.id} variant="secondary" className="gap-1.5 py-1">
                      <Icon className="w-3 h-3" />
                      {service.name}
                      {!service.is_core && employees > 0 && (
                        <span className="text-xs opacity-60 flex items-center gap-0.5">
                          <Bot className="w-2.5 h-2.5" />
                          {employees}
                        </span>
                      )}
                    </Badge>
                  );
                })}
              </div>
              
              {isPaid && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" onClick={handleManageBilling}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Gérer mon abonnement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full Company Upgrade Card */}
          {!isFullCompany && (
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Crown className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle>Full Company</CardTitle>
                <div className="text-2xl font-bold mt-2">
                  {FULL_COMPANY_PRICE.toLocaleString()}€
                  <span className="text-sm font-normal text-muted-foreground">/mois</span>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    37 employés IA inclus
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Tous les 9 départements
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Économisez {((9 * PRICE_PER_DEPT) - FULL_COMPANY_PRICE).toLocaleString()}€/mois
                  </li>
                </ul>
                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={() => handleCheckout("full")}
                  disabled={creatingCheckout === "full"}
                >
                  {creatingCheckout === "full" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Passer à Full Company
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Services Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Départements disponibles</h2>
              <p className="text-sm text-muted-foreground">
                {PRICE_PER_DEPT.toLocaleString()}€/mois par département
              </p>
            </div>
            {isFullCompany && (
              <Badge variant="success">
                <Crown className="w-3 h-3 mr-1" />
                Tout inclus
              </Badge>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            {employees} employés IA
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
            <Badge variant="outline">Toujours inclus gratuitement</Badge>
          </h2>
          <Card variant="feature">
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {[
                  "Workspace & Sites",
                  "RBAC & Permissions", 
                  "Audit Log immuable",
                  "Scheduler & Approbations",
                  "AI Gateway",
                  "Integrations Hub",
                  "Voice Commands",
                  "Executive Cockpit"
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
                Paiement sécurisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPaid && subscription?.stripe_customer_id ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Carte enregistrée</p>
                      <p className="text-sm text-muted-foreground">Gérez vos informations via le portail Stripe</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleManageBilling}>
                    Modifier
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-secondary/50 text-center border border-dashed border-border">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-3">Aucune carte enregistrée</p>
                  <p className="text-xs text-muted-foreground">
                    Votre carte sera demandée lors du premier paiement
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4 text-center">
                🔒 Paiements sécurisés via Stripe • Pas d'engagement • Annulez à tout moment
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </PermissionGuard>
  );
}
