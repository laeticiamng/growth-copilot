

# Audit Complet Beta Testeurs - Diagnostic et Corrections

## Diagnostic Principal : BUG CRITIQUE CONFIRME

### Le probleme identifie

Le parcours de creation de compte est **bloque pour tous les beta testeurs** a cause d'une dependance circulaire dans le flux :

```text
Signup --> Email Confirm --> Login --> /dashboard --> "Pas de workspace" --> /onboarding --> Paiement Stripe --> Webhook Stripe cree le workspace
```

**Le workspace n'est cree QUE apres un paiement Stripe reussi.** Il n'existe aucun chemin gratuit ou d'essai qui cree un workspace sans passer par Stripe.

### Preuve dans la base de donnees

| Utilisateur | Email | Compte cree | Workspace | Role | Statut |
|---|---|---|---|---|---|
| Beta testeur 1 | afifi.sarah@laposte.net | 2026-02-05 | AUCUN | AUCUN | BLOQUE |
| Beta testeur 2 | motonganeca@gmail.com | 2026-02-05 | AUCUN | AUCUN | BLOQUE |
| Admin (Google OAuth) | m.laeticia@hotmail.fr | 2026-01-31 | 2 workspaces | owner | OK |
| Test user | test-user@demo.com | 2026-01-31 | 1 workspace | owner | OK |

Les 2 beta testeurs ont des comptes valides (`email_confirmed_at` rempli) mais sont pieges dans une boucle :
- `/dashboard` affiche "Pas de workspace, cliquez pour demarrer"
- Le bouton redirige vers `/onboarding`
- L'onboarding exige un paiement Stripe (meme avec "essai gratuit", ca passe par Stripe Checkout)
- Si Stripe echoue ou si l'utilisateur ferme la page, il revient a `/dashboard` sans workspace

### Problemes secondaires identifies

1. **Le signup ne passe pas `fullName` ni `companyName` au backend** - Ces donnees sont stockees dans `localStorage` uniquement (`signup_data`), jamais envoyees a Supabase `auth.signUp` ni sauvegardees en base
2. **Pas de creation automatique de workspace** - Aucun trigger ou flow ne cree un workspace "free" a l'inscription
3. **L'onboarding ne propose pas de "skip" vers un plan gratuit** sans paiement
4. **Pas de feedback utilisateur** si le checkout Stripe echoue silencieusement

---

## Plan de Corrections

### P0 - CRITIQUE : Creer un workspace automatiquement au premier login (1 correction)

**Probleme** : Les utilisateurs sont bloques sans workspace apres inscription.

**Solution** : Modifier `src/pages/Onboarding.tsx` pour ajouter un bouton "Commencer gratuitement" qui cree un workspace directement (sans passer par Stripe) avec le plan `free` et un trial de 14 jours. Ce bouton sera place a l'etape "payment" comme alternative au paiement.

**OU (solution plus robuste)** : Ajouter une logique dans `DashboardHome.tsx` ou `useWorkspace.tsx` qui detecte qu'un utilisateur authentifie n'a aucun workspace et le redirige automatiquement vers `/onboarding`, et dans l'onboarding, permettre de creer un workspace gratuit sans passer par Stripe.

**Implementation choisie** : Ajouter un bouton "Commencer avec le plan gratuit" dans l'etape `payment` de `Onboarding.tsx` qui :
1. Cree le workspace directement via `supabase.from('workspaces').insert()`
2. Cree le site associe
3. Redirige vers `/dashboard`

Cela evite de modifier le flux Stripe existant tout en debloquant les beta testeurs.

### P1 - Sauvegarder les metadonnees utilisateur au signup (1 correction)

**Probleme** : `fullName` et `companyName` sont perdus (stockes en localStorage uniquement).

**Solution** : Modifier `handleSignUp` dans `Auth.tsx` pour passer les metadonnees dans `supabase.auth.signUp({ options: { data: { full_name, company_name } } })`.

### P2 - Debloquer les 2 beta testeurs existants (1 action manuelle)

**Solution** : Executer une migration SQL pour creer des workspaces pour les 2 utilisateurs bloques avec un plan `free`.

---

## Implementation technique detaillee

### Fichier 1 : `src/pages/Onboarding.tsx`

Ajouter une fonction `handleFreePlan` au niveau de l'etape `payment` :
- Insere un workspace dans `workspaces` avec le `owner_id` de l'utilisateur courant
- Insere un site dans `sites` avec l'URL fournie
- Redirige vers `/dashboard`
- Ajouter un bouton visible "Commencer gratuitement - Plan Free" a cote du bouton de paiement Stripe

Le bouton sera affiche dans la section `payment` avec le texte traduit, en alternative au paiement.

### Fichier 2 : `src/pages/Auth.tsx`

Modifier la ligne 213 (`handleSignUp`) pour inclure les metadonnees :
```typescript
const { error } = await signUp(email, password);
```
devient :
```typescript
const { error } = await signUp(email, password, {
  full_name: fullName.trim(),
  company_name: companyName.trim(),
});
```

Et modifier `useAuth.tsx` pour accepter et transmettre ces metadonnees dans `signUp`.

### Fichier 3 : `src/hooks/useAuth.tsx`

Modifier la signature de `signUp` pour accepter des metadonnees optionnelles et les passer a `supabase.auth.signUp({ options: { data: metadata } })`.

### Fichier 4 : `src/i18n/locales/fr.ts` et `en.ts`

Ajouter les cles de traduction pour :
- `onboardingFlow.startFree` : "Commencer gratuitement" / "Start for free"
- `onboardingFlow.freePlanDesc` : "Plan gratuit, sans carte bancaire" / "Free plan, no credit card required"
- `onboardingFlow.creatingFreeWorkspace` : "Creation en cours..." / "Creating..."

### Fichier 5 : Migration SQL (pour debloquer les beta testeurs existants)

```sql
-- Creer des workspaces pour les beta testeurs bloques
INSERT INTO public.workspaces (name, slug, owner_id)
VALUES 
  ('Mon Espace', 'afifi-sarah', 'bd6f69f8-0c4b-4e17-bdea-6afcb8b67781'),
  ('Mon Espace', 'motonganeca', 'b1ffdd21-842a-469d-8e3e-2b00a79d2fac');
```

Le trigger `handle_new_workspace` et `auto_enable_core_services` s'executent automatiquement et creent les roles owner + services core + subscription free.

---

## Resume

| Action | Priorite | Impact |
|---|---|---|
| Bouton "Plan Gratuit" dans l'onboarding | P0 | Debloque tous les futurs utilisateurs |
| Migration SQL pour les 2 beta testeurs | P0 | Debloque les utilisateurs existants |
| Sauvegarder fullName/companyName au signup | P1 | Donnees utilisateur persistees |
| Traductions i18n ajoutees | P1 | UX coherente FR/EN |

