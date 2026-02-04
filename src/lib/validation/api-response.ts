import { z } from 'zod';

/**
 * API Response validation schemas
 * Ensures type safety for all API responses
 */

// Generic API error response
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

// Pagination response
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    count: z.number().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
    hasMore: z.boolean().optional(),
  });

// Standard success response
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

// Edge function response wrapper
export const edgeFunctionResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  artifact: z.unknown().optional(),
  metadata: z.object({
    provider: z.string().optional(),
    model: z.string().optional(),
    tokens_in: z.number().optional(),
    tokens_out: z.number().optional(),
    duration_ms: z.number().optional(),
  }).optional(),
});

// Validate API response with fallback
export function validateApiResponse<T>(
  data: unknown,
  schema: z.ZodType<T>,
  fallback: T
): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('API response validation failed:', result.error.issues);
  return fallback;
}

// Safe JSON parse with validation
export function safeJsonParse<T>(
  jsonString: string,
  schema: z.ZodType<T>,
  fallback: T
): T {
  try {
    const parsed = JSON.parse(jsonString);
    return validateApiResponse(parsed, schema, fallback);
  } catch {
    return fallback;
  }
}
