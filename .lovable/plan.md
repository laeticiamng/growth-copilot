
# Pre-Publication Fix: Pricing Component i18n

## Finding

The **Pricing section** on the landing page displays hardcoded French strings visible to all users regardless of language. This is the only remaining i18n issue on the public-facing landing page.

**Affected file**: `src/components/landing/Pricing.tsx`

**Hardcoded French strings** (in the `SERVICE_MODULES` static array):
- Department names: "Commercial", "Securite", "Produit", "Ingenierie", "Gouvernance", "RH", "Juridique"
- Role titles: "Directeur Marketing IA", "Directeur Commercial IA", "DAF IA", "Comptable Analytique", "Controleur de Gestion", "RSSI IA", "Auditeur Securite", "CPO IA", "CTO IA", "CDO IA", "Head of Support IA", "Chief of Staff IA", "DRH IA", "Directeur Juridique IA"

All other landing page components (Hero, Features, HowItWorks, Services, TeamOrgChart, Testimonials, FAQ, CTA, Footer) are already fully translated.

## Plan

### 1. Add locale keys for department names and role titles

Add a `landing.pricing.modules` namespace to both `en.ts` and `fr.ts` with:
- 11 department name keys (marketing, sales, finance, security, product, engineering, data, support, governance, hr, legal)
- ~37 role title keys (one per role across all departments)

### 2. Convert `SERVICE_MODULES` to a dynamic getter function

Replace the static `SERVICE_MODULES` const with a `getServiceModules(t)` function called inside the component, using `t("landing.pricing.modules.*")` for names and roles.

### 3. Files modified

| File | Changes |
|------|---------|
| `src/i18n/locales/en.ts` | Add ~48 keys under `landing.pricing.modules` |
| `src/i18n/locales/fr.ts` | Add ~48 keys under `landing.pricing.modules` |
| `src/components/landing/Pricing.tsx` | Convert `SERVICE_MODULES` to `getServiceModules(t)` |

**3 files modified, no structural changes.**
