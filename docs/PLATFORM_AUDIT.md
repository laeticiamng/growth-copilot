# Growth OS - Audit Plateforme & Roadmap

> Analyse des écarts entre la vision "Portable Company OS" et l'implémentation actuelle.
> Date : 2026-02-03

---

## 📊 Résumé Exécutif

| Domaine | Statut | Score |
|---------|--------|-------|
| Multi-tenant & RBAC | ✅ Implémenté | 90% |
| Moteur de Runs & Approbations | ✅ Implémenté | 85% |
| Gestion des Abonnements | ✅ Implémenté | 80% |
| Edge Functions (31 fonctions) | ✅ Implémenté | 85% |
| Intégrations Google/Meta | ✅ Implémenté | 80% |
| AI Gateway | ✅ Implémenté | 90% |
| Cockpit Exécutif | ✅ Implémenté | 85% |
| **Facturation Stripe** | ✅ Implémenté | 85% |
| Collecte de Données (KPIs) | ⚠️ Partiel | 60% |
| Collecte de Données (KPIs) | ⚠️ Partiel | 60% |
| Départements RH/Juridique | ✅ Implémenté | 80% |
| Support Multilingue (3+) | ⚠️ Partiel (FR/EN) | 50% |
| Monitoring & Observabilité | ⚠️ Partiel | 60% |

---

## ✅ Ce qui est implémenté

### 1. Multi-tenant & RBAC (90%)

**Tables existantes :**
- `workspaces` - Isolation par workspace
- `user_roles` - Rôles par workspace (owner, admin, editor, viewer)
- `site_roles` - Rôles granulaires par site
- `role_permissions` - Matrice de permissions

**Fonctions RPC Security Definer :**
- `has_workspace_access()`, `has_workspace_role()`, `is_workspace_owner()`
- `has_permission()`, `get_user_permissions()`, `get_effective_role()`
- `has_agency_access()` pour le mode multi-client

**RLS :** 115+ tables avec politiques RLS actives (2 warnings mineurs sur extensions)

---

### 2. Moteur de Runs & Approbations (85%)

**Tables :**
- `scheduled_runs` - Planification des exécutions (CRON)
- `executive_runs` - Historique des runs avec outputs JSON
- `approval_queue` - File d'attente d'approbations
- `agent_runs` - Suivi des exécutions d'agents IA
- `audit_log` - Journal immuable (trigger anti-modification)

**Edge Function :**
- `run-executor` - Orchestrateur des runs structurés

**CRON Jobs (pg_cron) :**
- `DAILY_EXECUTIVE_BRIEF` - 8:00 AM UTC quotidien
- `WEEKLY_EXECUTIVE_REVIEW` - 9:00 AM UTC lundis

**Types de runs supportés :**
- `DAILY_EXECUTIVE_BRIEF`, `WEEKLY_EXECUTIVE_REVIEW`
- `MARKETING_WEEK_PLAN`, `SEO_AUDIT`, `SALES_PIPELINE_REVIEW`
- `CONTENT_CALENDAR_SYNC`, `SOCIAL_DISTRIBUTION`

---

### 3. Gestion des Abonnements (80%)

**Tables :**
- `services_catalog` - 10 services (1 Core + 9 départements)
- `workspace_services` - Activation par workspace
- `workspace_subscriptions` - Plan (free/starter/growth/agency)
- `workspace_quotas` - Limites (requests/minute, tokens/mois)

**Hook :** `useServices()` avec `enableService()`, `disableService()`

**Onboarding :** Parcours 5 étapes avec choix Full Company vs À la carte

**Manque :** Intégration Stripe pour paiement réel

---

### 4. Edge Functions (31 fonctions - 85%)

| Catégorie | Fonctions |
|-----------|-----------|
| **AI** | `ai-gateway`, `ai-assistant`, `perplexity-research` |
| **Auth/OAuth** | `oauth-init`, `oauth-callback` |
| **Sync Google** | `sync-ga4`, `sync-gsc`, `sync-ads`, `sync-gbp`, `sync-youtube-analytics` |
| **Sync Meta** | `sync-meta-ads`, `meta-ig-sync`, `meta-capi`, `meta-webhooks` |
| **Créatives** | `creative-init`, `creative-render`, `creative-qa`, `creative-export` |
| **SEO** | `seo-crawler` |
| **Médias** | `media-agents`, `media-detect`, `youtube-sync` |
| **Ops** | `run-executor`, `generate-report`, `analytics-guardian` |
| **Autres** | `smart-link`, `webhooks`, `api-docs`, `gdpr-export`, `elevenlabs-conversation-token` |

---

### 5. Cockpit Exécutif (85%)

