/**
 * Analytics & KPI Agent
 * 
 * Mission: Sync GSC/GA4/Ads data, produce KPIs, detect anomalies, generate reports.
 * 
 * Triggers:
 * - Daily sync schedule
 * - Manual "Sync now" button
 * - Monthly report generation
 * 
 * Inputs:
 * - integrations (OAuth tokens via secrets)
 * - kpis_daily (existing data for comparison)
 * - action_log (actions for report context)
 * - data_quality_alerts (existing alerts)
 * 
 * Outputs:
 * - JSON artifact (strict schema)
 * - Writes to: kpis_daily, data_quality_alerts, monthly_reports, action_log
 */

import type { AgentArtifact, AgentAction, AgentRisk } from './types';

// Data Quality status
export type DataQualityStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

// KPI Snapshot for a period
export interface KPISnapshot {
  period: string; // YYYY-MM or YYYY-MM-DD
  organic_clicks: number;
  organic_impressions: number;
  organic_sessions: number;
  avg_position: number | null;
  total_conversions: number;
  total_leads: number;
  revenue: number;
  ads_cost: number;
  ads_conversions: number;
}

// Data Quality Alert
export interface DataQualityAlert {
  id: string;
  type: 'missing_data' | 'anomaly' | 'tracking_broken' | 'integration_error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric_name: string;
  expected_value: number | null;
  actual_value: number | null;
  date_range: { start: string; end: string };
}

// Analytics Agent Output
export interface AnalyticsAgentOutput extends AgentArtifact {
  current_period: KPISnapshot | null;
  previous_period: KPISnapshot | null;
  mom_changes: Record<string, number | null>; // Month-over-month percentage changes
  data_quality_status: DataQualityStatus;
  data_quality_alerts: DataQualityAlert[];
  integrations_status: {
    gsc: 'connected' | 'disconnected' | 'error';
    ga4: 'connected' | 'disconnected' | 'error';
    ads: 'connected' | 'disconnected' | 'error';
  };
  report_url: string | null;
}

// Configuration for the agent
export interface AnalyticsAgentConfig {
  workspaceId: string;
  siteId: string;
  month?: string; // YYYY-MM format, defaults to previous month
  forceSync?: boolean;
}

/**
 * Validates KPI data and detects anomalies
 */
export function validateKPIData(
  current: KPISnapshot | null,
  previous: KPISnapshot | null
): { alerts: DataQualityAlert[]; status: DataQualityStatus } {
  const alerts: DataQualityAlert[] = [];
  
  if (!current) {
    alerts.push({
      id: 'no_current_data',
      type: 'missing_data',
      severity: 'critical',
      title: 'Aucune donnée pour la période actuelle',
      description: 'Les données KPI sont absentes pour la période actuelle. Vérifiez les intégrations.',
      metric_name: 'all',
      expected_value: null,
      actual_value: null,
      date_range: { start: '', end: '' },
    });
    return { alerts, status: 'critical' };
  }

  // Check for zero values that shouldn't be zero
  if (current.organic_clicks === 0 && current.organic_impressions > 100) {
    alerts.push({
      id: 'zero_clicks_anomaly',
      type: 'anomaly',
      severity: 'high',
      title: 'Anomalie: 0 clics malgré des impressions',
      description: `${current.organic_impressions} impressions mais 0 clics. Possible problème de tracking.`,
      metric_name: 'organic_clicks',
      expected_value: Math.round(current.organic_impressions * 0.02), // Expected ~2% CTR
      actual_value: 0,
      date_range: { start: current.period, end: current.period },
    });
  }

  // Check for dramatic drops compared to previous period
  if (previous) {
    const dropThreshold = -50; // 50% drop is concerning
    
    if (previous.organic_clicks > 100) {
      const clickChange = ((current.organic_clicks - previous.organic_clicks) / previous.organic_clicks) * 100;
      if (clickChange < dropThreshold) {
        alerts.push({
          id: 'clicks_drop',
          type: 'anomaly',
          severity: 'critical',
          title: 'Chute critique des clics organiques',
          description: `Les clics ont chuté de ${Math.abs(clickChange).toFixed(1)}% par rapport à la période précédente.`,
          metric_name: 'organic_clicks',
          expected_value: previous.organic_clicks,
          actual_value: current.organic_clicks,
          date_range: { start: previous.period, end: current.period },
        });
      }
    }

    if (previous.total_conversions > 10) {
      const conversionChange = ((current.total_conversions - previous.total_conversions) / previous.total_conversions) * 100;
      if (conversionChange < dropThreshold) {
        alerts.push({
          id: 'conversions_drop',
          type: 'anomaly',
          severity: 'critical',
          title: 'Chute critique des conversions',
          description: `Les conversions ont chuté de ${Math.abs(conversionChange).toFixed(1)}%.`,
          metric_name: 'total_conversions',
          expected_value: previous.total_conversions,
          actual_value: current.total_conversions,
          date_range: { start: previous.period, end: current.period },
        });
      }
    }
  }

  // Check for data gaps (7+ consecutive days of zeros)
  // This would require daily data, simplified here
  
  // Determine overall status
  let status: DataQualityStatus = 'healthy';
  if (alerts.some(a => a.severity === 'critical')) {
    status = 'critical';
  } else if (alerts.some(a => a.severity === 'high')) {
    status = 'warning';
  } else if (alerts.length > 0) {
    status = 'warning';
  }

  return { alerts, status };
}

