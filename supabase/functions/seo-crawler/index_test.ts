import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const functionUrl = `${SUPABASE_URL}/functions/v1/seo-crawler`;

Deno.test("SEO Crawler - should reject request without URL", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();
  
  assertEquals(response.status, 400);
  assertEquals(data.success, false);
  assertExists(data.error);
});

Deno.test("SEO Crawler - should block localhost URLs (SSRF protection)", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      url: "http://localhost:8080",
    }),
  });

  const data = await response.json();
  
  assertEquals(response.status, 403);
  assertEquals(data.success, false);
  assertExists(data.error);
});

Deno.test("SEO Crawler - should block private IP addresses (SSRF protection)", async () => {
  const privateUrls = [
    "http://127.0.0.1",
    "http://10.0.0.1",
    "http://192.168.1.1",
    "http://172.16.0.1",
  ];

  for (const url of privateUrls) {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    await response.body?.cancel(); // Consume body
    
    assertEquals(response.status, 403, `Should block ${url}`);
    assertEquals(data.success, false);
  }
});

Deno.test("SEO Crawler - should block metadata endpoints (SSRF protection)", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      url: "http://169.254.169.254/latest/meta-data/",
    }),
  });

  const data = await response.json();
  
  assertEquals(response.status, 403);
  assertEquals(data.success, false);
});

Deno.test("SEO Crawler - should handle OPTIONS request for CORS", async () => {
  const response = await fetch(functionUrl, {
    method: "OPTIONS",
    headers: {
      "Origin": "https://example.com",
    },
  });

  await response.text(); // Consume body
  
  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

Deno.test("SEO Crawler - should accept valid public URL", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      url: "https://example.com",
      max_pages: 1,
      use_firecrawl: false, // Use native crawler for faster test
    }),
  });

  const data = await response.json();
  
  // Should either succeed or have a valid error (not security rejection)
  assertNotEquals(response.status, 403);
  
  if (response.status === 200) {
    assertExists(data.pages_crawled);
    assertExists(data.issues);
    assertExists(data.crawl_method);
  }
});

Deno.test("SEO Crawler - should respect max_pages limit", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      url: "https://example.com",
      max_pages: 2,
      use_firecrawl: false,
    }),
  });

  const data = await response.json();
  
  if (response.status === 200) {
    // Should not exceed max_pages
    assertEquals(data.pages_crawled <= 2, true);
  }
});

Deno.test("SEO Crawler - should include crawl_method in response", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      url: "https://example.com",
      max_pages: 1,
      use_firecrawl: false,
    }),
  });

  const data = await response.json();
  
  if (response.status === 200) {
    assertExists(data.crawl_method);
    assertEquals(["firecrawl", "native"].includes(data.crawl_method), true);
  }
});
