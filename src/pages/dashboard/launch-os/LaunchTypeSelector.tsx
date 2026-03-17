import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLaunchOS } from "@/hooks/useLaunchOS";
import { LaunchTypeEngine } from "@/lib/launch-os/launch-type-engine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music, Globe, ArrowRight, Link2, Loader2,
  Disc, Library, Video, Repeat, Cloud, Smartphone, Layout, Package, Award
} from "lucide-react";
import type { LaunchType, LaunchTypeConfig } from "@/lib/launch-os/types";

const iconMap: Record<string, typeof Music> = {
  music: Music, disc: Disc, library: Library, video: Video, repeat: Repeat,
  globe: Globe, cloud: Cloud, smartphone: Smartphone, layout: Layout, package: Package, award: Award,
};

export default function LaunchTypeSelector() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { createProject, setCurrentProject } = useLaunchOS();
  const [selectedType, setSelectedType] = useState<LaunchType | null>(null);
  const [projectName, setProjectName] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const musicTypes = LaunchTypeEngine.getTypesByCategory('music');
  const platformTypes = LaunchTypeEngine.getTypesByCategory('platform');

  const handleCreate = async () => {
    if (!selectedType || !projectName.trim()) return;
    setCreating(true);

    const project = await createProject(projectName.trim(), selectedType, inputUrl.trim() || undefined);
    if (project) {
      setCurrentProject(project);
      navigate('/dashboard/launch-os/project');
    }
    setCreating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("launchOS.newLaunch", "Nouveau lancement")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("launchOS.chooseType", "Choisissez votre type de lancement pour charger le bon playbook")}
        </p>
      </div>

      {/* Step 1: URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            {t("launchOS.pasteLink", "Collez votre lien (optionnel)")}
          </CardTitle>
          <CardDescription>
            {t("launchOS.pasteLinkDesc", "Un lien musical, URL de site, lien app store ou landing page")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="https://open.spotify.com/track/... or https://yoursite.com ..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="text-base"
          />
        </CardContent>
      </Card>

      {/* Step 2: Type Selection */}
      <Tabs defaultValue="music">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="music" className="gap-2">
            <Music className="w-4 h-4" />
            {t("launchOS.music", "Musique")}
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2">
            <Globe className="w-4 h-4" />
            {t("launchOS.platform", "Plateforme / Produit")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {musicTypes.map(config => (
              <TypeCard
                key={config.type}
                config={config}
                selected={selectedType === config.type}
                onClick={() => setSelectedType(config.type)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformTypes.map(config => (
              <TypeCard
                key={config.type}
                config={config}
                selected={selectedType === config.type}
                onClick={() => setSelectedType(config.type)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Step 3: Name & Create */}
      {selectedType && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">{t("launchOS.nameYourLaunch", "Nommez votre lancement")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t("launchOS.namePlaceholder", "ex. Sortie single été, Lancement SaaS Beta...")}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-base"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Type: <Badge variant="outline">{selectedType.replace(/_/g, ' ')}</Badge>
              </div>
              <Button
                onClick={handleCreate}
                disabled={!projectName.trim() || creating}
                size="lg"
                className="gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("launchOS.creating", "Création...")}
                  </>
                ) : (
                  <>
                    {t("launchOS.createLaunch", "Créer le lancement")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TypeCard({ config, selected, onClick }: { config: LaunchTypeConfig; selected: boolean; onClick: () => void }) {
  const Icon = iconMap[config.icon] || Globe;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-sm ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${selected ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon className={`w-5 h-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <CardTitle className="text-sm">{config.label}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{config.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {config.defaultChannels.slice(0, 4).map(ch => (
            <Badge key={ch} variant="secondary" className="text-[10px]">
              {ch.replace(/_/g, ' ')}
            </Badge>
          ))}
          {config.defaultChannels.length > 4 && (
            <Badge variant="secondary" className="text-[10px]">+{config.defaultChannels.length - 4}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
