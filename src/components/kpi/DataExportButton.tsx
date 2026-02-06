import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileJson, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type ExportFormat = "csv" | "json" | "xlsx";

interface DataExportButtonProps {
  data: Record<string, unknown>[] | (() => Promise<Record<string, unknown>[]>);
  filename?: string;
  formats?: ExportFormat[];
  onExport?: (format: ExportFormat) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function DataExportButton({ data, filename = "export", formats = ["csv", "json"], onExport, variant = "outline", size = "sm" }: DataExportButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);

  const convertToCSV = (records: Record<string, unknown>[]) => {
    if (records.length === 0) return "";
    const headers = Object.keys(records[0]);
    const csvRows = [
      headers.join(","),
      ...records.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value === null || value === undefined ? "" : String(value);
          if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(",")
      )
    ];
    return csvRows.join("\n");
  };

  const downloadFile = (content: string, mimeType: string, extension: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportedFormat(null);
    
    try {
      const records = typeof data === "function" ? await data() : data;
      
      if (!records || records.length === 0) {
        toast.error(t("components.dataExport.noData"));
        return;
      }

      switch (format) {
        case "csv":
          downloadFile(convertToCSV(records), "text/csv;charset=utf-8;", "csv");
          break;
        case "json":
          downloadFile(JSON.stringify(records, null, 2), "application/json", "json");
          break;
        case "xlsx":
          toast.info(t("components.dataExport.xlsxFallback"));
          downloadFile(convertToCSV(records), "text/csv;charset=utf-8;", "csv");
          break;
      }

      setExportedFormat(format);
      toast.success(t("components.dataExport.exportSuccess", { format: format.toUpperCase() }));
      onExport?.(format);
      setTimeout(() => setExportedFormat(null), 2000);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("components.dataExport.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case "csv": return <FileSpreadsheet className="w-4 h-4 mr-2" />;
      case "json": return <FileJson className="w-4 h-4 mr-2" />;
      case "xlsx": return <FileSpreadsheet className="w-4 h-4 mr-2" />;
      default: return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  const getFormatLabel = (format: ExportFormat): string => {
    switch (format) {
      case "csv": return "CSV (Excel compatible)";
      case "json": return "JSON";
      case "xlsx": return "Excel (.xlsx)";
    }
  };

  if (formats.length === 1) {
    return (
      <Button variant={variant} size={size} onClick={() => handleExport(formats[0])} disabled={isExporting}>
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : exportedFormat ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Download className="w-4 h-4 mr-2" />}
        {t("common.export")}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : exportedFormat ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Download className="w-4 h-4 mr-2" />}
          {t("common.export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("components.dataExport.exportFormat")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((format) => (
          <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
            {getFormatIcon(format)}
            {getFormatLabel(format)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
