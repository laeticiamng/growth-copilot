/**
 * SEO Head Component - Dynamic meta tags for each page
 * Supports dynamic locale and hreflang for i18n
 */
import { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const LOCALE_MAP: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  de: "de_DE",
};

const SUPPORTED_LANGS = ["fr", "en", "es", "de"];

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  noindex = false,
  structuredData,
}: SEOHeadProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || "fr";
  const ogLocale = LOCALE_MAP[lang] || "fr_FR";
  const fullTitle = title.includes("Growth OS") ? title : `${title} | Growth OS`;
  const baseUrl = "https://www.agent-growth-automator.com";
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : undefined;

  useEffect(() => {
    const htmlEl = document.getElementById("html-root");
    if (htmlEl) {
      htmlEl.setAttribute("lang", lang);
    }
  }, [lang]);

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang alternates for SEO */}
      {canonicalUrl && SUPPORTED_LANGS.map((lng) => (
        <link key={lng} rel="alternate" hrefLang={lng} href={`${baseUrl}${canonical}`} />
      ))}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${canonical}`} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content="Growth OS" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export { HelmetProvider };
