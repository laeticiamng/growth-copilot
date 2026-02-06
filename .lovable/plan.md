
# Audit Complet Round 10 - Landing Pages & Pages Publiques

## Etat des lieux

Les rounds 5-9 ont corrige le cockpit, le dashboard et Auth.tsx. Il reste **18 fichiers** avec l'anti-pattern `isEn ? "..." : "..."` (572 occurrences), principalement dans les **landing pages** et les **pages publiques** (About, Contact, Roadmap, MediaAssets). Ce sont les seuls fichiers restants avec des textes non localises via `t()`.

Les `locale: fr` et `"fr-FR"` hardcodes sont entierement elimines du projet (confirme par la recherche).

---

## Phase 1 : Audit Technique (Dev Senior)

### 1.1 Anti-pattern `isEn ? "..." : "..."` restant (572 occurrences, 18 fichiers)

Ce pattern ne supporte que FR et EN sur les 7 langues configurees.

| Fichier | Occurrences approx. | Complexite |
|---------|---------------------|------------|
| `src/components/landing/Pricing.tsx` | ~80 | Haute (plans, features, CTA) |
| `src/components/landing/Hero.tsx` | ~30 | Moyenne |
| `src/components/landing/Features.tsx` | ~40 | Haute (listes de features) |
| `src/components/landing/Services.tsx` | ~25 | Moyenne |
| `src/components/landing/HowItWorks.tsx` | ~20 | Moyenne (arrays FR/EN) |
| `src/components/landing/Testimonials.tsx` | ~20 | Moyenne |
| `src/components/landing/FAQ.tsx` | ~30 | Haute (arrays FR/EN) |
| `src/components/landing/CTA.tsx` | ~15 | Faible |
| `src/components/landing/Footer.tsx` | ~25 | Moyenne |
| `src/components/landing/Tools.tsx` | ~15 | Moyenne (arrays FR/EN) |
| `src/components/landing/TrustBar.tsx` | ~5 | Faible |
| `src/components/landing/TeamOrgChart.tsx` | ~30 | Haute (dept arrays) |
| `src/components/landing/Navbar.tsx` | ~10 | Faible |
| `src/pages/Index.tsx` | ~15 | Moyenne (SEO meta) |
| `src/pages/About.tsx` | ~40 | Haute (long copy) |
| `src/pages/Contact.tsx` | ~50 | Haute (form + labels) |
| `src/pages/Roadmap.tsx` | ~30 | Moyenne (status labels + items) |
| `src/pages/dashboard/MediaAssets.tsx` | ~50 | Haute (full labels block) |

### 1.2 Auth.tsx : `isEn` declare mais inutilise

Ligne 18 : `const isEn = i18n.language === "en"` est toujours declare mais `txt` utilise maintenant `t()`. Variable morte a supprimer.

### 1.3 HR.tsx : date locale avec ternaire inline

Ligne 448 : utilise un ternaire inline `i18n.language === 'fr' ? 'fr-FR' : ...` au lieu de `getIntlLocale(i18n.language)` du helper centralise.

---

## Phase 2 : Audit UX (UX Designer Senior)

### 2.1 Landing pages inaccessibles en 5 langues

Un utilisateur qui choisit ES, DE, IT, PT ou NL verra un mix FR/EN sur toute la landing page, ce qui nuit a la credibilite du produit.

### 2.2 Contact page : formulaire non localise

Les labels "Nom", "Sujet", les options du select et les messages de succes/erreur sont en ternaire FR/EN, bloquant l'experience pour les autres langues.

### 2.3 Roadmap : contenu statique non localise

Les status labels et tags utilisent `isEn ?`, rendant la page partiellement traduite pour les autres langues.

---

## Phase 3 : Audit Utilisateur Final (Beta Testeur)

### 3.1 Incoherence linguistique entre dashboard et landing

Un utilisateur qui navigue du dashboard (maintenant 100% localise) vers la landing page (via logo ou liens) voit un changement de langue brutal.

### 3.2 SEO meta-donnees en ternaire

Les balises Open Graph et structured data dans `Index.tsx` utilisent `isEn ?`, ce qui peut affecter le referencement dans les autres langues.

---

## Plan d'Implementation

### Batch 1 : Ajouter ~400 cles i18n pour landing + pages publiques

Ajouter les namespaces `landing` et `pages` dans `en.ts` et `fr.ts` couvrant :
- Hero, Features, Services, HowItWorks, Pricing, FAQ, CTA, Tools, TrustBar, Testimonials, Footer, Navbar, TeamOrgChart
- About, Contact, Roadmap, MediaAssets
- Index (SEO meta)

### Batch 2 : Migrer les 13 composants landing

Pour chaque composant :
1. Remplacer `const isEn = i18n.language === "en"` par `const { t } = useTranslation()`
2. Remplacer chaque `isEn ? "EN text" : "FR text"` par `t("landing.key")`
3. Pour les composants avec des arrays FR/EN separees (FAQ, HowItWorks, Tools), fusionner en un seul array utilisant `t()`

| Fichier | Action |
|---------|--------|
| `src/components/landing/TrustBar.tsx` | 4 labels |
| `src/components/landing/Navbar.tsx` | 2 aria-labels |
| `src/components/landing/CTA.tsx` | ~10 textes |
| `src/components/landing/Hero.tsx` | ~15 textes |
| `src/components/landing/Footer.tsx` | ~20 textes |
| `src/components/landing/Tools.tsx` | Fusionner toolsEn/toolsFr + ~5 labels |
| `src/components/landing/HowItWorks.tsx` | Fusionner stepsEn/stepsFr |
| `src/components/landing/Services.tsx` | ~15 textes |
| `src/components/landing/Testimonials.tsx` | ~15 textes |
| `src/components/landing/Features.tsx` | ~20 textes |
| `src/components/landing/FAQ.tsx` | Fusionner faqsEn/faqsFr |
| `src/components/landing/Pricing.tsx` | ~40 textes (plans, features) |
| `src/components/landing/TeamOrgChart.tsx` | Fusionner DEPARTMENTS_EN/FR |

### Batch 3 : Migrer les 5 pages publiques

| Fichier | Action |
|---------|--------|
| `src/pages/Index.tsx` | SEO meta + structured data |
| `src/pages/About.tsx` | ~25 textes (mission, story, values) |
| `src/pages/Contact.tsx` | ~30 textes (form, labels, toasts) |
| `src/pages/Roadmap.tsx` | Status labels + tags |
| `src/pages/dashboard/MediaAssets.tsx` | labels block complet |

### Batch 4 : Nettoyage

| Fichier | Action |
|---------|--------|
| `src/pages/Auth.tsx` | Supprimer `const isEn` (ligne 18) |
| `src/pages/dashboard/HR.tsx` | Remplacer ternaire locale par `getIntlLocale()` |

---

## Fichiers a modifier : 21 fichiers

| Priorite | Fichiers |
|----------|----------|
| P0 | `src/i18n/locales/en.ts` (~400 cles) |
| P0 | `src/i18n/locales/fr.ts` (~400 cles) |
| P0 | 13 composants landing |
| P0 | 5 pages publiques (Index, About, Contact, Roadmap, MediaAssets) |
| P1 | Auth.tsx (nettoyage isEn), HR.tsx (nettoyage locale) |

## Resume

- 18 fichiers avec anti-pattern `isEn ?` restant (572 occurrences)
- ~400 nouvelles cles de traduction a ajouter
- Elimination complete du dernier anti-pattern i18n du projet
- Support complet des 7 langues sur 100% des pages (landing + dashboard + public)
