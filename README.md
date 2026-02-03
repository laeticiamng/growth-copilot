# Growth OS - Your Portable Company

> L'entreprise digitale complète. Abonnez-vous à la full company ou sélectionnez uniquement les départements dont vous avez besoin.

## 🏢 Vision

Growth OS est un système d'exploitation d'entreprise portable qui remplace les équipes traditionnelles par des employés IA premium. Chaque département (Marketing, Commercial, Finance, Sécurité, etc.) est composé d'agents IA spécialisés qui travaillent 24/7 avec un standard de compétence premium.

**Philosophie** : Compétence premium, livrée simplement. Zéro jargon technique.

## 💼 Modèle Tarifaire

| Formule | Prix | Inclus |
|---------|------|--------|
| **Full Company** | 9 000€/mois | 37 employés IA, 9 départements, Core OS |
| **À la carte** | 1 900€/dept/mois | 3-5 employés IA par département + Core OS |
| **Core OS** | Gratuit | Workspace, RBAC, Approbations, Audit Log, Scheduler |

> Comparaison : Une équipe de 37 employés traditionnels coûte ~166 500€/mois (salaire moyen 4 500€). Économie : **157 500€/mois**.

## 🏛️ Départements (9)

| Département | Employés IA | Rôles clés |
|-------------|-------------|------------|
| **Marketing** | 5 | Directeur Marketing IA, SEO Strategist, Content Manager, Ads Optimizer, Social Media Manager |
| **Commercial** | 4 | Directeur Commercial IA, Lead Qualifier, Sales Closer, Account Manager |
| **Finance** | 3 | DAF IA, Comptable Analytique, Contrôleur de Gestion |
| **Sécurité** | 3 | RSSI IA, Compliance Officer, Auditeur Sécurité |
| **Produit** | 4 | CPO IA, Product Manager, UX Researcher, Product Analyst |
| **Ingénierie** | 5 | CTO IA, Lead Developer, DevOps Engineer, QA Specialist, Technical Writer |
| **Data** | 4 | CDO IA, Data Engineer, Data Analyst, ML Engineer |
| **Support** | 3 | Head of Support IA, Customer Success Manager, Technical Support |
| **Gouvernance** | 3 | Chief of Staff IA, Project Manager, Operations Analyst |

## ✨ Core OS (Toujours inclus)

- **Workspace** : Isolation multi-tenant complète
- **RBAC** : 5 niveaux de permissions (Owner → Viewer)
- **Approval Gate** : Validation humaine des actions critiques
- **Audit Log** : Traçabilité complète de toutes les actions
- **Scheduler** : Planification des tâches et automations
- **Integrations Hub** : Connecteurs Google, Meta, et plus
- **Voice Commands** : Commandes vocales via ElevenLabs

## 🛠️ Stack Technique

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** + **shadcn/ui** - Design system moderne
- **TanStack Query** - Gestion d'état serveur
- **React Router** - Navigation SPA
- **i18next** - Internationalisation (FR/EN)

### Backend (Lovable Cloud)
- **Supabase** - Base de données PostgreSQL
- **Edge Functions** (Deno) - API serverless
- **Row Level Security** - Isolation multi-tenant stricte
- **Realtime** - WebSockets pour mises à jour live

### Intégrations
- **Google APIs** : Analytics, Search Console, Ads, YouTube, Business Profile
- **Meta APIs** : Marketing API, Instagram, Conversions API
- **AI Gateway** : Modèles Gemini, GPT-5 via Lovable AI

## 📁 Structure du Projet

```
src/
├── components/          # Composants UI réutilisables
│   ├── ai/             # Assistant IA & Voice
│   ├── auth/           # Guards, ProtectedRoute, ServiceGuard
│   ├── cockpit/        # Widgets dashboard exécutif
│   ├── diagnostics/    # Panel de debug
│   ├── integrations/   # Connecteurs Google/Meta
│   ├── kpi/            # Cartes et graphiques KPI
│   ├── landing/        # Page d'accueil publique
│   ├── layout/         # DashboardLayout
│   ├── upsell/         # Écrans d'upsell modulaires
│   └── ui/             # Composants shadcn/ui
├── hooks/              # Custom hooks (useWorkspace, useServices, etc.)
├── lib/
│   ├── agents/         # Définitions des agents IA
│   ├── validation/     # Schémas Zod, sanitization, business rules
│   └── statistics.ts   # Calculs A/B testing
├── pages/
│   ├── dashboard/      # 25+ pages dashboard
│   └── Auth.tsx        # Authentification
└── i18n/               # Traductions FR/EN

supabase/
├── functions/          # 25+ Edge Functions
│   ├── ai-gateway/     # Proxy IA multi-modèles
│   ├── oauth-init/     # Initialisation OAuth
│   ├── oauth-callback/ # Callback OAuth sécurisé
│   ├── seo-crawler/    # Crawler SEO
│   └── ...
└── migrations/         # Migrations SQL
```

## 🔐 Sécurité

- **RLS (Row Level Security)** : Isolation des données par workspace
- **Chiffrement AES-GCM 256-bit** : Tokens OAuth chiffrés at-rest
- **HMAC-SHA256** : Protection anti-rejeu des états OAuth
- **Validation Zod** : Sanitization de toutes les entrées
- **Protection XSS** : Échappement automatique du HTML
- **Service Gating** : Accès modulaire par département activé

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

Configurés dans Lovable Cloud :
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `META_APP_ID` / `META_APP_SECRET`
- `TOKEN_ENCRYPTION_KEY` (64 caractères hex)
- `OAUTH_STATE_SECRET`
- `ELEVENLABS_API_KEY`

## 📊 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test -- --coverage
```

**Couverture actuelle** : 64+ tests (modules, hooks, sécurité, smoke tests, E2E)

## 🌐 Déploiement

1. Ouvrir [Lovable](https://lovable.dev)
2. Cliquer sur **Share → Publish**
3. (Optionnel) Configurer un domaine personnalisé dans **Settings → Domains**

## 📖 Documentation

- [Documentation Lovable](https://docs.lovable.dev)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 📄 Licence

Propriétaire - © 2026 EmotionsCare Sasu - Tous droits réservés

**Contact** : m.laeticia@hotmail.fr

---

**Construit avec ❤️ sur [Lovable](https://lovable.dev)**
