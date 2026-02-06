

# Audit Multi-Roles Round 14 - Corrections Restantes

## Constats

Apres les rounds 12 et 13 (Batches 1-4), il reste encore des dettes techniques significatives dans 3 categories :

### 1. Dates/nombres hardcodes `'fr'`/`'fr-FR'` (55 occurrences dans 7 fichiers)

Les fichiers suivants n'ont pas ete migres vers `getIntlLocale(i18n.language)` :

| Fichier | Occurrences | Type |
|---------|------------|------|
| `src/components/cockpit/DailyBriefing.tsx` | 1 | `toLocaleDateString('fr-FR')` |
| `src/pages/dashboard/Agency.tsx` | 1 | `toLocaleDateString('fr')` |
| `src/components/team/TeamManagement.tsx` | 2 | `toLocaleDateString('fr')` |
| `src/components/reports/ReportScheduler.tsx` | 1 | `toLocaleDateString('fr-FR')` |
| `src/components/sales/SalesScriptGenerator.tsx` | 3 | `toLocaleDateString('fr-FR')` + `toLocaleString('fr-FR')` |
| `src/components/competitors/CompetitorAlerts.tsx` | 1 | `toLocaleDateString('fr')` |
| `src/components/webhooks/AdvancedWebhooks.tsx` | 1 | `toLocaleString('fr-FR')` |
| `src/components/evidence/EvidenceBundleCard.tsx` | 2 | `toLocaleString('fr-FR')` |
| `src/components/diagnostics/ConsoleLogsViewer.tsx` | 1 | `toLocaleTimeString('fr-FR')` |
| `src/components/diagnostics/SystemHealthDashboard.tsx` | 1 | `toLocaleTimeString('fr-FR')` |
| `src/components/diagnostics/DiagnosticsPanel.tsx` | 1 | `toLocaleTimeString('fr-FR')` |
| `src/components/kpi/KPITrendCard.tsx` | 2 | `Intl.NumberFormat('fr-FR')` + `toLocaleString('fr-FR')` |
| `src/components/dashboard/KPISparkline.tsx` | 1 | `toLocaleString('fr-FR')` |
| `src/components/dashboard/GoalsProgress.tsx` | 2 | `toLocaleString('fr-FR')` |
| `src/lib/agents/report-generator.ts` | 3 | `toLocaleDateString('fr-FR')` (backend PDF - on conserve FR) |

### 2. Textes francais hardcodes (~270 dans 29 fichiers components + 10 fichiers pages)

Les pages dashboard non migrees :
- `Agency.tsx` (~25 strings)
- `Lifecycle.tsx` (~30 strings)
- `CRO.tsx` (~20 strings)
- `Integrations.tsx` (~20 strings)
- `ApprovalsV2.tsx` (~15 strings restantes)
- `Approvals.tsx` (~10 strings restantes)
- `AccessReview.tsx` (~10 strings)
- `MediaAssets.tsx` (~5 strings)
- `Sites.tsx` (verifier)
- `ConnectionStatus.tsx` (verifier)

Les composants non migres :
- `TeamManagement.tsx` (~15 strings)
- `ContentStrategyGenerator.tsx` (~8 strings)
- `SocialPostGenerator.tsx` (~8 strings)
- `AdsOptimizer.tsx` (~8 strings)
- `LeadQualifier.tsx` (~10 strings)
- `VoiceAssistant.tsx` (~4 strings)
- `SmartResearchHub.tsx` (~4 strings)
- `RepurposeEngine.tsx` (~4 strings)
- `AlertRulesConfig.tsx` (~4 strings)
- `AdvancedWebhooks.tsx` (~5 strings)
- `EvidenceBundleCard.tsx` / `EvidenceBundleViewer.tsx` (~8 strings)
- `GoogleSuperConnector.tsx` / `MetaSuperConnector.tsx` (~6 strings)
- `BulkSiteImport.tsx` (~5 strings)
- `DataExportButton.tsx` (~4 strings)
- `NotificationPreferences.tsx` (~10 strings)
- `ProtectedRoute.tsx` (1 string)
- `PaginatedList.tsx` (2 strings)
- `data-table-pagination.tsx` (1 string)

### 3. Imports doublons (4 fichiers)

