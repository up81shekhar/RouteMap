import { create } from "zustand";
import {
  roadmapsCatalog,
  curatedTopics,
  RoadmapDetailData,
  RoadmapNodeData,
  ResourceData,
  LineColor,
  RoadmapCategory,
} from "../data/sampleRoadmaps";
import * as roadmapsApi from "../api/roadmaps";
import * as adminApi from "../api/admin";
import { ApiUnreachableError } from "../api/client";
import { useAuthStore } from "./authStore";

export type AdminRoadmap = RoadmapDetailData & { isPublished: boolean };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function uniqueSlug(base: string, existing: string[]) {
  let slug = slugify(base) || "item";
  let i = 2;
  while (existing.includes(slug)) {
    slug = `${slugify(base)}-${i}`;
    i++;
  }
  return slug;
}

function recomputeProgress(nodes: RoadmapNodeData[]) {
  const done = nodes.filter((n) => n.state === "done").length;
  return nodes.length ? Math.round((done / nodes.length) * 100) : 0;
}

/** Returns a valid admin access token if we should attempt the real API, else null. */
function adminToken(): string | null {
  const { accessToken, isOffline, user } = useAuthStore.getState();
  if (isOffline || !accessToken || user?.role !== "admin") return null;
  return accessToken;
}

function apiRoadmapToLocal(r: roadmapsApi.ApiRoadmap, existingNodes: RoadmapNodeData[] = []): AdminRoadmap {
  return {
    slug: r.slug,
    lineCode: r.lineCode,
    title: r.title,
    description: r.description,
    category: r.category,
    color: r.color,
    difficulty: r.difficulty,
    estimatedDurationHours: r.estimatedDurationHours,
    prerequisites: r.prerequisites,
    careerOutcomes: r.careerOutcomes,
    isPublished: r.isPublished,
    progressPercent: recomputeProgress(existingNodes),
    nodes: existingNodes,
  };
}

function apiNodesToLocal(nodes: roadmapsApi.ApiRoadmapNode[]): RoadmapNodeData[] {
  return nodes
    .sort((a, b) => a.order - b.order)
    .map((n, i) => ({
      slug: n.slug,
      title: n.title,
      estimatedHours: n.estimatedHours,
      state: i === 0 ? "current" : "locked",
      contentSource: n.contentSource,
    }));
}

function apiResourceToLocal(r: roadmapsApi.ApiResource): ResourceData {
  return {
    id: r._id,
    type: r.type,
    tag: r.tag,
    title: r.title,
    source: r.source,
    language: r.language,
    videoId: r.videoId,
    durationMinutes: r.durationMinutes,
  };
}

type NewRoadmapInput = {
  title: string;
  description: string;
  difficulty: RoadmapDetailData["difficulty"];
  category: RoadmapCategory;
  color: LineColor;
  estimatedDurationHours: number;
  prerequisites: string[];
  careerOutcomes: string[];
};

type AdminState = {
  roadmaps: AdminRoadmap[];
  topicResources: Record<string, ResourceData[]>;
  isOffline: boolean;
  /** true while retryConnection is actively trying to reach a possibly-sleeping backend */
  retrying: boolean;
  loaded: boolean;

  loadRoadmaps: () => Promise<void>;
  /** Retries the API in the background after a cold-start-style failure, so the app
   *  recovers automatically once a sleeping free-tier backend finishes waking up. */
  retryConnection: () => Promise<void>;
  loadRoadmapDetail: (slug: string) => Promise<void>;
  loadTopicResources: (roadmapSlug: string, nodeSlug: string) => Promise<void>;

  addRoadmap: (input: NewRoadmapInput) => Promise<string>;
  updateRoadmap: (slug: string, patch: Partial<NewRoadmapInput>) => Promise<void>;
  deleteRoadmap: (slug: string) => Promise<void>;
  togglePublish: (slug: string) => Promise<void>;

  addNode: (roadmapSlug: string, title: string, hours: number) => Promise<void>;
  updateNode: (roadmapSlug: string, nodeSlug: string, patch: { title?: string; hours?: number }) => Promise<void>;
  deleteNode: (roadmapSlug: string, nodeSlug: string) => Promise<void>;
  moveNode: (roadmapSlug: string, nodeSlug: string, direction: "up" | "down") => Promise<void>;

  addResource: (topicKey: string, resource: Omit<ResourceData, "id">) => Promise<void>;
  deleteResource: (topicKey: string, id: string) => Promise<void>;
};

const seedRoadmaps: AdminRoadmap[] = roadmapsCatalog.map((r) => ({ ...r, isPublished: true }));
const seedTopicResources: Record<string, ResourceData[]> = Object.fromEntries(
  Object.entries(curatedTopics).map(([key, topic]) => [key, topic.resources])
);

