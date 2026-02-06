

# Batch 3 - i18n Migration for 12 Dashboard Files

## Overview

Migrate all hardcoded French strings (labels, toasts, placeholders, descriptions, status texts) to `t()` across 12 dashboard files. Add corresponding keys to `en.ts` and `fr.ts`.

## Scope

The following files have hardcoded French strings that need migration:

### Group A - High volume (20+ strings each)

1. **Offers.tsx** (~30 strings): Page title, subtitle, tab labels, dialog titles, form labels, toasts, guarantees defaults, badge labels, button labels, empty state descriptions, placeholders
2. **Ads.tsx** (~25 strings): Metric labels, tab labels, table headers, toasts, status badges, empty state descriptions, button labels, form labels, dialog title
3. **Social.tsx** (~25 strings): Tab labels, toasts, button labels, status badges, empty state descriptions, system prompts (kept in FR for AI context), dialog titles, export labels
4. **Competitors.tsx** (~25 strings): Tab labels, toasts, button labels, table headers, SWOT export labels, compliance notice, empty state descriptions, dialog titles
5. **LocalSEO.tsx** (~25 strings): Metric labels, tab labels, toasts, button labels, audit task labels, priority badges, empty state descriptions, dialog titles
6. **Reports.tsx** (~20 strings): Tab labels, toasts, formatTimeAgo strings, empty state descriptions, KPI labels, button labels

### Group B - Medium volume (10-20 strings each)

7. **Reputation.tsx** (~18 strings): KPI labels, badge labels, toasts, dialog labels, form labels, alert messages, empty state descriptions
8. **BrandKit.tsx** (~15 strings): Section titles, descriptions, labels, placeholders, toast messages, empty state text
9. **CMS.tsx** (~18 strings): STATUS_CONFIG labels, PAGE_TYPES labels, dialog labels, button labels, empty state texts, tab labels
10. **TemplateAdsFactory.tsx** (~15 strings): Form labels, select options, tab labels, empty state, button labels, date formatting fix

### Group C - Low volume (< 10 strings each)

11. **Diagnostics.tsx** (~12 strings): Health status labels, formatTimeAgo strings, section titles, button labels, system info labels
12. **Approvals.tsx** (already partially done, 1 `window.prompt` was localized) - verify no remaining strings

## Technical Approach

### For each file:
1. Add `import { useTranslation } from "react-i18next"` if not already present
2. Add `const { t } = useTranslation()` or `const { t, i18n } = useTranslation()` at component start
3. Replace every hardcoded French string with `t("module.key")`
4. Add all new keys to `en.ts` and `fr.ts` under the existing module namespaces (e.g., `offers`, `ads`, `social`)

### i18n key organization:
- Use existing namespace structure in en.ts/fr.ts (e.g., `dashboard.offers.*`, `dashboard.ads.*`)
- Group keys by function: labels, toasts, empty states, form fields, statuses
- Reuse existing keys where available (e.g., `common.cancel`, `common.save`)

### Special cases:
- `TemplateAdsFactory.tsx` line 285: Fix `toLocaleDateString('fr-FR')` to use `getIntlLocale(i18n.language)`
- `CMS.tsx` line 343: Fix `toLocaleDateString('fr-FR')` to use locale
- `Diagnostics.tsx` `formatTimeAgo()`: Localize time-relative strings
- `Reports.tsx` `formatTimeAgo()`: Same localization
- AI system prompts (Social, LocalSEO, Reputation): Keep in target language or make dynamic - these are prompt instructions, not UI strings. Will keep as-is since they define AI behavior.

## Estimated new keys: ~200 across en.ts and fr.ts

## Files modified: 12 dashboard files + en.ts + fr.ts = 14 files total

