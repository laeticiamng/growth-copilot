import { useState, useEffect } from "react";
import { useMedia } from "@/hooks/useMedia";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Copy, 
  Download, 
  Instagram, 
  Youtube, 
  Music2, 
  MessageSquare,
  FileText,
  Loader2,
  CheckCircle2,
  Twitter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Creative {
  id: string;
  format: string;
  name: string | null;
  copy_json: Record<string, unknown>;
  platform_target: string | null;
  status: string;
  created_at: string;
}

const formatIcons: Record<string, typeof FileText> = {
  hook: MessageSquare,
  caption: Instagram,
  script: Youtube,
  bio: FileText,
  pitch: Music2,
  tweet: Twitter,
};

const formatLabels: Record<string, string> = {
  hook: 'Hooks',
  caption: 'Captions',
  script: 'Scripts',
  bio: 'Bios',
  pitch: 'Pitches',
  tweet: 'Tweets',
};

export default function CreativesStudio() {
  const { assets, selectedAsset, setSelectedAsset, runAgent } = useMedia();
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch creatives for selected asset
  useEffect(() => {
    if (!selectedAsset || !currentWorkspace) {
      setCreatives([]);
      return;
    }

    const fetchCreatives = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_creatives')
        .select('*')
        .eq('media_asset_id', selectedAsset.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCreatives(data as Creative[]);
      }
      setLoading(false);
    };

    fetchCreatives();
  }, [selectedAsset, currentWorkspace]);

  const handleGenerate = async (type: 'hooks' | 'captions' | 'scripts' | 'kit') => {
    if (!selectedAsset || !currentWorkspace) return;

    const agentMap = {
      hooks: 'shortform_repurposer',
      captions: 'streaming_packager',
      scripts: 'shortform_repurposer',
      kit: 'streaming_packager',
    };

    setGenerating(type);
    try {
      const result = await runAgent(agentMap[type], selectedAsset.id, { type });
      const output = (result as any).result;

      // Save creatives to database
      const creativesToSave: Array<{
        media_asset_id: string;
        workspace_id: string;
        format: string;
        name: string;
        copy_json: object;
        status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
      }> = [];

      if (type === 'hooks' && output?.shortform_ideas) {
        output.shortform_ideas.forEach((idea: any, idx: number) => {
          creativesToSave.push({
            media_asset_id: selectedAsset.id,
            workspace_id: currentWorkspace.id,
            format: 'hook',
            name: `Hook ${idx + 1}`,
            copy_json: idea,
            status: 'draft',
          });
        });
      } else if (type === 'captions' && output?.social_captions) {
        Object.entries(output.social_captions).forEach(([platform, captions]: [string, any]) => {
          (Array.isArray(captions) ? captions : [captions]).forEach((caption: string, idx: number) => {
            creativesToSave.push({
              media_asset_id: selectedAsset.id,
              workspace_id: currentWorkspace.id,
              format: 'caption',
              name: `${platform} Caption ${idx + 1}`,
              copy_json: { text: caption, platform },
              status: 'draft',
            });
          });
        });
      } else if (type === 'kit') {
        // Save bio variations
        if (output?.bio) {
          Object.entries(output.bio).forEach(([length, text]: [string, any]) => {
            creativesToSave.push({
              media_asset_id: selectedAsset.id,
              workspace_id: currentWorkspace.id,
              format: 'bio',
              name: `Bio (${length})`,
              copy_json: { text, length },
              status: 'draft',
            });
          });
        }
        // Save pitch
        if (output?.one_liner) {
          creativesToSave.push({
            media_asset_id: selectedAsset.id,
            workspace_id: currentWorkspace.id,
            format: 'pitch',
            name: 'One-Liner Pitch',
            copy_json: { text: output.one_liner },
            status: 'draft',
          });
        }
      }

      if (creativesToSave.length > 0) {
        const { data, error } = await supabase
          .from('media_creatives')
          .insert(creativesToSave as any)
          .select();

        if (!error && data) {
          setCreatives(prev => [...data as Creative[], ...prev]);
          toast({
            title: 'Creatives Generated',
            description: `Created ${data.length} new creative assets`,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate creatives',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  const groupedCreatives = creatives.reduce((acc, creative) => {
    const format = creative.format || 'other';
    if (!acc[format]) acc[format] = [];
    acc[format].push(creative);
    return acc;
  }, {} as Record<string, Creative[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Creatives Studio</h1>
          <p className="text-muted-foreground">
            Generate hooks, captions, scripts, and promotional assets
          </p>
        </div>

        <Select 
          value={selectedAsset?.id || ''} 
          onValueChange={(id) => setSelectedAsset(assets.find(a => a.id === id) || null)}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select media asset" />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.title || 'Untitled'} - {asset.platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedAsset ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Select a Media Asset</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Choose a media asset to generate and manage creative content.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Generate Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => !generating && handleGenerate('hooks')}
            >
              <CardContent className="flex flex-col items-center justify-center py-6">
                {generating === 'hooks' ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                ) : (
                  <MessageSquare className="w-8 h-8 text-primary mb-2" />
                )}
                <h4 className="font-medium">Generate Hooks</h4>
                <p className="text-xs text-muted-foreground">Short-form openers</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => !generating && handleGenerate('captions')}
            >
              <CardContent className="flex flex-col items-center justify-center py-6">
                {generating === 'captions' ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                ) : (
                  <Instagram className="w-8 h-8 text-primary mb-2" />
                )}
                <h4 className="font-medium">Generate Captions</h4>
                <p className="text-xs text-muted-foreground">Social media copy</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => !generating && handleGenerate('scripts')}
            >
              <CardContent className="flex flex-col items-center justify-center py-6">
                {generating === 'scripts' ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                ) : (
                  <Youtube className="w-8 h-8 text-primary mb-2" />
                )}
                <h4 className="font-medium">Generate Scripts</h4>
                <p className="text-xs text-muted-foreground">Reels/Shorts scripts</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => !generating && handleGenerate('kit')}
            >
              <CardContent className="flex flex-col items-center justify-center py-6">
                {generating === 'kit' ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                ) : (
                  <Music2 className="w-8 h-8 text-primary mb-2" />
                )}
                <h4 className="font-medium">Press Kit</h4>
                <p className="text-xs text-muted-foreground">Bios & pitches</p>
              </CardContent>
            </Card>
          </div>

          {/* Creatives List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : creatives.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No creatives generated yet. Click one of the buttons above to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue={Object.keys(groupedCreatives)[0]} className="space-y-4">
              <TabsList>
                {Object.keys(groupedCreatives).map((format) => {
                  const Icon = formatIcons[format] || FileText;
                  return (
                    <TabsTrigger key={format} value={format} className="gap-2">
                      <Icon className="w-4 h-4" />
                      {formatLabels[format] || format} ({groupedCreatives[format].length})
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.entries(groupedCreatives).map(([format, items]) => (
                <TabsContent key={format} value={format} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((creative) => {
                      const copyJson = creative.copy_json as Record<string, any>;
                      const text = copyJson?.text || copyJson?.hook || copyJson?.content || 
                        (typeof copyJson === 'string' ? copyJson : JSON.stringify(copyJson, null, 2));

                      return (
                        <Card key={creative.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium">
                                {creative.name || format}
                              </CardTitle>
                              <Badge variant="outline">{creative.status}</Badge>
                            </div>
                            {copyJson?.platform && (
                              <CardDescription>{copyJson.platform}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <Textarea 
                              value={text}
                              readOnly
                              className="min-h-[100px] resize-none bg-muted/50"
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCopy(text, creative.id)}
                              >
                                {copiedId === creative.id ? (
                                  <CheckCircle2 className="w-4 h-4 mr-1 text-primary" />
                                ) : (
                                  <Copy className="w-4 h-4 mr-1" />
                                )}
                                {copiedId === creative.id ? 'Copied' : 'Copy'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Export All */}
          {creatives.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All Creatives
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}