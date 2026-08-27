const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Extracts a playlist ID from a pasted YouTube URL (watch?v=...&list=...,
 * playlist?list=..., or a bare playlist ID).
 */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  try {
    const u = new URL(trimmed);
    const listParam = u.searchParams.get("list");
    if (listParam) return listParam;
  } catch {
    // not a full URL — fall through and check if it's a bare playlist ID
  }
  if (/^[A-Za-z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

type PlaylistMeta = { title: string; description: string; channelTitle: string };

export async function fetchPlaylistMeta(playlistId: string, apiKey: string): Promise<PlaylistMeta | null> {
  const url = `${YT_API_BASE}/playlists?part=snippet&id=${encodeURIComponent(playlistId)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error (playlists.list): ${res.status}`);
  const data = (await res.json()) as any;
  const item = data.items?.[0];
  if (!item) return null;
  return {
    title: item.snippet.title,
    description: item.snippet.description ?? "",
    channelTitle: item.snippet.channelTitle ?? "YouTube",
  };
}

export type PlaylistItem = { videoId: string; title: string; position: number };

/**
 * Fetches every video in a playlist (paginated, 50 per page). Skips entries
 * for videos that have been deleted or made private since the playlist was
 * built — YouTube still lists a row for them, but without a usable title.
 */
export async function fetchPlaylistItems(playlistId: string, apiKey: string): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = [];
  let pageToken: string | undefined;
  const MAX_PAGES = 10; // up to 500 videos — plenty for a course playlist

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(`${YT_API_BASE}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`YouTube API error (playlistItems.list): ${res.status}`);
    const data = (await res.json()) as any;

    for (const raw of data.items ?? []) {
      const title: string | undefined = raw.snippet?.title;
      const videoId: string | undefined = raw.snippet?.resourceId?.videoId;
      if (!videoId || !title || title === "Deleted video" || title === "Private video") continue;
      items.push({ videoId, title, position: raw.snippet.position ?? items.length });
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return items;
}

/** Batches videos.list calls (50 IDs max per call) to get each video's duration. */
export async function fetchVideoDurations(videoIds: string[], apiKey: string): Promise<Map<string, number>> {
  const durations = new Map<string, number>();
  const BATCH = 50;

  for (let i = 0; i < videoIds.length; i += BATCH) {
    const batch = videoIds.slice(i, i + BATCH);
    const url = `${YT_API_BASE}/videos?part=contentDetails&id=${batch.join(",")}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API error (videos.list): ${res.status}`);
    const data = (await res.json()) as any;
    for (const item of data.items ?? []) {
      const minutes = parseIsoDurationToMinutes(item.contentDetails?.duration);
      if (minutes != null) durations.set(item.id, minutes);
    }
  }

  return durations;
}

function parseIsoDurationToMinutes(iso?: string): number | null {
  if (!iso) return null;
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return Math.round(hours * 60 + minutes + seconds / 60);
}
