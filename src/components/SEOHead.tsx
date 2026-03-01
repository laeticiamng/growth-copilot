/**
 * SEO Head Component - Dynamic meta tags for each page
 */
import { Helmet, HelmetProvider } from "react-helmet-async";

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
  ogImage = "https://www.agent-growth-automator.com/og-image.png",
  noindex = false,
  structuredData,
}: SEOHeadProps) {
  const fullTitle = title.includes("Growth OS") ? title : `${title} | Growth OS`;
  const baseUrl = "https://www.agent-growth-automator.com";
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : undefined;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Growth OS" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Hreflang */}
      {canonicalUrl && (
        <>
          <link rel="alternate" hrefLang="fr" href={canonicalUrl} />
          <link rel="alternate" hrefLang="en" href={canonicalUrl} />
          <link rel="alternate" hrefLang="es" href={canonicalUrl} />
          <link rel="alternate" hrefLang="de" href={canonicalUrl} />
          <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        </>
      )}

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
