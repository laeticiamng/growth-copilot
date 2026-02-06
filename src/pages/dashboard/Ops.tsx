import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Key,
  RefreshCw,
  Shield,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { getDateLocale } from '@/lib/date-locale';
import { useTranslation } from 'react-i18next';
import { useOpsMetrics } from '@/hooks/useOpsMetrics';
import { useTokenLifecycle } from '@/hooks/useTokenLifecycle';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Ops() {
  const { t, i18n } = useTranslation();
  const { 
    metrics, 
    incidents, 
    loading, 
    fetchMetrics, 
    fetchIncidents,
    resolveIncident 
  } = useOpsMetrics();
  
  const {
    tokenStatuses,
    auditLog,
    fetchTokenStatuses,
    fetchAuditLog,
    getExpiringTokens,
    getFailedTokens
  } = useTokenLifecycle();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    fetchMetrics(startDate, endDate);
    fetchIncidents(50);
    fetchTokenStatuses();
    fetchAuditLog();
  }, [fetchMetrics, fetchIncidents, fetchTokenStatuses, fetchAuditLog]);

  const totalAgentRuns = metrics.reduce((sum, m) => sum + m.agent_runs_total, 0);
  const totalSuccessful = metrics.reduce((sum, m) => sum + m.agent_runs_success, 0);
  const totalFailed = metrics.reduce((sum, m) => sum + m.agent_runs_failed, 0);
  const successRate = totalAgentRuns > 0 ? ((totalSuccessful / totalAgentRuns) * 100).toFixed(1) : '0';
  const totalCost = metrics.reduce((sum, m) => sum + m.total_cost_usd, 0);

  const expiringTokens = getExpiringTokens(24);
  const failedTokens = getFailedTokens();
  const unresolvedIncidents = incidents.filter(i => !i.resolved_at);
  const criticalIncidents = unresolvedIncidents.filter(i => i.severity === 'critical' || i.severity === 'high');

  const chartData = metrics.slice(0, 14).reverse().map(m => ({
    date: format(new Date(m.date), 'dd/MM'),
    success: m.agent_runs_success,
    failed: m.agent_runs_failed,
    cost: m.total_cost_usd
  }));

  const handleResolveIncident = async (incidentId: string) => {
    try {
      await resolveIncident(incidentId, 'Resolved from Ops dashboard');
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    }
  };

  return (
    <PermissionGuard permission="manage_team" fallback={
      <div className="p-8 text-center text-muted-foreground">
        {t("opsPage.adminOnly")}
      </div>
    }>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("opsPage.title")}</h1>
          <p className="text-muted-foreground">{t("opsPage.subtitle")}</p>
        </div>

        {/* Alert Banner */}
        {(criticalIncidents.length > 0 || failedTokens.length > 0 || expiringTokens.length > 0) && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <div className="flex-1">
                  {criticalIncidents.length > 0 && (
                    <p className="font-medium">{t("opsPage.criticalIncidents", { count: criticalIncidents.length })}</p>
                  )}
                  {failedTokens.length > 0 && (
                    <p className="text-sm text-muted-foreground">{t("opsPage.failedTokens", { count: failedTokens.length })}</p>
                  )}
                  {expiringTokens.length > 0 && (
                    <p className="text-sm text-muted-foreground">{t("opsPage.expiringTokens", { count: expiringTokens.length })}</p>
                  )}
                </div>
                <Button variant="destructive" size="sm" onClick={() => setActiveTab('incidents')}>
                  {t("opsPage.viewIncidents")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("opsPage.successRate")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {totalSuccessful} / {totalAgentRuns} agents (30j)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("opsPage.failures")}</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totalFailed}</div>
              <p className="text-xs text-muted-foreground">{t("opsPage.last30Days")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("opsPage.totalCost")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{t("opsPage.renderAi30d")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("opsPage.openIncidents")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unresolvedIncidents.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("opsPage.criticalCount", { count: criticalIncidents.length })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">{t("opsPage.overview")}</TabsTrigger>
            <TabsTrigger value="incidents">{t("opsPage.incidents")}</TabsTrigger>
            <TabsTrigger value="tokens">{t("opsPage.tokensAuth")}</TabsTrigger>
            <TabsTrigger value="costs">{t("opsPage.costs")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("opsPage.agentRuns14d")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="success" fill="hsl(var(--primary))" name={t("opsPage.chartSuccess")} />
                      <Bar dataKey="failed" fill="hsl(var(--destructive))" name={t("opsPage.chartFailures")} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("opsPage.dailyCosts14d")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>{t("opsPage.recentIncidents")}</CardTitle>
                <CardDescription>{t("opsPage.postMortems")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {incidents.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">{t("opsPage.noIncident")}</p>
                    ) : (
                      incidents.map(incident => (
                        <div key={incident.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          {incident.resolved_at ? (
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          ) : (
                            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                              incident.severity === 'critical' ? 'text-destructive' :
                              incident.severity === 'high' ? 'text-destructive/80' :
                              'text-muted-foreground'
                            }`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={
                                incident.severity === 'critical' ? 'destructive' :
                                incident.severity === 'high' ? 'destructive' :
                                'secondary'
                              }>
                                {incident.severity}
                              </Badge>
                              <span className="text-sm font-medium">{incident.step}</span>
                              {incident.job_type && (
                                <Badge variant="outline">{incident.job_type}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{incident.reason}</p>
                            {incident.suggested_fix && (
                              <p className="text-xs text-primary mt-1">💡 {incident.suggested_fix}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: getDateLocale(i18n.language) })}
                            </p>
                          </div>
                          {!incident.resolved_at && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResolveIncident(incident.id)}
                            >
                              {t("opsPage.resolve")}
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    {t("opsPage.tokenStatus")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tokenStatuses.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">{t("opsPage.noActiveIntegration")}</p>
                    ) : (
                      tokenStatuses.map(token => (
                        <div key={token.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Shield className={`h-5 w-5 ${
                              token.refresh_failure_count > 0 ? 'text-destructive' :
                              token.status === 'active' ? 'text-green-500' :
                              'text-muted-foreground'
                            }`} />
                            <div>
                              <p className="font-medium capitalize">{token.provider}</p>
                              <p className="text-xs text-muted-foreground">
                                {token.scopes_granted.length} scopes • 
                                {token.token_expires_at 
                                  ? ` ${t("opsPage.expiresAt")} ${format(new Date(token.token_expires_at), 'dd/MM HH:mm')}`
                                  : ` ${t("opsPage.noExpiry")}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {token.refresh_failure_count > 0 && (
                              <Badge variant="destructive">{token.refresh_failure_count} {t("opsPage.failuresLabel")}</Badge>
                            )}
                            <Button variant="ghost" size="icon">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t("opsPage.tokenAudit")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {auditLog.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t("opsPage.noEvent")}</p>
                      ) : (
                        auditLog.map(entry => (
                          <div key={entry.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                            <Badge variant={
                              entry.action === 'auth_failure' ? 'destructive' :
                              entry.action === 'revoked' ? 'secondary' :
                              'outline'
                            }>
                              {entry.action}
                            </Badge>
                            <span className="text-sm capitalize">{entry.provider}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {format(new Date(entry.created_at), 'dd/MM HH:mm')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <Card>
              <CardHeader>
                <CardTitle>{t("opsPage.costBreakdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-2xl font-bold">${metrics.reduce((s, m) => s + m.render_cost_usd, 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{t("opsPage.renderCosts")}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-2xl font-bold">${metrics.reduce((s, m) => s + m.ai_cost_usd, 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{t("opsPage.aiCosts")}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{t("opsPage.total30d")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
