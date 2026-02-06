

# Audit UX Complet - Round 8 (Pages Dashboard & Composants restants)

## Resume

Apres les rounds 5-7 (cockpit localise), il reste **~20 fichiers** avec des textes hardcodes en francais et des `locale: fr` / `"fr-FR"` statiques. Ces fichiers couvrent les pages dashboard principales et les composants d'integration, impactant l'experience utilisateur dans toutes les langues sauf le francais.

---

## Problemes Identifies

### Categorie A : Composants avec `locale: fr` statique (pas de dateLocaleMap)

| # | Fichier | Occurrences | Textes FR hardcodes |
|---|---------|-------------|---------------------|
| 1 | `src/components/team/TeamActivityFeed.tsx` | 1x `locale: fr` | "Agent IA", "Systeme" |
| 2 | `src/components/activity/ActivityFeed.tsx` | 1x `locale: fr` | - |
| 3 | `src/components/kpi/KPIDashboard.tsx` | 2x `locale: fr` | "Derniere sync:", "Jamais", "Jamais synchronise" |
| 4 | `src/components/agents/DepartmentHeadDashboard.tsx` | 1x `locale: fr` | Textes divers |
| 5 | `src/components/agents/AgentDetail.tsx` | 1x `locale: fr` | "Jamais" |
| 6 | `src/components/ads/CampaignBudgetTracker.tsx` | 1x `locale: fr` | "Jour X/Y" |
| 7 | `src/components/content/ContentCalendar.tsx` | 2x `locale: fr` | - |

### Categorie B : Composants avec `"fr-FR"` hardcode

| # | Fichier | Occurrences |
|---|---------|-------------|
| 8 | `src/components/integrations/MetaMetricsWidget.tsx` | 2x `"fr-FR"` | "Derniere sync:", "Jamais", "Connecter Instagram" |
| 9 | `src/components/integrations/GA4MetricsWidget.tsx` | 2x `"fr-FR"` | "Derniere sync:", "Jamais", "Connecter Google Analytics" |
| 10 | `src/components/integrations/GSCMetricsWidget.tsx` | 2x `"fr-FR"` | "Derniere sync:", "Jamais", "Connecter Search Console" |
| 11 | `src/components/integrations/MetaModuleCard.tsx` | 1x `"fr-FR"` | "il y a Xh" |

### Categorie C : Composants partiellement i18n (ternaire FR/EN seulement pour 2 langues)

| # | Fichier | Probleme |
|---|---------|----------|
| 12 | `src/components/billing/BillingOverview.tsx` | `i18n.language === "fr" ? fr : enUS` (manque ES/DE/IT/PT/NL) |
| 13 | `src/components/notifications/NotificationCenter.tsx` | idem |
| 14 | `src/components/cockpit/DailyBriefing.tsx` | ternaire FR/EN pour toast + `toLocaleTimeString` |

### Categorie D : Pages dashboard 100% francais

| # | Fichier | Nb textes FR |
|---|---------|-------------|
| 15 | `src/pages/dashboard/Agents.tsx` | ~20 | "Activite recente des agents", "Aucune execution recente", etc. |
| 16 | `src/pages/dashboard/Automations.tsx` | ~15 | "Aucune automation", "Derniere:", etc. |
| 17 | `src/pages/dashboard/SEOTech.tsx` | ~12 | "Derniere analyse:", "Aucun probleme", "Aucun audit" |
| 18 | `src/pages/dashboard/AuditLog.tsx` | ~8 | Dates avec `locale: fr` |
| 19 | `src/pages/dashboard/AccessReview.tsx` | ~10 | "Aucune revue", "Jamais", dates |
| 20 | `src/pages/dashboard/ConnectionStatus.tsx` | ~5 | "Derniere sync:" |
| 21 | `src/pages/dashboard/HR.tsx` | ~8 | Dates, "Employe", "Periode:" |
| 22 | `src/pages/dashboard/Logs.tsx` | dates FR |
| 23 | `src/components/integrations/IntegrationConnector.tsx` | "Connecter", "Deconnecter" |
| 24 | `src/components/integrations/SyncLogsViewer.tsx` | "Aucun evenement" |
| 25 | `src/components/integrations/GoogleSuperConnector.tsx` | "Aucun workspace actif" |
| 26 | `src/components/integrations/MetaSuperConnector.tsx` | "Aucun workspace actif" |

---

## Plan d'Implementation

### Phase 1 : Creer un helper dateLocaleMap partage

Creer `src/lib/date-locale.ts` avec un helper reutilisable pour le mapping des locales date-fns, evitant la duplication dans chaque composant.

