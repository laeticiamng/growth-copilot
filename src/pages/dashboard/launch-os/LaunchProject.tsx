import { useNavigate } from "react-router-dom";
import { useLaunchOS } from "@/hooks/useLaunchOS";
import { LaunchTypeEngine } from "@/lib/launch-os/launch-type-engine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Target, Zap, BarChart3, Brain, Video, Calendar,
  Loader2, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Play
} from "lucide-react";
import { getLaunchCategory } from "@/lib/launch-os/types";
import { useState } from "react";

export default function LaunchProject() {
  const navigate = useNavigate();
  const {
    currentProject, scoreReadiness, generateCreatives, generateVideoConcepts,
    evaluateDecisions, readinessScores, creativeVariants, videoConcepts,
    distributionRuns, decisionActions, signalEvents, updateProject
  } = useLaunchOS();
  const [scoringLoading, setScoringLoading] = useState(false);
  const [creativesLoading, setCreativesLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground mb-4">No project selected</p>
        <Button onClick={() => navigate('/dashboard/launch-os')}>Back to Launch OS</Button>
      </div>
    );
  }

  const config = LaunchTypeEngine.getConfig(currentProject.launch_type);
  const isMusic = getLaunchCategory(currentProject.launch_type) === 'music';
  const latestScore = readinessScores[0];

  const handleScore = async () => {
    setScoringLoading(true);
    await scoreReadiness(currentProject.id);
    setScoringLoading(false);
  };

  const handleGenerateCreatives = async () => {
    setCreativesLoading(true);
    await generateCreatives(currentProject.id, []);
    setCreativesLoading(false);
  };

  const handleGenerateVideos = async () => {
    setVideosLoading(true);
    await generateVideoConcepts(currentProject.id);
    setVideosLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/launch-os')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{currentProject.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{currentProject.launch_type.replace(/_/g, ' ')}</Badge>
            <Badge>{currentProject.status.replace(/_/g, ' ')}</Badge>
            {currentProject.readiness_score != null && (
              <Badge variant={currentProject.readiness_score >= 60 ? 'default' : 'destructive'}>
                Score: {currentProject.readiness_score}/100
              </Badge>
            )}
          </div>
        </div>
        {currentProject.status === 'ready_to_launch' && (
          <Button
            size="lg"
            className="gap-2"
            onClick={() => updateProject(currentProject.id, { status: 'pre_launch' })}
          >
            <Play className="w-4 h-4" />
            Start Launch
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="readiness">Readiness</TabsTrigger>
          <TabsTrigger value="creatives">Creatives ({creativeVariants.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videoConcepts.length})</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionCard
              icon={Target}
              label="Score Readiness"
              description="Evaluate launch preparation"
              loading={scoringLoading}
              onClick={handleScore}
              color="text-green-500"
            />
            <ActionCard
              icon={Zap}
              label="Generate Creatives"
              description="AI-powered creative variants"
              loading={creativesLoading}
              onClick={handleGenerateCreatives}
              color="text-purple-500"
            />
            <ActionCard
              icon={Video}
              label="Video Concepts"
              description="Short-form storyboards"
              loading={videosLoading}
              onClick={handleGenerateVideos}
              color="text-pink-500"
            />
            <ActionCard
              icon={Brain}
              label="Evaluate Decisions"
              description="Run decision engine"
              loading={false}
              onClick={() => evaluateDecisions(currentProject.id)}
              color="text-amber-500"
            />
          </div>

          {/* Phase Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Launch Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {config.phases.map((phase, i) => (
                  <div key={phase.key} className={`p-4 rounded-lg border ${i === 1 ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={i === 1 ? 'default' : 'secondary'}>{phase.name}</Badge>
                      <span className="text-xs text-muted-foreground">{phase.durationDays}d</span>
                    </div>
                    <ul className="space-y-1.5">
                      {phase.defaultTasks.slice(0, 4).map((task, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1.5 flex-shrink-0" />
                          {task}
                        </li>
                      ))}
                      {phase.defaultTasks.length > 4 && (
                        <li className="text-xs text-muted-foreground/60">+{phase.defaultTasks.length - 4} more</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPI Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Target KPIs
              </CardTitle>
              <CardDescription>Key metrics for this {isMusic ? 'music' : 'platform'} launch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.kpiKeys.map(kpi => (
                  <div key={kpi} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{kpi.replace(/_/g, ' ')}</p>
                    <p className="text-lg font-semibold mt-1">—</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Readiness */}
        <TabsContent value="readiness" className="space-y-6 mt-6">
          {latestScore ? (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-5xl font-bold">{latestScore.overall_score}</p>
                      <p className="text-sm text-muted-foreground">/100</p>
                    </div>
                    <div className="flex-1">
                      <Progress value={latestScore.overall_score} className="h-3 mb-2" />
                      <Badge variant={
                        latestScore.status === 'ready_to_launch' ? 'default' :
                        latestScore.status === 'needs_fix' ? 'secondary' : 'destructive'
                      }>
                        {latestScore.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <Button variant="outline" onClick={handleScore} disabled={scoringLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${scoringLoading ? 'animate-spin' : ''}`} />
                      Re-score
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestScore.dimensions.map((dim: { key: string; label: string; score: number; details: string }) => (
                  <div key={dim.key} className="flex items-center gap-3 p-3 rounded-lg border">
                    {dim.score >= 60 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : dim.score > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{dim.label}</p>
                        <span className="text-sm font-bold">{dim.score}</span>
                      </div>
                      <Progress value={dim.score} className="h-1.5 mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">{dim.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blockers */}
              {latestScore.blockers.length > 0 && (
                <Card className="border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-base text-red-500">Blockers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {latestScore.blockers.map((b: { dimension: string; message: string; fix_hint: string }, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-red-500/5">
                        <p className="text-sm font-medium">{b.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{b.fix_hint}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {latestScore.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {latestScore.recommendations.map((r: { title: string; description: string; impact: string }, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="text-xs mt-0.5">{r.impact}</Badge>
                        <div>
                          <p className="text-sm font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Target className="w-12 h-12 text-primary/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Score Your Readiness</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Run a readiness check to evaluate your launch preparation across multiple dimensions.
                </p>
                <Button onClick={handleScore} disabled={scoringLoading} className="gap-2">
                  {scoringLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                  Run Readiness Check
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Creatives */}
        <TabsContent value="creatives" className="space-y-6 mt-6">
          {creativeVariants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creativeVariants.map(variant => (
                <Card key={variant.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{variant.name}</CardTitle>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">{variant.format}</Badge>
                        <Badge variant="secondary" className="text-xs">{variant.status}</Badge>
                      </div>
                    </div>
                    {variant.angle && <CardDescription>{variant.angle}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap">
                      {typeof variant.content === 'string' ? variant.content : JSON.stringify(variant.content, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Zap className="w-12 h-12 text-purple-500/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generate Creative Variants</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  AI will generate hooks, scripts, ad copy, and more — all tailored to your launch type.
                </p>
                <Button onClick={handleGenerateCreatives} disabled={creativesLoading} className="gap-2">
                  {creativesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate Creatives
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Videos */}
        <TabsContent value="videos" className="space-y-6 mt-6">
          {videoConcepts.length > 0 ? (
            <div className="space-y-4">
              {videoConcepts.map(concept => (
                <Card key={concept.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{concept.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{concept.format}</Badge>
                        <Badge variant="outline">{concept.duration_seconds}s</Badge>
                        <Badge variant="secondary">{concept.status}</Badge>
                      </div>
                    </div>
                    <CardDescription>{concept.angle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Hook (first 3s)</p>
                        <p className="text-sm font-medium mt-1">{concept.hook_text}</p>
                      </div>
                      {concept.scenes.map((scene: { order: number; duration_seconds: number; visual_description: string; text_overlay: string | null; voiceover: string | null }, i: number) => (
                        <div key={i} className="flex gap-3 p-2 rounded bg-muted/30">
                          <div className="text-xs text-muted-foreground font-mono w-8 flex-shrink-0 pt-0.5">
                            {scene.duration_seconds}s
                          </div>
                          <div className="flex-1 text-sm">
                            <p>{scene.visual_description}</p>
                            {scene.text_overlay && <p className="text-xs text-primary mt-1">Text: {scene.text_overlay}</p>}
                            {scene.voiceover && <p className="text-xs text-muted-foreground mt-1 italic">VO: {scene.voiceover}</p>}
                          </div>
                        </div>
                      ))}
                      {concept.cta && (
                        <div className="p-2 rounded bg-accent/10 text-sm">
                          <span className="text-xs text-muted-foreground">CTA:</span> {concept.cta}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Video className="w-12 h-12 text-pink-500/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create Video Concepts</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Generate production-ready storyboards with scene-by-scene breakdowns.
                </p>
                <Button onClick={handleGenerateVideos} disabled={videosLoading} className="gap-2">
                  {videosLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  Generate Video Concepts
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Distribution */}
        <TabsContent value="distribution" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Distribution Plan
              </CardTitle>
              <CardDescription>
                Active channels: {config.defaultChannels.map(c => c.replace(/_/g, ' ')).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {distributionRuns.length > 0 ? (
                <div className="space-y-3">
                  {distributionRuns.map(run => (
                    <div key={run.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{run.channel.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">Budget: ${run.budget_allocated} / Spent: ${run.budget_spent}</p>
                      </div>
                      <Badge>{run.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Distribution will activate when the launch enters pre-launch phase.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signals */}
        <TabsContent value="signals" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Signal Feed
              </CardTitle>
              <CardDescription>{signalEvents.length} events tracked</CardDescription>
            </CardHeader>
            <CardContent>
              {signalEvents.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {signalEvents.slice(0, 50).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                        <span className="text-muted-foreground">{event.source}</span>
                        {event.channel && <span className="text-xs text-muted-foreground">via {event.channel}</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No signals yet. Events will appear as your launch generates traffic.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActionCard({ icon: Icon, label, description, loading, onClick, color }: {
  icon: typeof Target; label: string; description: string; loading: boolean; onClick: () => void; color: string;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/30 transition-all hover:shadow-sm"
      onClick={() => !loading && onClick()}
    >
      <CardContent className="flex flex-col items-center justify-center py-6">
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        ) : (
          <Icon className={`w-8 h-8 mb-2 ${color}`} />
        )}
        <h4 className="font-medium text-sm">{label}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
