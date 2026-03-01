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

const rootEl = document.getElementById("root");

try {
  createRoot(rootEl!).render(
    <React.StrictMode>
      <HelmetProvider>
        <><App /></>
      </HelmetProvider>
    </React.StrictMode>
  );
} catch (err) {
  // Safety net: if React fails to mount (missing deps, syntax error, etc.)
  // show a user-friendly message instead of a blank screen
  console.error("[Growth OS] Fatal startup error:", err);
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:2rem">
        <div style="max-width:480px;text-align:center">
          <h1 style="font-size:1.5rem;margin-bottom:1rem">Erreur de démarrage</h1>
          <p style="color:#a3a3a3;margin-bottom:1.5rem">L'application n'a pas pu se charger. Vérifiez votre configuration et rechargez la page.</p>
          <pre style="background:#1a1a1a;padding:1rem;border-radius:0.5rem;font-size:0.75rem;overflow-x:auto;text-align:left;color:#ef4444">${
            err instanceof Error ? err.message : String(err)
          }</pre>
          <button onclick="location.reload()" style="margin-top:1.5rem;padding:0.5rem 1.5rem;background:#3b82f6;color:white;border:none;border-radius:0.375rem;cursor:pointer;font-size:0.875rem">
            Recharger
          </button>
        </div>
      </div>`;
  }
}