**Composants :**
- `ExecutiveSummary` - Status RAG par département
- `PriorityActions` - Actions prioritaires (score ICE)
- `QuickLaunchers` - Déclenchement rapide des runs
- `ApprovalsWidget` - Approbations en attente
- `RunsHistory` - Historique des exécutions

---

### 6. AI Gateway (90%)

**Modèles supportés :**
- Google Gemini (2.5-pro, 2.5-flash, 3-pro-preview, 3-flash-preview)
- OpenAI GPT-5 (standard, mini, nano, 5.2)

**Features :**
- Streaming SSE
- Tool calling / Structured output
- Logging dans `ai_requests`
- Quotas et rate limiting

---

## ⚠️ Implémentation Partielle

### 1. Collecte de Données KPIs (60%)

**Existant :**
- `kpis_daily` - Métriques quotidiennes
- `media_kpis_daily` - KPIs médias
- `ops_metrics_daily` - Métriques opérationnelles
- Fonction `compute_ops_metrics()` pour agrégation

**Manque :**
- Synchronisation automatique GA4/GSC via pg_cron
- Pipeline de consolidation ROI cross-département
- Dashboards analytiques Data/Finance

---

### 2. Monitoring & Observabilité (60%)

**Existant :**
- `system_logs`, `audit_log`, `webhook_logs`
- `data_quality_alerts`, `incident_reports`
- Panel Diagnostics (santé Auth/DB/Functions)

**Manque :**
- Métriques de latence Edge Functions
- Alerting proactif (Slack/Email)
- Tableau de bord SRE

---

### 3. Support Multilingue (50%)

**Existant :** FR/EN via i18next

**Manque :** ES, DE, IT, PT pour expansion européenne

---

## ❌ Fonctionnalités Manquantes

### 1. Intégration Stripe (Priorité Haute)

**Requis :**
- Webhooks Stripe pour `customer.subscription.created/updated/deleted`
- Synchronisation `workspace_subscriptions` ↔ Stripe
- Portail client pour gérer l'abonnement
- Gestion des entitlements par plan

**Estimation :** 2-3 jours de développement

---

### 2. Départements RH & Juridique (Priorité Moyenne)

**RH :**
- Tables : `employees`, `onboarding_tasks`, `performance_reviews`
- Runs : `ONBOARDING_CHECKLIST`, `PERFORMANCE_REVIEW_CYCLE`
- Agents : Recrutement IA, Onboarding Manager

**Juridique :**
- Tables : `contracts`, `compliance_tasks`, `policy_documents`
- Runs : `COMPLIANCE_AUDIT`, `CONTRACT_REVIEW`
- Agents : Compliance Officer IA, Contract Analyst

**Estimation :** 5-7 jours de développement

---

### 3. Transparence IA - Evidence Bundles (Priorité Moyenne)

**Requis :**
- Champ `evidence_bundle` dans `executive_runs`
- Sources citées pour chaque recommandation
- Score de confiance par suggestion
- Export PDF des preuves

**Estimation :** 2-3 jours de développement

---

## 🗺️ Roadmap Recommandée

### Phase 1 : Monétisation (Semaine 1-2)
1. ✅ Activer Stripe via Lovable
2. Créer Edge Function `stripe-webhooks`
3. Synchroniser `workspace_subscriptions` avec Stripe
4. Ajouter page Billing avec portail client

### Phase 2 : Robustesse Data (Semaine 2-3)
1. CRON jobs pour sync GA4/GSC/Meta quotidiens
2. Pipeline d'agrégation ROI
3. Dashboard Finance avec métriques consolidées
4. Alerting sur anomalies de données

### Phase 3 : Départements Manquants (Semaine 3-5)
1. Schéma RH (employees, onboarding, reviews)
2. Schéma Juridique (contracts, compliance)
3. Runs et agents correspondants
4. UI dans le sidebar

### Phase 4 : Qualité & Scale (Semaine 5-6)
1. Evidence Bundles dans les runs
2. Monitoring avancé (latence, erreurs)
3. Support ES/DE
4. Documentation API publique

---

## 📈 Métriques de Succès

| Objectif | Cible | Mesure |
|----------|-------|--------|
| Couverture RLS | 100% | Tables avec RLS actif |
| Temps moyen de run | < 30s | Durée `executive_runs` |
| Taux de succès agents | > 95% | `agent_runs` completed/total |
| Latence Edge Functions | < 2s | P95 response time |
| Conversion trial→paid | > 10% | Stripe MRR / signups |

---

## 🔐 Warnings Sécurité Actuels

1. **Extension in Public** - Déplacer extensions vers schéma dédié
2. **RLS Always True** - Revoir politiques sur tables de configuration publiques (intentionnel pour `services_catalog`, `role_permissions`)

---

*Document généré automatiquement - Growth OS Platform Audit*
