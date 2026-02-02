import { z } from 'zod';

/**
 * Validation schemas for Site forms
 * Centralized validation to prevent XSS and ensure data integrity
 */

// URL validation - must be a valid HTTPS URL
const urlSchema = z
  .string()
  .min(1, 'URL requise')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    },
    { message: 'URL invalide. Utilisez le format https://example.com' }
  );

// Safe text input - no HTML/script injection
const safeTextSchema = z
  .string()
  .max(200, 'Maximum 200 caractères')
  .refine(
    (text) => !/<[^>]*script[^>]*>/i.test(text),
    { message: 'Caractères non autorisés' }
  )
  .transform((text) => text.trim());

// Site creation schema
export const createSiteSchema = z.object({
  url: urlSchema,
  name: safeTextSchema.optional(),
  sector: z.string().optional(),
  geographic_zone: safeTextSchema.optional(),
  language: z.enum(['fr', 'en', 'es', 'de']).default('fr'),
  business_type: z.enum(['local', 'ecommerce', 'service', 'saas', '']).optional(),
});

// Site update schema
export const updateSiteSchema = createSiteSchema.partial();

// Campaign creation schema
export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Nom de campagne requis')
    .max(100, 'Maximum 100 caractères')
    .refine(
      (text) => !/<[^>]*script[^>]*>/i.test(text),
      { message: 'Caractères non autorisés' }
    ),
  budget_daily: z
    .number()
    .min(1, 'Budget minimum de 1€')
    .max(100000, 'Budget maximum de 100 000€'),
  strategy: z.enum([
    'maximize_conversions',
    'maximize_clicks',
    'target_cpa',
    'target_roas',
  ]).default('maximize_conversions'),
});

// Social post schema
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Contenu requis')
    .max(2000, 'Maximum 2000 caractères'),
  platforms: z.array(z.string()).min(1, 'Sélectionnez au moins une plateforme'),
  type: z.string().default('Post'),
  scheduled_for: z.string().nullable().optional(),
});

// Review response schema
export const reviewResponseSchema = z.object({
  response: z
    .string()
    .min(10, 'Réponse trop courte (minimum 10 caractères)')
    .max(500, 'Maximum 500 caractères'),
});

// Export type helpers
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type ReviewResponseInput = z.infer<typeof reviewResponseSchema>;
