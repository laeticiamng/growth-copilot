

# AUDIT TECHNIQUE COMPLET — Growth OS — 2026-03-09

---

## 1. RÉSUMÉ EXÉCUTIF

**État global** : Plateforme SaaS ambitieuse avec une architecture solide (multi-tenant, RBAC, RLS, i18n 7 langues, Sentry, service-gating) mais souffrant de problèmes critiques qui empêchent un go-live en confiance.

**Niveau de préparation réel** : 65/100 — L'architecture est mature, mais de nombreuses fonctionnalités affichées reposent sur des données mockées/hardcodées sans aucun branchement backend réel. Le mode démo constitue une faille de sécurité béante.

**Verdict go-live : NON EN L'ÉTAT**

### 5 P0 principaux

1. **FAILLE SÉCURITÉ CRITIQUE — Demo mode bypass auth via localStorage** : N'importe qui peut écrire `localStorage.setItem('growth_os_demo_mode', 'true')` et accéder à TOUTES les routes dashboard protégées sans aucune authentification. (`ProtectedRoute.tsx:25-28`)
2. **Eco-Transition 100% mockée** : Les 5 composants eco (CarbonSankey, GreenRoadmap, ESGReport, SubsidyMatcher, GreenKPI) utilisent exclusivement des `DEMO_` data hardcodées. Aucune table DB, aucun edge function, aucune API comptable connectée. Fonctionnalité vendue sur la landing page mais inexistante.
3. **Tous les edge functions ont `verify_jwt = false`** : Les 38 edge functions désactivent la vérification JWT au niveau Supabase. Si la validation interne échoue ou est absente dans certaines fonctions, c'est un accès ouvert.
4. **Console error React ref warning sur DemoModeWatermark** : Composant lazy-loaded reçoit un ref mais n'utilise pas forwardRef, causant un warning à chaque chargement de page.
5. **Pricing CTA potentiellement cassé** : Le checkout Stripe (`stripe-checkout`) est invoqué depuis Onboarding et Billing, mais les `priceId` sont hardcodés. Si non alignés avec les produits Stripe réels, le paiement échoue silencieusement.

### 5 P1 principaux