```text
// src/lib/date-locale.ts
import { fr, enUS, es, de, it, pt, nl } from "date-fns/locale";
export const dateLocaleMap = { fr, en: enUS, es, de, it, pt, nl };
export const getDateLocale = (lang: string) => dateLocaleMap[lang] || enUS;
export const getIntlLocale = (lang: string) => { fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', nl: 'nl-NL' }[lang] || 'en-US';
```

### Phase 2 : Ajouter ~60 nouvelles cles i18n (en.ts et fr.ts)

Namespace `integrations`, `agents`, `automations`, `seo`, `audit`, `hr`, `team`.

### Phase 3 : Corriger les composants (Categories A-D)

Pour chaque fichier :
1. Importer `getDateLocale` / `getIntlLocale` depuis le helper
2. Remplacer `locale: fr` par `locale: getDateLocale(i18n.language)`
3. Remplacer `"fr-FR"` par `getIntlLocale(i18n.language)`
4. Remplacer les textes FR hardcodes par `t("key")`

### Fichiers a modifier (26 fichiers)

| Fichier | Action principale | Priorite |
|---------|-------------------|----------|
| `src/lib/date-locale.ts` | NOUVEAU - Helper partage | P0 |
| `src/i18n/locales/en.ts` | ~60 cles | P0 |
| `src/i18n/locales/fr.ts` | ~60 cles | P0 |
| `src/components/team/TeamActivityFeed.tsx` | locale + textes | P0 |
| `src/components/activity/ActivityFeed.tsx` | locale | P0 |
| `src/components/kpi/KPIDashboard.tsx` | locale + textes | P0 |
| `src/components/agents/DepartmentHeadDashboard.tsx` | locale | P1 |
| `src/components/agents/AgentDetail.tsx` | locale + "Jamais" | P1 |
| `src/components/ads/CampaignBudgetTracker.tsx` | locale | P1 |
| `src/components/content/ContentCalendar.tsx` | locale | P1 |
| `src/components/integrations/MetaMetricsWidget.tsx` | fr-FR + textes | P0 |
| `src/components/integrations/GA4MetricsWidget.tsx` | fr-FR + textes | P0 |
| `src/components/integrations/GSCMetricsWidget.tsx` | fr-FR + textes | P0 |
| `src/components/integrations/MetaModuleCard.tsx` | fr-FR + textes | P1 |
| `src/components/integrations/IntegrationConnector.tsx` | textes | P1 |
| `src/components/integrations/SyncLogsViewer.tsx` | textes | P1 |
| `src/components/integrations/GoogleSuperConnector.tsx` | textes | P1 |
| `src/components/integrations/MetaSuperConnector.tsx` | textes | P1 |
| `src/components/billing/BillingOverview.tsx` | dateLocaleMap 7 langues | P1 |
| `src/components/notifications/NotificationCenter.tsx` | dateLocaleMap 7 langues | P1 |
| `src/components/cockpit/DailyBriefing.tsx` | ternaire -> t() | P1 |
| `src/pages/dashboard/Agents.tsx` | locale + textes | P0 |
| `src/pages/dashboard/Automations.tsx` | locale + textes | P1 |
| `src/pages/dashboard/SEOTech.tsx` | locale + textes | P1 |
| `src/pages/dashboard/AuditLog.tsx` | locale | P1 |
| `src/pages/dashboard/AccessReview.tsx` | locale + textes | P1 |
| `src/pages/dashboard/ConnectionStatus.tsx` | locale + textes | P1 |
| `src/pages/dashboard/HR.tsx` | locale + textes | P1 |

---

## Details techniques

### Helper partage `getDateLocale`
Cela elimine la duplication de `dateLocaleMap` dans chaque composant (actuellement copie dans ~8 fichiers) et centralise la logique.

### Pattern de correction uniforme
```text
// Avant
import { fr } from "date-fns/locale";
formatDistanceToNow(date, { locale: fr, addSuffix: true })

// Apres
import { getDateLocale } from "@/lib/date-locale";
formatDistanceToNow(date, { locale: getDateLocale(i18n.language), addSuffix: true })
```

### Ternaire dateLocale existant a etendre
Les fichiers qui utilisent `i18n.language === "fr" ? fr : enUS` seront migres vers `getDateLocale(i18n.language)` pour supporter les 7 langues.

## Resume
- 26 fichiers a modifier + 1 nouveau helper
- ~60 nouvelles cles de traduction
- Centralisation du dateLocaleMap
- Elimination de tous les `locale: fr` et `"fr-FR"` hardcodes restants
- Support complet des 7 langues dans toutes les pages dashboard

