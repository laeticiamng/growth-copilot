import type {
  LaunchProject,
  LaunchType,
  ReadinessScore,
  ReadinessDimension,
  ReadinessBlocker,
  ReadinessRecommendation,
  ReadinessStatus,
} from './types';
import { getLaunchCategory } from './types';

/**
 * LaunchReadinessScore — Evaluates launch readiness across multiple dimensions.
 * Returns a score /100, blockers, and ordered recommendations.
 */

// ─── Scoring Constants ──────────────────────────────────────────────────────

const CREATIVE_MULTIPLIER_MUSIC = 15;
const CREATIVE_MULTIPLIER_PLATFORM = 12;
const EMAIL_LIST_DIVISOR = 10;
const BUDGET_DIVISOR_MUSIC = 5;
const BUDGET_DIVISOR_PLATFORM = 10;
const BLOCKER_SCORE_THRESHOLD = 0;
const CRITICAL_WEIGHT_THRESHOLD = 0.1;
const RECOMMENDATION_SCORE_THRESHOLD = 60;
const DEFAULT_NULLABLE_SCORE = 50;
const HIGH_IMPACT_WEIGHT = 0.12;
const MEDIUM_IMPACT_WEIGHT = 0.08;
const RETARGETING_FULL_SCORE = 80;
const RETARGETING_PARTIAL_SCORE = 40;
const SOCIAL_PROOF_SCORE = 80;
const NEEDS_FIX_THRESHOLD = 60;

interface ReadinessInput {
  project: LaunchProject;
  hasAnalyticsConnected: boolean;
  hasTrackingSetup: boolean;
  hasLanding: boolean;
  landingScore: number | null;   // 0-100
  hasSocialProof: boolean;
  hasEmailList: boolean;
  emailListSize: number;
  hasBudget: boolean;
  budgetAmount: number;
  hasCreatives: boolean;
  creativesCount: number;
  hasSmartLink: boolean;
  hookScore: number | null;      // 0-100 from testing
  ctaClarity: number | null;     // 0-100
  brandConsistency: number | null; // 0-100
  onboardingFriction: number | null; // 0-100 (lower = more friction)
  channelAudienceFit: number | null; // 0-100
}

interface DimensionDef {
  key: string;
  label: string;
  weight: number;
  evaluate: (input: ReadinessInput) => { score: number; details: string };
}

// ─── Shared Dimension Builders ──────────────────────────────────────────────
// Dimensions shared between music and platform categories, differing only in weight.

function brandingDimension(weight: number): DimensionDef {
  return {
    key: 'branding',
    label: 'Branding & Identity',
    weight,
    evaluate: (i) => ({
      score: i.brandConsistency ?? DEFAULT_NULLABLE_SCORE,
      details: i.brandConsistency != null
        ? `Brand consistency score: ${i.brandConsistency}/100`
        : 'Brand consistency not evaluated',
    }),
  };
}

function analyticsDimension(weight: number): DimensionDef {
  return {
    key: 'analytics',
    label: 'Analytics Connectors',
    weight,
    evaluate: (i) => ({
      score: i.hasAnalyticsConnected ? 100 : 0,
      details: i.hasAnalyticsConnected ? 'Analytics connected' : 'No analytics connected',
    }),
  };
}

function trackingDimension(weight: number): DimensionDef {
  return {
    key: 'tracking',
    label: 'Tracking Setup',
    weight,
    evaluate: (i) => ({
      score: i.hasTrackingSetup ? 100 : 0,
      details: i.hasTrackingSetup ? 'Tracking configured' : 'Tracking not set up',
    }),
  };
}

function budgetDimension(weight: number, divisor: number): DimensionDef {
  return {
    key: 'budget',
    label: 'Budget Available',
    weight,
    evaluate: (i) => ({
      score: i.hasBudget ? Math.min(100, Math.round(i.budgetAmount / divisor)) : 0,
      details: i.hasBudget ? `Budget: ${i.budgetAmount}` : 'No budget allocated',
    }),
  };
}

function channelFitDimension(weight: number): DimensionDef {
  return {
    key: 'channel_fit',
    label: 'Channel / Audience Fit',
    weight,
    evaluate: (i) => ({
      score: i.channelAudienceFit ?? DEFAULT_NULLABLE_SCORE,
      details: i.channelAudienceFit != null
        ? `Channel fit score: ${i.channelAudienceFit}/100`
        : 'Channel fit not evaluated',
    }),
  };
}

function creativesDimension(weight: number, multiplier: number): DimensionDef {
  return {
    key: 'creatives',
    label: 'Creative Assets',
    weight,
    evaluate: (i) => ({
      score: i.hasCreatives ? Math.min(100, i.creativesCount * multiplier) : 0,
      details: `${i.creativesCount} creative variants ready`,
    }),
  };
}

// ─── Category-Specific Dimensions ───────────────────────────────────────────

