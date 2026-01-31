import { useState } from 'react';
import { useCreatives } from '@/hooks/useCreatives';
import { useSites } from '@/hooks/useSites';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Video, 
  Wand2, 
  Play, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  FileText,
  ExternalLink,
  Copy,
  Send
} from 'lucide-react';

const TemplateAdsFactory = () => {
  const { jobs, loading, createJob, renderJob, runQA, exportJob, getJobAssets } = useCreatives();
  const { currentSite } = useSites();
  const [isCreating, setIsCreating] = useState(false);
  const [exportData, setExportData] = useState<Record<string, unknown> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    site_url: '',
    offer: '',
    objective: 'lead' as 'lead' | 'sale' | 'booking' | 'awareness',
    language: 'fr',
    geo: 'France',
    style: 'minimal_premium',
    duration_seconds: 15
  });

  const handleCreateJob = async () => {
    setIsCreating(true);
    await createJob({
      ...formData,
      site_url: formData.site_url || ''
    });
    setIsCreating(false);
  };

  const handleRender = async (jobId: string) => {
    await renderJob(jobId);
  };

  const handleQA = async (jobId: string) => {
    await runQA(jobId);
  };

  const handleExport = async (jobId: string) => {
    const result = await exportJob(jobId);
    if (result.success && result.export) {
      setExportData(result.export as unknown as Record<string, unknown>);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      queued: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      running: { variant: 'default', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
      done: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
      failed: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      needs_manual_review: { variant: 'outline', icon: <AlertCircle className="h-3 w-3" /> }
    };
    const config = variants[status] || variants.queued;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Video className="h-8 w-8" />
            Template Ads Factory
          </h1>
          <p className="text-muted-foreground">
            Générez des packs publicitaires vidéo complets avec IA (9:16 / 1:1 / 16:9)
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Wand2 className="h-4 w-4" />
              Générer un Ad Pack
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau Pack Publicitaire Vidéo</DialogTitle>
              <DialogDescription>
                L'IA va générer 3 formats vidéo, des sous-titres SRT, thumbnails et copy pack complet
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="site_url">URL du site</Label>
                <Input
                  id="site_url"
                  placeholder="https://example.com"
                  value={formData.site_url}
                  onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="offer">Offre / Promo *</Label>
                <Textarea
                  id="offer"
                  placeholder="Décrivez votre offre en quelques mots..."
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Objectif</Label>
                  <Select
                    value={formData.objective}
                    onValueChange={(value) => setFormData({ ...formData, objective: value as typeof formData.objective })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead Generation</SelectItem>
                      <SelectItem value="sale">Vente</SelectItem>
                      <SelectItem value="booking">Réservation</SelectItem>
                      <SelectItem value="awareness">Notoriété</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Durée</Label>
                  <Select
                    value={String(formData.duration_seconds)}
                    onValueChange={(value) => setFormData({ ...formData, duration_seconds: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 secondes</SelectItem>
                      <SelectItem value="30">30 secondes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Langue</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="geo">Géo</Label>
                  <Input
                    id="geo"
                    placeholder="France"
                    value={formData.geo}
                    onChange={(e) => setFormData({ ...formData, geo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => setFormData({ ...formData, style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal_premium">Minimal Premium</SelectItem>
                    <SelectItem value="bold_dynamic">Bold & Dynamic</SelectItem>
                    <SelectItem value="soft_organic">Soft & Organic</SelectItem>
                    <SelectItem value="corporate_clean">Corporate Clean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCreateJob}
                disabled={isCreating || !formData.offer}
                className="gap-2"
              >
                {isCreating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {isCreating ? 'Génération...' : 'Générer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous ({jobs.length})</TabsTrigger>
          <TabsTrigger value="running">En cours</TabsTrigger>
          <TabsTrigger value="done">Terminés</TabsTrigger>
          <TabsTrigger value="review">À revoir</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun Ad Pack</h3>
                <p className="text-muted-foreground text-center max-w-sm mt-2">
                  Commencez par générer votre premier pack publicitaire vidéo avec l'IA
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const inputJson = job.input_json as Record<string, unknown>;
                const outputJson = job.output_json as Record<string, unknown>;
                const jobAssets = getJobAssets(job.id);
                const videoAssets = jobAssets.filter(a => a.asset_type.startsWith('video_'));
                const copyAsset = jobAssets.find(a => a.asset_type === 'copy_pack');
                const copyPack = copyAsset?.meta_json as Record<string, unknown>;

                return (
                  <Card key={job.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {(inputJson?.offer as string) || 'Ad Pack'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(job.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      {/* Meta info */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">{job.objective}</Badge>
                        <Badge variant="outline">{job.duration_seconds}s</Badge>
                        <Badge variant="outline">{job.language.toUpperCase()}</Badge>
                      </div>

                      {/* Preview hooks */}
                      {copyPack?.hooks && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Hook:</p>
                          <p className="text-sm line-clamp-2">
                            {((copyPack.hooks as string[]) || []).slice(0, 1).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Assets count */}
                      {jobAssets.length > 0 && (
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {videoAssets.length} vidéos
                          </span>
                          {copyPack && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Copy pack
                            </span>
                          )}
                        </div>
                      )}

                      {/* QA info */}
                      {outputJson?.qa_score !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${outputJson.qa_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{outputJson.qa_score as number}%</span>
                        </div>
                      )}

                      {/* Error message */}
                      {job.error_message && (
                        <p className="text-xs text-destructive line-clamp-2">
                          {job.error_message}
                        </p>
                      )}
                    </CardContent>

                    <Separator />

                    {/* Actions */}
                    <div className="p-3 flex gap-2">
                      {job.status === 'queued' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleQA(job.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            QA
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRender(job.id)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Render
                          </Button>
                        </>
                      )}
                      {job.status === 'done' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleExport(job.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Send className="h-3 w-3 mr-1" />
                            Approval
                          </Button>
                        </>
                      )}
                      {job.status === 'running' && (
                        <Button size="sm" disabled className="flex-1">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          En cours...
                        </Button>
                      )}
                      {(job.status === 'failed' || job.status === 'needs_manual_review') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleQA(job.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="running">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.filter(j => j.status === 'running').length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucun job en cours
                </CardContent>
              </Card>
            ) : (
              jobs.filter(j => j.status === 'running').map(job => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {(job.input_json as Record<string, unknown>)?.offer as string || 'Processing...'}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="done">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.filter(j => j.status === 'done').length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucun job terminé
                </CardContent>
              </Card>
            ) : (
              jobs.filter(j => j.status === 'done').map(job => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {(job.input_json as Record<string, unknown>)?.offer as string || 'Completed'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" onClick={() => handleExport(job.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="review">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.filter(j => j.status === 'needs_manual_review').length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucun job en attente de review
                </CardContent>
              </Card>
            ) : (
              jobs.filter(j => j.status === 'needs_manual_review').map(job => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      {(job.input_json as Record<string, unknown>)?.offer as string || 'Needs Review'}
                    </CardTitle>
                    <CardDescription>
                      {job.error_message || 'QA a échoué après 2 itérations. Review manuelle requise.'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      {exportData && (
        <Dialog open={!!exportData} onOpenChange={() => setExportData(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Export Ad Pack</DialogTitle>
              <DialogDescription>
                Téléchargez vos assets et copiez les textes publicitaires
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Videos */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vidéos ({(exportData.videos as Array<Record<string, unknown>>)?.length || 0})
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(exportData.videos as Array<{ aspect_ratio: string; url: string; filename: string }>)?.map((video, i) => (
                      <Card key={i} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{video.aspect_ratio}</Badge>
                          {video.url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={video.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{video.filename}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Copy Pack */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Copy Pack
                  </h3>
                  <div className="space-y-4">
                    {/* Hooks */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Hooks</Label>
                      {(exportData.copy_pack as Record<string, unknown>)?.hooks && 
                        ((exportData.copy_pack as Record<string, unknown>).hooks as string[]).map((hook, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1">
                          <Input value={hook} readOnly className="text-sm" />
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(hook)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {/* Headlines */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Headlines</Label>
                      {(exportData.copy_pack as Record<string, unknown>)?.headlines && 
                        ((exportData.copy_pack as Record<string, unknown>).headlines as string[]).map((h, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1">
                          <Input value={h} readOnly className="text-sm" />
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(h)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {/* CTAs */}
                    <div>
                      <Label className="text-xs text-muted-foreground">CTAs</Label>
                      {(exportData.copy_pack as Record<string, unknown>)?.ctas && 
                        ((exportData.copy_pack as Record<string, unknown>).ctas as string[]).map((cta, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1">
                          <Input value={cta} readOnly className="text-sm" />
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(cta)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* UTM Links */}
                {exportData.utm_links && Object.keys(exportData.utm_links as Record<string, string>).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      UTM Links
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(exportData.utm_links as Record<string, string>).map(([platform, url]) => (
                        <div key={platform} className="flex items-center gap-2">
                          <Badge variant="outline" className="min-w-[100px]">{platform}</Badge>
                          <Input value={url} readOnly className="text-xs flex-1" />
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(url)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Launch Checklist */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Checklist de lancement
                  </h3>
                  <div className="space-y-2">
                    {(exportData.launch_checklist as Array<{ platform: string; format: string; specs: string; ready: boolean }>)?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        {item.ready ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="font-medium min-w-[120px]">{item.platform}</span>
                        <Badge variant="outline">{item.format}</Badge>
                        <span className="text-muted-foreground text-xs">{item.specs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TemplateAdsFactory;
