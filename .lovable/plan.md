

# Audit UX Detaille - Perspective Beta-Testeur

## Resume de l'audit

J'ai parcouru l'integralite de la landing page et des pages associees (Auth, Contact, Onboarding) en simulant le parcours d'un utilisateur final non technique. Voici les problemes identifies et les corrections a apporter.

---

## Problemes identifies

### 1. PWA Icons manquantes (Critique)
**Symptome:** Erreur console: "Error while trying to use the following icon from the Manifest: /icons/icon-144.png (Download error or resource isn't a valid image)"

**Cause:** Le fichier `manifest.json` reference des icones dans `/icons/` qui n'existent pas.

**Impact:** L'installation PWA echoue, affichant une erreur dans la console.

**Correction:** Creer le dossier `public/icons/` avec les icones requises ou simplifier le manifest pour n'utiliser que `favicon.ico`.

---

### 2. Section Testimonials non traduite en anglais
**Symptome:** Meme en mode anglais, les temoignages sont affiches en francais ("Ils font confiance a Growth OS", "PME, startups et consultants...").

**Impact:** Incoherence linguistique pour les utilisateurs anglophones.

**Correction:** Integrer i18n dans `Testimonials.tsx` avec traductions EN/FR.

---

### 3. Inconstance des prix dans la FAQ
**Symptome:** La FAQ mentionne "299EUR/mois" pour Full Company et "19EUR/mois par departement", mais les tarifs reels sont 9000EUR et 1900EUR.

**Impact:** Confusion majeure pour l'utilisateur qui compare les informations.

**Correction:** Mettre a jour les textes de la FAQ avec les tarifs corrects.

---

### 4. Lien "Connected to your tools" dans la navbar ne mene nulle part
**Symptome:** Le lien navbar pointe vers une ancre `#tools` qui existe, mais le libelle "Connected to your tools" est en anglais meme en mode francais.

**Impact:** Melange de langues dans la navigation.

**Correction:** Utiliser les traductions i18n pour ce lien.

---

### 5. Footer - Liens "Blog" et "API" sont des placeholders
**Symptome:** Les liens `Blog` et `API` pointent vers `#` ou des pages inexistantes.

**Impact:** Clic sans resultat, experience decevante.

**Correction:** Masquer ces liens ou pointer vers des pages "Coming Soon".

---

### 6. Page Contact - Titres uniquement en francais
**Symptome:** "Besoin d'aide ?", "Notre equipe vous repond sous 24h" ne changent pas selon la langue.

**Impact:** Incoherence pour les utilisateurs anglophones.

**Correction:** Integrer i18n dans `Contact.tsx`.

---

### 7. Page Auth - Textes uniquement en francais
**Symptome:** Tous les textes ("Connexion", "Inscription", "Email invalide", etc.) sont en francais meme si l'interface est en anglais.

**Impact:** Rupture d'experience pour les utilisateurs anglophones.

**Correction:** Integrer i18n dans `Auth.tsx`.

---

### 8. Page Onboarding - Textes uniquement en francais
**Symptome:** Tout le tunnel d'onboarding ("Quel est votre site ?", "Choisissez votre formule", etc.) est en francais.

**Impact:** Blocage potentiel pour les utilisateurs non francophones.

**Correction:** Integrer i18n dans `Onboarding.tsx`.

---

### 9. CTA "See all integrations" ne mene nulle part
**Symptome:** Le bouton dans la section Tools est un placeholder sans action.

**Impact:** Attente non satisfaite apres le clic.

**Correction:** Lier vers `/dashboard/integrations` ou afficher un message informatif.

---

### 10. Nombre de departements incoherent
**Symptome:** La FAQ mentionne "9 departements" mais le pricing indique "11 departements".

**Impact:** Confusion sur l'offre reelle.

**Correction:** Harmoniser tous les textes avec le nombre correct (11).

---

## Corrections techniques a implementer

| Fichier | Correction |
|---------|-----------|
| `public/manifest.json` | Simplifier pour ne referencer que favicon.ico existant |
| `src/components/landing/Testimonials.tsx` | Ajouter i18n avec traductions EN/FR |
| `src/components/landing/FAQ.tsx` | Corriger les tarifs (9000EUR/1900EUR) et nombre de departements (11) |
| `src/components/landing/Navbar.tsx` | Traduire le lien "Connected to your tools" |
| `src/components/landing/Footer.tsx` | Masquer ou rediriger les liens Blog/API vers une page "Coming Soon" |
| `src/components/landing/Tools.tsx` | Ajouter action au bouton "See all integrations" |
| `src/pages/Contact.tsx` | Integrer i18n pour les titres et textes |
| `src/pages/Auth.tsx` | Integrer i18n complet |
| `src/pages/Onboarding.tsx` | Integrer i18n complet |
| `src/i18n/locales/fr.ts` et `en.ts` | Ajouter les nouvelles cles de traduction |

---

## Priorites d'implementation

1. **P0 (Bloquant):** PWA manifest icons + FAQ tarifs incorrects
2. **P1 (Important):** i18n Testimonials + FAQ departements
3. **P2 (Normal):** i18n Contact, Auth, Onboarding, liens footer
4. **P3 (Nice-to-have):** CTA "See all integrations"

---

## Resume des corrections

- 10 problemes identifies
- 10 fichiers a modifier
- 3 corrections critiques (PWA, tarifs, coherence)
- Integration i18n pour 4 pages/composants
- Simplification des liens morts

