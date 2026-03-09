
# AUDIT BÊTA-TESTEUR NON TECHNIQUE — Growth OS

---

## 1. RÉSUMÉ EXÉCUTIF

### Ce qu'un novice comprend en arrivant
Le hero est efficace : "39 agents IA pour automatiser votre croissance" est immédiatement compréhensible. Le visiteur comprend que c'est un outil B2B d'automatisation par IA, avec des départements (Marketing, Finance, etc.). Le champ URL + CTA "Commencer gratuitement" est un bon mécanisme d'entrée.

### Ce qu'il ne comprend PAS
- **"GEO · Moteurs IA"** dans le menu : incompréhensible pour un novice
- **"Eco"** dans le menu : trop vague, on pense "économie" pas "écologie"
- La section **Sécurité** est entièrement cassée (affiche des clés techniques brutes comme `landing.security.badge`)
- La **bannière cookies est en anglais** sur un site français
- 4 questions FAQ affichent des clés techniques brutes au lieu de texte
- Le **dashboard mélange français et anglais** (sidebar FR, contenu EN)
- Le **pricing** commence à 490€/mois sans contexte immédiat de valeur

### 5 plus gros freins
1. **Section Sécurité cassée** — affiche du code au lieu de texte, détruit la crédibilité instantanément
2. **Bannière cookies en anglais** — premier élément visible, incohérence de langue immédiate
3. **FAQ partiellement cassée** — les 4 dernières questions affichent des clés techniques
4. **Barre de recherche dashboard non traduite** — `commandPalette.search` visible
5. **Menu navbar trop technique** — "GEO · Moteurs IA" et "Eco" sont du jargon

### 5 priorités absolues
1. Ajouter les traductions `landing.security.*` (section entièrement cassée)
2. Ajouter les traductions `cookies.*` (bannière en anglais)
3. Ajouter les FAQ q7-q10 dans le namespace `landing.faq` ou réduire à q1-q6
4. Renommer les liens navbar pour un public non-technique
5. Traduire la barre de recherche du dashboard

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorité | Page / Zone | Problème | Ce que ressent le novice | Impact | Recommandation | Immédiat? |
|----------|------------|----------|------------------------|--------|---------------|-----------|
| P0 | Landing / SecurityTrust | Affiche `landing.security.badge`, `landing.security.title`, etc. | "C'est quoi ce charabia technique ? C'est cassé." | Crédibilité DÉTRUITE — section trust qui fait l'inverse | Ajouter les clés i18n `landing.security.*` dans fr.ts et en.ts | OUI |
| P0 | Global / Cookie banner | Texte en anglais ("We use cookies...") sur site FR | "Ce site est-il vraiment français ? C'est bâclé." | Première impression négative, incohérence langue | Ajouter clés `cookies.*` en français | OUI |
| P0 | Landing / FAQ | q7-q10 affichent `landing.faq.q7.question` etc. | "Encore du code qui s'affiche, ce site est buggé" | Perte de confiance, impression de prototype | Soit ajouter q7-q10, soit limiter le rendu à q1-q6 | OUI |
| P1 | Navbar | "GEO · Moteurs IA" | "C'est quoi GEO ? Moteurs IA ? Je comprends rien" | Friction de navigation, abandon | Renommer en "Visibilité IA" ou "IA & Référencement" | OUI |
| P1 | Navbar | "Eco" | "Éco quoi ? Économique ? Écologique ?" | Confusion, label trop court | Renommer en "Éco-Transition" | OUI |
| P1 | Dashboard | Barre recherche affiche `commandPalette.search` | "Texte bizarre dans la barre de recherche" | Impression de produit non fini | Ajouter traduction ou fallback "Rechercher..." | OUI |
| P1 | Dashboard | Greeting en anglais "Good morning! Here's the status of..." | "Pourquoi c'est en anglais maintenant ?" | Incohérence de langue dans le produit | Traduire le contenu du cockpit | OUI |
| P1 | Dashboard / sidebar | Labels "Active agents", "Departments", "Availability" en anglais | Mélange FR/EN confus | Produit pas fini | Vérifier les traductions dashboard | OUI |
| P1 | Landing / Hero | "Briefs auto-générés", "Approbations intégrées", "Basé sur les données" — abstraits | "OK mais concrètement ça fait quoi pour MOI ?" | Benefits pas assez concrets pour un novice | Réécrire avec bénéfices tangibles | OUI |
| P2 | Landing / Pricing | 490€-9 000€/mois, tarifs élevés sans preuve de valeur immédiate | "C'est très cher, pourquoi je paierais ça ?" | Conversion bloquée par le choc prix | Ajouter ROI concret avant le prix (ex: "vs 175 500€/an d'embauche") | OUI |
| P2 | Landing / Cookie banner mobile | La bannière couvre le CTA principal | "Je peux pas cliquer sur Commencer" | Conversion mobile bloquée | Repositionner ou réduire la bannière | OUI |
| P2 | Landing / EcoTransition | Badge "Beta" ajouté mais section promet des fonctionnalités non opérationnelles | "C'est pas encore prêt ?" | Attentes déçues, perte de confiance | Clarifier "Bientôt disponible" ou "Aperçu" | OUI |
| P2 | Footer | Lien "Statut" — peu compréhensible pour un novice | "Statut de quoi ?" | Jargon technique | Renommer "État du service" | OUI |
| P3 | Landing | Beaucoup de sections (Hero, Trust, Features, Preview, HowItWorks, Comparison, TeamOrg, Tools, Security, GEO, Eco, Pricing, Testimonials, FAQ, CTA) = très long | "C'est interminable" | Fatigue de scroll, abandon | Évaluer suppression/fusion de sections redondantes | NON (décision produit) |
| P3 | Landing / Testimonials | Pas de vrais noms, juste "Secteur" — peu crédible | "C'est des faux témoignages" | Confiance réduite | Ajouter vrais témoignages quand disponibles | NON |

