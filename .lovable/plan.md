
# Audit Multi-Roles Round 12 - Corrections P4 + Dates Localisees

## Constats par role

### CEO - Audit Strategique
- **Liens sidebar** : Corriges dans le round precedent (P0 valide).
- **Cockpit** : DashboardHome utilise `useTranslation()` correctement. Architecture solide.
- **Onboarding** : Toujours 238 occurrences `isEn ?` dans `Onboarding.tsx` malgre les cles i18n `onboarding.*` ajoutees en round precedent. Le fichier n'a pas ete migre.

### CTO - Audit Technique
1. **`isEn` anti-pattern persistant** : `Onboarding.tsx` contient encore `const isEn = i18n.language === "en"` avec ~120 ternaires (lignes 62-140+). Les cles `onboarding.*` existent dans en.ts/fr.ts mais ne sont pas utilisees dans le fichier.
2. **`toLocaleDateString('fr')` / `('fr-FR')` hardcodes** : 125 occurrences dans 17 fichiers. Le helper `getIntlLocale()` existe dans `src/lib/date-locale.ts` mais n'est pas utilise dans ces fichiers.
3. **`window.prompt` non localise** : `Approvals.tsx` ligne 42 utilise `window.prompt("Raison du refus :")` en francais hardcode. `PriorityActionsEnhanced.tsx` l'a correctement migre vers `t("cockpit.rejectionPrompt")`.
4. **Doubles imports** : `Ads.tsx` ligne 2, `Social.tsx` ligne 2, `Reputation.tsx` ligne 2, `Competitors.tsx` (pas de doublon mais `useCallback` importe sans etre utilise dans certains cas).
5. **Textes francais hardcodes restants** : ~290 textes dans 16 fichiers dashboard (Offers, Ads, Social, Reputation, Competitors, LocalSEO, Reports, TemplateAdsFactory, BrandKit, ApprovalsV2, Approvals, CMS, Legal, Diagnostics).

### CPO - Audit Produit
- **Incoherence linguistique** : Un utilisateur EN verra "Chargement des offres...", "Campagne creee", "Erreur lors de la creation" etc. dans les toasts et labels de 16 pages dashboard.
- **Dates hardcodees** : Toutes les dates sont formatees en francais meme si l'utilisateur est en allemand, espagnol, etc.

### CISO - Audit Securite
- **`window.prompt`** : Utilise pour saisir la raison de refus dans Approvals.tsx. Pas un risque de securite direct mais ne devrait pas contenir du texte hardcode.
- Pas de nouvelle vulnerabilite identifiee. RLS et RBAC restent solides.

### DPO - Audit RGPD
- Pas de nouveau probleme identifie. Export GDPR et anonymisation fonctionnels.

### CDO - Audit Data
- **Dates non localisees** : `formatMonth()` dans Reports.tsx utilise `'fr-FR'` hardcode. Les donnees temporelles sont toujours formatees en francais.
- `AICostDashboard.tsx` utilise `Intl.NumberFormat('fr-FR')` hardcode pour le formatage des couts.

### COO - Audit Organisationnel
- **Onboarding non migre** : Premier contact utilisateur toujours en `isEn ?` ternaire, degradant l'experience pour 5 langues.

### CFO - Audit Financier
- ROIDashboard et AICostDashboard migres vers `t()` dans le round precedent. OK.

### Head of Design - Audit UX
- Coherence linguistique incomplete : les labels et toasts des modules metier restent en francais.

### Beta Testeur
- Je choisis l'allemand, je vais dans Offers : tout est en francais.
- Je vais dans Ads : "Chargement des campagnes..." en francais.
- Les dates sont toutes en format francais.

---

## Plan de Corrections

### Batch 1 : Migrer Onboarding.tsx vers t() (P0)

Le fichier utilise encore `isEn ?` alors que les cles `onboarding.*` existent deja. Action :
- Supprimer `const isEn = i18n.language === "en"` et le bloc `const txt = {...}`
- Remplacer toutes les references `txt.xxx` par `t("onboarding.xxx")`
- Verifier que toutes les cles existent dans en.ts/fr.ts

**Fichier** : `src/pages/Onboarding.tsx`

### Batch 2 : Localiser les dates (P1)

