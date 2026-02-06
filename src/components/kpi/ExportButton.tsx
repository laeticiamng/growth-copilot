import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
}

export function ExportButton({ data, filename, label }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const displayLabel = label ?? t("common.export");

  const exportCSV = () => {
    if (data.length === 0) {
      toast({ title: t("components.exportButton.noData"), variant: "destructive" });
      return;
    }

    setExporting(true);
    try {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        )
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${filename}.csv`);
      toast({ title: t("components.exportButton.csvSuccess") });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({ title: t("components.exportButton.exportError"), variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const exportJSON = () => {
    if (data.length === 0) {
      toast({ title: t("components.exportButton.noData"), variant: "destructive" });
      return;
    }

    setExporting(true);
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `${filename}.json`);
      toast({ title: t("components.exportButton.jsonSuccess") });
    } catch (error) {
      console.error('JSON export error:', error);
      toast({ title: t("components.exportButton.exportError"), variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {displayLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {t("components.exportButton.exportCsv")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          {t("components.exportButton.exportJson")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
