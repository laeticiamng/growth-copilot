
# Audit Multi-Roles et Plan de Corrections

## Constats par role

### CEO - Audit Strategique
- **Coherence decisionnelle** : Le cockpit (DashboardHome) est bien structure avec briefing, semaphores, approbations et health score. L'architecture "Portable Company" avec 11 departements et 39 agents IA est coherente.
- **Probleme** : Les semaphores ne couvrent que 5 departements (SEO, Content, Ads, Commercial, Finance) sur les 11 disponibles. Manquent : Support, Security, Governance, HR, Legal, Product.
- **Probleme** : 2 liens morts dans la navigation sidebar (`/dashboard/media-kpis` et `/dashboard/service-catalog` ne correspondent a aucune route dans App.tsx).

### CTO - Audit Technique
- **Fiabilite** : Architecture React + Supabase solide, 24 providers correctement composes, RLS appliquee sur 131 tables, 325+ politiques.
- **Probleme critique** : Onboarding.tsx contient encore ~120 occurrences `isEn ?` (dernier fichier majeur non migre vers `t()`).
- **Probleme** : ROIDashboard.tsx et AICostDashboard.tsx ont des textes entierement hardcodes en francais (~80 textes chacun, aucun `t()`).
- **Probleme** : ~290 textes francais hardcodes restants dans 20 fichiers dashboard (Offers, Ads, Social, Reputation, Competitors, LocalSEO, Reports, TemplateAdsFactory, BrandKit, ApprovalsV2, Approvals, Diagnostics, etc.).
- **Probleme** : AICostDashboard affiche des donnees factices ("hardcoded agent costs" lignes 175-181) comme si elles etaient reelles.
- **Probleme** : `Billing.tsx` ligne 152 : toast hardcode en francais "Aucun workspace selectionne".

### CPO - Audit Produit
- **KPIs clairs** : BusinessHealthScore avec 5 metriques ponderees, DepartmentSemaphores avec code couleur. Bon.
- **Probleme UX** : Les liens sidebar morts (`media-kpis`, `service-catalog`) causent des 404 silencieux. Impact utilisateur direct.
- **Probleme** : La page Agents (647 lignes) avec 39 personas a des specialites et greetings hardcodes en francais. Un utilisateur EN voit du francais.

### CISO - Audit Securite
- **RLS** : 325+ politiques, fonctions SECURITY DEFINER pour les helpers d'acces. Architecture multi-tenant solide.
- **Audit log immuable** : Trigger `prevent_audit_modification` en place. Bien.
- **Pas de vulnerabilite critique identifiee** dans ce round. Les corrections portent sur l'UX et l'i18n.

### DPO - Audit RGPD
- **GDPR export** : Edge function `gdpr-export` couvrant 21 tables. Conforme.
- **Conservation** : `anonymize_old_click_data` apres 30 jours. Bon.
- **Pas de probleme bloquant identifie.**

### CDO - Audit Data
- **Probleme** : AICostDashboard utilise des donnees estimees (today × 5, today × 22, today × 30) au lieu de requeter les periodes reelles. Donnees trompeuses.
- **Probleme** : L'onglet "Par agent" de AICostDashboard affiche des donnees fictives hardcodees (SEO Auditor: 23.45€, etc.).

### COO - Audit Organisationnel
- **Probleme** : 2 liens de navigation morts dans le sidebar cassent le workflow utilisateur.
- **Probleme** : Onboarding.tsx non localise = experience d'inscription degradee pour 5 langues.

### CFO - Audit Financier
- **ROIDashboard** : Calculateur de ROI fonctionnel mais entierement en francais hardcode. Inaccessible pour les utilisateurs non francophones.
- **Billing** : Integration Stripe fonctionnelle avec 3 plans (Starter/Full/A la carte). Bien structure.

### CMO/Growth - Audit Marketing
- **Landing page** : Migration i18n completee dans Round 10. Couverture 7 langues. Bon.
- **Pas de probleme bloquant additionnel.**

### Head of Design - Audit UX
- **Liens morts** : `media-kpis` et `service-catalog` dans le sidebar ne menent nulle part.
- **Semaphores incomplets** : Seulement 5/11 departements visibles.

### Beta Testeur
- **Bug** : Clic sur "Media KPIs" dans le sidebar = page 404.
- **Bug** : Clic sur "Catalogue" dans le sidebar = page 404.
- **Incoherence** : Pages ROI et AI Costs affichent du francais meme en mode anglais.
- **Fake data** : Page AI Costs affiche des couts par agent qui sont des donnees inventees.

---

## Plan de Corrections (par priorite)

### P0 - Bugs critiques (liens morts)

**Fichier : `src/components/layout/DashboardLayout.tsx`**
- Corriger `/dashboard/media-kpis` vers `/dashboard/media/kpis` (ligne 141)
- Corriger `/dashboard/service-catalog` vers `/dashboard/services` (ligne 153)

### P1 - i18n ROIDashboard.tsx (~40 textes)

Migrer tous les textes francais hardcodes vers `t()`. Ajouter les cles dans en.ts et fr.ts.

### P2 - i18n AICostDashboard.tsx (~30 textes) + supprimer fake data

- Migrer tous les textes vers `t()`
- Supprimer les donnees fictives hardcodees de l'onglet "Par agent" et afficher un etat vide quand il n'y a pas de donnees reelles
- Corriger les estimations (semaine/mois) pour utiliser des requetes reelles ou afficher clairement que ce sont des projections

### P3 - i18n Onboarding.tsx (~120 occurrences `isEn ?`)

Migrer le dernier fichier majeur avec l'anti-pattern `isEn ?` vers `t()`. Ajouter ~60 cles dans en.ts et fr.ts.

### P4 - Textes hardcodes restants dans les pages dashboard (batch de nettoyage)

Migrer les toasts et labels francais dans les 20 fichiers restants :
- Offers.tsx (~8 textes)
- Ads.tsx (~6 textes)
- Social.tsx (~8 textes)
- Reputation.tsx (~6 textes)
- Competitors.tsx (~6 textes)
- LocalSEO.tsx (~8 textes)
- Reports.tsx (~6 textes)
- TemplateAdsFactory.tsx (~8 textes)
- BrandKit.tsx (~4 textes)
- ApprovalsV2.tsx (~6 textes)
- Approvals.tsx (~8 textes)
- Billing.tsx (1 toast ligne 152)

### P5 - Nettoyage mineur

- `Agents.tsx` ligne 3 : double import `import { useCallback } from 'react'` deja dans ligne 1

---

## Details techniques

### Fichiers a modifier : ~25 fichiers

| Batch | Fichiers | Cles i18n |
|-------|----------|-----------|
| P0 | DashboardLayout.tsx | 0 |
| P1 | ROIDashboard.tsx, en.ts, fr.ts | ~40 |
| P2 | AICostDashboard.tsx, en.ts, fr.ts | ~30 |
| P3 | Onboarding.tsx, en.ts, fr.ts | ~60 |
| P4 | 12 fichiers dashboard, en.ts, fr.ts | ~80 |
| P5 | Agents.tsx | 0 |

**Total : ~210 nouvelles cles i18n, 25 fichiers modifies.**

### Approche
1. Corriger les 2 liens morts immediatement (DashboardLayout)
2. Migrer ROIDashboard et AICostDashboard (pages financieres visibles)
3. Migrer Onboarding (dernier `isEn ?` majeur)
4. Nettoyer les toasts et labels des 12 pages restantes
5. Fix import doublon Agents.tsx
