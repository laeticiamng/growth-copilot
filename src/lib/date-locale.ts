import { fr, enUS, es, de, it, pt, nl, type Locale } from "date-fns/locale";

export const dateLocaleMap: Record<string, Locale> = { fr, en: enUS, es, de, it, pt, nl };

export const getDateLocale = (lang: string): Locale => dateLocaleMap[lang] || enUS;

const intlLocaleMap: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
};

export const getIntlLocale = (lang: string): string => intlLocaleMap[lang] || "en-US";
