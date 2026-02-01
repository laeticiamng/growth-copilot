# Growth OS - Plateforme Marketing IA

> Plateforme marketing tout-en-un propulsée par 12 agents IA spécialisés pour automatiser SEO, Ads, CRM, Social et CRO.

## 🚀 Aperçu

Growth OS est une plateforme SaaS complète qui centralise et automatise l'ensemble des opérations marketing digitales. Grâce à des agents IA spécialisés, elle permet aux équipes marketing de gérer efficacement leur croissance sur tous les canaux.

## ✨ Fonctionnalités Principales

### 📊 SEO & Contenu
- **SEO Technique** : Audits automatisés, crawl de site, détection d'erreurs (404, redirections, Core Web Vitals)
- **Stratégie Contenu** : Briefs IA, clustering de mots-clés, planification éditoriale
- **SEO Local** : Gestion Google Business Profile, suivi des avis, posts locaux

### 📈 Publicité & Acquisition
- **Google Ads** : Synchronisation des campagnes, optimisation des enchères, mots-clés négatifs
- **Meta Ads** : Gestion Facebook/Instagram Ads, CAPI intégré, audiences personnalisées
- **Analytics** : Tableaux de bord GA4, GSC, YouTube Analytics

### 🎯 CRM & Lifecycle
- **Gestion Leads** : Pipeline Kanban, scoring automatique, nurturing
- **Offres & Pricing** : Générateur d'offres, tiers de prix, validation IA
- **Automations** : Workflows déclencheurs, actions automatiques

### 📱 Social & Réputation
- **Social Media** : Planification multi-plateforme, calendrier éditorial
- **Réputation** : Monitoring des avis, réponses IA, alertes temps réel
- **Concurrence** : Veille concurrentielle, analyse des gaps

### 🧪 CRO & Expérimentation
- **A/B Testing** : Tests statistiques, calcul de significativité
- **Variants** : Gestion des expériences, tracking des conversions

### 🤖 Agents IA (12 agents spécialisés)
| Agent | Rôle |
|-------|------|
| SEO Auditor | Audit technique et recommandations |
| Content Strategist | Génération de briefs et contenus |
| Analytics Agent | Analyse des données et insights |
| Ads Optimizer | Optimisation des campagnes publicitaires |
| Meta Ads Agent | Gestion spécifique Meta/Facebook |
| Copywriting Agent | Rédaction publicitaire et landing pages |
| Competitive Intel | Veille concurrentielle |
| Media Promotion | Distribution et promotion média |
| CGO Agent | Chief Growth Officer virtuel |
| QCO Agent | Quality Control & Compliance |
| Report Generator | Rapports automatisés |
| Approval Engine | Validation et workflows d'approbation |

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
- **Row Level Security** - Isolation multi-tenant
- **Realtime** - WebSockets pour mises à jour live

### Intégrations
- **Google APIs** : Analytics, Search Console, Ads, YouTube, Business Profile
- **Meta APIs** : Marketing API, Instagram, Conversions API
- **AI Gateway** : Accès aux modèles Gemini, GPT-5

## 📁 Structure du Projet

```
src/
├── components/          # Composants UI réutilisables
│   ├── ai/             # Assistant IA
│   ├── auth/           # Auth guards, protection routes
│   ├── diagnostics/    # Panel de debug
│   ├── integrations/   # Connecteurs Google/Meta
│   ├── kpi/            # Cartes et graphiques KPI
│   ├── landing/        # Page d'accueil
│   ├── layout/         # Layout dashboard
│   └── ui/             # Composants shadcn/ui
├── hooks/              # Custom hooks (useWorkspace, useAds, etc.)
├── lib/
│   ├── agents/         # Définitions des 12 agents IA
│   ├── validation/     # Schémas Zod, sanitization
│   └── statistics.ts   # Calculs A/B testing
├── pages/
│   ├── dashboard/      # 20+ pages dashboard
│   └── Auth.tsx        # Authentification
└── i18n/               # Traductions FR/EN

supabase/
├── functions/          # 25+ Edge Functions
│   ├── oauth-init/     # Initialisation OAuth
│   ├── oauth-callback/ # Callback OAuth sécurisé
│   ├── ai-gateway/     # Proxy IA multi-modèles
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
- **Rate Limiting** : Protection anti-abus côté client et serveur

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

### Secrets (Backend)

Configurés dans Lovable Cloud :
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `META_APP_ID` / `META_APP_SECRET`
- `TOKEN_ENCRYPTION_KEY` (64 caractères hex)
- `OAUTH_STATE_SECRET`

## 📊 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test -- --coverage
```

**Couverture actuelle** : 64 tests (modules, hooks, sécurité, smoke tests)

## 🌐 Déploiement

1. Ouvrir [Lovable](https://lovable.dev)
2. Cliquer sur **Share → Publish**
3. (Optionnel) Configurer un domaine personnalisé dans **Settings → Domains**

## 📖 Documentation

- [Documentation Lovable](https://docs.lovable.dev)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Construit avec ❤️ sur [Lovable](https://lovable.dev)**
