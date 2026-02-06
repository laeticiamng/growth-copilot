

# Group 2 - Final i18n String Migration (Round 14 Complete)

## Scope

Migrate all remaining ~300+ hardcoded French strings across dashboard pages, components, and hooks. This covers everything not yet handled by Batches 1-4 and Group 1.

## Files to Modify

### Tier 1 - Dashboard Pages (~10 files, ~180 strings)

1. **Lifecycle.tsx** (~30 strings) - Pipeline stage names ("Nouveaux", "Contactes", "Qualifies", "Gagnes"), sales metric labels, toast messages, dialog labels, form placeholders, button labels. Add `useTranslation` import (missing).

2. **Agency.tsx** (~25 strings) - Already has `useTranslation` but only uses `i18n`. Add `t` destructuring. Migrate toasts, dialog labels, form labels, metric labels, status badges, empty state texts.

3. **CRO.tsx** (~20 strings) - Missing `useTranslation` entirely. Add import + hook. Migrate experiment form labels, toast messages, status badges, metric labels, confidence display text.

4. **Integrations.tsx** (~20 strings) - Missing `useTranslation` entirely. All `platformTools` descriptions, capability labels, category names, status badges. Add import + hook.

5. **ApprovalsV2.tsx** (~15 strings) - Already has `useTranslation`. Migrate remaining toast messages, approval/rejection labels, autopilot rule labels.

6. **AccessReview.tsx** (~10 strings) - Missing `useTranslation`. Add import + hook. Migrate risk config labels, table headers, status badges, date formatting.

7. **HR.tsx** - Verify; has `useTranslation` already. Check for remaining hardcoded strings ("Creation...", "Creer").

8. **Legal.tsx** - Same verification needed ("Creation...", "Creer", "Annuler").

9. **Sites.tsx** - Language option labels ("Francais", "Anglais", "Espagnol") need to be localized.

10. **ConnectionStatus.tsx** - Verify remaining strings.

### Tier 2 - Components (~20 files, ~120 strings)

11. **GoogleSuperConnector.tsx** (~6 strings) - Toast messages, button labels.
12. **MetaSuperConnector.tsx** (~4 strings) - Same pattern.
13. **GA4MetricsWidget.tsx** (~6 strings) - Toast messages, labels.
14. **MetaMetricsWidget.tsx** (~6 strings) - Toast messages, labels.
15. **SalesScriptGenerator.tsx** (~8 strings) - Toast messages, form labels.
16. **LeadQualifier.tsx** (~10 strings) - Tab labels, form labels, toast messages.
17. **ContentStrategyGenerator.tsx** (~8 strings) - Toast/labels.
18. **SocialPostGenerator.tsx** (~8 strings) - Toast/labels.
19. **AdsOptimizer.tsx** (~8 strings) - Toast/labels.
20. **CROSuggestionsAI.tsx** (~6 strings) - Toast/labels.
21. **RepurposeEngine.tsx** (~4 strings) - Toast/labels.
22. **SmartResearchHub.tsx** (~4 strings) - Toast/labels.
23. **AlertRulesConfig.tsx** (~4 strings) - Labels.
24. **AdvancedWebhooks.tsx** (~5 strings) - Labels, toasts.
25. **EvidenceBundleCard.tsx** / **EvidenceBundleViewer.tsx** (~8 strings) - Labels.
26. **BulkSiteImport.tsx** (~5 strings) - Labels, toasts.
27. **DataExportButton.tsx** (~4 strings) - Labels.
28. **NotificationPreferences.tsx** (~10 strings) - Section labels, toggle labels.
29. **TeamManagement.tsx** (~15 strings) - Labels, toasts, dialog text.

### Tier 3 - Hooks (~2 files, ~6 strings)

30. **useNetworkOffline.tsx** (~4 strings) - Toast messages ("Connexion retablie", "Connexion perdue").
31. **useAutopilotSettings.tsx** (~2 strings) - Toast messages.

### Tier 4 - Agent Profile Data (Special Case)

32. **AgentProfileDialog.tsx** - Contains ~240 hardcoded French strings for agent persona data (skills, education, languages, certifications). These are thematic/character data, not UI strings. Will be kept as-is since they define agent identities and localizing them would change the product's French business persona concept.

## i18n Key Organization

New keys will be added under existing namespaces in `en.ts` and `fr.ts`:

- `modules.lifecycle.*` - Pipeline, leads, deals
- `modules.agency.*` - Agency management
- `modules.cro.*` - Conversion optimization
- `modules.integrations.*` - Platform tools and connections
- `modules.approvalsV2.*` - Advanced approvals
- `modules.accessReview.*` - Access review
- `components.connectors.*` - Google/Meta connectors
- `components.sales.*` - Sales script generator
- `components.leadQualifier.*` - Lead scoring
- `components.notifications.*` - Notification preferences
- `hooks.network.*` - Network status toasts
- `hooks.autopilot.*` - Autopilot toasts

## Technical Approach

For each file:
1. Add `import { useTranslation } from "react-i18next"` if missing
2. Add `const { t } = useTranslation()` or add `t` to existing destructuring
3. Replace every hardcoded French string with `t("namespace.key")`
4. Add corresponding keys to `en.ts` and `fr.ts`

For hooks (non-component files):
- Use inline `i18next.t()` import from `i18next` directly since hooks don't have access to the React hook version at the module level

## Estimated Impact

- **~32 files modified** + `en.ts` + `fr.ts` = 34 files total
- **~300 new i18n keys** added
- **Zero hardcoded French strings remaining** in UI-facing code after this round (except agent persona data which is intentionally French)

## Execution Strategy

Due to the high volume, this will be split into 3 sub-batches:
- **Sub-batch A**: Tier 1 dashboard pages (10 files)
- **Sub-batch B**: Tier 2 components (20 files)
- **Sub-batch C**: Tier 3 hooks + en.ts/fr.ts key additions

