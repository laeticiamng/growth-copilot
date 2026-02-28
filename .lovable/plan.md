
# Plan d'implementation -- 8 tickets audit

## Analyse de l'existant

Apres inspection du code actuel, voici le statut de chaque ticket :

| # | Ticket | Statut actuel |
|---|--------|--------------|
| 1 | Fix .env / placeholder | **Partiellement fait** -- `vite.config.ts` corrige, mais `client.ts` (auto-genere) utilise encore le fallback `placeholder.supabase.co`. Ce fichier ne peut PAS etre edite (auto-genere par Lovable Cloud). Le vrai probleme est que les env vars ne sont pas injectees au build. |
| 2 | Hardening env vars / startup error page | **Deja fait** -- `main.tsx` a un try/catch avec page d'erreur, `ErrorBoundary` existe, `client.ts` a un flag `isSupabaseConfigured` |
| 3 | RLS oauth_tokens consolidation | **Deja fait** -- Migration appliquee (4 policies propres) |
| 4 | RLS leads + performance_reviews | **Deja fait** -- Findings marques reviewed/accepted |
| 5 | Lazy routes + code splitting | **Deja fait** -- Toutes les routes dashboard utilisent `React.lazy()` + `Suspense` |
| 6 | Vendor splitting + i18n lazy | **Deja fait** -- `manualChunks` configure, i18n lazy-load implemente |
| 7 | PWA manifest + SW cache-busting | **Deja fait** -- Icons maskable, SW versione, cache-first/network-first |
| 8 | SEO/PWA hygiene | **Partiellement fait** -- robots.txt et sitemap OK, mais OG image pointe vers `lovable.dev` |

## Actions restantes (2 items)

### Action 1 : Corriger l'image OG (Ticket 8)

**Fichier** : `src/components/SEOHead.tsx` ligne 19

Le default `ogImage` pointe vers `https://lovable.dev/opengraph-image-p98pqg.png`. Cela doit pointer vers le domaine de production ou une image hebergee dans le bucket `cms-media`.

**Modification** : Changer la valeur par defaut de `ogImage` vers `https://www.agent-growth-automator.com/og-image.png` et ajouter une image OG dans `/public/og-image.png` (ou utiliser le placeholder existant en attendant une vraie image).

### Action 2 : Supprimer le fichier .env (Ticket 1 -- prevention)

Le fichier `.env` est auto-genere par Lovable Cloud et ne doit jamais etre cree manuellement. Le systeme le recree automatiquement avec les bonnes valeurs. Le probleme de `placeholder.supabase.co` dans les requetes reseau vient probablement d'un cycle de build qui n'a pas encore pris en compte la suppression du bloc `define` dans `vite.config.ts`. Un rebuild devrait resoudre cela.

**Verification** : Apres le prochain build, confirmer que les requetes ne vont plus vers `placeholder.supabase.co`.

---

## Resume

6 des 8 tickets sont deja completement implementes. Les 2 actions restantes sont mineures :
1. Remplacer l'image OG par defaut (1 ligne dans `SEOHead.tsx` + ajouter image)
2. Verifier que la connexion backend fonctionne apres rebuild (le fix `vite.config.ts` est deja applique)

Temps estime : 15-30 minutes.
