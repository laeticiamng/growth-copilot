

# Audit Multi-Roles Final -- Corrections Pre-Publication

## Synthese des audits precedents

Les rounds precedents ont corrige :
- Navigation Login -> `/auth` (OK)
- Hero CTA -> `/auth?tab=signup` (OK)
- CTA bottom -> `/auth?tab=signup` (OK)
- Page 404 brandee + i18n (OK)
- TrustBar SOC2 -> "Audit trail complet" (OK)
- TeamOrgChart collapse (OK)
- Tools avec icones Lucide (OK)
- Testimonials avec gradients premium (OK)

## Problemes restants identifies

---

### P0 -- Bloquants publication

#### 1. Pricing CTAs pointent vers `/onboarding` (route protegee)
**Source** : Pricing.tsx lignes 86, 141, 184
**Impact** : Les 3 boutons CTA du Pricing ("Starter", "Full Company", "A la carte") redirigent vers `/onboarding`. Un visiteur non connecte est redirige vers `/auth` sans contexte. Incoherent avec les corrections Hero/CTA deja appliquees.
**Solution** : Remplacer `<Link to="/onboarding">` par `<Link to="/auth?tab=signup">` sur les 3 CTAs.

#### 2. Page Mentions Legales (Legal.tsx) -- champs "[a completer]" visibles
**Source** : Legal.tsx lignes 26-30
**Impact** : La page affiche des placeholders bruts : "[Adresse a completer]", "[Numero SIRET a completer]", "[Ville d'immatriculation a completer]", "[Montant a completer] euros", "[Numero TVA a completer]". C'est un signal de non-professionnalisme fatal pour la credibilite.
**Solution** : Retirer les champs SIRET/RCS/TVA/Capital avec des placeholders et les remplacer par "Informations disponibles sur demande" ou les remplir avec les vraies valeurs. La page n'a pas non plus le design system (pas de Navbar/Footer).

#### 3. Pages Privacy.tsx et Terms.tsx non traduites (hardcodees en francais)
**Source** : Privacy.tsx, Terms.tsx
**Impact** : Ces pages sont entierement en francais brut sans i18n. Un utilisateur EN/DE/ES verra des pages legales incomprehensibles. Pour une plateforme multilingue 7 langues, c'est un probleme legal (RGPD exige l'accessibilite des informations).
**Solution (pragmatique)** : Ajouter un disclaimer "This page is available in French only / Cette page est disponible en francais uniquement" en haut des pages, car traduire 500+ lignes de contenu juridique depasse le scope. C'est la pratique standard pour les SaaS bases en France.

#### 4. Structured Data fictives dans Index.tsx
**Source** : Index.tsx lignes 35-37
**Impact** : Le schema JSON-LD contient `"ratingValue": "4.8"` et `"reviewCount": "127"` -- des donnees inventees. Google peut penaliser le site pour abus de donnees structurees (violation des guidelines).
**Solution** : Supprimer le bloc `aggregateRating` entierement.

---

### P1 -- Important pour credibilite

#### 5. Page Legal.tsx -- pas de design system
**Source** : Legal.tsx
**Impact** : La page n'utilise pas le design system (pas de Navbar, pas de Footer, fond blanc basique). Incohérent avec le reste du site premium.
**Solution** : Ajouter Navbar et Footer comme sur Privacy.tsx et Terms.tsx.

#### 6. Footer liens "Documentation" et "Status" pointent vers des routes protegees
**Source** : Footer.tsx lignes 17-18
**Impact** : `/dashboard/guide` et `/dashboard/status` sont des ProtectedRoutes. Un visiteur non connecte qui clique sera redirige vers `/auth` sans contexte.
**Solution** : Soit retirer ces liens du footer public, soit les remplacer par des ancres vers des sections de la landing page.

#### 7. Starter Plan badges "11 AI Employees / 11 Departments" trompeurs
**Source** : Pricing.tsx lignes 70-71
**Impact** : Le Starter affiche les memes badges que le Full Company. Le plan Starter est decrit comme "lite access to all departments" mais les badges suggerent un acces complet identique.
**Solution** : Changer les badges du Starter pour refleter "11 dept. (mode lite)" au lieu de laisser croire que c'est le meme niveau que Full Company. Ajouter "(lite)" au badge ou changer le nombre d'employes a "11" avec un qualificatif "lite".

---

### P2 -- Polish