function getMusicDimensions(): DimensionDef[] {
  return [
    brandingDimension(0.08),
    {
      key: 'hook_strength',
      label: 'Hook Strength',
      weight: 0.12,
      evaluate: (i) => ({
        score: i.hookScore ?? 0,
        details: i.hookScore != null
          ? `Hook score: ${i.hookScore}/100`
          : 'No hooks tested yet',
      }),
    },
    {
      key: 'smart_link',
      label: 'Smart Link Setup',
      weight: 0.1,
      evaluate: (i) => ({
        score: i.hasSmartLink ? 100 : 0,
        details: i.hasSmartLink ? 'Smart link configured' : 'Smart link not set up',
      }),
    },
    creativesDimension(0.15, CREATIVE_MULTIPLIER_MUSIC),
    analyticsDimension(0.08),
    trackingDimension(0.1),
    {
      key: 'email_list',
      label: 'Email List',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.hasEmailList ? Math.min(100, Math.round(i.emailListSize / EMAIL_LIST_DIVISOR)) : 0,
        details: `${i.emailListSize} email subscribers`,
      }),
    },
    budgetDimension(0.1, BUDGET_DIVISOR_MUSIC),
    channelFitDimension(0.1),
    {
      key: 'retargeting',
      label: 'Retargeting Ready',
      weight: 0.09,
      evaluate: (i) => ({
        score: i.hasTrackingSetup && i.hasAnalyticsConnected ? RETARGETING_FULL_SCORE : i.hasTrackingSetup ? RETARGETING_PARTIAL_SCORE : 0,
        details: i.hasTrackingSetup ? 'Retargeting data available' : 'No retargeting setup',
      }),
    },
  ];
}

function getPlatformDimensions(): DimensionDef[] {
  return [
    brandingDimension(0.07),
    {
      key: 'offer_clarity',
      label: 'Offer Clarity',
      weight: 0.12,
      evaluate: (i) => ({
        score: i.ctaClarity ?? 0,
        details: i.ctaClarity != null
          ? `CTA clarity score: ${i.ctaClarity}/100`
          : 'CTA not evaluated',
      }),
    },
    {
      key: 'landing_quality',
      label: 'Landing Page Quality',
      weight: 0.15,
      evaluate: (i) => ({
        score: i.hasLanding ? (i.landingScore ?? DEFAULT_NULLABLE_SCORE) : 0,
        details: i.hasLanding
          ? `Landing score: ${i.landingScore ?? 'N/A'}/100`
          : 'No landing page',
      }),
    },
    {
      key: 'social_proof',
      label: 'Social Proof',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.hasSocialProof ? SOCIAL_PROOF_SCORE : 0,
        details: i.hasSocialProof ? 'Social proof present' : 'No social proof',
      }),
    },
    creativesDimension(0.12, CREATIVE_MULTIPLIER_PLATFORM),
    analyticsDimension(0.1),
    trackingDimension(0.1),
    {
      key: 'onboarding',
      label: 'Onboarding Friction',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.onboardingFriction ?? DEFAULT_NULLABLE_SCORE,
        details: i.onboardingFriction != null
          ? `Onboarding ease: ${i.onboardingFriction}/100`
          : 'Onboarding not evaluated',
      }),
    },
    budgetDimension(0.1, BUDGET_DIVISOR_PLATFORM),
    channelFitDimension(0.08),
  ];
}

export class ReadinessScorer {
  /**
   * Score a launch project's readiness.
   * Returns overall score, per-dimension scores, blockers, and recommendations.
   */
  static score(input: ReadinessInput): Omit<ReadinessScore, 'id' | 'launch_project_id' | 'scored_at'> {
    if (!input.project?.launch_type) {
      throw new Error('ReadinessScorer.score: input.project with a valid launch_type is required');
    }

    const category = getLaunchCategory(input.project.launch_type);
    const dimensions = category === 'music' ? getMusicDimensions() : getPlatformDimensions();

    const scoredDimensions: ReadinessDimension[] = dimensions.map(dim => {
      const result = dim.evaluate(input);
      return {
        key: dim.key,
        label: dim.label,
        score: Math.round(result.score),
        weight: dim.weight,
        details: result.details,
      };
    });

    const overall = Math.round(
      scoredDimensions.reduce((acc, d) => acc + d.score * d.weight, 0)
    );

    const blockers: ReadinessBlocker[] = [];
    const recommendations: ReadinessRecommendation[] = [];

    for (const dim of scoredDimensions) {
      if (dim.score === BLOCKER_SCORE_THRESHOLD) {
        blockers.push({
          dimension: dim.key,
          severity: dim.weight >= CRITICAL_WEIGHT_THRESHOLD ? 'critical' : 'warning',
          message: `${dim.label} is not configured`,
          fix_hint: `Set up ${dim.label.toLowerCase()} before launching`,
        });
      }

      if (dim.score < RECOMMENDATION_SCORE_THRESHOLD) {
        recommendations.push({
          priority: Math.round((100 - dim.score) * dim.weight * 100),
          dimension: dim.key,
          title: `Improve ${dim.label}`,
          description: dim.details,
          impact: dim.weight >= HIGH_IMPACT_WEIGHT ? 'high' : dim.weight >= MEDIUM_IMPACT_WEIGHT ? 'medium' : 'low',
        });
      }
    }

    // Sort recommendations by priority (highest first)
    recommendations.sort((a, b) => b.priority - a.priority);

    const status: ReadinessStatus =
      blockers.some(b => b.severity === 'critical') ? 'not_ready' :
      overall < NEEDS_FIX_THRESHOLD ? 'needs_fix' :
      'ready_to_launch';

    return {
      overall_score: overall,
      status,
      dimensions: scoredDimensions,
      blockers,
      recommendations,
    };
  }
}
