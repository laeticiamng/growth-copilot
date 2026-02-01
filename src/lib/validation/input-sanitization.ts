/**
 * Input Sanitization Utilities
 * Centralized validation and sanitization for user inputs
 */

import { z } from "zod";

// XSS-safe HTML entity encoding
export function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char]);
}

// URL validation with protocol whitelist
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Email validation (basic RFC 5322)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Phone validation (international format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleaned);
}

// Slug validation (URL-safe)
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
}

// Trim and normalize whitespace
export function normalizeWhitespace(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

// Remove zero-width characters and control characters
export function sanitizeText(str: string): string {
  // Remove zero-width chars, control chars (except newlines/tabs), and normalize
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control chars (keep \n, \r, \t)
    .trim();
}

// Campaign name validation
export const campaignNameSchema = z.string()
  .min(3, "Nom trop court (min 3 caractères)")
  .max(100, "Nom trop long (max 100 caractères)")
  .refine(val => !/[<>'"&]/.test(val), "Caractères spéciaux non autorisés");

// Social post content validation
export const socialPostSchema = z.string()
  .min(1, "Contenu requis")
  .max(2200, "Contenu trop long (max 2200 caractères)")
  .transform(sanitizeText);

// Lead form validation
export const leadInputSchema = z.object({
  name: z.string().min(2).max(100).transform(normalizeWhitespace),
  email: z.string().email("Email invalide").max(254),
  company: z.string().max(200).optional().transform(val => val ? normalizeWhitespace(val) : val),
  phone: z.string().optional().refine(val => !val || isValidPhone(val), "Téléphone invalide"),
  source: z.string().max(50).optional(),
});

// Workspace slug validation
export const workspaceSlugSchema = z.string()
  .min(3, "Slug trop court")
  .max(50, "Slug trop long")
  .regex(/^[a-z0-9-]+$/, "Uniquement lettres minuscules, chiffres et tirets")
  .refine(val => !val.startsWith('-') && !val.endsWith('-'), "Ne peut pas commencer ou finir par un tiret");

// Budget validation
export const budgetSchema = z.number()
  .min(0, "Budget ne peut pas être négatif")
  .max(1_000_000, "Budget trop élevé");

// Rate limit helper - simple in-memory tracker for client-side
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkClientRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Debounce helper
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Input length constants
export const INPUT_LIMITS = {
  // Text inputs
  name: { min: 2, max: 100 },
  email: { min: 5, max: 254 },
  title: { min: 3, max: 200 },
  description: { min: 0, max: 1000 },
  content: { min: 0, max: 10000 },
  slug: { min: 3, max: 50 },
  url: { min: 10, max: 2048 },
  phone: { min: 8, max: 20 },
  
  // Social
  socialPost: { min: 1, max: 2200 },
  hashtag: { min: 2, max: 50 },
  
  // Campaigns
  campaignName: { min: 3, max: 100 },
  keyword: { min: 1, max: 100 },
  
  // Numbers
  budgetMin: 0,
  budgetMax: 1_000_000,
  percentageMin: 0,
  percentageMax: 100,
} as const;