| Fichier | Probleme |
|---------|----------|
| `Lifecycle.tsx` | `useState` et `useCallback` sur 2 lignes separees |
| `Sites.tsx` | `useState` et `useCallback` sur 2 lignes separees |
| `CRO.tsx` | `useState` et `useCallback` sur 2 lignes separees |
| `Diagnostics.tsx` | `useState, useEffect` et `useCallback` sur 2 lignes separees |

### 4. Roadmap.tsx - anti-pattern `isEn ?`

`Roadmap.tsx` utilise encore `isEn ?` pour les tags (36 occurrences). Doit etre migre vers `t()`.

## Plan de Corrections

Le volume est trop important pour un seul message (~40 fichiers). Je propose de traiter en 2 groupes prioritaires :

### Groupe 1 (ce message) - Dates + imports + Roadmap (~18 fichiers)

1. **Corriger toutes les dates/nombres hardcodes** dans les 14 fichiers frontend (exclure `report-generator.ts` qui genere du PDF serveur)
2. **Fusionner les imports doublons** dans 4 fichiers
3. **Migrer Roadmap.tsx** vers `t()` pour les tags

Pour chaque fichier date :
- Ajouter `import { getIntlLocale } from "@/lib/date-locale"` si absent
- Ajouter `useTranslation` si absent
- Remplacer `'fr'` / `'fr-FR'` par `getIntlLocale(i18n.language)`

### Groupe 2 (message suivant) - Textes hardcodes (~25 fichiers)

Migrer les ~270 strings francaises restantes dans les pages et composants listes ci-dessus.

## Details Techniques - Groupe 1

### Fichiers a modifier :

1. `src/components/cockpit/DailyBriefing.tsx` - ajouter `getIntlLocale`, remplacer ligne 128
2. `src/pages/dashboard/Agency.tsx` - ajouter `useTranslation` + `getIntlLocale`, remplacer ligne 235
3. `src/components/team/TeamManagement.tsx` - ajouter `useTranslation` + `getIntlLocale`, remplacer lignes 188, 255
4. `src/components/reports/ReportScheduler.tsx` - ajouter `getIntlLocale`, remplacer ligne 91
5. `src/components/sales/SalesScriptGenerator.tsx` - ajouter `getIntlLocale`, remplacer lignes 156, 271, 341
6. `src/components/competitors/CompetitorAlerts.tsx` - ajouter `getIntlLocale`, remplacer ligne 186
7. `src/components/webhooks/AdvancedWebhooks.tsx` - ajouter `getIntlLocale`, remplacer ligne 527
8. `src/components/evidence/EvidenceBundleCard.tsx` - ajouter `getIntlLocale`, remplacer lignes 102, 295
9. `src/components/diagnostics/ConsoleLogsViewer.tsx` - ajouter `getIntlLocale`, remplacer ligne 154
10. `src/components/diagnostics/SystemHealthDashboard.tsx` - ajouter `getIntlLocale`, remplacer ligne 244
11. `src/components/diagnostics/DiagnosticsPanel.tsx` - ajouter `getIntlLocale`, remplacer ligne 385
12. `src/components/kpi/KPITrendCard.tsx` - ajouter `useTranslation` + `getIntlLocale`, remplacer lignes 55, 59
13. `src/components/dashboard/KPISparkline.tsx` - ajouter `useTranslation` + `getIntlLocale`, remplacer ligne 56
14. `src/components/dashboard/GoalsProgress.tsx` - ajouter `useTranslation` + `getIntlLocale`, remplacer ligne 143

### Imports doublons :
15. `src/pages/dashboard/Lifecycle.tsx` - fusionner lignes 1-2
16. `src/pages/dashboard/Sites.tsx` - fusionner lignes 1-2
17. `src/pages/dashboard/CRO.tsx` - fusionner lignes 1-2
18. `src/pages/dashboard/Diagnostics.tsx` - fusionner lignes 1-2

### Roadmap :
19. `src/pages/Roadmap.tsx` - migrer tags `isEn ?` vers des cles i18n `pages.roadmap.tags.*`

### Nouvelles cles i18n a ajouter :
- `pages.roadmap.tags.product` / `pages.roadmap.tags.integration` / `pages.roadmap.tags.security` / `pages.roadmap.tags.ai` dans `en.ts` et `fr.ts`

**Total Groupe 1 : 19 fichiers + en.ts + fr.ts = 21 fichiers**

