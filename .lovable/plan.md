

# Plan d'implementation - 8 Tickets P0-P2 (Etat reel)

## Analyse de l'existant

Apres inspection complete du code et de la base de donnees, voici le statut reel de chaque ticket :

| # | Ticket | Statut | Reste a faire |
|---|--------|--------|---------------|
| 1 | EnvGuard anti-placeholder | **FAIT** | `isPlaceholderMode` + `StartupError` deja en place dans `main.tsx` |
| 2 | Validation env vars + fallback | **FAIT** | `StartupError.tsx` existe, `main.tsx` bloque en prod si placeholder |
| 3 | RLS leads + performance_reviews | **FAIT** | `leads` : 4 policies (`_sel/_ins/_upd/_del_strict`). `performance_reviews` : 4 policies (`perf_reviews_strict_access`, `write_hr_v8`, `update_v8`, `delete`) |
| 4 | Bundle / code splitting | **FAIT** | Routes lazy, vendor splitting configure dans `vite.config.ts` |
| 5 | i18n lazy 7 langues | **FAIT** | `supportedLngs` inclut les 7 langues, `lazyResources` couvre EN/ES/DE/IT/NL/PT |
| 6 | PWA SW versionnne | **FAIT** | `sw.js` versionnne (`growth-os-v2.0.0`), cache-busting, network-first, offline SPA fallback |
| 7 | Pricing post-audit | **FAIT** | `PricingPage.tsx` utilise `t()`, Navbar+Footer inclus, use cases factuels (pas de faux temoignages), ROI calculator avec palier a la carte |
| 8 | SEO hreflang | **PARTIEL** | `SEOHead` a hreflang fr/en/es/de/x-default mais **manque it/nl/pt** |

## Seule correction requise

### Ticket 8 : Ajouter hreflang IT/NL/PT dans SEOHead

Le composant `SEOHead.tsx` ne genere des balises `hreflang` que pour 4 langues (fr, en, es, de) + x-default. Il faut ajouter `it`, `nl`, `pt` pour correspondre aux 7 langues supportees.

**Fichier** : `src/components/SEOHead.tsx` (lignes 51-58)

**Modification** : Ajouter 3 balises `<link rel="alternate">` pour it, nl, pt dans le bloc hreflang existant.

### Estimation : ~10 minutes

Tous les autres tickets sont deja entierement implementes. Le projet est quasiment "go-live ready".

