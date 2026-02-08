# Growth OS - Your Portable Company

> La première entreprise digitale complète en abonnement. Abonnez-vous à la Full Company ou sélectionnez uniquement les départements dont vous avez besoin.

[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://agent-growth-automator.lovable.app)
 [![Tests](https://img.shields.io/badge/Tests-290%2B%20passing-brightgreen)](./src/test)
 [![Audit](https://img.shields.io/badge/Audit-100%2F100-brightgreen)](./docs/AUDIT_PLATEFORME_2026-02-05.md)
[![Languages](https://img.shields.io/badge/i18n-FR%20%7C%20EN%20%7C%20ES%20%7C%20DE-blue)](./src/i18n)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

---

## 🚀 Démo Live

**👉 [agent-growth-automator.lovable.app](https://agent-growth-automator.lovable.app)**

---

## 🏢 Vision

Growth OS est un **système d'exploitation d'entreprise portable** qui remplace les équipes traditionnelles par des **employés IA premium**. Chaque département (Marketing, Commercial, Finance, Sécurité, etc.) est composé d'agents IA spécialisés qui travaillent 24/7 avec un standard de compétence premium.

**Philosophie** : Compétence premium, livrée simplement. Zéro jargon technique.

---

## 📸 Captures d'Écran

### Landing Page
![Landing Page](./docs/screenshots/landing-hero.png)
*Page d'accueil avec présentation des départements*

### Cockpit Exécutif
![Executive Cockpit](./docs/screenshots/cockpit.png)
*Tableau de bord exécutif avec semaphores RAG, actions prioritaires et approbations*

### Module RH
![HR Module](./docs/screenshots/hr.png)
*Gestion des employés, onboarding et performance*

### Module Juridique
![Legal Module](./docs/screenshots/legal.png)
*Contrats, conformité RGPD et alertes légales*

> **Note** : Les captures d'écran sont dans `docs/screenshots/`. Pour les générer, exécutez l'application et prenez des captures des pages principales.

---

## 💼 Modèle Tarifaire

| Formule | Prix | Inclus |
|---------|------|--------|
| **Full Company** | 9 000€/mois | 39 employés IA, 11 départements, Core OS |
| **À la carte** | 1 900€/dept/mois | 2-5 employés IA par département + Core OS |
| **Core OS** | Gratuit | Workspace, RBAC, Approbations, Audit Log, Scheduler |

> **Comparaison** : Une équipe de 39 employés traditionnels coûte ~175 500€/mois (salaire moyen 4 500€).  
> **Économie : 166 500€/mois**.

---

## 🏛️ Départements (11)

| Département | Employés IA | Rôles clés | Status |
|-------------|-------------|------------|--------|
| **Direction** | 2 | CGO (Sophie Marchand), QCO (Jean-Michel Fournier) | ✅ Complet |
| **Marketing** | 5 | SEO Strategist, Content Manager, Ads Optimizer, Social Media | ✅ Complet |
| **Commercial** | 4 | Lead Qualifier, Sales Closer, Account Manager, Pipeline Analyst | ✅ Complet |
| **Finance** | 3 | DAF IA, Comptable Analytique, Contrôleur de Gestion | ✅ Complet |
| **Sécurité** | 3 | RSSI IA, Compliance Officer, Auditeur Sécurité | ✅ Complet |
| **Produit** | 4 | CPO IA, Product Manager, UX Researcher, Product Analyst | ✅ Complet |
| **Ingénierie** | 5 | CTO IA, Lead Developer, DevOps, QA Specialist, Tech Writer | ✅ Complet |
| **Data** | 4 | CDO IA, Data Engineer, Data Analyst, ML Engineer | ✅ Complet |
| **Support** | 3 | Head of Support IA, Customer Success, Technical Support | ✅ Complet |
| **Governance** | 3 | Chief of Staff IA, Project Manager, Operations Analyst | ✅ Complet |
| **RH** | 2 | DRH IA, Talent Manager | ✅ Complet |
| **Juridique** | 1 | Directeur Juridique IA | ✅ Complet |

**Total : 39 employés IA** (2 Direction + 37 dans 11 départements).

---

## ✨ Core OS (Toujours inclus)

| Feature | Description |
|---------|-------------|
| **Workspace** | Isolation multi-tenant complète |
| **RBAC** | 5 niveaux de permissions (Owner → Viewer) |
| **Approval Gate** | Validation humaine des actions critiques |
| **Audit Log** | Traçabilité immuable de toutes les actions |
| **Scheduler** | Planification des tâches (pg_cron) |
| **Evidence Bundles** | Transparence IA avec sources de données |
| **Integrations Hub** | Connecteurs Google, Meta, Stripe |
| **Voice Commands** | Commandes vocales via ElevenLabs |
| **i18n** | 4 langues (FR, EN, ES, DE) |

---

## 🤖 Agents IA

### Architecture

L'AI Gateway centralise tous les appels IA avec :
- **Validation stricte** : Schema JSON standardisé pour tous les agents
- **Retry automatique** : Réparation des réponses malformées
- **Traçabilité** : Logging complet dans `ai_requests` et `agent_runs`
- **Rate limiting** : Quotas par plan (Free → Agency)

### Modèles Utilisés

| Purpose | Modèle | Cas d'usage |
|---------|--------|-------------|
| `cgo_plan` | google/gemini-3-pro-preview | Orchestration stratégique niveau McKinsey |
| `qa_review` | google/gemini-3-pro-preview | Validation compliance & éthique Big Four |
| `seo_audit` | google/gemini-3-flash-preview | Analyse SEO bulk niveau Botify/Ahrefs |
| `copywriting` | google/gemini-3-flash-preview | Création de contenu niveau agence premium |
| `analysis` | google/gemini-3-flash-preview | Analyses data-driven niveau FAANG |

### Standard d'Excellence

Chaque agent IA est formé avec un **cadre d'excellence Grandes Écoles** :
- **Rigueur analytique** (Polytechnique/CentraleSupélec) : Approche scientifique, data-driven
- **Vision stratégique** (HEC/ESSEC/INSEAD) : Pensée systémique, création de valeur
- **Culture générale** (Sciences Po/ENS) : Contexte macro-économique, sociologique
- **Excellence opérationnelle** (McKinsey/BCG mindset) : Frameworks éprouvés, livrables conseil

> **Documentation complète** : [docs/AI_AGENTS.md](./docs/AI_AGENTS.md)

### Agents Clés

| Agent | Rôle | Responsabilités |
|-------|------|-----------------|
| **Sophie Marchand** | Chief Growth Officer (CGO) | Orchestration, priorisation ICE, coordination |
| **Jean-Michel Fournier** | Quality & Compliance Officer (QCO) | Validation éthique, anti-spam, anti-plagiat |
| **Marie Dupont** | SEO Tech Auditor | Audit technique, indexation, performance |
| **Thomas Laurent** | Content Strategist | Stratégie contenu, briefs, clusters |

---

## 🛠️ Stack Technique

### Frontend
- **React 18** + TypeScript
- **Vite** - Build ultra-rapide
- **Tailwind CSS** + **shadcn/ui** - Design system moderne (50+ composants)
- **TanStack Query** - State management serveur
- **React Router** - Navigation SPA
- **i18next** - Internationalisation (4 langues, 551 clés chacune)

### Backend (Lovable Cloud)
- **Supabase** - PostgreSQL avec 131 tables
 - **Edge Functions** (Deno) - 38 fonctions serverless déployées
 - **Row Level Security** - 325+ policies pour isolation multi-tenant
- **pg_cron** - Exécutions planifiées

### Intégrations
- **Google APIs** : Analytics, Search Console, Ads, YouTube, Business Profile
- **Meta APIs** : Marketing API, Instagram, Conversions API
- **Stripe** : Checkout, Webhooks, Customer Portal
- **Lovable AI Gateway** : Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 Pro

> **Documentation architecture** : [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 📁 Structure du Projet

```
src/
├── components/          # 50+ composants UI réutilisables
│   ├── ai/             # AIAssistant, VoiceAssistant
│   ├── auth/           # Guards, ProtectedRoute, ServiceGuard
│   ├── cockpit/        # ExecutiveSummary, PriorityActions, QuickLaunchers
│   ├── evidence/       # EvidenceBundleCard, EvidenceBundleViewer
│   └── ui/             # shadcn/ui components
├── hooks/              # 40+ custom hooks (useWorkspace, useServices, etc.)
├── lib/agents/         # Définitions des agents IA
├── pages/dashboard/    # 41 pages dashboard
└── i18n/locales/       # Traductions (FR, EN, ES, DE, NL, IT, PT)

supabase/
├── functions/          # 38 Edge Functions
│   ├── ai-gateway/     # Proxy IA centralisé
│   ├── run-executor/   # Orchestrateur des runs
│   ├── oauth-*/        # OAuth sécurisé
│   └── stripe-*/       # Intégration Stripe
└── migrations/         # Migrations SQL

docs/
├── PLATFORM_AUDIT.md   # Statut et roadmap
├── AI_AGENTS.md        # Documentation IA
└── ARCHITECTURE.md     # Architecture technique
```

---

## 🔐 Sécurité

| Feature | Implementation |
|---------|----------------|
| **RLS** | 131 tables avec 310+ Row Level Security policies (v7) |
 | **RLS** | 131 tables avec 325+ Row Level Security policies |
| **Encryption** | AES-GCM 256-bit pour tokens OAuth |
| **HMAC** | Protection anti-rejeu des états OAuth avec nonces |
| **Validation** | Zod schemas + sanitization XSS + input length limits |
| **Audit Trail** | Trigger immuable sur audit_log (anti-modification) |
| **Rate Limiting** | 100 req/min par workspace + quotas mensuels |
| **SECURITY DEFINER** | 8 fonctions avec search_path fixe |
| **Role-Based Access** | Permissions granulaires (manage_team, approve_actions, view_audit) |

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou bun

### Installation

```bash
# Cloner le repo
git clone <YOUR_GIT_URL>
cd growth-os

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

### Variables d'Environnement

Les variables sont gérées automatiquement par Lovable Cloud :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Secrets (Backend)

Configurés dans Lovable Cloud Secrets :
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `META_APP_ID` / `META_APP_SECRET`
- `TOKEN_ENCRYPTION_KEY` (64 caractères hex)
- `OAUTH_STATE_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `LOVABLE_API_KEY` (auto-généré)

---

## 📊 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test -- --coverage

# Smoke tests
npm run test src/test/smoke.test.ts
```

**Suite de tests** : 290+ tests couvrant :
- ✅ Auth et permissions (RBAC 5 niveaux)
- ✅ RLS et sécurité (260+ policies)
- ✅ Hooks et composants (40+ hooks)
- ✅ Agents IA (39 agents)
- ✅ Edge Functions (38 fonctions)
- ✅ Workflows critiques (E2E)
- ✅ Validation de formulaires (Zod)
- ✅ Smoke tests complets (25 scénarios)

---

## 🌐 Déploiement

### Via Lovable

1. Ouvrir [Lovable](https://lovable.dev)
2. Cliquer sur **Share → Publish**
3. (Optionnel) Configurer un domaine personnalisé dans **Settings → Domains**

### URLs

- **Production** : https://agent-growth-automator.lovable.app
- **Preview** : https://id-preview--c548a033-0937-4830-bc84-bb2548968cd3.lovable.app

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [PLATFORM_AUDIT.md](./docs/PLATFORM_AUDIT.md) | Statut complet et roadmap |
 | [AUDIT_PLATEFORME_2026-02-05.md](./docs/AUDIT_PLATEFORME_2026-02-05.md) | Audit final 100/100 |
| [AI_AGENTS.md](./docs/AI_AGENTS.md) | Documentation des agents IA |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Architecture technique |
| [Lovable Docs](https://docs.lovable.dev) | Documentation Lovable |
| [Supabase Docs](https://supabase.com/docs) | Documentation Supabase |

---

## 🏗️ Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React 18 + Vite + Tailwind CSS + shadcn/ui                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Landing  │  │ Cockpit  │  │ 41 Pages │  │ AI Assistant     │ │
│  │ Page     │  │ Exécutif │  │ Dashboard│  │ Voice Commands   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 38 EDGE FUNCTIONS                          │  │
│  │  ai-gateway │ run-executor │ oauth-* │ stripe-* │ sync-*  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 POSTGRESQL (131 tables)                    │  │
 │  │  workspaces │ user_roles │ agent_runs │ audit_log          │  │
 │  │  + RLS (325+ policies) + pg_cron (Scheduler)               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Google   │  │ Meta     │  │ Stripe   │  │ Lovable AI       │ │
│  │ APIs     │  │ APIs     │  │ Payments │  │ Gemini 3 Pro+Flash│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Licence

**Propriétaire** - © 2026 EmotionsCare Sasu - Tous droits réservés

Ce logiciel est propriétaire et ne peut être copié, modifié ou redistribué sans autorisation écrite explicite.

**Contact** : contact@emotionscare.com

---

## 🤝 Support

- **Email** : contact@emotionscare.com
- **Documentation** : [docs/](./docs/)
- **Issues** : Via le dépôt GitHub

---

**Construit avec ❤️ sur [Lovable](https://lovable.dev)**
