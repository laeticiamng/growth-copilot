/**
 * Meta Graph API helper functions
 * Shared utilities for all Meta-related edge functions
 */

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface MetaApiError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id: string;
}

export interface MetaApiResponse<T> {
  data?: T;
  error?: MetaApiError;
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
    previous?: string;
  };
}

/**
 * Make authenticated request to Meta Graph API
 */
export async function metaGraphRequest<T>(
  endpoint: string,
  accessToken: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    params?: Record<string, string>;
    body?: Record<string, unknown>;
  } = {}
): Promise<MetaApiResponse<T>> {
  const { method = "GET", params = {}, body } = options;
  
  const url = new URL(`${GRAPH_API_BASE}${endpoint}`);
  url.searchParams.set("access_token", accessToken);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const fetchOptions: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const result = await response.json();

  if (!response.ok || result.error) {
    console.error("Meta API error:", result.error || result);
    return { error: result.error || { message: "Unknown error", type: "Unknown", code: response.status, fbtrace_id: "" } };
  }

  return result;
}

/**
 * Paginate through Meta API results
 */
export async function metaGraphPaginate<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {},
  maxPages = 10
): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | undefined = undefined;
  let pageCount = 0;

  do {
    let response: MetaApiResponse<T[]>;
    
    if (nextUrl) {
      // Use the full next URL for pagination
      const res = await fetch(`${nextUrl}&access_token=${accessToken}`);
      response = await res.json();
    } else {
      response = await metaGraphRequest<T[]>(endpoint, accessToken, { params });
    }

    if (response.error) {
      console.error("Pagination error:", response.error);
      break;
    }

    if (response.data) {
      results.push(...response.data);
    }

    nextUrl = response.paging?.next;
    pageCount++;
  } while (nextUrl && pageCount < maxPages);

  return results;
}

/**
 * Hash user data for CAPI (SHA256)
 */
export async function hashForCapi(value: string): Promise<string> {
  const normalized = value.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Format phone for CAPI (E.164 without +)
 */
export function formatPhoneForCapi(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Build CAPI event payload
 */
export interface CapiEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  action_source: "website" | "app" | "email" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
  event_source_url?: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    ct?: string[];
    st?: string[];
    zp?: string[];
    country?: string[];
    external_id?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    content_category?: string;
    num_items?: number;
    order_id?: string;
  };
  opt_out?: boolean;
}

export function buildCapiPayload(events: CapiEvent[]): { data: CapiEvent[] } {
  return { data: events };
}

/**
 * Instagram Container creation helper (for content publishing)
 */
export interface IgContainerParams {
  image_url?: string;
  video_url?: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "REELS" | "CAROUSEL" | "STORIES";
  location_id?: string;
  user_tags?: Array<{ username: string; x?: number; y?: number }>;
  children?: string[]; // For carousel
}

export async function createIgMediaContainer(
  igUserId: string,
  accessToken: string,
  params: IgContainerParams
): Promise<{ id?: string; error?: MetaApiError }> {
  const body: Record<string, unknown> = {};

  if (params.image_url) body.image_url = params.image_url;
  if (params.video_url) body.video_url = params.video_url;
  if (params.caption) body.caption = params.caption;
  if (params.media_type) body.media_type = params.media_type;
  if (params.location_id) body.location_id = params.location_id;
  if (params.user_tags) body.user_tags = params.user_tags;
  if (params.children) body.children = params.children;

  const response = await metaGraphRequest<{ id: string }>(
    `/${igUserId}/media`,
    accessToken,
    { method: "POST", body }
  );

  if (response.error) {
    return { error: response.error };
  }

  return { id: response.data?.id };
}

/**
 * Publish Instagram container
 */
export async function publishIgContainer(
  igUserId: string,
  containerId: string,
  accessToken: string
): Promise<{ id?: string; error?: MetaApiError }> {
  const response = await metaGraphRequest<{ id: string }>(
    `/${igUserId}/media_publish`,
    accessToken,
    { method: "POST", body: { creation_id: containerId } }
  );

  if (response.error) {
    return { error: response.error };
  }

  return { id: response.data?.id };
}
