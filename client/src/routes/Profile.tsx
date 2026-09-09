import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as profilesApi from "../api/profiles";
import type { PublicProfile } from "../api/profiles";
import { BADGE_INFO } from "../api/gamification";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Profile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!slug) return;
    profilesApi
      .getPublicProfile(slug)
      .then((p) => {
        setProfile(p);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [slug]);

  useDocumentMeta({
    title: profile ? `${profile.name}'s Profile` : "Profile",
    description: profile ? `${profile.name}'s learning journey on RouteMap — ${profile.totalLessonsCompleted} lessons completed.` : undefined,
    path: `/u/${slug ?? ""}`,
  });

  if (status === "loading") return <div className="container-page py-12 text-sm text-text-muted">Loading…</div>;
  if (status === "error" || !profile)
    return <div className="container-page py-12 text-sm text-error">This profile isn't public or doesn't exist.</div>;

  return (
    <div className="container-page max-w-xl py-12">
      <p className="station-code mb-2">Learner profile</p>
      <h1 className="font-display text-3xl font-semibold">{profile.name}</h1>
      <p className="mt-1 text-sm text-text-muted">
        On RouteMap since {new Date(profile.joinedAt).toLocaleDateString()}
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-card border border-border bg-surface p-4 text-center">
          <p className="font-display text-2xl font-semibold">{profile.totalLessonsCompleted}</p>
          <p className="station-code mt-1">Lessons</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 text-center">
          <p className="font-display text-2xl font-semibold">{profile.streak} 🔥</p>
          <p className="station-code mt-1">Day streak</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 text-center">
          <p className="font-display text-2xl font-semibold">{profile.distinctRoadmaps}</p>
          <p className="station-code mt-1">Roadmaps</p>
        </div>
      </div>

      {profile.badges.length > 0 && (
        <div className="mt-8">
          <p className="station-code mb-3">Badges</p>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((id) => {
              const info = BADGE_INFO[id];
              if (!info) return null;
              return (
                <div
                  key={id}
                  title={info.description}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs"
                >
                  <span>{info.emoji}</span>
                  <span className="text-text-primary">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-text-faint">
        Learning for free on{" "}
        <a href="/" className="text-accent hover:underline">
          RouteMap
        </a>
      </p>
    </div>
  );
}
