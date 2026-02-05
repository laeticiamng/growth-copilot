# Growth OS - Architecture Technique

> Documentation complète de l'architecture de la plateforme "Portable Company OS".

---

## 🏗️ Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              GROWTH OS ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           FRONTEND (React 18)                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │   Landing    │  │  Dashboard   │  │   Cockpit    │  │   Agents    │  │ │
│  │  │   Pages      │  │   37 Pages   │  │   Exécutif   │  │   Panel     │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  │                           │                                              │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Design System: shadcn/ui + Tailwind CSS + Custom Tokens (HSL)    │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  │                           │                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │  TanStack    │  │   i18next    │  │   React      │  │   Zod       │  │ │
│  │  │  Query       │  │   (4 langs)  │  │   Router     │  │  Validation │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                          │
│                    supabase.functions.invoke() / supabase.from()              │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        BACKEND (Lovable Cloud)                           │ │
│  │                                                                           │ │
│  │  ┌───────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    EDGE FUNCTIONS (38 Deno)                       │   │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │ │
│  │  │  │ ai-gateway  │ │ run-executor│ │ oauth-init  │ │ stripe-*    │  │   │ │
│  │  │  │ ai-assistant│ │ kpi-sync    │ │ oauth-cb    │ │ webhooks    │  │   │ │
│  │  │  │ perplexity  │ │ monitoring  │ │ sync-ga4    │ │ gdpr-export │  │   │ │
│  │  │  │ creative-*  │ │ generate-rpt│ │ sync-gsc    │ │ smart-link  │  │   │ │
│  │  │  │ seo-crawler │ │ media-agents│ │ sync-meta   │ │ api-docs    │  │   │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │ │
│  │  └───────────────────────────────────────────────────────────────────┘   │ │
│  │                                    │                                      │ │
│  │  ┌───────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    POSTGRESQL (Supabase)                          │   │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │ │
│  │  │  │ workspaces  │ │ user_roles  │ │ agent_runs  │ │ audit_log   │  │   │ │
│  │  │  │ sites       │ │ permissions │ │ ai_requests │ │ evidence_*  │  │   │ │
│  │  │  │ employees   │ │ services    │ │ executive_  │ │ monitoring_ │  │   │ │
│  │  │  │ contracts   │ │ subscript   │ │ runs        │ │ snapshots   │  │   │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │ │
│  │  │                                                                    │   │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐  │   │ │
│  │  │  │ RLS: 131 tables with 238 Row Level Security policies        │  │   │ │
│  │  │  │ pg_cron: Scheduled runs (DAILY_BRIEF, WEEKLY_REVIEW)        │  │   │ │
│  │  │  │ Triggers: Immutable audit_log, auto-updated_at              │  │   │ │
│  │  │  └─────────────────────────────────────────────────────────────┘  │   │ │
│  │  └───────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        EXTERNAL INTEGRATIONS                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │   Google    │ │    Meta     │ │   Stripe    │ │   Lovable AI        │ │ │
│  │  │  Analytics  │ │  Marketing  │ │  Payments   │ │   Gateway           │ │ │
│  │  │  Search     │ │  Instagram  │ │  Webhooks   │ │  (Gemini 3 Pro/Flash)│ │ │
│  │  │  Ads, YT    │ │  CAPI       │ │  Portal     │ │                     │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers

