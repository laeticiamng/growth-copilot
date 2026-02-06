

# Multi-Role Platform Audit - Round 16: Remaining Hardcoded French Strings

## Audit Summary

After thorough exploration of every dashboard page and component, the platform is architecturally solid with proper RLS, auth, RBAC, and a well-structured multi-tenant system. The primary remaining issue is **i18n compliance**: approximately 15 files still contain hardcoded French strings that violate the "Zero Hardcoded Strings" policy.

---

## Findings by Role

### CEO (Strategic)
- Platform architecture is complete and coherent: 39 agents, 11 departments, executive cockpit with real-time health scoring.
- No structural issues found.

### CTO (Technical)
- No console errors detected. Network requests return 200s with valid data.
- Provider composition is clean (24 providers organized into 4 groups).
- QueryClient has sensible defaults (5min stale, no retry on auth errors).

### CPO (Product)
- `window.prompt()` issue was fixed in previous round (replaced with Dialog).
- All cockpit sections follow logical hierarchy.

### CISO (Security)
- RLS active on all tables, JWT validation on edge functions, immutable audit log.
- No new critical issues found.

### DPO (GDPR)
- GDPR export, click anonymization, rate limiting all in place.
- No issues.

### CDO (Data)
- KPI pipeline (kpis_daily, data_quality_alerts, evidence_bundles) is coherent.
- No issues.

### COO (Operations)
- Automations and webhooks hooks have hardcoded French toast messages (see below).

### Head of Design (UX)
- Responsive grid patterns are correct across all pages.
- No visual hierarchy issues.

### Beta Tester (i18n)
- **Main finding**: 15 files with ~200 hardcoded French strings remain. These are across dashboard pages, hooks, and components that were not covered in previous i18n migration batches.

---

## Files Requiring i18n Migration

### Group 1: Dashboard Pages (~120 strings)

| File | Hardcoded FR Strings (approx) |
|------|------------------------------|
| `pages/dashboard/Agents.tsx` | ~25 (KPI labels, tab names, status labels, empty states) |
| `pages/dashboard/Content.tsx` | ~30 (page header, tab labels, table headers, toasts, form labels, status badges) |
| `pages/dashboard/CRO.tsx` | ~15 (toasts, status labels, empty state, button labels) |
| `pages/dashboard/Integrations.tsx` | ~10 (capability descriptions, toasts) |
| `pages/dashboard/SEOTech.tsx` | ~10 (toasts, status badges) |
| `pages/dashboard/ApprovalsV2.tsx` | ~8 (toasts, status labels) |
| `pages/dashboard/Approvals.tsx` | ~5 (toasts) |
| `pages/dashboard/AccessReview.tsx` | ~5 (risk labels) |
| `pages/dashboard/MediaAssets.tsx` | ~3 (toasts) |
| `pages/dashboard/StatusPage.tsx` | ~5 (status labels) |

### Group 2: Hooks (~20 strings)

| File | Hardcoded FR Strings |
|------|---------------------|
| `hooks/useWebhooks.tsx` | ~15 (WEBHOOK_EVENTS labels, all toast messages) |
| `hooks/useAutomations.tsx` | ~12 (TRIGGER_TYPES, ACTION_TYPES labels, toast messages) |

### Group 3: Components (~50 strings)

| File | Hardcoded FR Strings |
|------|---------------------|
| `components/webhooks/AdvancedWebhooks.tsx` | ~40 (full page with headers, dialog labels, form labels, operators, empty states, button labels, tab names) |
| `components/automations/AutopilotConfigPanel.tsx` | ~25 (section headers, radio labels, category labels, descriptions, button labels) |
| `components/cockpit/WelcomeCard.tsx` | 1 (inline locale ternary for date format) |

---

## Implementation Plan

### Batch 1 - Hooks (2 files)
Convert `useWebhooks.tsx` and `useAutomations.tsx`:
- Move WEBHOOK_EVENTS, TRIGGER_TYPES, ACTION_TYPES from static const objects to functions that accept `t`
- Replace all toast French strings with `t()` calls
- Add `useTranslation` hook

### Batch 2 - Components (3 files)
Migrate `AdvancedWebhooks.tsx`, `AutopilotConfigPanel.tsx`, and fix `WelcomeCard.tsx`:
- Add `t` destructuring from `useTranslation`
- Replace all French labels, headers, descriptions, and status text
- Convert OPERATORS const to a function

### Batch 3 - Dashboard Pages (10 files)
Migrate all dashboard pages listed above:
- Add `useTranslation` where missing (Content.tsx has no i18n at all)
- Replace page headers, tab labels, toasts, status badges, table headers, empty states, form labels

### Locale Files
Add ~200 new translation keys to `en.ts` and `fr.ts` under:
- `pages.agents.*` (~25 keys)
- `pages.content.*` (~30 keys)
- `pages.cro.*` (~15 keys)
- `pages.integrations.*` (~10 keys)
- `pages.seo.*` (~10 keys)
- `pages.approvals.*` (~13 keys)
- `pages.accessReview.*` (~5 keys)
- `pages.media.*` (~3 keys)
- `pages.status.*` (~5 keys)
- `components.webhooks.*` (~40 keys)
- `components.autopilot.*` (~25 keys)
- `hooks.webhookEvents.*` (~13 keys)
- `hooks.automations.*` (~12 keys)

### Technical Notes
- Hook-level i18n: For hooks like `useWebhooks` that return toast messages, the `useTranslation` hook will be added directly to the hook. This is valid since React hooks can call other hooks.
- Static const objects (WEBHOOK_EVENTS, TRIGGER_TYPES, ACTION_TYPES, OPERATORS) will be converted to functions accepting `t` or resolved at render time.
- Content.tsx page currently has zero i18n -- it needs `useTranslation` import added plus all strings migrated.
- WelcomeCard.tsx has one remaining inline locale ternary for date formatting that should use a more generic approach.

**Total: ~15 files modified + en.ts + fr.ts = ~17 files**

