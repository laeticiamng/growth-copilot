import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Stripe product IDs for Growth OS plans
const PRODUCT_PLANS = {
  "prod_TuaO9YlvplPsJl": "full_company",
  "prod_TuaORHrJ1nfbln": "department",
  "prod_TudFAeXRQEJpdY": "starter",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is founder (special unlimited access)
    const FOUNDER_EMAILS = ["m.laeticia@hotmail.fr"];
    if (FOUNDER_EMAILS.includes(user.email.toLowerCase())) {
      logStep("Founder detected - returning unlimited access");
      return new Response(JSON.stringify({
        subscribed: true,
        plan: "founder",
        is_founder: true,
        is_full_company: true,
        subscription_end: null, // Never expires
        features: {
          all_departments: true,
          ai_employees: 39,
          sites_limit: 1000,
          runs_limit: 100000,
          users_limit: 1000,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        features: {
          all_departments: false,
          ai_employees: 0,
          sites_limit: 1,
          runs_limit: 10,
          users_limit: 2,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10, // Get all active subscriptions
    });
    const hasActiveSub = subscriptions.data.length > 0;
    
    let plan = "free";
    let isFullCompany = false;
    let subscriptionEnd = null;
    let features = {
      all_departments: false,
      ai_employees: 0,
      sites_limit: 1,
      runs_limit: 10,
      users_limit: 2,
    };

    if (hasActiveSub) {
      // Determine the highest tier subscription
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Get product ID from subscription items
      const productId = subscription.items.data[0]?.price?.product as string;
      const mappedPlan = PRODUCT_PLANS[productId as keyof typeof PRODUCT_PLANS];
      
      if (mappedPlan) {
        plan = mappedPlan;
        logStep("Determined subscription plan", { productId, plan });

        // Set features based on plan
        if (plan === "full_company") {
          isFullCompany = true;
          features = {
            all_departments: true,
            ai_employees: 39,
            sites_limit: -1, // Unlimited
            runs_limit: -1, // Unlimited
            users_limit: -1, // Unlimited
          };
        } else if (plan === "starter") {
          features = {
            all_departments: true, // Lite access to all
            ai_employees: 11, // 1 per department
            sites_limit: 1,
            runs_limit: 50,
            users_limit: 2,
          };
        } else if (plan === "department") {
          // Count department subscriptions
          const deptCount = subscriptions.data.filter(
            (sub: Stripe.Subscription) => PRODUCT_PLANS[sub.items.data[0]?.price?.product as keyof typeof PRODUCT_PLANS] === "department"
          ).length;
          
          features = {
            all_departments: false,
            ai_employees: deptCount * 4, // Average 4 employees per dept
            sites_limit: 5 * deptCount,
            runs_limit: 200 * deptCount,
            users_limit: 5 + (deptCount * 3),
          };
        }
      }
    } else {
      logStep("No active subscription found");
    }

    // Update workspace_subscriptions in database
    const { data: workspaces } = await supabaseClient
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id);

    if (workspaces && workspaces.length > 0) {
      for (const ws of workspaces) {
        await supabaseClient
          .from('workspace_subscriptions')
          .upsert({
            workspace_id: ws.id,
            plan: plan,
            status: hasActiveSub ? 'active' : 'inactive',
            is_full_company: isFullCompany,
            stripe_customer_id: hasActiveSub ? customerId : null,
            stripe_subscription_id: hasActiveSub ? subscriptions.data[0].id : null,
            current_period_end: subscriptionEnd,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'workspace_id' });
      }
      logStep("Updated workspace subscriptions in database");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      is_full_company: isFullCompany,
      subscription_end: subscriptionEnd,
      features,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
