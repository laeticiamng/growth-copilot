import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { 
  Search, 
  TrendingUp, 
  Users, 
  Globe, 
  Loader2, 
  ExternalLink,
  Sparkles,
  Target,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type ResearchMode = 'competitor' | 'market' | 'trends' | 'custom';

interface ResearchResult {
  content: string;
  citations: string[];
  model: string;
  timestamp: Date;
  mode: ResearchMode;
  query: string;
}

export function SmartResearchHub() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ResearchMode>('competitor');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);

  const modeConfig = {
    competitor: {
      icon: Users,
      label: t("components.research.modeCompetitor"),
      description: t("components.research.modeCompetitorDesc"),
      placeholder: "Ex: Analyze the marketing strategy of [concurrent]"
    },
    market: {
      icon: Globe,
      label: t("components.research.modeMarket"),
      description: t("components.research.modeMarketDesc"),
      placeholder: "Ex: Market size and trends for [industry] in Europe"
    },
    trends: {
      icon: TrendingUp,
      label: t("components.research.modeTrends"),
      description: t("components.research.modeTrendsDesc"),
      placeholder: "Ex: Emerging trends in [sector] for 2026"
    },
    custom: {
      icon: Lightbulb,
      label: t("components.research.modeCustom"),
      description: t("components.research.modeCustomDesc"),
      placeholder: t("components.research.customPlaceholder")
    }
  };

  const runResearch = async () => {
    if (!query.trim() || !currentWorkspace?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("perplexity-research", {
        body: {
          workspace_id: currentWorkspace.id,
          query: query.trim(),
          mode,
          recency: mode === 'trends' ? 'week' : 'month'
        },
      });

      if (error) throw error;

      const result: ResearchResult = {
        content: data.content,
        citations: data.citations || [],
        model: data.model,
        timestamp: new Date(),
        mode,
        query: query.trim()
      };

      setResults(prev => [result, ...prev]);
      setQuery("");
      toast.success(t("components.research.searchComplete"));

    } catch (error) {
      console.error("[Research] Error:", error);
      toast.error(t("components.research.searchError"));
    } finally {
      setLoading(false);
    }
  };

  const CurrentIcon = modeConfig[mode].icon;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Research Hub
          </CardTitle>
          <CardDescription>{t("components.research.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as ResearchMode)}>
            <TabsList className="grid w-full grid-cols-4">
              {(Object.entries(modeConfig) as [ResearchMode, typeof modeConfig.competitor][]).map(([key, config]) => (
                <TabsTrigger key={key} value={key} className="text-xs gap-1">
                  <config.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{config.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CurrentIcon className="h-4 w-4" />
            {modeConfig[mode].description}
          </div>

          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={modeConfig[mode].placeholder}
              onKeyPress={(e) => e.key === 'Enter' && runResearch()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={runResearch} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuery("Top 5 competitors in my market and their recent moves")}>
              <Target className="h-3 w-3 mr-1" />
              {t("components.research.quickCompetitors")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuery("Latest industry trends and what they mean for my business")}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {t("components.research.quickTrends")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuery("Market opportunities I should be aware of")}>
              <Lightbulb className="h-3 w-3 mr-1" />
              {t("components.research.quickOpportunities")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("components.research.resultsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{modeConfig[result.mode].label}</Badge>
                        <span className="text-xs text-muted-foreground">{result.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {result.citations.length} {t("components.research.sources")}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-3 text-primary">"{result.query}"</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{result.content}</ReactMarkdown>
                    </div>
                    {result.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">{t("components.research.sourcesLabel")}</p>
                        <div className="flex flex-wrap gap-2">
                          {result.citations.slice(0, 5).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              <ExternalLink className="h-3 w-3" />
                              {new URL(url).hostname.replace('www.', '')}
                            </a>
                          ))}
                          {result.citations.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{result.citations.length - 5} {t("components.research.others")}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
