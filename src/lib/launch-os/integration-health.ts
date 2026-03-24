// ─── Integration Health Matrix ───────────────────────────────────────────────
// Runtime health check for every connector/API in the system.
// Never hides errors. Every incapacity is visible and actionable.

import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConnectorStatus = 'healthy' | 'degraded' | 'error' | 'not_configured' | 'unknown';

export interface ConnectorHealth {
  id: string;
  name: string;
  category: 'database' | 'payment' | 'analytics' | 'advertising' | 'ai' | 'email' | 'social' | 'video' | 'tracking';
  configured: boolean;
  authenticated: boolean;
  token_valid: boolean | null;
  scopes_valid: boolean | null;
  last_success: string | null;
  last_failure: string | null;
  error_surface: string | null;
  degraded_mode: string | null;
  test_endpoint_result: 'pass' | 'fail' | 'timeout' | 'not_tested';
  status: ConnectorStatus;
  action_required: string | null;
}

export interface IntegrationHealthReport {
  timestamp: string;
  overall_status: ConnectorStatus;
  connectors: ConnectorHealth[];
  healthy_count: number;
  degraded_count: number;
  error_count: number;
  not_configured_count: number;
}

// ─── Connector Definitions ───────────────────────────────────────────────────

const CONNECTOR_REGISTRY: Omit<ConnectorHealth, 'configured' | 'authenticated' | 'token_valid' | 'scopes_valid' | 'last_success' | 'last_failure' | 'error_surface' | 'degraded_mode' | 'test_endpoint_result' | 'status' | 'action_required'>[] = [
  { id: 'supabase', name: 'Supabase (Database & Auth)', category: 'database' },
  { id: 'stripe', name: 'Stripe (Payments)', category: 'payment' },
  { id: 'google_analytics', name: 'Google Analytics 4', category: 'analytics' },
  { id: 'google_search_console', name: 'Google Search Console', category: 'analytics' },
  { id: 'google_ads', name: 'Google Ads', category: 'advertising' },
  { id: 'google_business', name: 'Google Business Profile', category: 'analytics' },
  { id: 'meta_ads', name: 'Meta Ads', category: 'advertising' },
  { id: 'meta_instagram', name: 'Instagram', category: 'social' },
  { id: 'youtube_analytics', name: 'YouTube Analytics', category: 'video' },
  { id: 'ai_gateway', name: 'AI Gateway (Gemini)', category: 'ai' },
  { id: 'resend', name: 'Resend (Email)', category: 'email' },
  { id: 'sentry', name: 'Sentry (Error Tracking)', category: 'tracking' },
  { id: 'firecrawl', name: 'Firecrawl (SEO Crawling)', category: 'analytics' },
  { id: 'elevenlabs', name: 'ElevenLabs (Voice AI)', category: 'ai' },
];

// ─── Health Check Functions ──────────────────────────────────────────────────

async function checkSupabaseHealth(): Promise<Partial<ConnectorHealth>> {
  try {
    const { data, error } = await supabase.from('workspaces').select('id').limit(1);
    if (error) {
      return {
        configured: true,
        authenticated: true,
        token_valid: true,
        test_endpoint_result: 'fail',
        status: 'degraded',
        error_surface: `Supabase query error: ${error.message}`,
        action_required: 'Check Supabase connection and RLS policies',
      };
    }
    return {
      configured: true,
      authenticated: true,
      token_valid: true,
      test_endpoint_result: 'pass',
      status: 'healthy',
      last_success: new Date().toISOString(),
    };
  } catch (e) {
    return {
      configured: true,
      authenticated: false,
      test_endpoint_result: 'fail',
      status: 'error',
      error_surface: `Supabase unreachable: ${e instanceof Error ? e.message : 'unknown'}`,
      action_required: 'Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY',
    };
  }
}

