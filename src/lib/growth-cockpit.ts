import { TrendingUp, TrendingDown, AlertTriangle, ShieldAlert, LucideIcon, CheckCircle2, Clock3, ShieldCheck, BarChart3, Activity, Workflow } from "lucide-react";

export type SignalSeverity = "critical" | "warning" | "healthy";

export interface GrowthSignal {
  id: string;
  title: string;
  description: string;
  severity: SignalSeverity;
  metric: string;
  trend: string;
  source: string;
  impact: string;
}

export interface PrioritizedAction {
  id: string;
  title: string;
  summary: string;
  owner: string;
  priority: "P1" | "P2" | "P3";
  approval: "Required" | "Optional" | "Auto";
  evidence: string;
  expectedImpact: string;
  eta: string;
}

export interface OutcomeMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  status: "up" | "down" | "stable";
}

export function getSeverityMeta(severity: SignalSeverity): {
  label: string;
  icon: LucideIcon;
  className: string;
} {
  switch (severity) {
    case "critical":
      return {
        label: "Critical",
        icon: ShieldAlert,
        className: "text-red-600 bg-red-500/10 border-red-500/20",
      };
    case "warning":
      return {
        label: "Watch",
        icon: AlertTriangle,
        className: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      };
    default:
      return {
        label: "Healthy",
        icon: CheckCircle2,
        className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      };
  }
}

export function getPriorityMeta(priority: PrioritizedAction["priority"]): {
  className: string;
  icon: LucideIcon;
} {
  switch (priority) {
    case "P1":
      return { className: "text-red-600 bg-red-500/10", icon: ShieldAlert };
    case "P2":
      return { className: "text-amber-600 bg-amber-500/10", icon: Clock3 };
    default:
      return { className: "text-sky-600 bg-sky-500/10", icon: Workflow };
  }
}

export function getOutcomeStatusMeta(status: OutcomeMetric["status"]): {
  icon: LucideIcon;
  className: string;
} {
  switch (status) {
    case "up":
      return { icon: TrendingUp, className: "text-emerald-600" };
    case "down":
      return { icon: TrendingDown, className: "text-red-600" };
    default:
      return { icon: Activity, className: "text-muted-foreground" };
  }
}

export const growthLoopSteps = [
  {
    title: "Connect your growth data",
    description: "Unify GA4, Search Console, Meta, CRM and site data inside one workspace-aware model.",
    icon: BarChart3,
  },
  {
    title: "Detect anomalies and opportunities",
    description: "Turn variance, drop-offs and momentum shifts into explainable signals instead of noisy dashboards.",
    icon: AlertTriangle,
  },
  {
    title: "Prioritize actions with proof",
    description: "Attach evidence bundles, expected impact and owner recommendations before work starts.",
    icon: ShieldCheck,
  },
  {
    title: "Approve, execute and measure",
    description: "Route sensitive actions through approvals, keep an audit trail, then track outcomes over time.",
    icon: CheckCircle2,
  },
] as const;

export const pricingPlans = [
  {
    name: "Solo",
    price: "€490",
    description: "For independents and consultants who need one connected workspace and clear weekly priorities.",
    cta: "Start Solo",
    features: [
      "1 workspace + 1 primary site",
      "Connected growth signals",
      "Evidence-backed recommendations",
      "Approval gate + audit trail",
      "Weekly refresh cadence",
    ],
  },
  {
    name: "Agency",
    price: "€1,900",
    description: "For agencies managing multiple client contexts with governance, proofs and approval workflows.",
    cta: "Choose Agency",
    featured: true,
    features: [
      "Multi-workspace client operations",
      "Shared approvals and auditability",
      "Evidence bundles for recommendations",
      "Prioritized action queues",
      "Monthly outcome reviews",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    description: "For brands and multi-team operators that need governance, integrations and measurable impact tracking.",
    cta: "Talk to sales",
    features: [
      "Advanced RBAC and workspace governance",
      "Approval policies for sensitive actions",
      "Cross-channel anomaly monitoring",
      "Executive outcome dashboards",
      "Packaging with Stripe and enterprise support",
    ],
  },
] as const;
