import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAutopilotSettings } from "@/hooks/useAutopilotSettings";
import { 
  Zap, 
  Shield, 
  AlertTriangle, 
  Bot, 
  Settings,
  Loader2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AutopilotConfigPanelProps {
  siteId?: string;
}

export function AutopilotConfigPanel({ siteId }: AutopilotConfigPanelProps) {
  const {
    settings,
    loading,
    isUpdating,
    toggleEnabled,
    updateAllowedActions,
    updateRiskThreshold,
    updateLimits,
    availableActions,
  } = useAutopilotSettings(siteId);

  const [localMaxActions, setLocalMaxActions] = useState(settings.max_actions_per_week);
  const [localBudget, setLocalBudget] = useState(settings.max_daily_budget);

  const handleActionToggle = (actionId: string, checked: boolean) => {
    const newActions = checked
      ? [...settings.allowed_actions, actionId]
      : settings.allowed_actions.filter(a => a !== actionId);
    updateAllowedActions(newActions);
  };

  const handleSaveLimits = () => {
    updateLimits({
      max_actions_per_week: localMaxActions,
      max_daily_budget: localBudget,
    });
  };

  const actionsByCategory = availableActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, typeof availableActions>);

  const categoryLabels: Record<string, string> = {
    seo: 'SEO',
    content: 'Contenu',
    ads: 'Publicité',
    social: 'Social',
    lifecycle: 'Automation',
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Switch */}
      <Card className={cn(
        "border-2 transition-colors",
        settings.enabled ? "border-primary/50 bg-primary/5" : "border-border"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                settings.enabled ? "bg-primary/20" : "bg-muted"
              )}>
                <Zap className={cn(
                  "w-6 h-6",
                  settings.enabled ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mode Autopilot</h3>
                <p className="text-sm text-muted-foreground">
                  {settings.enabled 
                    ? "Les agents peuvent exécuter des actions automatiquement"
                    : "Toutes les actions nécessitent une approbation manuelle"
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={toggleEnabled}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {settings.enabled && (
        <>
          {/* Warning Alert */}
          <Alert variant="default" className="border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Mode automatique activé</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Les agents peuvent effectuer des modifications sans approbation préalable selon les paramètres ci-dessous.
            </AlertDescription>
          </Alert>

          {/* Risk Threshold */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Seuil d'approbation
              </CardTitle>
              <CardDescription>
                Définissez à partir de quel niveau de risque une approbation est requise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.require_approval_above_risk}
                onValueChange={(value) => updateRiskThreshold(value as 'low' | 'medium' | 'high')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-secondary/30 transition-colors">
                  <RadioGroupItem value="low" id="risk-low" />
                  <Label htmlFor="risk-low" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Conservateur</p>
                        <p className="text-sm text-muted-foreground">Approbation requise pour tout risque moyen ou élevé</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">Recommandé</Badge>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-secondary/30 transition-colors">
                  <RadioGroupItem value="medium" id="risk-medium" />
                  <Label htmlFor="risk-medium" className="flex-1 cursor-pointer">
                    <p className="font-medium">Équilibré</p>
                    <p className="text-sm text-muted-foreground">Approbation requise uniquement pour les risques élevés</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-secondary/30 transition-colors">
                  <RadioGroupItem value="high" id="risk-high" />
                  <Label htmlFor="risk-high" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Agressif</p>
                        <p className="text-sm text-muted-foreground">Toutes les actions sont exécutées automatiquement</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">Risqué</Badge>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Allowed Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Actions autorisées
              </CardTitle>
              <CardDescription>
                Sélectionnez les types d'actions que les agents peuvent exécuter automatiquement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(actionsByCategory).map(([category, actions]) => (
                <div key={category}>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {categoryLabels[category] || category}
                  </p>
                  <div className="grid gap-2">
                    {actions.map(action => (
                      <div key={action.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Checkbox
                          id={action.id}
                          checked={settings.allowed_actions.includes(action.id)}
                          onCheckedChange={(checked) => handleActionToggle(action.id, !!checked)}
                        />
                        <Label htmlFor={action.id} className="cursor-pointer flex-1">
                          {action.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Limites de sécurité
              </CardTitle>
              <CardDescription>
                Définissez des garde-fous pour limiter les actions automatiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Actions max par semaine</Label>
                  <Badge variant="outline">{localMaxActions}</Badge>
                </div>
                <Slider
                  value={[localMaxActions]}
                  onValueChange={([v]) => setLocalMaxActions(v)}
                  min={5}
                  max={100}
                  step={5}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Budget journalier max (€)</Label>
                  <Badge variant="outline">{localBudget}€</Badge>
                </div>
                <Slider
                  value={[localBudget]}
                  onValueChange={([v]) => setLocalBudget(v)}
                  min={10}
                  max={500}
                  step={10}
                />
              </div>

              <Button 
                onClick={handleSaveLimits} 
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder les limites
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
