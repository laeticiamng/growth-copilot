import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

/**
 * Runtime guard that blocks the entire UI if Supabase environment
 * variables are missing (placeholder.supabase.co fallback detected).
 * Prevents silent network failures and confusing blank screens.
 */
export function EnvGuard({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        background: "#0a0a0a",
        color: "#e5e5e5",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>

        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Configuration backend manquante
        </h1>
        <p style={{ color: "#a3a3a3", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Les variables d'environnement <code>VITE_SUPABASE_URL</code> et{" "}
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> ne sont pas définies.
          L'application ne peut pas se connecter au backend.
        </p>

        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "1.5rem 0" }} />

        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          Backend configuration missing
        </h2>
        <p style={{ color: "#a3a3a3", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          The environment variables <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> are not set.
          The application cannot connect to the backend.
        </p>

        <div
          style={{
            background: "#1a1a1a",
            padding: "1rem",
            borderRadius: "0.5rem",
            fontSize: "0.8rem",
            textAlign: "left",
            color: "#facc15",
            lineHeight: 1.6,
          }}
        >
          <strong>En production Lovable Cloud</strong>, ces variables sont injectées
          automatiquement.
          <br />
          <strong>En local</strong>, créez un fichier <code>.env</code> à la racine
          du projet avec les valeurs de votre projet.
        </div>

        <button
          onClick={() => location.reload()}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1.5rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Recharger / Reload
        </button>
      </div>
    </div>
  );
}
