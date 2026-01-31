import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Claim Guardrail - Validates marketing claims against compliance rules
 * Any numeric or absolute claim must have evidence_source OR be rewritten
 */

export interface ClaimCheckResult {
  allowed: boolean;
  requires_rewrite: boolean;
  reason: string | null;
}

export interface ClaimDecision {
  original_claim: string;
  decision: 'approved' | 'rewritten' | 'rejected';
  rewritten_claim?: string;
  evidence_source?: string;
  reason?: string;
}

// Patterns that require evidence
const ABSOLUTE_CLAIM_PATTERNS = [
  /\b(meilleur|best|unique|only|seul|garanti|guaranteed|100%|parfait|perfect|miracle|révolutionnaire|revolutionary)\b/i,
  /\b(leader|premier|first|top|#1|numéro 1)\b/i,
  /\b(prouvé|proven|scientifique|scientific|clinique|clinical)\b/i
];

const NUMERIC_CLAIM_PATTERNS = [
  /\d+\s*%/,  // Percentages
  /\d+\s*(€|euros?|\$|dollars?)/i,  // Currency
  /\d+\s*(fois|times|x)\b/i,  // Multipliers
  /\d+\s*(clients?|users?|utilisateurs?)/i,  // User counts
  /économisez?\s*\d+/i,  // Savings claims
  /jusqu'à\s*\d+/i,  // "Up to" claims
];

const HEALTH_FINANCE_PATTERNS = [
  /\b(guéri|cure|soigne|treats?|médicament|medication)\b/i,
  /\b(perte de poids|weight loss|minceur|slimming)\b/i,
  /\b(rendement|return|profit|bénéfice|gain)\s*\d+/i,
  /\b(sans risque|risk.?free|garanti|guaranteed)\b/i
];

/**
 * Check if a claim requires evidence or rewriting
 */
export function checkClaim(claim: string, hasEvidence: boolean = false): ClaimCheckResult {
  // Check for absolute claims
  const hasAbsoluteClaim = ABSOLUTE_CLAIM_PATTERNS.some(pattern => pattern.test(claim));
  
  // Check for numeric claims
  const hasNumericClaim = NUMERIC_CLAIM_PATTERNS.some(pattern => pattern.test(claim));
  
  // Check for health/finance sensitive claims
  const hasHealthFinanceClaim = HEALTH_FINANCE_PATTERNS.some(pattern => pattern.test(claim));
  
  if (hasHealthFinanceClaim && !hasEvidence) {
    return {
      allowed: false,
      requires_rewrite: true,
      reason: 'Les claims santé/finance nécessitent une validation réglementaire et une source vérifiable'
    };
  }
  
  if (hasAbsoluteClaim && !hasEvidence) {
    return {
      allowed: false,
      requires_rewrite: true,
      reason: 'Les claims absolus (meilleur, unique, garanti) nécessitent une source vérifiable'
    };
  }
  
  if (hasNumericClaim && !hasEvidence) {
    return {
      allowed: false,
      requires_rewrite: true,
      reason: 'Les claims chiffrés nécessitent une source (étude, statistique officielle)'
    };
  }
  
  return {
    allowed: true,
    requires_rewrite: false,
    reason: null
  };
}

/**
 * Auto-rewrite a claim to be compliant
 */
export function rewriteClaimCompliant(claim: string): string {
  let rewritten = claim;
  
  // Replace absolutes with hedged versions
  const replacements: [RegExp, string][] = [
    [/\ble meilleur\b/gi, 'un excellent'],
    [/\bthe best\b/gi, 'an excellent'],
    [/\bunique\b/gi, 'original'],
    [/\bgaranti\b/gi, 'conçu pour'],
    [/\bguaranteed\b/gi, 'designed to'],
    [/\b100%\b/g, 'hautement'],
    [/\bparfait\b/gi, 'optimisé'],
    [/\bmiracle\b/gi, 'innovant'],
    [/\brévolutionnaire\b/gi, 'nouvelle génération'],
    [/\bjusqu'à (\d+)/gi, 'pouvant atteindre $1'],
    [/\bprouvé\b/gi, 'testé'],
    [/\bscientifiquement\b/gi, 'soigneusement']
  ];
  
  for (const [pattern, replacement] of replacements) {
    rewritten = rewritten.replace(pattern, replacement);
  }
  
  return rewritten;
}

/**
 * Process claims in copywriting content and log decisions
 */
export async function processClaimsInCopy(
  supabase: SupabaseClient,
  workspaceId: string,
  jobId: string | null,
  copyContent: {
    hooks?: string[];
    headlines?: string[];
    ctas?: string[];
    primary_texts?: string[];
  },
  allowedClaims?: string[],
  availableProofs?: string[]
): Promise<{
  processed: typeof copyContent;
  decisions: ClaimDecision[];
  hasIssues: boolean;
}> {
  const decisions: ClaimDecision[] = [];
  const processed = { ...copyContent };
  let hasIssues = false;
  
  const processArray = (arr: string[] | undefined, key: string): string[] => {
    if (!arr) return [];
    
    return arr.map(text => {
      // Check if this claim is in allowed list
      const isAllowed = allowedClaims?.some(ac => 
        text.toLowerCase().includes(ac.toLowerCase())
      );
      
      // Check if we have evidence for this claim
      const hasEvidence = availableProofs?.some(proof => 
        text.toLowerCase().includes(proof.toLowerCase().split(':')[0])
      );
      
      const result = checkClaim(text, isAllowed || hasEvidence);
      
      if (!result.allowed) {
        hasIssues = true;
        const rewritten = rewriteClaimCompliant(text);
        
        decisions.push({
          original_claim: text,
          decision: 'rewritten',
          rewritten_claim: rewritten,
          reason: result.reason || 'Auto-rewritten for compliance'
        });
        
        return rewritten;
      } else {
        decisions.push({
          original_claim: text,
          decision: 'approved',
          evidence_source: hasEvidence ? 'brand_kit_proof' : undefined
        });
        
        return text;
      }
    });
  };
  
  processed.hooks = processArray(copyContent.hooks, 'hooks');
  processed.headlines = processArray(copyContent.headlines, 'headlines');
  processed.ctas = processArray(copyContent.ctas, 'ctas');
  processed.primary_texts = processArray(copyContent.primary_texts, 'primary_texts');
  
  // Log decisions to audit table
  if (decisions.length > 0 && jobId) {
    for (const decision of decisions) {
      try {
        await supabase
          .from('claim_decisions')
          .insert({
            workspace_id: workspaceId,
            creative_job_id: jobId,
            original_claim: decision.original_claim,
            decision: decision.decision,
            rewritten_claim: decision.rewritten_claim,
            evidence_source: decision.evidence_source,
            reason: decision.reason
          });
      } catch (err) {
        console.error('Failed to log claim decision:', err);
      }
    }
  }
  
  return { processed, decisions, hasIssues };
}
