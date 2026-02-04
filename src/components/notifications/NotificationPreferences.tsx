import { useState } from "react";
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
  description: string;
}

interface NotificationType {
  id: string;
  label: string;
  description: string;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export function NotificationPreferences() {
  const [saving, setSaving] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("daily");
  
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: "email", name: "Email", icon: Mail, enabled: true, description: "Notifications par email" },
    { id: "push", name: "Push", icon: Smartphone, enabled: false, description: "Notifications push navigateur" },
    { id: "inApp", name: "In-App", icon: Bell, enabled: true, description: "Notifications dans l'application" },
  ]);

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      id: "approvals",
      label: "Approbations en attente",
      description: "Quand une action IA nécessite votre validation",
      channels: { email: true, push: true, inApp: true },
    },
    {
      id: "runs_completed",
      label: "Exécutions terminées",
      description: "Quand un agent termine son travail",
      channels: { email: false, push: false, inApp: true },
    },
    {
      id: "errors",
      label: "Erreurs et alertes",
      description: "Problèmes détectés par les agents",
      channels: { email: true, push: true, inApp: true },
    },
    {
      id: "security",
      label: "Alertes sécurité",
      description: "Connexions suspectes, permissions modifiées",
      channels: { email: true, push: true, inApp: true },
    },
    {
      id: "quota",
      label: "Quotas et limites",
      description: "Quand vous approchez de vos limites",
      channels: { email: true, push: false, inApp: true },
    },
    {
      id: "reports",
      label: "Rapports générés",
      description: "Nouveaux rapports disponibles",
      channels: { email: true, push: false, inApp: true },
    },
  ]);

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const toggleNotificationType = (typeId: string, channel: keyof NotificationType["channels"]) => {
    setNotificationTypes(prev => prev.map(t => 
      t.id === typeId ? { 
        ...t, 
        channels: { ...t.channels, [channel]: !t.channels[channel] }
      } : t
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success("Préférences sauvegardées");
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
      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Canaux de notification</CardTitle>
          <CardDescription>
            Activez ou désactivez les canaux de communication
          </CardDescription>
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
                    <p className="text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
                <Switch 
                  checked={channel.enabled} 
                  onCheckedChange={() => toggleChannel(channel.id)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Types de notifications</CardTitle>
          <CardDescription>
            Configurez quelles notifications vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3 mb-3">
                {getTypeIcon(type.id)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
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

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif</CardTitle>
          <CardDescription>
            Recevez un résumé de l'activité par email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="digest-frequency">Fréquence du récapitulatif</Label>
            <Select value={digestFrequency} onValueChange={setDigestFrequency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Désactivé</SelectItem>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Sauvegarder les préférences
        </Button>
      </div>
    </div>
  );
}
