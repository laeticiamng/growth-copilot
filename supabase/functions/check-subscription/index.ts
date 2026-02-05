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
  "prod_TudFAeXRQEJpdY": "starter",
   // Départements individuels
   "prod_Tv7tOII8jDslPP": "dept_marketing",
   "prod_Tv7tjP9mFXcc8i": "dept_sales",
   "prod_Tv7tcI8A5btGI7": "dept_finance",
   "prod_Tv7tYGb1VW9oig": "dept_security",
   "prod_Tv7tbGZouXpDih": "dept_product",
   "prod_Tv7tPkYPvyZhkG": "dept_engineering",
   "prod_Tv7t1qLAweBdWI": "dept_data",
   "prod_Tv7tvJApiwXSY3": "dept_support",
   "prod_Tv7tw3S264TNts": "dept_governance",
   "prod_Tv7tDlqiofN0Nf": "dept_hr",
   "prod_Tv7tyrjRkuQGHL": "dept_legal",
};

// Mapping département -> agents
const DEPARTMENT_AGENTS: Record<string, { agents: string[], count: number }> = {
  marketing: { agents: ["tech_auditor", "keyword_strategist", "content_builder", "local_optimizer", "social_manager"], count: 5 },
  sales: { agents: ["offer_architect", "sales_accelerator", "lifecycle_manager", "deal_closer"], count: 4 },
  finance: { agents: ["revenue_analyst", "budget_optimizer", "billing_manager"], count: 3 },
  security: { agents: ["security_auditor", "access_controller", "threat_monitor"], count: 3 },
  product: { agents: ["feature_analyst", "ux_optimizer", "roadmap_planner", "backlog_manager"], count: 4 },
  engineering: { agents: ["code_reviewer", "performance_engineer", "devops_agent", "api_integrator", "testing_agent"], count: 5 },
  data: { agents: ["analytics_detective", "data_engineer", "ml_trainer", "reporting_agent"], count: 4 },
  support: { agents: ["reputation_guardian", "ticket_handler", "knowledge_manager"], count: 3 },
  governance: { agents: ["compliance_auditor", "policy_enforcer", "risk_assessor"], count: 3 },
  hr: { agents: ["recruitment_agent", "employee_experience"], count: 2 },
  legal: { agents: ["contract_analyzer"], count: 1 },
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
     let isStarter = false;
    let subscriptionEnd = null;
     let enabledDepartments: string[] = [];
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
           isStarter = true;
          features = {
            all_departments: true, // Lite access to all
            ai_employees: 11, // 1 per department
            sites_limit: 1,
            runs_limit: 50,
            users_limit: 2,
          };
        }
      }

     }

     // Update workspace_subscriptions in database
     const { data: workspaces } = await supabaseClient
       .from('workspaces')
       .select('id')
       .eq('owner_id', user.id);

     // Check for individual department subscriptions
     let totalDeptAgents = 0;

     if (hasActiveSub) {
       for (const sub of subscriptions.data) {
         const prodId = sub.items.data[0]?.price?.product as string;
         const subMappedPlan = PRODUCT_PLANS[prodId as keyof typeof PRODUCT_PLANS];
         
         if (subMappedPlan?.startsWith("dept_")) {
           const deptSlug = subMappedPlan.replace("dept_", "");
           enabledDepartments.push(deptSlug);
           totalDeptAgents += DEPARTMENT_AGENTS[deptSlug]?.count || 0;
 
           // Sync to workspace_departments table
           if (workspaces && workspaces.length > 0) {
             for (const ws of workspaces) {
               await supabaseClient
                 .from('workspace_departments')
                 .upsert({
                   workspace_id: ws.id,
                   department_slug: deptSlug,
                   stripe_subscription_id: sub.id,
                   is_active: true,
                   agents_count: DEPARTMENT_AGENTS[deptSlug]?.count || 0,
                   expires_at: new Date(sub.current_period_end * 1000).toISOString(),
                   updated_at: new Date().toISOString(),
                 }, { onConflict: 'workspace_id,department_slug' });
             }
           }
         }
      }
    }

     // If user has department subscriptions but no full_company/starter
     if (enabledDepartments.length > 0 && plan === "free") {
       plan = "department";
       features = {
         all_departments: false,
         ai_employees: totalDeptAgents + 2,
         sites_limit: 5 * enabledDepartments.length,
         runs_limit: 200 * enabledDepartments.length,
         users_limit: 5 + (enabledDepartments.length * 3),
       };
     }

    if (workspaces && workspaces.length > 0) {
      for (const ws of workspaces) {
        await supabaseClient
          .from('workspace_subscriptions')
          .upsert({
            workspace_id: ws.id,
            plan: plan,
            status: hasActiveSub ? 'active' : 'inactive',
            is_full_company: isFullCompany,
             is_starter: isStarter,
             enabled_departments: enabledDepartments,
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
       is_starter: isStarter,
       enabled_departments: enabledDepartments,
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
