import { z } from "zod";

// ==========================================
// CENTRALIZED VALIDATION SCHEMAS
// For input validation across the application
// ==========================================

// Base validators
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email requis")
  .email("Format email invalide")
  .max(255, "Email trop long");

export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .max(128, "Maximum 128 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule requise")
  .regex(/[a-z]/, "Au moins une minuscule requise")
  .regex(/[0-9]/, "Au moins un chiffre requis");

export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL requise")
  .url("Format URL invalide")
  .max(2048, "URL trop longue")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    "URL doit commencer par http:// ou https://"
  );

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Nom requis")
  .max(100, "Nom trop long (max 100 caractères)")
  .regex(/^[^<>{}[\]\\\/]*$/, "Caractères spéciaux non autorisés");

export const textSchema = z
  .string()
  .trim()
  .max(10000, "Texte trop long");

export const shortTextSchema = z
  .string()
  .trim()
  .max(500, "Texte trop long (max 500 caractères)");

// ==========================================
// ENTITY SCHEMAS
// ==========================================

// Site creation/update
export const siteSchema = z.object({
  url: urlSchema,
  name: nameSchema.optional(),
  sector: z.string().max(50).optional(),
  geographic_zone: z.string().max(100).optional(),
  language: z.enum(["fr", "en", "es", "de"]).default("fr"),
  business_type: z.enum(["local", "ecommerce", "service", "saas"]).optional(),
});

export type SiteInput = z.infer<typeof siteSchema>;

// Workspace creation
export const workspaceSchema = z.object({
  name: nameSchema,
  slug: z
    .string()
    .trim()
    .min(3, "Minimum 3 caractères")
    .max(50, "Maximum 50 caractères")
    .regex(/^[a-z0-9-]+$/, "Uniquement lettres minuscules, chiffres et tirets"),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;

// Content Brief
export const contentBriefSchema = z.object({
  title: nameSchema,
  target_keyword: z.string().max(200).optional(),
  word_count_target: z.number().min(100).max(50000).optional(),
  status: z.enum(["draft", "in_progress", "review", "published"]).default("draft"),
});

export type ContentBriefInput = z.infer<typeof contentBriefSchema>;

// Campaign
export const campaignSchema = z.object({
  name: nameSchema,
  budget_daily: z.number().min(0).max(100000),
  strategy: z.enum(["maximize_conversions", "target_cpa", "target_roas", "maximize_clicks"]),
  target_cpa: z.number().min(0).optional(),
  target_roas: z.number().min(0).optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

// Experiment
export const experimentSchema = z.object({
  name: nameSchema,
  hypothesis: textSchema.optional(),
  page_url: urlSchema.optional(),
  test_type: z.enum(["ab", "sequential", "multivariate"]).default("ab"),
});

export type ExperimentInput = z.infer<typeof experimentSchema>;

// GBP Post
export const gbpPostSchema = z.object({
  title: shortTextSchema.optional(),
  content: textSchema,
  post_type: z.enum(["update", "offer", "event", "product"]).default("update"),
  cta_type: z.string().max(50).optional(),
  cta_url: urlSchema.optional(),
});

export type GBPPostInput = z.infer<typeof gbpPostSchema>;

// Lead
export const leadSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  source: z.string().max(50).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// Contact form (public)
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: z
    .string()
    .trim()
    .min(10, "Message trop court (minimum 10 caractères)")
    .max(2000, "Message trop long (max 2000 caractères)"),
  phone: z.string().max(30).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Safely validate and parse input
 * Returns { success: true, data } or { success: false, error }
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Get first error message from ZodError
 */
export function getFirstError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message || "Validation error";
}

/**
 * Format all errors as key-value map
 */
export function formatErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

// ==========================================
// SANITIZATION HELPERS
// ==========================================

/**
 * Sanitize HTML content to prevent XSS
 * Removes all HTML tags
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Sanitize URL for external links
 * Prevents javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Encode for URL parameters
 */
export function encodeUrlParam(value: string): string {
  return encodeURIComponent(value.trim());
}
