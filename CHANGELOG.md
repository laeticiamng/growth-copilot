# Changelog

All notable changes to Growth OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-03

### Added
- **Service Catalog**: New `/dashboard/services` page with detailed info for each department
- **ROI Dashboard**: `/dashboard/roi` with real-time cost comparison vs human teams
- **Status Page**: `/dashboard/status` showing implementation status (✅/🟡/🔴)
- **Roadmap Page**: Public roadmap at `/roadmap`
- **Demo Mode**: Toggle between demo and production modes with visual indicators
- **AI Cost Dashboard**: Real-time tracking of AI usage costs per action
- **Starter Plan**: New 490€/month plan with limited quotas (50 runs, 1 site, 2 users)
- **New Languages**: Added Italian, Portuguese, and Dutch translations
- **Self-Hosting Docs**: `docs/SELF_HOSTING.md` with deployment instructions

### Changed
- Updated AI Gateway to use real Lovable AI models (Gemini 3 Pro/Flash Preview)
- Enhanced Privacy Policy with DPA section and data retention table
- Improved Billing page with Starter plan card

### Security
- Added `SECURITY.md` with vulnerability reporting and best practices
- Added `docs/THREAT_MODEL.md` with OWASP checklist

### Documentation
- Added `CONTRIBUTING.md` with contribution guidelines and ethics charter
- Added `docs/AGENT_OUTPUT_EXAMPLES.md` with concrete agent output examples

## [1.1.0] - 2026-01-28

### Added
- **Evidence Bundles**: Full transparency system for AI decisions
- **Executive Cockpit**: Central command center with RAG status
- **Voice Commands**: ElevenLabs integration for voice control
- **HR Module**: Team management, onboarding, time-off
- **Legal Module**: Contracts, compliance, GDPR requests
- **Access Review**: Security audit for user permissions
- **Smart Alerts**: Real-time notifications via Supabase Realtime

### Changed
- Migrated to modular service architecture (Core OS + Departments)
- Approval queue now supports partial approvals
- Policy engine supports risk-based autopilot rules

### Fixed
- OAuth token refresh race condition
- Mobile navigation menu overlap
- Dark mode contrast issues in charts

## [1.0.0] - 2026-01-15

### Added
- Initial release of Growth OS
- 10 Core Departments: Marketing, Sales, Finance, Security, Product, Engineering, Data, Support, HR, Governance
- 37 AI Employees with distinct personas
- Core OS: Workspace, RBAC, Audit Log, Scheduler, AI Gateway
- Integrations: Google (GA4, GSC, Ads, GBP, YouTube), Meta (Ads, Pages, Instagram)
- Stripe billing integration
- Multi-language support (EN, FR, ES, DE)

### Security
- Row Level Security (RLS) on all tables
- JWT validation on all Edge Functions
- Encrypted token storage
- Immutable audit log

---

## Upgrade Guide

### From 1.1.x to 1.2.0

1. No database migrations required
2. New pages are automatically available
3. Demo mode toggle in workspace settings

### From 1.0.x to 1.1.0

1. Run pending database migrations
2. Enable Evidence Bundles in workspace settings
3. Configure Smart Alerts preferences
