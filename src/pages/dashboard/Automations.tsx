import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Webhook, Zap, Plus, Play, Pause, Trash2, ExternalLink, Clock, CheckCircle, XCircle, Activity, Bot, Bell, Mail, ArrowRight,
} from "lucide-react";
import { useWebhooks, WEBHOOK_EVENTS, type Webhook as WebhookType } from "@/hooks/useWebhooks";
import { useAutomations, TRIGGER_TYPES, ACTION_TYPES, type AutomationRule } from "@/hooks/useAutomations";
import { formatDistanceToNow } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";

export default function Automations() {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("automationsPage.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("automationsPage.subtitle")}</p>
      </div>

      <Tabs defaultValue="automations" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="automations" className="gap-2">
            <Zap className="h-4 w-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations">
          <AutomationsTab />
        </TabsContent>
        <TabsContent value="webhooks">
          <WebhooksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AutomationsTab() {
  const { t, i18n } = useTranslation();
  const { rules, loading, createRule, updateRule, deleteRule, toggleRule } = useAutomations();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("automationsPage.automationRules")}</h2>
          <p className="text-sm text-muted-foreground">{t("automationsPage.automationRulesDesc")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />{t("automationsPage.newAutomation")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreateAutomationDialog onClose={() => setDialogOpen(false)} onCreate={createRule} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">{t("automationsPage.noAutomation")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("automationsPage.noAutomationDesc")}</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />{t("automationsPage.createAutomation")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <AutomationRuleCard key={rule.id} rule={rule} onToggle={(active) => toggleRule(rule.id, active)} onDelete={() => deleteRule(rule.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AutomationRuleCard({ rule, onToggle, onDelete }: { rule: AutomationRule; onToggle: (active: boolean) => void; onDelete: () => void; }) {
  const { t, i18n } = useTranslation();
  const triggerType = TRIGGER_TYPES.find((tt) => tt.value === rule.trigger_type);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{rule.name}</h3>
                <Badge variant={rule.is_active ? "default" : "secondary"}>
                  {rule.is_active ? t("automationsPage.active") : t("automationsPage.inactive")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {triggerType?.label} • {rule.actions.length} action(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-muted-foreground">
              <div>{rule.run_count} {t("automationsPage.executions")}</div>
              {rule.last_run_at && (
                <div>{t("automationsPage.last")} {formatDistanceToNow(new Date(rule.last_run_at), { addSuffix: true, locale: getDateLocale(i18n.language) })}</div>
              )}
            </div>
            <Switch checked={rule.is_active} onCheckedChange={onToggle} />
            <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateAutomationDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (rule: Omit<AutomationRule, "id" | "run_count" | "last_run_at" | "last_run_status" | "created_at">) => Promise<unknown>; }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<"event" | "schedule" | "condition">("event");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onCreate({ name, description: null, site_id: null, trigger_type: triggerType, trigger_config: {}, conditions: [], actions: selectedActions.map((type) => ({ type, config: {} })), is_active: true });
    setLoading(false);
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("automationsPage.newAutomationTitle")}</DialogTitle>
        <DialogDescription>{t("automationsPage.newAutomationDesc")}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("automationsPage.automationName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("automationsPage.automationNamePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label>{t("automationsPage.triggerType")}</Label>
          <Select value={triggerType} onValueChange={(v) => setTriggerType(v as typeof triggerType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRIGGER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div><div className="font-medium">{type.label}</div><div className="text-xs text-muted-foreground">{type.description}</div></div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("automationsPage.actionsToExecute")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {ACTION_TYPES.map((action) => (
              <div key={action.value} className="flex items-center space-x-2 rounded-lg border p-3">
                <Checkbox id={action.value} checked={selectedActions.includes(action.value)} onCheckedChange={(checked) => { if (checked) { setSelectedActions((prev) => [...prev, action.value]); } else { setSelectedActions((prev) => prev.filter((a) => a !== action.value)); } }} />
                <Label htmlFor={action.value} className="text-sm cursor-pointer">{action.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
          {loading ? t("automationsPage.creating") : t("automationsPage.createAutomationBtn")}
        </Button>
      </DialogFooter>
    </>
  );
}

function WebhooksTab() {
  const { t } = useTranslation();
  const { webhooks, loading, createWebhook, deleteWebhook, testWebhook, updateWebhook } = useWebhooks();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("automationsPage.outgoingWebhooks")}</h2>
          <p className="text-sm text-muted-foreground">{t("automationsPage.outgoingWebhooksDesc")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />{t("automationsPage.newWebhook")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreateWebhookDialog onClose={() => setDialogOpen(false)} onCreate={createWebhook} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Webhook className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">{t("automationsPage.noWebhook")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("automationsPage.noWebhookDesc")}</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />{t("automationsPage.createWebhook")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <WebhookCard key={webhook.id} webhook={webhook} onTest={() => testWebhook(webhook.id)} onToggle={(active) => updateWebhook(webhook.id, { is_active: active })} onDelete={() => deleteWebhook(webhook.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function WebhookCard({ webhook, onTest, onToggle, onDelete }: { webhook: WebhookType; onTest: () => void; onToggle: (active: boolean) => void; onDelete: () => void; }) {
  const [testing, setTesting] = useState(false);
  const handleTest = async () => { setTesting(true); await onTest(); setTesting(false); };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary"><Webhook className="h-5 w-5" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{webhook.name}</h3>
                {webhook.last_status && (
                  <Badge variant={webhook.last_status < 300 ? "default" : "destructive"}>
                    {webhook.last_status < 300 ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}{webhook.last_status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate max-w-md">{webhook.url}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {webhook.events.slice(0, 3).map((event) => (<Badge key={event} variant="outline" className="text-xs">{WEBHOOK_EVENTS.find((e) => e.value === event)?.label || event}</Badge>))}
                {webhook.events.length > 3 && <Badge variant="outline" className="text-xs">+{webhook.events.length - 3}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
              {testing ? <Activity className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />} Test
            </Button>
            <Switch checked={webhook.is_active} onCheckedChange={onToggle} />
            <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateWebhookDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (webhook: Parameters<ReturnType<typeof useWebhooks>["createWebhook"]>[0]) => Promise<unknown>; }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !url.trim() || selectedEvents.length === 0) return;
    setLoading(true);
    await onCreate({ name, url, secret: null, events: selectedEvents, is_active: true, headers: {}, retry_count: 3 });
    setLoading(false);
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("automationsPage.newWebhookTitle")}</DialogTitle>
        <DialogDescription>{t("automationsPage.newWebhookDesc")}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("automationsPage.webhookName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("automationsPage.webhookNamePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label>{t("automationsPage.webhookUrl")}</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.zapier.com/..." type="url" />
        </div>
        <div className="space-y-2">
          <Label>{t("automationsPage.eventsToSend")}</Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {WEBHOOK_EVENTS.map((event) => (
              <div key={event.value} className="flex items-center space-x-2 rounded-lg border p-2">
                <Checkbox id={event.value} checked={selectedEvents.includes(event.value)} onCheckedChange={(checked) => { if (checked) { setSelectedEvents((prev) => [...prev, event.value]); } else { setSelectedEvents((prev) => prev.filter((e) => e !== event.value)); } }} />
                <Label htmlFor={event.value} className="text-sm cursor-pointer">{event.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={handleSubmit} disabled={!name.trim() || !url.trim() || selectedEvents.length === 0 || loading}>
          {loading ? t("automationsPage.creatingWebhook") : t("automationsPage.createWebhookBtn")}
        </Button>
      </DialogFooter>
    </>
  );
}
