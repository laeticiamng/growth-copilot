/**
 * Copywriting Agent
 * Mission: Generate conversion-first, brand-safe copy for pages, emails, and ads
 */

import type { AgentArtifact, AgentAction, AgentRisk } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface BrandKit {
  toneOfVoice: string;
  targetAudience: string;
  usp: string[];
  values: string[];
  availableProofs: string[];
  allowedClaims: string[];
  forbiddenWords: string[];
  competitors: string[];
}

export interface ContentBrief {
  id: string;
  title: string;
  targetKeyword: string;
  intent: "informational" | "transactional" | "navigational" | "commercial";
  wordCountTarget: number;
  outline?: string[];
  competitors?: string[];
}

export interface Offer {
  id: string;
  name: string;
  headline: string;
  benefits: string[];
  objections: string[];
  proofs: string[];
  cta: string;
  urgency?: string;
}

export interface CopyRequest {
  type: "landing_page" | "email" | "ad" | "social" | "product_description" | "meta";
  brief?: ContentBrief;
  offer?: Offer;
  brandKit: BrandKit;
  variants?: number;
  maxLength?: number;
}

export interface CopyVariant {
  id: string;
  variant: string; // A, B, C...
  headline: string;
  subheadline?: string;
  body: string;
  cta: string;
  metaTitle?: string;
  metaDescription?: string;
  hooks?: string[];
  proofPoints?: string[];
  objectionHandlers?: string[];
  estimatedReadTime?: string;
}

export interface CopyOutput {
  requestType: string;
  variants: CopyVariant[];
  brandCompliance: BrandComplianceCheck;
  suggestions: string[];
}

export interface BrandComplianceCheck {
  passed: boolean;
  violations: BrandViolation[];
  warnings: string[];
}

export interface BrandViolation {
  type: "forbidden_word" | "unauthorized_claim" | "tone_mismatch" | "missing_proof";
  text: string;
  suggestion: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const DEFAULT_VARIANTS = 3;

const COPY_FRAMEWORKS = {
  AIDA: ["Attention", "Interest", "Desire", "Action"],
  PAS: ["Problem", "Agitation", "Solution"],
  BAB: ["Before", "After", "Bridge"],
  FAB: ["Features", "Advantages", "Benefits"],
  QUEST: ["Qualify", "Understand", "Educate", "Stimulate", "Transition"],
};

const MAX_LENGTHS = {
  landing_page: 2000,
  email: 800,
  ad: 150,
  social: 280,
  product_description: 500,
  meta: 160,
};

// ─────────────────────────────────────────────────────────────
// Brand Compliance
// ─────────────────────────────────────────────────────────────

/**
 * Check text for forbidden words
 */
export function checkForbiddenWords(text: string, forbiddenWords: string[]): BrandViolation[] {
  const violations: BrandViolation[] = [];
  const lowerText = text.toLowerCase();
  
  for (const word of forbiddenWords) {
    if (lowerText.includes(word.toLowerCase())) {
      violations.push({
        type: "forbidden_word",
        text: word,
        suggestion: `Remplacer "${word}" par une alternative approuvée`,
      });
    }
  }
  
  return violations;
}

/**
 * Check for unauthorized claims
 */
export function checkUnauthorizedClaims(text: string, allowedClaims: string[]): BrandViolation[] {
  const violations: BrandViolation[] = [];
  
  // Common claim patterns that need verification
  const claimPatterns = [
    /\b(garanti|garantie)\b/gi,
    /\b(meilleur|n°1|numéro 1|premier)\b/gi,
    /\b(\d+%\s*(de|plus|moins))\b/gi,
    /\b(prouvé|scientifiquement|cliniquement)\b/gi,
    /\b(résultats en \d+|en seulement \d+)\b/gi,
  ];
  
  for (const pattern of claimPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const isAllowed = allowedClaims.some(
          claim => claim.toLowerCase().includes(match.toLowerCase())
        );
        if (!isAllowed) {
          violations.push({
            type: "unauthorized_claim",
            text: match,
            suggestion: `Vérifier si "${match}" est supporté par des preuves`,
          });
        }
      }
    }
  }
  
  return violations;
}

/**
 * Full brand compliance check
 */
