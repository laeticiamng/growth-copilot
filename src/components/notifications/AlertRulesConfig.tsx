import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  Shield,
  Target,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AlertRule {
  id: string;
  name: string;
  description?: string;
  metric: string;
  condition: "above" | "below" | "equals" | "change_percent";
  threshold: number;
  channels: ("email" | "push" | "in_app")[];
  severity: "info" | "warning" | "critical";
  enabled: boolean;
  createdAt: Date;
}

interface AlertRulesConfigProps {
  rules?: AlertRule[];
  onSave?: (rules: AlertRule[]) => Promise<void>;
}

const METRIC_OPTIONS = [
  { value: "organic_clicks", label: "Clics organiques" },
  { value: "organic_impressions", label: "Impressions" },
  { value: "avg_position", label: "Position moyenne" },
  { value: "total_conversions", label: "Conversions" },
  { value: "bounce_rate", label: "Taux de rebond" },
  { value: "agent_failures", label: "Échecs agents" },
  { value: "approval_pending", label: "Approbations en attente" },
  { value: "token_usage", label: "Consommation tokens" },
];

const DEFAULT_RULES: AlertRule[] = [
  {
    id: "1",
    name: "Chute de trafic",
    description: "Alerte si le trafic baisse de plus de 20%",
    metric: "organic_clicks",
    condition: "change_percent",
    threshold: -20,
    channels: ["email", "push"],
    severity: "critical",
    enabled: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Position dégradée",
    description: "Alerte si position moyenne > 15",
    metric: "avg_position",
    condition: "above",
    threshold: 15,
    channels: ["in_app"],
    severity: "warning",
    enabled: true,
    createdAt: new Date(),
  },
];

export function AlertRulesConfig({ rules = DEFAULT_RULES, onSave }: AlertRulesConfigProps) {
  const [localRules, setLocalRules] = useState<AlertRule[]>(rules);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: "",
    metric: "organic_clicks",
    condition: "below",
    threshold: 0,
    channels: ["in_app"],
    severity: "warning",
    enabled: true,
  });

  const getSeverityIcon = (severity: AlertRule['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <Activity className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getConditionLabel = (condition: AlertRule['condition']) => {
    switch (condition) {
      case 'above':
        return 'Supérieur à';
      case 'below':
        return 'Inférieur à';
      case 'equals':
        return 'Égal à';
      case 'change_percent':
        return 'Variation de';
      default:
        return condition;
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setLocalRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    setLocalRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success("Règle supprimée");
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.metric) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const rule: AlertRule = {
      id: Date.now().toString(),
      name: newRule.name,
      description: newRule.description,
      metric: newRule.metric!,
      condition: newRule.condition || "below",
      threshold: newRule.threshold || 0,
      channels: newRule.channels || ["in_app"],
      severity: newRule.severity || "warning",
      enabled: true,
      createdAt: new Date(),
    };

    setLocalRules(prev => [...prev, rule]);
    setShowAddDialog(false);
    setNewRule({
      name: "",
      metric: "organic_clicks",
      condition: "below",
      threshold: 0,
      channels: ["in_app"],
      severity: "warning",
      enabled: true,
    });
    toast.success("Règle d'alerte créée");
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(localRules);
      toast.success("Configuration sauvegardée");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Règles d'alertes
            </CardTitle>
            <CardDescription>
              Configurez vos alertes automatiques sur les KPIs
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle règle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle règle d'alerte</DialogTitle>
                <DialogDescription>
                  Définissez les conditions de déclenchement
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom de la règle</Label>
                  <Input
                    placeholder="Ex: Chute de trafic"
                    value={newRule.name || ""}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Métrique</Label>
                    <Select
                      value={newRule.metric}
                      onValueChange={(value) => setNewRule(prev => ({ ...prev, metric: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {METRIC_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select
                      value={newRule.condition}
                      onValueChange={(value) => setNewRule(prev => ({ 
                        ...prev, 
                        condition: value as AlertRule['condition'] 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Supérieur à</SelectItem>
                        <SelectItem value="below">Inférieur à</SelectItem>
                        <SelectItem value="equals">Égal à</SelectItem>
                        <SelectItem value="change_percent">Variation (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Seuil</Label>
                    <Input
                      type="number"
                      value={newRule.threshold || 0}
                      onChange={(e) => setNewRule(prev => ({ 
                        ...prev, 
                        threshold: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sévérité</Label>
                    <Select
                      value={newRule.severity}
                      onValueChange={(value) => setNewRule(prev => ({ 
                        ...prev, 
                        severity: value as AlertRule['severity'] 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Avertissement</SelectItem>
                        <SelectItem value="critical">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddRule}>
                  Créer la règle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {localRules.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              rule.enabled ? 'bg-secondary/50' : 'bg-muted/30 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              {getSeverityIcon(rule.severity)}
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-sm text-muted-foreground">
                  {METRIC_OPTIONS.find(m => m.value === rule.metric)?.label} {" "}
                  {getConditionLabel(rule.condition)} {rule.threshold}
                  {rule.condition === 'change_percent' && '%'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={rule.severity === 'critical' ? 'destructive' : rule.severity === 'warning' ? 'secondary' : 'outline'}>
                {rule.severity}
              </Badge>
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => handleToggleRule(rule.id)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDeleteRule(rule.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {localRules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune règle d'alerte configurée</p>
          </div>
        )}
        
        {onSave && localRules.length > 0 && (
          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sauvegarder les règles
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
