

# Audit detaille de chaque page de la plateforme Growth OS

## Methodologie
Test systematique de chaque page accessible publiquement et inspection du code des pages protegees (dashboard). Audit visuel, fonctionnel et de coherence pour chaque page.

---

## 1. Page d'accueil `/` - Landing Page

**Etat : OK avec reserves**

| Probleme | Gravite | Detail |
|---|---|---|
| Page Install non traduite | Majeur | Tout le contenu est en francais dur (pas i18n) |
| Page Privacy non traduite | Majeur | Contenu entierement en francais, pas de t() |
| Page Terms non traduite | Majeur | Contenu entierement en francais, pas de t() |
| Page Roadmap utilise un pattern mixte (titleFr/titleEn) au lieu de i18n | Moyen | Inconsistant avec le reste de l'app |
| Lien GitHub Releases mort | Majeur | Pointe vers `github.com/your-org/growth-os/releases` (placeholder) |
| Email footer `contact@growthOS.ai` incoherent | Moyen | Le reste de l'app utilise `contact@emotionscare.com` |
| Liens sociaux Twitter/LinkedIn fictifs | Moyen | `twitter.com/growthOS_ai` et `linkedin.com/company/growth-os-ai` n'existent probablement pas |
| Footer "Documentation" pointe vers `/about` | Moyen | Devrait pointer vers une vraie doc ou etre renomme |
| Footer "Status" pointe vers `/contact` | Moyen | Devrait pointer vers `/dashboard/status` ou etre un lien coherent |

**Hero, TrustBar, Features, TeamOrgChart, Tools, HowItWorks, Pricing, FAQ, CTA** : Fonctionnels et bien traduits (i18n). Design premium.

---

## 2. Page Auth `/auth`

**Etat : OK**

- Formulaires login/signup fonctionnels avec validation Zod
- Google/Apple OAuth integre
- Reset password et confirmation email geres
- Liens CGU et confidentialite presents
- Design professionnel, coherent

**Aucun probleme bloquant.**

---

## 3. Page About `/about`

**Etat : OK avec reserves**

| Probleme | Gravite | Detail |
|---|---|---|
| Structured data `publisher: EmotionsCare SASU` | Info | Coherent avec les mentions legales |
| Email `contact@emotionscare.com` present | OK | Coherent |

**Page propre, bien traduite via i18n.**

---

## 4. Page Contact `/contact`

**Etat : OK**

- Formulaire de contact fonctionnel (appel edge function `send-contact-form`)
- Cards email/chat/docs
- Validation Zod des champs
- Feedback utilisateur (succes/erreur)

**Aucun probleme bloquant.**

---

## 5. Page Privacy `/privacy`

**Etat : Probleme majeur**

| Probleme | Gravite | Detail |
|---|---|---|
| Contenu non traduit via i18n | Majeur | Tout est en francais dur, seul un badge "French only" s'affiche pour les non-FR |
| Bouton "Retour" non traduit | Moyen | Ecrit en dur "Retour" |
| Lien `emotionscare.com` dans le footer de la page | Info | Coherent avec les mentions legales |

---

## 6. Page Terms `/terms`

**Etat : Probleme majeur**

| Probleme | Gravite | Detail |
|---|---|---|
| Contenu non traduit via i18n | Majeur | Tout est en francais dur |
| Bouton "Retour" non traduit | Moyen | Ecrit en dur "Retour" |
| Pas de Navbar coherente | Moyen | Utilise un header custom different de la Navbar globale |
| Pas de Footer global | Moyen | Pas de footer du tout |

---

## 7. Page Legal `/legal`

**Etat : OK avec reserves**

- Utilise la Navbar et le Footer globaux (coherent)
- Contenu en francais dur mais avec badge "French only" pour les non-FR
- Liens internes fonctionnels (vers /privacy, /contact)
- Informations d'immatriculation "Disponibles sur demande" : acceptable

---

## 8. Page Roadmap `/roadmap`

**Etat : Probleme majeur**

| Probleme | Gravite | Detail |
|---|---|---|
| Lien GitHub Releases mort | Bloquant | `github.com/your-org/growth-os/releases` est un placeholder jamais mis a jour |
| Pas de Navbar/Footer globaux | Moyen | Utilise un layout custom avec juste un bouton "Retour" |
| Pattern `titleFr/titleEn` au lieu de i18n | Moyen | Inconsistant avec le reste de l'app |

---

## 9. Page Install `/install`

**Etat : Probleme majeur**

