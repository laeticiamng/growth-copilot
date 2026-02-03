import { ReactNode } from 'react';
import { useServices, getRouteService } from '@/hooks/useServices';
import { LoadingState } from '@/components/ui/loading-state';
import { ServiceUpsell } from '@/components/upsell/ServiceUpsell';

// Service metadata for upsell screens
const SERVICE_META: Record<string, {
  name: string;
  description: string;
  features: string[];
  price: string;
}> = {
  marketing: {
    name: 'Marketing',
    description: "Boostez votre visibilité avec notre suite marketing complète : SEO, contenu, publicités et réseaux sociaux.",
    features: [
      "Audit SEO technique automatisé",
      "Stratégie de contenu IA",
      "Gestion des campagnes publicitaires",
      "Planification réseaux sociaux",
      "Analyse concurrentielle"
    ],
    price: "49"
  },
  sales: {
    name: 'Sales',
    description: "Optimisez votre pipeline commercial avec notre CRM intelligent et nos automatisations de prospection.",
    features: [
      "Gestion du pipeline commercial",
      "Scoring des leads automatisé",
      "Séquences d'emails personnalisées",
      "Suivi des offres et devis",
      "Prévisions de ventes IA"
    ],
    price: "39"
  },
  finance: {
    name: 'Finance',
    description: "Gardez le contrôle de vos finances avec des rapports ROI automatisés et des alertes budget.",
    features: [
      "Rapports ROI par canal",
      "Suivi des dépenses marketing",
      "Alertes budget en temps réel",
      "Prévisions financières",
      "Export comptable"
    ],
    price: "29"
  },
  security: {
    name: 'Security',
    description: "Protégez vos accès et assurez la conformité avec notre suite de sécurité intégrée.",
    features: [
      "Audit des accès régulier",
      "Détection d'anomalies",
      "Conformité RGPD automatisée",
      "Logs et traçabilité complète",
      "Gestion des secrets"
    ],
    price: "29"
  },
  product: {
    name: 'Product',
    description: "Pilotez votre roadmap produit avec des insights utilisateurs et une priorisation intelligente.",
    features: [
      "Priorisation par impact",
      "Suivi des OKRs",
      "Feedback utilisateurs centralisé",
      "Roadmap collaborative",
      "Métriques produit"
    ],
    price: "29"
  },
  engineering: {
    name: 'Engineering',
    description: "Optimisez vos releases avec des gates de qualité et un suivi de la santé technique.",
    features: [
      "Gates de release automatisés",
      "Résumé QA quotidien",
      "Suivi de la dette technique",
      "Métriques de delivery",
      "Alertes performance"
    ],
    price: "29"
  },
  data: {
    name: 'Data',
    description: "Exploitez vos données avec des analyses de funnel et des cohortes de rétention.",
    features: [
      "Diagnostic funnel complet",
      "Analyse de cohortes",
      "Attribution multi-touch",
      "Tableaux de bord personnalisés",
      "Export data warehouse"
    ],
    price: "39"
  },
  support: {
    name: 'Support',
    description: "Améliorez votre réputation avec une gestion centralisée des avis et du support client.",
    features: [
      "Triage automatique des tickets",
      "Gestion des avis Google/Meta",
      "Base de connaissances IA",
      "Réponses suggérées",
      "Métriques NPS/CSAT"
    ],
    price: "19"
  },
  governance: {
    name: 'Governance',
    description: "Centralisez la gestion de votre entreprise avec notre hub de gouvernance.",
    features: [
      "Gestion multi-clients (Agence)",
      "Automatisations avancées",
      "Intégrations tierces",
      "Rôles et permissions granulaires",
      "Audit trail complet"
    ],
    price: "49"
  }
};

interface ServiceGuardProps {
  children: ReactNode;
  /** Explicit service slug to check. If not provided, inferred from current route. */
  service?: string;
  /** The current route path, used for inference if service is not explicit */
  routePath?: string;
}

/**
 * ServiceGuard - Protects routes/sections based on service entitlements.
 * Shows an upsell screen if the required service is not enabled for the workspace.
 */
export function ServiceGuard({ 
  children, 
  service: explicitService,
  routePath
}: ServiceGuardProps) {
  const { hasService, servicesLoading, catalogLoading } = useServices();
  
  // Determine which service is required
  const requiredService = explicitService || (routePath ? getRouteService(routePath) : null);
  
  // If loading, show loading state
  if (servicesLoading || catalogLoading) {
    return <LoadingState message="Vérification de vos accès..." />;
  }
  
  // If no service requirement identified, allow access (core routes)
  if (!requiredService) {
    return <>{children}</>;
  }
  
  // Core-os is always available
  if (requiredService === 'core-os') {
    return <>{children}</>;
  }
  
  // Check if service is enabled
  if (hasService(requiredService)) {
    return <>{children}</>;
  }
  
  // Service not enabled - show upsell
  const meta = SERVICE_META[requiredService] || {
    name: requiredService.charAt(0).toUpperCase() + requiredService.slice(1),
    description: "Activez ce service pour accéder à cette fonctionnalité.",
    features: [],
    price: "29"
  };
  
  return (
    <ServiceUpsell
      serviceSlug={requiredService}
      serviceName={meta.name}
      description={meta.description}
      features={meta.features}
      price={meta.price}
    />
  );
}

/**
 * withServiceGuard - HOC for wrapping page components with service protection
 */
export function withServiceGuard<P extends object>(
  Component: React.ComponentType<P>,
  service: string
) {
  return function ServiceGuardedComponent(props: P) {
    return (
      <ServiceGuard service={service}>
        <Component {...props} />
      </ServiceGuard>
    );
  };
}