export const useAdminStore = create<AdminState>()((set, get) => ({
  roadmaps: [],
  topicResources: {},
  isOffline: false,
  retrying: false,
  loaded: false,

  loadRoadmaps: async () => {
    try {
      const { roadmaps } = await roadmapsApi.listRoadmaps(useAuthStore.getState().accessToken);
      set((s) => ({
        roadmaps: roadmaps.map((r) => {
          const existing = s.roadmaps.find((prev) => prev.slug === r.slug);
          return apiRoadmapToLocal(r, existing?.nodes ?? []);
        }),
        isOffline: false,
        loaded: true,
      }));
    } catch (err) {
      if (err instanceof ApiUnreachableError) {
        // Show local demo data immediately so the UI isn't blank, but keep
        // retrying in the background. Free-tier hosts (e.g. Render) can take
        // 30-60s to wake from sleep, and the very first request during that
        // window often fails outright rather than just being slow — without
        // a retry, the app would stay stuck in demo mode for the rest of the
        // session even after the backend comes online.
        set({ roadmaps: seedRoadmaps, topicResources: seedTopicResources, isOffline: true, loaded: true });
        void get().retryConnection();
        return;
      }
      throw err;
    }
  },

  retryConnection: async () => {
    set({ retrying: true });
    // ~2 minutes total, covering slower Render free-tier cold starts.
    const delaysMs = [3000, 5000, 8000, 10000, 12000, 15000, 18000, 20000, 20000];
    for (const delay of delaysMs) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (!get().isOffline) {
        set({ retrying: false });
        return; // already recovered another way
      }

      try {
        const { roadmaps } = await roadmapsApi.listRoadmaps(useAuthStore.getState().accessToken);
        set((s) => ({
          roadmaps: roadmaps.map((r) => {
            // Preserve any full node detail a page already fetched before we went offline.
            const existing = s.roadmaps.find((prev) => prev.slug === r.slug);
            return apiRoadmapToLocal(r, existing?.nodes ?? []);
          }),
          isOffline: false,
          retrying: false,
        }));
        return; // success — "Demo mode" disappears, and pages watching `isOffline` re-fetch their detail
      } catch {
        // still down — wait for the next delay and try again
      }
    }
    set({ retrying: false }); // gave up after ~2 minutes — stays in demo mode until next page load
  },

  loadRoadmapDetail: async (slug) => {
    if (get().isOffline) return; // local seed data already has nodes embedded
    try {
      const { roadmap, nodes } = await roadmapsApi.getRoadmap(slug, useAuthStore.getState().accessToken);
      const localNodes = apiNodesToLocal(nodes);
      set((s) => ({
        roadmaps: s.roadmaps.some((r) => r.slug === slug)
          ? s.roadmaps.map((r) => (r.slug === slug ? apiRoadmapToLocal(roadmap, localNodes) : r))
          : [...s.roadmaps, apiRoadmapToLocal(roadmap, localNodes)],
      }));
    } catch (err) {
      if (err instanceof ApiUnreachableError) set({ isOffline: true });
      else throw err;
    }
  },

  loadTopicResources: async (roadmapSlug, nodeSlug) => {
    if (get().isOffline) return;
    const key = `${roadmapSlug}/${nodeSlug}`;
    try {
      const { resources } = await roadmapsApi.getTopic(roadmapSlug, nodeSlug);
      set((s) => ({ topicResources: { ...s.topicResources, [key]: resources.map(apiResourceToLocal) } }));
    } catch (err) {
      if (err instanceof ApiUnreachableError) set({ isOffline: true });
      else throw err;
    }
  },

  addRoadmap: async (input) => {
    const token = adminToken();
    if (token) {
      const { roadmap } = await adminApi.createRoadmap(input, token);
      set((s) => ({ roadmaps: [...s.roadmaps, apiRoadmapToLocal(roadmap, [])] }));
      return roadmap.slug;
    }
    const slug = uniqueSlug(input.title, get().roadmaps.map((r) => r.slug));
    const lineCode = `L${get().roadmaps.length + 1}`;
    const roadmap: AdminRoadmap = { ...input, slug, lineCode, progressPercent: 0, nodes: [], isPublished: false };
    set((s) => ({ roadmaps: [...s.roadmaps, roadmap] }));
    return slug;
  },

  updateRoadmap: async (slug, patch) => {
    const token = adminToken();
    if (token) {
      const { roadmap } = await adminApi.updateRoadmap(slug, patch, token);
      set((s) => ({
        roadmaps: s.roadmaps.map((r) => (r.slug === slug ? apiRoadmapToLocal(roadmap, r.nodes) : r)),
      }));
      return;
    }
    set((s) => ({ roadmaps: s.roadmaps.map((r) => (r.slug === slug ? { ...r, ...patch } : r)) }));
  },

  deleteRoadmap: async (slug) => {
    const token = adminToken();
    if (token) await adminApi.deleteRoadmap(slug, token);
    set((s) => ({
      roadmaps: s.roadmaps.filter((r) => r.slug !== slug),
      topicResources: Object.fromEntries(Object.entries(s.topicResources).filter(([key]) => !key.startsWith(`${slug}/`))),
    }));
  },

  togglePublish: async (slug) => {
    const token = adminToken();
    if (token) {
      const { roadmap } = await adminApi.togglePublish(slug, token);
      set((s) => ({ roadmaps: s.roadmaps.map((r) => (r.slug === slug ? apiRoadmapToLocal(roadmap, r.nodes) : r)) }));
      return;
    }
    set((s) => ({ roadmaps: s.roadmaps.map((r) => (r.slug === slug ? { ...r, isPublished: !r.isPublished } : r)) }));
  },

  addNode: async (roadmapSlug, title, hours) => {
    const token = adminToken();
    if (token) {
      await adminApi.addNode(roadmapSlug, title, hours, token);
      await get().loadRoadmapDetail(roadmapSlug);
      return;
    }
    set((s) => ({
      roadmaps: s.roadmaps.map((r) => {
        if (r.slug !== roadmapSlug) return r;
        const slug = uniqueSlug(title, r.nodes.map((n) => n.slug));
        const newNode: RoadmapNodeData = { slug, title, estimatedHours: hours, state: r.nodes.length === 0 ? "unlocked" : "locked" };
        const nodes = [...r.nodes, newNode];
        return { ...r, nodes, progressPercent: recomputeProgress(nodes) };
      }),
    }));
  },

  updateNode: async (roadmapSlug, nodeSlug, patch) => {
    const token = adminToken();
    if (token) {
      await adminApi.updateNode(roadmapSlug, nodeSlug, { title: patch.title, estimatedHours: patch.hours }, token);
      await get().loadRoadmapDetail(roadmapSlug);
      return;
    }
    set((s) => ({
      roadmaps: s.roadmaps.map((r) => {
        if (r.slug !== roadmapSlug) return r;
        const nodes = r.nodes.map((n) =>
          n.slug === nodeSlug ? { ...n, title: patch.title ?? n.title, estimatedHours: patch.hours ?? n.estimatedHours } : n
        );
        return { ...r, nodes };
      }),
    }));
  },

  deleteNode: async (roadmapSlug, nodeSlug) => {
    const token = adminToken();
    if (token) {
      await adminApi.deleteNode(roadmapSlug, nodeSlug, token);
      await get().loadRoadmapDetail(roadmapSlug);
      return;
    }
    set((s) => ({
      roadmaps: s.roadmaps.map((r) => {
        if (r.slug !== roadmapSlug) return r;
        const nodes = r.nodes.filter((n) => n.slug !== nodeSlug);
        return { ...r, nodes, progressPercent: recomputeProgress(nodes) };
      }),
      topicResources: Object.fromEntries(Object.entries(s.topicResources).filter(([key]) => key !== `${roadmapSlug}/${nodeSlug}`)),
    }));
  },

  moveNode: async (roadmapSlug, nodeSlug, direction) => {
    const token = adminToken();
    if (token) {
      await adminApi.moveNode(roadmapSlug, nodeSlug, direction, token);
      await get().loadRoadmapDetail(roadmapSlug);
      return;
    }
    set((s) => ({
      roadmaps: s.roadmaps.map((r) => {
        if (r.slug !== roadmapSlug) return r;
        const idx = r.nodes.findIndex((n) => n.slug === nodeSlug);
        const swapWith = direction === "up" ? idx - 1 : idx + 1;
        if (idx < 0 || swapWith < 0 || swapWith >= r.nodes.length) return r;
        const nodes = [...r.nodes];
        [nodes[idx], nodes[swapWith]] = [nodes[swapWith], nodes[idx]];
        return { ...r, nodes };
      }),
    }));
  },

  addResource: async (topicKey, resource) => {
    const [roadmapSlug, nodeSlug] = topicKey.split("/");
    const token = adminToken();
    if (token) {
      await adminApi.addResource({ roadmapSlug, nodeSlug, ...resource }, token);
      await get().loadTopicResources(roadmapSlug, nodeSlug);
      return;
    }
    set((s) => ({
      topicResources: {
        ...s.topicResources,
        [topicKey]: [...(s.topicResources[topicKey] ?? []), { ...resource, id: `r-${Date.now()}` }],
      },
    }));
  },

  deleteResource: async (topicKey, id) => {
    const [roadmapSlug, nodeSlug] = topicKey.split("/");
    const token = adminToken();
    if (token) {
      await adminApi.deleteResource(id, token);
      await get().loadTopicResources(roadmapSlug, nodeSlug);
      return;
    }
    set((s) => ({
      topicResources: { ...s.topicResources, [topicKey]: (s.topicResources[topicKey] ?? []).filter((r) => r.id !== id) },
    }));
  },
}));
