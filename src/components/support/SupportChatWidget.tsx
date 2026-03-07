import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";

// Tawk.to widget configuration
const TAWK_PROPERTY_ID = "";

export function SupportChatWidget() {
  const { t } = useTranslation();

  useEffect(() => {
    if (!TAWK_PROPERTY_ID) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/default`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      const tawkWidget = document.getElementById("tawk-widget");
      if (tawkWidget) tawkWidget.remove();
    };
  }, []);

  return (
    <a
      href="mailto:contact@emotionscare.com?subject=Demande de support Growth OS"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
      title={t("support.contactSupport", "Contactez le support")}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline text-sm font-medium">{t("support.help", "Aide")}</span>
    </a>
  );
}

// Simple support link component for footers
export function SupportLink({ className }: { className?: string }) {
  return (
    <a
      href="mailto:contact@emotionscare.com?subject=Demande de support Growth OS"
      className={className || "text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
      Besoin d'aide ? Contactez-nous
    </a>
  );
}
