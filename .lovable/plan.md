
# Plan d'action : Correction critique connexion + securite

## Probleme #1 (CRITIQUE) : L'app ne se connecte pas au backend

**Diagnostic** : Les requetes reseau vont vers `placeholder.supabase.co` au lieu du vrai serveur. La cause est dans `vite.config.ts` lignes 26-30 : le bloc `define` ecrase les variables d'environnement injectees par Lovable Cloud avec des chaines vides (car il n'y a pas de fichier `.env` local).

**Correction** : Supprimer le bloc `define` de `vite.config.ts`. Lovable Cloud injecte automatiquement les variables `VITE_SUPABASE_*` -- le bloc `define` interfere avec ce mecanisme.

---

## Probleme #2 (SECURITE) : Politiques RLS oauth_tokens redondantes

**Diagnostic** : La table `oauth_tokens` a plus de 10 politiques RLS qui se chevauchent (oauth_tokens_owner_only, oauth_tokens_owner_strict, oauth_tokens_owner_only_v5, etc.). Toutes verifient `is_workspace_owner()` mais la redondance cree de la confusion et un risque de faille si une politique plus permissive est ajoutee.

**Correction** : Migration SQL pour :
- Supprimer toutes les politiques existantes sur `oauth_tokens`
- Creer 4 politiques propres (SELECT, INSERT, UPDATE, DELETE) toutes basees sur `is_workspace_owner()` via la table `integrations`

---

## Probleme #3 (SECURITE) : Acces leads trop large

**Diagnostic** : `has_sales_access()` accorde l'acces aux roles `owner`, `admin` et `manager`. C'est un choix fonctionnel acceptable pour un CRM. Le scan le signale comme erreur mais les politiques sont coherentes.

**Action** : Marquer comme revise/accepte dans le tableau de bord securite avec justification.

---

## Probleme #4 (SECURITE) : performance_reviews acces HR

**Diagnostic** : `has_hr_access()` limite deja aux roles `owner` et `admin` uniquement. La politique `perf_reviews_strict_access` ajoute l'acces a l'employe concerne et au reviewer direct. C'est correct.

**Action** : Marquer comme revise/accepte dans le tableau de bord securite.

---

## Resume des fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `vite.config.ts` | Supprimer le bloc `define` (lignes 26-30) |
| Migration SQL | Consolider les politiques RLS de `oauth_tokens` |
| Tableau securite | Mettre a jour les findings revises |

## Ordre d'execution

1. Corriger `vite.config.ts` (restaure la connexion backend)
2. Appliquer la migration SQL (consolide les politiques oauth_tokens)
3. Mettre a jour les findings securite
4. Verifier que l'app se connecte correctement
