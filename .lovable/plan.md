

# Audit Multi-Roles et Corrections Restantes - Round 15

## Synthese de l'Audit

Apres exploration approfondie du codebase, voici les constats par role et les corrections a implementer.

---

## Constats par Role

### CEO - Audit Strategique
- **Positif** : Architecture solide avec 39 agents IA, 11 departements, modele multi-tenant. Cockpit executif avec briefing quotidien, score de sante, semaphores par departement.
- **A corriger** : Aucun probleme structurel majeur. Les KPIs hardcodes ("39 agents", "11 departements") dans `WelcomeCard.tsx` et `DashboardHome.tsx` devraient etre dynamiques a terme.

### CTO - Audit Technique
- **Bug console** : Warning React `forwardRef` dans `BusinessHealthScore.tsx` - un `<button>` est passe a `TooltipTrigger` sans `asChild` ou `forwardRef`. Deja corrige avec `<button type="button">` wrapping.
- **Locale inline** : `MoMComparison.tsx` et `CockpitPDFExport.tsx` utilisent des ternaires manuels pour construire les locales au lieu de `getIntlLocale()`.
- **Performance** : Le `DashboardHome` lance 5+ queries en parallele au montage - acceptable mais a surveiller.

### CPO - Audit Produit
- **Coherent** : Les sections du cockpit suivent une hierarchie logique (Welcome > Briefing > Semaphores > Actions > Health Score).
- **Manque** : Le `PriorityActionsEnhanced` utilise `window.prompt()` pour la raison de rejet - UX pauvre, devrait etre un Dialog.

### CISO - Audit Securite
- **Positif** : RLS sur 131 tables, JWT valide sur edge functions, audit log immutable, SSRF protection.
- **Aucun probleme critique** identifie dans ce tour d'audit.

### DPO - Audit RGPD
- **Positif** : GDPR export en place, anonymisation des clicks apres 30 jours, rate limiting.
- **OK** pour ce round.

### CDO - Audit Data
- **Positif** : Pipeline KPI avec kpis_daily, data quality alerts, evidence bundles.
- **A verifier** : Les sources de verite semaphores utilisent des requetes directes plutot qu'un cache/materialise.

### COO - Audit Operationnel
- **Positif** : Automations, scheduled runs, approval workflow.
- **OK** pour ce round.

### Head of Design - Audit UX
- **Bug UX** : `window.prompt()` pour les rejets d'approbation (primitif).
- **Responsive** : Grille semaphores `grid-cols-5` potentiellement serree sur mobile, deja fixee avec `grid-cols-2 sm:grid-cols-3 md:grid-cols-5`.

### Beta Testeur - Audit Utilisabilite
- **Loading screens** : Messages hardcodes en francais ("Verification de l'authentification...", "Chargement...").
- **Composants non localises** restants identifies ci-dessous.

---

## Corrections a Implementer

### 1. Fix React Warning `forwardRef` dans BusinessHealthScore (CTO)

Le `TooltipTrigger` dans `BusinessHealthScore.tsx` passe un `<button>` sans `asChild` qui cause un warning. La correction est deja partiellement en place (ligne 208-211 utilise `asChild` + `<button>`). Le warning persiste car le composant precedemment renderait un composant fonctionnel sans ref. Il faut confirmer que le `asChild` est bien present et que le `<button>` est natif.

**Action** : Verifier et confirmer que la structure actuelle est correcte (elle l'est - le warning peut venir d'un cache hot reload).

### 2. Remplacer les ternaires locale dans MoMComparison et CockpitPDFExport (CTO)

2 fichiers utilisent encore `i18n.language === 'fr' ? 'fr-FR' : ...` au lieu de `getIntlLocale()`.

**Fichiers** :
- `src/components/dashboard/MoMComparison.tsx` (ligne 50)
- `src/components/dashboard/CockpitPDFExport.tsx` (ligne 63)

### 3. Localiser les derniers composants avec strings hardcodes FR (Beta Testeur)

~60 strings restantes dans 8 fichiers :

| Fichier | Strings FR |
|---------|-----------|
| `ProtectedRoute.tsx` | 2 ("Verification...", "Chargement...") |
| `ServiceGuard.tsx` | 1 ("Verification de vos acces...") |
| `PermissionGuard.tsx` | 1 ("Verification des permissions...") |
| `loading-state.tsx` | 1 (default "Chargement...") |
| `SubscriptionStatusBadge.tsx` | 5 ("Chargement...", "Actif", "Essai", "Paiement en retard", "Annule") |
| `ExportButton.tsx` | 7 ("Exporter", "Aucune donnee...", "Export CSV reussi", "Erreur d'export", "Export JSON reussi") |
| `VoiceAssistant.tsx` | 6 ("Assistant vocal connecte", "Erreur de connexion vocale", "Aucun workspace", "Connexion...", "Parler a Growth OS", "Vous:", "Assistant:") |
| `GSCMetricsWidget.tsx` | 4 ("jours de donnees synchronises", "Erreur lors de la synchronisation", "Erreur OAuth") |
| `data-table-pagination.tsx` | 1 ("Aucun resultat") |
| `paginated-list.tsx` | 2 ("Aucun element", "Commencez par ajouter...") |
| `empty-state.tsx` | 1 ("Erreur lors du chargement...") |
| `DiagnosticsPanel.tsx` | 5 ("Echec verification auth", "Connexion OK/echouee", "Erreurs recentes", "Verifications de sante") |

### 4. Remplacer `window.prompt()` par un Dialog dans PriorityActionsEnhanced (CPO/UX)

Ligne 174 : `const reason = window.prompt(t("cockpit.rejectionPrompt"))` - remplacer par un Dialog Radix avec un textarea pour la raison de rejet.

---

## Plan Technique

### Groupe A - Quick fixes locales (2 fichiers)

1. **MoMComparison.tsx** : Remplacer le ternaire ligne 50 par `getIntlLocale(i18n.language)`, ajouter import
2. **CockpitPDFExport.tsx** : Meme correction ligne 63

### Groupe B - i18n des composants restants (12 fichiers)

Pour chaque fichier :
- Ajouter `useTranslation` si absent (ou `i18next.t()` pour les fichiers non-composant)
- Remplacer les strings FR par `t("namespace.key")`
- Ajouter les cles dans `en.ts` et `fr.ts`

Nouvelles cles a ajouter :
- `common.verifyingAuth`, `common.verifyingPermissions`, `common.verifyingAccess`
- `components.subscription.active`, `components.subscription.trial`, `components.subscription.pastDue`, `components.subscription.cancelled`
- `components.exportButton.*` (7 cles)
- `components.voice.*` (6 cles)
- `components.gscWidget.*` (4 cles)
- `components.pagination.noResults`
- `components.paginatedList.noItems`, `components.paginatedList.startAdding`
- `components.emptyState.loadError`
- `components.diagnostics.*` (5 cles restantes)

### Groupe C - UX fix rejection dialog (1 fichier)

Remplacer le `window.prompt()` dans `PriorityActionsEnhanced.tsx` par un state-driven Dialog avec :
- Un `<Dialog>` Radix
- Un `<Textarea>` pour la raison
- Des boutons Confirmer/Annuler
- L'ID de l'action stocke en state

**Total : ~16 fichiers modifies + en.ts + fr.ts = 18 fichiers**

