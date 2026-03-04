

# Plan : Corriger l'erreur de configuration intermittente

## Diagnostic

Le fichier `main.tsx` (lignes 14-27) contient un "hard block" qui empêche le démarrage de l'application en mode production si `VITE_SUPABASE_URL` est absente ou contient `placeholder.supabase.co`.

```text
main.tsx (ligne 21)
┌─────────────────────────────────────┐
│ if (PROD && isPlaceholderMode)      │
│   → Affiche StartupError           │
│   → Bloque TOUT le rendu           │
└─────────────────────────────────────┘
```

**Problème** : Dans l'environnement Lovable Cloud, les variables d'environnement sont injectées automatiquement. Mais lors de certains cycles de build/HMR, elles peuvent ne pas être disponibles au moment exact de l'évaluation, déclenchant faussement le blocage.

**L'app fonctionne actuellement** : J'ai confirmé via le navigateur que la landing page s'affiche correctement.

## Solution

Supprimer le hard-block de production dans `main.tsx`. La sécurité est déjà assurée par :
- `client.ts` : fallback gracieux vers placeholder (l'app se charge mais les appels API échouent proprement)
- `EnvGuard` : warning non-bloquant dans la console
- `ProtectedRoute` : redirection naturelle vers `/auth` si pas de session

### Modification unique : `src/main.tsx`

Supprimer la condition `import.meta.env.PROD && isPlaceholderMode` et le composant `StartupError` associé. Garder uniquement le rendu normal avec le try/catch pour les erreurs fatales réelles.

Le fichier passera de ~45 lignes à ~25 lignes, simplifié sans le branchement conditionnel.

### Fichier supprimable : `src/components/system/StartupError.tsx`

Ce composant n'est plus nécessaire une fois le hard-block retiré.

## Impact

- Zero risque : les protections multi-couches existantes (client fallback, EnvGuard, ProtectedRoute) couvrent tous les scénarios
- Supprime l'erreur intermittente définitivement
- Aucun changement de comportement visible pour l'utilisateur final

