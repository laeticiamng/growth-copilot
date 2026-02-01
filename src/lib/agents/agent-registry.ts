/**
 * Agent Registry
 * Centralized registry for all AI agents with capability tracking
 * 
 * Features:
 * - Unified agent discovery
 * - Capability-based routing
 * - Health monitoring
 * - Usage analytics
 */

import type { AgentType, AgentArtifact } from './types';

export type AgentCapability = 
  | 'seo_audit'
  | 'content_creation'
  | 'keyword_research'
  | 'ads_optimization'
  | 'social_scheduling'
  | 'analytics_analysis'
  | 'cro_testing'
  | 'reputation_monitoring'
  | 'competitive_analysis'
  | 'offer_generation'
  | 'lifecycle_automation'
  | 'report_generation'
  | 'compliance_check';

export type AgentStatus = 'available' | 'busy' | 'disabled' | 'error';

export interface AgentDefinition {
  type: AgentType;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  requiresApproval: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
  category: 'orchestration' | 'seo' | 'content' | 'ads' | 'social' | 'analytics' | 'sales' | 'automation';
}

export interface AgentInstance {
  definition: AgentDefinition;
  status: AgentStatus;
  lastRun: Date | null;
  runCount: number;
  errorCount: number;
  avgDurationMs: number;
}

/**
 * Central registry of all available agents
 */
