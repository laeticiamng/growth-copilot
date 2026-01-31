import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getOAuthTokens, getIntegration } from "../_shared/oauth-tokens.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncGBPRequest {
  workspace_id: string;
  location_id?: string;
}

/**
 * Google Business Profile API sync
 * Syncs profile info, reviews, and insights
 * Uses encrypted OAuth tokens from oauth_tokens table
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY");

  try {
    const body: SyncGBPRequest = await req.json();
    const { workspace_id, location_id } = body;

    if (!workspace_id) {
      throw new Error("Missing required field: workspace_id");
    }

    // Authenticate user and verify workspace access
    const authResult = await validateWorkspaceAccess(
      req,
      workspace_id,
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY
    );

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    }

    if (!authResult.hasAccess) {
      return forbiddenResponse(authResult.error || "Access denied", corsHeaders);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get integration
    const integration = await getIntegration(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      workspace_id,
      "google_business_profile"
    );

    if (!integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google Business Profile integration not configured. Please connect GBP first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if encryption key is configured
    if (!TOKEN_ENCRYPTION_KEY) {
      console.error("TOKEN_ENCRYPTION_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token encryption not configured. Contact administrator.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get decrypted OAuth tokens
    const tokens = await getOAuthTokens(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      TOKEN_ENCRYPTION_KEY,
      integration.id
    );

    if (!tokens) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OAuth tokens not found or expired. Please reconnect Google Business Profile.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const syncId = crypto.randomUUID();

    // Log the sync attempt
    await supabase.from("action_log").insert({
      workspace_id,
      actor_type: "agent",
      actor_id: "sync-gbp",
      action_type: "DATA_SYNC",
      action_category: "integration",
      description: `GBP sync initiated`,
      details: { sync_id: syncId },
      is_automated: true,
      result: "pending",
    });

    console.log(`Syncing GBP data for workspace ${workspace_id}`);

    // Step 1: List accounts
    const accountsResponse = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: {
          "Authorization": `Bearer ${tokens.accessToken}`,
        },
      }
    );

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error("GBP Accounts API error:", accountsResponse.status, errorText);
      
      await supabase
        .from("action_log")
        .update({ result: "error", details: { error: errorText, sync_id: syncId } })
        .eq("workspace_id", workspace_id)
        .eq("details->>sync_id", syncId);

      return new Response(
        JSON.stringify({
          success: false,
          error: `GBP API error: ${accountsResponse.status}`,
          details: errorText,
        }),
        { status: accountsResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];

    if (accounts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sync_id: syncId,
          message: "No Google Business Profile accounts found.",
          accounts_synced: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalLocations = 0;
    let totalReviews = 0;

    // Process each account
    for (const account of accounts) {
      const accountName = account.name; // Format: accounts/{accountId}

      // Step 2: List locations for account
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress,phoneNumbers,categories,websiteUri,regularHours,metadata`,
        {
          headers: {
            "Authorization": `Bearer ${tokens.accessToken}`,
          },
        }
      );

      if (!locationsResponse.ok) {
        console.warn(`Failed to fetch locations for ${accountName}:`, locationsResponse.status);
        continue;
      }

      const locationsData = await locationsResponse.json();
      const locations = locationsData.locations || [];

      for (const location of locations) {
        const locationName = location.name; // Format: locations/{locationId}
        const locationId = locationName.split('/').pop();

        // Upsert GBP profile
        const { data: profile } = await supabase.from("gbp_profiles").upsert({
          workspace_id,
          location_id: locationId,
          name: location.title || "Untitled",
          address: location.storefrontAddress 
            ? `${location.storefrontAddress.addressLines?.join(', ') || ''}, ${location.storefrontAddress.locality || ''}`
            : null,
          phone: location.phoneNumbers?.primaryPhone || null,
          website: location.websiteUri || null,
          categories: location.categories 
            ? [location.categories.primaryCategory?.displayName, ...(location.categories.additionalCategories?.map((c: any) => c.displayName) || [])]
            : [],
          hours: location.regularHours || {},
          attributes: location.metadata || {},
        }, {
          onConflict: "workspace_id,location_id",
        }).select("id").single();

        if (!profile) continue;

        totalLocations++;

        // Step 3: Fetch reviews for this location
        const reviewsResponse = await fetch(
          `https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`,
          {
            headers: {
              "Authorization": `Bearer ${tokens.accessToken}`,
            },
          }
        );

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          const reviews = reviewsData.reviews || [];
          
          // Update profile with review stats
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum: number, r: any) => sum + (r.starRating === "FIVE" ? 5 : r.starRating === "FOUR" ? 4 : r.starRating === "THREE" ? 3 : r.starRating === "TWO" ? 2 : 1), 0) / reviews.length
            : null;

          await supabase.from("gbp_profiles").update({
            rating_avg: avgRating,
            reviews_count: reviews.length,
            last_audit_at: new Date().toISOString(),
          }).eq("id", profile.id);

          totalReviews += reviews.length;
        }
      }
    }

    // Update integration last_sync_at
    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    // Update action_log with success
    await supabase
      .from("action_log")
      .update({ 
        result: "success",
        details: { sync_id: syncId, locations_synced: totalLocations, reviews_synced: totalReviews }
      })
      .eq("workspace_id", workspace_id)
      .eq("details->>sync_id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        message: `GBP sync completed. ${totalLocations} locations, ${totalReviews} reviews synced.`,
        locations_synced: totalLocations,
        reviews_synced: totalReviews,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GBP sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