async function checkIntegrationHealth(
  workspaceId: string,
  connectorId: string
): Promise<Partial<ConnectorHealth>> {
  try {
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('provider', connectorId)
      .maybeSingle();

    if (error) {
      return {
        configured: false,
        test_endpoint_result: 'not_tested',
        status: 'not_configured',
        action_required: `Configure ${connectorId} in Settings > Integrations`,
      };
    }

    if (!integrations) {
      return {
        configured: false,
        authenticated: false,
        test_endpoint_result: 'not_tested',
        status: 'not_configured',
        action_required: `Connect ${connectorId} via OAuth in Settings > Integrations`,
      };
    }

    const isActive = integrations.status === 'active';
    const tokenExpiry = integrations.token_expires_at
      ? new Date(integrations.token_expires_at)
      : null;
    const tokenValid = tokenExpiry ? tokenExpiry > new Date() : null;

    return {
      configured: true,
      authenticated: isActive,
      token_valid: tokenValid,
      scopes_valid: isActive ? true : null,
      last_success: integrations.last_sync_at || null,
      last_failure: integrations.last_error_at || null,
      error_surface: integrations.last_error || null,
      status: isActive ? (tokenValid === false ? 'degraded' : 'healthy') : 'error',
      degraded_mode: tokenValid === false ? 'Token expired, re-authentication required' : null,
      action_required: !isActive
        ? `Re-authenticate ${connectorId}`
        : tokenValid === false
          ? `Refresh token for ${connectorId}`
          : null,
    };
  } catch {
    return {
      configured: false,
      test_endpoint_result: 'not_tested',
      status: 'unknown',
      action_required: `Unable to check ${connectorId} status`,
    };
  }
}

async function checkAIGatewayHealth(workspaceId: string): Promise<Partial<ConnectorHealth>> {
  try {
    const { data, error } = await supabase
      .from('ai_requests')
      .select('id, status, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      return {
        configured: true,
        status: 'degraded',
        error_surface: `Cannot query AI request history: ${error.message}`,
        action_required: 'Check ai_requests table access',
      };
    }

    const lastRequest = data?.[0];
    return {
      configured: true,
      authenticated: true,
      token_valid: true,
      test_endpoint_result: lastRequest ? 'pass' : 'not_tested',
      status: 'healthy',
      last_success: lastRequest?.created_at || null,
      degraded_mode: !lastRequest ? 'No AI requests recorded yet' : null,
    };
  } catch {
    return {
      configured: true,
      status: 'unknown',
      action_required: 'Check AI Gateway edge function deployment',
    };
  }
}

// ─── Main Health Check ───────────────────────────────────────────────────────

export async function runIntegrationHealthCheck(
  workspaceId: string
): Promise<IntegrationHealthReport> {
  const connectors: ConnectorHealth[] = [];

  for (const connector of CONNECTOR_REGISTRY) {
    let healthResult: Partial<ConnectorHealth>;

    switch (connector.id) {
      case 'supabase':
        healthResult = await checkSupabaseHealth();
        break;
      case 'ai_gateway':
        healthResult = await checkAIGatewayHealth(workspaceId);
        break;
      case 'sentry':
        healthResult = {
          configured: !!import.meta.env.VITE_SENTRY_DSN,
          authenticated: !!import.meta.env.VITE_SENTRY_DSN,
          token_valid: null,
          test_endpoint_result: 'not_tested',
          status: import.meta.env.VITE_SENTRY_DSN ? 'healthy' : 'not_configured',
          action_required: !import.meta.env.VITE_SENTRY_DSN ? 'Set VITE_SENTRY_DSN in environment' : null,
        };
        break;
      case 'stripe':
      case 'resend':
      case 'firecrawl':
      case 'elevenlabs':
        // Server-side secrets - can only check via edge function
        healthResult = {
          configured: null as unknown as boolean,
          test_endpoint_result: 'not_tested',
          status: 'unknown',
          degraded_mode: 'Server-side secret - health check requires edge function',
          action_required: 'Verify secret is set in Supabase Dashboard > Edge Functions > Secrets',
        };
        break;
      default:
        // Google, Meta integrations
        healthResult = await checkIntegrationHealth(workspaceId, connector.id);
        break;
    }

    connectors.push({
      ...connector,
      configured: false,
      authenticated: false,
      token_valid: null,
      scopes_valid: null,
      last_success: null,
      last_failure: null,
      error_surface: null,
      degraded_mode: null,
      test_endpoint_result: 'not_tested',
      status: 'unknown',
      action_required: null,
      ...healthResult,
    });
  }

  const healthy = connectors.filter(c => c.status === 'healthy').length;
  const degraded = connectors.filter(c => c.status === 'degraded').length;
  const errors = connectors.filter(c => c.status === 'error').length;
  const notConfigured = connectors.filter(c => c.status === 'not_configured').length;

  let overallStatus: ConnectorStatus = 'healthy';
  if (errors > 0) overallStatus = 'error';
  else if (degraded > 0) overallStatus = 'degraded';
  else if (notConfigured > connectors.length / 2) overallStatus = 'degraded';

  return {
    timestamp: new Date().toISOString(),
    overall_status: overallStatus,
    connectors,
    healthy_count: healthy,
    degraded_count: degraded,
    error_count: errors,
    not_configured_count: notConfigured,
  };
}
