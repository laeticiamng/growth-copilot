# Growth OS - Documentation AI Agents

> Transparence complète sur le fonctionnement des agents IA de la plateforme.

---

## 🏛️ Architecture AI Gateway

Growth OS utilise une **AI Gateway centralisée** (`supabase/functions/ai-gateway/index.ts`) qui :

1. **Unifie tous les appels IA** - Un point d'entrée unique pour tous les agents
2. **Valide les réponses** - Schema JSON strict avec retry automatique
3. **Trace l'usage** - Chaque appel est loggé dans `ai_requests` et `agent_runs`
4. **Gère les quotas** - Rate limiting par workspace et plan

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  (React Components, Hooks, Pages)                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │ supabase.functions.invoke('ai-gateway')
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI GATEWAY                                    │
│  supabase/functions/ai-gateway/index.ts                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Auth Check  │→ │ Quota Check │→ │ Model Route │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                                  │                     │
│         ▼                                  ▼                     │
│  ┌─────────────┐              ┌─────────────────────┐           │
│  │ Log to DB   │              │ Lovable AI Gateway  │           │
│  │ ai_requests │              │ (Gemini 3 Pro/Flash)│           │
│  └─────────────┘              └─────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Modèles IA Utilisés

### Sélection par Purpose

| Purpose | Modèle | Temperature | Max Tokens | Raison |
|---------|--------|-------------|------------|--------|
| `cgo_plan` | google/gemini-3-pro-preview | 0.3 | 8192 | Orchestration stratégique, raisonnement complexe |
| `qa_review` | google/gemini-3-pro-preview | 0.1 | 4096 | Validation précise, compliance |
| `seo_audit` | google/gemini-3-flash-preview | 0.2 | 4096 | Analyse bulk, coût optimisé |
| `copywriting` | google/gemini-2.5-pro | 0.7 | 4096 | Créativité, qualité du texte |
| `analysis` | google/gemini-3-flash-preview | 0.3 | 4096 | Analyses génériques |
| `bulk_cheap` | google/gemini-2.5-flash-lite | 0.2 | 2048 | Tâches haute volumétrie |

### Modèles Disponibles

```typescript
// Via Lovable AI Gateway (https://ai.gateway.lovable.dev)
const SUPPORTED_MODELS = {
  // Google Gemini 3 Series (Latest)
  "google/gemini-3-pro-preview": "Strongest reasoning, orchestration",
  "google/gemini-3-flash-preview": "Balanced speed/quality, analysis",
  
  // Google Gemini 2.5 Series
  "google/gemini-2.5-pro": "Best multimodal + creative writing",
  "google/gemini-2.5-flash": "Good balance, lower cost",
  "google/gemini-2.5-flash-lite": "Fastest, cheapest, high-volume",
};
```

---

## 📋 Format de Sortie Standard (Artifact)

**Tous les agents** doivent produire une réponse au format `AgentArtifactV2` :

```typescript
interface AgentArtifactV2 {
  summary: string;              // Résumé exécutif (1-2 phrases)
  actions: AgentActionV2[];     // Liste d'actions recommandées
  risks: string[];              // Risques identifiés
  dependencies: string[];       // Dépendances (données, accès, etc.)
  metrics_to_watch: string[];   // KPIs à surveiller
  requires_approval: boolean;   // Nécessite validation humaine ?
}

interface AgentActionV2 {
  id: string;                   // Identifiant unique (ex: seo_fix_001)
  title: string;                // Titre court
  type: "recommendation" | "approval_required" | "auto_safe";
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  why: string;                  // Justification
  how: string[];                // Étapes d'implémentation
  depends_on?: string[];        // Actions prérequises
  risks?: string[];             // Risques spécifiques
}
```

---

## 👥 Roster des Growth Modules

### Direction (3) — Couche de supervision transverse
| Agent | Rôle | Purpose | Modèle |
|-------|------|---------|--------|
| **Sophie Marchand** | Chief Growth Officer | `cgo_plan` | gemini-3-pro-preview |
| **Lucas Bertrand** | Quality & Compliance Officer | `qa_review` | gemini-3-pro-preview |
| **Emma Rousseau** | Chief of Staff | `analysis` | gemini-3-flash-preview |

