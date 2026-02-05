import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { 
  Crown, 
  Zap, 
  Sparkles, 
  ExternalLink, 
  CreditCard, 
  FileText, 
  XCircle,
  Loader2,
  Calendar,
  Bot,
  Building2,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";

export function BillingOverview() {
  const {
    subscription,
    isLoading,
    isActive,
    isTrialing,
    isPastDue,
    isCancelled,
    hasSubscription,
    trialDaysRemaining,
    nextBillingDate,
    monthlyPrice,
    planDisplayName,
    statusInfo,
    hasStripeCustomer,
  } = useSubscriptionStatus();

  const [portalLoading, setPortalLoading] = useState(false);

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-customer-portal");

      if (error) throw error;
      
      if (data?.error) {
        if (data.code === "NO_STRIPE_CUSTOMER") {
          toast.error("Aucun compte de facturation trouvé. Veuillez d'abord souscrire à un plan.");
        } else {
          throw new Error(data.error);
        }
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Impossible d'ouvrir le portail de facturation");
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  // Empty state for no subscription
  if (!hasSubscription) {
    return (
      <ModuleEmptyState
        icon={CreditCard}
        moduleName="Facturation"
        title="Aucun abonnement actif"
        description="Choisissez un plan pour débloquer tous les agents IA et fonctionnalités de Growth OS."
        features={["39 employés IA", "11 départements", "Runs illimités", "Support prioritaire"]}
        primaryAction={{
          label: "Choisir un plan",
          href: "/onboarding",
          icon: Sparkles,
        }}
        secondaryAction={{
          label: "Voir les tarifs",
          href: "/#pricing",
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Overview Card */}
      <Card variant="gradient">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                {subscription?.plan === "founder" ? (
                  <Sparkles className="w-6 h-6 text-primary" />
                ) : subscription?.is_full_company ? (
                  <Crown className="w-6 h-6 text-primary" />
                ) : subscription?.is_starter ? (
                  <Zap className="w-6 h-6 text-primary" />
                ) : (
                  <Building2 className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">{planDisplayName}</CardTitle>
                <CardDescription className="mt-0.5 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  {subscription?.is_full_company ? "39 employés IA • 11 départements" :
                   subscription?.is_starter ? "11 employés IA • Accès Lite" :
                   `${subscription?.enabled_departments?.length || 0} département(s)`}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              {subscription?.plan === "founder" ? (
                <div className="text-3xl font-bold text-primary">∞</div>
              ) : (
                <div className="text-3xl font-bold">
                  {monthlyPrice.toLocaleString()}€
                  <span className="text-sm font-normal text-muted-foreground">/mois</span>
                </div>
              )}
              <Badge variant={statusInfo.variant} className="mt-2">
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trial warning */}
          {isTrialing && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm">
                Votre essai gratuit se termine dans <strong>{trialDaysRemaining} jours</strong>. 
                Ajoutez un moyen de paiement pour continuer.
              </span>
            </div>
          )}

          {/* Past due warning */}
          {isPastDue && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">
                Paiement en retard. Veuillez mettre à jour votre moyen de paiement pour éviter une interruption de service.
              </span>
            </div>
          )}

          {/* Next billing date */}
          {nextBillingDate && (isActive || isTrialing) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Prochain paiement le {format(nextBillingDate, "d MMMM yyyy", { locale: fr })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gestion de l'abonnement</CardTitle>
          <CardDescription>
            Gérez votre abonnement, vos factures et vos moyens de paiement via le portail Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasStripeCustomer ? (
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="default" 
                onClick={openCustomerPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Gérer mon abonnement
              </Button>
              
              <Button 
                variant="outline" 
                onClick={openCustomerPortal}
                disabled={portalLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                Voir mes factures
              </Button>
              
              {!isCancelled && (
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Votre compte n'est pas encore lié à un profil de facturation Stripe.
              </p>
              <Button asChild>
                <Link to="/onboarding">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Configurer la facturation
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
