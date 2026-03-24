// ─── Creative QA & Repurposing System ────────────────────────────────────────
// Quality assurance for creative assets and content repurposing logic.

import type { CreativeFormat, DistributionChannel } from './types';
import type { EvidenceLevel } from './launch-entities';

// ─── Creative QA Types ───────────────────────────────────────────────────────

export type QACheckCategory =
  | 'brand_compliance'
  | 'message_coherence'
  | 'cta_clarity'
  | 'ad_compliance'
  | 'language_quality'
  | 'claims_accuracy';

export interface QACheckResult {
  category: QACheckCategory;
  passed: boolean;
  score: number;          // 0-100
  issues: QAIssue[];
  evidence_level: EvidenceLevel;
}

export interface QAIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  location: string;       // e.g. "headline", "cta", "body_paragraph_2"
  suggestion: string;
  auto_fixable: boolean;
}

export interface CreativeQAReport {
  creative_id: string;
  overall_score: number;
  overall_status: 'pass' | 'fail' | 'warning';
  checks: QACheckResult[];
  issues_count: { critical: number; warning: number; info: number };
  reviewed_at: string;
}

// ─── Asset Status Lifecycle ──────────────────────────────────────────────────

export type AssetStatus = 'draft' | 'in_review' | 'approved' | 'scheduled' | 'published' | 'deprecated';

export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  draft: ['in_review'],
  in_review: ['approved', 'draft'],   // Can be sent back to draft
  approved: ['scheduled', 'published', 'deprecated'],
  scheduled: ['published', 'approved'],  // Can be unscheduled
  published: ['deprecated'],
  deprecated: [],  // Terminal state
};

export function canTransition(from: AssetStatus, to: AssetStatus): boolean {
  return ASSET_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Repurposing Logic ───────────────────────────────────────────────────────

export interface RepurposeRule {
  from: RepurposeSource;
  to: RepurposeTarget[];
}

export interface RepurposeSource {
  format: 'long_form_video' | 'short_form_video' | 'blog_post' | 'landing_page' | 'ad_copy';
  min_duration_seconds?: number;
}

export interface RepurposeTarget {
  format: CreativeFormat;
  channel: DistributionChannel;
  aspect_ratio: string;
  max_duration_seconds?: number;
  adaptation: string;
}

export const REPURPOSE_RULES: RepurposeRule[] = [
  // Long form -> Short form
  {
    from: { format: 'long_form_video', min_duration_seconds: 60 },
    to: [
      { format: 'hook', channel: 'tiktok', aspect_ratio: '9:16', max_duration_seconds: 30, adaptation: 'Extract strongest hook + key message + CTA' },
      { format: 'hook', channel: 'instagram_reels', aspect_ratio: '9:16', max_duration_seconds: 30, adaptation: 'Extract strongest hook + key message + CTA' },
      { format: 'hook', channel: 'youtube_shorts', aspect_ratio: '9:16', max_duration_seconds: 60, adaptation: 'Extract key segment with hook' },
    ],
  },
  // Short form -> Ads
  {
    from: { format: 'short_form_video', min_duration_seconds: 15 },
    to: [
      { format: 'ad_copy', channel: 'meta_ads', aspect_ratio: '1:1', max_duration_seconds: 15, adaptation: 'Add CTA overlay + ad-compliant caption' },
      { format: 'ad_copy', channel: 'meta_ads', aspect_ratio: '4:5', max_duration_seconds: 15, adaptation: 'Reframe for feed format + CTA' },
      { format: 'ad_copy', channel: 'google_ads', aspect_ratio: '16:9', max_duration_seconds: 15, adaptation: 'Horizontal crop + bumper format' },
    ],
  },
  // Video -> Social snippets
  {
    from: { format: 'short_form_video' },
    to: [
      { format: 'caption', channel: 'organic_social', aspect_ratio: 'n/a', adaptation: 'Extract key quote as text post' },
      { format: 'headline', channel: 'organic_social', aspect_ratio: 'n/a', adaptation: 'Create thread from key points' },
    ],
  },
  // Video -> Landing page blocks
  {
    from: { format: 'short_form_video' },
    to: [
      { format: 'landing_copy', channel: 'landing_page', aspect_ratio: '16:9', adaptation: 'Embed as hero video on landing page' },
      { format: 'storyboard', channel: 'landing_page', aspect_ratio: 'n/a', adaptation: 'Convert key frames to image carousel' },
    ],
  },
  // Blog -> Social
  {
    from: { format: 'blog_post' },
    to: [
      { format: 'caption', channel: 'organic_social', aspect_ratio: 'n/a', adaptation: 'Extract key insight as social post' },
      { format: 'email_body', channel: 'email', aspect_ratio: 'n/a', adaptation: 'Summarize for newsletter' },
      { format: 'script', channel: 'tiktok', aspect_ratio: '9:16', max_duration_seconds: 60, adaptation: 'Convert key points to talking-head script' },
    ],
  },
  // Ad copy -> Variations
  {
    from: { format: 'ad_copy' },
    to: [
      { format: 'headline', channel: 'google_ads', aspect_ratio: 'n/a', adaptation: 'Extract headline for search ads' },
      { format: 'email_subject', channel: 'email', aspect_ratio: 'n/a', adaptation: 'Adapt hook as email subject line' },
    ],
  },
];

export function getRepurposeTargets(sourceFormat: string): RepurposeTarget[] {
  const rule = REPURPOSE_RULES.find(r => r.from.format === sourceFormat);
  return rule?.to ?? [];
}

// ─── Asset Registry Types ────────────────────────────────────────────────────

export interface AssetRegistryEntry {
  id: string;
  launch_project_id: string;
  asset_type: 'script' | 'storyboard' | 'voiceover' | 'caption_set' | 'thumbnail' | 'cta_package' | 'video_raw' | 'image' | 'copy';
  name: string;
  content: Record<string, unknown>;
  format: CreativeFormat | null;
  channel_target: DistributionChannel | null;
  status: AssetStatus;
  parent_asset_id: string | null;    // For repurposed assets
  repurposed_from: string | null;    // Source format
  brand_compliant: boolean | null;
  compliance_notes: string[];
  version: number;
  created_at: string;
  updated_at: string;
}

// ─── QA Check Functions ──────────────────────────────────────────────────────

export function runBrandComplianceCheck(
  content: string,
  brandGuidelines: { colors?: string[]; fonts?: string[]; tone?: string[] } | null
): QACheckResult {
  const issues: QAIssue[] = [];

  if (!brandGuidelines) {
    return {
      category: 'brand_compliance',
      passed: true,
      score: 50,
      issues: [{ severity: 'info', message: 'No brand guidelines configured', location: 'global', suggestion: 'Upload brand kit in Settings > Brand Kit', auto_fixable: false }],
      evidence_level: 'TEMPLATE',
    };
  }

  // Basic checks (real checks would use AI)
  if (brandGuidelines.tone) {
    const hasToneIssue = brandGuidelines.tone.some(t =>
      t.toLowerCase().includes('formal') && content.includes('!')
    );
    if (hasToneIssue) {
      issues.push({
        severity: 'warning',
        message: 'Tone may not match formal brand guidelines (exclamation marks detected)',
        location: 'body',
        suggestion: 'Consider removing exclamation marks for a more formal tone',
        auto_fixable: true,
      });
    }
  }

  return {
    category: 'brand_compliance',
    passed: issues.filter(i => i.severity === 'critical').length === 0,
    score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 15),
    issues,
    evidence_level: 'DERIVED',
  };
}

