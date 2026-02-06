import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

      try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        const urlObj = new URL(url);
        
        if (!name) {
          name = urlObj.hostname.replace('www.', '').split('.')[0];
          name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        sites.push({ url, name, valid: true });
      } catch {
        sites.push({ url: trimmed, name: "", valid: false, error: t("components.bulkImport.invalidUrl") });
      }
    }

    setParsedSites(sites);
  };

  const handleImport = async () => {
    const validSites = parsedSites.filter(s => s.valid);
    if (validSites.length === 0) {
      toast.error(t("components.bulkImport.noValidSites"));
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const totalSites = validSites.length;
      for (let i = 0; i < totalSites; i++) {
        setProgress(((i + 1) / totalSites) * 100);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await onImport(validSites.map(s => ({ url: s.url, name: s.name })));
      
      toast.success(t("components.bulkImport.sitesImported", { count: validSites.length }));
      setShowDialog(false);
      setInput("");
      setParsedSites([]);
    } catch (err) {
      console.error("Import error:", err);
      toast.error(t("components.bulkImport.importError"));
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
        {t("components.bulkImport.bulkImport")}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              {t("components.bulkImport.title")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t("components.bulkImport.instructions")}
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
                    {validCount} {t("components.bulkImport.valid")}
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {invalidCount} {t("components.bulkImport.invalid")}
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
                  {t("components.bulkImport.importing")}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={importing}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="hero"
              onClick={handleImport}
              disabled={importing || validCount === 0}
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.import")}...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {t("components.bulkImport.importCount", { count: validCount })}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
