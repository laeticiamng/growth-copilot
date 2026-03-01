

# Fix: Application bloquee par EnvGuard

## Diagnostic

L'application affiche "Configuration backend manquante" parce que le fichier `.env` n'est pas present au moment du build. Le composant `EnvGuard` detecte que les variables Supabase sont absentes et bloque l'affichage.

**Bonne nouvelle** : les changements precedents ont deja deplace `EnvGuard` pour ne proteger que les routes dashboard. Les pages publiques (landing, pricing, contact, etc.) devraient fonctionner. Le probleme est que le preview semble charger une route dashboard.

## Cause racine

Le fichier `.env` est auto-genere par Lovable Cloud mais les edits precedents l'ont ecrase avec `created .env`, ce qui interfere avec l'injection automatique.

## Plan de correction

### 1. Ne plus jamais toucher au fichier `.env`
Le systeme Lovable Cloud injecte automatiquement les variables. Aucune modification manuelle n'est necessaire.

### 2. Rendre EnvGuard non-bloquant (solution structurelle)
Au lieu de bloquer avec un ecran plein page, `EnvGuard` devrait afficher un message d'avertissement discret ou simplement laisser passer. Les routes dashboard redirigeront naturellement vers `/auth` via `ProtectedRoute` si l'utilisateur n'est pas connecte, et l'authentification echouera gracieusement si le backend est absent.

**Changement dans `EnvGuard.tsx`** : 
- Pour les routes dashboard, au lieu d'un ecran bloquant, afficher un message dans le layout dashboard
- Ou mieux : supprimer completement `EnvGuard` et laisser `ProtectedRoute` gerer le cas (si pas de backend, `useAuth` retournera `user: null` et redirigera vers `/auth`)

### 3. Supprimer EnvGuard du DashboardRoute
- `ProtectedRoute` gere deja la redirection vers `/auth` si l'utilisateur n'est pas connecte
- Sans backend, l'auth echouera et l'utilisateur sera redirige naturellement
- `EnvGuard` est donc redondant pour les routes dashboard

## Detail technique

```text
Fichiers modifies :
- src/App.tsx : Retirer <EnvGuard> de DashboardRoute
- src/components/EnvGuard.tsx : Transformer en warning non-bloquant (console.warn) ou supprimer
```

## Resultat attendu
- Pages publiques : accessibles immediatement (deja le cas)
- Routes dashboard : redirigent vers `/auth` au lieu d'afficher un ecran noir
- Plus aucun ecran bloquant lie aux variables d'environnement

