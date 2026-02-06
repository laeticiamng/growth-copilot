

# Pre-Publication Audit - Round 19: Complete i18n Migration

## Audit Summary

| Role | Verdict |
|------|---------|
| CEO | Platform feature-complete, coherent architecture. Ready for publication. |
| CISO | RLS on all tables, JWT on edge functions, immutable audit log. No critical findings. |
| DPO | GDPR export, anonymization, rate limiting operational. No issues. |
| CDO | KPI pipeline coherent, data quality alerts in place. No issues. |
| COO | Automations functional. French strings in UI components need i18n. |
| Head of Design | Responsive layouts correct. No visual hierarchy issues. |
| Beta Tester | **PRIMARY BLOCKER**: 12 files still render hardcoded French strings, breaking the experience for non-French users entirely. |

## Problem

All translation keys already exist in `en.ts` and `fr.ts` under organized namespaces (`croPage`, `seoPage`, `integrationsPage`, `approvalsV2Page`, `statusPage`, `hrPage`, `legalPage`, `agentsPage`, `accessReviewPage`, `webhooksComponent`, `autopilotComponent`, `sitesPage`). However, **the 12 component files don't use `t()` calls** -- they still have hardcoded French text.

The BusinessHealthScore tooltip warning is already resolved (uses `asChild` + `<button>`).

## Files to Modify (12 files)

### Group A: Dashboard Pages with Zero i18n Usage (3 files)

**1. `src/pages/dashboard/CRO.tsx`** (~559 lines)
- Add `import { useTranslation } from "react-i18next"` and `const { t } = useTranslation()`
- Replace ~80 hardcoded strings with `t("croPage.*")` calls
- Key mappings: "Taux de conversion" -> `t("croPage.conversionRate")`, "Visiteurs" -> `t("croPage.visitors")`, etc.
- Convert `conversionMetrics` array labels from French to `t()` calls (must move inside component since `t` is a hook value)

**2. `src/pages/dashboard/Integrations.tsx`** (~578 lines)
- Add `import { useTranslation } from "react-i18next"` and `const { t } = useTranslation()`
- Replace ~50 hardcoded strings with `t("integrationsPage.*")` calls
- Convert `platformTools` array and `categoryConfig` descriptions to use `t()` (move inside component or convert to getter functions)
- Key mappings: "Outils & Integrations" -> `t("integrationsPage.title")`, "Comment ca fonctionne ?" -> `t("integrationsPage.howItWorks")`, etc.

**3. `src/pages/dashboard/StatusPage.tsx`** (~438 lines)
- Add `import { useTranslation } from "react-i18next"` and `const { t } = useTranslation()`
- Replace ~30 hardcoded strings with `t("statusPage.*")` calls
- The static data arrays (CORE_OS, DEPARTMENTS, INTEGRATIONS) contain French `details` strings -- these are technical feature descriptions that are acceptable to keep as-is (mixed EN/FR) since the page is an internal status dashboard
- Convert status labels: "Complet" -> `t("statusPage.complete")`, "En cours" -> `t("statusPage.inProgress")`, "Planifie" -> `t("statusPage.planned")`

### Group B: Dashboard Pages with `useTranslation` Imported but Unused (3 files)

**4. `src/pages/dashboard/SEOTech.tsx`** (~661 lines)
- `t` is imported but barely used. Replace ~60 French strings with `t("seoPage.*")` calls
- Key mappings: "SEO Technique" -> `t("seoPage.title")`, "Lancer l'audit" -> `t("seoPage.launchAudit")`, etc.
- Convert `getEffortBadge` labels: "Facile" -> `t("seoPage.easy")`, "Moyen" -> `t("seoPage.medium")`, "Complexe" -> `t("seoPage.complex")`

**5. `src/pages/dashboard/ApprovalsV2.tsx`** (~671 lines)
- `t` is imported but barely used. Replace ~50 French strings with `t("approvalsV2Page.*")` calls
- Key mappings: "Centre d'approbation 2.0" -> `t("approvalsV2Page.title")`, "Faible" -> `t("approvalsV2Page.riskLow")`, etc.
- Convert `autopilotRules` names and `getRiskBadge` labels

**6. `src/pages/dashboard/AccessReview.tsx`** (~396 lines)
- `t` is imported. Expand usage of `t("accessReviewPage.*")` for remaining French strings

### Group C: Dashboard Pages with Static Label Constants (3 files)

**7. `src/pages/dashboard/HR.tsx`** (~756 lines)
- `t` is imported. Convert `STATUS_LABELS`, `CONTRACT_LABELS`, `TIME_OFF_LABELS` from static objects to getter functions: `getStatusLabels(t)`, `getContractLabels(t)`, `getTimeOffLabels(t)`
- Replace remaining ~40 French strings with `t("hrPage.*")` calls

**8. `src/pages/dashboard/Legal.tsx`** (~671 lines)
- `t` is imported but unused. Convert `CONTRACT_STATUS_LABELS` and `CONTRACT_TYPES` to getter functions
- Replace ~40 French strings with `t("legalPage.*")` calls

**9. `src/pages/dashboard/Sites.tsx`** (~478 lines)
- `t` is imported. Convert `sectors` array to `getSectors(t)` function
- Replace remaining French strings with `t("sitesPage.*")` calls

### Group D: Dashboard Page with Agent Personas (1 file)

**10. `src/pages/dashboard/Agents.tsx`** (~646 lines)
- `t` is imported and used for some strings. Replace remaining French labels (KPI labels, tab names, status badges) with `t("agentsPage.*")` calls
- Agent persona names and greetings stay in French (character identity)

### Group E: Components (2 files)

**11. `src/components/webhooks/AdvancedWebhooks.tsx`** (~546 lines)
- `t` is imported but unused. Convert `OPERATORS` array to `getOperators(t)` function
- Replace ~40 French strings with `t("webhooksComponent.*")` calls

**12. `src/components/automations/AutopilotConfigPanel.tsx`** (~274 lines)
- No `useTranslation` imported. Add it.
- Convert `categoryLabels` to use `t("autopilotComponent.*")`
- Replace ~25 French strings

## Implementation Strategy

Each file follows the same pattern:
1. Ensure `useTranslation` is imported and `const { t } = useTranslation()` is destructured
2. Replace every hardcoded French string with the corresponding `t("namespace.key")` call
3. For static const objects at module level (OPERATORS, STATUS_LABELS, etc.), convert to functions that accept `t` and call them inside the component

No new locale keys are needed -- all keys already exist in both `en.ts` and `fr.ts`.

## Technical Notes

- Static const objects at module level cannot use `t()` directly since it's only available inside components. These must be converted to functions: `const getLabels = (t: TFunction) => ({...})`
- The `platformTools` array in Integrations.tsx has nested French descriptions. These will be moved inside the component or converted to use `t()` via a mapping function.
- Agent persona names (Sophie Marchand, etc.) and their French greetings are intentional character flavor and will NOT be translated.
- StatusPage feature `details` strings are mixed EN/FR technical descriptions for an internal dashboard -- these can remain as-is for now.

**Total: 12 files modified, 0 new locale keys needed**

