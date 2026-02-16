import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Syncs the i18next active language to the <html lang> attribute.
 * This ensures search engines and screen readers detect the correct language.
 */
export function useLanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
}
