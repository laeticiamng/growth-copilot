/**
 * P3 — Blog Article Detail /blog/:slug
 * Full body content with headings, structured article format
 */
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

interface BlogArticle {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  category: string;
  author: string;
  authorRole: Record<string, string>;
  date: string;
  readTime: number;
  tags: string[];
  body: Record<string, string>;
}

const ARTICLES: BlogArticle[] = [
  {
    slug: "how-39-ai-agents-replace-marketing-team",
    title: {
      fr: "Comment 39 agents IA remplacent une équipe marketing complète",
      en: "How 39 AI Agents Replace a Complete Marketing Team",
    },
    excerpt: {
      fr: "Découvrez comment une équipe de 39 agents IA spécialisés peut automatiser 90% des tâches marketing d'une entreprise B2B.",
      en: "Discover how a team of 39 specialized AI agents can automate 90% of a B2B company's marketing tasks.",
    },
    category: "growth",
    author: "Sophie Marchand",
    authorRole: { fr: "Chief Growth Officer IA", en: "AI Chief Growth Officer" },
    date: "2026-01-15",
    readTime: 8,
    tags: ["IA", "marketing", "automatisation"],
    body: {
      fr: `## Le problème : des équipes marketing surchargées

Les équipes marketing B2B modernes sont confrontées à un paradoxe : plus d'outils que jamais, mais toujours pas assez de temps. Entre l'audit SEO, la stratégie de contenu, le monitoring des réseaux sociaux, l'analyse concurrentielle et le reporting, une équipe de 5 personnes passe 60% de son temps sur des tâches répétitives.

## La solution : 39 agents IA spécialisés

Growth OS propose une approche radicalement différente. Au lieu de remplacer une équipe par un seul outil généraliste, nous avons créé **39 agents IA spécialisés**, chacun expert dans son domaine, répartis dans **11 départements**.

### Le département Marketing (4 agents)

- **Emma Lefebvre** — Auditrice SEO Technique : crawle votre site, identifie les erreurs, optimise les Core Web Vitals
- **Thomas Duval** — Stratège Mots-clés : crée les clusters sémantiques, planifie le calendrier éditorial
- **Léa Fontaine** — Créatrice de Contenu : génère du contenu SEO-first avec les frameworks AIDA/PAS
- **Marc Rousseau** — Manager Réseaux Sociaux : planifie et optimise votre présence sociale

### Comment ça fonctionne ?

Chaque agent travaille de manière autonome mais coordonnée. L'orchestrateur CGO (Sophie Marchand) priorise les tâches selon le scoring ICE (Impact, Confiance, Facilité) et distribue le travail.

**Toute action sensible passe par le système d'approbation.** Vous gardez le contrôle total.

## Les résultats concrets

Nos clients observent en moyenne :
- **+340% de trafic organique** en 4 mois
- **-60% du cycle de vente**
- **80% de temps de reporting économisé**
- **Score NPS de 72** (moyenne du secteur : 45)

## Conclusion

L'avenir du marketing B2B n'est pas dans l'embauche de plus de personnes, mais dans l'orchestration intelligente d'agents IA spécialisés. Growth OS vous permet de démarrer dès aujourd'hui.`,
      en: `## The Problem: Overloaded Marketing Teams

Modern B2B marketing teams face a paradox: more tools than ever, but still not enough time. Between SEO audits, content strategy, social media monitoring, competitive analysis, and reporting, a team of 5 spends 60% of their time on repetitive tasks.

## The Solution: 39 Specialized AI Agents

Growth OS offers a radically different approach. Instead of replacing a team with a single generalist tool, we've created **39 specialized AI agents**, each expert in their domain, distributed across **11 departments**.

### The Marketing Department (4 agents)

- **Emma Lefebvre** — Technical SEO Auditor: crawls your site, identifies errors, optimizes Core Web Vitals
- **Thomas Duval** — Keyword Strategist: creates semantic clusters, plans the editorial calendar
- **Léa Fontaine** — Content Builder: generates SEO-first content using AIDA/PAS frameworks
- **Marc Rousseau** — Social Media Manager: plans and optimizes your social presence

### How Does It Work?

Each agent works autonomously but in coordination. The CGO orchestrator (Sophie Marchand) prioritizes tasks using ICE scoring (Impact, Confidence, Ease) and distributes work.

**Every sensitive action goes through the approval system.** You maintain total control.

## Concrete Results

Our clients observe on average:
- **+340% organic traffic** in 4 months
- **-60% sales cycle reduction**
- **80% reporting time saved**
- **NPS score of 72** (industry average: 45)

## Conclusion

The future of B2B marketing isn't about hiring more people, but about intelligent orchestration of specialized AI agents. Growth OS lets you start today.`,
    },
  },
  {
    slug: "roi-growth-automation",
    title: {
      fr: "ROI de l'automatisation Growth : chiffres et méthodologie",
      en: "Growth Automation ROI: Numbers and Methodology",
    },
    excerpt: {
      fr: "Analyse complète du retour sur investissement de l'automatisation growth avec des données réelles de nos clients.",
      en: "Complete analysis of growth automation ROI with real client data.",
    },
    category: "analytics",
    author: "François Martin",
    authorRole: { fr: "Analyste Revenus IA", en: "AI Revenue Analyst" },
    date: "2026-01-08",
    readTime: 10,
    tags: ["ROI", "analytics", "growth"],
    body: {
      fr: `## Pourquoi mesurer le ROI de l'automatisation ?

Avant d'investir dans l'automatisation growth, chaque dirigeant se pose la même question : « Quel sera le retour sur investissement ? ». Cet article présente notre méthodologie de calcul et les résultats concrets observés.

## Notre méthodologie de calcul

### 1. Coût total de possession (TCO)

Le TCO de Growth OS comprend :
- Abonnement mensuel (à partir de 490€/mois)
- Temps d'onboarding (estimé à 4 heures)
- Temps de supervision hebdomadaire (estimé à 2 heures/semaine)

### 2. Valeur créée

Nous mesurons la valeur créée sur 4 axes :
- **Temps économisé** : heures de travail automatisées × coût horaire moyen
- **Revenus additionnels** : leads supplémentaires × taux de conversion × panier moyen
- **Réduction des erreurs** : coût des erreurs évitées (SEO, conformité, facturation)
- **Vélocité** : temps de mise sur le marché réduit pour les campagnes

### 3. Formule ROI

\`\`\`
ROI = (Valeur créée - TCO) / TCO × 100
\`\`\`

## Résultats observés par département

| Département | ROI moyen à 6 mois | Temps économisé/semaine |
|-------------|---------------------|------------------------|
| Marketing   | 420%                | 32 heures              |
| Commercial  | 380%                | 24 heures              |
| Finance     | 290%                | 16 heures              |
| Support     | 350%                | 28 heures              |

## Le point de rentabilité

En moyenne, nos clients atteignent le point de rentabilité après **6 semaines** d'utilisation. Les premiers résultats visibles (amélioration SEO, leads qualifiés) apparaissent dès la **2ème semaine**.

## Conclusion

L'automatisation growth n'est plus un luxe, c'est un investissement avec un ROI mesurable et rapide. Avec un retour moyen de 380% à 6 mois, le choix est vite fait.`,
      en: `## Why Measure Automation ROI?

Before investing in growth automation, every executive asks the same question: "What will be the return on investment?" This article presents our calculation methodology and concrete observed results.

## Our Calculation Methodology

### 1. Total Cost of Ownership (TCO)

Growth OS TCO includes:
- Monthly subscription (starting at €490/month)
- Onboarding time (estimated at 4 hours)
- Weekly supervision time (estimated at 2 hours/week)

### 2. Value Created

We measure value created on 4 axes:
- **Time saved**: automated work hours × average hourly cost
- **Additional revenue**: additional leads × conversion rate × average basket
- **Error reduction**: cost of avoided errors (SEO, compliance, billing)
- **Velocity**: reduced time-to-market for campaigns

### 3. ROI Formula

\`\`\`
ROI = (Value Created - TCO) / TCO × 100
\`\`\`

## Observed Results by Department

| Department  | Avg ROI at 6 months | Time saved/week |
|-------------|---------------------|-----------------|
| Marketing   | 420%                | 32 hours        |
| Sales       | 380%                | 24 hours        |
| Finance     | 290%                | 16 hours        |
| Support     | 350%                | 28 hours        |

## Break-even Point

On average, our clients reach break-even after **6 weeks** of use. First visible results (SEO improvement, qualified leads) appear from **week 2**.

## Conclusion

Growth automation is no longer a luxury—it's an investment with measurable and fast ROI. With an average return of 380% at 6 months, the choice is clear.`,
    },
  },
  {
    slug: "seo-automation-complete-guide",
    title: {
      fr: "Guide complet : automatiser son SEO avec l'IA en 2026",
      en: "Complete Guide: Automating SEO with AI in 2026",
    },
    excerpt: {
      fr: "De l'audit technique au contenu optimisé, comment l'IA révolutionne chaque étape du SEO.",
      en: "From technical audit to optimized content, how AI revolutionizes every step of SEO.",
    },
    category: "seo",
    author: "Emma Lefebvre",
    authorRole: { fr: "Auditrice SEO Technique", en: "Technical SEO Auditor" },
    date: "2025-12-20",
    readTime: 12,
    tags: ["SEO", "IA", "audit", "contenu"],
    body: {
      fr: `## L'état du SEO en 2026

Le SEO a considérablement évolué. Google traite désormais plus de 8,5 milliards de recherches par jour, et les critères de classement intègrent pleinement les signaux d'expérience utilisateur (Core Web Vitals), l'E-E-A-T, et la compréhension sémantique.

## Les 4 piliers du SEO automatisé

### Pilier 1 : Audit technique continu

Notre agent Tech SEO Auditor (Emma Lefebvre) effectue un crawl complet de votre site chaque semaine :
- Détection des erreurs 404/500
- Analyse des Core Web Vitals (LCP, FID, CLS)
- Vérification du schema markup
- Audit de la structure de liens internes

### Pilier 2 : Stratégie de mots-clés dynamique

L'agent Keyword Strategist (Thomas Duval) analyse en continu :
- Les opportunités de mots-clés long-tail
- Les clusters sémantiques par thématique
- La cannibalisation de mots-clés
- Les mouvements de la concurrence

### Pilier 3 : Création de contenu SEO-first

L'agent Content Builder (Léa Fontaine) génère du contenu optimisé :
- Utilisation des frameworks AIDA et PAS
- Optimisation des balises title et meta description
- Structure H1-H6 optimale
- Maillage interne automatique

### Pilier 4 : Distribution et monitoring

L'agent Social Media Manager (Marc Rousseau) assure la distribution :
- Partage multi-canal optimisé
- Suivi des backlinks
- Monitoring des positions
- Alertes en temps réel

## Résultats type après 4 mois

- Trafic organique : **+340%**
- Mots-clés en Top 10 : **+187**
- Erreurs techniques : **-95%**
- Temps passé sur le SEO : **-80%**

## Par où commencer ?

1. Lancez un audit gratuit sur Growth OS
2. Activez le département Marketing
3. Laissez les agents travailler pendant 2 semaines
4. Validez les actions proposées via le système d'approbation`,
      en: `## The State of SEO in 2026

SEO has evolved considerably. Google now processes over 8.5 billion searches per day, and ranking criteria fully integrate user experience signals (Core Web Vitals), E-E-A-T, and semantic understanding.

## The 4 Pillars of Automated SEO

### Pillar 1: Continuous Technical Audit

Our Tech SEO Auditor agent (Emma Lefebvre) performs a complete site crawl every week:
- 404/500 error detection
- Core Web Vitals analysis (LCP, FID, CLS)
- Schema markup verification
- Internal link structure audit

### Pillar 2: Dynamic Keyword Strategy

The Keyword Strategist agent (Thomas Duval) continuously analyzes:
- Long-tail keyword opportunities
- Semantic clusters by theme
- Keyword cannibalization
- Competitive movements

### Pillar 3: SEO-First Content Creation

The Content Builder agent (Léa Fontaine) generates optimized content:
- AIDA and PAS framework usage
- Title and meta description optimization
- Optimal H1-H6 structure
- Automatic internal linking

### Pillar 4: Distribution and Monitoring

The Social Media Manager agent (Marc Rousseau) handles distribution:
- Optimized multi-channel sharing
- Backlink tracking
- Position monitoring
- Real-time alerts

## Typical Results After 4 Months

- Organic traffic: **+340%**
- Top 10 keywords: **+187**
- Technical errors: **-95%**
- Time spent on SEO: **-80%**

## Where to Start?

1. Run a free audit on Growth OS
2. Activate the Marketing department
3. Let the agents work for 2 weeks
4. Validate proposed actions through the approval system`,
    },
  },
  {
    slug: "approval-system-ai-governance",
    title: {
      fr: "Système d'approbation : garder le contrôle sur vos agents IA",
      en: "Approval System: Keeping Control Over Your AI Agents",
    },
    excerpt: {
      fr: "Comment le système d'approbation de Growth OS garantit la sécurité tout en maximisant l'efficacité de vos agents.",
      en: "How Growth OS's approval system ensures security while maximizing agent efficiency.",
    },
    category: "governance",
    author: "Philippe Renaud",
    authorRole: { fr: "Auditeur de Conformité", en: "Compliance Auditor" },
    date: "2025-12-10",
    readTime: 7,
    tags: ["gouvernance", "sécurité", "approbation"],
    body: {
      fr: `## Pourquoi un système d'approbation ?

L'automatisation IA sans contrôle humain est un risque majeur. Chez Growth OS, nous avons conçu un système d'approbation à 3 niveaux qui garantit que **toute action sensible passe par vous**.

## Les 3 niveaux de risque

### Niveau Vert (Risque bas)
Actions exécutées automatiquement :
- Collecte de données analytics
- Détection d'erreurs techniques
- Génération de rapports
- Surveillance des concurrents

### Niveau Orange (Risque moyen)
Actions nécessitant une approbation :
- Publication de contenu
- Modification de campagnes publicitaires
- Envoi d'emails de nurturing
- Mise à jour du calendrier éditorial

### Niveau Rouge (Risque élevé)
Actions avec double validation :
- Dépenses publicitaires > seuil
- Modification de contrats
- Déploiements en production
- Changements de permissions

## Le workflow d'approbation

1. **L'agent propose** une action avec son impact estimé
2. **Vous recevez** une notification avec les détails
3. **Vous décidez** : Approuver, Rejeter ou Modifier
4. **L'historique** conserve toutes les décisions

## Le mode Autopilot

Pour les équipes expérimentées, le mode Autopilot permet d'automatiser certaines approbations :
- Configurable par type d'action
- Limites budgétaires quotidiennes
- Maximum d'actions par semaine
- Désactivable à tout moment

## La transparence avant tout

Chaque action est tracée dans l'audit log. Vous savez exactement ce que chaque agent a fait, quand, et pourquoi.`,
      en: `## Why an Approval System?

AI automation without human control is a major risk. At Growth OS, we designed a 3-level approval system that ensures **every sensitive action goes through you**.

## The 3 Risk Levels

### Green Level (Low Risk)
Automatically executed actions:
- Analytics data collection
- Technical error detection
- Report generation
- Competitor monitoring

### Orange Level (Medium Risk)
Actions requiring approval:
- Content publishing
- Ad campaign modifications
- Nurturing email sends
- Editorial calendar updates

### Red Level (High Risk)
Actions with dual validation:
- Ad spend above threshold
- Contract modifications
- Production deployments
- Permission changes

## The Approval Workflow

1. **The agent proposes** an action with estimated impact
2. **You receive** a notification with details
3. **You decide**: Approve, Reject, or Modify
4. **The history** keeps all decisions

## Autopilot Mode

For experienced teams, Autopilot mode allows automating certain approvals:
- Configurable by action type
- Daily budget limits
- Maximum actions per week
- Disableable at any time

## Transparency Above All

Every action is tracked in the audit log. You know exactly what each agent did, when, and why.`,
    },
  },
  {
    slug: "11-departments-explained",
    title: {
      fr: "Les 11 départements de Growth OS expliqués",
      en: "Growth OS's 11 Departments Explained",
    },
    excerpt: {
      fr: "Présentation détaillée de chaque département, ses agents, et comment ils travaillent ensemble pour votre croissance.",
      en: "Detailed presentation of each department, its agents, and how they work together for your growth.",
    },
    category: "product",
    author: "Sophie Marchand",
    authorRole: { fr: "Chief Growth Officer IA", en: "AI Chief Growth Officer" },
    date: "2025-11-28",
    readTime: 9,
    tags: ["départements", "agents", "organisation"],
    body: {
      fr: `## Une entreprise IA complète à votre service

Growth OS reproduit la structure d'une entreprise performante avec 11 départements spécialisés et 39 agents IA. Voici le guide complet.

## Marketing (4 agents)
Piloté par Emma Lefebvre (SEO), Thomas Duval (Mots-clés), Léa Fontaine (Contenu) et Marc Rousseau (Social).

**Mission** : Maximiser votre visibilité organique et votre présence digitale.

**Métrique clé** : +340% de trafic organique en 4 mois

## Commercial (4 agents)
Alexandre Petit (Offres), Marie Laurent (Accélérateur), Julien Morel (Lifecycle) et Camille Roux (Closing).

**Mission** : Accélérer le cycle de vente et maximiser le closing.

**Métrique clé** : Cycle de vente réduit de 60%

## Finance (3 agents)
François Martin (Revenus), Isabelle Durand (Budget) et Paul Leroy (Facturation).

**Mission** : Piloter la santé financière et optimiser les budgets.

**Métrique clé** : 80% de temps de reporting économisé

## Sécurité (3 agents)
Pierre Lambert (Audit), Claire Dubois (Accès) et Nicolas Bernard (Menaces).

**Mission** : Protéger vos données et garantir la conformité.

**Métrique clé** : 99.9% de disponibilité garantie

## Produit (4 agents)
Amélie Girard (Analyse), Laura Simon (UX), Vincent Mercier (Roadmap) et Maxime Faure (Backlog).

**Mission** : Optimiser le produit et l'expérience utilisateur.

## Ingénierie (4 agents)
Antoine Legrand (Code), Sophie Blanc (Performance), Romain Fournier (DevOps) et Élise Perrin (API).

**Mission** : Garantir l'excellence technique et la fiabilité.

## Data (4 agents)
Chloé Martin (Analytics), Hugo Dupont (Data), Lucas André (ML) et Julie Moreau (Reporting).

**Mission** : Transformer les données en insights actionnables.

## Support (3 agents)
Marine Chevalier (Réputation), Thomas Gérard (Tickets) et Sarah Lemoine (Connaissances).

**Mission** : Optimiser l'expérience client et la satisfaction.

## Gouvernance (3 agents)
Philippe Renaud (Conformité), Nathalie Vincent (Politiques) et David Gauthier (Risques).

**Mission** : Assurer la conformité réglementaire et la gouvernance.

## RH (4 agents)
Céline Hervé (Recrutement), Aurélien Brun (Expérience), Diane Perret (Formation) et Guillaume Fabre (Performance).

**Mission** : Optimiser la gestion des talents et l'engagement.

## Juridique (3 agents)
Margaux Picard (Contrats), Élodie Renard (PI) et Xavier Morin (Réglementation).

**Mission** : Sécuriser les engagements légaux et la propriété intellectuelle.

## Comment les départements collaborent

L'orchestrateur CGO coordonne tous les départements via le scoring ICE. Chaque tâche est priorisée selon son Impact, sa Confiance et sa Facilité d'exécution. Les résultats d'un département alimentent les autres automatiquement.`,
      en: `## A Complete AI Company at Your Service

Growth OS replicates the structure of a high-performing company with 11 specialized departments and 39 AI agents. Here's the complete guide.

## Marketing (4 agents)
Led by Emma Lefebvre (SEO), Thomas Duval (Keywords), Léa Fontaine (Content), and Marc Rousseau (Social).

**Mission**: Maximize your organic visibility and digital presence.

**Key metric**: +340% organic traffic in 4 months

## Sales (4 agents)
Alexandre Petit (Offers), Marie Laurent (Accelerator), Julien Morel (Lifecycle), and Camille Roux (Closing).

**Mission**: Accelerate the sales cycle and maximize closing.

**Key metric**: 60% sales cycle reduction

## Finance (3 agents)
François Martin (Revenue), Isabelle Durand (Budget), and Paul Leroy (Billing).

**Mission**: Drive financial health and optimize budgets.

**Key metric**: 80% reporting time saved

## Security (3 agents)
Pierre Lambert (Audit), Claire Dubois (Access), and Nicolas Bernard (Threats).

**Mission**: Protect your data and ensure compliance.

**Key metric**: 99.9% guaranteed uptime

## Product (4 agents)
Amélie Girard (Analysis), Laura Simon (UX), Vincent Mercier (Roadmap), and Maxime Faure (Backlog).

**Mission**: Optimize the product and user experience.

## Engineering (4 agents)
Antoine Legrand (Code), Sophie Blanc (Performance), Romain Fournier (DevOps), and Élise Perrin (API).

**Mission**: Ensure technical excellence and reliability.

## Data (4 agents)
Chloé Martin (Analytics), Hugo Dupont (Data), Lucas André (ML), and Julie Moreau (Reporting).

**Mission**: Transform data into actionable insights.

## Support (3 agents)
Marine Chevalier (Reputation), Thomas Gérard (Tickets), and Sarah Lemoine (Knowledge).

**Mission**: Optimize customer experience and satisfaction.

## Governance (3 agents)
Philippe Renaud (Compliance), Nathalie Vincent (Policies), and David Gauthier (Risks).

**Mission**: Ensure regulatory compliance and governance.

## HR (4 agents)
Céline Hervé (Recruitment), Aurélien Brun (Experience), Diane Perret (Training), and Guillaume Fabre (Performance).

**Mission**: Optimize talent management and engagement.

## Legal (3 agents)
Margaux Picard (Contracts), Élodie Renard (IP), and Xavier Morin (Regulation).

**Mission**: Secure legal commitments and intellectual property.

## How Departments Collaborate

The CGO orchestrator coordinates all departments via ICE scoring. Each task is prioritized by Impact, Confidence, and Ease of execution. Results from one department automatically feed into others.`,
    },
  },
];

