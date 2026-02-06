import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Shield,
  Loader2
} from "lucide-react";

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ElementType;
  enabled: boolean;
  descriptionKey: string;
}

interface NotificationType {
  id: string;
  labelKey: string;
  descriptionKey: string;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export function NotificationPreferences() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("daily");
  
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: "email", name: "Email", icon: Mail, enabled: true, descriptionKey: "components.notifications.channelEmail" },
    { id: "push", name: "Push", icon: Smartphone, enabled: false, descriptionKey: "components.notifications.channelPush" },
    { id: "inApp", name: "In-App", icon: Bell, enabled: true, descriptionKey: "components.notifications.channelInApp" },
  ]);

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    { id: "approvals", labelKey: "components.notifications.typeApprovals", descriptionKey: "components.notifications.typeApprovalsDesc", channels: { email: true, push: true, inApp: true } },
    { id: "runs_completed", labelKey: "components.notifications.typeRuns", descriptionKey: "components.notifications.typeRunsDesc", channels: { email: false, push: false, inApp: true } },
    { id: "errors", labelKey: "components.notifications.typeErrors", descriptionKey: "components.notifications.typeErrorsDesc", channels: { email: true, push: true, inApp: true } },
    { id: "security", labelKey: "components.notifications.typeSecurity", descriptionKey: "components.notifications.typeSecurityDesc", channels: { email: true, push: true, inApp: true } },
    { id: "quota", labelKey: "components.notifications.typeQuota", descriptionKey: "components.notifications.typeQuotaDesc", channels: { email: true, push: false, inApp: true } },
    { id: "reports", labelKey: "components.notifications.typeReports", descriptionKey: "components.notifications.typeReportsDesc", channels: { email: true, push: false, inApp: true } },
  ]);

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const toggleNotificationType = (typeId: string, channel: keyof NotificationType["channels"]) => {
    setNotificationTypes(prev => prev.map(nt => 
      nt.id === typeId ? { 
        ...nt, 
        channels: { ...nt.channels, [channel]: !nt.channels[channel] }
      } : nt
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success(t("components.notifications.saved"));
  };

  const getTypeIcon = (typeId: string) => {
    switch (typeId) {
      case "approvals": return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "runs_completed": return <Bot className="w-4 h-4 text-primary" />;
      case "errors": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "security": return <Shield className="w-4 h-4 text-primary" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("components.notifications.channelsTitle")}</CardTitle>
          <CardDescription>{t("components.notifications.channelsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{channel.name}</p>
                    <p className="text-xs text-muted-foreground">{t(channel.descriptionKey)}</p>
                  </div>
                </div>
                <Switch checked={channel.enabled} onCheckedChange={() => toggleChannel(channel.id)} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("components.notifications.typesTitle")}</CardTitle>
          <CardDescription>{t("components.notifications.typesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3 mb-3">
                {getTypeIcon(type.id)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{t(type.labelKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(type.descriptionKey)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-7">
                {channels.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={type.channels[channel.id as keyof typeof type.channels]}
                      onCheckedChange={() => toggleNotificationType(type.id, channel.id as keyof typeof type.channels)}
                      disabled={!channel.enabled}
                      className="scale-75"
                    />
                    <span className="text-xs text-muted-foreground">{channel.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("components.notifications.digestTitle")}</CardTitle>
          <CardDescription>{t("components.notifications.digestDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="digest-frequency">{t("components.notifications.digestFrequency")}</Label>
            <Select value={digestFrequency} onValueChange={setDigestFrequency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("components.notifications.freqNone")}</SelectItem>
                <SelectItem value="daily">{t("components.notifications.freqDaily")}</SelectItem>
                <SelectItem value="weekly">{t("components.notifications.freqWeekly")}</SelectItem>
                <SelectItem value="monthly">{t("components.notifications.freqMonthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t("components.notifications.savePreferences")}
        </Button>
      </div>
    </div>
  );
}
