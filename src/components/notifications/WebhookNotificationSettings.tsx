import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, Trash2, TestTube, MessageSquare, Hash } from "lucide-react";

interface WebhookConfig {
  id?: string;
  channel: "slack" | "teams";
  webhook_url: string;
  is_active: boolean;
  notify_briefings: boolean;
  notify_approvals: boolean;
  notify_alerts: boolean;
}

const CHANNEL_META = {
  slack: {
    label: "Slack",
    icon: Hash,
    placeholder: "https://hooks.slack.com/services/T.../B.../xxx",
    color: "bg-[#4A154B]",
  },
  teams: {
    label: "Microsoft Teams",
    icon: MessageSquare,
    placeholder: "https://outlook.office.com/webhook/...",
    color: "bg-[#464EB8]",
  },
};

export default function WebhookNotificationSettings() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [testing, setTesting] = useState<string | null>(null);

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["notification-webhooks", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data, error } = await (supabase as any)
        .from("notification_webhooks")
        .select("*")
        .eq("workspace_id", currentWorkspace.id);
      if (error) throw error;
      return data as WebhookConfig[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const [localConfigs, setLocalConfigs] = useState<Record<string, WebhookConfig>>({});

  const getConfig = (channel: "slack" | "teams"): WebhookConfig => {
    if (localConfigs[channel]) return localConfigs[channel];
    const existing = webhooks.find((w) => w.channel === channel);
    return (
      existing || {
        channel,
        webhook_url: "",
        is_active: true,
        notify_briefings: true,
        notify_approvals: true,
        notify_alerts: true,
      }
    );
  };

  const updateLocal = (channel: "slack" | "teams", updates: Partial<WebhookConfig>) => {
    const current = getConfig(channel);
    setLocalConfigs((prev) => ({ ...prev, [channel]: { ...current, ...updates } }));
  };

  const saveMutation = useMutation({
    mutationFn: async (channel: "slack" | "teams") => {
      if (!currentWorkspace?.id) throw new Error("No workspace");
      const config = getConfig(channel);
      if (!config.webhook_url) throw new Error("URL requise");

      const payload = {
        workspace_id: currentWorkspace.id,
        channel: config.channel,
        webhook_url: config.webhook_url,
        is_active: config.is_active,
        notify_briefings: config.notify_briefings,
        notify_approvals: config.notify_approvals,
        notify_alerts: config.notify_alerts,
      };

      const existing = webhooks.find((w) => w.channel === channel);
      if (existing?.id) {
        const { error } = await (supabase as any)
          .from("notification_webhooks")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("notification_webhooks")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_, channel) => {
      queryClient.invalidateQueries({ queryKey: ["notification-webhooks"] });
      setLocalConfigs((prev) => {
        const next = { ...prev };
        delete next[channel];
        return next;
      });
      toast.success(`Configuration ${CHANNEL_META[channel].label} sauvegardée`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (channel: "slack" | "teams") => {
      const existing = webhooks.find((w) => w.channel === channel);
      if (!existing?.id) return;
      const { error } = await (supabase as any)
        .from("notification_webhooks")
        .delete()
        .eq("id", existing.id);
      if (error) throw error;
    },
    onSuccess: (_, channel) => {
      queryClient.invalidateQueries({ queryKey: ["notification-webhooks"] });
      setLocalConfigs((prev) => {
        const next = { ...prev };
        delete next[channel];
        return next;
      });
      toast.success(`Webhook ${CHANNEL_META[channel].label} supprimé`);
    },
  });

  const handleTest = async (channel: "slack" | "teams") => {
    if (!currentWorkspace?.id) return;
    setTesting(channel);
    try {
      const { error } = await supabase.functions.invoke("notify-webhooks", {
        body: {
          workspace_id: currentWorkspace.id,
          event_type: "alert",
          title: "🧪 Test de notification Growth OS",
          message: `Ce message confirme que votre intégration ${CHANNEL_META[channel].label} fonctionne correctement.`,
          severity: "info",
        },
      });
      if (error) throw error;
      toast.success(`Notification de test envoyée sur ${CHANNEL_META[channel].label}`);
    } catch (err: any) {
      toast.error(`Échec du test : ${err.message}`);
    } finally {
      setTesting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(["slack", "teams"] as const).map((channel) => {
        const meta = CHANNEL_META[channel];
        const config = getConfig(channel);
        const existing = webhooks.find((w) => w.channel === channel);
        const Icon = meta.icon;

        return (
          <Card key={channel}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${meta.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{meta.label}</CardTitle>
                    <CardDescription>
                      Recevez les notifications Growth OS dans {meta.label}
                    </CardDescription>
                  </div>
                </div>
                {existing && (
                  <Badge variant={config.is_active ? "default" : "secondary"}>
                    {config.is_active ? "Actif" : "Inactif"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL du Webhook (Incoming Webhook)</Label>
                <Input
                  value={config.webhook_url}
                  onChange={(e) => updateLocal(channel, { webhook_url: e.target.value })}
                  placeholder={meta.placeholder}
                  type="url"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Événements à notifier</p>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">📋 Briefings quotidiens</Label>
                  <Switch
                    checked={config.notify_briefings}
                    onCheckedChange={(v) => updateLocal(channel, { notify_briefings: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">⏳ Approbations en attente</Label>
                  <Switch
                    checked={config.notify_approvals}
                    onCheckedChange={(v) => updateLocal(channel, { notify_approvals: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">🚨 Alertes critiques agents</Label>
                  <Switch
                    checked={config.notify_alerts}
                    onCheckedChange={(v) => updateLocal(channel, { notify_alerts: v })}
                  />
                </div>
              </div>

              {existing && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Activer les notifications</Label>
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={(v) => updateLocal(channel, { is_active: v })}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => saveMutation.mutate(channel)}
                  disabled={saveMutation.isPending || !config.webhook_url}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
                {existing && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleTest(channel)}
                      disabled={testing === channel}
                    >
                      {testing === channel ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Tester
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate(channel)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
