import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "./useWorkspace";

export interface SubscriptionStatus {
  id: string;
  plan: string;
  status: string;
  is_full_company: boolean;
  is_starter: boolean;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  enabled_departments: string[] | null;
}

export function useSubscriptionStatus() {
  const { currentWorkspace } = useWorkspace();

  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription-status", currentWorkspace?.id],
    queryFn: async (): Promise<SubscriptionStatus | null> => {
      if (!currentWorkspace?.id) return null;

      const { data, error } = await supabase
        .from("workspace_subscriptions")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .maybeSingle();

      if (error) throw error;
      return data as SubscriptionStatus | null;
    },
    enabled: !!currentWorkspace?.id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Calculate derived states
  const isActive = subscription?.status === "active";
  const isTrialing = subscription?.status === "trialing";
  const isPastDue = subscription?.status === "past_due";
  const isCancelled = subscription?.status === "cancelled" || subscription?.status === "canceled";
  const hasSubscription = !!subscription && subscription.plan !== "free";

  // Calculate trial days remaining
  const trialDaysRemaining = subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Calculate next billing date
  const nextBillingDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  // Get price based on plan
  const getMonthlyPrice = () => {
    if (!subscription) return 0;
    if (subscription.plan === "founder") return 0;
    if (subscription.is_full_company) return 9000;
    if (subscription.is_starter) return 490;
    if (subscription.plan === "department" && subscription.enabled_departments) {
      return subscription.enabled_departments.length * 1900;
    }
    return 0;
  };

  // Get plan display name
  const getPlanDisplayName = () => {
    if (!subscription || subscription.plan === "free") return "Gratuit";
    if (subscription.plan === "founder") return "Fondatrice";
    if (subscription.is_full_company) return "Full Company";
    if (subscription.is_starter) return "Starter";
    if (subscription.enabled_departments && subscription.enabled_departments.length > 0) {
      return `${subscription.enabled_departments.length} département(s)`;
    }
    return subscription.plan;
  };

  // Get status display info
  const getStatusInfo = (): { label: string; variant: "success" | "warning" | "destructive" | "secondary" } => {
    if (isActive) return { label: "Actif", variant: "success" };
    if (isTrialing) return { label: `Essai (${trialDaysRemaining}j)`, variant: "secondary" };
    if (isPastDue) return { label: "Paiement en retard", variant: "warning" };
    if (isCancelled) return { label: "Annulé", variant: "destructive" };
    return { label: "Inactif", variant: "secondary" };
  };

  return {
    subscription,
    isLoading,
    error,
    refetch,
    // Derived states
    isActive,
    isTrialing,
    isPastDue,
    isCancelled,
    hasSubscription,
    trialDaysRemaining,
    nextBillingDate,
    monthlyPrice: getMonthlyPrice(),
    planDisplayName: getPlanDisplayName(),
    statusInfo: getStatusInfo(),
    hasStripeCustomer: !!subscription?.stripe_customer_id,
  };
}
