import "@testing-library/jest-dom";

// Provide default Supabase env vars for tests (prevents "supabaseUrl is required" errors)
if (!import.meta.env.VITE_SUPABASE_URL) {
  (import.meta.env as Record<string, string>).VITE_SUPABASE_URL = "https://test-project.supabase.co";
}
if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  (import.meta.env as Record<string, string>).VITE_SUPABASE_PUBLISHABLE_KEY = "eyJ0ZXN0IjoidGVzdCJ9.eyJ0ZXN0IjoidGVzdCJ9.test";
}
if (!import.meta.env.VITE_SUPABASE_PROJECT_ID) {
  (import.meta.env as Record<string, string>).VITE_SUPABASE_PROJECT_ID = "test-project";
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
