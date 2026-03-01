import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Code2, Brain, Eye, Loader2, AlertTriangle,
  CheckCircle2, ExternalLink, Copy, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function GEOAuditTab() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runAudit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("geo-audit", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      setResult(data);
      toast.success(t("geo.auditComplete"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-500" />
            {t("geo.audit.title")}
          </CardTitle>
          <CardDescription>{t("geo.audit.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
            />
            <Button onClick={runAudit} disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              {t("geo.audit.run")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("geo.audit.results")}</CardTitle>
              <Badge variant={result.score >= 70 ? "default" : result.score >= 40 ? "secondary" : "destructive"}>
                {t("geo.audit.score")}: {result.score}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.checks?.map((check: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                {check.pass ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium text-sm">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
              </div>
            ))}
            {result.recommendations?.length > 0 && (
              <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t("geo.audit.recommendations")}
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">→</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StructuredDataTab() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonLd, setJsonLd] = useState("");

  const generate = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setJsonLd("");
    try {
      const { data, error } = await supabase.functions.invoke("geo-structured-data", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      setJsonLd(JSON.stringify(data.schemas, null, 2));
      toast.success(t("geo.structured.generated"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonLd);
    toast.success(t("geo.structured.copied"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            {t("geo.structured.title")}
          </CardTitle>
          <CardDescription>{t("geo.structured.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
            />
            <Button onClick={generate} disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Code2 className="w-4 h-4 mr-2" />}
              {t("geo.structured.generate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {jsonLd && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("geo.structured.output")}</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-1" /> {t("common.export")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
              {jsonLd}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContentOptimizerTab() {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const optimize = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("geo-content-optimizer", {
        body: { content: content.trim() },
      });
      if (error) throw error;
      setResult(data);
      toast.success(t("geo.optimizer.done"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            {t("geo.optimizer.title")}
          </CardTitle>
          <CardDescription>{t("geo.optimizer.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("geo.optimizer.placeholder")}
            rows={8}
          />
          <Button onClick={optimize} disabled={loading || !content.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
            {t("geo.optimizer.run")}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t("geo.optimizer.result")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.score != null && (
              <div className="flex items-center gap-3">
                <Badge variant={result.score >= 70 ? "default" : "destructive"}>
                  GEO Score: {result.score}/100
                </Badge>
              </div>
            )}
            {result.optimizedContent && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2">{t("geo.optimizer.optimized")}</h4>
                <p className="text-sm whitespace-pre-wrap">{result.optimizedContent}</p>
              </div>
            )}
            {result.suggestions?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">{t("geo.optimizer.suggestions")}</h4>
                <ul className="space-y-1">
                  {result.suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <Sparkles className="w-3 h-3 text-primary mt-1 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CitationMonitorTab() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const monitor = async () => {
    if (!query.trim() || !brand.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("geo-citation-monitor", {
        body: { query: query.trim(), brand: brand.trim() },
      });
      if (error) throw error;
      setResult(data);
      toast.success(t("geo.monitor.done"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-500" />
            {t("geo.monitor.title")}
          </CardTitle>
          <CardDescription>{t("geo.monitor.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={t("geo.monitor.brandPlaceholder")}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("geo.monitor.queryPlaceholder")}
          />
          <Button onClick={monitor} disabled={loading || !query.trim() || !brand.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {t("geo.monitor.run")}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("geo.monitor.results")}</CardTitle>
              <Badge variant={result.cited ? "default" : "destructive"}>
                {result.cited ? t("geo.monitor.cited") : t("geo.monitor.notCited")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.aiResponse && (
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-2 text-sm">{t("geo.monitor.aiResponse")}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.aiResponse}</p>
              </div>
            )}
            {result.citations?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">{t("geo.monitor.sources")}</h4>
                <ul className="space-y-1">
                  {result.citations.map((c: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <a href={c} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{c}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.recommendations?.length > 0 && (
              <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t("geo.monitor.tips")}
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">→</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function GEO() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <SEOHead title={t("geo.pageTitle")} description={t("geo.pageDesc")} />

      <div>
        <h1 className="text-3xl font-bold">{t("geo.pageTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("geo.pageDesc")}</p>
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit" className="gap-1.5">
            <Search className="w-4 h-4" /> {t("geo.tabs.audit")}
          </TabsTrigger>
          <TabsTrigger value="structured" className="gap-1.5">
            <Code2 className="w-4 h-4" /> {t("geo.tabs.structured")}
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="gap-1.5">
            <Brain className="w-4 h-4" /> {t("geo.tabs.optimizer")}
          </TabsTrigger>
          <TabsTrigger value="monitor" className="gap-1.5">
            <Eye className="w-4 h-4" /> {t("geo.tabs.monitor")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit"><GEOAuditTab /></TabsContent>
        <TabsContent value="structured"><StructuredDataTab /></TabsContent>
        <TabsContent value="optimizer"><ContentOptimizerTab /></TabsContent>
        <TabsContent value="monitor"><CitationMonitorTab /></TabsContent>
      </Tabs>
    </div>
  );
}
