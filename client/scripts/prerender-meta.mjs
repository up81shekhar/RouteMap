// Generates a real, static index.html per known route (home, /roadmaps,
// each roadmap, each topic) with the CORRECT <title>, description, and
// OG/canonical tags baked in — not injected by client JS after mount.
//
// Why: crawlers that don't execute JS (WhatsApp, Twitter, LinkedIn, Slack
// previews, and some search engines) only ever see the raw HTML. Without
// this, every shared link showed the generic homepage title/description.
//
// How it works: Vercel serves an existing static file at an exact path
// BEFORE applying the SPA catch-all rewrite (same mechanism sitemap.xml
// relies on). So dist/roadmaps/dsa/index.html is served directly for a
// request to /roadmaps/dsa, with the right meta tags already in place.
// React still mounts and takes over normally after that — this only
// changes what's in the initial HTML, not how the app behaves once loaded.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const TEMPLATE_PATH = join(DIST_DIR, "index.html");
const SITE_URL = "https://routemap-free.vercel.app";
const API_BASE = process.env.VITE_API_BASE_URL || "https://routemap-8k8a.onrender.com/api";

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderPage(template, { title, description, path, noindex }) {
  const fullTitle = `${title} | RouteMap`;
  const canonical = `${SITE_URL}${path}`;
  let html = template;
  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(fullTitle)}</title>`);
  html = html.replace(/<meta name="description"[^>]*\/?>\n?/, "");
  html = html.replace(/<link rel="canonical"[^>]*\/?>\n?/, "");
  const inject = noindex
    ? // Private/gated pages: allow the crawl (robots.txt no longer blocks
      // these) but tell it plainly not to index this one, right in the
      // static HTML — no JS execution required to see this tag.
      `    <meta name="robots" content="noindex, nofollow" />\n` +
      `    <link rel="canonical" href="${canonical}" />\n`
    : `    <meta name="description" content="${escapeHtml(description)}" />\n` +
      `    <meta property="og:title" content="${escapeHtml(fullTitle)}" />\n` +
      `    <meta property="og:description" content="${escapeHtml(description)}" />\n` +
      `    <meta property="og:url" content="${canonical}" />\n` +
      `    <link rel="canonical" href="${canonical}" />\n`;
  html = html.replace("</head>", `${inject}  </head>`);
  return html;
}

function writePage(routePath, html) {
  const outDir = routePath === "/" ? DIST_DIR : join(DIST_DIR, routePath.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf-8");
}

async function fetchJson(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const NOINDEX_ROUTES = ["/dashboard", "/login", "/signup", "/forgot-password", "/reset-password"];

async function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    console.warn("[prerender-meta] dist/index.html not found — run this after `vite build`. Skipping.");
    return;
  }
  const template = readFileSync(TEMPLATE_PATH, "utf-8");

  // Private/gated pages — robots.txt now allows crawling them, so this
  // static noindex tag is what actually keeps them out of search results
  // (fixes the "indexed, though blocked by robots.txt" Search Console issue).
  for (const path of NOINDEX_ROUTES) {
    writePage(path, renderPage(template, { title: "RouteMap", description: "", path, noindex: true }));
  }

  writePage(
    "/roadmaps",
    renderPage(template, {
      title: "All Roadmaps",
      description:
        "Browse every free, structured learning roadmap on RouteMap — curated free YouTube and article resources, organized station by station.",
      path: "/roadmaps",
    })
  );

  writePage(
    "/notes",
    renderPage(template, {
      title: "Free Notes Library",
      description:
        "Free study notes for exams, coding, and school subjects — typed notes and downloadable PDFs, all free on RouteMap.",
      path: "/notes",
    })
  );

  try {
    const { notes } = await fetchJson(`${API_BASE}/notes`);
    for (const note of notes ?? []) {
      const notePath = `/notes/${note.slug}`;
      writePage(notePath, renderPage(template, { title: note.title, description: note.description, path: notePath }));
    }
  } catch (err) {
    console.warn(`[prerender-meta] couldn't fetch notes, skipping per-note meta: ${err.message}`);
  }

  let roadmaps = [];
  try {
    const data = await fetchJson(`${API_BASE}/roadmaps`);
    roadmaps = data.roadmaps ?? [];
  } catch (err) {
    console.warn(`[prerender-meta] couldn't fetch roadmap list, skipping per-page meta: ${err.message}`);
    return;
  }

  let pageCount = 1;
  for (const r of roadmaps) {
    if (!r.isPublished) continue;
    const roadmapPath = `/roadmaps/${r.slug}`;
    const roadmapDescription = `${r.description} A free, structured ${r.title} roadmap — ~${r.estimatedDurationHours} hours, curated free resources at every step.`;
    writePage(roadmapPath, renderPage(template, { title: r.title, description: roadmapDescription, path: roadmapPath }));
    pageCount++;

    try {
      const detail = await fetchJson(`${API_BASE}/roadmaps/${r.slug}`);
      for (const node of detail.nodes ?? []) {
        if (!node.isPublished) continue;
        const topicPath = `${roadmapPath}/${node.slug}`;
        const topicDescription = `Learn ${node.title} as part of the free ${r.title} roadmap on RouteMap — curated videos, articles, and practice, all free.`;
        writePage(topicPath, renderPage(template, { title: `${node.title} — ${r.title}`, description: topicDescription, path: topicPath }));
        pageCount++;
      }
    } catch (err) {
      console.warn(`[prerender-meta] couldn't fetch nodes for ${r.slug}: ${err.message}`);
    }
  }

  console.log(`[prerender-meta] wrote ${pageCount} pages with real per-page meta tags`);
}

main();
