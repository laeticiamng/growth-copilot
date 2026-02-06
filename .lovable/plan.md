
# Audit Complet 3 Phases : Technique, UX, Utilisateur Final

## Etat des lieux

Apres analyse approfondie de l'ensemble du code (App.tsx, Auth.tsx, DashboardLayout, 40+ pages dashboard, composants landing, hooks, edge functions), voici les constats regroupes en 3 phases.

---

## Phase 1 : Audit Technique (Dev Senior)

### 1.1 Anti-pattern `isEn ? "..." : "..."` massif (CRITIQUE - 16 fichiers, 646 occurrences)

Ce pattern ne supporte que 2 langues sur les 7 configurees (FR, EN, ES, DE, IT, PT, NL). Il doit etre remplace par `t("key")`.

**Fichiers concernes :**

| Fichier | Occurrences |
|---------|------------|
| `src/pages/Auth.tsx` | ~62 (tout le bloc `txt = {}`) |
| `src/components/landing/Pricing.tsx` | ~40 |
| `src/components/landing/Hero.tsx` | ~20 |
| `src/components/landing/Features.tsx` | ~30 |
| `src/components/landing/Services.tsx` | ~15 |
| `src/components/landing/HowItWorks.tsx` | ~15 |
| `src/components/landing/Testimonials.tsx` | ~15 |
| `src/components/landing/FAQ.tsx` | ~30 |
| `src/components/landing/CTA.tsx` | ~10 |
| `src/components/landing/Footer.tsx` | ~20 |
| `src/components/landing/Tools.tsx` | ~10 |
| `src/components/landing/TrustBar.tsx` | ~5 |
| `src/components/landing/TeamOrgChart.tsx` | ~20 |
| `src/components/landing/Navbar.tsx` | ~10 |
| `src/pages/Index.tsx` | ~10 (SEO meta) |
| `src/pages/Roadmap.tsx` | a verifier |

**Action :** Migrer toutes ces occurrences vers `t("landing.xxx")` avec ajout des cles correspondantes dans `en.ts` et `fr.ts`.

### 1.2 `locale: fr` statique restant (8 fichiers)

Malgre Round 8, ces fichiers utilisent encore `import { fr } from "date-fns/locale"` et `locale: fr` au lieu de `getDateLocale(i18n.language)` :

| Fichier | Occurrences |
|---------|------------|
| `src/pages/dashboard/Automations.tsx` | 1x (ligne 180) |
| `src/pages/dashboard/SEOTech.tsx` | 2x (lignes 363, 638) |
| `src/pages/dashboard/AuditLog.tsx` | 3x (lignes 373, 426, 558) |
| `src/pages/dashboard/AccessReview.tsx` | 5x (lignes 123, 128, 261, 302, 347) |
| `src/pages/dashboard/ConnectionStatus.tsx` | 1x (ligne 225) |
| `src/pages/dashboard/HR.tsx` | 1x (ligne 447+) |
| `src/pages/dashboard/Logs.tsx` | 3x (lignes 405, 561, 639) |
| `src/pages/dashboard/Ops.tsx` | 1x (ligne 259) |

**Action :** Remplacer `import { fr } from "date-fns/locale"` par `import { getDateLocale } from "@/lib/date-locale"` et utiliser `getDateLocale(i18n.language)`.

### 1.3 Textes francais hardcodes dans pages dashboard (Round 9)

Les fichiers suivants contiennent des textes en francais directement dans le JSX (pas de `t()`) :

- **Automations.tsx** : ~30 textes ("Regles d'automation", "Aucune automation", "Annuler", etc.)
- **SEOTech.tsx** : ~25 textes ("SEO Technique", "Lancer l'audit", "Score SEO", "Facile/Moyen/Complexe", etc.)
- **AuditLog.tsx** : ~20 textes ("Journal d'Audit", "Creation", "Modification", "Suppression", etc.)
- **AccessReview.tsx** : ~15 textes ("Revue des Acces", "Nouvelle revue", "Aucune revue", "Jamais", etc.)
- **ConnectionStatus.tsx** : ~10 textes ("Mes Acces", "Autorise", "Derniere sync", etc.)
- **HR.tsx** : ~40 textes (tout : "Ressources Humaines", status labels, dialog texts, etc.)
- **Logs.tsx** : ~15 textes ("Logs & Activite", "Requetes IA", status labels, etc.)
- **IntegrationConnector.tsx** : ~10 textes ("Connecte", "Deconnecter", etc.)
- **SyncLogsViewer.tsx** : ~10 textes ("Historique de synchronisation", "Aucun evenement", etc.)
- **MetaSuperConnector.tsx** : textes statiques
- **GoogleSuperConnector.tsx** : textes statiques

### 1.4 Double import inutile dans HR.tsx

Ligne 1-2 : `import { useState } from "react"; import { useCallback } from "react";` -- devrait etre un seul import.

### 1.5 ErrorBoundary : email hardcode en francais

`src/components/ErrorBoundary.tsx` lignes 69-77 : le sujet et corps du mail de rapport d'erreur sont en francais hardcode.

---

## Phase 2 : Audit UX (UX Designer Senior)

### 2.1 Auth.tsx : Experience d'inscription incomplete

L'inscription capture `fullName` et `companyName` via `localStorage.setItem("signup_data", ...)` mais ces donnees ne sont jamais utilisees dans le processus de creation de workspace/profil. L'utilisateur remplit ces champs pour rien.

