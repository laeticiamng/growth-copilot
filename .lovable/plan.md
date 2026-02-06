
# Pre-Publication Audit - Round 18

## Audit Results

### CEO - Strategic
- Platform is feature-complete: 39 agents, 11 departments, executive cockpit, real-time sync. No structural blockers.

### CTO - Technical
- Console warning: `BusinessHealthScore.tsx` passes a function component to Tooltip without `forwardRef`. Non-blocking but should be fixed.
- No network errors. All API calls return 200.

### CISO - Security
- RLS on all tables, JWT validation on edge functions, immutable audit log. No critical findings.

### DPO - GDPR
- Export, anonymization, rate limiting operational. No issues.

### CDO - Data
- KPI pipeline coherent. No issues.

### COO - Operations
- All operational hooks functional. Remaining French strings in automation/webhook components need i18n.

### Head of Design - UX
- Responsive layouts correct. No visual hierarchy issues detected.

### Beta Tester - i18n Compliance
- **PRIMARY BLOCKER**: 12 files still contain 400+ hardcoded French strings despite `useTranslation` being imported in some. This completely breaks the English/German/Spanish/etc. experience.

---

## Critical Corrections Required

### Fix 1: Complete i18n migration (12 files)

| File | Status | Approx Strings |
|------|--------|----------------|
| `pages/dashboard/CRO.tsx` | Zero i18n usage | ~80 |
| `pages/dashboard/SEOTech.tsx` | `t` imported but unused | ~60 |
| `pages/dashboard/ApprovalsV2.tsx` | `t` imported but unused | ~50 |
| `pages/dashboard/Integrations.tsx` | No `useTranslation` | ~50 |
| `pages/dashboard/StatusPage.tsx` | No `useTranslation` | ~30 |
| `pages/dashboard/HR.tsx` | Static label constants in French | ~40 |
| `pages/dashboard/Legal.tsx` | Static label constants in French | ~40 |
| `pages/dashboard/Agents.tsx` | Agent personas in French | ~25 |
| `pages/dashboard/AccessReview.tsx` | Minimal usage | ~10 |
| `components/webhooks/AdvancedWebhooks.tsx` | OPERATORS + all labels French | ~40 |
| `components/automations/AutopilotConfigPanel.tsx` | Category labels French | ~25 |
| `pages/dashboard/Sites.tsx` | Sectors array French | ~8 |

### Fix 2: Console warning fix
- `BusinessHealthScore.tsx`: Wrap the Tooltip trigger element with `forwardRef` or use a `<button>` wrapper (already partially done, just needs the `asChild` pattern adjusted).

---

## Implementation Plan

### Batch 1: Locale files (en.ts + fr.ts)
Add ~450 new translation keys under organized namespaces:
- `croPage.*` (~80 keys: metrics labels, tab names, dialog fields, toasts, status badges, empty states)
- `seoPage.*` (expand existing ~60 keys: all button labels, status text, metric labels, loading messages)
- `approvalsV2Page.*` (expand existing ~50 keys: all preview labels, status text, toasts, dialog text)
- `integrationsPage.*` (~50 keys: tool descriptions, capabilities, how-it-works text, badges, toasts)
- `statusPageFull.*` (~30 keys: status labels, section headers, department names, feature descriptions)
- `hrPage.*` (~40 keys: all form labels, dialog text, status labels, tab names, stat labels, button text)
- `legalPage.*` (~40 keys: contract status labels, type labels, form labels, tab names, alert text)
- `agentsPage.*` (~25 keys: KPI labels, tab names, status badges - agent personas stay French as they are character names)
- `accessReviewPage.*` (expand ~10 keys)
- `webhooksComponent.*` (~40 keys: operator labels, dialog fields, tab names, buttons, empty states)
- `autopilotComponent.*` (~25 keys: category labels, risk descriptions, section headers)
- `sitesPage.*` (~8 keys: sector names)

### Batch 2: Dashboard pages (10 files)
For each file:
- Ensure `useTranslation` is imported and `t` is destructured
- Replace every hardcoded French string with `t("namespace.key")`
- Convert static label objects (STATUS_LABELS, CONTRACT_STATUS_LABELS, CONTRACT_TYPES, TIME_OFF_LABELS, OPERATORS, etc.) to getter functions accepting `t`
- Files: CRO.tsx, SEOTech.tsx, ApprovalsV2.tsx, Integrations.tsx, StatusPage.tsx, HR.tsx, Legal.tsx, Agents.tsx, AccessReview.tsx, Sites.tsx

### Batch 3: Components (2 files)
- AdvancedWebhooks.tsx: Add `t()` for all labels, convert OPERATORS to function
- AutopilotConfigPanel.tsx: Add `t()` for category labels and all UI text

### Batch 4: Console warning fix (1 file)
- BusinessHealthScore.tsx: Ensure the Tooltip trigger uses a proper DOM element with `asChild`

### Technical Notes
- Static const objects at module level (like OPERATORS, STATUS_LABELS) must be converted to functions that return the object, since `t()` is only available inside components/hooks.
- Agent persona names (Sophie Marchand, etc.) and greetings are character-specific and should be kept as-is (or optionally translated as character flavor text).
- The sectors array in Sites.tsx will be converted to a `getSectors(t)` function.
- StatusPage.tsx contains a full platform feature inventory with mixed English/French. All labels will be standardized through i18n.

**Total: ~15 files modified, ~450 translation keys added**
