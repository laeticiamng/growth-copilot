import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useServices, Service } from "@/hooks/useServices";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
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
  AlertCircle,
  Loader2,
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

// Service prices (matching landing page)
const SERVICE_PRICES: Record<string, number> = {
  marketing: 49,
  sales: 39,
  finance: 29,
  security: 29,
  product: 29,
  engineering: 29,
  data: 39,
  support: 19,
  governance: 49,
};

const FULL_COMPANY_PRICE = 299;

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
  const { isAtLeastRole } = usePermissions();
  
  const [togglingService, setTogglingService] = useState<string | null>(null);
  const [upgradingToFull, setUpgradingToFull] = useState(false);

  // Filter out core services (they're always free)
  const paidServices = catalog.filter(s => !s.is_core);
  
  // Calculate current "à la carte" total
  const alaCarteTotal = paidServices
    .filter(s => hasService(s.slug))
    .reduce((sum, s) => sum + (SERVICE_PRICES[s.slug] || 29), 0);

  // Toggle a service
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

  // Upgrade to Full Company
  const handleUpgradeToFull = async () => {
    setUpgradingToFull(true);
    // TODO: Integrate with Stripe for actual payment
    toast.info("L'intégration Stripe arrive bientôt !");
    setUpgradingToFull(false);
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

        {/* Stripe notice */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-start gap-4 py-4">
            <div className="p-2 rounded-full bg-primary/10 mt-0.5">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Intégration Stripe en cours</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Les paiements réels seront activés prochainement. Activez/désactivez les services librement pour tester.
              </p>
            </div>
          </CardContent>
        </Card>

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
                        ? "Tous les départements inclus" 
                        : `${enabledServices.filter(s => !s.is_core).length} département(s) activé(s)`
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {isFullCompany ? FULL_COMPANY_PRICE : alaCarteTotal}€
                    <span className="text-sm font-normal text-muted-foreground">/mois</span>
                  </div>
                  {!isFullCompany && alaCarteTotal > FULL_COMPANY_PRICE && (
                    <p className="text-xs text-destructive mt-1">
                      Économisez {alaCarteTotal - FULL_COMPANY_PRICE}€ avec Full Company
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {enabledServices.map(service => {
                  const Icon = SERVICE_ICONS[service.slug] || Puzzle;
                  return (
                    <Badge key={service.id} variant="secondary" className="gap-1.5 py-1">
                      <Icon className="w-3 h-3" />
                      {service.name}
                      {service.is_core && (
                        <span className="text-xs opacity-60">(Core)</span>
                      )}
                    </Badge>
                  );
                })}
              </div>
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
                  {FULL_COMPANY_PRICE}€
                  <span className="text-sm font-normal text-muted-foreground">/mois</span>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Tous les 9 départements
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Support prioritaire
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Économies garanties
                  </li>
                </ul>
                <Button 
                  variant="gradient" 
                  className="w-full" 
                  onClick={handleUpgradeToFull}
                  disabled={upgradingToFull}
                >
                  {upgradingToFull ? (
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
                Activez les services dont vous avez besoin
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
              const price = SERVICE_PRICES[service.slug] || 29;
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
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {price}€/mois
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
            <Badge variant="outline">Toujours inclus</Badge>
          </h2>
          <Card variant="feature">
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {["Workspace & Sites", "RBAC & Permissions", "Audit Log", "Scheduler & Approvals"].map(item => (
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
                Moyen de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-xl bg-secondary/50 text-center border border-dashed border-border">
                <CreditCard className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mb-3">Aucune carte enregistrée</p>
                <Button variant="outline" size="sm" disabled>
                  Ajouter une carte
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  🔒 Paiements sécurisés via Stripe
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PermissionGuard>
  );
}