### 2.2 Sidebar navigation trop dense

Le DashboardLayout contient **8 departements** collapsibles avec **40+ items**. Sur mobile, la navigation devient difficile. La hierarchie par departements est riche mais peut submerger un nouvel utilisateur.

### 2.3 Pas de LanguageToggle sur mobile

Le `LanguageToggle` est uniquement dans le header desktop (`hidden lg:flex`, ligne 519). Sur mobile, aucun moyen de changer la langue.

### 2.4 Absence de breadcrumbs

Aucun breadcrumb dans les pages dashboard. L'utilisateur perd le contexte de ou il se trouve dans la hierarchie.

### 2.5 Landing page : ancres de navigation non testees

Les liens `#features`, `#services`, `#pricing` dans la navbar et footer dependent du scroll anchor qui peut ne pas fonctionner si les sections n'ont pas les bons `id`.

### 2.6 Empty states inconsistants

Certains modules utilisent `ModuleEmptyState`, d'autres des textes bruts, d'autres `<p>Aucun...</p>`. Le pattern n'est pas uniforme.

---

## Phase 3 : Audit Utilisateur Final (Beta Testeur)

### 3.1 Premiere connexion : aucun onboarding contextuel

Apres inscription et connexion, l'utilisateur arrive sur le dashboard avec un cockpit potentiellement vide (pas de site, pas de donnees). Le composant `EmptyStateGuide` existe mais n'est pas toujours visible.

### 3.2 Boutons d'action sans feedback visuel suffisant

Les "Quick Launchers" sur le cockpit peuvent prendre du temps (appel edge function). Le loading state est gere mais pas toujours visible.

### 3.3 Pages en francais malgre le choix EN

Si un utilisateur choisit l'anglais, les pages Automations, SEOTech, AuditLog, HR, AccessReview, Logs restent en francais (cf. Phase 1 points 1.2 et 1.3).

### 3.4 Messages d'erreur techniques

Les toasts d'erreur affichent parfois des messages techniques (`error.message`) au lieu de messages user-friendly.

### 3.5 Liens morts potentiels dans la navigation

- `/dashboard/service-catalog` (route definie) vs `/dashboard/services` (route definie) -- possible confusion
- `/dashboard/media-kpis` dans le sidebar ne correspond a aucune route definie (route est `/dashboard/media/kpis`)

---

## Plan d'Implementation

### Batch 1 : Corrections techniques critiques (Phase 1.2 + 1.3 + 1.4)

**8 fichiers dashboard** : Remplacer `locale: fr` par `getDateLocale(i18n.language)` et ajouter `useTranslation()`.

| Fichier | Action |
|---------|--------|
| `src/pages/dashboard/Automations.tsx` | locale + ~30 textes -> `t()` |
| `src/pages/dashboard/SEOTech.tsx` | locale + ~25 textes -> `t()` |
| `src/pages/dashboard/AuditLog.tsx` | locale + ~20 textes -> `t()` |
| `src/pages/dashboard/AccessReview.tsx` | locale + ~15 textes -> `t()` |
| `src/pages/dashboard/ConnectionStatus.tsx` | locale + ~10 textes -> `t()` |
| `src/pages/dashboard/HR.tsx` | fix imports + locale + ~40 textes -> `t()` |
| `src/pages/dashboard/Logs.tsx` | locale + ~15 textes -> `t()` |
| `src/pages/dashboard/Ops.tsx` | locale |
| `src/components/integrations/IntegrationConnector.tsx` | ~10 textes -> `t()` |
| `src/components/integrations/SyncLogsViewer.tsx` | ~10 textes -> `t()` |
| `src/i18n/locales/en.ts` | ~200 nouvelles cles |
| `src/i18n/locales/fr.ts` | ~200 nouvelles cles |

### Batch 2 : Corrections UX (Phase 2.3 + 2.5)

| Fichier | Action |
|---------|--------|
| `src/components/layout/DashboardLayout.tsx` | Ajouter LanguageToggle dans le header mobile (ligne 352) |
| `src/pages/dashboard/Agents.tsx` | Verifier route `/dashboard/media-kpis` |

### Batch 3 : Auth.tsx migration i18n (Phase 1.1 partiel)

| Fichier | Action |
|---------|--------|
| `src/pages/Auth.tsx` | Remplacer le bloc `txt = { isEn ? ... }` par `t("auth.xxx")` |
| `src/components/ErrorBoundary.tsx` | Localiser les textes de l'email de rapport |

**Note :** La migration des 10 composants landing (Pricing, Hero, Features, etc.) est exclue de ce batch car ils represented ~300 occurrences et necessitent un round dedie. Elle sera traitee dans un futur Round 10.

---

## Resume

| Phase | Fichiers | Problemes | Priorite |
|-------|----------|-----------|----------|
| Phase 1 (Tech) | 20+ fichiers | `locale: fr` statique, textes FR hardcodes, anti-pattern isEn | P0 |
| Phase 2 (UX) | 2 fichiers | LanguageToggle mobile manquant | P1 |
| Phase 3 (Beta) | Couvert par Phase 1 | Pages FR malgre choix EN | P0 |

**Total :** ~14 fichiers a modifier dans ce batch, ~200 nouvelles cles i18n, elimination des derniers `locale: fr` hardcodes dans toutes les pages dashboard.
