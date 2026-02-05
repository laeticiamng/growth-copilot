import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Helper to send transactional emails
async function sendEmail(
  template: string,
  to: string,
  data: Record<string, unknown>,
  workspaceId?: string
): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    if (!SUPABASE_URL) return;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to,
        template,
        data,
        workspace_id: workspaceId,
      }),
    });

    if (!response.ok) {
      console.log(`[STRIPE-WEBHOOKS] Email send failed: ${response.status}`);
    } else {
      console.log(`[STRIPE-WEBHOOKS] Email sent successfully: ${template} to ${to}`);
    }
  } catch (error) {
    console.log(`[STRIPE-WEBHOOKS] Email send error: ${error}`);
  }
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

// Use a generic type for the Supabase client
type SupabaseClientType = SupabaseClient<unknown, never>;

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOKS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    // deno-lint-ignore no-explicit-any
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) as any;

    // Parse the webhook payload
    const body = await req.text();
    const event: StripeEvent = JSON.parse(body);

    logStep(`Processing event: ${event.type}`, { eventId: event.id });

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(supabase, event.data.object as Record<string, unknown>, event.id);
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(supabase, event.data.object as Record<string, unknown>);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(supabase, event.data.object as Record<string, unknown>);
        break;
      }

      case "invoice.payment_succeeded": {
        await handlePaymentSucceeded(supabase, event.data.object as Record<string, unknown>);
        break;
      }

      case "invoice.payment_failed": {
        await handlePaymentFailed(supabase, event.data.object as Record<string, unknown>);
        break;
      }

      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// deno-lint-ignore no-explicit-any
async function handleCheckoutCompleted(
  supabase: any,
  session: Record<string, unknown>,
  eventId: string
) {
  const metadata = session.metadata as Record<string, string> | undefined;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const customerDetails = session.customer_details as Record<string, unknown> | undefined;
  const customerEmail = (session.customer_email as string) || (customerDetails?.email as string);
  const amountTotal = session.amount_total as number;

  logStep("Checkout completed", { customerId, subscriptionId, source: metadata?.source });

  let workspaceId: string | undefined;
  let planName = "Growth";

  // Check if this is from onboarding flow
  if (metadata?.source === "onboarding" && metadata?.user_id) {
    workspaceId = await createWorkspaceFromOnboarding(supabase, metadata, customerId, subscriptionId, eventId) ?? undefined;
    planName = metadata?.onboarding_plan_type === "full" ? "Full Company" : "Départements à la carte";
  } else if (metadata?.user_id) {
    // Existing billing flow - update workspace by client_reference_id or find by user
    workspaceId = session.client_reference_id as string;
    
    if (workspaceId) {
      await updateExistingWorkspace(supabase, workspaceId, customerId, subscriptionId, eventId);
    } else {
      logStep("No workspace ID found in session, skipping update");
    }
  }

  // Send payment confirmation email
  if (customerEmail) {
    const amount = amountTotal ? `${(amountTotal / 100).toLocaleString('fr-FR')} €` : planName === "Full Company" ? "9 000 €" : "1 900 €";
    
    await sendEmail(
      "payment_confirmation",
      customerEmail,
      {
        userName: metadata?.user_name,
        planName,
        amount,
        dashboardUrl: "https://agent-growth-automator.lovable.app/dashboard",
        invoiceUrl: session.invoice as string | undefined,
      },
      workspaceId
    );
  }
}

// deno-lint-ignore no-explicit-any
async function createWorkspaceFromOnboarding(
  supabase: any,
  metadata: Record<string, string>,
  customerId: string,
  subscriptionId: string,
  eventId: string
): Promise<string | null> {
  const userId = metadata.user_id;
  const siteName = metadata.onboarding_site_name || "Mon Workspace";
  const siteUrl = metadata.onboarding_site_url || "";
  const workspaceSlug = metadata.onboarding_workspace_slug || siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const planType = metadata.onboarding_plan_type || "full";
  
  let objectives: string[] = [];
  let selectedServices: string[] = [];
  
  try {
    objectives = JSON.parse(metadata.onboarding_objectives || "[]");
    selectedServices = JSON.parse(metadata.onboarding_selected_services || "[]");
  } catch {
    logStep("Failed to parse objectives/services from metadata");
  }

  logStep("Creating workspace from onboarding", { userId, siteName, planType });

  // Step 1: Create workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({
      name: siteName,
      slug: workspaceSlug,
      owner_id: userId,
    })
    .select()
    .single();

  if (wsError) {
    logStep("Error creating workspace", { error: wsError.message });
    return null;
  }

  const workspaceId = workspace.id;
  logStep("Workspace created", { workspaceId });

  // Step 2: Create site
  if (siteUrl) {
    const { error: siteError } = await supabase
      .from("sites")
      .insert({
        workspace_id: workspaceId,
        url: siteUrl,
        name: siteName,
        language: "fr",
        objectives,
      });

    if (siteError) {
      logStep("Error creating site", { error: siteError.message });
    } else {
      logStep("Site created", { url: siteUrl });
    }
  }

  // Step 3: Update subscription with Stripe details
  const isFullCompany = planType === "full";
  
  await supabase
    .from("workspace_subscriptions")
    .update({
      plan: "growth",
      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      is_full_company: isFullCompany,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId);

  logStep("Subscription updated", { isFullCompany });

  // Step 4: Enable services (for à la carte)
  if (!isFullCompany && selectedServices.length > 0) {
    const { data: catalog } = await supabase
      .from("services_catalog")
      .select("id, slug")
      .in("slug", selectedServices);

    if (catalog) {
      for (const service of catalog) {
        await supabase
          .from("workspace_services")
          .upsert({
            workspace_id: workspaceId,
            service_id: service.id,
            enabled: true,
            enabled_by: userId,
            enabled_at: new Date().toISOString(),
          }, { onConflict: "workspace_id,service_id" });
      }
      logStep("Services enabled", { count: catalog.length });
    }
  }

  // Step 5: Activate departments if à la carte
  if (!isFullCompany && selectedServices.length > 0) {
    for (const deptSlug of selectedServices) {
      await supabase
        .from("workspace_departments")
        .upsert({
          workspace_id: workspaceId,
          department_slug: deptSlug,
          is_active: true,
          activated_at: new Date().toISOString(),
        }, { onConflict: "workspace_id,department_slug" });
    }
    logStep("Departments activated", { departments: selectedServices });
  }

  // Step 6: Log audit event
  await supabase.rpc("log_audit_event", {
    _workspace_id: workspaceId,
    _entity_type: "subscription",
    _entity_id: subscriptionId,
    _action: "subscription_created_onboarding",
    _actor_id: userId,
    _actor_type: "user",
    _changes: { plan: "growth", status: "active", is_full_company: isFullCompany },
    _context: { stripe_event_id: eventId, source: "onboarding" },
  });

  logStep("Onboarding workspace setup complete", { workspaceId });
  
  return workspaceId;
}

