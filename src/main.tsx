// Growth OS - Entry Point
import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

// Initialize Sentry BEFORE React renders
import { initSentry } from "./lib/sentry";
initSentry();

import App from "./App.tsx";
import "./index.css";
import "./i18n";

const isPlaceholderMode = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');
import { StartupError } from "@/components/system/StartupError";

const rootEl = document.getElementById("root");

// In production, block startup if Supabase env vars are placeholder/missing
if (import.meta.env.PROD && isPlaceholderMode) {
  console.error("[Growth OS] Placeholder Supabase URL detected in production. Blocking startup.");
  createRoot(rootEl!).render(
    <React.StrictMode>
      <StartupError reason="VITE_SUPABASE_URL is missing or set to placeholder. Configure environment variables for production." />
    </React.StrictMode>
  );
} else {
  try {
    createRoot(rootEl!).render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    );
  } catch (err) {
    console.error("[Growth OS] Fatal startup error:", err);
    createRoot(rootEl!).render(
      <React.StrictMode>
        <StartupError reason={err instanceof Error ? err.message : String(err)} />
      </React.StrictMode>
    );
  }
}
