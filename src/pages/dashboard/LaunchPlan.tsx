import { useState, useEffect } from "react";
import { useMedia } from "@/hooks/useMedia";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  Download,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface LaunchPhase {
  name: string;
  date_offset: number;
  tasks: LaunchTask[];
}

interface LaunchTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  platform?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function LaunchPlan() {
  const { assets, selectedAsset, setSelectedAsset, runAgent } = useMedia();
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [distributionPlan, setDistributionPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch distribution plan for selected asset
  useEffect(() => {
    if (!selectedAsset || !currentWorkspace) {
      setDistributionPlan(null);
      return;
    }

    const fetchPlan = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_distribution_plan')
        .select('*')
        .eq('media_asset_id', selectedAsset.id)
        .single();

      if (!error && data) {
        setDistributionPlan(data);
      }
      setLoading(false);
    };

    fetchPlan();
  }, [selectedAsset, currentWorkspace]);

  const handleGeneratePlan = async () => {
    if (!selectedAsset) return;

    setGenerating(true);
    try {
      const result = await runAgent('media_strategy', selectedAsset.id);
      
      // Save the generated plan
      const { data, error } = await supabase
        .from('media_distribution_plan')
        .upsert({
          media_asset_id: selectedAsset.id,
          workspace_id: currentWorkspace?.id,
          plan_json: (result as any).result,
          phases: (result as any).result?.phases || {},
          calendar_json: []
        })
        .select()
        .single();

      if (!error && data) {
        setDistributionPlan(data);
        toast({
          title: 'Plan Generated',
          description: 'Your launch strategy has been created',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate launch plan',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const phases: LaunchPhase[] = distributionPlan?.phases ? [
    {
      name: 'Pre-Launch',
      date_offset: -7,
      tasks: distributionPlan.phases.pre_launch || []
    },
    {
      name: 'Launch Day',
      date_offset: 0,
      tasks: distributionPlan.phases.launch || []
    },
    {
      name: 'Post-Launch',
      date_offset: 7,
      tasks: distributionPlan.phases.post_launch || []
    }
  ] : [];

  const launchDate = selectedAsset?.release_date 
    ? new Date(selectedAsset.release_date) 
    : addDays(new Date(), 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Launch Plan</h1>
          <p className="text-muted-foreground">
            Plan and execute your media release strategy
          </p>
        </div>

        <div className="flex items-center gap-3">
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
      </div>

      {!selectedAsset ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Select a Media Asset</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Choose a media asset from the dropdown above to view or create its launch plan.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !distributionPlan ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generate Launch Strategy</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Our AI agents will create a comprehensive pre-launch, launch, and post-launch plan for "{selectedAsset.title}".
            </p>
            <Button variant="gradient" onClick={handleGeneratePlan} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Launch Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Asset Info */}
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              {selectedAsset.thumbnail_url && (
                <img 
                  src={selectedAsset.thumbnail_url} 
                  alt={selectedAsset.title || ''} 
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{selectedAsset.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAsset.artist_name} • Launch: {format(launchDate, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGeneratePlan} disabled={generating}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">All Tasks</TabsTrigger>
              <TabsTrigger value="kpis">KPIs</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {phases.map((phase, index) => {
                  const phaseDate = phase.date_offset === 0 
                    ? launchDate 
                    : phase.date_offset < 0 
                      ? subDays(launchDate, Math.abs(phase.date_offset))
                      : addDays(launchDate, phase.date_offset);

                  const tasks = Array.isArray(phase.tasks) ? phase.tasks : [];
                  const completedTasks = tasks.filter(t => t.status === 'completed').length;

                  return (
                    <Card key={phase.name} className={index === 1 ? 'border-primary' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={index === 1 ? 'default' : 'secondary'}>
                            {phase.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(phaseDate, 'MMM d')}
                          </span>
                        </div>
                        <CardDescription>
                          {completedTasks}/{tasks.length} tasks completed
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tasks.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No tasks defined
                          </p>
                        ) : (
                          tasks.slice(0, 5).map((task: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                            >
                          {task.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {task.title || task}
                                </p>
                                {task.platform && (
                                  <p className="text-xs text-muted-foreground">
                                    {task.platform}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        {tasks.length > 5 && (
                          <Button variant="ghost" size="sm" className="w-full">
                            View all {tasks.length} tasks
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>All Tasks</CardTitle>
                  <CardDescription>
                    Complete checklist for your media launch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {phases.flatMap((phase) => 
                      (Array.isArray(phase.tasks) ? phase.tasks : []).map((task: any, idx: number) => (
                        <div 
                          key={`${phase.name}-${idx}`}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                          <input 
                            type="checkbox" 
                            checked={task.status === 'completed'}
                            className="h-4 w-4"
                            readOnly
                          />
                          <div className="flex-1">
                            <p className="font-medium">{task.title || task}</p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                          <Badge variant="outline">{phase.name}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kpis">
              <Card>
                <CardHeader>
                  <CardTitle>Target KPIs</CardTitle>
                  <CardDescription>
                    Goals to track for this launch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {distributionPlan?.plan_json?.kpis?.map((kpi: any, idx: number) => (
                      <Card key={idx} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <p className="text-2xl font-bold">{kpi.target || '-'}</p>
                          <p className="text-sm text-muted-foreground">{kpi.name || kpi}</p>
                        </CardContent>
                      </Card>
                    )) || (
                      <p className="text-muted-foreground col-span-full text-center py-8">
                        KPI targets will be defined in the launch plan
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}