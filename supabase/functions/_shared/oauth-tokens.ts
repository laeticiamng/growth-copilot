import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptToken } from "./crypto.ts";

/**
 * Retrieve and decrypt OAuth tokens for an integration
 */
export async function getOAuthTokens(
  supabaseUrl: string,
  serviceRoleKey: string,
  encryptionKey: string,
  integrationId: string
): Promise<{ accessToken: string; refreshToken: string | null } | null> {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("access_ct, access_iv, refresh_ct, refresh_iv")
    .eq("integration_id", integrationId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch OAuth tokens:", error);
    return null;
  }

  try {
    const accessToken = await decryptToken(data.access_ct, data.access_iv, encryptionKey);
    
    let refreshToken = null;
    if (data.refresh_ct && data.refresh_iv) {
      refreshToken = await decryptToken(data.refresh_ct, data.refresh_iv, encryptionKey);
    }

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Failed to decrypt tokens:", err);
    return null;
  }
}

/**
 * Get integration by workspace and provider
 */
export async function getIntegration(
  supabaseUrl: string,
  serviceRoleKey: string,
  workspaceId: string,
  provider: string
): Promise<{ id: string; account_id: string | null; expires_at: string | null } | null> {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("integrations")
    .select("id, account_id, expires_at")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