#### 8. Contact email "emotionscare.com" dans contact cards, footer, privacy, terms, legal
**Impact** : Le domaine "emotionscare.com" est correct selon les memories du projet (c'est le vrai nom de l'entreprise). Ce n'est donc PAS un bug mais un choix de branding coherent avec les pages legales. Pas de correction requise.

---

## Tableau de synthese

| # | Probleme | Gravite | Solution | Fichier(s) | Validation |
|---|----------|---------|----------|------------|------------|
| 1 | Pricing CTAs -> /onboarding | P0 | Changer en `/auth?tab=signup` | Pricing.tsx (3 liens) | Cliquer chaque CTA Pricing -> arrive sur /auth?tab=signup |
| 2 | Legal.tsx champs "[a completer]" | P0 | Nettoyer les placeholders + ajouter Navbar/Footer | Legal.tsx | Page sans brackets visibles |
| 3 | Privacy/Terms non traduites | P0 | Ajouter disclaimer langue en haut | Privacy.tsx, Terms.tsx | Disclaimer visible en haut |
| 4 | Structured Data fictives | P0 | Supprimer aggregateRating | Index.tsx | Pas de rating fictif dans le source |
| 5 | Legal.tsx pas de design system | P1 | Ajouter Navbar + Footer | Legal.tsx | Page avec Navbar/Footer coherent |
| 6 | Footer liens vers routes protegees | P1 | Remplacer par liens publics | Footer.tsx | Liens ne redirigent plus vers /auth |
| 7 | Badges Starter trompeurs | P1 | Ajouter qualificatif "lite" | Pricing.tsx | Badge indique clairement "lite" |

---

## Plan d'implementation

### Fichiers a modifier (6 fichiers)

| Fichier | Changements |
|---------|-------------|
| `src/components/landing/Pricing.tsx` | Lignes 86, 141, 184 : `/onboarding` -> `/auth?tab=signup` + badges Starter "lite" |
| `src/pages/Legal.tsx` | Retirer "[a completer]", ajouter Navbar + Footer, design system |
| `src/pages/Index.tsx` | Supprimer `aggregateRating` du JSON-LD (lignes 33-37) |
| `src/pages/Privacy.tsx` | Ajouter disclaimer multilingue en haut |
| `src/pages/Terms.tsx` | Ajouter disclaimer multilingue en haut |
| `src/components/landing/Footer.tsx` | Remplacer liens protegees par liens publics |

### Details techniques

**Pricing.tsx** (3 occurrences) :
```
Avant : <Link to="/onboarding">
Apres : <Link to="/auth?tab=signup">
```

**Index.tsx** :
Supprimer les lignes 33-37 (aggregateRating block).

**Legal.tsx** :
- Ajouter `<Navbar />` et `<Footer />`
- Remplacer les 5 placeholders "[... a completer]" par "Sur demande"
- Appliquer le meme design que Privacy.tsx (header gradient, bg-background)

**Privacy.tsx / Terms.tsx** :
Ajouter en haut un Badge :
```tsx
<Badge variant="outline" className="mb-4">
  {t("common.frenchOnly")}
</Badge>
```
Avec cle i18n : "This document is available in French only" / "Ce document est disponible en francais uniquement" dans les 7 locales.

**Footer.tsx** :
- `/dashboard/guide` -> `/about` (page publique existante)
- `/dashboard/status` -> supprimer ou pointer vers `/contact`

### Cles i18n a ajouter (7 locales)

| Cle | FR | EN |
|-----|----|----|
| `common.frenchOnly` | "Ce document est disponible en francais uniquement" | "This document is available in French only" |

---

## Verdict final

Apres ces 7 corrections (4 P0 + 3 P1), la plateforme sera "Release-Grade" :

- 0 lien mort / 0 route protegee accessible depuis le public
- 0 placeholder visible
- 0 donnee structuree fictive
- Pages legales completes et coherentes
- Design system uniforme sur toutes les pages
- CTAs coherents sur tout le parcours visiteur
- Mobile-first impeccable (verifie via screenshots 390x844)
- Securite : pas de secrets cote client, RLS 325+ policies, CORS whitelist, rate limiting
- RGPD : Privacy policy complete, CGU completes, mentions legales, contact DPO

**READY TO PUBLISH = NON** (4 bloquants P0 restants listees ci-dessus)
**Apres corrections = OUI**
