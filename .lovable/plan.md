

# Audit Technique Complet — Growth OS Platform

## 1. RÉSUMÉ EXÉCUTIF

**État global** : La plateforme est une vitrine SaaS ambitieuse avec ~60+ routes, ~50+ composants dashboard, un backend Supabase correctement architecturé (RBAC, RLS, edge functions). Cependant, la majorité des fonctionnalités dashboard sont des **maquettes UI avec données démo hardcodées** — les flux réels (sync API, AI generation, PDF export, Stripe checkout) ne sont pas confirmés comme opérationnels de bout en bout.

**Niveau de préparation** : Prototype avancé / Pré-beta. Le frontend est bien structuré, mais l'écart entre ce qui est affiché et ce qui fonctionne réellement est significatif.

**Verdict go-live** : **NON EN L'ÉTAT** — Trop de fonctionnalités annoncées mais non branchées. Les pages publiques (landing, pricing, auth) sont prêtes. Le dashboard est un shell démonstratif.

### Top 5 P0
1. **Fonctionnalités "Generate AI" / "Export PDF" sont des timeouts simulés** — GreenRoadmap, ESGReportGenerator, ROICalculator cliquent un bouton qui fait `setTimeout(() => setGenerating(false), 2000)` sans aucun appel backend
2. **dangerouslySetInnerHTML sur contenu i18n** — BlogArticle.tsx et Reputation.tsx injectent du HTML non sanitisé (risque XSS si les clés i18n sont compromises ou modifiées)
3. **Demo mode bypasse l'auth via localStorage** — `ProtectedRoute` vérifie `localStorage.getItem('growth_os_demo_mode')`, manipulation triviale par un utilisateur pour accéder au dashboard sans compte
4. **Tous les edge functions ont verify_jwt = false** — 40+ edge functions sans vérification JWT au niveau gateway (la validation est faite en code, mais c'est un risque si mal implémenté dans une seule fonction)
5. **Connectors Eco (Pennylane/Sage/QuickBooks) sont purement visuels** — le toggle "Connecté" est un `useState` local sans aucune persistance ni intégration réelle

### Top 5 P1
1. **Données hardcodées FR dans les composants Eco** — Labels "Chauffage & climatisation", "Année 1", "Facile", "Connecté", "Postuler" non traduits via i18n
2. **GreenKPIDashboard génère des données aléatoires à chaque render** — `Math.random()` dans la déclaration de module signifie que les charts changent à chaque re-render parent
3. **Hreflang pointe toutes les langues vers la même URL** — SEOHead génère `hrefLang="fr"`, `"en"`, `"es"` etc. pointant vers la même URL canonique sans distinction de path
4. **24+ providers imbriqués** — Malgré `composeProviders`, chaque provider monte son propre état/effet au boot, impactant le TTFB
5. **Eco route non service-gated** — `/dashboard/eco` n'a pas de `service` guard contrairement aux autres modules, n'importe quel utilisateur connecté y accède

---

## 2. TABLEAU D'AUDIT

| P | Domaine | Localisation | Problème | Risque | Recommandation | Faisable ? |
|---|---------|-------------|----------|--------|---------------|-----------|
| P0 | UX/Backend | GreenRoadmap, ESGReport | Boutons "Generate AI" / "Export PDF" = setTimeout fake | Fonctionnalité annoncée non opérationnelle | Ajouter toast explicite "Fonctionnalité en cours de développement" ou brancher sur ai-assistant | Oui |
| P0 | Security | BlogArticle.tsx, Reputation.tsx | dangerouslySetInnerHTML sur contenu i18n avec regex replace | XSS si clés i18n modifiées | Utiliser DOMPurify ou supprimer l'injection HTML | Oui |
| P0 | Auth | ProtectedRoute.tsx | localStorage bypass pour demo mode | Accès dashboard sans authentification | Ajouter validation côté serveur ou watermark clair | Oui (ajouter warning) |
| P0 | Backend | config.toml | 40+ edge functions verify_jwt = false | Endpoints exposés si auth code manquant | Confirmer chaque fonction valide le JWT en code | Non confirmé |
| P0 | UX | CarbonSankeyDiagram | Connectors Pennylane/Sage = useState local | Fausse promesse d'intégration | Labelliser clairement comme "Coming Soon" | Oui |
| P1 | i18n | Eco components | Textes hardcodés FR : "Facile", "Connecté", "Postuler", "Année 1" | UX cassée en anglais | Migrer vers clés t() | Oui |
| P1 | Performance | GreenKPIDashboard | Math.random() hors useMemo = re-génération à chaque render | Charts instables | Wrap dans useMemo ou useState init | Oui |
| P1 | SEO | SEOHead.tsx | hreflang identique pour toutes langues | SEO multilingue incorrect | Différencier les URLs par langue ou retirer | Oui |
| P1 | Frontend | SubsidyMatcher | URLs de subventions = "#" | Liens morts | Ajouter vrais liens ou disabled state | Oui |
| P1 | Auth | EcoTransition route | Pas de service guard | Incohérence avec le pattern des autres modules | Ajouter `service="eco"` ou justifier | Oui |
| P2 | Security | Auth.tsx | signup_data stocké en localStorage (email, nom, entreprise) | Fuite PII | Utiliser sessionStorage ou supprimer après consommation | Oui |
| P2 | Performance | App.tsx | 24 context providers montés au boot | Temps de montage initial élevé | Lazy-load providers non critiques | Non trivial |
| P2 | i18n | Eco composants | Labels de difficulté, scope labels, hardcodés en français | Pas de support multilingue | Ajouter clés i18n | Oui |
| P2 | UX | ROICalculator | `// TODO: Call generate-report edge function` | Feature incomplète | Brancher ou masquer le bouton | Oui |
| P2 | Frontend | competitive-intel-agent.ts | `// TODO: Implement real crawl` | Feature annoncée non implémentée | Documenter la limitation | Oui |
| P3 | SEO | SEOHead | og:locale hardcodé "fr_FR" | Incorrect pour utilisateurs EN/ES/DE | Dynamiser selon i18n.language | Oui |
| P3 | Accessibility | Eco components | Charts Recharts sans texte alternatif | Non accessible screen readers | Ajouter aria-label / sr-only descriptions | Oui |
| P3 | UX | GreenKPIDashboard | Tooltip style hardcodé dark theme | Cassé en light mode | Utiliser les CSS variables du thème | Oui |

---

## 3. DÉTAIL PAR CATÉGORIE

### A. Frontend & Rendu
- **Ce qui fonctionne** : Architecture solide (lazy loading, ErrorBoundary, Suspense fallback), routing cohérent, 404 page OK, composants UI bien structurés (shadcn/ui)
- **Ce qui est douteux** : Les 5 composants Eco sont purement visuels avec données demo. Le pattern est le même dans ~20 autres modules dashboard (données hardcodées présentées comme réelles)
- **Non confirmé** : Comportement en light mode des composants Eco (tooltip hardcodé dark)

### B. QA Fonctionnelle
- **Flux auth** : Login/Signup/Reset password bien structurés avec validation Zod, gestion d'erreurs, i18n. Social login (Google/Apple) via lovable OAuth
- **Flux dashboard** : Navigation fonctionne, workspace selector présent, sidebar responsive
- **Cassé** : Boutons "Generate AI" et "Export PDF" dans Eco sont des simulations. Bouton "Postuler" dans SubsidyMatcher pointe vers "#"

### C. Auth & Autorisations
- **Fonctionnel** : ProtectedRoute, PublicOnlyRoute, RBAC via user_roles table, session expiry monitoring, role-based nav filtering
- **Risque** : Demo mode bypass via localStorage est manipulable. Ce n'est pas un risque de sécurité grave car le dashboard ne contient que des données demo en mode non-authentifié, mais c'est un pattern fragile
- **Bien fait** : Rôles en table séparée, security definer functions avec search_path fixé

### D. APIs & Edge Functions
- **Architecture solide** : Auth partagée (_shared/auth.ts), CORS centralisé, permissions server-side
- **Risque** : Tous verify_jwt = false dans config.toml. La validation est faite en code — correct architecturalement mais nécessite vigilance
- **Non confirmé** : Fonctionnement réel de la majorité des edge functions (les edge function logs sont vides)

### E. Database & RLS
- **Bien fait** : Functions SECURITY DEFINER avec search_path = public, rate limiting triggers, audit log immutable, RBAC multi-workspace
- **Non confirmé** : Policies RLS effectives sur toutes les tables depuis l'interface

### F. Sécurité
- **Risques identifiés** : dangerouslySetInnerHTML (P0), localStorage PII (P2), demo mode bypass (P0)
- **Bien fait** : Token encryption AES-GCM, CORS whitelist, input validation Zod, rate limiting

### G. i18n
- **Couverture** : FR/EN bien couverts (~2500+ clés), ES/DE/IT/NL/PT partiels
- **Problème** : Composants Eco contiennent ~30 strings hardcodées en français non passées par t()

### H. SEO
- **Bien fait** : SEOHead avec structured data, meta tags, og tags, sitemap, robots.txt
- **Problème** : hreflang pointe vers même URL toutes langues, og:locale hardcodé FR

### I. Observabilité
- **Bien fait** : Sentry intégré, ErrorBoundary capture, audit logs, health score function, diagnostics panel, monitoring-metrics edge function

---

## 4. PLAN D'ACTION

### Corrections immédiates (P0) — à implémenter maintenant
1. Remplacer les boutons fake "Generate AI" / "Export PDF" des composants Eco par des toasts informatifs "Coming soon" ou brancher sur l'edge function existante `ai-assistant`
2. Sanitiser les dangerouslySetInnerHTML dans BlogArticle et Reputation (utiliser un simple text replace ou DOMPurify)
3. Ajouter un badge visuel clair sur les connectors Eco indiquant "Coming Soon"
4. Traduire les strings hardcodées critiques des composants Eco

### Corrections rapides (P1)
5. Fixer Math.random() dans GreenKPIDashboard avec useMemo
6. Corriger les liens "#" dans SubsidyMatcher
7. Fixer hreflang dans SEOHead (retirer si pas de routes localisées)
8. Ajouter service guard sur la route Eco

### Améliorations (P2-P3)
9. Supprimer signup_data de localStorage après consommation
10. Dynamiser og:locale selon la langue
11. Ajouter aria-labels aux charts Recharts
12. Fixer tooltip styles pour light mode

### Hors scope immédiat (décisions produit requises)
- Intégrations réelles Pennylane/Sage/QuickBooks (APIs tierces, secrets nécessaires)
- Export PDF CSRD réel (librairie PDF côté client ou edge function)
- Activation Stripe live (secret keys, webhook config)
- Crawl réel des concurrents (infrastructure, coûts)

