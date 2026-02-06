
# Batch 3 Suite - i18n Migration for 8 Remaining Dashboard Files

## Audit Summary (Round 13)

All 8 files already have `useTranslation` and `getIntlLocale` imported (except BrandKit.tsx which has neither, and TemplateAdsFactory.tsx which has neither). The i18n keys were already added to `en.ts` and `fr.ts` under the `modules.*` namespace in the previous round. Now the actual string replacements need to happen.

### Files and Hardcoded French Strings Count

| File | Hardcoded FR Strings | Date Locale Issues | Notes |
|------|---------------------|-------------------|-------|
| **Competitors.tsx** | ~45 strings | 0 (already fixed) | Has `useTranslation` but only uses `i18n` for locale, not `t()` for strings |
| **LocalSEO.tsx** | ~50 strings | 0 (already fixed) | Same pattern - has `useTranslation` but never calls `t()` |
| **Reports.tsx** | ~35 strings | 0 (already fixed) | `formatTimeAgo()` still uses hardcoded FR strings |
| **Reputation.tsx** | ~40 strings | 0 (already fixed) | Has `useTranslation` but never calls `t()` |
| **BrandKit.tsx** | ~30 strings | N/A | Missing `useTranslation` entirely |
| **CMS.tsx** | ~35 strings | 1 (`'fr-FR'` line 343) | `STATUS_CONFIG` and `PAGE_TYPES` are hardcoded FR outside component |
| **TemplateAdsFactory.tsx** | ~25 strings | 1 (`'fr-FR'` line 285) | Missing `useTranslation` entirely |
| **Approvals.tsx** | Already done | Already done | Verified - no remaining FR strings |

**Total: ~260 hardcoded French strings across 7 files (Approvals already complete)**

## Technical Approach

### For each file:
1. Add `const { t } = useTranslation()` or destructure `t` from existing `useTranslation()` call
2. Replace every hardcoded French string with `t("modules.<module>.<key>")`
3. For files with `STATUS_CONFIG` / `PAGE_TYPES` defined outside the component (CMS.tsx), move them inside or use a function pattern
4. Fix remaining `'fr-FR'` date locales in CMS.tsx and TemplateAdsFactory.tsx
5. Localize `formatTimeAgo()` in Reports.tsx using `t("modules.reports.timeAgo.*")`

### Special Handling:
- **CMS.tsx**: `STATUS_CONFIG` and `PAGE_TYPES` are const objects outside the component, so they can't use `t()`. Solution: convert to functions that accept `t` or move labels inline.
- **BrandKit.tsx**: Needs `import { useTranslation } from "react-i18next"` added.
- **TemplateAdsFactory.tsx**: Needs both `useTranslation` and `getIntlLocale` imports added.
- **Competitors.tsx SWOT export**: The markdown export content uses French headers -- these should use `t()` too.

## File-by-File Changes

### 1. Competitors.tsx (660 lines)
- Add `t` to existing `useTranslation()` destructuring (line 49)
- Replace ~45 strings: titles, subtitles, button labels, toast messages, table headers, empty states, SWOT dialog labels, compliance notice, dialog labels

### 2. LocalSEO.tsx (558 lines)
- Add `t` to existing `useTranslation()` destructuring (line 44)
- Replace ~50 strings: metric labels, tab labels, button labels, toast messages, empty state descriptions, review dialog labels, GBP post dialog labels, FAQ section

### 3. Reports.tsx (474 lines)
- Add `t` to existing `useTranslation()` destructuring (line 18)
- Replace ~35 strings: page title/subtitle, tab labels, KPI labels, toast messages, empty states, `formatTimeAgo()` strings
- Localize `formatTimeAgo()` using `t("modules.reports.timeAgo.*")`

### 4. Reputation.tsx (437 lines)
- Add `t` to existing `useTranslation()` destructuring (line 21)
- Replace ~40 strings: KPI labels, button labels, dialog labels, toast messages, badge labels, alert messages, empty state text

### 5. BrandKit.tsx (412 lines)
- Add `import { useTranslation } from "react-i18next"`
- Add `const { t } = useTranslation()` in component
- Replace ~30 strings: section titles, descriptions, labels, placeholders, toast messages, empty state text

### 6. CMS.tsx (628 lines)
- Move `STATUS_CONFIG` labels and `PAGE_TYPES` labels to use `t()` inline (convert const to a function or use `t()` directly where labels are rendered)
- Fix `toLocaleDateString('fr-FR')` on line 343 to use `getIntlLocale(i18n.language)`
- Replace ~35 strings: tab labels, dialog labels, button labels, empty state texts, status labels

### 7. TemplateAdsFactory.tsx (640 lines)
- Add `import { useTranslation } from "react-i18next"` and `import { getIntlLocale } from "@/lib/date-locale"`
- Fix `toLocaleDateString('fr-FR')` on line 285
- Replace ~25 strings: form labels, select options, tab labels, empty state, button labels

## Estimated Impact
- **7 files modified** (Approvals already complete)
- **~260 strings migrated** to `t()` calls
- **2 date locale fixes** (CMS, TemplateAdsFactory)
- **1 `formatTimeAgo()` localization** (Reports)
- All keys already exist in `en.ts` and `fr.ts` from the previous round
