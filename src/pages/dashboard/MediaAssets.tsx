import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMedia } from "@/hooks/useMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, ExternalLink, Music, Video, Trash2, Eye, Link2, Wand2, AlertTriangle,
  Youtube, Music2
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";

const MediaAssets = () => {
  const { t } = useTranslation();
  const { assets, loading, createAsset, deleteAsset } = useMedia();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleImport = async () => {
    if (!url.trim()) return;
    try {
      await createAsset(url);
      toast.success(t("pages.mediaAssets.import"));
      setUrl("");
      setDialogOpen(false);
    } catch {
      toast.error("Erreur lors de l'import");
    }
  };

  const filteredAssets = assets?.filter((a) => {
    if (activeTab === "all") return true;
    return a.platform === activeTab;
  }) || [];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube": return <Youtube className="h-5 w-5 text-red-500" />;
      case "spotify": return <Music2 className="h-5 w-5 text-green-500" />;
      default: return <Music className="h-5 w-5" />;
    }
  };

  return (
    <>
      <SEOHead
        title={t("pages.mediaAssets.title")}
        description={t("pages.mediaAssets.subtitle")}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("pages.mediaAssets.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("pages.mediaAssets.subtitle")}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{t("pages.mediaAssets.addMedia")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("pages.mediaAssets.addMediaTitle")}</DialogTitle>
                <DialogDescription>{t("pages.mediaAssets.addMediaDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/track/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("pages.mediaAssets.supportedPlatforms")} YouTube, Spotify
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("pages.mediaAssets.cancel")}</Button>
                <Button onClick={handleImport} disabled={!url.trim()}>{t("pages.mediaAssets.import")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {filteredAssets.length === 0 && !loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{t("pages.mediaAssets.noAssets")}</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">{t("pages.mediaAssets.noAssetsDesc")}</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />{t("pages.mediaAssets.addFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">{t("pages.mediaAssets.all")}</TabsTrigger>
                <TabsTrigger value="youtube">YouTube</TabsTrigger>
                <TabsTrigger value="spotify">Spotify</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(asset.platform)}
                        <Badge variant="outline">{asset.platform}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-base line-clamp-2">{asset.title}</CardTitle>
                    {asset.artist_name && (
                      <CardDescription>{asset.artist_name}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {asset.url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={asset.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />{t("pages.mediaAssets.view")}
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />{t("pages.mediaAssets.viewDetails")}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Link2 className="h-3 w-3 mr-1" />{t("pages.mediaAssets.smartLink")}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Wand2 className="h-3 w-3 mr-1" />{t("pages.mediaAssets.generateStrategy")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAsset(asset.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />{t("pages.mediaAssets.delete")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              {t("pages.mediaAssets.limitations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>{t("pages.mediaAssets.limit1")}</li>
              <li>{t("pages.mediaAssets.limit2")}</li>
              <li>{t("pages.mediaAssets.limit3")}</li>
              <li>{t("pages.mediaAssets.limit4")}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MediaAssets;
