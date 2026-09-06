import { apiFetch } from "./client";

export function reportResource(
  input: { roadmapSlug: string; nodeSlug: string; resourceTitle?: string; reason: string },
  accessToken?: string
) {
  return apiFetch<{ ok: true }>("/reports", { method: "POST", body: input, accessToken });
}
