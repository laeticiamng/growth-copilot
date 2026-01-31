import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMedia } from "@/hooks/useMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Youtube, 
  Music, 
  Link2, 
  ExternalLink, 
  Play, 
  MoreVertical,
  Loader2,
  Trash2,
  Eye,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const platformIcons: Record<string, typeof Youtube> = {
  youtube_video: Youtube,
  youtube_channel: Youtube,
  spotify_track: Music,
  spotify_album: Music,
  spotify_artist: Music,
  apple_music: Music,
  soundcloud: Music,
  tiktok: Play,
  other: Link2,
};

const platformColors: Record<string, string> = {
  youtube_video: 'bg-red-500/10 text-red-500 border-red-500/20',
  youtube_channel: 'bg-red-500/10 text-red-500 border-red-500/20',
  spotify_track: 'bg-green-500/10 text-green-500 border-green-500/20',
  spotify_album: 'bg-green-500/10 text-green-500 border-green-500/20',
  spotify_artist: 'bg-green-500/10 text-green-500 border-green-500/20',
  apple_music: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  soundcloud: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  tiktok: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  other: 'bg-muted text-muted-foreground',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  planning: 'bg-blue-500/10 text-blue-500',
  pre_launch: 'bg-yellow-500/10 text-yellow-500',
  launching: 'bg-primary/10 text-primary',
  post_launch: 'bg-green-500/10 text-green-500',
  evergreen: 'bg-emerald-500/10 text-emerald-500',
  archived: 'bg-muted text-muted-foreground',
};

