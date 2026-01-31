/**
 * Business Rules Validation
 * Centralized validation logic for platform entities
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Offer Validation
// ─────────────────────────────────────────────────────────────

export const offerSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  tier: z.enum(['starter', 'standard', 'growth', 'premium', 'enterprise']),
  price: z.number().min(0, 'Prix invalide').max(100000, 'Prix trop élevé'),
  price_period: z.string().regex(/^\/(mois|an|one-time)$/, 'Période invalide'),
  features: z.array(z.string().min(1).max(200)).min(1, 'Au moins une feature requise'),
  benefits: z.array(z.string().max(300)).optional(),
  guarantees: z.array(z.string().max(200)).optional(),
});

export type OfferInput = z.infer<typeof offerSchema>;

// ─────────────────────────────────────────────────────────────
// Lead Validation
// ─────────────────────────────────────────────────────────────

export const leadSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  company: z.string().max(100).optional(),
  phone: z.string().regex(/^(\+?[0-9\s\-]{8,20})?$/, 'Téléphone invalide').optional(),
  source: z.enum(['direct', 'organic', 'paid', 'referral', 'social', 'other']).default('direct'),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ─────────────────────────────────────────────────────────────
// Deal Validation
// ─────────────────────────────────────────────────────────────

export const dealSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  lead_id: z.string().uuid('Lead ID invalide'),
  stage_id: z.string().uuid('Stage ID invalide').optional(),
  value: z.number().min(0).max(10000000).optional(),
  probability: z.number().min(0).max(100).default(50),
  expected_close_date: z.string().datetime().optional(),
});

export type DealInput = z.infer<typeof dealSchema>;

// ─────────────────────────────────────────────────────────────
// Campaign Validation
// ─────────────────────────────────────────────────────────────

export const campaignSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
  budget_daily: z.number().min(1, 'Budget minimum 1€').max(10000, 'Budget max 10000€'),
  strategy: z.enum(['maximize_clicks', 'maximize_conversions', 'target_cpa', 'target_roas']),
  target_cpa: z.number().min(1).max(1000).optional(),
  target_roas: z.number().min(0.1).max(20).optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

// ─────────────────────────────────────────────────────────────
// Social Post Validation
// ─────────────────────────────────────────────────────────────

export const socialPostSchema = z.object({
  content: z.string().min(1, 'Contenu requis').max(2200, 'Contenu trop long (max 2200 caractères)'),
  platforms: z.array(z.enum(['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'])).min(1, 'Au moins une plateforme'),
  type: z.enum(['Post', 'Story', 'Reel', 'Carousel', 'Video']).default('Post'),
  scheduled_for: z.string().datetime().optional(),
});

export type SocialPostInput = z.infer<typeof socialPostSchema>;

// ─────────────────────────────────────────────────────────────
// Experiment Validation
// ─────────────────────────────────────────────────────────────

export const experimentSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  hypothesis: z.string().max(500).optional(),
  page_url: z.string().url('URL invalide').or(z.string().regex(/^\//, 'Chemin invalide')).optional(),
  test_type: z.enum(['ab', 'multivariate', 'redirect']).default('ab'),
  element_type: z.enum(['cta', 'headline', 'layout', 'form', 'pricing', 'other']).optional(),
});

export type ExperimentInput = z.infer<typeof experimentSchema>;

// ─────────────────────────────────────────────────────────────
// Content Brief Validation
// ─────────────────────────────────────────────────────────────

export const contentBriefSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  target_keyword: z.string().min(1, 'Mot-clé cible requis').max(100),
  word_count_target: z.number().min(300).max(10000).default(1500),
  cluster_id: z.string().uuid().optional(),
  brief_content: z.record(z.unknown()).optional(),
});

export type ContentBriefInput = z.infer<typeof contentBriefSchema>;

// ─────────────────────────────────────────────────────────────
// Review Response Validation
// ─────────────────────────────────────────────────────────────

export const reviewResponseSchema = z.object({
  reply: z.string().min(10, 'Réponse trop courte').max(1000, 'Réponse trop longue'),
});

export type ReviewResponseInput = z.infer<typeof reviewResponseSchema>;

// ─────────────────────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────────────────────

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(input);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
}

// Business rule validators
export function validateBudgetLimits(dailyBudget: number, monthlyLimit: number): boolean {
  return dailyBudget * 30 <= monthlyLimit;
}

export function validateApprovalThreshold(actionAmount: number, autoApproveLimit: number, riskLevel: string): boolean {
  if (riskLevel === 'critical' || riskLevel === 'high') return false;
  return actionAmount <= autoApproveLimit;
}

export function isValidScheduleDate(scheduledFor: string | Date): boolean {
  const date = typeof scheduledFor === 'string' ? new Date(scheduledFor) : scheduledFor;
  return date > new Date();
}

export function calculateICEScore(impact: number, confidence: number, ease: number): number {
  // Normalize to 0-100 scale
  return Math.round((impact * confidence * ease) / 10000);
}
