import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, Edit2, AlertTriangle, TrendingDown, TrendingUp, Activity, Shield, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AlertRule {
  id: string; name: string; description?: string; metric: string;
  condition: "above" | "below" | "equals" | "change_percent";
  threshold: number; channels: ("email" | "push" | "in_app")[];
  severity: "info" | "warning" | "critical"; enabled: boolean; createdAt: Date;
}

interface AlertRulesConfigProps {
  rules?: AlertRule[];
  onSave?: (rules: AlertRule[]) => Promise<void>;
}

export function AlertRulesConfig({ rules, onSave }: AlertRulesConfigProps) {
  const { t } = useTranslation();

  const METRIC_OPTIONS = [
    { value: "organic_clicks", label: t("components.alertRules.metricClicks") },
    { value: "organic_impressions", label: t("components.alertRules.metricImpressions") },
    { value: "avg_position", label: t("components.alertRules.metricPosition") },
    { value: "total_conversions", label: t("components.alertRules.metricConversions") },
    { value: "bounce_rate", label: t("components.alertRules.metricBounce") },
    { value: "agent_failures", label: t("components.alertRules.metricAgentFailures") },
    { value: "approval_pending", label: t("components.alertRules.metricApprovalPending") },
    { value: "token_usage", label: t("components.alertRules.metricTokenUsage") },
  ];

  const DEFAULT_RULES: AlertRule[] = [
    { id: "1", name: t("components.alertRules.ruleTrafficDrop"), description: t("components.alertRules.ruleTrafficDropDesc"), metric: "organic_clicks", condition: "change_percent", threshold: -20, channels: ["email", "push"], severity: "critical", enabled: true, createdAt: new Date() },
    { id: "2", name: t("components.alertRules.rulePositionDrop"), description: t("components.alertRules.rulePositionDropDesc"), metric: "avg_position", condition: "above", threshold: 15, channels: ["in_app"], severity: "warning", enabled: true, createdAt: new Date() },
  ];

  const [localRules, setLocalRules] = useState<AlertRule[]>(rules || DEFAULT_RULES);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({ name: "", metric: "organic_clicks", condition: "below", threshold: 0, channels: ["in_app"], severity: "warning", enabled: true });

  const getSeverityIcon = (severity: AlertRule['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning': return <Activity className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getConditionLabel = (condition: AlertRule['condition']) => {
    switch (condition) {
      case 'above': return t("components.alertRules.condAbove");
      case 'below': return t("components.alertRules.condBelow");
      case 'equals': return t("components.alertRules.condEquals");
      case 'change_percent': return t("components.alertRules.condChange");
      default: return condition;
    }
  };

  const handleToggleRule = (ruleId: string) => { setLocalRules(prev => prev.map(rule => rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)); };
  const handleDeleteRule = (ruleId: string) => { setLocalRules(prev => prev.filter(rule => rule.id !== ruleId)); toast.success(t("components.alertRules.ruleDeleted")); };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.metric) { toast.error(t("components.alertRules.fillAllFields")); return; }
    const rule: AlertRule = { id: Date.now().toString(), name: newRule.name, description: newRule.description, metric: newRule.metric!, condition: newRule.condition || "below", threshold: newRule.threshold || 0, channels: newRule.channels || ["in_app"], severity: newRule.severity || "warning", enabled: true, createdAt: new Date() };
    setLocalRules(prev => [...prev, rule]);
    setShowAddDialog(false);
    setNewRule({ name: "", metric: "organic_clicks", condition: "below", threshold: 0, channels: ["in_app"], severity: "warning", enabled: true });
    toast.success(t("components.alertRules.ruleCreated"));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try { await onSave(localRules); toast.success(t("components.alertRules.configSaved")); }
    catch (error) { toast.error(t("components.alertRules.saveError")); }
    finally { setIsSaving(false); }
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {t("components.alertRules.title")}
            </CardTitle>
            <CardDescription>{t("components.alertRules.subtitle")}</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />{t("components.alertRules.newRule")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("components.alertRules.newRuleTitle")}</DialogTitle>
                <DialogDescription>{t("components.alertRules.newRuleDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t("components.alertRules.ruleName")}</Label>
                  <Input placeholder={t("components.alertRules.ruleNamePlaceholder")} value={newRule.name || ""} onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("components.alertRules.metric")}</Label>
                    <Select value={newRule.metric} onValueChange={(value) => setNewRule(prev => ({ ...prev, metric: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{METRIC_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("components.alertRules.condition")}</Label>
                    <Select value={newRule.condition} onValueChange={(value) => setNewRule(prev => ({ ...prev, condition: value as AlertRule['condition'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">{t("components.alertRules.condAbove")}</SelectItem>
                        <SelectItem value="below">{t("components.alertRules.condBelow")}</SelectItem>
                        <SelectItem value="equals">{t("components.alertRules.condEquals")}</SelectItem>
                        <SelectItem value="change_percent">{t("components.alertRules.condChange")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("components.alertRules.threshold")}</Label>
                    <Input type="number" value={newRule.threshold || 0} onChange={(e) => setNewRule(prev => ({ ...prev, threshold: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("components.alertRules.severity")}</Label>
                    <Select value={newRule.severity} onValueChange={(value) => setNewRule(prev => ({ ...prev, severity: value as AlertRule['severity'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">{t("components.alertRules.sevWarning")}</SelectItem>
                        <SelectItem value="critical">{t("components.alertRules.sevCritical")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleAddRule}>{t("components.alertRules.createRule")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {localRules.map((rule) => (
          <div key={rule.id} className={`flex items-center justify-between p-4 rounded-lg border ${rule.enabled ? 'bg-secondary/50' : 'bg-muted/30 opacity-60'}`}>
            <div className="flex items-center gap-3">
              {getSeverityIcon(rule.severity)}
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-sm text-muted-foreground">
                  {METRIC_OPTIONS.find(m => m.value === rule.metric)?.label} {getConditionLabel(rule.condition)} {rule.threshold}{rule.condition === 'change_percent' && '%'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={rule.severity === 'critical' ? 'destructive' : rule.severity === 'warning' ? 'secondary' : 'outline'}>{rule.severity}</Badge>
              <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteRule(rule.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {localRules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t("components.alertRules.noRules")}</p>
          </div>
        )}
        {onSave && localRules.length > 0 && (
          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("components.alertRules.saveRules")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