### Marketing (5)
| Agent | Rôle | Purpose | Modèle |
|-------|------|---------|--------|
| **Marie Dupont** | SEO Tech Auditor | `seo_audit` | gemini-3-flash-preview |
| **Thomas Laurent** | Content Strategist | `copywriting` | gemini-2.5-pro |
| **Julie Martin** | Ads Optimizer | `analysis` | gemini-3-flash-preview |
| **Pierre Moreau** | Social Media Manager | `copywriting` | gemini-2.5-pro |
| **Claire Bernard** | CRO Specialist | `analysis` | gemini-3-flash-preview |

### Sales (4)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Antoine Lefebvre** | Lead Qualifier | `analysis` |
| **Sophie Girard** | Sales Closer | `analysis` |
| **Marc Dubois** | Account Manager | `analysis` |
| **Léa Fournier** | Pipeline Analyst | `analysis` |

### Finance (3)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Philippe Roux** | DAF IA | `analysis` |
| **Nathalie Petit** | Comptable Analytique | `analysis` |
| **Jean Blanc** | Contrôleur de Gestion | `analysis` |

### Security (3)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Alexandre Simon** | RSSI IA | `qa_review` |
| **Isabelle Michel** | Compliance Officer | `qa_review` |
| **David Garcia** | Auditeur Sécurité | `analysis` |

### Product (4)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Camille Robert** | CPO IA | `cgo_plan` |
| **Maxime Richard** | Product Manager | `analysis` |
| **Laura Durand** | UX Researcher | `analysis` |
| **Vincent Thomas** | Product Analyst | `analysis` |

### Engineering (5)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Nicolas Leroy** | CTO IA | `cgo_plan` |
| **Caroline Morel** | Lead Developer | `analysis` |
| **Julien Lambert** | DevOps Engineer | `analysis` |
| **Amélie Bonnet** | QA Specialist | `qa_review` |
| **Florian Mercier** | Technical Writer | `copywriting` |

### Data (4)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Mathieu Faure** | CDO IA | `analysis` |
| **Céline André** | Data Engineer | `analysis` |
| **Benjamin Lemaire** | Data Analyst | `analysis` |
| **Marine Fontaine** | ML Engineer | `analysis` |

### Support (3)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Stéphane Chevalier** | Head of Support IA | `analysis` |
| **Aurélie Roussel** | Customer Success Manager | `copywriting` |
| **Guillaume Perrin** | Technical Support | `analysis` |

### Governance (3)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Olivier Dumont** | Chief of Staff IA | `cgo_plan` |
| **Sandrine Legrand** | Project Manager | `analysis` |
| **Yannick Garnier** | Operations Analyst | `analysis` |

### HR (3)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Émilie Vasseur** | DRH IA | `analysis` |
| **Romain Berthelot** | Talent Acquisition | `analysis` |
| **Charlotte Masson** | People Operations | `analysis` |

### Legal (1)
| Agent | Rôle | Purpose |
|-------|------|---------|
| **Maître Arnaud Lecomte** | DPO & Legal Counsel | `qa_review` |

---

## 🔒 Sécurité & Conformité

### Données Sensibles

1. **Aucune donnée utilisateur n'est stockée par les modèles IA**
   - Les appels sont stateless
   - Les tokens OAuth sont chiffrés (AES-GCM 256-bit)
   - Les réponses sont loggées localement (workspace isolation)

2. **Validation des entrées**
   - Tous les prompts passent par la validation Zod
   - Sanitization anti-XSS sur les sorties
   - Rate limiting par workspace

3. **Traçabilité complète**
   - Chaque appel crée une entrée dans `ai_requests`
   - Les runs sont liés à `agent_runs` avec durée, coût, status
   - Audit log immuable avec trigger anti-modification

### Politiques Anti-Abus

```typescript
// Forbidden actions - QCO Agent vérifie ces violations
const FORBIDDEN_ACTIONS = [
  "Fake reviews or testimonials",
  "Plagiarized content",
  "Misleading claims or false advertising",
  "Black-hat SEO (link schemes, keyword stuffing, cloaking)",
  "Privacy violations or data misuse",
  "Spam or aggressive automation"
];
```

