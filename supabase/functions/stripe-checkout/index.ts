import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Price IDs pour chaque plan/département
const PRICE_IDS: Record<string, string> = {
  full_company: "price_1SwlDUDFa5Y9NR1IzLwG74ue",      // 9000€/mois
  starter: "price_1SwnyuDFa5Y9NR1IEQaigAaY",           // 490€/mois
  dept_marketing: "price_1SxHdWDFa5Y9NR1IShSgEnIo",    // 1900€/mois
  dept_sales: "price_1SxHdYDFa5Y9NR1IjoLhZo9L",
  dept_finance: "price_1SxHdZDFa5Y9NR1Ii3xidkqC",
  dept_security: "price_1SxHdaDFa5Y9NR1IxPqV3KlA",
  dept_product: "price_1SxHdbDFa5Y9NR1Ibc5nkfXp",
  dept_engineering: "price_1SxHddDFa5Y9NR1IZDV3RSd8",
  dept_data: "price_1SxHdeDFa5Y9NR1IRQFGTjku",
  dept_support: "price_1SxHdfDFa5Y9NR1IctUpZzhc",
  dept_governance: "price_1SxHdhDFa5Y9NR1IWwDiyuSj",
  dept_hr: "price_1SxHdiDFa5Y9NR1ItvPJUay8",
  dept_legal: "price_1SxHdjDFa5Y9NR1IoOWNywUH",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { email: user.email });

    const body = await req.json().catch(() => ({}));
    const { 
      plan_type = "full_company", 
      departments = [], 
      use_trial = false,
      onboarding_data = null 
    } = body;
    
    logStep("Request params", { plan_type, departments, use_trial, hasOnboardingData: !!onboarding_data });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Build line items based on plan type
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (plan_type === "full_company" || plan_type === "starter") {
      const priceId = PRICE_IDS[plan_type];
      if (priceId) {
        lineItems.push({ price: priceId, quantity: 1 });
      }
    } else if (plan_type === "department" && Array.isArray(departments)) {
      for (const dept of departments) {
        const priceId = PRICE_IDS[`dept_${dept}`];
        if (priceId) {
          lineItems.push({ price: priceId, quantity: 1 });
          logStep("Adding department", { dept, priceId });
        }
      }
    }

    if (lineItems.length === 0) {
      throw new Error("No valid plan or departments selected");
    }

    // Build metadata - include onboarding data for webhook to create workspace
    const metadata: Record<string, string> = {
      user_id: user.id,
      plan_type,
      departments: departments.join(","),
      source: onboarding_data ? "onboarding" : "billing",
    };

    // Add onboarding data to metadata if present
    if (onboarding_data) {
      metadata.onboarding_site_url = onboarding_data.site_url || "";
      metadata.onboarding_site_name = onboarding_data.site_name || "";
      metadata.onboarding_workspace_slug = onboarding_data.workspace_slug || "";
      metadata.onboarding_objectives = JSON.stringify(onboarding_data.objectives || []);
      metadata.onboarding_selected_services = JSON.stringify(onboarding_data.selected_services || []);
      metadata.onboarding_plan_type = onboarding_data.plan_type || "";
    }

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: onboarding_data 
        ? `${req.headers.get("origin")}/onboarding?checkout=success`
        : `${req.headers.get("origin")}/dashboard?checkout=success`,
      cancel_url: onboarding_data
        ? `${req.headers.get("origin")}/onboarding?checkout=cancelled`
        : `${req.headers.get("origin")}/dashboard/billing?checkout=cancelled`,
      metadata,
      subscription_data: {
        metadata,
      },
      locale: "fr",
      billing_address_collection: "required",
    };

    // Add trial if requested
    if (use_trial) {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        trial_period_days: 14,
      };
      logStep("Trial period enabled", { days: 14 });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
