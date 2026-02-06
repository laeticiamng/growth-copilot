

# Pre-Publication Fix: Integrations Page i18n Migration

## Audit Summary

After a comprehensive multi-role audit, the platform is nearly publication-ready. The previous rounds fixed Sites, HR, Legal, Ops, and Pricing. **One critical dashboard page remains with hardcoded French strings**: `Integrations.tsx`.

### CEO Perspective
The Integrations page is a core user touchpoint -- it's where users connect Google and Meta accounts. Hardcoded French here blocks international adoption.

### CISO/DPO Perspective
No new security or GDPR issues found. RLS policies are in place (131 tables). OAuth flow error messages need i18n but are functionally correct.

### Head of Design / Beta Tester Perspective
The landing page renders correctly on desktop and mobile. No runtime errors. The Pricing section now displays translated department names and roles. The dashboard is functional.

---

## What Needs Fixing

**`src/pages/dashboard/Integrations.tsx`** contains ~50 hardcoded French strings:

| Category | Examples | Count |
|----------|----------|-------|
| Tool descriptions | "Analyse du trafic...", "Positions SEO..." | 13 |
| Tool capabilities | "Sessions & utilisateurs", "CTR organique" | ~40 items |
| UI labels/badges | "connectés", "disponibles", "à venir", "Actif", "Bientôt" | 12 |
| Tabs | "Vue d'ensemble" | 1 |
| Toast messages | "Workspace non selectionne", "Erreur lors de l'autorisation" | 3 |
| Card content | "Comment ca fonctionne?", step descriptions | 6 |
| Buttons | "Connecte", "Autoriser" | 4 |

The i18n keys already exist in `integrationsPage.*` namespace in both `en.ts` and `fr.ts`.

## Plan

### 1. Add missing locale keys for tool descriptions and capabilities

Add to both `en.ts` and `fr.ts` under `integrationsPage`:
- 13 tool description keys (ga4Desc, gscDesc, gadsDesc, etc.)
- ~40 capability keys grouped by tool (ga4Cap1-4, gscCap1-4, etc.)
- Tool name keys where needed (e.g., "Calendrier" -> calendar name key)

### 2. Convert `platformTools` to a dynamic `getPlatformTools(t)` function

Same pattern as Sites/Pricing -- move the static array into a function that accepts `t` and uses `t("integrationsPage.*")` for all user-facing strings.

### 3. Replace inline hardcoded strings

Replace all remaining inline French strings with existing `t()` calls:
- Tab triggers: `"Vue d'ensemble"` -> `t("integrationsPage.overview")`
- Badges: `"connectes"` -> `t("integrationsPage.connected")`
- Buttons: `"Autoriser"` -> `t("integrationsPage.authorize")`
- Toast messages: use existing keys `workspaceNotSelected`, `selectSiteFirst`, `authError`
- Card content: use existing keys `howItWorks`, `step1`-`step3`, `noApiNeeded`, etc.

### Files Modified

| File | Changes |
|------|---------|
| `src/i18n/locales/en.ts` | Add ~55 keys under `integrationsPage` (tool descriptions + capabilities) |
| `src/i18n/locales/fr.ts` | Add ~55 keys under `integrationsPage` (tool descriptions + capabilities) |
| `src/pages/dashboard/Integrations.tsx` | Convert `platformTools` to `getPlatformTools(t)`, replace all inline strings |

**3 files modified. No structural changes.**
