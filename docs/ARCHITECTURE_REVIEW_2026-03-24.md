# Platform Architecture Review — 2026-03-24

## Executive Summary

Comprehensive review of the growth-copilot platform focusing on the Launch OS system.
This review identifies dead code, code duplication, type safety gaps, missing validations,
and provides actionable recommendations. Accompanying code changes fix the highest-impact
issues directly.

---

## 1. Platform Overview

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     UI / Pages Layer                        │
│  LaunchOSHome · LaunchProject · DecisionCenter · TypeSelector│
│  IntegrationHealth · LaunchCommandCenter                    │
├─────────────────────────────────────────────────────────────┤
│                    Context / Hooks Layer                    │
│  useLaunchOS (React context — bridges lib ↔ UI)            │
├─────────────────────────────────────────────────────────────┤
│                    Core Library Layer                       │
│  launch-os/  (15 modules, barrel-exported via index.ts)    │
│  ┌─────────────┬──────────────┬────────────────────────┐   │
│  │ Orchestration│ Decision     │ Observability          │   │
│  │ Pipeline     │ Engine       │ CircuitBreaker, Retry  │   │
│  ├─────────────┼──────────────┼────────────────────────┤   │
│  │ Readiness   │ Signal       │ Creative QA            │   │
│  │ Scorer      │ Graph        │ Brand/CTA/Language     │   │
│  ├─────────────┼──────────────┼────────────────────────┤   │
│  │ Launch      │ Approval     │ Integration            │   │
│  │ Agents (15) │ Governance   │ Health (14 connectors) │   │
│  ├─────────────┼──────────────┼────────────────────────┤   │
│  │ Launch Type │ Launch       │ Types & Entities       │   │
│  │ Engine      │ Entities     │                        │   │
│  └─────────────┴──────────────┴────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                  Data / Infrastructure                      │
│  Supabase (DB + Edge Functions + Auth + RLS)               │
│  14 connectors · Stripe · GA4 · Meta · YouTube · etc.      │
└─────────────────────────────────────────────────────────────┘
```

### Module Map

| Module | File | Size | Tests | Wired to UI |
|--------|------|------|-------|-------------|
| types | `types.ts` | Core types | via hardening tests | Yes (indirect) |
| launch-entities | `launch-entities.ts` | 20KB | Yes | Type-only |
| launch-agents | `launch-agents.ts` | 33KB | Yes | **No** |
| orchestration-pipeline | `orchestration-pipeline.ts` | 30KB | Yes | Via useLaunchOS |
| decision-engine | `decision-engine.ts` | ~6KB | Yes | Via DecisionCenter |
| readiness-score | `readiness-score.ts` | ~8KB | Yes | Via LaunchProject |
| signal-graph | `signal-graph.ts` | ~5KB | Yes | Via LaunchProject |
| launch-type-engine | `launch-type-engine.ts` | ~4KB | Yes | Via TypeSelector |
| creative-qa | `creative-qa.ts` | ~8KB | Yes (hardening) | **No** |
| approval-governance | `approval-governance.ts` | ~6KB | Yes (hardening) | Via useLaunchOS |
| integration-health | `integration-health.ts` | ~5KB | Yes (hardening) | Via TruthDashboard |
| observability | `observability.ts` | ~8KB | Yes (hardening) | **No** |

### Routing (Launch OS)

| Route | Page | Status |
|-------|------|--------|
| `/dashboard/launch-os` | LaunchOSHome | Active |
| `/dashboard/launch-os/new` | LaunchTypeSelector | Active |
| `/dashboard/launch-os/project` | LaunchProject | Active |
| `/dashboard/launch-os/decisions` | DecisionCenter | Active |
| `/dashboard/launch-os/integrations` | IntegrationHealth | Active |

---

## 2. Issues Found

### 2.1 Dead / Unused Exports (Severity: Low)

The following modules are exported from `index.ts` but **not consumed by any UI page**:

| Export | Consumer | Status |
|--------|----------|--------|
| `LAUNCH_AGENTS`, `getLaunchAgent*` | Tests only | Exported, not in UI |
| `runBrandComplianceCheck`, `runCTAClarityCheck`, `runLanguageQualityCheck` | Tests only | Exported, not in UI |
| `computeRunStatusMetrics`, `computeOutputQualityMetrics`, `CircuitBreaker` | Tests only | Exported, not in UI |
| `LaunchCommandCenter` component | Not rendered in any route | Component exists but unused |

**Recommendation**: These are all tested and represent forward-looking capabilities. They should be kept but clearly documented (done in this PR via JSDoc comments). When agent management, creative QA workflow, or observability dashboard features are built, these modules are ready.

### 2.2 Code Duplication (Severity: Medium) — FIXED

**`readiness-score.ts`**: `getMusicDimensions()` and `getPlatformDimensions()` shared 6 nearly identical dimension evaluators (branding, analytics, tracking, budget, channel_fit, creatives) with only weights/multipliers differing.

**Fix applied**: Extracted shared dimension builder functions (`brandingDimension`, `analyticsDimension`, `trackingDimension`, `budgetDimension`, `channelFitDimension`, `creativesDimension`) that accept weight/config parameters.

**`signal-graph.ts`**: `first_touch` and `last_touch` attribution cases had identical logic except for array index selection.

**Fix applied**: Extracted `assignSingleChannelCredit()` helper.

### 2.3 Hardcoded Magic Numbers (Severity: Medium) — FIXED

**`readiness-score.ts`**: 15+ magic numbers for thresholds, weights, multipliers, and divisors.

**Fix applied**: Extracted to named constants:
- `CREATIVE_MULTIPLIER_MUSIC` (15), `CREATIVE_MULTIPLIER_PLATFORM` (12)
- `EMAIL_LIST_DIVISOR` (10), `BUDGET_DIVISOR_MUSIC` (5), `BUDGET_DIVISOR_PLATFORM` (10)
- `BLOCKER_SCORE_THRESHOLD` (0), `CRITICAL_WEIGHT_THRESHOLD` (0.1)
- `RECOMMENDATION_SCORE_THRESHOLD` (60), `DEFAULT_NULLABLE_SCORE` (50)
- `HIGH_IMPACT_WEIGHT` (0.12), `MEDIUM_IMPACT_WEIGHT` (0.08)
- `RETARGETING_FULL_SCORE` (80), `RETARGETING_PARTIAL_SCORE` (40)
- `SOCIAL_PROOF_SCORE` (80), `NEEDS_FIX_THRESHOLD` (60)

**`decision-engine.ts`**: Hardcoded epsilon `0.001` for float comparison.

**Fix applied**: Extracted to `FLOAT_COMPARISON_EPSILON`.

### 2.4 Unsafe Non-null Assertions (Severity: High) — FIXED

**`signal-graph.ts`**: Lines 121, 133, 134, 144 used `channel!` non-null assertions without guards, which would throw if channel was null despite the filter on line 118 appearing to handle it.

**Fix applied**: Replaced with type-narrowing filter using a type predicate:
```ts
const touchpointsWithChannel = sorted.filter(
  (e): e is SignalEvent & { channel: string } =>
    !conversionTypes.includes(e.event_type) && typeof e.channel === 'string' && e.channel.length > 0
);
```

### 2.5 Missing Input Validation (Severity: Medium) — FIXED

**`ReadinessScorer.score()`**: No validation that `input.project` exists or has a valid `launch_type`. Would throw cryptic error deep in `getLaunchCategory()`.

**Fix applied**: Added guard: `if (!input.project?.launch_type) throw new Error(...)`.

**`DecisionEngine.evaluate()`**: Would iterate needlessly over an empty metrics array.

**Fix applied**: Early return: `if (metrics.length === 0) return []`.

### 2.6 Loose Type Definitions (Severity: Low) — PARTIALLY FIXED

**`types.ts`**: 10 uses of `Record<string, unknown>`. Two had known shapes:

- `action_config` on `DecisionRule` → Now typed as `ActionConfig` with `budget_multiplier?`, `reallocation_pct?`, `scale_factor?`
- `context` on `DecisionActionLog` → Now typed as `DecisionContext` with `metric_value`, `threshold`, `condition`

The remaining 8 (`input_metadata`, `content`, `config`, `results`, `result`, `metadata`, `supporting_data`) are genuinely flexible JSONB blobs matching Supabase columns — left as-is.

### 2.7 Test Coverage Gaps (Severity: Low)

| Module | Has Dedicated Tests |
|--------|-------------------|
| decision-engine | Yes |
| readiness-score | Yes |
| signal-graph | Yes |
| launch-type-engine | Yes |
| launch-os-hardening (entities, agents, pipeline, QA, governance, observability) | Yes (combined) |
| creative-qa | Only in hardening suite |
| approval-governance | Only in hardening suite |
| integration-health | Only in hardening suite |
| observability | Only in hardening suite |

**Recommendation**: The hardening test file covers the basics, but dedicated test files for creative-qa and observability would improve coverage for edge cases (QA check failures, circuit breaker state transitions).

---

## 3. Architectural Strengths

1. **Evidence-level tracking** (VERIFIED/DERIVED/TEMPLATE) is woven throughout every layer — from entities to pipeline stages to QA checks to observability quality scoring.

2. **Approval governance** with 12 checkpoint types, SLA enforcement, and blocking levels provides real production-grade governance.

3. **Clean separation** via the `useLaunchOS` context hook means UI pages never directly import low-level modules — the hook acts as a facade.

4. **Test foundation**: 37 tests across 5 test files covering unit, integration, and E2E scenarios.

5. **Integration health dashboard** that never hides errors — every connector incapacity is visible with actionable remediation.

---

## 4. Recommendations (Not in Scope for This PR)

### Priority 1 — Near-term

| # | Recommendation | Impact |
|---|---------------|--------|
| 1 | Wire CreativeQA checks into LaunchProject's Creatives tab | Surfaces existing QA capabilities to users |
| 2 | Add observability metrics to LaunchCommandCenter | Real-time run health and quality scoring |
| 3 | Wire LaunchCommandCenter component into a route | Dashboard exists but isn't rendered |

### Priority 2 — Medium-term

| # | Recommendation | Impact |
|---|---------------|--------|
| 4 | Add dedicated tests for creative-qa and observability modules | Better edge-case coverage |
| 5 | Build agent management UI showing the 15 agent specs | Makes agent capabilities visible |
| 6 | Add approval governance configuration UI in DecisionCenter | Allows policy management without code changes |

### Priority 3 — Long-term

| # | Recommendation | Impact |
|---|---------------|--------|
| 7 | Wire remaining 13 agents to AI gateway for actual execution | Moves from spec to runtime |
| 8 | Add real-time WebSocket for signal event streaming | Live dashboard updates |
| 9 | Consider splitting launch-os into sub-packages if it continues growing | Better tree-shaking and module boundaries |

---

## 5. Changes Made in This PR

| File | Change |
|------|--------|
| `src/lib/launch-os/readiness-score.ts` | Extracted 6 shared dimension builders, 15 named constants, added input validation |
| `src/lib/launch-os/signal-graph.ts` | Replaced non-null assertions with type-safe filter, extracted attribution helper |
| `src/lib/launch-os/decision-engine.ts` | Extracted epsilon constant, added early return for empty metrics |
| `src/lib/launch-os/types.ts` | Added `ActionConfig` and `DecisionContext` typed interfaces |
| `src/lib/launch-os/index.ts` | Added JSDoc comments documenting UI integration status of exports |
| `docs/ARCHITECTURE_REVIEW_2026-03-24.md` | This document |