| Probleme | Gravite | Detail |
|---|---|---|
| Aucune traduction i18n | Bloquant | Toute la page est en francais dur : titres, descriptions, FAQ, footer |
| Pas de Navbar/Footer globaux | Majeur | Header et footer custom, incoherent avec le reste |
| Footer copyright "EmotionsCare SASU" | Moyen | Incoherent avec le footer principal |
| Bouton "Se connecter" non traduit | Moyen | Dur en francais |
| Contenu des features et FAQ en dur | Majeur | Pas de t() |

---

## 10. Page 404 `/nonexistent`

**Etat : OK**

- Design professionnel avec Navbar et Footer globaux
- Message traduit via i18n
- Bouton de retour fonctionnel
- Pas de probleme

---

## 11. Dashboard `/dashboard`

**Etat : Fonctionnel (necessite authentification)**

- Layout riche : Welcome Card, Daily Briefing, Department Semaphores, Approvals, KPIs
- Bien traduit via i18n
- Gestion des etats vides (pas de workspace)
- Sentry integre pour le suivi d'erreurs

---

## 12. Problemes transversaux

| Probleme | Pages affectees | Gravite |
|---|---|---|
| Inconsistance layout : certaines pages utilisent la Navbar/Footer globaux, d'autres non | Privacy, Terms, Roadmap, Install | Majeur |
| Pages legales (Privacy, Terms) non traduites en anglais | Privacy, Terms | Majeur |
| Page Install entierement en dur (pas de i18n) | Install | Bloquant |
| Lien GitHub placeholder non remplace | Roadmap | Bloquant |
| Email incoherent footer (`growthOS.ai` vs `emotionscare.com`) | Footer global | Moyen |
| Liens sociaux fictifs (Twitter, LinkedIn) | Footer global | Moyen |

---

## Plan de corrections (par priorite)

### P0 - Bloquants avant publication (5 actions)

1. **Supprimer le lien GitHub Releases mort** dans `/roadmap` (ligne 124) - Remplacer par un lien vers `/contact` ou le retirer
2. **Page Install : ajouter Navbar/Footer globaux** et remplacer le header/footer custom
3. **Page Install : migrer tout le contenu vers i18n** (features, FAQ, titres, descriptions, CTA)
4. **Pages Privacy et Terms : ajouter Navbar/Footer globaux** pour coherence
5. **Footer global : corriger l'email** `contact@growthOS.ai` vers `contact@emotionscare.com` (ou un email reel)

### P1 - Ameliorations fortes (5 actions)

6. **Pages Privacy et Terms : traduire les boutons** "Retour" via i18n
7. **Footer global : "Documentation" -> renommer** ou pointer vers `/dashboard/guide`
8. **Footer global : "Status" -> pointer vers** `/dashboard/status` au lieu de `/contact`
9. **Liens sociaux** : soit les retirer, soit les mettre a jour avec de vrais liens
10. **Page Roadmap : ajouter Navbar/Footer globaux** pour coherence de navigation

### P2 - Polish (3 actions)

11. **Pages Privacy/Terms : preparer les traductions anglaises** (meme si le contenu legal francais est obligatoire pour le droit francais)
12. **Page Install : ajouter le SEO multilingue** (titre, description en EN)
13. **Page Roadmap : migrer le pattern `titleFr/titleEn`** vers des cles i18n standard

---

## Implementation technique

### Fichier 1 : `src/pages/Roadmap.tsx`
- Ligne 124 : Supprimer ou remplacer le lien `github.com/your-org/growth-os/releases`
- Ajouter import de Navbar et Footer, envelopper le contenu avec

### Fichier 2 : `src/pages/Install.tsx`
- Remplacer le header custom par `<Navbar />`
- Remplacer le footer custom par `<Footer />`
- Migrer toutes les chaines en dur vers `t("pages.install.xxx")`
- Ajouter les cles correspondantes dans `fr.ts` et `en.ts`

### Fichier 3 : `src/pages/Privacy.tsx`
- Remplacer le header custom par `<Navbar />`
- Ajouter `<Footer />` en bas
- Traduire le bouton "Retour" via t()

### Fichier 4 : `src/pages/Terms.tsx`
- Remplacer le header custom par `<Navbar />`
- Ajouter `<Footer />` en bas
- Traduire le bouton "Retour" via t()

### Fichier 5 : `src/components/landing/Footer.tsx`
- Ligne 86 : Corriger `mailto:contact@growthOS.ai` vers `mailto:contact@emotionscare.com`
- Ligne 14 : Corriger "Status" href de `/contact` vers `/dashboard/status`
- Ligne 13 : Renommer "Documentation" ou corriger le lien

### Fichier 6 : `src/i18n/locales/fr.ts` et `en.ts`
- Ajouter toutes les cles de la page Install (features, FAQ, titres, descriptions, boutons)
- Ajouter les cles manquantes pour les boutons "Retour" des pages legales