export function checkBrandCompliance(
  text: string,
  brandKit: BrandKit
): BrandComplianceCheck {
  const violations: BrandViolation[] = [
    ...checkForbiddenWords(text, brandKit.forbiddenWords),
    ...checkUnauthorizedClaims(text, brandKit.allowedClaims),
  ];
  
  const warnings: string[] = [];
  
  // Check if proofs are used
  const hasProof = brandKit.availableProofs.some(
    proof => text.toLowerCase().includes(proof.toLowerCase())
  );
  if (!hasProof && brandKit.availableProofs.length > 0) {
    warnings.push("Aucune preuve sociale utilisée - considérer l'ajout de témoignages/stats");
  }
  
  // Check USP usage
  const hasUSP = brandKit.usp.some(
    usp => text.toLowerCase().includes(usp.toLowerCase().split(" ")[0])
  );
  if (!hasUSP && brandKit.usp.length > 0) {
    warnings.push("USP non clairement visible dans le texte");
  }
  
  return {
    passed: violations.length === 0,
    violations,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────
// Copy Generation Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Generate headline variations based on offer/brief
 */
export function generateHeadlineVariations(
  offer: Offer | undefined,
  brief: ContentBrief | undefined,
  brandKit: BrandKit,
  count: number = 3
): string[] {
  const headlines: string[] = [];
  
  // If we have an offer, use its elements
  if (offer) {
    // Benefit-focused
    if (offer.benefits.length > 0) {
      headlines.push(`${offer.benefits[0]} ${offer.urgency ? `- ${offer.urgency}` : ""}`);
    }
    
    // Problem-focused
    if (offer.objections.length > 0) {
      headlines.push(`Fini ${offer.objections[0].toLowerCase()}`);
    }
    
    // Proof-focused
    if (offer.proofs.length > 0) {
      headlines.push(`${offer.proofs[0]} - ${offer.name}`);
    }
    
    // Original headline
    headlines.push(offer.headline);
  }
  
  // If we have a brief, use keyword
  if (brief) {
    headlines.push(`${brief.targetKeyword} : Le Guide Complet`);
    headlines.push(`Comment ${brief.targetKeyword.toLowerCase()} en ${new Date().getFullYear()}`);
  }
  
  // Ensure we have enough variations
  while (headlines.length < count) {
    headlines.push(headlines[0] || "Découvrez notre solution");
  }
  
  return headlines.slice(0, count);
}

/**
 * Generate CTA variations
 */
export function generateCTAVariations(
  offer: Offer | undefined,
  copyType: CopyRequest["type"],
  count: number = 3
): string[] {
  const baseCTA = offer?.cta || "Commencer maintenant";
  
  const ctasByType: Record<CopyRequest["type"], string[]> = {
    landing_page: [baseCTA, "Essayer gratuitement", "Réserver ma démo", "Obtenir l'accès"],
    email: [baseCTA, "En savoir plus →", "Répondre à cet email", "Cliquer ici"],
    ad: [baseCTA, "En savoir plus", "S'inscrire", "Découvrir"],
    social: [baseCTA, "Lien en bio", "DM pour plus d'infos", "Cliquer →"],
    product_description: [baseCTA, "Ajouter au panier", "Acheter maintenant", "Commander"],
    meta: [], // No CTA for meta
  };
  
  const options = ctasByType[copyType] || [baseCTA];
  return options.slice(0, count);
}

/**
 * Generate copy structure based on framework
 */
export function generateCopyStructure(
  framework: keyof typeof COPY_FRAMEWORKS,
  offer?: Offer,
  brief?: ContentBrief
): { section: string; content: string }[] {
  const structure: { section: string; content: string }[] = [];
  const steps = COPY_FRAMEWORKS[framework];
  
  for (const step of steps) {
    let content = "";
    
    switch (step) {
      case "Attention":
      case "Problem":
      case "Before":
        content = offer?.objections[0] || brief?.title || "Problème à résoudre";
        break;
      case "Interest":
      case "Agitation":
      case "Qualify":
        content = "Développer le problème et ses conséquences";
        break;
      case "Desire":
      case "Solution":
      case "After":
      case "Advantages":
        content = offer?.benefits.join(". ") || "Présenter la solution";
        break;
      case "Action":
      case "Transition":
        content = offer?.cta || "Appel à l'action";
        break;
      case "Bridge":
      case "Understand":
        content = "Comment passer de l'avant à l'après";
        break;
      case "Educate":
      case "Features":
        content = "Détails de la solution";
        break;
      case "Stimulate":
      case "Benefits":
        content = offer?.proofs.join(". ") || "Preuves et bénéfices";
        break;
    }
    
    structure.push({ section: step, content });
  }
  
  return structure;
}

/**
 * Estimate read time based on word count
 */
export function estimateReadTime(text: string): string {
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200); // Average reading speed
  return `${minutes} min`;
}

/**
 * Generate meta tags from content
 */
export function generateMetaTags(
  title: string,
  content: string,
  keyword?: string
): { metaTitle: string; metaDescription: string } {
  // Title: keyword-optimized, under 60 chars
  let metaTitle = title;
  if (keyword && !title.toLowerCase().includes(keyword.toLowerCase())) {
    metaTitle = `${keyword} | ${title}`;
  }
  if (metaTitle.length > 60) {
    metaTitle = metaTitle.substring(0, 57) + "...";
  }
  
  // Description: under 160 chars, action-oriented
  let metaDescription = content.substring(0, 155);
  const lastSpace = metaDescription.lastIndexOf(" ");
  if (lastSpace > 100) {
    metaDescription = metaDescription.substring(0, lastSpace) + "...";
  }
  
  return { metaTitle, metaDescription };
}

// ─────────────────────────────────────────────────────────────
// Main Copy Generation
// ─────────────────────────────────────────────────────────────

/**
 * Generate copy variants
 */
export function generateCopyVariants(request: CopyRequest): CopyOutput {
  const variantCount = request.variants || DEFAULT_VARIANTS;
  const maxLength = request.maxLength || MAX_LENGTHS[request.type];
  const variants: CopyVariant[] = [];
  
  const headlines = generateHeadlineVariations(
    request.offer,
    request.brief,
    request.brandKit,
    variantCount
  );
  
  const ctas = generateCTAVariations(request.offer, request.type, variantCount);
  
  const variantLabels = ["A", "B", "C", "D", "E"];
  
  for (let i = 0; i < variantCount; i++) {
    const headline = headlines[i] || headlines[0];
    const cta = ctas[i] || ctas[0];
    
    // Generate body based on type
    let body = "";
    let hooks: string[] = [];
    let proofPoints: string[] = [];
    let objectionHandlers: string[] = [];
    
    if (request.offer) {
      body = request.offer.benefits.slice(0, 3).map(b => `✓ ${b}`).join("\n");
      hooks = [request.offer.benefits[0] || ""];
      proofPoints = request.offer.proofs.slice(0, 2);
      objectionHandlers = request.offer.objections.map(o => `❌ ${o} → ✓ Notre solution`);
    } else if (request.brief) {
      body = `Guide complet sur ${request.brief.targetKeyword}`;
      hooks = [`Tout savoir sur ${request.brief.targetKeyword}`];
    } else {
      body = "Contenu à personnaliser selon votre offre";
    }
    
    // Truncate if needed
    if (body.length > maxLength) {
      body = body.substring(0, maxLength - 3) + "...";
    }
    
    const meta = generateMetaTags(headline, body, request.brief?.targetKeyword);
    
    const variant: CopyVariant = {
      id: `copy-${Date.now()}-${i}`,
      variant: variantLabels[i] || `V${i + 1}`,
      headline,
      subheadline: request.offer?.benefits[1],
      body,
      cta,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      hooks,
      proofPoints,
      objectionHandlers,
      estimatedReadTime: estimateReadTime(body),
    };
    
    variants.push(variant);
  }
  
  // Check compliance for all variants
  const allText = variants.map(v => `${v.headline} ${v.body}`).join(" ");
  const compliance = checkBrandCompliance(allText, request.brandKit);
  
  const suggestions: string[] = [];
  if (request.type === "landing_page") {
    suggestions.push("Ajouter des témoignages clients pour renforcer la crédibilité");
    suggestions.push("Inclure un élément d'urgence (offre limitée, places restantes)");
  }
  if (request.type === "email") {
    suggestions.push("Personnaliser le sujet avec le prénom du destinataire");
    suggestions.push("Tester l'envoi à différentes heures pour optimiser le taux d'ouverture");
  }
  if (request.type === "ad") {
    suggestions.push("Créer des variantes visuelles pour chaque copy");
    suggestions.push("Tester différentes audiences avec chaque variante");
  }
  
  return {
    requestType: request.type,
    variants,
    brandCompliance: compliance,
    suggestions,
  };
}

// ─────────────────────────────────────────────────────────────
// Agent Output Generator
// ─────────────────────────────────────────────────────────────

/**
 * Generate Copywriting agent output
 */
export function generateCopywritingOutput(request: CopyRequest): AgentArtifact {
  const output = generateCopyVariants(request);
  
  const actions: AgentAction[] = output.variants.map((variant, idx) => ({
    id: variant.id,
    title: `Variante ${variant.variant}: ${variant.headline.substring(0, 40)}...`,
    description: `Copy ${request.type} optimisée pour la conversion avec le framework AIDA`,
    priority: idx === 0 ? "high" as const : "medium" as const,
    effort: "low" as const,
    impact: idx === 0 ? "high" as const : "medium" as const,
    ice_score: idx === 0 ? 72 : 54,
    category: "copywriting",
    auto_fixable: false,
    fix_instructions: [
      `Utiliser le headline: "${variant.headline}"`,
      `Appliquer le CTA: "${variant.cta}"`,
      "Intégrer les points de preuve dans le body",
    ].join(" → "),
  }));
  
  // Add compliance action if violations
  if (!output.brandCompliance.passed) {
    actions.unshift({
      id: `compliance-${Date.now()}`,
      title: "Corriger les violations de conformité brand",
      description: `${output.brandCompliance.violations.length} violation(s) détectée(s)`,
      priority: "critical" as const,
      effort: "low" as const,
      impact: "high" as const,
      ice_score: 81,
      category: "compliance",
      auto_fixable: false,
      fix_instructions: output.brandCompliance.violations.map(v => v.suggestion).join(". "),
    });
  }
  
  const risks: AgentRisk[] = output.brandCompliance.violations.map((v, idx) => ({
    id: `violation-${idx}`,
    description: v.text,
    severity: "high" as const,
    mitigation: v.suggestion,
  }));
  
  return {
    summary: `${output.variants.length} variantes générées pour ${request.type} | Conformité: ${output.brandCompliance.passed ? "✅" : "⚠️"} | ${output.suggestions.length} suggestion(s)`,
    actions,
    risks,
    dependencies: ["brand_kit:configured"],
    metrics_to_watch: ["conversion_rate", "click_through_rate", "bounce_rate"],
    requires_approval: !output.brandCompliance.passed,
  };
}
