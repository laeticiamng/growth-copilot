# Audit technique — 2026-02-10

## Stack détectée
- Front-end: React 18 + TypeScript + Vite + TailwindCSS.
- Data/Auth/Backend: Supabase (Edge Functions + SQL migrations + RLS).
- Qualité: ESLint + Vitest.

## Vérifications exécutées
1. `npm ci`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

## État global
- Le projet compile (build Vite OK), mais une partie des tests échoue dans cet environnement faute de variables Supabase (`supabaseUrl is required`).
- Le lint global est en échec (beaucoup de dettes historiques, principalement `@typescript-eslint/no-explicit-any` et warnings React Hooks).
- Vulnérabilités npm signalées: 8 (`npm audit` non appliqué automatiquement pour éviter les régressions inattendues).

## Élément incomplet complété
### `supabase/functions/sync-meta-ads/index.ts`
Statut avant:
- L’endpoint renvoyait un succès factice avec des compteurs à 0.
- Le code contenait un `TODO` de synchronisation réelle.

Statut après:
- Authentification + contrôle d’accès workspace conservés.
- Récupération et déchiffrement du token OAuth via helper partagé.
- Appel Meta Graph API réel:
  - `/me/adaccounts`
  - `/{ad_account_id}/campaigns`
- Upsert des comptes publicitaires dans `meta_ad_accounts`.
- Upsert des campagnes dans `meta_campaigns`.
- Mise à jour de `integrations.last_sync_at`.
- Retour de compteurs réels (`accounts`, `campaigns`).

## Risques / points à traiter ensuite
1. Réduire la dette lint (beaucoup d’erreurs/warnings non introduits par ce changement).
2. Ajouter pagination complète et sync adsets/ads/insights pour `sync-meta-ads`.
3. Ajouter tests dédiés de l’edge function `sync-meta-ads` (mock API Meta + assertions DB).
4. Planifier une correction progressive des vulnérabilités npm.
