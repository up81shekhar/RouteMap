const SITE_URL = "https://routemap-free.vercel.app";
const STATIC_PAGES = ["", "/roadmaps", "/about", "/contact", "/privacy", "/terms", "/copyright"];

function fallbackXml() {
  const urls = STATIC_PAGES.map(
    (p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <priority>${p === "" ? "1.0" : "0.6"}</priority>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export default async function handler(req, res) {
  const apiBase = process.env.VITE_API_BASE_URL || "https://routemap-8k8a.onrender.com/api";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // don't hang if the backend is cold-starting

    const upstream = await fetch(`${apiBase}/sitemap.xml`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const xml = await upstream.text();

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch {
    // Backend unreachable or cold — still return valid XML (just the static
    // pages) rather than an error, so crawlers never see a broken sitemap.
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=300"); // retry sooner since this is a fallback
    res.status(200).send(fallbackXml());
  }
}
