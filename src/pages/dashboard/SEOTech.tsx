import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileWarning,
  ArrowRight,
  Play,
  Download,
  FileText,
  Loader2,
  Shield,
  Eye,
} from "lucide-react";
import { useSEOAudit } from "@/hooks/useSEOAudit";
import { useSites } from "@/hooks/useSites";
import type { SEOIssue } from "@/lib/agents/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SEOTech() {
  const { currentSite } = useSites();
  const { loading, result, error, runAudit, exportResults } = useSEOAudit();
  const [selectedIssue, setSelectedIssue] = useState<SEOIssue | null>(null);
  const [showPatchDialog, setShowPatchDialog] = useState(false);

  const auditScore = result 
    ? Math.max(0, 100 - (result.issues.filter(i => i.severity === 'critical').length * 15 + 
                         result.issues.filter(i => i.severity === 'high').length * 8 +
                         result.issues.filter(i => i.severity === 'medium').length * 3))
    : 72;

  const issueCategories = result ? [
    { name: "Critique", count: result.issues.filter(i => i.severity === 'critical').length, severity: "critical" },
    { name: "Haute", count: result.issues.filter(i => i.severity === 'high').length, severity: "high" },
    { name: "Moyenne", count: result.issues.filter(i => i.severity === 'medium').length, severity: "medium" },
    { name: "Faible", count: result.issues.filter(i => i.severity === 'low').length, severity: "low" },
  ] : [];

  const crawlStats = {
    pagesTotal: result?.pages_total || 0,
    pagesIndexed: result?.pages_crawled || 0,
    errors404: result?.issues?.filter(i => i.type === 'http_error').length || 0,
    lastCrawl: result ? "À l'instant" : "Aucun crawl",
    crawlMethod: result?.crawl_method || 'none',
  };

  const filteredIssues = (severity?: string) => {
    if (!result) return [];
    if (!severity || severity === 'all') return result.issues;
    if (severity === 'critical') return result.issues.filter(i => i.severity === 'critical');
    if (severity === 'fixable') return result.issues.filter(i => i.auto_fixable);
    return result.issues;
  };

  const generatePatchInstructions = () => {
    if (!result) return '';
    
    const instructions: string[] = [
      '# 📋 PATCH INSTRUCTIONS - SEO Technique',
      `Date: ${new Date().toLocaleDateString('fr-FR')}`,
      `Site: ${currentSite?.url || 'Non défini'}`,
      '',
      '## Résumé',
      `- ${result.issues.filter(i => i.severity === 'critical').length} issues critiques`,
      `- ${result.issues.filter(i => i.severity === 'high').length} issues hautes`,
      `- ${result.issues.filter(i => i.severity === 'medium').length} issues moyennes`,
      '',
      '---',
      '',
    ];

    // Group by priority
    const criticalIssues = result.issues.filter(i => i.severity === 'critical');
    const highIssues = result.issues.filter(i => i.severity === 'high');
    const mediumIssues = result.issues.filter(i => i.severity === 'medium');

    if (criticalIssues.length > 0) {
      instructions.push('## 🔴 CRITIQUE - À corriger immédiatement');
      instructions.push('');
      criticalIssues.forEach((issue, idx) => {
        instructions.push(`### ${idx + 1}. ${issue.title}`);
        instructions.push(`**Description:** ${issue.description}`);
        instructions.push(`**Recommandation:** ${issue.recommendation}`);
        if (issue.fix_instructions) {
          instructions.push('');
          instructions.push('**Étapes:**');
          instructions.push(issue.fix_instructions);
        }
        instructions.push('');
      });
    }

    if (highIssues.length > 0) {
      instructions.push('## 🟠 HAUTE PRIORITÉ');
      instructions.push('');
      highIssues.forEach((issue, idx) => {
        instructions.push(`### ${idx + 1}. ${issue.title}`);
        instructions.push(`**Description:** ${issue.description}`);
        instructions.push(`**Recommandation:** ${issue.recommendation}`);
        if (issue.fix_instructions) {
          instructions.push('');
          instructions.push('**Étapes:**');
          instructions.push(issue.fix_instructions);
        }
        instructions.push('');
      });
    }

    if (mediumIssues.length > 0) {
      instructions.push('## 🟡 MOYENNE PRIORITÉ');
      instructions.push('');
      mediumIssues.forEach((issue, idx) => {
        instructions.push(`### ${idx + 1}. ${issue.title}`);
        instructions.push(`**Description:** ${issue.description}`);
        instructions.push(`**Recommandation:** ${issue.recommendation}`);
        instructions.push('');
      });
    }

    return instructions.join('\n');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">SEO Technique</h1>
          <p className="text-muted-foreground">
            Audit technique et optimisations du site
          </p>
          {!currentSite && (
            <p className="text-sm text-warning mt-1">
              ⚠️ Veuillez sélectionner un site pour lancer l'audit
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => runAudit()} disabled={loading || !currentSite?.url}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Crawl en cours...' : 'Nouveau crawl'}
          </Button>
          {result && (
            <>
              <Button variant="outline" onClick={() => setShowPatchDialog(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Patch Instructions
              </Button>
              <Button variant="outline" onClick={() => exportResults('json')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Security Badge */}
      <Card variant="feature" className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-4">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <p className="font-medium text-primary">Crawler Sécurisé</p>
            <p className="text-sm text-muted-foreground">
              Anti-SSRF activé • Respect robots.txt • Rate limiting • Timeout protection
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card variant="feature" className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <p className="text-warning">
              ⚠️ {error} - Affichage des données de démonstration
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card variant="gradient">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Analyse en cours...</p>
            <p className="text-sm opacity-80">Crawl sécurisé des pages, analyse technique</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {/* Score + Stats */}
          <div className="grid lg:grid-cols-4 gap-6">
            <Card variant="gradient" className="lg:col-span-1">
              <CardContent className="pt-6 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      strokeWidth="12"
                      fill="none"
                      className="stroke-background/30"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${auditScore * 3.52} 352`}
                      className="stroke-primary-foreground transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">{auditScore}</span>
                  </div>
                </div>
                <p className="font-medium">Score SEO</p>
                <p className="text-sm opacity-80">{result.issues.length} issues détectées</p>
              </CardContent>
            </Card>

            <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
              <Card variant="feature">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{crawlStats.pagesIndexed}</p>
                      <p className="text-sm text-muted-foreground">Pages analysées</p>
                    </div>
                  </div>
                  <Progress value={(crawlStats.pagesIndexed / crawlStats.pagesTotal) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    sur {crawlStats.pagesTotal} pages totales
                  </p>
                </CardContent>
              </Card>

              <Card variant="feature">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <FileWarning className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{crawlStats.errors404}</p>
                      <p className="text-sm text-muted-foreground">Erreurs HTTP</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    À corriger en priorité
                  </Badge>
                </CardContent>
              </Card>

              <Card variant="feature">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dernier crawl</p>
                      <p className="text-sm text-muted-foreground">{crawlStats.lastCrawl}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Durée: {(result.duration_ms / 1000).toFixed(1)}s
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Issues */}
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Problèmes détectés</CardTitle>
                  <CardDescription>
                    {result.issues.length} problèmes à résoudre, triés par score ICE
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {issueCategories.map((cat) => (
                    <Badge
                      key={cat.name}
                      variant={cat.severity === "critical" ? "destructive" : cat.severity === "high" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {cat.name} ({cat.count})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Tous ({result.issues.length})</TabsTrigger>
                  <TabsTrigger value="critical">
                    Critiques ({result.issues.filter(i => i.severity === 'critical').length})
                  </TabsTrigger>
                  <TabsTrigger value="fixable">
                    Auto-corrigibles ({result.issues.filter(i => i.auto_fixable).length})
                  </TabsTrigger>
                </TabsList>
                
                {['all', 'critical', 'fixable'].map((tabValue) => (
                  <TabsContent key={tabValue} value={tabValue} className="mt-4 space-y-3">
                    {filteredIssues(tabValue).map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              issue.severity === "critical"
                                ? "text-destructive"
                                : issue.severity === "high"
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{issue.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {issue.type.replace(/_/g, ' ')}
                            </Badge>
                            {issue.auto_fixable && (
                              <Badge variant="success" className="text-xs">
                                Auto-corrigible
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Score ICE</span>
                              <Progress value={issue.ice_score} className="w-20 h-1.5" />
                              <span className="text-xs font-medium">{issue.ice_score}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    ))}
                    {filteredIssues(tabValue).length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        Aucun problème dans cette catégorie
                      </p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Results State */}
      {!loading && !result && (
        <Card variant="feature">
          <CardContent className="py-12 text-center">
            {currentSite?.url ? (
              <>
                <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Lancez votre premier audit</h3>
                <p className="text-muted-foreground mb-6">
                  Analysez {currentSite.name || currentSite.url} pour détecter les problèmes SEO techniques
                </p>
                <Button variant="hero" onClick={() => runAudit()}>
                  <Play className="w-4 h-4 mr-2" />
                  Lancer l'audit
                </Button>
              </>
            ) : (
              <>
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-warning" />
                <h3 className="text-lg font-medium mb-2">Aucun site sélectionné</h3>
                <p className="text-muted-foreground mb-6">
                  Ajoutez un site dans la section "Sites" pour lancer un audit SEO.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${
                selectedIssue?.severity === 'critical' ? 'text-destructive' :
                selectedIssue?.severity === 'high' ? 'text-yellow-500' : 'text-muted-foreground'
              }`} />
              {selectedIssue?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedIssue?.type.replace(/_/g, ' ')} • Score ICE: {selectedIssue?.ice_score}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedIssue?.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recommandation</h4>
              <p className="text-sm text-muted-foreground">{selectedIssue?.recommendation}</p>
            </div>
            
            {selectedIssue?.fix_instructions && (
              <div>
                <h4 className="font-medium mb-2">Instructions de correction</h4>
                <pre className="text-sm bg-secondary/50 p-4 rounded-lg whitespace-pre-wrap">
                  {selectedIssue.fix_instructions}
                </pre>
              </div>
            )}
            
            {selectedIssue?.affected_urls && selectedIssue.affected_urls.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">URLs affectées ({selectedIssue.affected_urls.length})</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedIssue.affected_urls.slice(0, 5).map((url, idx) => (
                    <li key={idx} className="truncate">{url}</li>
                  ))}
                  {selectedIssue.affected_urls.length > 5 && (
                    <li className="text-primary">+ {selectedIssue.affected_urls.length - 5} autres...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Patch Instructions Dialog */}
      <Dialog open={showPatchDialog} onOpenChange={setShowPatchDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>📋 Patch Instructions</DialogTitle>
            <DialogDescription>
              Checklist actionnable pour corriger les problèmes détectés
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea 
              value={generatePatchInstructions()} 
              readOnly 
              className="h-96 font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(generatePatchInstructions());
              }}>
                Copier
              </Button>
              <Button onClick={() => {
                const blob = new Blob([generatePatchInstructions()], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `patch-instructions-${new Date().toISOString().split('T')[0]}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger .md
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
