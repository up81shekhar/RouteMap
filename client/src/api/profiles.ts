import { apiFetch } from "./client";
import type { GamificationStats } from "./gamification";

export type PublicProfile = GamificationStats & { name: string; joinedAt: string };

export function getPublicProfile(slug: string) {
  return apiFetch<PublicProfile>(`/profiles/${slug}`);
}

export function getMyProfileSettings(accessToken: string) {
  return apiFetch<{ publicProfile: boolean; profileSlug: string | null }>("/profiles/settings", { accessToken });
}

export function updateMyProfileSettings(publicProfile: boolean, accessToken: string) {
  return apiFetch<{ publicProfile: boolean; profileSlug: string | null }>("/profiles/settings", {
    method: "PUT",
    body: { publicProfile },
    accessToken,
  });
}
