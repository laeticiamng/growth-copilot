const sharp = require("sharp");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

const BG_DARK = "#0a0a0f";
const PURPLE = "#8b5cf6";
const PURPLE_LIGHT = "#a78bfa";

function createSVG(size, maskable) {
  const padding = maskable ? size * 0.1 : 0;
  const contentSize = size - padding * 2;
  const fontSize = Math.round(contentSize * 0.36);
  const centerX = size / 2;
  const centerY = size / 2;
  const rx = maskable ? 0 : Math.round(size * 0.15);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0a1a"/>
      <stop offset="100%" style="stop-color:${BG_DARK}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PURPLE_LIGHT}"/>
      <stop offset="100%" style="stop-color:${PURPLE}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${size * 0.015}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>
  <circle cx="${centerX}" cy="${centerY}" r="${contentSize * 0.32}" fill="${PURPLE}" opacity="0.12"/>
  <text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${fontSize}px" letter-spacing="${Math.round(fontSize * 0.08)}px" fill="url(#accent)" filter="url(#glow)">GO</text>
  <rect x="${centerX - contentSize * 0.2}" y="${centerY + fontSize * 0.55}" width="${contentSize * 0.4}" height="${Math.max(2, size * 0.012)}" rx="${Math.max(1, size * 0.006)}" fill="${PURPLE}" opacity="0.7"/>
</svg>`;
}

async function generateIcon(size, maskable, filename) {
  const svg = createSVG(size, maskable);
  const outputPath = path.join(ICONS_DIR, filename);
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log("Created: " + filename + " (" + size + "x" + size + (maskable ? ", maskable" : "") + ")");
}

async function main() {
  await Promise.all([
    generateIcon(192, false, "icon-192.png"),
    generateIcon(512, false, "icon-512.png"),
    generateIcon(192, true, "icon-maskable-192.png"),
    generateIcon(512, true, "icon-maskable-512.png"),
  ]);
  console.log("All icons generated successfully.");
}

main();
