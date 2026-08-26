// Generates public/sitemap.xml at BUILD TIME (not on every request).
// Runs before `vite build` so Google always gets a complete, correct sitemap
// without depending on the Render backend being awake at crawl time.

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "public", "sitemap.xml");

const SITE_URL = "https://routemap-free.vercel.app";
const STATIC_PAGES = ["", "/roadmaps", "/about", "/contact", "/privacy", "/terms", "/copyright"];
const API_BASE = process.env.VITE_API_BASE_URL || "https://routemap-8k8a.onrender.com/api";

function fallbackXml() {
  const urls = STATIC_PAGES.map(
    (p) =>
      `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <priority>${p === "" ? "1.0" : "0.6"}</priority>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`upstream responded ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const RETRIES = 3;
  // Generous timeouts + retries: at build time we can afford to wait for a
  // cold Render instance to wake up (unlike the old 8s runtime fetch).
  const TIMEOUTS_MS = [15000, 30000, 45000];

  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      console.log(`[sitemap] fetching from backend (attempt ${attempt + 1}/${RETRIES})...`);
      const xml = await fetchWithTimeout(`${API_BASE}/sitemap.xml`, TIMEOUTS_MS[attempt]);
      writeFileSync(OUT_PATH, xml, "utf-8");
      console.log(`[sitemap] wrote full sitemap from backend to ${OUT_PATH}`);
      return;
    } catch (err) {
      console.warn(`[sitemap] attempt ${attempt + 1} failed: ${err.message}`);
    }
  }

  // All retries failed — never fail the build. Write the static fallback so
  // at least the core pages stay in the sitemap.
  console.warn("[sitemap] all attempts failed, writing static fallback sitemap");
  writeFileSync(OUT_PATH, fallbackXml(), "utf-8");
}

main();
