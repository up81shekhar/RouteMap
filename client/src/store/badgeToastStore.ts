import { create } from "zustand";

type BadgeToastState = {
  pending: string[];
  pushBadges: (ids: string[]) => void;
  clear: () => void;
};

export const useBadgeToastStore = create<BadgeToastState>((set) => ({
  pending: [],
  pushBadges: (ids) => {
    if (ids.length === 0) return;
    set((state) => ({ pending: [...state.pending, ...ids] }));
  },
  clear: () => set({ pending: [] }),
}));