/**
 * Calculates month-over-month changes
 */
export function calculateMoMChanges(
  current: KPISnapshot | null,
  previous: KPISnapshot | null
): Record<string, number | null> {
  if (!current || !previous) {
    return {
      organic_clicks: null,
      organic_impressions: null,
      organic_sessions: null,
      avg_position: null,
      total_conversions: null,
      revenue: null,
    };
  }

  const calcChange = (curr: number, prev: number): number | null => {
    if (prev === 0) return curr > 0 ? 100 : null;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  return {
    organic_clicks: calcChange(current.organic_clicks, previous.organic_clicks),
    organic_impressions: calcChange(current.organic_impressions, previous.organic_impressions),
    organic_sessions: calcChange(current.organic_sessions, previous.organic_sessions),
    // Position: lower is better, so invert
    avg_position: current.avg_position && previous.avg_position
      ? calcChange(previous.avg_position, current.avg_position)
      : null,
    total_conversions: calcChange(current.total_conversions, previous.total_conversions),
    revenue: calcChange(current.revenue, previous.revenue),
  };
}

/**
 * Generates actions based on KPI analysis
 */
export function generateAnalyticsActions(
  current: KPISnapshot | null,
  previous: KPISnapshot | null,
  dataQualityAlerts: DataQualityAlert[],
  integrationsStatus: AnalyticsAgentOutput['integrations_status']
): AgentAction[] {
  const actions: AgentAction[] = [];

  // Action: Fix broken integrations
  if (integrationsStatus.gsc === 'disconnected') {
    actions.push({
      id: 'connect_gsc',
      title: 'Connecter Google Search Console',
      description: 'GSC non connecté. Les données SEO ne sont pas disponibles.',
      priority: 'critical',
      effort: 'low',
      impact: 'high',
      ice_score: 90,
      category: 'integration',
      auto_fixable: false,
      fix_instructions: 'Aller dans Intégrations > Google Search Console > Connecter',
    });
  }

  if (integrationsStatus.ga4 === 'disconnected') {
    actions.push({
      id: 'connect_ga4',
      title: 'Connecter Google Analytics 4',
      description: 'GA4 non connecté. Les données de trafic ne sont pas disponibles.',
      priority: 'high',
      effort: 'low',
      impact: 'high',
      ice_score: 85,
      category: 'integration',
      auto_fixable: false,
      fix_instructions: 'Aller dans Intégrations > Google Analytics > Connecter',
    });
  }

  // Action: Address critical data quality issues
  for (const alert of dataQualityAlerts.filter(a => a.severity === 'critical')) {
    actions.push({
      id: `fix_${alert.id}`,
      title: `Résoudre: ${alert.title}`,
      description: alert.description,
      priority: 'critical',
      effort: 'medium',
      impact: 'high',
      ice_score: 95,
      category: 'data_quality',
      auto_fixable: false,
      fix_instructions: 'Vérifier les intégrations et le code de tracking.',
    });
  }

  // Action: Capitalize on positive trends
  if (current && previous) {
    const clickChange = previous.organic_clicks > 0
      ? ((current.organic_clicks - previous.organic_clicks) / previous.organic_clicks) * 100
      : 0;

    if (clickChange > 20) {
      actions.push({
        id: 'capitalize_traffic_growth',
        title: 'Capitaliser sur la croissance du trafic',
        description: `Le trafic organique a augmenté de ${clickChange.toFixed(1)}%. Renforcer les pages performantes.`,
        priority: 'medium',
        effort: 'medium',
        impact: 'high',
        ice_score: 70,
        category: 'growth',
        auto_fixable: false,
        fix_instructions: 'Analyser les pages en croissance et créer du contenu complémentaire.',
      });
    }

    // Action: Address declining conversions
    if (previous.total_conversions > 0) {
      const convChange = ((current.total_conversions - previous.total_conversions) / previous.total_conversions) * 100;
      if (convChange < -10) {
        actions.push({
          id: 'investigate_conversion_drop',
          title: 'Investiguer la baisse des conversions',
          description: `Les conversions ont baissé de ${Math.abs(convChange).toFixed(1)}%.`,
          priority: 'high',
          effort: 'medium',
          impact: 'high',
          ice_score: 80,
          category: 'conversion',
          auto_fixable: false,
          fix_instructions: 'Analyser les pages de conversion, vérifier les formulaires, tester le parcours utilisateur.',
        });
      }
    }
  }

  // Sort by ICE score
  actions.sort((a, b) => b.ice_score - a.ice_score);

  return actions;
}

/**
 * Main Analytics Agent class
 */
export class AnalyticsAgent {
  private workspaceId: string;
  private siteId: string;
  private month: string;

  constructor(config: AnalyticsAgentConfig) {
    this.workspaceId = config.workspaceId;
    this.siteId = config.siteId;
    
    // Default to previous month
    if (config.month) {
      this.month = config.month;
    } else {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      this.month = now.toISOString().slice(0, 7);
    }
  }

  /**
   * Run the analytics agent
   */
  async run(
    currentKpis: KPISnapshot | null,
    previousKpis: KPISnapshot | null,
    integrationsStatus: AnalyticsAgentOutput['integrations_status']
  ): Promise<AnalyticsAgentOutput> {
    // Validate data quality
    const { alerts, status } = validateKPIData(currentKpis, previousKpis);

    // Calculate MoM changes
    const momChanges = calculateMoMChanges(currentKpis, previousKpis);

    // Generate actions
    const actions = generateAnalyticsActions(currentKpis, previousKpis, alerts, integrationsStatus);

    // Determine risks
    const risks: AgentRisk[] = [];
    
    if (status === 'critical') {
      risks.push({
        id: 'data_quality_critical',
        description: 'La qualité des données est critique. Les décisions basées sur ces données peuvent être erronées.',
        severity: 'critical',
        mitigation: 'Résoudre les alertes de qualité de données avant toute action.',
      });
    }

    if (integrationsStatus.gsc === 'disconnected' && integrationsStatus.ga4 === 'disconnected') {
      risks.push({
        id: 'no_data_sources',
        description: 'Aucune source de données connectée. Impossible de mesurer les performances.',
        severity: 'critical',
        mitigation: 'Connecter au moins GSC ou GA4 pour obtenir des données.',
      });
    }

    // Build summary
    let summary = '';
    if (!currentKpis) {
      summary = 'Données insuffisantes pour générer un rapport. Connectez vos sources de données.';
    } else {
      const highlights: string[] = [];
      
      if (momChanges.organic_clicks !== null) {
        highlights.push(`Clics organiques: ${momChanges.organic_clicks > 0 ? '+' : ''}${momChanges.organic_clicks}%`);
      }
      if (momChanges.total_conversions !== null) {
        highlights.push(`Conversions: ${momChanges.total_conversions > 0 ? '+' : ''}${momChanges.total_conversions}%`);
      }
      
      summary = highlights.length > 0
        ? `Performance ${this.month}: ${highlights.join(', ')}`
        : `Données disponibles pour ${this.month}`;
        
      if (alerts.length > 0) {
        summary += `. ${alerts.length} alerte(s) de qualité de données.`;
      }
    }

    // Determine if approval is required
    const requiresApproval = actions.some(a => 
      a.priority === 'critical' || a.priority === 'high'
    );

    return {
      summary,
      actions,
      risks,
      dependencies: this.getDependencies(integrationsStatus),
      metrics_to_watch: [
        'organic_clicks',
        'organic_impressions',
        'total_conversions',
        'revenue',
        'avg_position',
      ],
      requires_approval: requiresApproval,
      current_period: currentKpis,
      previous_period: previousKpis,
      mom_changes: momChanges,
      data_quality_status: status,
      data_quality_alerts: alerts,
      integrations_status: integrationsStatus,
      report_url: null,
    };
  }

  private getDependencies(
    integrationsStatus: AnalyticsAgentOutput['integrations_status']
  ): string[] {
    const deps: string[] = [];
    
    if (integrationsStatus.gsc === 'disconnected') {
      deps.push('integration:gsc');
    }
    if (integrationsStatus.ga4 === 'disconnected') {
      deps.push('integration:ga4');
    }
    if (integrationsStatus.ads === 'disconnected') {
      deps.push('integration:google_ads');
    }
    
    return deps;
  }
}

/**
 * Factory function to create and run the agent
 */
export async function runAnalyticsAgent(
  config: AnalyticsAgentConfig,
  currentKpis: KPISnapshot | null,
  previousKpis: KPISnapshot | null,
  integrationsStatus: AnalyticsAgentOutput['integrations_status']
): Promise<AnalyticsAgentOutput> {
  const agent = new AnalyticsAgent(config);
  return agent.run(currentKpis, previousKpis, integrationsStatus);
}