```
growth-os/
├── src/
│   ├── components/
│   │   ├── ai/                    # AIAssistant, VoiceAssistant
│   │   ├── auth/                  # ProtectedRoute, ServiceGuard, PermissionGuard
│   │   ├── cockpit/               # ExecutiveSummary, PriorityActions, QuickLaunchers
│   │   ├── evidence/              # EvidenceBundleCard, EvidenceBundleViewer
│   │   ├── integrations/          # GoogleSuperConnector, MetaSuperConnector
│   │   ├── kpi/                   # KPICard, KPIChart, KPIDashboard
│   │   ├── landing/               # Hero, Features, Services, Pricing, FAQ
│   │   ├── layout/                # DashboardLayout
│   │   ├── notifications/         # NotificationCenter, SmartAlertsPanel
│   │   └── ui/                    # 50+ shadcn/ui components
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx            # Authentication state
│   │   ├── useWorkspace.tsx       # Current workspace context
│   │   ├── useServices.tsx        # Service catalog & gating
│   │   ├── usePermissions.tsx     # RBAC permissions
│   │   ├── useExecutiveRuns.tsx   # Run history & triggering
│   │   ├── useApprovals.tsx       # Approval queue
│   │   ├── useEmployees.tsx       # HR module
│   │   ├── useContracts.tsx       # Legal module
│   │   └── ... (40+ hooks)
│   │
│   ├── lib/
│   │   ├── agents/                # Agent definitions & AI client
│   │   │   ├── ai-gateway-client.ts
│   │   │   ├── agent-registry.ts
│   │   │   ├── cgo-agent.ts
│   │   │   ├── qco-agent.ts
│   │   │   └── ...
│   │   ├── validation/            # Zod schemas, sanitization
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Index.tsx              # Landing page
│   │   └── dashboard/             # 37 dashboard pages
│   │       ├── DashboardHome.tsx  # Cockpit exécutif
│   │       ├── HR.tsx
│   │       ├── Legal.tsx
│   │       ├── Billing.tsx
│   │       ├── AuditLog.tsx
│   │       └── ...
│   │
│   ├── i18n/
│   │   └── locales/
│   │       ├── en.ts (551 keys)
│   │       ├── fr.ts (551 keys)
│   │       ├── es.ts (551 keys)
│   │       └── de.ts (551 keys)
│   │
│   └── test/
│       ├── smoke.test.ts
│       ├── agents.test.ts
│       ├── hooks.test.ts
│       ├── rls.security.test.ts
│       └── ... (23 test files)
│
├── supabase/
│   ├── config.toml
│   ├── functions/
│   │   ├── _shared/               # Shared utilities
│   │   │   ├── auth.ts
│   │   │   ├── crypto.ts
│   │   │   ├── permissions.ts
│   │   │   └── validation.ts
│   │   ├── ai-gateway/
│   │   ├── run-executor/
│   │   ├── oauth-init/
│   │   ├── oauth-callback/
│   │   ├── stripe-checkout/
│   │   └── ... (38 functions)
│   │
│   └── migrations/                # SQL migrations (auto-managed)
│
├── docs/
│   ├── PLATFORM_AUDIT.md          # Status & roadmap
│   ├── AI_AGENTS.md               # AI documentation
│   └── ARCHITECTURE.md            # This file
│
└── README.md
```

---

## 🔐 Modèle de Sécurité

### Multi-Tenant Isolation

```sql
-- Chaque table métier a une colonne workspace_id
-- RLS policy pattern:
CREATE POLICY "workspace_isolation" ON table_name
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );
```

### RBAC (5 Niveaux)

```
owner       → Tout (billing, delete workspace)
admin       → Tout sauf billing
editor      → CRUD sur données
contributor → Create + Update own
viewer      → Read only
```

### Fonctions Security Definer

```sql
-- Vérification d'accès centralisée
SELECT has_workspace_access(workspace_id);
SELECT has_permission(workspace_id, 'edit_content');
SELECT has_service(workspace_id, 'marketing');
```

---

## 🔄 Flux de Données

### 1. Exécution d'un Run

```
User clicks "Start Run" in QuickLaunchers
         │
         ▼
┌─────────────────────────┐
│   run-executor          │
│   Edge Function         │
├─────────────────────────┤
│ 1. Create executive_run │
│ 2. Call ai-gateway      │
│ 3. Validate response    │
│ 4. Create evidence_bundle│
│ 5. Check approval_needed │
│ 6. Update run status    │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   ai-gateway            │
├─────────────────────────┤
│ 1. Check quota          │
│ 2. Select model         │
│ 3. Call Lovable AI      │
│ 4. Validate artifact    │
│ 5. Log to ai_requests   │
│ 6. Return artifact      │
└─────────────────────────┘
         │
         ▼
User sees results in RunsHistory
```