1. **Données demo non isolées du vrai produit** : `DEMO_WORKSPACE`, `DEMO_KPIS_DAILY`, `DEMO_AGENT_RUNS`, etc. mélangées dans les composants — difficulté à distinguer ce qui est réel de ce qui est factice pour un utilisateur payant.
2. **Eco-transition gated par service "sustainability"** : Le service `sustainability` n'existe pas dans le `services_catalog` observable — la route `/dashboard/eco` est inaccessible pour les vrais utilisateurs.
3. **Pas de page `/reset-password` dédiée** : Le reset password utilise `/auth?mode=reset` ce qui fonctionne mais est non-standard et fragile (dépend du hash URL Supabase).
4. **Green KPI Dashboard avec mois hardcodés en français** : `MONTHS = ["Jan", "Fév", ...]` non traduit via i18n, cassant l'expérience pour les 6 autres langues.
5. **24+ providers React empilés** : Même avec `composeProviders`, chaque page charge 24 contexts React — impact performance potentiel sur le first paint.

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorité | Domaine | Page / Route / Fonction | Problème | Symptôme | Risque | Recommandation | Immédiat? |
|----------|---------|------------------------|----------|----------|--------|---------------|-----------|
| P0 | Security | `ProtectedRoute.tsx` | Demo mode bypass via localStorage | Toute personne peut accéder au dashboard | Accès non-auth complet | Supprimer le fallback localStorage, exiger contexte uniquement | OUI |
| P0 | Frontend | Eco composants | 100% données mockées, 0% backend | UI affiche de fausses données | Tromperie utilisateur | Ajouter empty state clair "Connectez votre comptabilité" | OUI |
| P0 | Security | `config.toml` | 38 fonctions verify_jwt=false | Dépendance sur validation interne | Si une fonction oublie la validation → accès ouvert | Auditer chaque fonction pour validation JWT interne | NON (audit requis) |
| P0 | Frontend | `App.tsx:64` | DemoModeWatermark reçoit ref sans forwardRef | Warning console à chaque load | Pollution console, perception de bug | Ajouter forwardRef ou supprimer le ref | OUI |
| P0 | Billing | Stripe checkout | priceId hardcodés non vérifiables | Checkout potentiellement cassé | Paiement impossible | Vérifier alignment avec produits Stripe live | NON (accès Stripe requis) |
| P1 | Frontend | Eco landing section | Fonctionnalité vendue mais non opérationnelle | Section landing promet Carbon Automator, ESG, etc. | Attentes fausses → churn | Ajouter badge "Bientôt" ou relier à de vrais modules | OUI |
| P1 | Auth | `/dashboard/eco` | Service "sustainability" probablement absent du catalogue | Route inaccessible même pour utilisateurs authentifiés | 404 fonctionnel | Ajouter le service au catalogue ou retirer le gate | OUI (migration DB) |
| P1 | i18n | `GreenKPIDashboard.tsx` | Mois hardcodés en français | Labels "Fév", "Aoû" en anglais/allemand | UX cassée multilingue | Utiliser `date-fns` locale ou clés i18n | OUI |
| P1 | Performance | `App.tsx` | 24 providers imbriqués | Overhead context sur chaque render | Latence perceptible | Évaluer lazy-loading des feature providers | NON (refactor majeur) |
| P1 | Frontend | `TeamActivityFeed.tsx` | Données demo par défaut | Affiche de faux utilisateurs même hors demo | Confusion utilisateur | Afficher empty state si pas de données réelles | OUI |
| P2 | SEO | Landing Eco section | Pas de structured data eco | Indexation sous-optimale | SEO | Ajouter schema.org | NON |
| P2 | Accessibility | Navbar | Smooth scroll anchors `/#eco` `/#geo` | Pas de fallback si JS désactivé | A11y minor | Acceptable | NON |
| P2 | Frontend | `GreenRoadmap.tsx` | Données actions hardcodées en français | Contenu non traduit via i18n | UX partielle multilingue | Externaliser vers clés i18n | OUI |
| P2 | Frontend | `ESGReportGenerator.tsx` | Sections ESG hardcodées en français | Pareil | Pareil | Pareil | OUI |
| P2 | Frontend | `SubsidyMatcher.tsx` | Subventions ADEME/BPI hardcodées | Données statiques non actualisées | Informations obsolètes | Clarifier "Données indicatives" | OUI |
| P3 | Frontend | `CarbonSankeyDiagram.tsx` | Pas de vrai diagramme Sankey | Barres de progression simples | Promesse marketing non tenue | Renommer ou implémenter vrai Sankey (recharts) | NON |
| P3 | Console | Global | Warning `Function components cannot be given refs` | Console polluée | Dev experience | Fix forwardRef | OUI |

---

## 3. DÉTAIL PAR CATÉGORIE

### A. Frontend & Rendu
- **Ce qui fonctionne** : Landing page complète, navigation cohérente, 404 bien gérée, SEOHead sur toutes les pages, lazy loading des routes dashboard, ErrorBoundary global, skip-to-content link.
- **Ce qui est cassé** : Warning ref DemoModeWatermark pollue la console.
- **Ce qui est douteux** : La section Eco sur la landing page vend des fonctionnalités qui n'existent pas en vrai (toutes mockées).

### B. QA Fonctionnelle
- **Ce qui fonctionne** : Auth login/signup avec validation Zod, reset password flow, social login (Google/Apple via Lovable OAuth), onboarding avec Stripe checkout.
- **Ce qui est cassé** : Les 5 modules eco sont des coquilles vides avec données hardcodées.
- **Non confirmé** : Persistence réelle après signup (profils, workspace creation), checkout Stripe en production.

### C. Auth & Autorisations
- **CRITIQUE** : `ProtectedRoute` accepte `localStorage.getItem('growth_os_demo_mode') === 'true'` comme bypass d'authentification. Un utilisateur malveillant peut accéder à tout le dashboard sans se connecter.
- **Ce qui fonctionne** : Auth flow complet, PublicOnlyRoute, ServiceGuard, PermissionGuard, RBAC multi-rôle.

### D. APIs & Edge Functions
- **Ce qui fonctionne** : 38 edge functions déployées, architecture partagée `_shared/auth.ts` pour validation JWT interne, CORS centralisé avec whitelist stricte.
- **Risque** : Toutes ont `verify_jwt = false` — la sécurité repose entièrement sur la validation manuelle dans chaque fonction. Si une seule fonction l'oublie, c'est une porte ouverte.