export default function MediaAssets() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { assets, loading, createAsset, deleteAsset, runAgent, setSelectedAsset } = useMedia();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());

  const handleAddAsset = async () => {
    if (!newUrl.trim()) return;
    
    setIsCreating(true);
    try {
      const asset = await createAsset(newUrl);
      if (asset) {
        setIsAddOpen(false);
        setNewUrl("");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleRunAgent = async (assetId: string, agentType: string) => {
    setRunningAgents(prev => new Set([...prev, `${assetId}-${agentType}`]));
    try {
      await runAgent(agentType, assetId);
    } finally {
      setRunningAgents(prev => {
        const next = new Set(prev);
        next.delete(`${assetId}-${agentType}`);
        return next;
      });
    }
  };

  const youtubeAssets = assets.filter(a => a.platform.startsWith('youtube_'));
  const spotifyAssets = assets.filter(a => a.platform.startsWith('spotify_'));
  const otherAssets = assets.filter(a => !a.platform.startsWith('youtube_') && !a.platform.startsWith('spotify_'));

  const labels = isEn ? {
    title: "Media Assets",
    subtitle: "Manage your videos, tracks, and media content",
    addMedia: "Add Media",
    addMediaTitle: "Add Media Asset",
    addMediaDesc: "Paste a YouTube or Spotify URL to auto-detect and import media details.",
    supportedPlatforms: "Supported platforms:",
    cancel: "Cancel",
    import: "Import Media",
    noAssets: "No media assets yet",
    noAssetsDesc: "Add your first YouTube video or Spotify track to start creating launch plans and optimizing your content.",
    addFirst: "Add Your First Media",
    all: "All",
    view: "View",
    viewDetails: "View Details",
    smartLink: "Smart Link",
    generateStrategy: "Generate Strategy",
    delete: "Delete",
    limitations: "Platform Limitations",
    limit1: "Virality not guaranteed - We provide optimization & strategy, not magic",
    limit2: "Spotify for Artists data not accessible via public API (private stats limited)",
    limit3: "YouTube API quotas (10,000 units/day) limit volume of actions",
    limit4: "Some social publishing requires pro account permissions",
  } : {
    title: "Media Assets",
    subtitle: "Gérez vos vidéos, pistes et contenus médias",
    addMedia: "Ajouter un média",
    addMediaTitle: "Ajouter un média",
    addMediaDesc: "Collez une URL YouTube ou Spotify pour détecter et importer automatiquement les détails.",
    supportedPlatforms: "Plateformes supportées :",
    cancel: "Annuler",
    import: "Importer le média",
    noAssets: "Aucun média pour l'instant",
    noAssetsDesc: "Ajoutez votre première vidéo YouTube ou piste Spotify pour commencer à créer des plans de lancement.",
    addFirst: "Ajouter votre premier média",
    all: "Tous",
    view: "Voir",
    viewDetails: "Voir les détails",
    smartLink: "Smart Link",
    generateStrategy: "Générer une stratégie",
    delete: "Supprimer",
    limitations: "Limitations des plateformes",
    limit1: "Viralité non garantie - Nous fournissons l'optimisation et la stratégie, pas de magie",
    limit2: "Données Spotify for Artists non accessibles via l'API publique (stats privées limitées)",
    limit3: "Quotas API YouTube (10 000 unités/jour) limitent le volume d'actions",
    limit4: "Certaines publications sociales nécessitent des permissions de compte pro",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{labels.title}</h1>
          <p className="text-muted-foreground">
            {labels.subtitle}
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              {labels.addMedia}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{labels.addMediaTitle}</DialogTitle>
              <DialogDescription>
                {labels.addMediaDesc}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Input
                placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/track/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAsset()}
              />
              
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">{labels.supportedPlatforms}</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>YouTube (videos & channels)</li>
                    <li>Spotify (tracks, albums, artists)</li>
                    <li>Apple Music, SoundCloud, TikTok (basic support)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                {labels.cancel}
              </Button>
              <Button onClick={handleAddAsset} disabled={!newUrl.trim() || isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {labels.import}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : assets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{labels.noAssets}</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              {labels.noAssetsDesc}
            </p>
            <Button variant="gradient" onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {labels.addFirst}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">{labels.all} ({assets.length})</TabsTrigger>
            <TabsTrigger value="youtube">YouTube ({youtubeAssets.length})</TabsTrigger>
            <TabsTrigger value="spotify">Spotify ({spotifyAssets.length})</TabsTrigger>
            {otherAssets.length > 0 && (
              <TabsTrigger value="other">Other ({otherAssets.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <AssetGrid 
              assets={assets} 
              onDelete={deleteAsset}
              onRunAgent={handleRunAgent}
              runningAgents={runningAgents}
              onSelect={setSelectedAsset}
              labels={labels}
            />
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <AssetGrid 
              assets={youtubeAssets} 
              onDelete={deleteAsset}
              onRunAgent={handleRunAgent}
              runningAgents={runningAgents}
              onSelect={setSelectedAsset}
              labels={labels}
            />
          </TabsContent>

          <TabsContent value="spotify" className="space-y-4">
            <AssetGrid 
              assets={spotifyAssets} 
              onDelete={deleteAsset}
              onRunAgent={handleRunAgent}
              runningAgents={runningAgents}
              onSelect={setSelectedAsset}
              labels={labels}
            />
          </TabsContent>

          {otherAssets.length > 0 && (
            <TabsContent value="other" className="space-y-4">
              <AssetGrid 
                assets={otherAssets} 
                onDelete={deleteAsset}
                onRunAgent={handleRunAgent}
                runningAgents={runningAgents}
                onSelect={setSelectedAsset}
                labels={labels}
              />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Limitations Notice */}
      <Card className="bg-muted/30 border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {labels.limitations}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>{labels.limit1.split(' - ')[0]}</strong> - {labels.limit1.split(' - ')[1]}</p>
          <p>• <strong>Spotify for Artists</strong> {isEn ? labels.limit2.split('data ')[1] : labels.limit2.split('Artists ')[1]}</p>
          <p>• <strong>YouTube API</strong> {isEn ? labels.limit3.split('quotas ')[1] : labels.limit3.split('API ')[1]}</p>
          <p>• {labels.limit4}</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface AssetGridProps {
  assets: Array<{
    id: string;
    platform: string;
    title: string | null;
    artist_name: string | null;
    thumbnail_url: string | null;
    status: string;
    url: string;
    smart_link_slug: string | null;
  }>;
  onDelete: (id: string) => void;
  onRunAgent: (assetId: string, agentType: string) => void;
  runningAgents: Set<string>;
  onSelect: (asset: any) => void;
  labels: Record<string, string>;
}

function AssetGrid({ assets, onDelete, onRunAgent, runningAgents, onSelect, labels }: AssetGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => {
        const Icon = platformIcons[asset.platform] || Link2;
        const platformColor = platformColors[asset.platform] || platformColors.other;
        const statusColor = statusColors[asset.status] || statusColors.draft;

        return (
          <Card key={asset.id} className="group overflow-hidden hover:border-primary/50 transition-colors">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted">
              {asset.thumbnail_url ? (
                <img 
                  src={asset.thumbnail_url} 
                  alt={asset.title || 'Media thumbnail'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="w-12 h-12 text-muted-foreground/50" />
                </div>
              )}
              
              {/* Platform badge */}
              <Badge 
                variant="outline" 
                className={`absolute top-2 left-2 ${platformColor}`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {asset.platform.replace('_', ' ')}
              </Badge>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                <Button size="sm" variant="secondary" asChild>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {labels.view}
                  </a>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelect(asset)}>
                      <Eye className="w-4 h-4 mr-2" />
                      {labels.viewDetails}
                    </DropdownMenuItem>
                    {asset.smart_link_slug && (
                      <DropdownMenuItem asChild>
                        <a href={`/link/${asset.smart_link_slug}`} target="_blank">
                          <Link2 className="w-4 h-4 mr-2" />
                          {labels.smartLink}
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onRunAgent(asset.id, 'media_strategy')}
                      disabled={runningAgents.has(`${asset.id}-media_strategy`)}
                    >
                      {runningAgents.has(`${asset.id}-media_strategy`) ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {labels.generateStrategy}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(asset.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {labels.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {asset.title || 'Untitled'}
                  </h3>
                  {asset.artist_name && (
                    <p className="text-sm text-muted-foreground truncate">
                      {asset.artist_name}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className={statusColor}>
                  {asset.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
