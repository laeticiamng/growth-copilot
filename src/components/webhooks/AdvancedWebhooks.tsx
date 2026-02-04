import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Webhook,
  Plus,
  Trash2,
  Play,
  Pause,
  Settings2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Zap,
  Code2,
  History,
  Loader2,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { useWebhooks, WEBHOOK_EVENTS, type WebhookLog } from "@/hooks/useWebhooks";
import { toast } from "sonner";

interface WebhookCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "exists" | "not_exists";
  value: string;
}

interface ConditionalWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  conditions: WebhookCondition[];
  transform: string; // JSONPath or template
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
}

const OPERATORS = [
  { value: "equals", label: "Égal à" },
  { value: "contains", label: "Contient" },
  { value: "greater_than", label: "Supérieur à" },
  { value: "less_than", label: "Inférieur à" },
  { value: "exists", label: "Existe" },
  { value: "not_exists", label: "N'existe pas" },
];

const SAMPLE_FIELDS = [
  "data.amount",
  "data.status",
  "data.lead.score",
  "data.deal.value",
  "data.agent.type",
  "metadata.source",
];

export function AdvancedWebhooks() {
  const { webhooks, loading, createWebhook, updateWebhook, deleteWebhook, testWebhook, getWebhookLogs } = useWebhooks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    url: "",
    events: [] as string[],
    conditions: [] as WebhookCondition[],
    transform: "",
    retryCount: 3,
  });

  const handleCreate = async () => {
    if (!form.name || !form.url || form.events.length === 0) {
      toast.error("Nom, URL et événements requis");
      return;
    }

    try {
      new URL(form.url);
    } catch {
      toast.error("URL invalide");
      return;
    }

    const result = await createWebhook({
      name: form.name,
      url: form.url,
      events: form.events,
      secret: null,
      is_active: true,
      headers: form.conditions.length > 0 ? { "X-Conditions": JSON.stringify(form.conditions) } : {},
      retry_count: form.retryCount,
    });

    if (result) {
      setShowCreateDialog(false);
      setForm({ name: "", url: "", events: [], conditions: [], transform: "", retryCount: 3 });
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    await testWebhook(id);
    setTesting(null);
  };

  const handleViewLogs = async (id: string) => {
    setSelectedWebhookId(id);
    setLoadingLogs(true);
    const webhookLogs = await getWebhookLogs(id);
    setLogs(webhookLogs);
    setLoadingLogs(false);
    setShowLogsDialog(true);
  };

  const addCondition = () => {
    setForm({
      ...form,
      conditions: [...form.conditions, { field: "", operator: "equals", value: "" }],
    });
  };

  const updateCondition = (index: number, updates: Partial<WebhookCondition>) => {
    const newConditions = [...form.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setForm({ ...form, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    setForm({
      ...form,
      conditions: form.conditions.filter((_, i) => i !== index),
    });
  };

  const toggleEvent = (event: string) => {
    if (form.events.includes(event)) {
      setForm({ ...form, events: form.events.filter(e => e !== event) });
    } else {
      setForm({ ...form, events: [...form.events, event] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Webhooks avancés
          </h2>
          <p className="text-sm text-muted-foreground">
            Configurez des webhooks conditionnels avec transformations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </CardContent>
          </Card>
        ) : webhooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium">Aucun webhook configuré</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez votre premier webhook pour recevoir des notifications
              </p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webhook.is_active ? 'bg-green-500/20' : 'bg-muted'}`}>
                      <Webhook className={`w-5 h-5 ${webhook.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{webhook.name}</h3>
                        <Badge variant={webhook.is_active ? "success" : "secondary"}>
                          {webhook.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        {webhook.last_status && (
                          <Badge variant={webhook.last_status >= 200 && webhook.last_status < 300 ? "outline" : "destructive"}>
                            {webhook.last_status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {webhook.url}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {webhook.events.slice(0, 3).map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {WEBHOOK_EVENTS.find(e => e.value === event)?.label || event}
                          </Badge>
                        ))}
                        {webhook.events.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.events.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testing === webhook.id}
                    >
                      {testing === webhook.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewLogs(webhook.id)}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={(checked) => updateWebhook(webhook.id, { is_active: checked })}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Webhook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Nouveau webhook conditionnel
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">Configuration</TabsTrigger>
              <TabsTrigger value="conditions" className="flex-1">Conditions</TabsTrigger>
              <TabsTrigger value="transform" className="flex-1">Transformation</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  placeholder="Mon webhook"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">URL *</label>
                <Input
                  placeholder="https://votre-service.com/webhook"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Événements *</label>
                <div className="grid grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map(event => (
                    <button
                      key={event.value}
                      type="button"
                      onClick={() => toggleEvent(event.value)}
                      className={`p-2 rounded-lg border text-left text-sm transition-colors ${
                        form.events.includes(event.value)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {form.events.includes(event.value) && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                        <span>{event.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tentatives (retry)</label>
                <Select 
                  value={String(form.retryCount)} 
                  onValueChange={(v) => setForm({ ...form, retryCount: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Pas de retry</SelectItem>
                    <SelectItem value="1">1 tentative</SelectItem>
                    <SelectItem value="3">3 tentatives</SelectItem>
                    <SelectItem value="5">5 tentatives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Conditions de déclenchement</p>
                  <p className="text-sm text-muted-foreground">
                    Le webhook ne sera envoyé que si toutes les conditions sont remplies
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              {form.conditions.length === 0 ? (
                <div className="p-8 text-center border rounded-lg border-dashed">
                  <Filter className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Aucune condition - le webhook sera toujours déclenché
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                      <Select
                        value={condition.field}
                        onValueChange={(v) => updateCondition(index, { field: v })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Champ" />
                        </SelectTrigger>
                        <SelectContent>
                          {SAMPLE_FIELDS.map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(v) => updateCondition(index, { operator: v as WebhookCondition["operator"] })}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATORS.map(op => (
                            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {!["exists", "not_exists"].includes(condition.operator) && (
                        <Input
                          placeholder="Valeur"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          className="flex-1"
                        />
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="transform" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Template de transformation (optionnel)</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Utilisez des expressions JSONPath ou un template Handlebars pour transformer le payload
                </p>
                <Textarea
                  placeholder={`{
  "event": "{{event_type}}",
  "data": {
    "id": "{{data.id}}",
    "value": "{{data.value}}"
  }
}`}
                  value={form.transform}
                  onChange={(e) => setForm({ ...form, transform: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Variables disponibles</p>
                    <code className="text-xs">{"{{event_type}}, {{data}}, {{metadata}}, {{timestamp}}"}</code>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate}>
              Créer le webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historique des appels
            </DialogTitle>
          </DialogHeader>

          {loadingLogs ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucun appel enregistré</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.response_status && log.response_status >= 200 && log.response_status < 300 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <Badge variant="outline">{log.event_type}</Badge>
                      <Badge variant={log.response_status && log.response_status < 300 ? "success" : "destructive"}>
                        {log.response_status || "Erreur"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {log.duration_ms}ms
                      <span>•</span>
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  {log.error_message && (
                    <p className="text-sm text-destructive">{log.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdvancedWebhooks;
