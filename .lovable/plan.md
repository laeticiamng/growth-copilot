

# Audit Technique Senior Developer - Round 5

## Resume Executif

Apres analyse approfondie du codebase (hooks, providers, layout, routing, securite, patterns), j'ai identifie **12 problemes techniques** classes par severite. Les corrections visent la stabilite, la performance et la maintenabilite.

---

## Problemes Identifies

### P0 - Critiques (Bugs / Risques de crash)

#### 1. Double OfflineBanner - Rendu en double
**Fichiers:** `src/App.tsx` (ligne 218) + `src/components/layout/DashboardLayout.tsx` (ligne 339)

Deux composants `OfflineBanner` differents sont rendus simultanement :
- `App.tsx` importe depuis `error-helpers.tsx` (position bottom)
- `DashboardLayout.tsx` importe depuis `offline-banner.tsx` (position top fixed z-100)

**Impact:** Deux bannieres hors-ligne affichees en meme temps sur les pages dashboard. Duplication de listeners `online`/`offline`.

**Correction:** Supprimer le `OfflineBanner` de `App.tsx` (le DashboardLayout gere deja les pages protegees, et les pages publiques n'ont pas besoin d'un banner offline persistant).

---

#### 2. QueryClient sans configuration - Aucun retry/staleTime global
**Fichier:** `src/App.tsx` (ligne 124)

```typescript
const queryClient = new QueryClient(); // Zero config
```

Le QueryClient est instancie sans `defaultOptions`. Cela signifie :
- 3 retries automatiques par defaut sur les erreurs 4xx (inclus 401/403)
- `staleTime: 0` partout (re-fetch a chaque mount)
- Pas de `gcTime` global

**Impact:** Requetes inutiles, retries sur des erreurs d'auth, surcharge reseau.

**Correction:** Configurer le QueryClient avec des defaults raisonnables :
- `staleTime: 5 * 60 * 1000` (5 min)
- `retry: (count, error) => count < 2 && !isAuthError(error)`
- `refetchOnWindowFocus: false`

---

#### 3. useSites - useEffect avec dependance objet (infinite loop risk)
**Fichier:** `src/hooks/useSites.tsx` (ligne 76-78)

```typescript
useEffect(() => {
  fetchSites();
}, [currentWorkspace]); // Object reference changes on every render
```

`currentWorkspace` est un objet. Sa reference change a chaque re-render du provider parent, causant potentiellement des re-fetches en cascade.

**Impact:** Requetes en boucle, latence, surcharge API.

**Correction:** Utiliser `currentWorkspace?.id` comme dependance.

---

#### 4. useRealtimeSubscription - Instabilite du callback dans les deps
**Fichier:** `src/hooks/useRealtimeSubscription.tsx` (ligne 42)

```typescript
const subscribe = useCallback(() => { ... }, [channelName, config, onPayload, enabled]);
```

`config` (objet) et `onPayload` (callback) changent a chaque render de l'appelant, causant des subscribe/unsubscribe en boucle du channel Realtime.

**Impact:** Connexions WebSocket instables, messages perdus, memory leaks.

**Correction:** Utiliser `useRef` pour `onPayload` et serialiser `config` pour la stabilite des deps.

---

### P1 - Importants (Performance / DX)

#### 5. DashboardLayout - advancedDepartments recalcule sans deps stables
**Fichier:** `src/components/layout/DashboardLayout.tsx` (lignes 210-211, 244, 262)

`useMemo` sur `filteredMainItems` a `[hasService]` comme dep, mais `hasService` est un `useCallback` qui depend de `enabledSlugs` (un `Set` recree a chaque render dans `useServices`).

**Impact:** Le memo est invalide a chaque render, annulant son benefice.

**Correction:** Stabiliser `enabledSlugs` dans `useServices` avec `useMemo` sur les IDs.

---

#### 6. useWorkspace - eslint-disable sur les deps de useEffect
**Fichier:** `src/hooks/useWorkspace.tsx` (lignes 63-66)

```typescript
useEffect(() => {
  fetchWorkspaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.id]);
```

`fetchWorkspaces` n'est pas dans les deps et n'est pas wrappee dans `useCallback`. Si `fetchWorkspaces` capture des closures stales, les donnees affichees seront incorrectes.

**Impact:** Donnees potentiellement stale apres changement de workspace.

**Correction:** Wrapper `fetchWorkspaces` dans `useCallback` avec les bonnes deps, supprimer le `eslint-disable`.

---

#### 7. useSessionExpiry - Textes toast hardcodes en francais
**Fichier:** `src/hooks/useSessionExpiry.tsx` (lignes 36-38, 52-54)

Les messages "Session expiree" et "Session expire bientot" sont hardcodes en francais, sans passer par i18n.

**Impact:** Incoherence linguistique en mode anglais.

**Correction:** Passer les textes via i18n dans le composant appelant ou ajouter `useTranslation` au hook.

---

#### 8. ErrorBoundary et error-helpers - Textes non traduits
**Fichiers:** `src/components/ErrorBoundary.tsx`, `src/components/ui/error-helpers.tsx`

