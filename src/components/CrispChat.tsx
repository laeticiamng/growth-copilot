import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

// Crisp global type declaration
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

const CRISP_WEBSITE_ID = import.meta.env.VITE_CRISP_WEBSITE_ID;

/**
 * CrispChat component
 * Loads Crisp chat widget asynchronously in production only
 * Passes user email/name if authenticated
 */
export function CrispChat() {
  const { user } = useAuth();

  useEffect(() => {
    // Only load in production and if CRISP_WEBSITE_ID is configured
    if (!CRISP_WEBSITE_ID) {
      if (import.meta.env.DEV) {
        console.info("[Crisp] Website ID not configured - chat widget disabled");
      }
      return;
    }

    // Skip in development/preview unless explicitly enabled
    if (import.meta.env.DEV) {
      console.info("[Crisp] Skipping in development mode");
      return;
    }

    // Initialize Crisp
    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    // Load script asynchronously
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      // Remove script if component unmounts
      const existingScript = document.querySelector(
        'script[src="https://client.crisp.chat/l.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Update user info when auth state changes
  useEffect(() => {
    if (!CRISP_WEBSITE_ID || import.meta.env.DEV) return;
    if (!window.$crisp) return;

    if (user?.email) {
      window.$crisp.push(["set", "user:email", [user.email]]);
      
      const displayName = user.user_metadata?.full_name || user.email.split("@")[0];
      window.$crisp.push(["set", "user:nickname", [displayName]]);
    } else {
      // Reset user data on logout
      window.$crisp.push(["do", "session:reset"]);
    }
  }, [user?.email, user?.user_metadata?.full_name]);

  // This component doesn't render anything
  return null;
}