---

## 📊 Quotas & Limites

| Plan | Requêtes/min | Concurrent Max | Tokens/mois |
|------|-------------|----------------|-------------|
| **Free** | 10 | 2 | 100,000 |
| **Starter** | 30 | 5 | 500,000 |
| **Growth** | 60 | 10 | 2,000,000 |
| **Agency** | 120 | 20 | 10,000,000 |

---

## 🔧 System Prompts (Extraits)

### CGO (Chief Growth Officer)

```
You are the Chief Growth Officer (CGO) Agent for Growth OS.

Your role is to:
1. Analyze the current state of a website/business and identify growth opportunities
2. Prioritize actions using ICE scoring (Impact × Confidence × Ease)
3. Create strategic growth plans following the "Foundations → Scale" methodology
4. Coordinate with specialized agents (SEO, Ads, Content, etc.)

Key principles:
- Always prioritize foundations (technical health, data quality) before scaling
- Be conservative with risk - flag anything requiring human approval
- Focus on measurable outcomes and clear next steps
- Never suggest black-hat tactics or compliance violations
```

### QCO (Quality & Compliance Officer)

```
You are the Quality & Compliance Officer (QCO) Agent for Growth OS.

Your role is to:
1. Validate outputs from other agents for quality and compliance
2. Ensure all recommendations are ethical and follow best practices
3. Flag any potential risks or regulatory concerns
4. Verify that "done" items are truly complete vs "suggested"

FORBIDDEN ACTIONS (immediately flag if detected):
- Fake reviews or testimonials
- Plagiarized content
- Misleading claims or false advertising
- Black-hat SEO tactics
- Privacy violations or data misuse
- Spam or aggressive automation
```

### SEO Tech Auditor

```
You are the SEO Tech Auditor Agent for Growth OS.

Analysis categories:
- Indexation issues (robots, canonicals, noindex)
- Content issues (missing titles, meta, H1s, duplicates)
- Performance issues (slow pages, large resources)
- Structured data (missing or invalid schema)
- Architecture (orphan pages, internal linking, depth)

Prioritization criteria:
- Critical: Blocks indexation or causes major ranking loss
- High: Significantly impacts rankings or user experience
- Medium: Affects SEO but not severely
- Low: Best practice improvements
```

---

## 📈 Evidence Bundles

Chaque exécution d'agent génère un **Evidence Bundle** qui documente :

```typescript
interface EvidenceBundle {
  id: string;
  run_id: string;
  sources: EvidenceSource[];    // D'où viennent les données
  metrics: EvidenceMetric[];    // Chiffres clés extraits
  reasoning: EvidenceReasoning[]; // Chaîne de raisonnement
  confidence_level: "low" | "medium" | "high";
  created_at: string;
}

interface EvidenceSource {
  type: "database" | "api" | "crawl" | "manual";
  name: string;
  url?: string;
  timestamp: string;
}
```

Cela garantit la **transparence** : chaque recommandation peut être tracée jusqu'à sa source de données.

---

## 🚀 Utilisation

### Appeler un Agent via l'AI Gateway

```typescript
import { AIGatewayClient } from "@/lib/agents/ai-gateway-client";

const response = await AIGatewayClient.runLLM({
  workspaceId: "uuid",
  agentName: "seo_auditor",
  purpose: "seo_audit",
  systemPrompt: AGENT_PROMPTS.SEO_AUDITOR,
  userPrompt: "Analyze the technical SEO issues for example.com",
  context: { crawlData: [...] }
});

// response.artifact contains the standardized AgentArtifactV2
```

### Déclencher un Run Structuré

```typescript
// Via le Cockpit Exécutif - QuickLaunchers
const runTypes = [
  "DAILY_EXECUTIVE_BRIEF",
  "WEEKLY_EXECUTIVE_REVIEW", 
  "MARKETING_WEEK_PLAN",
  "SEO_AUDIT_REPORT",
  "SALES_PIPELINE_REVIEW",
  "FUNNEL_DIAGNOSTIC",
  "ACCESS_REVIEW"
];
```

---

*Document généré - Growth OS AI Documentation v1.0*
