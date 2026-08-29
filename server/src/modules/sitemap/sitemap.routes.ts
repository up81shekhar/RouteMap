import { Router, Request, Response } from "express";
import { Roadmap } from "../../models/Roadmap.js";
import { RoadmapNode } from "../../models/RoadmapNode.js";
import { Note } from "../../models/Note.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const SITE_URL = "https://routemap-free.vercel.app";
const STATIC_PAGES = ["", "/roadmaps", "/notes", "/about", "/contact", "/privacy", "/terms", "/copyright"];

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const [roadmaps, nodes, notes] = await Promise.all([
      Roadmap.find({ isPublished: true }).select("slug"),
      RoadmapNode.find({ isPublished: true }).select("roadmapSlug slug"),
      Note.find({ isPublished: true }).select("slug"),
    ]);

    const urls: { loc: string; priority: string }[] = STATIC_PAGES.map((p) => ({
      loc: `${SITE_URL}${p}`,
      priority: p === "" ? "1.0" : "0.6",
    }));

    for (const r of roadmaps) urls.push({ loc: `${SITE_URL}/roadmaps/${r.slug}`, priority: "0.8" });
    for (const n of nodes) urls.push({ loc: `${SITE_URL}/roadmaps/${n.roadmapSlug}/${n.slug}`, priority: "0.7" });
    for (const note of notes) urls.push({ loc: `${SITE_URL}/notes/${note.slug}`, priority: "0.7" });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`)
      .join("\n")}\n</urlset>\n`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600"); // re-crawled at most hourly, backend does the real work
    res.send(xml);
  })
);

export default router;
