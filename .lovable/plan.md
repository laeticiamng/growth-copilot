

# Pre-Publication Critical Audit - Round 17

## Audit Results

### CEO - Strategic
- Platform is feature-complete with coherent architecture. No structural blockers for launch.

### CTO - Technical  
- No console errors, network requests healthy. One remaining `window.prompt()` UX anti-pattern in `Approvals.tsx`.

### CISO - Security
- RLS on 131 tables, JWT validation on all edge functions, immutable audit log. No critical findings.

### DPO - GDPR
- GDPR export, anonymization, rate limiting all operational. No issues.

### CDO - Data
- KPI pipeline coherent (kpis_daily, data_quality_alerts, evidence_bundles). No issues.

### COO - Operations
- Automations and webhooks functional. Hardcoded French toasts in operational hooks need i18n.

### Head of Design - UX
- `window.prompt()` for rejection reason in `Approvals.tsx` (line 46) is a UX bug -- primitive browser dialog instead of proper UI.

### Beta Tester - i18n Compliance
- **Main blocker**: ~150 hardcoded French strings remain across 13 files. This breaks the English experience entirely for non-French users.

---

## Critical Corrections (Pre-Publication)

### Fix 1: Replace `window.prompt()` in Approvals.tsx
Replace the browser `window.prompt()` on line 46 with a state-driven Radix Dialog (same pattern already implemented in `PriorityActionsEnhanced.tsx`).

### Fix 2: Localize remaining hardcoded French strings (13 files)

| File | Type | ~Strings |
|------|------|----------|
| `pages/dashboard/Content.tsx` | Page (0% i18n) | 15 |
| `pages/dashboard/CRO.tsx` | Page | 12 |
| `pages/dashboard/SEOTech.tsx` | Page | 10 |
| `pages/dashboard/ApprovalsV2.tsx` | Page | 8 |
| `pages/dashboard/Approvals.tsx` | Page | 3 |
| `pages/dashboard/Integrations.tsx` | Page | 5 |
| `pages/dashboard/MediaAssets.tsx` | Page | 1 |
| `pages/dashboard/HR.tsx` | Page (label constants) | 15 |
| `pages/dashboard/Legal.tsx` | Page (label constants) | 12 |
| `pages/dashboard/Sites.tsx` | Sectors array | 8 |
| `pages/dashboard/StatusPage.tsx` | Entire page labels | 30 |
| `components/finance/ROICalculator.tsx` | Toasts | 5 |
| `components/competitors/*` | Toasts | 4 |

### Fix 3: Add locale keys to en.ts and fr.ts
Add ~130 new translation keys under organized namespaces.

---

## Implementation Batches

### Batch A: UX Fix (1 file)
- `Approvals.tsx`: Add Dialog state (`rejectingId`, `rejectionReason`), replace `window.prompt` with Dialog + Textarea + Confirm/Cancel buttons.

### Batch B: Dashboard pages i18n (10 files)
For each file:
- Add `useTranslation` if missing
- Replace hardcoded French strings with `t()` calls
- Convert static label constant objects (STATUS_LABELS, CONTRACT_LABELS, etc.) to functions that accept `t`

### Batch C: Component i18n (3 files)  
- `ROICalculator.tsx`: Replace 5 hardcoded French toasts
- `CompetitorAlerts.tsx` and `BacklinksAnalysis.tsx`: Replace 4 hardcoded French toasts

### Batch D: Locale files
- Add all new keys to `en.ts` and `fr.ts`

**Total: ~16 files modified**

