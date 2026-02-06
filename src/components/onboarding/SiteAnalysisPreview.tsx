import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, Search, BarChart3, Share2, Code, CheckCircle2, XCircle, 
  Loader2, FileText, Link2, Sparkles 
} from "lucide-react";

export interface SiteAnalysis {
  title?: string | null;
  description?: string | null;
  h1?: string | null;
  wordCount?: number;
  internalLinksCount?: number;
  totalLinksCount?: number;
  techStack?: string[];
  socialLinks?: string[];
  hasAnalytics?: boolean;
  hasMetaPixel?: boolean;
  detectedCMS?: string | null;
  language?: string | null;
  favicon?: string | null;
  ogImage?: string | null;
}

interface SiteAnalysisPreviewProps {
  analysis: SiteAnalysis | null;
  isLoading: boolean;
  url: string;
}

export function SiteAnalysisPreview({ analysis, isLoading, url }: SiteAnalysisPreviewProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">{t("onboardingFlow.analyzingSite")}</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted/50 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const signals = [
    { 
      icon: FileText, 
      label: analysis.title || t("onboardingFlow.noTitleDetected"),
      ok: !!analysis.title 
    },
    { 
      icon: Search, 
      label: analysis.description 
        ? `${analysis.description.slice(0, 80)}${analysis.description.length > 80 ? "…" : ""}` 
        : t("onboardingFlow.noMetaDescription"),
      ok: !!analysis.description 
    },
    { 
      icon: BarChart3, 
      label: analysis.hasAnalytics ? "Google Analytics" : t("onboardingFlow.noAnalytics"),
      ok: !!analysis.hasAnalytics 
    },
    { 
      icon: Share2, 
      label: analysis.socialLinks && analysis.socialLinks.length > 0 
        ? `${analysis.socialLinks.length} ${t("onboardingFlow.socialProfilesFound")}`
        : t("onboardingFlow.noSocialProfiles"),
      ok: (analysis.socialLinks?.length ?? 0) > 0 
    },
  ];

  return (
    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">{t("onboardingFlow.instantAnalysis")}</span>
        </div>
        {analysis.detectedCMS && (
          <Badge variant="secondary" className="text-xs">
            <Code className="w-3 h-3 mr-1" />
            {analysis.detectedCMS}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {signals.map((signal, i) => {
          const Icon = signal.icon;
          return (
            <div key={i} className="flex items-start gap-2">
              {signal.ok ? (
                <CheckCircle2 className="w-4 h-4 text-chart-3 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm text-muted-foreground">{signal.label}</span>
            </div>
          );
        })}
      </div>

      {analysis.wordCount && analysis.wordCount > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-primary/10">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {analysis.wordCount.toLocaleString()} {t("onboardingFlow.words")}
          </span>
          {analysis.internalLinksCount !== undefined && (
            <span className="flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              {analysis.internalLinksCount} {t("onboardingFlow.internalLinks")}
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground italic">
        {t("onboardingFlow.connectForMore")}
      </p>
    </div>
  );
}
