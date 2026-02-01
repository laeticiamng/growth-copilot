/**
 * Centralized form validation schemas using Zod
 * All form inputs must use these schemas for validation
 */
import { z } from 'zod';

// ============ BASE SCHEMAS ============

export const emailSchema = z
  .string()
  .min(1, 'Email requis')
  .email('Email invalide')
  .max(255, 'Email trop long');

export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .max(128, 'Maximum 128 caractères')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[0-9]/, 'Au moins un chiffre');

export const phoneSchema = z
  .string()
  .regex(/^(\+|00)?[1-9][0-9 \-().]{7,}$/, 'Numéro de téléphone invalide')
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('URL invalide')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'L\'URL doit commencer par http:// ou https://'
  );

// ============ ENTITY SCHEMAS ============

export const leadFormSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  email: emailSchema,
  company: z.string().max(100, 'Nom entreprise trop long').optional().or(z.literal('')),
  phone: phoneSchema,
  source: z.enum(['direct', 'organic', 'referral', 'ads', 'social', 'other']).default('direct'),
});

export const dealFormSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  lead_id: z.string().uuid('Lead invalide'),
  value: z.number().min(0, 'Valeur doit être positive').optional(),
  probability: z.number().min(0).max(100).optional(),
});

export const campaignFormSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  budget_daily: z.number().min(1, 'Budget minimum 1€').max(100000, 'Budget trop élevé'),
  strategy: z.enum(['maximize_conversions', 'target_cpa', 'target_roas', 'maximize_clicks']),
  campaign_type: z.enum(['search', 'display', 'shopping', 'video', 'pmax']).optional(),
});

export const experimentFormSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  hypothesis: z.string().max(500, 'Hypothèse trop longue').optional(),
  page_url: urlSchema.optional().or(z.literal('')),
  test_type: z.enum(['ab', 'multivariate', 'split']).default('ab'),
});

export const offerFormSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  tier: z.enum(['starter', 'standard', 'growth', 'premium', 'enterprise']),
  price: z.number().min(0, 'Prix doit être positif'),
  price_period: z.string().default('/mois'),
  features: z.array(z.string()).min(1, 'Au moins une fonctionnalité'),
  benefits: z.array(z.string()).optional().default([]),
  guarantees: z.array(z.string()).optional().default([]),
});

export const automationRuleSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  trigger_type: z.enum(['event', 'schedule', 'condition']),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.unknown()).optional(),
  })).min(1, 'Au moins une action'),
  is_active: z.boolean().default(true),
});

export const webhookFormSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  url: urlSchema,
  events: z.array(z.string()).min(1, 'Au moins un événement'),
  secret: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const reviewRequestSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  email: emailSchema,
  phone: phoneSchema,
  gbp_profile_id: z.string().uuid('Profil GBP requis'),
});

export const reviewResponseSchema = z.object({
  response: z.string().min(1, 'Réponse requise').max(1000, 'Réponse trop longue'),
});

// Site validation schema
export const siteFormSchema = z.object({
  url: urlSchema,
  name: z.string().max(100, 'Nom trop long').optional().or(z.literal('')),
  sector: z.string().optional(),
  geographic_zone: z.string().max(100).optional(),
  language: z.enum(['fr', 'en', 'es', 'de']).default('fr'),
  business_type: z.enum(['local', 'ecommerce', 'service', 'saas', '']).optional(),
});

// Social post validation schema
export const socialPostSchema = z.object({
  content: z.string()
    .min(1, 'Contenu requis')
    .max(2200, 'Contenu trop long (max 2200 caractères)'),
  platforms: z.array(z.string()).min(1, 'Sélectionnez au moins une plateforme'),
  type: z.enum(['Post', 'Carrousel', 'Reel', 'Story']).default('Post'),
  scheduled_for: z.string().optional().nullable(),
});

// GBP Post validation schema
export const gbpPostSchema = z.object({
  title: z.string()
    .min(1, 'Titre requis')
    .max(100, 'Titre trop long'),
  content: z.string()
    .min(1, 'Contenu requis')
    .max(1500, 'Contenu trop long'),
  post_type: z.enum(['update', 'offer', 'event', 'product']).default('update'),
});

// Negative keyword schema
export const negativeKeywordSchema = z.object({
  keyword: z.string().min(1, 'Mot-clé requis').max(100),
  match_type: z.enum(['exact', 'phrase', 'broad']).default('exact'),
  level: z.enum(['campaign', 'adgroup', 'account']).default('account'),
});

// Content brief schema
export const contentBriefSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  target_keyword: z.string().max(100).optional(),
  word_count_target: z.number().min(100).max(10000).optional(),
  status: z.enum(['draft', 'review', 'approved', 'published']).default('draft'),
});

// ============ UTILITY FUNCTIONS ============

export type LeadFormData = z.infer<typeof leadFormSchema>;
export type DealFormData = z.infer<typeof dealFormSchema>;
export type CampaignFormData = z.infer<typeof campaignFormSchema>;
export type ExperimentFormData = z.infer<typeof experimentFormSchema>;
export type OfferFormData = z.infer<typeof offerFormSchema>;
export type AutomationRuleData = z.infer<typeof automationRuleSchema>;
export type WebhookFormData = z.infer<typeof webhookFormSchema>;
export type SiteFormData = z.infer<typeof siteFormSchema>;
export type SocialPostFormData = z.infer<typeof socialPostSchema>;
export type GbpPostFormData = z.infer<typeof gbpPostSchema>;
export type NegativeKeywordData = z.infer<typeof negativeKeywordSchema>;
export type ContentBriefData = z.infer<typeof contentBriefSchema>;

/**
 * Validates form data against a schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateFormData<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}

/**
 * Gets the first error message for a field
 */
export function getFieldError(
  errors: Record<string, string> | undefined,
  field: string
): string | undefined {
  return errors?.[field];
}

/**
 * Gets the first error message from errors object
 */
export function getFirstError(errors: Record<string, string>): string {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : 'Erreur de validation';
}
