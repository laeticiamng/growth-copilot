

# Sub-batch B - Component i18n Migration (~20 files)

## Overview

Migrate all remaining hardcoded French strings in 20 component files, plus TeamManagement.tsx. Each file needs `useTranslation` added (or `t` destructured from existing hook), French strings replaced with `t()` calls, and corresponding keys added to `en.ts` and `fr.ts`.

## Files to Modify

### Connectors (2 files, ~20 strings)
1. **GoogleSuperConnector.tsx** - Add `t` destructuring. Migrate: toasts (lines 62-91), module descriptions (lines 113-144), badges ("Connecte"/"Non connecte"), info box text (lines 210-216), button labels ("Autoriser l'acces").
2. **MetaSuperConnector.tsx** - Add `useTranslation`. Migrate: toasts (lines 39-68), badges, button labels, info box text (lines 166-172), module descriptions (lines 180-238).

### Metrics Widgets (2 files, ~12 strings)
3. **GA4MetricsWidget.tsx** - Add `useTranslation`. Migrate: toasts (lines 118-142, 169), empty state texts (lines 215-226, 335-336), "Derniere sync" label (line 242), metric label "Revenu" (line 284).
4. **MetaMetricsWidget.tsx** - Add `useTranslation`. Migrate: toasts (lines 138-163, 189), empty state texts (lines 232-243, 344-347), "Derniere sync" label (line 261), "Top posts" label (line 353).

### AI Generators (5 files, ~40 strings)
5. **SalesScriptGenerator.tsx** - Add `t` to existing hook. Migrate: SCRIPT_TYPES labels (lines 32-36), COMMON_OBJECTIONS (lines 38-47, keep as FR since they're business content), toasts (lines 62, 118, 143, 150, 180), form labels (lines 222-246), button labels (lines 253-260, 279-288), tab labels (lines 296-299), "Scripts sauvegardes" (line 335).
6. **LeadQualifier.tsx** - Add `useTranslation`. Migrate: sources labels (lines 63-69), pipelineStages labels (lines 72-78), toasts (lines 98-227), form labels (lines 280-341), badge labels (lines 249-251), "Prochaine etape" (line 398), tab labels (lines 272-273).
7. **ContentStrategyGenerator.tsx** - Add `useTranslation`. Migrate: toasts (lines 73-202), form placeholders (lines 282-287), button labels (lines 294-304), tab labels (lines 329-340), section labels (lines 381-429), empty state (lines 478-485).
8. **SocialPostGenerator.tsx** - Add `useTranslation`. Migrate: toasts (lines 66-161), button labels (lines 240-250), form placeholder (line 224), "Variante" badge (line 283), "Publier" button (line 303), "CTA recommande" (line 331), "caracteres" labels.
9. **AdsOptimizer.tsx** - Add `useTranslation`. Migrate: toasts (lines 62-159), form labels (lines 191-231), select options (lines 229-231), section headers (lines 266-348), budget labels (lines 352-358).

### CRO & Social (2 files, ~15 strings)
10. **CROSuggestionsAI.tsx** - Add `useTranslation`. Migrate: toasts (lines 59, 122-128, 139), button/label text (lines 159-162, 174-185), empty state (lines 289-293), impact/effort labels (lines 244-251).
11. **RepurposeEngine.tsx** - Add `useTranslation`. Migrate: toasts (lines 90-183), card titles/descriptions (lines 202-208), dialog labels (lines 334-376, 387-438), button labels, status badges (lines 296-300), empty state (lines 219-225).

### Research (1 file, ~8 strings)
12. **SmartResearchHub.tsx** - Add `useTranslation`. Migrate: modeConfig labels/descriptions (lines 43-66), button labels (lines 162-184), "Resultats de recherche" (line 193), "sources" badge (line 211), "Sources :" label (line 228).

### Notifications (2 files, ~20 strings)
13. **AlertRulesConfig.tsx** - Add `useTranslation`. Migrate: METRIC_OPTIONS labels (lines 58-66), DEFAULT_RULES names/descriptions (lines 70-93), condition labels (lines 122-133), dialog labels (lines 215-306), toasts (lines 144-188), empty state (lines 362-364).
14. **NotificationPreferences.tsx** - Add `useTranslation`. Migrate: channel names/descriptions (lines 46-49), notification type labels/descriptions (lines 52-88), section titles (lines 128-131, 158-161, 194-197), digest frequency labels (lines 207-210), toast (line 110), button label (line 220).

### Data Export (1 file, ~6 strings)
15. **DataExportButton.tsx** - Add `useTranslation`. Migrate: toasts (lines 84, 97-98, 103, 110), "Exporter" button labels (lines 156, 174), "Format d'export" label (line 177).

### Team Management (1 file, ~30 strings)
16. **TeamManagement.tsx** - Add `t` to existing `useTranslation`. Migrate: roleLabels (lines 56-62), all toasts (lines 90-143), header text (lines 154-156), loading message (line 166), card titles (lines 175, 229, 232), member labels (lines 239, 256-258), dropdown items (lines 275-289), dialog text (lines 307-348).

## New i18n Keys

All keys will be added under new namespaces in `en.ts` and `fr.ts`:

- `components.connectors.*` (~20 keys)
- `components.ga4Widget.*` (~12 keys)
- `components.metaWidget.*` (~12 keys)
- `components.salesScript.*` (~20 keys)
- `components.leadQualifier.*` (~25 keys)
- `components.contentStrategy.*` (~20 keys)
- `components.socialPost.*` (~15 keys)
- `components.adsOptimizer.*` (~20 keys)
- `components.croSuggestions.*` (~15 keys)
- `components.repurpose.*` (~20 keys)
- `components.research.*` (~10 keys)
- `components.alertRules.*` (~25 keys)
- `components.notifications.*` (~25 keys)
- `components.dataExport.*` (~6 keys)
- `components.team.*` (~30 keys)

## Technical Notes

- For const objects defined outside components (like `SCRIPT_TYPES`, `METRIC_OPTIONS`, `sources`, `pipelineStages`, `categoryLabels`, `roleLabels`), these will be converted to functions that accept `t` or the labels will be resolved inline where they are rendered.
- `COMMON_OBJECTIONS` in SalesScriptGenerator.tsx are business/sales training content used as AI prompt context -- these will remain in French as they are domain-specific training data, not UI strings.
- The fallback script templates in `generateFallbackScript()` and `generateFallbackObjections()` are also business content (sales scripts) and will remain in French.
- Total: ~275 new i18n keys across 16 component files + en.ts + fr.ts = 18 files modified.

## Execution

Due to the volume, this will be implemented in 2 parallel batches:
- **Batch B1**: Files 1-8 (connectors, widgets, generators) + en.ts/fr.ts keys
- **Batch B2**: Files 9-16 (CRO, social, notifications, team) + remaining en.ts/fr.ts keys

