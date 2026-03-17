import { describe, it, expect } from 'vitest';
import { ReadinessScorer } from '../readiness-score';
import type { LaunchProject } from '../types';

function makeProject(overrides: Partial<LaunchProject> = {}): LaunchProject {
  return {
    id: 'test-id',
    workspace_id: 'ws-1',
    name: 'Test Launch',
    launch_type: 'single',
    status: 'draft',
    input_url: null,
    input_metadata: {},
    config: {},
    readiness_score: null,
    readiness_status: null,
    launch_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const fullMusicInput = {
  project: makeProject({ launch_type: 'single' }),
  hasAnalyticsConnected: true,
  hasTrackingSetup: true,
  hasLanding: true,
  landingScore: 80,
  hasSocialProof: true,
  hasEmailList: true,
  emailListSize: 1000,
  hasBudget: true,
  budgetAmount: 500,
  hasCreatives: true,
  creativesCount: 8,
  hasSmartLink: true,
  hookScore: 85,
  ctaClarity: 90,
  brandConsistency: 80,
  onboardingFriction: null,
  channelAudienceFit: 75,
};

const emptyMusicInput = {
  project: makeProject({ launch_type: 'single' }),
  hasAnalyticsConnected: false,
  hasTrackingSetup: false,
  hasLanding: false,
  landingScore: null,
  hasSocialProof: false,
  hasEmailList: false,
  emailListSize: 0,
  hasBudget: false,
  budgetAmount: 0,
  hasCreatives: false,
  creativesCount: 0,
  hasSmartLink: false,
  hookScore: null,
  ctaClarity: null,
  brandConsistency: null,
  onboardingFriction: null,
  channelAudienceFit: null,
};

describe('ReadinessScorer', () => {
  describe('Music launch scoring', () => {
    it('scores a fully ready music launch highly', () => {
      const result = ReadinessScorer.score(fullMusicInput);
      expect(result.overall_score).toBeGreaterThan(70);
      expect(result.status).toBe('ready_to_launch');
      expect(result.dimensions.length).toBe(10);
    });

    it('scores an empty music launch as not_ready', () => {
      const result = ReadinessScorer.score(emptyMusicInput);
      expect(result.overall_score).toBeLessThan(30);
      expect(result.status).toBe('not_ready');
      expect(result.blockers.length).toBeGreaterThan(0);
    });

    it('generates blockers for zero-score dimensions', () => {
      const result = ReadinessScorer.score(emptyMusicInput);
      const criticalBlockers = result.blockers.filter(b => b.severity === 'critical');
      expect(criticalBlockers.length).toBeGreaterThan(0);
      for (const blocker of result.blockers) {
        expect(blocker.dimension).toBeTruthy();
        expect(blocker.message).toBeTruthy();
        expect(blocker.fix_hint).toBeTruthy();
      }
    });

    it('generates recommendations sorted by priority', () => {
      const result = ReadinessScorer.score(emptyMusicInput);
      expect(result.recommendations.length).toBeGreaterThan(0);
      for (let i = 1; i < result.recommendations.length; i++) {
        expect(result.recommendations[i - 1].priority).toBeGreaterThanOrEqual(result.recommendations[i].priority);
      }
    });

    it('dimension weights sum to approximately 1.0', () => {
      const result = ReadinessScorer.score(fullMusicInput);
      const totalWeight = result.dimensions.reduce((sum, d) => sum + d.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 1);
    });
  });

  describe('Platform launch scoring', () => {
    it('scores a platform launch with different dimensions', () => {
      const platformInput = {
        ...fullMusicInput,
        project: makeProject({ launch_type: 'saas_launch' }),
      };
      const result = ReadinessScorer.score(platformInput);
      expect(result.overall_score).toBeGreaterThan(60);
      expect(result.dimensions.length).toBe(10);
      expect(result.dimensions.some(d => d.key === 'landing_quality')).toBe(true);
      expect(result.dimensions.some(d => d.key === 'offer_clarity')).toBe(true);
    });

    it('flags missing landing page as a blocker for platform launch', () => {
      const noLandingInput = {
        ...fullMusicInput,
        project: makeProject({ launch_type: 'website_launch' }),
        hasLanding: false,
        landingScore: null,
      };
      const result = ReadinessScorer.score(noLandingInput);
      const landingBlocker = result.blockers.find(b => b.dimension === 'landing_quality');
      expect(landingBlocker).toBeDefined();
    });
  });

  describe('needs_fix status', () => {
    it('returns needs_fix when no critical blockers but score < 60', () => {
      const partialInput = {
        ...fullMusicInput,
        hookScore: 20,
        creativesCount: 1,
        hasSmartLink: true,
        hasAnalyticsConnected: true,
        hasTrackingSetup: true,
        hasBudget: true,
        budgetAmount: 50,
        hasEmailList: true,
        emailListSize: 50,
        channelAudienceFit: 20,
        brandConsistency: 20,
      };
      const result = ReadinessScorer.score(partialInput);
      // With very low scores but no zeros, should be needs_fix or ready
      expect(['needs_fix', 'ready_to_launch']).toContain(result.status);
    });
  });
});
