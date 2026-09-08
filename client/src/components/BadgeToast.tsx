import { useEffect, useState } from "react";
import { useBadgeToastStore } from "../store/badgeToastStore";
import { BADGE_INFO } from "../api/gamification";

export default function BadgeToast() {
  const pending = useBadgeToastStore((s) => s.pending);
  const clear = useBadgeToastStore((s) => s.clear);
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    if (pending.length === 0) return;
    setVisible(pending);
    clear();
    const timer = setTimeout(() => setVisible([]), 5000);
    return () => clearTimeout(timer);
  }, [pending, clear]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {visible.map((id) => {
        const info = BADGE_INFO[id];
        if (!info) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-3 rounded-full border border-accent/40 bg-surface px-5 py-2.5 shadow-lg"
          >
            <span className="text-xl">{info.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Badge earned: {info.label}</p>
              <p className="text-xs text-text-muted">{info.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
