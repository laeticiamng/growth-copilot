import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Only bundle fallback language synchronously — others are lazy-loaded
import { fr } from "./locales/fr";

const lazyResources: Record<string, () => Promise<Record<string, unknown>>> = {
  en: () => import("./locales/en").then(m => m.en as Record<string, unknown>),
  es: () => import("./locales/es").then(m => m.es as Record<string, unknown>),
  de: () => import("./locales/de").then(m => m.de as Record<string, unknown>),
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
    },
    partialBundledLanguages: true,
    fallbackLng: "fr",
    supportedLngs: ["fr", "en", "es", "de"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

// Lazy-load the detected language if not French
const detectedLng = i18n.language?.split("-")[0];
if (detectedLng && detectedLng !== "fr" && lazyResources[detectedLng]) {
  lazyResources[detectedLng]().then((translations) => {
    i18n.addResourceBundle(detectedLng, "translation", translations, true, true);
  });
}

// Lazy-load on language switch
i18n.on("languageChanged", (lng) => {
  const baseLng = lng.split("-")[0];
  if (baseLng !== "fr" && lazyResources[baseLng] && !i18n.hasResourceBundle(baseLng, "translation")) {
    lazyResources[baseLng]().then((translations) => {
      i18n.addResourceBundle(baseLng, "translation", translations, true, true);
    });
  }
});

export default i18n;