export function runCTAClarityCheck(cta: string): QACheckResult {
  const issues: QAIssue[] = [];

  if (!cta || cta.trim().length === 0) {
    issues.push({
      severity: 'critical',
      message: 'No CTA found',
      location: 'cta',
      suggestion: 'Add a clear call-to-action',
      auto_fixable: false,
    });
  } else {
    if (cta.length > 40) {
      issues.push({
        severity: 'warning',
        message: 'CTA is too long (>40 chars)',
        location: 'cta',
        suggestion: 'Shorten CTA to under 40 characters',
        auto_fixable: false,
      });
    }
    const actionVerbs = ['get', 'start', 'try', 'join', 'discover', 'learn', 'buy', 'shop', 'book', 'download', 'sign', 'subscribe', 'claim', 'unlock', 'access', 'obtenez', 'decouvrez', 'essayez', 'rejoignez', 'commencez', 'achetez', 'reservez', 'telechargez', 'inscrivez'];
    const hasActionVerb = actionVerbs.some(v => cta.toLowerCase().includes(v));
    if (!hasActionVerb) {
      issues.push({
        severity: 'warning',
        message: 'CTA may lack a strong action verb',
        location: 'cta',
        suggestion: 'Start CTA with an action verb (Get, Start, Try, Join, etc.)',
        auto_fixable: false,
      });
    }
  }

  return {
    category: 'cta_clarity',
    passed: issues.filter(i => i.severity === 'critical').length === 0,
    score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20),
    issues,
    evidence_level: 'VERIFIED',
  };
}

export function runLanguageQualityCheck(text: string): QACheckResult {
  const issues: QAIssue[] = [];

  // Basic checks
  if (text.length < 10) {
    issues.push({
      severity: 'warning',
      message: 'Text is very short',
      location: 'body',
      suggestion: 'Consider adding more detail',
      auto_fixable: false,
    });
  }

  // Check for ALL CAPS abuse
  const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase());
  if (capsWords.length > 3) {
    issues.push({
      severity: 'warning',
      message: `Excessive use of ALL CAPS (${capsWords.length} words)`,
      location: 'body',
      suggestion: 'Reduce ALL CAPS usage - it can feel aggressive',
      auto_fixable: true,
    });
  }

  // Check for excessive punctuation
  const excessivePunctuation = text.match(/[!?]{3,}/g);
  if (excessivePunctuation) {
    issues.push({
      severity: 'warning',
      message: 'Excessive punctuation detected',
      location: 'body',
      suggestion: 'Use single punctuation marks',
      auto_fixable: true,
    });
  }

  return {
    category: 'language_quality',
    passed: issues.filter(i => i.severity === 'critical').length === 0,
    score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 10),
    issues,
    evidence_level: 'VERIFIED',
  };
}

export function generateQAReport(
  creativeId: string,
  checkResults: QACheckResult[]
): CreativeQAReport {
  const criticalCount = checkResults.reduce((sum, c) => sum + c.issues.filter(i => i.severity === 'critical').length, 0);
  const warningCount = checkResults.reduce((sum, c) => sum + c.issues.filter(i => i.severity === 'warning').length, 0);
  const infoCount = checkResults.reduce((sum, c) => sum + c.issues.filter(i => i.severity === 'info').length, 0);

  const overallScore = checkResults.length > 0
    ? Math.round(checkResults.reduce((sum, c) => sum + c.score, 0) / checkResults.length)
    : 0;

  return {
    creative_id: creativeId,
    overall_score: overallScore,
    overall_status: criticalCount > 0 ? 'fail' : warningCount > 0 ? 'warning' : 'pass',
    checks: checkResults,
    issues_count: { critical: criticalCount, warning: warningCount, info: infoCount },
    reviewed_at: new Date().toISOString(),
  };
}
