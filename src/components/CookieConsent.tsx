import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "cookie_consent";

export function useCookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === null ? null : stored === "true";
  });

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setConsent(true);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "false");
    setConsent(false);
  };

  return { consent, accept, decline, isDecided: consent !== null };
}

export function CookieConsent() {
  const { t } = useTranslation();
  const { consent, accept, decline, isDecided } = useCookieConsent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDecided) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isDecided]);

  if (isDecided || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-muted-foreground flex-1">
            {t("cookies.message")}{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">
              {t("cookies.learnMore")}
            </a>
          </p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={decline}>
              {t("cookies.decline")}
            </Button>
            <Button variant="default" size="sm" onClick={accept}>
              {t("cookies.accept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
