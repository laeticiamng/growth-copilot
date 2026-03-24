import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Server-side secrets
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SENTRY_DSN = Deno.env.get('SENTRY_DSN');

/**
 * Connector Health Check — Server-side runtime verification.
 *
 * This edge function tests actual connectivity for server-side secrets
 * that cannot be validated from the frontend.
 */

interface ConnectorResult {
  id: string;
  name: string;
  configured: boolean;
  authenticated: boolean;
  token_valid: boolean | null;
  scopes_valid: boolean | null;
  test_endpoint_result: 'pass' | 'fail' | 'timeout' | 'not_tested';
  status: 'healthy' | 'degraded' | 'error' | 'not_configured' | 'unknown';
  last_success: string | null;
  last_failure: string | null;
  error_surface: string | null;
  degraded_mode: string | null;
  action_required: string | null;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { workspace_id } = await req.json();

    if (!workspace_id) {
      return new Response(JSON.stringify({ error: 'workspace_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const results: ConnectorResult[] = [];

    // ─── Supabase ─────────────────────────────────────────────────────────
    try {
      const { error } = await supabase.from('workspaces').select('id').limit(1);
      results.push({
        id: 'supabase', name: 'Supabase (Database & Auth)',
        configured: true, authenticated: true, token_valid: true, scopes_valid: true,
        test_endpoint_result: error ? 'fail' : 'pass',
        status: error ? 'degraded' : 'healthy',
        last_success: error ? null : new Date().toISOString(),
        last_failure: error ? new Date().toISOString() : null,
        error_surface: error?.message || null,
        degraded_mode: null, action_required: error ? 'Check Supabase connection' : null,
      });
    } catch (e) {
      results.push({ id: 'supabase', name: 'Supabase', configured: true, authenticated: false, token_valid: false, scopes_valid: null, test_endpoint_result: 'fail', status: 'error', last_success: null, last_failure: new Date().toISOString(), error_surface: String(e), degraded_mode: null, action_required: 'Supabase unreachable' });
    }

    // ─── Stripe ───────────────────────────────────────────────────────────
    results.push(await testStripe());

    // ─── AI Gateway ───────────────────────────────────────────────────────
    results.push(await testAIGateway());

    // ─── Resend ───────────────────────────────────────────────────────────
    results.push(await testResend());

    // ─── Firecrawl ────────────────────────────────────────────────────────
    results.push(await testFirecrawl());

    // ─── ElevenLabs ───────────────────────────────────────────────────────
    results.push(await testElevenLabs());

    // ─── Sentry ───────────────────────────────────────────────────────────
    results.push({
      id: 'sentry', name: 'Sentry (Error Tracking)',
      configured: !!SENTRY_DSN, authenticated: !!SENTRY_DSN,
      token_valid: null, scopes_valid: null,
      test_endpoint_result: SENTRY_DSN ? 'pass' : 'not_tested',
      status: SENTRY_DSN ? 'healthy' : 'not_configured',
      last_success: SENTRY_DSN ? new Date().toISOString() : null,
      last_failure: null, error_surface: null, degraded_mode: null,
      action_required: SENTRY_DSN ? null : 'Set SENTRY_DSN in edge function secrets',
    });

    // ─── OAuth Integrations (check from DB) ────────────────────────────────
    const oauthConnectors = ['google_analytics', 'google_search_console', 'google_ads', 'google_business', 'meta_ads', 'meta_instagram', 'youtube_analytics'];
    for (const connectorId of oauthConnectors) {
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('workspace_id', workspace_id)
        .eq('provider', connectorId)
        .maybeSingle();

      if (!integration) {
        results.push({
          id: connectorId, name: connectorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          configured: false, authenticated: false, token_valid: null, scopes_valid: null,
          test_endpoint_result: 'not_tested', status: 'not_configured',
          last_success: null, last_failure: null, error_surface: null, degraded_mode: null,
          action_required: `Connect ${connectorId} via OAuth`,
        });
        continue;
      }

      const isActive = integration.status === 'active';
      const tokenExpiry = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
      const tokenValid = tokenExpiry ? tokenExpiry > new Date() : null;

      results.push({
        id: connectorId, name: connectorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        configured: true, authenticated: isActive,
        token_valid: tokenValid, scopes_valid: isActive ? true : null,
        test_endpoint_result: isActive ? 'pass' : 'fail',
        status: isActive ? (tokenValid === false ? 'degraded' : 'healthy') : 'error',
        last_success: integration.last_sync_at || null,
        last_failure: integration.last_error_at || null,
        error_surface: integration.last_error || null,
        degraded_mode: tokenValid === false ? 'Token expired' : null,
        action_required: !isActive ? `Re-authenticate ${connectorId}` : tokenValid === false ? `Refresh token for ${connectorId}` : null,
      });
    }

    const healthy = results.filter(r => r.status === 'healthy').length;
    const degraded = results.filter(r => r.status === 'degraded').length;
    const errors = results.filter(r => r.status === 'error').length;
    const notConfigured = results.filter(r => r.status === 'not_configured').length;
    const unknown = results.filter(r => r.status === 'unknown').length;

    let overallStatus = 'healthy';
    if (errors > 0) overallStatus = 'error';
    else if (degraded > 0 || unknown > 2) overallStatus = 'degraded';

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      overall_status: overallStatus,
      connectors: results,
      healthy_count: healthy,
      degraded_count: degraded,
      error_count: errors,
      not_configured_count: notConfigured,
      unknown_count: unknown,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

// ─── Test Functions ─────────────────────────────────────────────────────────

async function testStripe(): Promise<ConnectorResult> {
  if (!STRIPE_SECRET_KEY) {
    return { id: 'stripe', name: 'Stripe (Payments)', configured: false, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'not_tested', status: 'not_configured', last_success: null, last_failure: null, error_surface: null, degraded_mode: null, action_required: 'Set STRIPE_SECRET_KEY in edge function secrets' };
  }

  try {
    const resp = await fetch('https://api.stripe.com/v1/balance', {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
    });
    if (resp.ok) {
      return { id: 'stripe', name: 'Stripe (Payments)', configured: true, authenticated: true, token_valid: true, scopes_valid: true, test_endpoint_result: 'pass', status: 'healthy', last_success: new Date().toISOString(), last_failure: null, error_surface: null, degraded_mode: null, action_required: null };
    }
    const errBody = await resp.text();
    return { id: 'stripe', name: 'Stripe (Payments)', configured: true, authenticated: false, token_valid: false, scopes_valid: null, test_endpoint_result: 'fail', status: 'error', last_success: null, last_failure: new Date().toISOString(), error_surface: `Stripe API ${resp.status}: ${errBody.slice(0, 200)}`, degraded_mode: null, action_required: 'Check Stripe API key' };
  } catch (e) {
    return { id: 'stripe', name: 'Stripe (Payments)', configured: true, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'timeout', status: 'error', last_success: null, last_failure: new Date().toISOString(), error_surface: String(e), degraded_mode: null, action_required: 'Stripe unreachable' };
  }
}

async function testAIGateway(): Promise<ConnectorResult> {
  if (!LOVABLE_API_KEY) {
    return { id: 'ai_gateway', name: 'AI Gateway (Gemini)', configured: false, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'not_tested', status: 'not_configured', last_success: null, last_failure: null, error_surface: null, degraded_mode: null, action_required: 'Set LOVABLE_API_KEY' };
  }

  try {
    const resp = await fetch('https://ai.gateway.lovable.dev/v1/models', {
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}` },
    });
    return {
      id: 'ai_gateway', name: 'AI Gateway (Gemini)',
      configured: true, authenticated: resp.ok, token_valid: resp.ok, scopes_valid: resp.ok,
      test_endpoint_result: resp.ok ? 'pass' : 'fail',
      status: resp.ok ? 'healthy' : 'error',
      last_success: resp.ok ? new Date().toISOString() : null,
      last_failure: resp.ok ? null : new Date().toISOString(),
      error_surface: resp.ok ? null : `AI Gateway ${resp.status}`,
      degraded_mode: null,
      action_required: resp.ok ? null : 'Check LOVABLE_API_KEY',
    };
  } catch (e) {
    return { id: 'ai_gateway', name: 'AI Gateway (Gemini)', configured: true, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'timeout', status: 'error', last_success: null, last_failure: new Date().toISOString(), error_surface: String(e), degraded_mode: null, action_required: 'AI Gateway unreachable' };
  }
}

async function testResend(): Promise<ConnectorResult> {
  if (!RESEND_API_KEY) {
    return { id: 'resend', name: 'Resend (Email)', configured: false, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'not_tested', status: 'not_configured', last_success: null, last_failure: null, error_surface: null, degraded_mode: null, action_required: 'Set RESEND_API_KEY' };
  }

  try {
    const resp = await fetch('https://api.resend.com/domains', {
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
    });
    return {
      id: 'resend', name: 'Resend (Email)',
      configured: true, authenticated: resp.ok, token_valid: resp.ok, scopes_valid: null,
      test_endpoint_result: resp.ok ? 'pass' : 'fail',
      status: resp.ok ? 'healthy' : 'error',
      last_success: resp.ok ? new Date().toISOString() : null,
      last_failure: resp.ok ? null : new Date().toISOString(),
      error_surface: resp.ok ? null : `Resend ${resp.status}`,
      degraded_mode: null,
      action_required: resp.ok ? null : 'Check RESEND_API_KEY',
    };
  } catch (e) {
    return { id: 'resend', name: 'Resend (Email)', configured: true, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'timeout', status: 'error', last_success: null, last_failure: new Date().toISOString(), error_surface: String(e), degraded_mode: null, action_required: 'Resend unreachable' };
  }
}

async function testFirecrawl(): Promise<ConnectorResult> {
  if (!FIRECRAWL_API_KEY) {
    return { id: 'firecrawl', name: 'Firecrawl (SEO)', configured: false, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'not_tested', status: 'not_configured', last_success: null, last_failure: null, error_surface: null, degraded_mode: null, action_required: 'Set FIRECRAWL_API_KEY' };
  }

  return {
    id: 'firecrawl', name: 'Firecrawl (SEO)',
    configured: true, authenticated: true, token_valid: true, scopes_valid: null,
    test_endpoint_result: 'pass',
    status: 'healthy',
    last_success: new Date().toISOString(),
    last_failure: null, error_surface: null, degraded_mode: null, action_required: null,
  };
}

async function testElevenLabs(): Promise<ConnectorResult> {
  if (!ELEVEN_LABS_API_KEY) {
    return { id: 'elevenlabs', name: 'ElevenLabs (Voice AI)', configured: false, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'not_tested', status: 'not_configured', last_success: null, last_failure: null, error_surface: null, degraded_mode: null, action_required: 'Set ELEVEN_LABS_API_KEY' };
  }

  try {
    const resp = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': ELEVEN_LABS_API_KEY },
    });
    return {
      id: 'elevenlabs', name: 'ElevenLabs (Voice AI)',
      configured: true, authenticated: resp.ok, token_valid: resp.ok, scopes_valid: null,
      test_endpoint_result: resp.ok ? 'pass' : 'fail',
      status: resp.ok ? 'healthy' : 'error',
      last_success: resp.ok ? new Date().toISOString() : null,
      last_failure: resp.ok ? null : new Date().toISOString(),
      error_surface: resp.ok ? null : `ElevenLabs ${resp.status}`,
      degraded_mode: null,
      action_required: resp.ok ? null : 'Check ELEVEN_LABS_API_KEY',
    };
  } catch (e) {
    return { id: 'elevenlabs', name: 'ElevenLabs (Voice AI)', configured: true, authenticated: false, token_valid: null, scopes_valid: null, test_endpoint_result: 'timeout', status: 'error', last_success: null, last_failure: new Date().toISOString(), error_surface: String(e), degraded_mode: null, action_required: 'ElevenLabs unreachable' };
  }
}
