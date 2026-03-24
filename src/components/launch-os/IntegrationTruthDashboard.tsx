import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, XCircle, AlertTriangle, HelpCircle, RefreshCw,
  Database, CreditCard, BarChart3, Megaphone, Bot, Mail, Globe, Video,
} from 'lucide-react';

import { runIntegrationHealthCheck, type ConnectorHealth, type IntegrationHealthReport, type ConnectorStatus } from '@/lib/launch-os/integration-health';
import { useWorkspace } from '@/hooks/useWorkspace';

// ─── Status Helpers ──────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: ConnectorStatus }) {
  switch (status) {
    case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'degraded': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'not_configured': return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    default: return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: ConnectorStatus }) {
  const config: Record<ConnectorStatus, { className: string; label: string }> = {
    healthy: { className: 'bg-green-500/10 text-green-700 border-green-200', label: 'Healthy' },
    degraded: { className: 'bg-orange-500/10 text-orange-700 border-orange-200', label: 'Degraded' },
    error: { className: 'bg-red-500/10 text-red-700 border-red-200', label: 'Error' },
    not_configured: { className: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Not Configured' },
    unknown: { className: 'bg-gray-500/10 text-gray-500 border-gray-200', label: 'Unknown' },
  };
  const c = config[status];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'database': return <Database className="h-4 w-4" />;
    case 'payment': return <CreditCard className="h-4 w-4" />;
    case 'analytics': return <BarChart3 className="h-4 w-4" />;
    case 'advertising': return <Megaphone className="h-4 w-4" />;
    case 'ai': return <Bot className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'social': return <Globe className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    default: return <Globe className="h-4 w-4" />;
  }
}

// ─── Connector Row ───────────────────────────────────────────────────────────

function ConnectorRow({ connector }: { connector: ConnectorHealth }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <CategoryIcon category={connector.category} />
      <StatusIcon status={connector.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{connector.name}</p>
        {connector.error_surface && (
          <p className="text-xs text-red-600 truncate">{connector.error_surface}</p>
        )}
        {connector.degraded_mode && !connector.error_surface && (
          <p className="text-xs text-orange-600 truncate">{connector.degraded_mode}</p>
        )}
        {connector.action_required && (
          <p className="text-xs text-blue-600 truncate">{connector.action_required}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={connector.status} />
        {connector.last_success && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {new Date(connector.last_success).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function IntegrationTruthDashboard() {
  const { currentWorkspace } = useWorkspace();
  const [report, setReport] = useState<IntegrationHealthReport | null>(null);
  const [loading, setLoading] = useState(false);

  const runHealthCheck = async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const result = await runIntegrationHealthCheck(currentWorkspace.id);
      setReport(result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, [currentWorkspace?.id]);

  if (!report) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Integration Truth Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Runtime health of every connector. Errors are never hidden.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={report.overall_status} />
          <Button variant="outline" size="sm" onClick={runHealthCheck} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-700">{report.healthy_count}</p>
            <p className="text-xs text-green-600">Healthy</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{report.degraded_count}</p>
            <p className="text-xs text-orange-600">Degraded</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-red-700">{report.error_count}</p>
            <p className="text-xs text-red-600">Error</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{report.not_configured_count}</p>
            <p className="text-xs text-muted-foreground">Not Configured</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Connector List ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Connectors</CardTitle>
          <CardDescription>
            Last checked: {new Date(report.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.connectors.map(connector => (
            <ConnectorRow key={connector.id} connector={connector} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
