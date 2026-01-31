/**
 * Shared validation utilities for edge functions
 * Centralized input validation and sanitization
 */

/**
 * Validate UUID format
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format and check for SSRF vulnerabilities
 */
export function isValidUrl(url: string, options: {
  allowedProtocols?: string[];
  blockPrivateIPs?: boolean;
} = {}): { valid: boolean; error?: string } {
  const { 
    allowedProtocols = ['https:', 'http:'],
    blockPrivateIPs = true 
  } = options;

  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: `Invalid protocol: ${parsed.protocol}` };
    }

    // Check for localhost/private IPs (SSRF protection)
    if (blockPrivateIPs) {
      const hostname = parsed.hostname.toLowerCase();
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return { valid: false, error: 'Localhost URLs not allowed' };
      }

      // Block private IP ranges
      const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^0\./,
      ];

      if (privateRanges.some(r => r.test(hostname))) {
        return { valid: false, error: 'Private IP addresses not allowed' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .substring(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate workspace_id parameter
 */
export function validateWorkspaceId(workspaceId: unknown): { valid: boolean; error?: string } {
  if (!workspaceId || typeof workspaceId !== 'string') {
    return { valid: false, error: 'workspace_id is required' };
  }
  if (!isValidUUID(workspaceId)) {
    return { valid: false, error: 'workspace_id must be a valid UUID' };
  }
  return { valid: true };
}

/**
 * Validate site_id parameter
 */
export function validateSiteId(siteId: unknown): { valid: boolean; error?: string } {
  if (!siteId || typeof siteId !== 'string') {
    return { valid: false, error: 'site_id is required' };
  }
  if (!isValidUUID(siteId)) {
    return { valid: false, error: 'site_id must be a valid UUID' };
  }
  return { valid: true };
}

/**
 * Validate request body and extract required fields
 */
export function validateRequestBody<T extends Record<string, unknown>>(
  body: unknown,
  requiredFields: string[]
): { valid: boolean; data?: T; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  for (const field of requiredFields) {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: data as T, errors: [] };
}

/**
 * Create validation error response
 */
export function validationErrorResponse(
  errors: string[],
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Validation failed', 
      code: 'VALIDATION_ERROR',
      details: errors 
    }),
    {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Rate limiting check (returns remaining requests)
 * Note: This is a simple in-memory check - in production use Redis
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Rate limit exceeded response
 */
export function rateLimitResponse(
  resetAt: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded', 
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000)
    }),
    {
      status: 429,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000))
      },
    }
  );
}
