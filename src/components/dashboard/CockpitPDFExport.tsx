import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportSection {
  id: string;
  label: string;
  checked: boolean;
}

interface CockpitPDFExportProps {
  workspaceName: string;
  onExport?: (sections: string[]) => Promise<void>;
}

export function CockpitPDFExport({ workspaceName, onExport }: CockpitPDFExportProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sections, setSections] = useState<ExportSection[]>([
    { id: "summary", label: "Résumé exécutif", checked: true },
    { id: "health", label: "Score de santé business", checked: true },
    { id: "kpis", label: "KPIs principaux", checked: true },
    { id: "agents", label: "Activité des agents", checked: true },
    { id: "approvals", label: "Approbations en attente", checked: false },
    { id: "actions", label: "Actions prioritaires", checked: true },
    { id: "runs", label: "Historique des runs", checked: false },
  ]);

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s)
    );
  };

  const handleExport = async () => {
    const selectedSections = sections.filter(s => s.checked).map(s => s.id);
    if (selectedSections.length === 0) {
      toast.error("Sélectionnez au moins une section");
      return;
    }

    setExporting(true);

    try {
      if (onExport) {
        await onExport(selectedSections);
      } else {
        // Default export: generate HTML and trigger print
        await generatePDFContent(selectedSections);
      }
      toast.success("Export PDF lancé");
      setShowDialog(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const generatePDFContent = async (selectedSections: string[]) => {
    const date = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cockpit Exécutif - ${workspaceName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.5;
    }
    .header { 
      border-bottom: 2px solid #0ea5e9;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 28px; color: #0ea5e9; }
    .header p { color: #666; margin-top: 5px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section h2 { 
      font-size: 18px; 
      color: #333;
      border-left: 4px solid #0ea5e9;
      padding-left: 12px;
      margin-bottom: 15px;
    }
    .card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .kpi-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 16px;
    }
    .kpi-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .kpi-value { font-size: 32px; font-weight: bold; color: #0ea5e9; }
    .kpi-label { font-size: 14px; color: #666; margin-top: 5px; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Cockpit Exécutif</h1>
    <p>${workspaceName} • ${date}</p>
  </div>

  ${selectedSections.includes('summary') ? `
  <div class="section">
    <h2>Résumé Exécutif</h2>
    <div class="card">
      <p>Ce rapport présente l'état actuel de votre business selon les données collectées par Growth OS.</p>
    </div>
  </div>
  ` : ''}

  ${selectedSections.includes('health') ? `
  <div class="section">
    <h2>Score de Santé Business</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">—</div>
        <div class="kpi-label">Score Global</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">—</div>
        <div class="kpi-label">Tendance</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">—</div>
        <div class="kpi-label">Croissance</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${selectedSections.includes('kpis') ? `
  <div class="section">
    <h2>KPIs Principaux</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">—</div>
        <div class="kpi-label">Revenus</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">—</div>
        <div class="kpi-label">Trafic</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">—</div>
        <div class="kpi-label">Conversion</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${selectedSections.includes('agents') ? `
  <div class="section">
    <h2>Activité des Agents IA</h2>
    <div class="card">
      <p>Les agents IA ont exécuté — tâches cette semaine avec un taux de succès de —%.</p>
    </div>
  </div>
  ` : ''}

  ${selectedSections.includes('actions') ? `
  <div class="section">
    <h2>Actions Prioritaires</h2>
    <div class="card">
      <p>Aucune action prioritaire en attente.</p>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Généré par Growth OS • ${date}</p>
  </div>
</body>
</html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <Download className="w-4 h-4 mr-2" />
        Export PDF
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Exporter le Cockpit en PDF
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les sections à inclure dans l'export :
            </p>
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={section.checked}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label htmlFor={section.id} className="cursor-pointer">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button variant="hero" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
