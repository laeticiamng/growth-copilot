/**
 * Bilingual (FR/EN) startup error screen displayed when
 * Supabase environment variables are missing or still set to placeholder values.
 */
export function StartupError({ reason }: { reason: string }) {
  const isFr =
    typeof navigator !== "undefined" &&
    navigator.language?.startsWith("fr");

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
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          {isFr ? "Erreur de configuration" : "Configuration Error"}
        </h1>
        <p style={{ color: "#a3a3a3", marginBottom: "1.5rem" }}>
          {isFr
            ? "Les variables d'environnement backend sont manquantes ou invalides. Vérifiez votre configuration et rechargez la page."
            : "Backend environment variables are missing or invalid. Please check your configuration and reload."}
        </p>
        <pre
          style={{
            background: "#1a1a1a",
            padding: "1rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            overflowX: "auto",
            textAlign: "left",
            color: "#ef4444",
          }}
        >
          {reason}
        </pre>
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
          {isFr ? "Recharger" : "Reload"}
        </button>
      </div>
    </div>
  );
}
