# Growth OS — Connected Growth Cockpit

> Cockpit growth connecte aux donnees, oriente detection d'anomalies, priorisation d'actions, gouvernance, preuve et suivi d'impact.

[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://agent-growth-automator.lovable.app)
[![Tests](https://img.shields.io/badge/Tests-290%2B%20passing-brightgreen)](./src/test)
[![Audit](https://img.shields.io/badge/Audit-100%2F100-brightgreen)](./docs/AUDIT_PLATEFORME_2026-02-05.md)
[![Languages](https://img.shields.io/badge/i18n-7%20languages-blue)](./src/i18n)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

---

## What is Growth OS?

Growth OS is a **connected growth cockpit** for operators, agencies and brands. It replaces dashboard sprawl and manual reporting with a single governed workspace where teams can:

1. **Connect growth data** — Unify GA4, Search Console, Meta, CRM and site data inside one workspace-aware model
2. **Detect anomalies** — Surface drops, channel drift and conversion friction with evidence-backed context
3. **Prioritize actions** — Rank decisions by expected impact, risk level, owner and next step
4. **Route approvals** — Gate sensitive actions through human validation with audit trail
5. **Track outcomes** — Measure the real impact of every approved action over time

Marketing execution (SEO, Ads, Content, Social) remains available as a downstream capability — not the headline promise.

---

## Who is it for?

| Audience | Use case |
|----------|----------|
| **Solo operators** | One cockpit for acquisition, retention and revenue signals |
| **Agency teams** | Multi-workspace client operations with shared governance |
| **Brand growth teams** | Cross-channel anomaly monitoring with RBAC and enterprise support |

---

## Pricing

| Plan | Price | Includes |
|------|-------|----------|
| **Solo** | 490 EUR/month | 1 workspace, connected signals, evidence-backed recommendations, approval gate |
| **Agency** | 1,900 EUR/month | Multi-workspace operations, shared approvals, prioritized action queues |
| **Scale** | Custom | Advanced RBAC, cross-channel monitoring, enterprise integrations, dedicated support |

All plans include Core OS: Workspace, RBAC, Approval Gate, Audit Log, Scheduler, Evidence Bundles, Integrations Hub.

14-day free trial. No credit card required.

---

## Core OS (always included)

| Feature | Description |
|---------|-------------|
| **Workspace** | Multi-tenant isolation with workspace-level data separation |
| **RBAC** | 5 permission levels (Owner, Admin, Manager, Editor, Viewer) |
| **Approval Gate** | Human validation for sensitive actions with risk-level routing |
| **Audit Log** | Immutable, append-only trail of every action |
| **Scheduler** | Planned execution via pg_cron |
| **Evidence Bundles** | Data snapshots that justify each recommendation |
| **Integrations Hub** | Connectors for Google, Meta, Stripe |
| **i18n** | 7 languages (FR, EN, ES, DE, IT, NL, PT) |

---

## Growth Modules

| Module | Capabilities |
|--------|-------------|
| **Marketing** | SEO, Content, Ads, Social Media, CRO |
| **Sales** | Pipeline, Outreach, CRM, Lead Scoring |
| **Finance** | ROI Tracking, Budget Alerts, Reporting |
| **Security** | Access Review, Compliance, Audit Logs |
| **Product** | Roadmap, OKRs, Prioritization |
| **Engineering** | Release Gates, QA, Delivery Health |
| **Data** | Analytics, Funnels, Cohorts |
| **Support** | Tickets, Knowledge Base, Reviews |
| **Governance** | Policies, IT Hygiene, Access Control |
| **HR** | Onboarding, Team Management, Talent |
| **Legal** | Contracts, GDPR, Compliance |

Each module feeds the cockpit with signals and actionable recommendations.

---

## Eco-Transition Module

The `/dashboard/eco-transition` module provides real backend-driven data for carbon accounting, green roadmaps, ESG snapshots and subsidy matching:

- `eco_emission_sources` — Scope 1/2/3 emission mapping
- `eco_roadmap_actions` — Decarbonation actions ranked by impact
- `eco_subsidy_projects` — Subsidy and grant pipeline
- `eco_monthly_metrics` — Monthly energy/recycling/carbon intensity series
- `eco_reporting_snapshots` — ESG/CSRD exportable snapshots

---

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** — Fast build tooling
- **Tailwind CSS** + **shadcn/ui** — Modern design system (50+ components)
- **TanStack Query** — Server state management
- **React Router** — SPA navigation
- **i18next** — 7 languages, 551 keys each

### Backend (Lovable Cloud)
- **Supabase** — PostgreSQL with 131 tables
- **Edge Functions** (Deno) — 51 serverless functions
- **Row Level Security** — 325+ policies for multi-tenant isolation
- **pg_cron** — Scheduled execution

### Integrations
- **Google APIs**: Analytics, Search Console, Ads, YouTube, Business Profile
- **Meta APIs**: Marketing API, Instagram, Conversions API
- **Stripe**: Checkout, Webhooks, Customer Portal
- **AI Gateway**: Gemini 3 Pro, Gemini 3 Flash

---

## Project Structure

```
src/
├── components/          # 220+ React components
│   ├── cockpit/        # ExecutiveSummary, PriorityActions, ApprovalsWidget
│   ├── evidence/       # EvidenceBundleCard, EvidenceBundleViewer
│   ├── landing/        # Hero, Pricing, Features, Services
│   └── ui/             # shadcn/ui components
├── hooks/              # 67+ custom hooks (useWorkspace, useApprovals, etc.)
├── lib/agents/         # AI module definitions & orchestration
├── pages/dashboard/    # 41+ dashboard pages
└── i18n/locales/       # Translations (FR, EN, ES, DE, IT, NL, PT)

supabase/
├── functions/          # 51 Edge Functions
│   ├── ai-gateway/     # Centralized AI proxy
│   ├── approval-engine/ # Approval gate logic
│   ├── signal-ingest/  # Signal ingestion
│   ├── stripe-*/       # Stripe integration
│   └── oauth-*/        # Secure OAuth
└── migrations/         # SQL migrations

docs/
├── PLATFORM_AUDIT.md   # Status and roadmap
├── AI_AGENTS.md        # Module documentation
├── ARCHITECTURE.md     # Technical architecture
└── SELF_HOSTING.md     # Self-hosting guide
```

---

## Security

| Feature | Implementation |
|---------|----------------|
| **RLS** | 131 tables with 325+ Row Level Security policies |
| **Encryption** | AES-GCM 256-bit for OAuth tokens |
| **HMAC** | Anti-replay protection for OAuth states with nonces |
| **Validation** | Zod schemas + XSS sanitization + input length limits |
| **Audit Trail** | Immutable trigger on audit_log (anti-modification) |
| **Rate Limiting** | 100 req/min per workspace + monthly quotas |
| **RBAC** | Granular permissions (manage_team, approve_actions, view_audit) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
git clone <YOUR_GIT_URL>
cd growth-copilot
npm install
npm run dev
```

### Supabase Database

Apply migrations before using backend-driven modules:

```bash
supabase db reset
# or
supabase migration up
```

### Environment Variables

Managed automatically by Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Secrets (Backend)

Configured in Lovable Cloud Secrets:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `META_APP_ID` / `META_APP_SECRET`
- `TOKEN_ENCRYPTION_KEY` (64 hex characters)
- `OAUTH_STATE_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `LOVABLE_API_KEY` (auto-generated)

### Anti-mock Policy

- No demo data is injected automatically into user workspaces
- Modules show either real data or an actionable empty state
- Frontend demo mode is a UI-only state — it does not hydrate the dashboard with fake records

---

## Tests

```bash
npm run test
npm run test -- --coverage
npm run test src/test/smoke.test.ts
```

**Test suite**: 290+ tests covering auth, RLS, hooks, components, edge functions, workflows and smoke scenarios.

---

## Deployment

### Via Lovable

1. Open [Lovable](https://lovable.dev)
2. Click **Share > Publish**
3. (Optional) Configure a custom domain in **Settings > Domains**

---

## Documentation

| Document | Description |
|----------|-------------|
| [PLATFORM_AUDIT.md](./docs/PLATFORM_AUDIT.md) | Platform status and roadmap |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture |
| [AI_AGENTS.md](./docs/AI_AGENTS.md) | Module documentation |
| [SELF_HOSTING.md](./docs/SELF_HOSTING.md) | Self-hosting guide |
| [THREAT_MODEL.md](./docs/THREAT_MODEL.md) | Security threat model |

---

## License

**Proprietary** — (c) 2026 EmotionsCare Sasu — All rights reserved

This software is proprietary and may not be copied, modified or redistributed without explicit written authorization.

**Contact**: contact@emotionscare.com

---

## Support

- **Email**: contact@emotionscare.com
- **Documentation**: [docs/](./docs/)
- **Issues**: Via the GitHub repository

---

**Built with Lovable** — [lovable.dev](https://lovable.dev)
