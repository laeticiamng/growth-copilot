

# Analyse Complète du Repo Growth OS — Ce Qui Manque

## Etat Actuel (Ce qui fonctionne)

- **52 pages dashboard**, 39+ agents IA, 60+ edge functions, 67+ hooks
- Command Palette (Cmd+K) ✅ intégré dans DashboardLayout
- Theme Toggle (Dark/Light) ✅ intégré dans DashboardLayout
- Webhook Notifications (Slack/Teams) ✅ intégré dans Settings
- PredictiveAnalytics, GoalsProgress, CockpitPDFExport ✅ intégrés dans DashboardHome
- Pagination ✅ sur HR, Legal, AuditLog
- CSV Export ✅ sur HR, Legal, SEOTech
- i18n ✅ FR/EN quasi-parité (5082 vs 5106 lignes)
- Realtime ✅ sur Approvals, Notifications, Agents, Ads, Diagnostics

---

## Ce Qui Manque — Plan d'Implémentation

### Phase 1 — Stabilité & UX (pages dashboard)

**1.1 DashboardPageWrapper manquant sur 50+ pages**
Seule `AICostDashboard` utilise le wrapper avec error boundary + skeleton. Toutes les autres pages dashboard sont sans protection.
- **Action**: Wrapper les 15 pages les plus critiques avec `DashboardPageWrapper` (HR, Legal, Agents, Approvals, Billing, Settings, Diagnostics, Ops, Competitors, SEOTech, Reports, Social, Content, CRO, Reputation)

**1.2 Loading states manquants sur 9 pages**
Pages sans skeleton/loading: AgentChat, AnalyzeUrl, Diagnostics, Onboarding, ROIDashboard, Research, ServiceCatalog, Settings, StatusPage
- **Action**: Ajouter `isLoading` + `Skeleton` sur ces 9 pages

**1.3 Empty states manquants sur 15+ pages**
Pages sans empty state: AccessReview, Agency, AgentChat, Agents, Approvals, Automations, Billing, BrandKit, CMS, ConnectionStatus, CreativesStudio, DashboardHome, Diagnostics, GEO, et plus
- **Action**: Ajouter `ModuleEmptyState` sur les 10 pages les plus utilisées

### Phase 2 — Fonctionnalités Manquantes

**2.1 CSV Export manquant sur des pages clés**
Manque sur: AuditLog, Agents (runs), Approvals, Leads/Offers, KPIs
- **Action**: Ajouter `exportToCSV` sur AuditLog, Approvals, Offers

**2.2 Pagination manquante sur grandes listes**
Manque sur: Agents, Approvals, Automations, Offers, Competitors
- **Action**: Ajouter `usePagination` sur Approvals, Offers, Competitors

**2.3 Refactoring composants monolithiques**
- `HR.tsx` (778 lignes) → extraire EmployeeTab, PerformanceTab, TimeOffTab
- `Legal.tsx` (700 lignes) → extraire ContractsTab, ComplianceTab, TemplatesTab
- `Settings.tsx` (600 lignes) → extraire ProfileTab, WorkspaceTab, NotificationsTab

### Phase 3 — Accessibility & Polish

**3.1 Accessibility (a11y)**
- DashboardLayout n'a qu'1 seul `aria-label`
- **Action**: Ajouter `aria-label` sur tous les boutons icônes, navigation, et modales

**3.2 Keyboard navigation**
- **Action**: Ajouter `role`, `tabIndex`, et focus management sur les TabsList et DataTable

### Phase 4 — Composants Orphelins à Intégrer

**4.1 Onboarding tour non connecté**
`src/components/onboarding/SiteAnalysisPreview.tsx` existe mais pas de tour interactif step-by-step
- **Action**: Créer un `ProductTour` component avec tooltips guidés pour le premier lancement

---

## Résumé des Actions (par priorité)

```text
Priorite   Action                                    Fichiers touches
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P0         Wrapper 15 pages avec ErrorBoundary        15 pages dashboard
P0         Loading states sur 9 pages                 9 pages dashboard
P1         Empty states sur 10 pages                  10 pages dashboard
P1         CSV Export sur AuditLog, Approvals, Offers  3 pages
P1         Pagination sur Approvals, Offers, Compet.   3 pages
P2         Refactor HR → 3 sub-components             4 fichiers
P2         Refactor Legal → 3 sub-components          4 fichiers
P2         Refactor Settings → 3 sub-components       4 fichiers
P3         Accessibility (aria-labels)                 ~20 fichiers
P3         Product Tour interactif                     2 nouveaux fichiers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Approche Technique

- Les wrappers utilisent le `DashboardPageWrapper` existant (error boundary + skeleton intégrés)
- Les empty states utilisent le `ModuleEmptyState` existant
- Le CSV export utilise le `exportToCSV` existant dans `src/lib/csv-export.ts`
- La pagination utilise `usePagination` + `DataTablePagination` existants
- Le refactoring extrait les `TabsContent` en composants séparés sans changer la logique

Je propose de commencer par les phases P0 et P1 (wrappers, loading, empty states, exports, pagination) qui touchent le plus de pages avec le moins de risque.

