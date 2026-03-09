

## Plan: Add Eco-Transition Visibility on Landing Page

### Current State
The 5 eco-transition features (Carbon Sankey, Green Roadmap, ESG Report, Subsidy Matcher, Green KPI Dashboard) already exist as fully-built components in `src/components/eco/` and are accessible at `/dashboard/eco`. However, **none of them are mentioned or promoted on the landing page**. There is zero visibility.

### What Needs to Change

#### 1. New Landing Section: `EcoTransitionSection.tsx`
Create `src/components/landing/EcoTransitionSection.tsx` -- a dedicated section (similar in structure to `GEOSection.tsx`) that showcases the 5 eco features:
- Green/emerald color palette with leaf/sustainability iconography
- Badge: "Eco-Transition" or "Transition Ecologique"
- Headline emphasizing automated carbon footprint, ESG compliance, and subsidy matching
- 5 feature cards in a grid (Carbon Footprint Automator, Green Roadmap, ESG Report Generator, Subsidy Matcher, Green KPI Dashboard) -- each with icon, title, short description
- CTA button linking to `/auth?tab=signup`

#### 2. Add Section to Index Page
Insert `<EcoTransitionSection />` into `src/pages/Index.tsx` between `GEOSection` and `Pricing` (logical position: after technical features, before pricing).

#### 3. Add Navbar Link
Add an "Eco" entry in the navbar (`src/components/landing/Navbar.tsx`) pointing to `/#eco` with smooth scroll, similar to the existing GEO link.

#### 4. i18n Keys
Add `landing.eco.*` translation keys to both `fr.ts` and `en.ts`:
- Badge, heading, subheading
- 5 feature titles + descriptions
- CTA text

#### 5. Features Page Update
Add the eco vertical to `src/pages/Features.tsx` if it lists platform capabilities, ensuring consistency.

### Files to Create/Edit
| File | Action |
|------|--------|
| `src/components/landing/EcoTransitionSection.tsx` | Create |
| `src/components/landing/index.ts` | Export new component |
| `src/pages/Index.tsx` | Import + add section |
| `src/components/landing/Navbar.tsx` | Add "Eco" nav link |
| `src/i18n/locales/fr.ts` | Add `landing.eco.*` keys |
| `src/i18n/locales/en.ts` | Add `landing.eco.*` keys |

