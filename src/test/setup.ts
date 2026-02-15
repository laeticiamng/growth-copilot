import "@testing-library/jest-dom";

// Provide default Supabase env vars for tests (prevents "supabaseUrl is required" errors)
if (!import.meta.env.VITE_SUPABASE_URL) {
  // @ts-expect-error — assign env for test environment
  import.meta.env.VITE_SUPABASE_URL = "https://test-project.supabase.co";
}
if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  // @ts-expect-error — assign env for test environment
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = "eyJ0ZXN0IjoidGVzdCJ9.eyJ0ZXN0IjoidGVzdCJ9.test";
}
if (!import.meta.env.VITE_SUPABASE_PROJECT_ID) {
  // @ts-expect-error — assign env for test environment
  import.meta.env.VITE_SUPABASE_PROJECT_ID = "test-project";
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