### 2. OAuth Flow

```
User clicks "Connect Google"
         │
         ▼
┌─────────────────────────┐
│   oauth-init            │
├─────────────────────────┤
│ 1. Generate HMAC state  │
│ 2. Store in oauth_states│
│ 3. Redirect to provider │
└─────────────────────────┘
         │
    User authorizes
         │
         ▼
┌─────────────────────────┐
│   oauth-callback        │
├─────────────────────────┤
│ 1. Verify HMAC state    │
│ 2. Exchange code        │
│ 3. Encrypt tokens (AES) │
│ 4. Store in integrations│
│ 5. Redirect to dashboard│
└─────────────────────────┘
```

---

## 📊 Base de Données (120+ Tables)

### Tables Principales

| Catégorie | Tables |
|-----------|--------|
| **Core** | workspaces, sites, user_roles, site_roles, role_permissions |
| **Services** | services_catalog, workspace_services, workspace_subscriptions, workspace_quotas |
| **AI** | ai_requests, ai_conversations, ai_messages, ai_providers, ai_models |
| **Runs** | executive_runs, agent_runs, scheduled_runs, approval_queue |
| **Evidence** | evidence_bundles, evidence_sources, evidence_metrics, evidence_reasoning |
| **HR** | employees, onboarding_checklists, performance_reviews, time_off_requests |
| **Legal** | contracts, compliance_tasks, gdpr_requests, legal_alerts |
| **KPI** | kpi_aggregates, kpi_sync_jobs, ops_metrics_daily |
| **Integrations** | integrations, oauth_states, webhook_logs |
| **Audit** | audit_log, action_log, system_logs |
| **Monitoring** | monitoring_snapshots, alert_configurations, incident_reports |

### Vues SQL

```sql
-- Métriques de latence par agent
CREATE VIEW v_agent_latency_metrics AS ...

-- Usage IA par provider/modèle
CREATE VIEW v_ai_usage_metrics AS ...

-- Santé des intégrations OAuth
CREATE VIEW v_integration_health AS ...
```

---

## 🚀 Déploiement

### URLs

- **Preview**: https://id-preview--c548a033-0937-4830-bc84-bb2548968cd3.lovable.app
- **Production**: https://agent-growth-automator.lovable.app

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| UI Components | shadcn/ui (50+ components) |
| State | TanStack Query, React Context |
| i18n | i18next (FR, EN, ES, DE) |
| Backend | Supabase (PostgreSQL, Edge Functions) |
| Auth | Supabase Auth (Email, OAuth) |
| AI | Lovable AI Gateway (Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 Pro) |
| Payments | Stripe (Checkout, Webhooks, Portal) |
| Hosting | Lovable Cloud |

---

## 🧪 Tests

### Structure

```
src/test/
├── smoke.test.ts           # 25 smoke tests
├── agents.test.ts          # Agent logic
├── hooks.test.ts           # Hook behavior
├── rls.security.test.ts    # RLS policies
├── security.validation.test.ts
├── form-validation.test.ts
├── edge-functions.test.ts
└── e2e/
    └── critical-workflows.spec.ts
```

### Exécution

```bash
# Tous les tests
npm run test

# Avec couverture
npm run test -- --coverage

# Fichier spécifique
npm run test src/test/smoke.test.ts
```

---

## 📈 Métriques de Performance

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Latence Edge Functions | < 2s | ~1.2s ✅ |
| Temps de run moyen | < 30s | ~15s ✅ |
| Taux de succès agents | > 95% | 96% ✅ |
| Couverture RLS | 100% | 100% ✅ |

---

*Document généré - Growth OS Architecture v1.0*
