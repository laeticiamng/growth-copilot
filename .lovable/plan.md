

# Plan d'execution : 8 tickets production-ready Growth Copilot

## Etat actuel (audit du code)

Apres inspection complete du code, voici le statut reel de chaque ticket :

| # | Ticket | Statut | Action requise |
|---|--------|--------|----------------|
| 1 | .env override | 90% fait | Ajouter runtime guard anti-placeholder |
| 2 | Env validation + fallback | 80% fait | Ajouter composant EnvGuard dans App.tsx |
| 3 | oauth_tokens RLS | DONE | Migration deja appliquee |
| 4 | Code splitting | DONE | Toutes routes utilisent lazy() |
| 5 | Vendor splitting + i18n | DONE | 7 manualChunks configures |
| 6 | PWA | DONE | SW versione, cache-first/network-first |
| 7 | SEO | DONE | robots.txt, sitemap, OG corrects |
| 8 | CI guardrails | A faire | Tests anti-regression a creer |

## Actions a implementer

### Action 1 : Runtime guard anti-placeholder (Ticket 1)

Creer un composant `EnvGuard` qui detecte `placeholder.supabase.co` au runtime et bloque le rendu avec un message explicite au lieu de laisser des requetes echouer silencieusement.

**Fichier** : `src/components/EnvGuard.tsx`
- Importer `isSupabaseConfigured` depuis le client auto-genere
- Si non configure : afficher un ecran d'erreur bilingue (FR/EN) avec instructions
- Si configure : rendre les children normalement

**Fichier modifie** : `src/App.tsx`
- Envelopper `InnerProviders` avec `EnvGuard` pour bloquer toute interaction backend si les variables sont absentes

### Action 2 : Tests anti-regression (Ticket 8)

Creer un fichier de tests Vitest validant les garde-fous critiques :

**Fichier** : `src/test/env-guardrails.test.ts`
- Test 1 : Verifier que `vite.config.ts` ne contient pas de bloc `define`
- Test 2 : Verifier que `.gitignore` contient `.env`
- Test 3 : Verifier que `robots.txt` exclut `/dashboard/` et `/auth`
- Test 4 : Verifier que `sitemap.xml` ne contient pas `/dashboard` ni `/auth`
- Test 5 : Verifier que `public/sw.js` contient un cache versione

### Section technique

```text
Flux de demarrage apres modification :

main.tsx (try/catch)
  --> App.tsx
    --> EnvGuard (check isSupabaseConfigured)
      --> Si KO : ecran erreur FR/EN
      --> Si OK : InnerProviders + Routes
```

Le composant `EnvGuard` utilise le flag `isSupabaseConfigured` deja exporte par le client auto-genere. Aucune modification du fichier `client.ts` (interdit).

Les tests lisent les fichiers source au format texte via `fs.readFileSync` pour valider la structure statique du projet sans executer de build.