### E. Database & RLS
- **Ce qui fonctionne** : RLS activé, fonctions SECURITY DEFINER avec `search_path = public`, rate limiting triggers, audit log immutable, workspace isolation.
- **Non confirmé** : Couverture RLS complète sur toutes les tables (audit DB complet nécessaire).

### F. Sécurité
- **P0** : Demo mode localStorage bypass (détaillé ci-dessus).
- **Bon** : OAuth tokens chiffrés AES-GCM 256-bit, CORS restrictif, rate limiting sur contact/smart_link, input validation Zod.
- **Risque** : Pas de CAPTCHA sur signup/contact forms.

### G. Paiement & Billing
- **Présent** : Pages Billing et Pricing, Stripe checkout et portal edge functions, check-subscription.
- **Non confirmé** : Alignement priceId/productId avec Stripe live, webhook handling correct, plan limits enforcement.

### H. Performance
- **Bon** : Lazy loading routes, manual chunks Vite, code splitting i18n, staleTime 5min sur queries.
- **Préoccupation** : 24 providers context, potentiel overhead sur mobile.

### I. SEO
- **Bon** : SEOHead sur toutes les pages, structured data JSON-LD, hreflang 7 langues, robots.txt correct, sitemap.xml, canonical URLs.
- **Manque** : Structured data sur pages eco, breadcrumbs.

### J. i18n
- **Bon** : 7 langues, lazy loading, détection automatique, coverage FR/EN/DE élevée.
- **Problèmes** : Eco composants avec contenu hardcodé en français (mois, actions, subventions, sections ESG).

### K. Observabilité
- **Bon** : Sentry intégré, ErrorBoundary, audit log immutable, CrispChat support, status page, diagnostics dashboard.
- **Acceptable** : Cookie consent, offline banner, PWA service worker.

---

## 4. PLAN D'ACTION PRIORISÉ

### Correctifs immédiats P0 (implémentables maintenant)
1. **Supprimer le bypass localStorage dans ProtectedRoute** — retirer la ligne `isDemoFromStorage` et ne garder que le contexte `isDemoMode`
2. **Ajouter forwardRef à DemoModeWatermark** ou retirer le ref dans App.tsx
3. **Ajouter des empty states explicites** aux 5 composants eco pour indiquer clairement qu'il s'agit de données de démonstration

### Correctifs rapides P1
4. Ajouter le service "sustainability" au `services_catalog` (migration DB)
5. Internationaliser les mois dans GreenKPIDashboard
6. Ajouter un badge "Beta" ou "Données de démonstration" sur la section eco de la landing page

### Améliorations P2
7. Externaliser les textes français hardcodés des composants eco vers i18n
8. Ajouter CAPTCHA sur formulaires publics (contact, signup)
9. Auditer les 38 edge functions pour confirmer la validation JWT interne

### Polish P3
10. Implémenter un vrai diagramme Sankey avec recharts
11. Optimiser le nombre de providers (lazy-load feature providers)

---

## 5. IMPLÉMENTATION IMMÉDIATE RECOMMANDÉE

Les correctifs suivants sont sûrs et implémentables immédiatement :

1. **ProtectedRoute.tsx** : Supprimer le fallback localStorage `isDemoFromStorage` (lignes 24-28). Le contexte `isDemoMode` suffit et ne peut pas être manipulé depuis la console.

2. **App.tsx ligne 64** : Supprimer la ligne `DemoModeWatermark` lazy-loaded avec ref, ou wrapper le composant avec forwardRef dans DemoModeBanner.tsx.

3. **Eco composants** : Ajouter un bandeau "Données de démonstration" explicite en haut de chaque composant eco pour éviter la confusion.

4. **GreenKPIDashboard.tsx** : Remplacer les mois hardcodés par `date-fns` format ou clés i18n.

5. **Landing EcoTransitionSection** : Ajouter un badge "Beta" pour signaler que les fonctionnalités sont en cours de développement.

### Éléments nécessitant une décision externe
- Vérification des priceId Stripe (accès Stripe dashboard requis)
- Ajout du service "sustainability" au catalogue DB (migration SQL)
- Audit complet des 38 edge functions pour validation JWT
- Connexion réelle aux APIs comptables (Pennylane/Sage/QuickBooks) pour le module eco

