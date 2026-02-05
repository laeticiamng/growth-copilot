// Growth OS - Entry Point
import React from "react";
import { createRoot } from "react-dom/client";

// Initialize Sentry BEFORE React renders
import { initSentry } from "./lib/sentry";
initSentry();

import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