export const AGENT_DEFINITIONS: Record<AgentType, AgentDefinition> = {
  chief_growth_officer: {
    type: 'chief_growth_officer',
    name: 'Chief Growth Officer',
    description: 'Orchestrateur principal qui coordonne tous les agents et priorise les actions via ICE scoring',
    capabilities: ['analytics_analysis', 'report_generation'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '👔',
    color: '#6366f1',
    category: 'orchestration',
  },
  quality_compliance: {
    type: 'quality_compliance',
    name: 'Quality & Compliance Officer',
    description: 'Valide chaque livrable pour assurer la conformité éthique et technique',
    capabilities: ['compliance_check'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🛡️',
    color: '#10b981',
    category: 'orchestration',
  },
  tech_auditor: {
    type: 'tech_auditor',
    name: 'Tech SEO Auditor',
    description: 'Analyse technique du site pour détecter les problèmes SEO',
    capabilities: ['seo_audit'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🔍',
    color: '#f59e0b',
    category: 'seo',
  },
  keyword_strategist: {
    type: 'keyword_strategist',
    name: 'Keyword Strategist',
    description: 'Recherche et analyse des mots-clés pour la stratégie SEO',
    capabilities: ['keyword_research'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🎯',
    color: '#8b5cf6',
    category: 'seo',
  },
  content_builder: {
    type: 'content_builder',
    name: 'Content Builder',
    description: 'Génère du contenu optimisé SEO basé sur les briefs',
    capabilities: ['content_creation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '✍️',
    color: '#ec4899',
    category: 'content',
  },
  local_optimizer: {
    type: 'local_optimizer',
    name: 'Local SEO Manager',
    description: 'Optimise la présence locale et les fiches Google Business',
    capabilities: ['seo_audit'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '📍',
    color: '#14b8a6',
    category: 'seo',
  },
  ads_optimizer: {
    type: 'ads_optimizer',
    name: 'Ads Optimizer',
    description: 'Optimise les campagnes publicitaires Google Ads',
    capabilities: ['ads_optimization'],
    requiresApproval: true,
    riskLevel: 'high',
    icon: '📊',
    color: '#f97316',
    category: 'ads',
  },
  analytics_detective: {
    type: 'analytics_detective',
    name: 'Analytics Guardian',
    description: 'Détecte les anomalies et génère des insights depuis les données',
    capabilities: ['analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🔎',
    color: '#06b6d4',
    category: 'analytics',
  },
  cro_specialist: {
    type: 'cro_specialist',
    name: 'CRO Specialist',
    description: 'Analyse et optimise les taux de conversion',
    capabilities: ['cro_testing'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '📈',
    color: '#84cc16',
    category: 'analytics',
  },
  offer_architect: {
    type: 'offer_architect',
    name: 'Offer Architect',
    description: 'Conçoit des offres commerciales optimisées',
    capabilities: ['offer_generation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '💰',
    color: '#eab308',
    category: 'sales',
  },
  lifecycle_manager: {
    type: 'lifecycle_manager',
    name: 'Lifecycle Manager',
    description: 'Automatise les séquences email et nurturing',
    capabilities: ['lifecycle_automation'],
    requiresApproval: true,
    riskLevel: 'medium',
    icon: '🔄',
    color: '#a855f7',
    category: 'automation',
  },
  sales_accelerator: {
    type: 'sales_accelerator',
    name: 'Sales Accelerator',
    description: 'Accélère le pipeline de vente avec des recommandations IA',
    capabilities: ['analytics_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '🚀',
    color: '#ef4444',
    category: 'sales',
  },
  reputation_guardian: {
    type: 'reputation_guardian',
    name: 'Reputation Guardian',
    description: 'Surveille et gère la réputation en ligne',
    capabilities: ['reputation_monitoring'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '⭐',
    color: '#fbbf24',
    category: 'social',
  },
  competitive_watcher: {
    type: 'competitive_watcher',
    name: 'Competitive Analyst',
    description: 'Analyse la concurrence et détecte les opportunités',
    capabilities: ['competitive_analysis'],
    requiresApproval: false,
    riskLevel: 'low',
    icon: '👁️',
    color: '#64748b',
    category: 'analytics',
  },
};

/**
 * Agent Registry Class
 * Manages agent instances and provides discovery services
 */
export class AgentRegistry {
  private instances: Map<AgentType, AgentInstance> = new Map();

  constructor() {
    // Initialize all agents as available
    Object.entries(AGENT_DEFINITIONS).forEach(([type, definition]) => {
      this.instances.set(type as AgentType, {
        definition,
        status: 'available',
        lastRun: null,
        runCount: 0,
        errorCount: 0,
        avgDurationMs: 0,
      });
    });
  }

  /**
   * Get all registered agents
   */
  getAll(): AgentInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get agent by type
   */
  get(type: AgentType): AgentInstance | undefined {
    return this.instances.get(type);
  }

  /**
   * Find agents by capability
   */
  findByCapability(capability: AgentCapability): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.capabilities.includes(capability)
    );
  }

  /**
   * Find agents by category
   */
  findByCategory(category: AgentDefinition['category']): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.category === category
    );
  }

  /**
   * Get available agents (not busy or in error)
   */
  getAvailable(): AgentInstance[] {
    return this.getAll().filter(instance => instance.status === 'available');
  }

  /**
   * Update agent status
   */
  updateStatus(type: AgentType, status: AgentStatus): void {
    const instance = this.instances.get(type);
    if (instance) {
      instance.status = status;
    }
  }

  /**
   * Record a completed run
   */
  recordRun(type: AgentType, durationMs: number, success: boolean): void {
    const instance = this.instances.get(type);
    if (instance) {
      instance.lastRun = new Date();
      instance.runCount++;
      if (!success) instance.errorCount++;
      
      // Update average duration
      const totalRuns = instance.runCount;
      instance.avgDurationMs = 
        (instance.avgDurationMs * (totalRuns - 1) + durationMs) / totalRuns;
    }
  }

  /**
   * Get agents that require approval
   */
  getApprovalRequired(): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.requiresApproval
    );
  }

  /**
   * Get high-risk agents
   */
  getHighRisk(): AgentInstance[] {
    return this.getAll().filter(instance => 
      instance.definition.riskLevel === 'high'
    );
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    total: number;
    available: number;
    busy: number;
    error: number;
    totalRuns: number;
    totalErrors: number;
  } {
    const all = this.getAll();
    return {
      total: all.length,
      available: all.filter(a => a.status === 'available').length,
      busy: all.filter(a => a.status === 'busy').length,
      error: all.filter(a => a.status === 'error').length,
      totalRuns: all.reduce((sum, a) => sum + a.runCount, 0),
      totalErrors: all.reduce((sum, a) => sum + a.errorCount, 0),
    };
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();

/**
 * Helper to route a task to the best available agent
 */
export function routeToAgent(capability: AgentCapability): AgentInstance | null {
  const candidates = agentRegistry
    .findByCapability(capability)
    .filter(a => a.status === 'available');

  if (candidates.length === 0) return null;

  // Prefer agent with lowest error rate
  return candidates.sort((a, b) => {
    const aErrorRate = a.runCount > 0 ? a.errorCount / a.runCount : 0;
    const bErrorRate = b.runCount > 0 ? b.errorCount / b.runCount : 0;
    return aErrorRate - bErrorRate;
  })[0];
}
