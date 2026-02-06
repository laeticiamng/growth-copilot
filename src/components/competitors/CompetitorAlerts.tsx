import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trash2,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";

interface CompetitorAlert {
  id: string;
  competitorName: string;
  type: "ranking" | "content" | "backlinks" | "social" | "price";
  condition: "increase" | "decrease" | "change";
  threshold: number;
  enabled: boolean;
  lastTriggered?: Date;
}

const getAlertTypeLabels = (t: (key: string) => string) => ({
  ranking: t("competitorAlerts.ranking"),
  content: t("competitorAlerts.content"),
  backlinks: t("competitorAlerts.backlinks"),
  social: t("competitorAlerts.social"),
  price: t("competitorAlerts.price"),
});

const alertTypeIcons = {
  ranking: Target,
  content: TrendingUp,
  backlinks: TrendingUp,
  social: TrendingUp,
  price: TrendingDown,
};

interface CompetitorAlertsProps {
  competitors: Array<{ id: string; name: string; domain: string }>;
  onSaveAlert?: (alert: Omit<CompetitorAlert, "id">) => Promise<void>;
}

export function CompetitorAlerts({ competitors, onSaveAlert }: CompetitorAlertsProps) {
  const { t, i18n } = useTranslation();
  const alertTypeLabels = getAlertTypeLabels(t);
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    competitorName: "",
    type: "ranking" as CompetitorAlert["type"],
    condition: "change" as CompetitorAlert["condition"],
    threshold: 5,
  });

  const handleAddAlert = async () => {
    if (!newAlert.competitorName) {
      toast.error(t("competitorAlerts.selectCompetitor"));
      return;
    }

    const alert: CompetitorAlert = {
      id: crypto.randomUUID(),
      ...newAlert,
      enabled: true,
    };

    if (onSaveAlert) {
      await onSaveAlert({ ...newAlert, enabled: true });
    }

    setAlerts(prev => [...prev, alert]);
    setShowAddDialog(false);
    setNewAlert({
      competitorName: "",
      type: "ranking",
      condition: "change",
      threshold: 5,
    });
    toast.success(t("competitorAlerts.alertCreated"));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success(t("competitorAlerts.alertDeleted"));
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t("competitorAlerts.title")}
            </CardTitle>
            <CardDescription>
              {t("competitorAlerts.subtitle")}
            </CardDescription>
          </div>
          <Button variant="hero" size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("competitorAlerts.newAlert")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">{t("competitorAlerts.noAlerts")}</p>
            <p className="text-sm mt-1">{t("competitorAlerts.noAlertsDesc")}</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("competitorAlerts.createAlert")}
            </Button>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = alertTypeIcons[alert.type];
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg bg-secondary/50 ${!alert.enabled ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{alert.competitorName}</p>
                        <Badge variant="outline" className="text-xs">
                          {alertTypeLabels[alert.type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.condition === "increase" ? t("competitorAlerts.increase") :
                         alert.condition === "decrease" ? t("competitorAlerts.decrease") : t("competitorAlerts.change")} 
                        {" > "}{alert.threshold}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alert.enabled}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                {alert.lastTriggered && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("competitorAlerts.lastAlert")}: {alert.lastTriggered.toLocaleDateString(getIntlLocale(i18n.language))}
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>

      {/* Add Alert Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("competitorAlerts.newAlertTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("competitorAlerts.competitor")}</Label>
              <Select
                value={newAlert.competitorName}
                onValueChange={(value) => setNewAlert(prev => ({ ...prev, competitorName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("competitorAlerts.selectCompetitor")} />
                </SelectTrigger>
                <SelectContent>
                  {competitors.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("competitorAlerts.alertType")}</Label>
              <Select
                value={newAlert.type}
                onValueChange={(value) => setNewAlert(prev => ({ ...prev, type: value as CompetitorAlert["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(alertTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("competitorAlerts.condition")}</Label>
              <Select
                value={newAlert.condition}
                onValueChange={(value) => setNewAlert(prev => ({ ...prev, condition: value as CompetitorAlert["condition"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">{t("competitorAlerts.increase")}</SelectItem>
                  <SelectItem value="decrease">{t("competitorAlerts.decrease")}</SelectItem>
                  <SelectItem value="change">{t("competitorAlerts.anyChange")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("competitorAlerts.threshold")} (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newAlert.threshold}
                onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: parseInt(e.target.value) || 5 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="hero" onClick={handleAddAlert}>
              <Plus className="w-4 h-4 mr-2" />
              {t("competitorAlerts.createAlert")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
