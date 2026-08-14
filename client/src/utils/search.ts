import { AdminRoadmap } from "../store/adminStore";

// A few common expansions so "linked list" also surfaces "singly/doubly/circular
// linked list" style topic titles, per the search behavior described in the PRD.
const SYNONYMS: Record<string, string[]> = {
  "linked list": ["singly linked list", "doubly linked list", "circular linked list", "linked list"],
  dsa: ["data structures", "algorithms", "data structures & algorithms"],
  js: ["javascript"],
  oop: ["object oriented", "object-oriented programming"],
  db: ["database", "databases", "sql"],
};

function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();
  const terms = new Set([lower]);
  for (const [key, expansions] of Object.entries(SYNONYMS)) {
    if (lower.includes(key)) expansions.forEach((e) => terms.add(e));
  }
  return Array.from(terms);
}

export type LocalTopicMatch = { roadmapSlug: string; roadmapTitle: string; slug: string; title: string; estimatedHours: number };

export function localSearch(query: string, roadmaps: AdminRoadmap[]) {
  const terms = expandQuery(query);
  const matches = (text: string) => terms.some((t) => text.toLowerCase().includes(t));

  const matchedRoadmaps = roadmaps.filter((r) => r.isPublished && (matches(r.title) || matches(r.description)));

  const matchedTopics: LocalTopicMatch[] = [];
  for (const r of roadmaps) {
    if (!r.isPublished) continue;
    for (const n of r.nodes) {
      if (matches(n.title)) {
        matchedTopics.push({ roadmapSlug: r.slug, roadmapTitle: r.title, slug: n.slug, title: n.title, estimatedHours: n.estimatedHours });
      }
    }
  }

  return { roadmaps: matchedRoadmaps, topics: matchedTopics.slice(0, 15) };
}
