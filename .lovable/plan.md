

# Plan d'implementation - 8 Tickets P0-P2

## Etat actuel analyse

### Ce qui est deja fait
- **EnvGuard** : deja non-bloquant (console.warn), `client.ts` a deja un fallback placeholder
- **main.tsx** : deja un try/catch avec ecran d'erreur de demarrage
- **oauth_tokens RLS** : deja 4 policies propres (SELECT/INSERT/UPDATE/DELETE) basees sur `is_workspace_owner` via jointure `integrations` -- **conforme, rien a faire**
- **Code splitting** : toutes les routes dashboard sont deja `lazy()` dans App.tsx
- **Vendor splitting** : deja configure dans `vite.config.ts` (react, ui, charts, supabase, query, i18n, sentry, forms)
- **i18n lazy load** : deja implemente (FR synchrone, EN/ES/DE en lazy)
- **SW versionnne** : deja en place (`growth-os-v2.0.0`, cache-busting, network-first, SPA fallback offline)
- **SEOHead hreflang** : deja present (fr/en/es/de/x-default)
- **robots.txt** : deja correct (disallow /dashboard/, /auth, /onboarding, /link/, /demo-oauth)
- **sitemap.xml** : deja propre (uniquement pages publiques, 0 routes privees)

### Ce qui reste a corriger

| # | Ticket | Statut | Action requise |
|---|--------|--------|---------------|
| 1 | EnvGuard anti-placeholder | Partiel | Ajouter detection `placeholder.supabase.co` dans `client.ts` avec erreur explicite en prod |
| 2 | Ecran fallback env vars | Partiel | Ameliorer le guard pour detecter placeholder au runtime et afficher `StartupError` |
| 3 | RLS oauth_tokens | **FAIT** | 4 policies strictes deja en place |
| 4 | RLS leads + performance_reviews | A nettoyer | Policies redondantes a supprimer (doublons SELECT, INSERT, UPDATE, DELETE) |
| 5 | Code splitting routes | **FAIT** | Toutes routes deja lazy |
| 6 | Vendor splitting + i18n lazy | **FAIT** | Deja configure |
| 7 | PWA SW | **FAIT** | Deja versionnne avec cache-busting |
| 8 | SEO robots/sitemap/hreflang | **FAIT** | Deja correct |

---

## Corrections a implementer

### Ticket 1+2 : EnvGuard + Startup Error (merge en 1 tache)

**`src/integrations/supabase/client.ts`** : Ajouter une detection explicite du placeholder :
```typescript
export const isPlaceholderMode = SUPABASE_URL?.includes('placeholder.supabase.co') || !SUPABASE_URL;
```
En production (`import.meta.env.PROD`), si placeholder detecte, throw une erreur explicite qui sera captee par le try/catch de `main.tsx`.

**`src/components/system/StartupError.tsx`** (nouveau) : Composant d'erreur bilingue (FR/EN) avec bouton "Recharger", affiche quand les env vars sont absentes ou placeholder en prod.

**`src/main.tsx`** : Importer le guard et afficher `StartupError` si placeholder detecte en prod, au lieu du fallback HTML inline actuel.

### Ticket 4 : RLS leads + performance_reviews (nettoyage doublons)

Migration SQL pour supprimer les policies redondantes :

**Table `leads`** (9 policies → 4) :
- Garder : `leads_sel_strict`, `leads_ins_strict`, `leads_upd_strict`, `leads_del_strict`
- Supprimer : `leads_select`, `leads_assigned_or_manager`, `leads_insert`, `leads_update`, `leads_delete`

**Table `performance_reviews`** (7 policies → 4) :
- Garder : `perf_reviews_strict_access`, `performance_reviews_write_hr_v8`, `performance_reviews_update_v8`, `performance_reviews_delete`
- Supprimer : `performance_reviews_select`, `performance_reviews_insert`, `performance_reviews_update`

### Ticket 6 complement : i18n IT/NL/PT manquants

Les locales IT, NL, PT existent comme fichiers mais ne sont pas dans `supportedLngs` ni dans `lazyResources`. Les ajouter au lazy loading dans `src/i18n/index.ts`.

### Ticket 8 complement : sitemap lastmod + OG verif

Mettre a jour les `lastmod` du sitemap a `2026-03-03` (date actuelle). Ajouter `/install` et `/sales-terms` manquants dans le sitemap.

---

## Fichiers a modifier

| Fichier | Action |
|---------|--------|
| `src/integrations/supabase/client.ts` | Ajouter `isPlaceholderMode` export |
| `src/components/system/StartupError.tsx` | Creer composant erreur bilingue |
| `src/main.tsx` | Integrer detection placeholder en prod |
| `src/i18n/index.ts` | Ajouter IT/NL/PT au lazy loading + supportedLngs |
| `public/sitemap.xml` | Ajouter /install, /sales-terms, maj lastmod |
| Migration SQL | Supprimer 10 policies RLS redondantes sur leads + performance_reviews |

## Estimation totale : ~3h (vs 19.5h si tout etait a faire)

La majorite des tickets (3, 5, 6, 7, 8) sont deja implementes. Seuls les tickets 1+2 (merge), 4 (nettoyage RLS), et les complements i18n/sitemap necessitent du travail.

