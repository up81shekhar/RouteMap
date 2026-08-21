// Runs before `vite build` (see package.json "prebuild" script) so
// public/sitemap.xml is regenerated on every deploy and gets copied
// into dist/ automatically by Vite's static public-folder handling.
//
// The slug list here mirrors client/src/data/sampleRoadmaps.ts and
// server/src/scripts/seed.ts. It's duplicated rather than imported
// because this script runs as plain Node before the TS build step —
// same tradeoff already made for the seed script. If a roadmap is
// added to the catalog, add its slug + node slugs here too so it
// gets indexed. Roadmaps created later via the admin panel (stored
// only in MongoDB) aren't covered by this static list; a dynamic
// server-generated sitemap is the next step for full coverage.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SITE_URL = "https://routemap-free.vercel.app";

const roadmaps = [
  { slug: "dsa", nodes: ["programming-basics", "complexity-analysis", "arrays", "strings", "searching", "sorting", "linked-list", "stack", "queue", "recursion", "trees", "graphs", "dynamic-programming", "interview-problems"] },
  { slug: "full-stack", nodes: ["html-css", "javascript", "git-github", "react", "node-js-express", "databases", "authentication-deployment", "capstone-project"] },
  { slug: "python", nodes: ["python-basics", "data-types-control-flow", "functions-modules", "oop-in-python", "file-handling", "numpy-pandas", "mini-projects"] },
  { slug: "java-backend", nodes: ["java-basics", "oop", "collections", "exception-handling", "jdbc-databases", "spring-boot-basics", "rest-apis", "deployment"] },
  { slug: "react", nodes: ["javascript-essentials", "jsx-components", "props-state", "hooks", "routing", "state-management", "api-integration", "project"] },
  { slug: "sql", nodes: ["sql-basics", "joins", "aggregation", "subqueries", "indexes-performance", "practice-problems"] },
  { slug: "git-github", nodes: ["git-basics", "branching-merging", "remote-repositories", "pull-requests", "collaboration-workflow"] },
  { slug: "aptitude-reasoning", nodes: ["number-system", "percentages-ratios", "time-work", "logical-reasoning", "verbal-reasoning", "data-interpretation", "mock-tests"] },
  { slug: "ssc-banking", nodes: ["quant-foundations", "reasoning", "english-language", "general-awareness", "banking-awareness", "previous-year-papers", "mock-tests"] },
  { slug: "gk-current-affairs", nodes: ["static-gk", "monthly-current-affairs", "government-schemes", "sports-awards", "science-tech-updates", "revision-capsules"] },
  { slug: "placement-prep", nodes: ["resume-building", "aptitude-refresher", "coding-round-prep", "group-discussion", "hr-interview", "company-wise-prep"] },
  { slug: "physics-11-12", nodes: ["units-measurements", "kinematics", "laws-of-motion", "work-energy-power", "electrostatics", "current-electricity", "optics", "modern-physics"] },
  { slug: "chemistry-11-12", nodes: ["atomic-structure", "chemical-bonding", "states-of-matter", "thermodynamics", "equilibrium", "organic-chemistry-basics", "periodic-table-trends"] },
  { slug: "maths-11-12", nodes: ["sets-functions", "trigonometry", "algebra", "coordinate-geometry", "calculus-basics", "probability", "vectors-3d"] },
  { slug: "english-communication", nodes: ["grammar-basics", "vocabulary-building", "reading-comprehension", "spoken-english", "interview-communication", "email-writing-skills"] },
];

const staticPages = ["/", "/roadmaps", "/about", "/contact", "/privacy", "/terms", "/copyright"];

const urls = [];
for (const page of staticPages) {
  urls.push({ loc: `${SITE_URL}${page}`, priority: page === "/" ? "1.0" : "0.6" });
}
for (const r of roadmaps) {
  urls.push({ loc: `${SITE_URL}/roadmaps/${r.slug}`, priority: "0.8" });
  for (const node of r.nodes) {
    urls.push({ loc: `${SITE_URL}/roadmaps/${r.slug}/${node}`, priority: "0.7" });
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>
`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "public", "sitemap.xml");
writeFileSync(outPath, xml);
console.log(`✅ sitemap.xml generated with ${urls.length} URLs → ${outPath}`);
