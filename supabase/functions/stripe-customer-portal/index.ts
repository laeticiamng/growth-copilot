import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    logStep("Stripe key verified");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get workspace and subscription info
    const { data: workspaces, error: wsError } = await supabaseClient
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (wsError) throw new Error(`Workspace error: ${wsError.message}`);
    if (!workspaces || workspaces.length === 0) {
      throw new Error("No workspace found for user");
    }
    
    const workspaceId = workspaces[0].id;
    logStep("Found workspace", { workspaceId });

    // Get stripe_customer_id from workspace_subscriptions
    const { data: subscription, error: subError } = await supabaseClient
      .from('workspace_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, status')
      .eq('workspace_id', workspaceId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw new Error(`Subscription error: ${subError.message}`);
    }

    if (!subscription?.stripe_customer_id) {
      // Try to find customer by email in Stripe
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      
      if (user.email) {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          logStep("Found customer by email", { customerId });

          // Update workspace_subscriptions with customer ID
          await supabaseClient
            .from('workspace_subscriptions')
            .upsert({
              workspace_id: workspaceId,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'workspace_id' });

          // Create portal session
          const origin = req.headers.get("origin") || "https://www.agent-growth-automator.com";
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/dashboard/billing`,
          });

          logStep("Portal session created", { url: portalSession.url });
          return new Response(JSON.stringify({ url: portalSession.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      
      throw new Error("NO_STRIPE_CUSTOMER");
    }

    const customerId = subscription.stripe_customer_id;
    logStep("Found stripe customer", { customerId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Create Customer Portal session
    const origin = req.headers.get("origin") || "https://www.agent-growth-automator.com";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/billing`,
    });

    logStep("Portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message });
    
    // Return specific error codes for frontend handling
    const isNoCustomer = message === "NO_STRIPE_CUSTOMER";
    return new Response(JSON.stringify({ 
      error: message,
      code: isNoCustomer ? "NO_STRIPE_CUSTOMER" : "PORTAL_ERROR"
    }), {
      status: isNoCustomer ? 404 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
