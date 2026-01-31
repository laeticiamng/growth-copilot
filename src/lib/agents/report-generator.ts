/**
 * Report Generator Agent
 * 
 * Mission: Generate monthly PDF reports with KPI summaries, actions, and next steps.
 * 
 * Triggers:
 * - Monthly schedule (1st of month for previous month)
 * - Manual "Generate report" button
 * 
 * Inputs:
 * - kpis_daily (aggregated for the month)
 * - action_log (completed actions)
 * - issues (open issues for next month plan)
 * - data_quality_alerts
 * 
 * Outputs:
 * - JSON artifact (strict schema)
 * - HTML report stored in Storage
 * - Writes to: monthly_reports, action_log
 */

import type { AgentArtifact, AgentAction, AgentRisk } from './types';
import type { KPISnapshot, DataQualityAlert } from './analytics-agent';

// Report sections
export interface ReportSection {
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

// Completed action for report
export interface CompletedAction {
  date: string;
  type: string;
  description: string;
  result: 'success' | 'partial' | 'failed';
}

// Next month priority
export interface NextMonthPriority {
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact_score: number;
  category: string;
}

// Report Generator Output
export interface ReportGeneratorOutput extends AgentArtifact {
  report_id: string;
  month: string;
  site: {
    name: string;
    domain: string;
  };
  executive_summary: string;
  kpi_summary: {
    metric: string;
    current: number | string;
    previous: number | string;
    change: string | null;
    trend: 'up' | 'down' | 'stable';
  }[];
  actions_completed: CompletedAction[];
  next_month_priorities: NextMonthPriority[];
  data_quality_risks: DataQualityAlert[];
  html_content: string;
  pdf_url: string | null;
}

// Configuration
export interface ReportGeneratorConfig {
  workspaceId: string;
  siteId: string;
  siteName: string;
  siteDomain: string;
  month: string; // YYYY-MM format
}

/**
 * Generates executive summary from KPI data
 */
export function generateExecutiveSummary(
  current: KPISnapshot | null,
  previous: KPISnapshot | null,
  actionsCount: number,
  issuesCount: number,
  alertsCount: number
): string {
  if (!current) {
    return "Données insuffisantes pour générer le résumé exécutif. Veuillez vérifier que les intégrations de données sont correctement configurées.";
  }

  const parts: string[] = [];

  if (previous) {
    const clickChange = previous.organic_clicks > 0
      ? ((current.organic_clicks - previous.organic_clicks) / previous.organic_clicks) * 100
      : 0;

    if (clickChange > 0) {
      parts.push(`Les clics organiques ont augmenté de ${clickChange.toFixed(1)}%`);
    } else if (clickChange < 0) {
      parts.push(`Les clics organiques ont diminué de ${Math.abs(clickChange).toFixed(1)}%`);
    }

    if (previous.total_conversions > 0) {
      const convChange = ((current.total_conversions - previous.total_conversions) / previous.total_conversions) * 100;
      if (convChange > 0) {
        parts.push(`conversions en hausse de ${convChange.toFixed(1)}%`);
      } else if (convChange < 0) {
        parts.push(`conversions en baisse de ${Math.abs(convChange).toFixed(1)}%`);
      }
    }
  }

  if (actionsCount > 0) {
    parts.push(`${actionsCount} action${actionsCount > 1 ? 's' : ''} réalisée${actionsCount > 1 ? 's' : ''} ce mois`);
  }

  if (issuesCount > 0) {
    parts.push(`${issuesCount} problème${issuesCount > 1 ? 's' : ''} ouvert${issuesCount > 1 ? 's' : ''} à traiter`);
  }

  if (alertsCount > 0) {
    parts.push(`${alertsCount} alerte${alertsCount > 1 ? 's' : ''} qualité de données à résoudre`);
  }

  return parts.length > 0 ? parts.join(". ") + "." : "Période stable, aucun changement majeur détecté.";
}

/**
 * Builds KPI summary rows for the report
 */
export function buildKPISummary(
  current: KPISnapshot | null,
  previous: KPISnapshot | null
): ReportGeneratorOutput['kpi_summary'] {
  if (!current) return [];

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  const calcChange = (curr: number, prev: number): { change: string | null; trend: 'up' | 'down' | 'stable' } => {
    if (!prev || prev === 0) return { change: null, trend: 'stable' };
    const pct = ((curr - prev) / prev) * 100;
    return {
      change: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
      trend: pct > 1 ? 'up' : pct < -1 ? 'down' : 'stable',
    };
  };

  const metrics: ReportGeneratorOutput['kpi_summary'] = [];

  // Organic clicks
  const clicksChange = previous ? calcChange(current.organic_clicks, previous.organic_clicks) : { change: null, trend: 'stable' as const };
  metrics.push({
    metric: 'Clics organiques',
    current: formatNumber(current.organic_clicks),
    previous: previous ? formatNumber(previous.organic_clicks) : '-',
    ...clicksChange,
  });

  // Impressions
  const impChange = previous ? calcChange(current.organic_impressions, previous.organic_impressions) : { change: null, trend: 'stable' as const };
  metrics.push({
    metric: 'Impressions',
    current: formatNumber(current.organic_impressions),
    previous: previous ? formatNumber(previous.organic_impressions) : '-',
    ...impChange,
  });

  // Sessions
  const sessChange = previous ? calcChange(current.organic_sessions, previous.organic_sessions) : { change: null, trend: 'stable' as const };
  metrics.push({
    metric: 'Sessions organiques',
    current: formatNumber(current.organic_sessions),
    previous: previous ? formatNumber(previous.organic_sessions) : '-',
    ...sessChange,
  });

  // Conversions
  const convChange = previous ? calcChange(current.total_conversions, previous.total_conversions) : { change: null, trend: 'stable' as const };
  metrics.push({
    metric: 'Conversions',
    current: formatNumber(current.total_conversions),
    previous: previous ? formatNumber(previous.total_conversions) : '-',
    ...convChange,
  });

  // Revenue
  const revChange = previous ? calcChange(current.revenue, previous.revenue) : { change: null, trend: 'stable' as const };
  metrics.push({
    metric: 'Revenu',
    current: `${formatNumber(current.revenue)}€`,
    previous: previous ? `${formatNumber(previous.revenue)}€` : '-',
    ...revChange,
  });

  // Position (inverted - lower is better)
  if (current.avg_position !== null) {
    const posChange = previous?.avg_position
      ? calcChange(previous.avg_position, current.avg_position) // Inverted
      : { change: null, trend: 'stable' as const };
    metrics.push({
      metric: 'Position moyenne',
      current: current.avg_position.toFixed(1),
      previous: previous?.avg_position ? previous.avg_position.toFixed(1) : '-',
      ...posChange,
    });
  }

  return metrics;
}

/**
 * Generates HTML report content
 */
export function generateHTMLReport(
  config: ReportGeneratorConfig,
  executiveSummary: string,
  kpiSummary: ReportGeneratorOutput['kpi_summary'],
  actionsCompleted: CompletedAction[],
  nextPriorities: NextMonthPriority[],
  dataQualityRisks: DataQualityAlert[]
): string {
  const monthName = new Date(config.month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Mensuel - ${monthName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px; 
      margin: 0 auto; 
      padding: 40px 20px; 
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { 
      color: #0066cc; 
      border-bottom: 3px solid #0066cc; 
      padding-bottom: 12px; 
      margin-bottom: 8px;
      font-size: 28px;
    }
    h2 { 
      color: #333; 
      margin-top: 32px; 
      margin-bottom: 16px;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .site-info { color: #666; margin-bottom: 24px; }
    .summary { 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
      padding: 24px; 
      border-radius: 12px; 
      margin: 24px 0;
      border-left: 4px solid #0066cc;
    }
    .kpi-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
      gap: 16px; 
      margin: 24px 0; 
    }
    .kpi-card { 
      background: white; 
      border: 1px solid #e0e0e0; 
      padding: 20px; 
      border-radius: 12px; 
      text-align: center;
      transition: box-shadow 0.2s;
    }
    .kpi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #0066cc; margin: 8px 0; }
    .kpi-change { font-size: 14px; font-weight: 600; }
    .trend-up { color: #22c55e; }
    .trend-down { color: #ef4444; }
    .trend-stable { color: #666; }
    .action-list { list-style: none; padding: 0; }
    .action-list li { 
      padding: 16px; 
      border-bottom: 1px solid #eee; 
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .action-list li:last-child { border-bottom: none; }
    .action-type { 
      font-size: 11px; 
      background: #e0e0e0; 
      padding: 2px 8px; 
      border-radius: 4px; 
      text-transform: uppercase;
    }
    .priority-badge {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 600;
    }
    .priority-critical { background: #fee2e2; color: #dc2626; }
    .priority-high { background: #fef3c7; color: #d97706; }
    .priority-medium { background: #dbeafe; color: #2563eb; }
    .priority-low { background: #f3f4f6; color: #6b7280; }
    .alert { 
      padding: 16px; 
      margin: 8px 0; 
      border-radius: 8px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .alert-icon { font-size: 20px; }
    .alert.critical { background: #fee2e2; border-left: 4px solid #ef4444; }
    .alert.high { background: #fef3c7; border-left: 4px solid #f59e0b; }
    .alert.medium { background: #dbeafe; border-left: 4px solid #3b82f6; }
    .footer { 
      margin-top: 48px; 
      text-align: center; 
      color: #666; 
      font-size: 12px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>📊 Rapport de Performance Mensuel</h1>
  <div class="site-info">
    <strong>${config.siteName}</strong> (${config.siteDomain})<br>
    Période : ${monthName}
  </div>
  
  <div class="summary">
    <h2 style="margin-top: 0;">📋 Résumé Exécutif</h2>
    <p>${executiveSummary}</p>
  </div>

  <h2>📈 Indicateurs Clés de Performance</h2>
  ${kpiSummary.length > 0 ? `
  <div class="kpi-grid">
    ${kpiSummary.map(kpi => `
      <div class="kpi-card">
        <div class="kpi-label">${kpi.metric}</div>
        <div class="kpi-value">${kpi.current}</div>
        ${kpi.change ? `
          <div class="kpi-change trend-${kpi.trend}">
            ${kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} ${kpi.change}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : '<div class="empty-state">Aucune donnée KPI disponible</div>'}

  <h2>✅ Actions Réalisées ce Mois</h2>
  ${actionsCompleted.length > 0 ? `
  <ul class="action-list">
    ${actionsCompleted.slice(0, 10).map(action => `
      <li>
        <div>
          <span class="action-type">${action.type}</span>
          <span style="margin-left: 8px;">${action.description}</span>
        </div>
        <span style="color: #666; font-size: 12px;">${new Date(action.date).toLocaleDateString('fr-FR')}</span>
      </li>
    `).join('')}
  </ul>
  ` : '<div class="empty-state">Aucune action enregistrée ce mois</div>'}

  <h2>🎯 Priorités pour le Mois Prochain</h2>
  ${nextPriorities.length > 0 ? `
  <ul class="action-list">
    ${nextPriorities.slice(0, 5).map(priority => `
      <li>
        <div>
          <span class="priority-badge priority-${priority.priority}">${priority.priority.toUpperCase()}</span>
          <span style="margin-left: 8px;">${priority.title}</span>
          <span style="color: #666; font-size: 12px; margin-left: 8px;">(${priority.category})</span>
        </div>
      </li>
    `).join('')}
  </ul>
  ` : '<div class="empty-state">Aucune priorité définie</div>'}

  ${dataQualityRisks.length > 0 ? `
  <h2>⚠️ Alertes Qualité de Données</h2>
  ${dataQualityRisks.map(risk => `
    <div class="alert ${risk.severity}">
      <span class="alert-icon">⚠️</span>
      <div>
        <strong>${risk.title}</strong>
        <p style="margin-top: 4px; font-size: 14px;">${risk.description}</p>
      </div>
    </div>
  `).join('')}
  ` : ''}

  <div class="footer">
    <p>Généré automatiquement par Growth Engine</p>
    <p>${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</body>
</html>`;
}

/**
 * Main Report Generator class
 */
export class ReportGenerator {
  private config: ReportGeneratorConfig;

  constructor(config: ReportGeneratorConfig) {
    this.config = config;
  }

  /**
   * Generate the report
   */
  generate(
    currentKpis: KPISnapshot | null,
    previousKpis: KPISnapshot | null,
    actionsCompleted: CompletedAction[],
    openIssues: NextMonthPriority[],
    dataQualityAlerts: DataQualityAlert[]
  ): ReportGeneratorOutput {
    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(
      currentKpis,
      previousKpis,
      actionsCompleted.length,
      openIssues.length,
      dataQualityAlerts.length
    );

    // Build KPI summary
    const kpiSummary = buildKPISummary(currentKpis, previousKpis);

    // Generate HTML
    const htmlContent = generateHTMLReport(
      this.config,
      executiveSummary,
      kpiSummary,
      actionsCompleted,
      openIssues,
      dataQualityAlerts
    );

    // Build actions (for the agent artifact)
    const actions: AgentAction[] = [];

    if (!currentKpis) {
      actions.push({
        id: 'connect_data_sources',
        title: 'Connecter les sources de données',
        description: 'Aucune donnée disponible pour le rapport. Connectez GSC/GA4.',
        priority: 'critical',
        effort: 'low',
        impact: 'high',
        ice_score: 95,
        category: 'integration',
        auto_fixable: false,
      });
    }

    // Add top issues as actions
    openIssues.slice(0, 3).forEach((issue, i) => {
      actions.push({
        id: `priority_${i + 1}`,
        title: issue.title,
        description: `Priorité ${issue.priority} - ${issue.category}`,
        priority: issue.priority,
        effort: 'medium',
        impact: issue.priority === 'critical' ? 'high' : 'medium',
        ice_score: issue.impact_score,
        category: issue.category,
        auto_fixable: false,
      });
    });

    // Build risks
    const risks: AgentRisk[] = dataQualityAlerts
      .filter(a => a.severity === 'critical' || a.severity === 'high')
      .map(a => ({
        id: a.id,
        description: a.description,
        severity: a.severity,
        mitigation: 'Résoudre avant de prendre des décisions basées sur ces données.',
      }));

    return {
      summary: executiveSummary,
      actions,
      risks,
      dependencies: [],
      metrics_to_watch: ['organic_clicks', 'total_conversions', 'revenue'],
      requires_approval: false,
      report_id: crypto.randomUUID(),
      month: this.config.month,
      site: {
        name: this.config.siteName,
        domain: this.config.siteDomain,
      },
      executive_summary: executiveSummary,
      kpi_summary: kpiSummary,
      actions_completed: actionsCompleted,
      next_month_priorities: openIssues.slice(0, 5),
      data_quality_risks: dataQualityAlerts,
      html_content: htmlContent,
      pdf_url: null,
    };
  }
}

/**
 * Factory function
 */
export function generateReport(
  config: ReportGeneratorConfig,
  currentKpis: KPISnapshot | null,
  previousKpis: KPISnapshot | null,
  actionsCompleted: CompletedAction[],
  openIssues: NextMonthPriority[],
  dataQualityAlerts: DataQualityAlert[]
): ReportGeneratorOutput {
  const generator = new ReportGenerator(config);
  return generator.generate(currentKpis, previousKpis, actionsCompleted, openIssues, dataQualityAlerts);
}
