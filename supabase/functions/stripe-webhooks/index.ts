import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse the webhook payload
    const body = await req.text();
    const event: StripeEvent = JSON.parse(body);

    console.log(`Processing Stripe event: ${event.type} (${event.id})`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Record<string, unknown>;
        const workspaceId = session.client_reference_id as string;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (workspaceId) {
          // Update workspace subscription
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

          // Log audit event
          await supabase.rpc("log_audit_event", {
            _workspace_id: workspaceId,
            _entity_type: "subscription",
            _entity_id: subscriptionId,
            _action: "subscription_created",
            _actor_id: null,
            _actor_type: "system",
            _changes: { plan: "growth", status: "active" },
            _context: { stripe_event_id: event.id },
          });

          console.log(`Subscription activated for workspace ${workspaceId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Record<string, unknown>;
        const subscriptionId = subscription.id as string;
        const status = subscription.status as string;

        // Find workspace by subscription ID
        const { data: workspaceSub } = await supabase
          .from("workspace_subscriptions")
          .select("workspace_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (workspaceSub) {
          // Map Stripe status to our status
          const planStatus = status === "active" ? "active" : 
                            status === "past_due" ? "past_due" :
                            status === "canceled" ? "canceled" : "inactive";

          await supabase
            .from("workspace_subscriptions")
            .update({
              status: planStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("workspace_id", workspaceSub.workspace_id);

          console.log(`Subscription ${subscriptionId} updated to ${planStatus}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Record<string, unknown>;
        const subscriptionId = subscription.id as string;

        // Find and downgrade workspace
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
          await supabase
            .from("workspace_services")
            .update({ enabled: false })
            .eq("workspace_id", workspaceSub.workspace_id)
            .neq("service_id", (
              await supabase
                .from("services_catalog")
                .select("id")
                .eq("is_core", true)
                .single()
            ).data?.id);

          console.log(`Subscription canceled for workspace ${workspaceSub.workspace_id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Record<string, unknown>;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { data: workspaceSub } = await supabase
            .from("workspace_subscriptions")
            .select("workspace_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (workspaceSub) {
            // Reset quotas for new billing period
            await supabase
              .from("workspace_quotas")
              .update({
                monthly_tokens_used: 0,
                current_period_start: new Date().toISOString().split("T")[0],
              })
              .eq("workspace_id", workspaceSub.workspace_id);

            console.log(`Quotas reset for workspace ${workspaceSub.workspace_id}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Record<string, unknown>;
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

            // Create notification
            await supabase.from("notifications").insert({
              workspace_id: workspaceSub.workspace_id,
              type: "billing",
              title: "Paiement échoué",
              message: "Votre paiement a échoué. Veuillez mettre à jour vos informations de paiement.",
              severity: "error",
            });

            console.log(`Payment failed for workspace ${workspaceSub.workspace_id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
