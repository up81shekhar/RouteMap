import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as progressApi from "../api/progress";
import { useAuthStore } from "./authStore";

type ProgressState = {
  // key = `${roadmapSlug}/${topicSlug}` -> completed lesson indices
  completed: Record<string, number[]>;
  markComplete: (key: string, index: number) => void;
  getCompleted: (key: string) => number[];
  /** Pulls this topic's progress from the server and merges it in (server is source of truth when reachable). */
  syncFromServer: (roadmapSlug: string, nodeSlug: string) => Promise<void>;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},

      markComplete: (key, index) => {
        set((state) => {
          const existing = state.completed[key] ?? [];
          if (existing.includes(index)) return state;
          return { completed: { ...state.completed, [key]: [...existing, index].sort((a, b) => a - b) } };
        });

        // Fire-and-forget sync to the real API when the user has a session.
        // Local state above is the source of truth for the UI either way,
        // so a failed/offline sync never blocks the learner's progress.
        const { accessToken, isOffline } = useAuthStore.getState();
        if (accessToken && !isOffline) {
          const [roadmapSlug, nodeSlug] = key.split("/");
          progressApi.markLessonComplete(roadmapSlug, nodeSlug, index, accessToken).catch(() => {
            // network hiccup or API down — local progress is still saved, will retry next mark
          });
        }
      },

      getCompleted: (key) => get().completed[key] ?? [],

      syncFromServer: async (roadmapSlug, nodeSlug) => {
        const { accessToken, isOffline } = useAuthStore.getState();
        if (!accessToken || isOffline) return;
        try {
          const { progress } = await progressApi.getProgress(accessToken, roadmapSlug, nodeSlug);
          const key = `${roadmapSlug}/${nodeSlug}`;
          const serverIndices = progress[0]?.completedLessonIndices ?? [];
          set((state) => {
            const local = state.completed[key] ?? [];
            const merged = Array.from(new Set([...local, ...serverIndices])).sort((a, b) => a - b);
            return { completed: { ...state.completed, [key]: merged } };
          });
        } catch {
          // offline or error — keep local progress as-is
        }
      },
    }),
    { name: "learnpath-progress" }
  )
);
