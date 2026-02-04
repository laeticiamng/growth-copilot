import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

interface ParsedSite {
  url: string;
  name: string;
  valid: boolean;
  error?: string;
}

interface BulkSiteImportProps {
  onImport: (sites: { url: string; name: string }[]) => Promise<void>;
}

export function BulkSiteImport({ onImport }: BulkSiteImportProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [input, setInput] = useState("");
  const [parsedSites, setParsedSites] = useState<ParsedSite[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const parseInput = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const sites: ParsedSite[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Try to extract URL and optional name (comma or tab separated)
      let url = trimmed;
      let name = "";

      if (trimmed.includes(',')) {
        const parts = trimmed.split(',');
        url = parts[0].trim();
        name = parts[1]?.trim() || "";
      } else if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t');
        url = parts[0].trim();
        name = parts[1]?.trim() || "";
      }

      // Validate URL
      try {
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        const urlObj = new URL(url);
        
        // Generate name from domain if not provided
        if (!name) {
          name = urlObj.hostname.replace('www.', '').split('.')[0];
          name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        sites.push({ url, name, valid: true });
      } catch {
        sites.push({ url: trimmed, name: "", valid: false, error: "URL invalide" });
      }
    }

    setParsedSites(sites);
  };

  const handleImport = async () => {
    const validSites = parsedSites.filter(s => s.valid);
    if (validSites.length === 0) {
      toast.error("Aucun site valide à importer");
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const totalSites = validSites.length;
      for (let i = 0; i < totalSites; i++) {
        setProgress(((i + 1) / totalSites) * 100);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      }

      await onImport(validSites.map(s => ({ url: s.url, name: s.name })));
      
      toast.success(`${validSites.length} sites importés`);
      setShowDialog(false);
      setInput("");
      setParsedSites([]);
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const validCount = parsedSites.filter(s => s.valid).length;
  const invalidCount = parsedSites.filter(s => !s.valid).length;

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Import en masse
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Import de sites en masse
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Collez une liste d'URLs (une par ligne). Format optionnel : URL, Nom du site
              </p>
              <Textarea
                placeholder="https://example.com, Mon Site&#10;https://autre-site.com&#10;www.troisiemesite.fr"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  parseInput(e.target.value);
                }}
                rows={8}
                disabled={importing}
              />
            </div>

            {parsedSites.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {validCount} valides
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {invalidCount} invalides
                    </Badge>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {parsedSites.map((site, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-sm p-2 rounded ${
                        site.valid ? 'bg-secondary/50' : 'bg-destructive/10'
                      }`}
                    >
                      {site.valid ? (
                        <CheckCircle2 className="w-4 h-4 status-success flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1">{site.url}</span>
                      {site.name && (
                        <Badge variant="outline" className="text-xs">
                          {site.name}
                        </Badge>
                      )}
                      {site.error && (
                        <span className="text-xs text-destructive">{site.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Import en cours...
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={importing}>
              Annuler
            </Button>
            <Button
              variant="hero"
              onClick={handleImport}
              disabled={importing || validCount === 0}
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Import...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importer {validCount} sites
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
