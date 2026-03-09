

## Eco-Transition Automation Vertical — Implementation Plan

### Overview
Add a full "Eco-Transition" department to the Growth Copilot dashboard with 5 sub-modules: Carbon Footprint Automator (Sankey diagram), Green Transition Roadmap (AI-generated), ESG Report Generator, Subsidy Matcher, and Green KPI Dashboard. All contained in a single new page with tab navigation, plus sidebar integration.

### Architecture

```text
src/
├── pages/dashboard/EcoTransition.tsx        # Main page with 5 tabs
├── components/eco/
│   ├── CarbonSankeyDiagram.tsx              # Animated SVG Sankey
│   ├── GreenRoadmap.tsx                     # AI roadmap with actions table
│   ├── ESGReportGenerator.tsx               # Report builder + PDF export
│   ├── SubsidyMatcher.tsx                   # Grants panel with deadline alerts
│   ├── GreenKPIDashboard.tsx                # Live KPI cards + charts
│   └── index.ts                            # Barrel export
```

### Changes by File

**1. `src/pages/dashboard/EcoTransition.tsx`** (new)
- Tab-based layout with 5 tabs: Carbon Footprint, Roadmap, ESG Reports, Subsidies, Green KPIs
- Green-themed header with leaf icon and sustainability branding

**2. `src/components/eco/CarbonSankeyDiagram.tsx`** (new)
- SVG-based animated Sankey diagram showing Scope 1/2/3 flows
- Categories: Energy, Transport, Purchases, Digital, Waste, etc. with percentages
- Simulated accounting connector UI (Pennylane, Sage, QuickBooks buttons)
- CSS animations for flow paths using stroke-dasharray/dashoffset

**3. `src/components/eco/GreenRoadmap.tsx`** (new)
- 3-year prioritized action plan table
- Each row: action name, CO2 reduction (tCO2e), cost, subsidies (ADEME/BPI), net ROI, difficulty badge
- "Generate with AI" button (calls existing AI assistant edge function)
- Timeline view with Year 1/2/3 grouping

**4. `src/components/eco/ESGReportGenerator.tsx`** (new)
- Quarterly/Annual report selector
- CSRD-compliant sections preview (E1-E5, S1-S4, G1-G2)
- PDF download button (client-side generation)
- Status indicators for data completeness per section

**5. `src/components/eco/SubsidyMatcher.tsx`** (new)
- Cards for each subsidy: ADEME, France 2030, BPI, regional
- Deadline countdown badges with alert colors
- Eligibility score per action from roadmap
- Link to application portals

**6. `src/components/eco/GreenKPIDashboard.tsx`** (new)
- 4 KPI cards: Energy Consumption Trend, Waste Reduction %, Renewable Energy %, Carbon Intensity (gCO2/€)
- Recharts line/area charts for trends
- Green color palette (emerald/green tokens)

**7. `src/components/layout/DashboardLayout.tsx`** (edit)
- Add new "Eco-Transition" department in `getAdvancedDepartments` between "compliance" and "config", with `Leaf` icon and `text-green-500` color
- Sub-items: Carbon Footprint, Roadmap, ESG Reports, Subsidies, Green KPIs (all pointing to `/dashboard/eco` with hash anchors or as single route)

**8. `src/App.tsx`** (edit)
- Add lazy import for `EcoTransition`
- Add route: `/dashboard/eco` wrapped in `DashboardRoute`

**9. `src/i18n/locales/fr.ts` & `en.ts`** (edit)
- Add ~25 keys under `eco.*` namespace: `eco.title`, `eco.carbonFootprint`, `eco.roadmap`, `eco.esgReport`, `eco.subsidies`, `eco.greenKpi`, plus descriptions and labels

### Visual Design
- Green sustainability palette: `emerald-500`, `green-600`, `teal-500` for accents
- Leaf/tree/globe icons from Lucide (`Leaf`, `TreePine`, `Globe2`, `Zap`)
- Sankey diagram uses gradient fills from gray → green to show emission reduction potential
- KPI cards use green glassmorphism style consistent with existing dashboard cards

### Demo Data
All components use hardcoded demo data (no new database tables needed for MVP). Data simulates a typical SME carbon profile (~450 tCO2e/year). The AI roadmap generation can optionally call the existing `ai-assistant` edge function.

### No Database Changes Required
This is a frontend-only feature for the initial release. Future iterations could add tables for carbon data persistence.

