

# Audit Technique Complet — Growth OS Platform (Mars 2026)

## 1. RESUME EXECUTIF

**Etat global** : Plateforme SaaS ambitieuse avec ~60+ routes, architecture frontend solide (lazy loading, ErrorBoundary, Suspense, RBAC, i18n 7 langues). Le backend Supabase est bien architecturé (RLS, RBAC, rate limiting, encryption AES-GCM). Cependant, la majorité des modules dashboard restent des **maquettes UI avec données demo hardcodées**, et un problème critique d'i18n rend la homepage et ~15 pages publiques cassées en français.

**Niveau de preparation** : Prototype avancé / Pre-beta. Pages publiques partiellement prêtes (i18n cassé). Dashboard = shell demonstratif.

**Verdict go-live** : **NON EN L'ETAT**

### Top 5 P0
1. **Homepage titre cassé en français** — `pages.index.title` et tout le namespace `pages.*` (~1200 lignes) manque dans `fr.ts`, donc le titre affiche la clé brute "pages.index.title | Growth OS" au lieu du vrai titre. Toutes les pages publiques (Pricing, Features, Use Cases, For Agencies, About, Roadmap, Install, Blog, Help, etc.) sont impactées.
2. **Console error : CrispChat ref warning** — `CrispChat` est un function component sans `forwardRef`, mais reçoit un ref via le lazy loading dans App.tsx. Warning React permanent à chaque chargement.
3. **Network errors au boot** — Appels Supabase (cro_audits, Meta integration) échouent avec "Failed to fetch" dès le chargement, même sur la homepage publique, car les providers lancent des requêtes avant même que l'utilisateur soit sur le dashboard.
4. **dangerouslySetInnerHTML résiduel** — Toujours present dans `BrandKit.tsx` (ligne 100) et `chart.tsx` (composant UI system). Le fix précédent n'a couvert que BlogArticle et Reputation.
5. **Demo mode bypass auth via localStorage** — `ProtectedRoute` vérifie `localStorage.getItem('growth_os_demo_mode')` côté client. Pattern manipulable trivialement.

### Top 5 P1
1. **Eco route sans service guard** — `/dashboard/eco` n'a pas de `service` guard contrairement aux autres modules (`service="marketing"`, `service="sales"`, etc.)
2. **Providers lancent des requêtes inutiles** — MetaProvider, CROProvider, etc. font des appels réseau au boot même quand l'utilisateur est sur une page publique, causant des erreurs réseau et du gaspillage.
3. **About page texte corrompu** — Ligne 2278-2279 de en.ts : "Grthe Growth OS teamfrom a simple observthe Growth OS teamtartups" — texte manifestement corrompu/tronqué.
4. **40+ edge functions verify_jwt = false** — Validation JWT faite en code, mais risque si une seule fonction l'oublie.
5. **Fonctionnalités "Coming Soon"** — Boutons "Generate AI" et "Export PDF" dans Eco affichent des toasts "Coming Soon" (corrigé vs setTimeout), mais restent trompeurs pour un utilisateur payant.

---

## 2. TABLEAU D'AUDIT

| P | Domaine | Localisation | Probleme | Risque | Recommandation | Faisable ? |
|---|---------|-------------|----------|--------|---------------|-----------|
| P0 | i18n | fr.ts | Namespace `pages.*` quasi-absent (~1200 lignes manquantes) | Homepage et ~15 pages publiques affichent des clés brutes en FR | Ajouter toutes les clés `pages.*` dans fr.ts | Oui |
| P0 | Frontend | App.tsx / CrispChat | Warning "Function components cannot be given refs" | Console error permanente | CrispChat n'a pas besoin de ref — supprimer le lazy import via `.then(m => ({default: m.CrispChat}))` ou ne rien changer (warning non bloquant mais sale) | Oui |
| P0 | Performance | Providers (Meta, CRO, etc.) | Requêtes réseau au boot sur pages publiques | Errors réseau, latence inutile | Conditionner les fetches à la présence d'un user/workspace | Oui (complexe) |
| P0 | Security | BrandKit.tsx | dangerouslySetInnerHTML résiduel | XSS potentiel | Remplacer par text rendering safe | Oui |
| P0 | Auth | ProtectedRoute | Demo mode bypass via localStorage | Accès dashboard sans auth | Déjà documenté — ajouter watermark clair | Oui |
| P1 | Auth | App.tsx L387 | /dashboard/eco sans service guard | Incohérence avec les autres modules | Ajouter `service="eco"` ou "sustainability" | Oui |
| P1 | i18n | en.ts L2278-2279 | Texte About page corrompu | Page About cassée en EN | Corriger le texte | Oui |
| P1 | SEO | Index.tsx | Title en FR = "pages.index.title \| Growth OS" | SEO catastrophique en FR | Corrigé par fix P0 i18n | Oui |
| P2 | Performance | App.tsx | 24+ providers au boot | TTFB élevé | Non trivial à refactorer | Non trivial |
| P2 | Frontend | chart.tsx | dangerouslySetInnerHTML pour CSS injection | Risque faible (CSS only) | Acceptable si contenu contrôlé | Non prioritaire |
| P3 | SEO | SEOHead | og:site_name hardcodé "Growth OS" | Devrait être le nom de la société | Changer ou garder comme nom produit | Oui |