export function getBlogArticles() {
  return ARTICLES;
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center pt-20">
          <h2 className="text-2xl font-bold mb-4">
            {lang === "fr" ? "Article introuvable" : "Article not found"}
          </h2>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Retour au blog" : "Back to blog"}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Simple markdown-to-HTML rendering
  const renderBody = (md: string) => {
    return md.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      if (trimmed.startsWith("## "))
        return (
          <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-foreground">
            {trimmed.replace("## ", "")}
          </h2>
        );
      if (trimmed.startsWith("### "))
        return (
          <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-foreground">
            {trimmed.replace("### ", "")}
          </h3>
        );
      if (trimmed.startsWith("- ")) {
        const content = trimmed.replace("- ", "");
        return (
          <li key={i} className="text-muted-foreground ml-4 mb-1 list-disc">
            <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
          </li>
        );
      }
      if (trimmed.startsWith("| ")) {
        return (
          <div key={i} className="font-mono text-xs text-muted-foreground bg-secondary/30 px-3 py-1 border-l-2 border-border">
            {trimmed}
          </div>
        );
      }
      if (trimmed.startsWith("```")) return null;
      if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
        return <code key={i} className="bg-secondary/50 px-2 py-1 rounded text-sm block my-2">{trimmed.slice(1, -1)}</code>;
      }
      return (
        <p key={i} className="text-muted-foreground leading-relaxed mb-3">
          <span dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
        </p>
      );
    });
  };

  const otherArticles = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <SEOHead
        title={article.title[lang]}
        description={article.excerpt[lang]}
        canonical={`/blog/${article.slug}`}
      />
      <div className="min-h-screen bg-background">
        <Navbar />

        <article className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Back */}
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {lang === "fr" ? "Retour au blog" : "Back to blog"}
            </Link>

            {/* Header */}
            <Badge variant="outline" className="mb-4">{article.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {article.title[lang]}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" /> {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {article.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {article.readTime} min
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Body */}
            <div className="prose prose-invert max-w-none">
              {renderBody(article.body[lang])}
            </div>

            {/* Author */}
            <div className="mt-12 p-6 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {article.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{article.author}</p>
                  <p className="text-sm text-muted-foreground">{article.authorRole[lang]}</p>
                </div>
              </div>
            </div>

            {/* Related */}
            {otherArticles.length > 0 && (
              <div className="mt-16">
                <h3 className="text-xl font-bold mb-6">
                  {lang === "fr" ? "Articles similaires" : "Related Articles"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {otherArticles.map((a) => (
                    <Link
                      key={a.slug}
                      to={`/blog/${a.slug}`}
                      className="p-4 rounded-lg bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors group"
                    >
                      <Badge variant="outline" className="text-[10px] mb-2">{a.category}</Badge>
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {a.title[lang]}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2">{a.readTime} min</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