// deno-lint-ignore no-explicit-any
async function updateExistingWorkspace(
  supabase: any,
  workspaceId: string,
  customerId: string,
  subscriptionId: string,
  eventId: string
) {
  await supabase
    .from("workspace_subscriptions")
    .update({
      plan: "growth",
      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId);

  await supabase.rpc("log_audit_event", {
    _workspace_id: workspaceId,
    _entity_type: "subscription",
    _entity_id: subscriptionId,
    _action: "subscription_created",
    _actor_id: null,
    _actor_type: "system",
    _changes: { plan: "growth", status: "active" },
    _context: { stripe_event_id: eventId },
  });

  logStep("Subscription activated for existing workspace", { workspaceId });
}

// deno-lint-ignore no-explicit-any
async function handleSubscriptionUpdated(
  supabase: any,
  subscription: Record<string, unknown>
) {
  const subscriptionId = subscription.id as string;
  const status = subscription.status as string;

  const { data: workspaceSub } = await supabase
    .from("workspace_subscriptions")
    .select("workspace_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (workspaceSub) {
    const planStatus = status === "active" ? "active" : 
                      status === "past_due" ? "past_due" :
                      status === "canceled" ? "canceled" : 
                      status === "trialing" ? "trialing" : "inactive";

    await supabase
      .from("workspace_subscriptions")
      .update({
        status: planStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("workspace_id", workspaceSub.workspace_id);

    logStep("Subscription updated", { subscriptionId, status: planStatus });
  }
}

// deno-lint-ignore no-explicit-any
async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Record<string, unknown>
) {
  const subscriptionId = subscription.id as string;

  const { data: workspaceSub } = await supabase
    .from("workspace_subscriptions")
    .select("workspace_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (workspaceSub) {
    await supabase
      .from("workspace_subscriptions")
      .update({
        plan: "free",
        status: "canceled",
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("workspace_id", workspaceSub.workspace_id);

    // Disable non-core services
    const { data: coreService } = await supabase
      .from("services_catalog")
      .select("id")
      .eq("is_core", true)
      .single();

    if (coreService) {
      await supabase
        .from("workspace_services")
        .update({ enabled: false })
        .eq("workspace_id", workspaceSub.workspace_id)
        .neq("service_id", coreService.id);
    }

    logStep("Subscription canceled", { workspaceId: workspaceSub.workspace_id });
  }
}

// deno-lint-ignore no-explicit-any
async function handlePaymentSucceeded(
  supabase: any,
  invoice: Record<string, unknown>
) {
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    const { data: workspaceSub } = await supabase
      .from("workspace_subscriptions")
      .select("workspace_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (workspaceSub) {
      await supabase
        .from("workspace_quotas")
        .update({
          monthly_tokens_used: 0,
          current_period_start: new Date().toISOString().split("T")[0],
        })
        .eq("workspace_id", workspaceSub.workspace_id);

      logStep("Quotas reset", { workspaceId: workspaceSub.workspace_id });
    }
  }
}

// deno-lint-ignore no-explicit-any
async function handlePaymentFailed(
  supabase: any,
  invoice: Record<string, unknown>
) {
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    const { data: workspaceSub } = await supabase
      .from("workspace_subscriptions")
      .select("workspace_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (workspaceSub) {
      await supabase
        .from("workspace_subscriptions")
        .update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("workspace_id", workspaceSub.workspace_id);

      await supabase.from("notifications").insert({
        workspace_id: workspaceSub.workspace_id,
        type: "billing",
        title: "Paiement échoué",
        message: "Votre paiement a échoué. Veuillez mettre à jour vos informations de paiement.",
        severity: "error",
      });

      logStep("Payment failed notification sent", { workspaceId: workspaceSub.workspace_id });
    }
  }
}
