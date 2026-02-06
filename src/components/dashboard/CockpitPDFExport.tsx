import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportSection {
  id: string;
  labelKey: string;
  checked: boolean;
}

interface CockpitPDFExportProps {
  workspaceName: string;
  onExport?: (sections: string[]) => Promise<void>;
}

export function CockpitPDFExport({ workspaceName, onExport }: CockpitPDFExportProps) {
  const { t, i18n } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sections, setSections] = useState<ExportSection[]>([
    { id: "summary", labelKey: "cockpit.pdfSectionSummary", checked: true },
    { id: "health", labelKey: "cockpit.pdfSectionHealth", checked: true },
    { id: "kpis", labelKey: "cockpit.pdfSectionKpis", checked: true },
    { id: "agents", labelKey: "cockpit.pdfSectionAgents", checked: true },
    { id: "approvals", labelKey: "cockpit.pdfSectionApprovals", checked: false },
    { id: "actions", labelKey: "cockpit.pdfSectionActions", checked: true },
    { id: "runs", labelKey: "cockpit.pdfSectionRuns", checked: false },
  ]);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const handleExport = async () => {
    const selectedSections = sections.filter(s => s.checked).map(s => s.id);
    if (selectedSections.length === 0) {
      toast.error(t("cockpit.pdfSelectAtLeastOne"));
      return;
    }
    setExporting(true);
    try {
      if (onExport) {
        await onExport(selectedSections);
      } else {
        await generatePDFContent(selectedSections);
      }
      toast.success(t("cockpit.pdfExportLaunched"));
      setShowDialog(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error(t("cockpit.pdfExportError"));
    } finally {
      setExporting(false);
    }
  };

  const generatePDFContent = async (selectedSections: string[]) => {
    const dateLocale = i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'de' ? 'de-DE' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    const date = new Date().toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' });

    const sectionTitles: Record<string, string> = {
      summary: t("cockpit.pdfSectionSummary"),
      health: t("cockpit.pdfSectionHealth"),
      kpis: t("cockpit.pdfSectionKpis"),
      agents: t("cockpit.pdfSectionAgents"),
      actions: t("cockpit.pdfSectionActions"),
    };

    const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cockpit — ${workspaceName}</title>
<style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.5; } .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; } .header h1 { font-size: 28px; color: #0ea5e9; } .header p { color: #666; margin-top: 5px; } .section { margin-bottom: 30px; page-break-inside: avoid; } .section h2 { font-size: 18px; color: #333; border-left: 4px solid #0ea5e9; padding-left: 12px; margin-bottom: 15px; } .card { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 12px; } .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; } .kpi-card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; } .kpi-value { font-size: 32px; font-weight: bold; color: #0ea5e9; } .kpi-label { font-size: 14px; color: #666; margin-top: 5px; } .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; } @media print { body { padding: 20px; } .section { page-break-inside: avoid; } }</style>
</head><body>
<div class="header"><h1>Cockpit</h1><p>${workspaceName} • ${date}</p></div>
${selectedSections.map(s => sectionTitles[s] ? `<div class="section"><h2>${sectionTitles[s]}</h2><div class="card"><p>—</p></div></div>` : '').join('')}
<div class="footer"><p>Growth OS • ${date}</p></div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <Download className="w-4 h-4 mr-2" />
        {t("cockpit.pdfExportBtn")}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t("cockpit.pdfDialogTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{t("cockpit.pdfSelectSections")}</p>
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox id={section.id} checked={section.checked} onCheckedChange={() => toggleSection(section.id)} />
                  <Label htmlFor={section.id} className="cursor-pointer">{t(section.labelKey)}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t("cockpit.pdfCancel")}</Button>
            <Button variant="hero" onClick={handleExport} disabled={exporting}>
              {exporting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("cockpit.pdfExporting")}</>) : (<><Download className="w-4 h-4 mr-2" />{t("cockpit.pdfExport")}</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