Tous les textes sont en francais uniquement :
- "Une erreur inattendue s'est produite"
- "Recharger la page"
- "Hors ligne"
- "Reessayer"

**Impact:** Experience cassee pour les utilisateurs anglophones en cas d'erreur.

**Correction:** Integrer i18n. Note : le `ErrorBoundary` est un class component, donc il faut soit wrapper les textes dans un composant fonctionnel interne, soit utiliser `i18next.t()` directement.

---

### P2 - Normal (Qualite de code / Maintenabilite)

#### 9. Deux implementations OfflineBanner en parallele
**Fichiers:** `src/components/ui/error-helpers.tsx` et `src/components/ui/offline-banner.tsx`

Deux fichiers exportent un composant `OfflineBanner` avec des implementations differentes (positions, styles, hooks utilises). C'est du code mort / duplique.

**Correction:** Supprimer `error-helpers.tsx::OfflineBanner` ou unifier les deux dans un seul fichier. Garder `offline-banner.tsx` comme source unique.

---

#### 10. useGenericCRUD - Type safety contournee avec `as unknown as`
**Fichier:** `src/hooks/useGenericCRUD.tsx` (lignes 186-188, 206-208, 226-228)

Les operations `insert`, `update`, `delete` sont castees avec `as unknown as { insert: ... }`, contournant completement le type system de Supabase.

**Impact:** Aucune detection d'erreur de typage a la compilation, bugs silencieux possibles.

**Correction:** Utiliser des generics corrects avec `Database['public']['Tables'][T]['Insert']` etc, ou au minimum documenter les raisons du contournement.

---

#### 11. DemoModeProvider non utilise dans App.tsx
**Fichier:** `src/hooks/useDemoMode.tsx`

Le `DemoModeProvider` est defini mais n'est pas inclus dans l'arbre de providers dans `App.tsx`. Tout appel a `useDemoMode()` plantera avec "must be used within a DemoModeProvider".

**Impact:** Crash si un composant utilise `useDemoMode()`.

**Correction:** Soit ajouter le provider dans `App.tsx`, soit verifier qu'aucun composant ne l'appelle (et le supprimer si inutile).

---

#### 12. RLS Policy `USING (true)` detectee par le linter Supabase
**Source:** Supabase linter

Une politique RLS utilise `USING (true)` sur une operation INSERT/UPDATE/DELETE, ce qui rend la table accessible a tout utilisateur authentifie.

**Impact:** Risque de securite - donnees accessibles sans filtre workspace.

**Correction:** Auditer la politique concernee et remplacer par un filtre `workspace_id` ou role-based.

---

## Corrections Techniques a Implementer

| # | Fichier | Correction | Priorite |
|---|---------|-----------|----------|
| 1 | `src/App.tsx` | Supprimer `OfflineBanner` import et rendu | P0 |
| 2 | `src/App.tsx` | Configurer `QueryClient` avec defaultOptions | P0 |
| 3 | `src/hooks/useSites.tsx` | Changer dep `currentWorkspace` en `currentWorkspace?.id` | P0 |
| 4 | `src/hooks/useRealtimeSubscription.tsx` | Stabiliser deps avec useRef pour callback | P0 |
| 5 | `src/hooks/useServices.tsx` | Stabiliser `enabledSlugs` avec useMemo | P1 |
| 6 | `src/hooks/useWorkspace.tsx` | Wrapper fetchWorkspaces dans useCallback | P1 |
| 7 | `src/hooks/useSessionExpiry.tsx` | Ajouter i18n pour les messages toast | P1 |
| 8 | `src/components/ErrorBoundary.tsx` + `error-helpers.tsx` | Integrer i18n | P1 |
| 9 | `src/components/ui/error-helpers.tsx` | Supprimer OfflineBanner duplique | P2 |
| 10 | `src/hooks/useGenericCRUD.tsx` | Documenter/ameliorer les type casts | P2 |
| 11 | `src/App.tsx` ou `src/hooks/useDemoMode.tsx` | Ajouter provider ou nettoyer code mort | P2 |
| 12 | Database RLS | Auditer et corriger la politique permissive | P2 |

---

## Details d'Implementation

### QueryClient Configuration (P0)
```text
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error?.message?.includes('401') || error?.message?.includes('403')) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
})
```

### useRealtimeSubscription Fix (P0)
Utiliser `useRef` pour le callback `onPayload` afin d'eviter les re-subscriptions :
```text
const onPayloadRef = useRef(onPayload);
onPayloadRef.current = onPayload;
// Dans subscribe: onPayloadRef.current(payload)
```

### ErrorBoundary i18n (P1)
Le class component ne peut pas utiliser `useTranslation`. Solution: importer `i18next` directement :
```text
import i18next from 'i18next';
// Dans render: i18next.t('errorBoundary.title')
```

---

## Resume

- 12 problemes identifies (4 P0, 4 P1, 4 P2)
- 10 fichiers a modifier
- Focus principal: stabilite React (deps, memoization), performance (QueryClient), coherence (OfflineBanner duplique)
- 1 audit RLS a effectuer

