

# Correction du warning React Router v6 deprecation

## Probleme

React Router v6.4+ affiche des warnings de deprecation pour preparer la migration vers v7. Il faut activer les "future flags" dans le `BrowserRouter` pour supprimer ces warnings et preparer le code.

## Correction

**Fichier** : `src/App.tsx` (ligne 279)

Remplacer :
```tsx
<BrowserRouter>
```

Par :
```tsx
<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
```

Ces deux flags sont les future flags standard de React Router v6 pour preparer la migration v7 :
- `v7_relativeSplatPath` : change la resolution des chemins relatifs dans les routes splat (`*`)
- `v7_startTransition` : enveloppe les mises a jour de navigation dans `React.startTransition` pour de meilleures performances

**Effort** : 2 min, 1 ligne modifiee.

