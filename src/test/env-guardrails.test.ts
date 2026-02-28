import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "../..");

function read(rel: string) {
  return fs.readFileSync(path.join(root, rel), "utf-8");
}

describe("Env guardrails – anti-regression", () => {
  it("vite.config.ts must NOT contain a define block", () => {
    const content = read("vite.config.ts");
    expect(content).not.toMatch(/\bdefine\s*:/);
  });

  it(".gitignore must include .env", () => {
    const content = read(".gitignore");
    expect(content).toMatch(/^\.env$/m);
  });

  it("robots.txt must disallow /dashboard/ and /auth", () => {
    const content = read("public/robots.txt");
    expect(content).toContain("Disallow: /dashboard");
    expect(content).toContain("Disallow: /auth");
  });

  it("sitemap.xml must NOT reference /dashboard or /auth", () => {
    const content = read("public/sitemap.xml");
    expect(content).not.toContain("/dashboard");
    expect(content).not.toContain("/auth");
  });

  it("sw.js must contain a versioned cache name", () => {
    const content = read("public/sw.js");
    // Template literal: `growth-os-v${APP_VERSION}` or static growth-os-vX
    expect(content).toMatch(/growth-os-v/);
  });
});
