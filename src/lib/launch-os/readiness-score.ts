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

function getMusicDimensions(): DimensionDef[] {
  return [
    {
      key: 'branding',
      label: 'Branding & Identity',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.brandConsistency ?? 50,
        details: i.brandConsistency != null
          ? `Brand consistency score: ${i.brandConsistency}/100`
          : 'Brand consistency not evaluated',
      }),
    },
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
    {
      key: 'creatives',
      label: 'Creative Assets',
      weight: 0.15,
      evaluate: (i) => ({
        score: i.hasCreatives ? Math.min(100, i.creativesCount * 15) : 0,
        details: `${i.creativesCount} creative variants ready`,
      }),
    },
    {
      key: 'analytics',
      label: 'Analytics Connectors',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.hasAnalyticsConnected ? 100 : 0,
        details: i.hasAnalyticsConnected ? 'Analytics connected' : 'No analytics connected',
      }),
    },
    {
      key: 'tracking',
      label: 'Tracking Setup',
      weight: 0.1,
      evaluate: (i) => ({
        score: i.hasTrackingSetup ? 100 : 0,
        details: i.hasTrackingSetup ? 'Tracking configured' : 'Tracking not set up',
      }),
    },
    {
      key: 'email_list',
      label: 'Email List',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.hasEmailList ? Math.min(100, Math.round(i.emailListSize / 10)) : 0,
        details: `${i.emailListSize} email subscribers`,
      }),
    },
    {
      key: 'budget',
      label: 'Budget Available',
      weight: 0.1,
      evaluate: (i) => ({
        score: i.hasBudget ? Math.min(100, Math.round(i.budgetAmount / 5)) : 0,
        details: i.hasBudget ? `Budget: ${i.budgetAmount}` : 'No budget allocated',
      }),
    },
    {
      key: 'channel_fit',
      label: 'Channel / Audience Fit',
      weight: 0.1,
      evaluate: (i) => ({
        score: i.channelAudienceFit ?? 50,
        details: i.channelAudienceFit != null
          ? `Channel fit score: ${i.channelAudienceFit}/100`
          : 'Channel fit not evaluated',
      }),
    },
    {
      key: 'retargeting',
      label: 'Retargeting Ready',
      weight: 0.09,
      evaluate: (i) => ({
        score: i.hasTrackingSetup && i.hasAnalyticsConnected ? 80 : i.hasTrackingSetup ? 40 : 0,
        details: i.hasTrackingSetup ? 'Retargeting data available' : 'No retargeting setup',
      }),
    },
  ];
}

function getPlatformDimensions(): DimensionDef[] {
  return [
    {
      key: 'branding',
      label: 'Branding & Identity',
      weight: 0.07,
      evaluate: (i) => ({
        score: i.brandConsistency ?? 50,
        details: i.brandConsistency != null
          ? `Brand consistency: ${i.brandConsistency}/100`
          : 'Brand consistency not evaluated',
      }),
    },
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
        score: i.hasLanding ? (i.landingScore ?? 50) : 0,
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
        score: i.hasSocialProof ? 80 : 0,
        details: i.hasSocialProof ? 'Social proof present' : 'No social proof',
      }),
    },
    {
      key: 'creatives',
      label: 'Creative Assets',
      weight: 0.12,
      evaluate: (i) => ({
        score: i.hasCreatives ? Math.min(100, i.creativesCount * 12) : 0,
        details: `${i.creativesCount} creative variants ready`,
      }),
    },
    {
      key: 'analytics',
      label: 'Analytics Connectors',
      weight: 0.1,
      evaluate: (i) => ({
        score: i.hasAnalyticsConnected ? 100 : 0,
        details: i.hasAnalyticsConnected ? 'Analytics connected' : 'No analytics connected',
      }),
    },
    {
      key: 'tracking',
      label: 'Tracking Setup',
      weight: 0.1,
      evaluate: (i) => ({
        score: i.hasTrackingSetup ? 100 : 0,
        details: i.hasTrackingSetup ? 'Tracking configured' : 'Tracking not set up',
      }),
    },
    {
      key: 'onboarding',
      label: 'Onboarding Friction',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.onboardingFriction ?? 50,
        details: i.onboardingFriction != null
          ? `Onboarding ease: ${i.onboardingFriction}/100`
          : 'Onboarding not evaluated',
      }),
    },
    {
      key: 'budget',
      label: 'Budget Available',
      weight: 0.1,
      evaluate: (i) => ({
        score: i.hasBudget ? Math.min(100, Math.round(i.budgetAmount / 10)) : 0,
        details: i.hasBudget ? `Budget: ${i.budgetAmount}` : 'No budget allocated',
      }),
    },
    {
      key: 'channel_fit',
      label: 'Channel / Audience Fit',
      weight: 0.08,
      evaluate: (i) => ({
        score: i.channelAudienceFit ?? 50,
        details: i.channelAudienceFit != null
          ? `Channel fit: ${i.channelAudienceFit}/100`
          : 'Channel fit not evaluated',
      }),
    },
  ];
}

export class ReadinessScorer {
  /**
   * Score a launch project's readiness.
   * Returns overall score, per-dimension scores, blockers, and recommendations.
   */
  static score(input: ReadinessInput): Omit<ReadinessScore, 'id' | 'launch_project_id' | 'scored_at'> {
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
      if (dim.score === 0) {
        blockers.push({
          dimension: dim.key,
          severity: dim.weight >= 0.1 ? 'critical' : 'warning',
          message: `${dim.label} is not configured`,
          fix_hint: `Set up ${dim.label.toLowerCase()} before launching`,
        });
      }

      if (dim.score < 60) {
        recommendations.push({
          priority: Math.round((100 - dim.score) * dim.weight * 100),
          dimension: dim.key,
          title: `Improve ${dim.label}`,
          description: dim.details,
          impact: dim.weight >= 0.12 ? 'high' : dim.weight >= 0.08 ? 'medium' : 'low',
        });
      }
    }

    // Sort recommendations by priority (highest first)
    recommendations.sort((a, b) => b.priority - a.priority);

    const status: ReadinessStatus =
      blockers.some(b => b.severity === 'critical') ? 'not_ready' :
      overall < 60 ? 'needs_fix' :
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