---

## 3. AMÉLIORATIONS PRIORITAIRES À IMPLÉMENTER IMMÉDIATEMENT

### Traductions manquantes critiques (P0)

**1. `landing.security.*`** — La section SecurityTrust est 100% cassée visuellement. Ajouter dans fr.ts ET en.ts :
- `landing.security.badge` = "Sécurité & Conformité"
- `landing.security.title` = "Vos données sont protégées"
- `landing.security.subtitle` = "Sécurité enterprise-grade intégrée à chaque niveau"
- 6 features : encryption, rbac, audit, gdpr, hosting, approvals (title + desc)

**2. `cookies.*`** — Bannière visible en premier, en anglais. Ajouter :
- `cookies.message` = "Nous utilisons des cookies pour améliorer votre expérience et fournir un support client."
- `cookies.learnMore` = "En savoir plus"
- `cookies.decline` = "Refuser"
- `cookies.accept` = "Accepter"

**3. FAQ q7-q10** — Limiter le composant FAQ à q1-q6 (les seules clés qui existent dans `landing.faq`)

### Copy / Labels (P1)

**4. Navbar** :
- "GEO · Moteurs IA" → "Visibilité IA"
- "Eco" → "Éco-Transition"

**5. Hero benefits** — Rendre plus concrets :
- "Briefs auto-générés" → "Rapports livrés chaque matin"
- "Approbations intégrées" → "Vous validez, l'IA exécute"
- "Basé sur les données" → "Décisions basées sur vos données réelles"

### Dashboard (P1)

**6. `commandPalette.search`** — Ajouter la traduction manquante

---

## 4. PLAN D'IMPLÉMENTATION

### Fichiers à modifier :

| Fichier | Modification |
|---------|-------------|
| `src/i18n/locales/fr.ts` | Ajouter `landing.security.*`, `cookies.*`, améliorer hero benefits labels, ajouter `commandPalette.search` |
| `src/i18n/locales/en.ts` | Même chose en anglais |
| `src/components/landing/FAQ.tsx` | Réduire `faqKeys` à `["q1", "q2", "q3", "q4", "q5", "q6"]` |
| `src/components/landing/Navbar.tsx` | Pas de changement code, les labels viennent d'i18n — modifier les clés `landing.navbar.geo` et `landing.navbar.eco` dans les traductions |

### Ce qui NE peut PAS être fait immédiatement :
- Vrais témoignages clients (décision business)
- Restructuration pricing (décision produit)
- Réduction du nombre de sections landing (décision produit)
- Traduction complète du dashboard cockpit (trop de fichiers à auditer)