---

## 3. DETAIL PAR CATEGORIE

### A. Frontend & Rendu
- **Fonctionne** : Architecture lazy loading, ErrorBoundary, Suspense, 404 page, routing cohérent, ~60 routes bien organisées
- **Cassé** : Homepage titre = clé brute i18n en FR. Warning React CrispChat ref permanent.
- **Douteux** : Light mode non testé sur tous les composants Eco

### B. QA Fonctionnelle
- **Fonctionne** : Auth (login/signup/reset), navigation sidebar, workspace selector, contact form (branché sur edge function)
- **Cassé** : Texte About page corrompu en EN ("Grthe Growth OS teamfrom...")
- **Non confirmé** : Stripe checkout end-to-end, PDF export, AI generation réelle

### C. Auth & Autorisations
- **Fonctionne** : ProtectedRoute, PublicOnlyRoute, RBAC, session management, role-based filtering
- **Risque** : Demo mode localStorage bypass. Eco route non service-gated.

### D. APIs & Edge Functions
- **Architecture solide** : Auth partagée, CORS centralisé, permissions server-side
- **Problème** : Providers lancent des requêtes en erreur au boot sur pages publiques

### E. Database & RLS
- **Bien fait** : SECURITY DEFINER avec search_path, rate limiting, audit log immutable
- **Non confirmé** : Coverage RLS complète

### F. Sécurité
- **Résiduel** : dangerouslySetInnerHTML dans BrandKit.tsx
- **Bien fait** : Token encryption, CORS whitelist, Zod validation, rate limiting

### G. i18n
- **CRITIQUE** : `fr.ts` manque ~1200 lignes du namespace `pages.*` (index, pricingPage, useCases, forAgencies, about, roadmap, install, features, blog, changelog, help, notFound, mediaAssets). La langue principale (FR) est donc cassée sur toutes les pages publiques.

### H. SEO
- **Impacté** : Title et meta description de la homepage = clés brutes en FR, ce qui détruit le SEO FR
- **Bien fait** : Structured data, canonical, og tags (quand les clés existent)

### I. Observabilité
- **Bien fait** : Sentry, ErrorBoundary, audit logs, diagnostics panel

---

## 4. PLAN D'ACTION PRIORISE

### P0 — Corrections immédiates
1. **Ajouter tout le namespace `pages.*` dans `fr.ts`** — Traduire les ~1200 lignes manquantes (index, pricingPage, useCases, forAgencies, about, roadmap, install, notFound, mediaAssets). C'est le fix le plus impactant car il répare la homepage, le SEO, et ~15 pages publiques.
2. **Corriger le dangerouslySetInnerHTML dans BrandKit.tsx** — Remplacer par un rendu safe.
3. **Corriger le texte About corrompu dans en.ts** (lignes 2278-2279).

### P1 — Corrections rapides
4. **Ajouter service guard sur /dashboard/eco** — `service="eco"` ou `service="sustainability"`.
5. **Fixer le warning CrispChat ref** — Le composant ne reçoit pas de ref, le warning vient du lazy loading pattern.

### P2-P3
6. Conditionner les providers à ne pas fetcher sur pages publiques (refactor complexe).
7. Améliorer l'accessibilité des charts Recharts (aria-labels).

### Hors scope (décisions produit requises)
- Intégrations réelles (Pennylane, Sage, QuickBooks) — API keys tierces nécessaires
- Stripe live checkout — configuration externe
- AI generation réelle — déjà branché sur ai-assistant edge function potentiellement

---

## 5. IMPLEMENTATION IMMEDIATE

Les corrections suivantes seront implémentées :

1. **fr.ts** : Ajout de tout le namespace `pages.*` (~1200 lignes) — traduction FR de : `pages.index`, `pages.pricingPage`, `pages.useCases`, `pages.forAgencies`, `pages.notFound`, `pages.about`, `pages.roadmap`, `pages.install`, `pages.mediaAssets`
2. **en.ts** : Correction du texte About corrompu (lignes 2278-2279)
3. **BrandKit.tsx** : Remplacement du `dangerouslySetInnerHTML` par un rendu safe
4. **App.tsx** : Ajout de `service="eco"` sur la route `/dashboard/eco`

### Ce qui ne sera PAS implémenté
- Refactor des providers (risque de régression, complexe)
- Warning CrispChat ref (cosmétique, non bloquant)
- Stripe/OAuth/AI réels (secrets et config externe nécessaires)

