import { z } from 'zod';

// Common validation schemas

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

export const urlSchema = z
  .string()
  .min(1, 'URL requise')
  .url('URL invalide')
  .max(2048, 'URL trop longue');

export const siteSchema = z.object({
  url: urlSchema,
  name: z.string().max(100, 'Nom trop long').optional(),
  sector: z.string().max(50).optional(),
  geographic_zone: z.string().max(100).optional(),
  language: z.enum(['fr', 'en', 'es', 'de']).default('fr'),
  business_type: z.enum(['local', 'ecommerce', 'service', 'saas']).optional(),
});

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  slug: z
    .string()
    .min(2, 'Minimum 2 caractères')
    .max(30, 'Maximum 30 caractères')
    .regex(/^[a-z0-9-]+$/, 'Uniquement lettres minuscules, chiffres et tirets'),
});

export const leadSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  email: emailSchema.optional(),
  phone: z.string().max(20, 'Téléphone trop long').optional(),
  company: z.string().max(100, 'Entreprise trop long').optional(),
  source: z.string().max(50).optional(),
});

export const contentBriefSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  target_keyword: z.string().max(100).optional(),
  word_count_target: z.number().min(100).max(50000).optional(),
});

export const mediaAssetSchema = z.object({
  url: urlSchema,
  title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  release_date: z.string().optional(),
});

// Validation helper
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (path && !errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}