Remplacer toutes les occurrences de `toLocaleDateString('fr')`, `toLocaleDateString('fr-FR')`, `toLocaleString('fr-FR')`, `toLocaleTimeString('fr-FR')`, et `Intl.NumberFormat('fr-FR')` par des versions utilisant `getIntlLocale(i18n.language)` du helper centralise.

**Fichiers concernes (17 fichiers)** :
| Fichier | Occurrences |
|---------|-------------|
| `src/pages/dashboard/Approvals.tsx` | 2 dates + 1 window.prompt |
| `src/pages/dashboard/ApprovalsV2.tsx` | 2 dates |
| `src/pages/dashboard/Ads.tsx` | 1 date + 1 import doublon |
| `src/pages/dashboard/Social.tsx` | 1 date + 1 import doublon |
| `src/pages/dashboard/Reputation.tsx` | 1 date + 1 import doublon |
| `src/pages/dashboard/Competitors.tsx` | 2 dates |
| `src/pages/dashboard/LocalSEO.tsx` | 1 date |
| `src/pages/dashboard/Reports.tsx` | 3 dates |
| `src/pages/dashboard/Legal.tsx` | 2 dates |
| `src/pages/dashboard/CMS.tsx` | 2 dates |
| `src/pages/dashboard/TemplateAdsFactory.tsx` | 1 date |
| `src/pages/dashboard/AICostDashboard.tsx` | 1 Intl.NumberFormat |
| `src/components/diagnostics/LatencyHistoryChart.tsx` | 2 dates |
| `src/components/diagnostics/DiagnosticsPanel.tsx` | 1 date |
| `src/components/evidence/EvidenceBundleCard.tsx` | 2 dates |
| `src/components/cockpit/DailyBriefing.tsx` | 1 date |
| `src/components/reports/ReportScheduler.tsx` | 1 date |
| `src/components/sales/SalesScriptGenerator.tsx` | 3 dates |
| `src/components/webhooks/AdvancedWebhooks.tsx` | 1 date |
| `src/components/competitors/CompetitorAlerts.tsx` | dates |

Pour chaque fichier :
1. Ajouter `import { useTranslation } from "react-i18next"` (si absent)
2. Ajouter `import { getIntlLocale } from "@/lib/date-locale"` 
3. Remplacer `'fr'` / `'fr-FR'` par `getIntlLocale(i18n.language)`

### Batch 3 : Migrer les toasts et labels hardcodes (P2)

Ajouter ~150 cles i18n pour les textes francais restants dans les 16 fichiers dashboard. Organiser par module :

| Module | Fichier | Textes a migrer |
|--------|---------|-----------------|
| Offers | `Offers.tsx` | ~25 (labels, toasts, dialogs) |
| Ads | `Ads.tsx` | ~20 (metrics, toasts, table headers) |
| Social | `Social.tsx` | ~20 (labels, toasts, exports) |
| Reputation | `Reputation.tsx` | ~15 (labels, dialogs) |
| Competitors | `Competitors.tsx` | ~15 (labels, SWOT) |
| LocalSEO | `LocalSEO.tsx` | ~15 (labels, metrics) |
| Reports | `Reports.tsx` | ~15 (tabs, labels, toasts) |
| Approvals | `Approvals.tsx` | ~10 (tabs, labels, window.prompt) |
| ApprovalsV2 | `ApprovalsV2.tsx` | ~10 (tabs, labels) |
| BrandKit | `BrandKit.tsx` | ~10 (labels, save) |
| TemplateAdsFactory | `TemplateAdsFactory.tsx` | ~10 (labels, statuses) |
| Diagnostics | `Diagnostics.tsx` | ~5 (labels) |

### Batch 4 : Nettoyage imports doublons (P3)

| Fichier | Action |
|---------|--------|
| `src/pages/dashboard/Ads.tsx` | Fusionner `import { useState } from "react"` et `import { useCallback } from "react"` |
| `src/pages/dashboard/Social.tsx` | Idem |
| `src/pages/dashboard/Reputation.tsx` | Idem |

---

## Resume

- **1 fichier majeur** avec anti-pattern `isEn ?` restant : `Onboarding.tsx` (238 occurrences)
- **~125 dates hardcodees** en `'fr'`/`'fr-FR'` dans 20 fichiers
- **~150 textes francais hardcodes** dans 16 fichiers dashboard
- **3 imports doublons** a fusionner
- **1 `window.prompt`** non localise

**Total : ~25 fichiers a modifier, ~150 nouvelles cles i18n.**
