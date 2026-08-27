import { Request, Response } from "express";
import { Roadmap } from "../../models/Roadmap.js";
import { RoadmapNode } from "../../models/RoadmapNode.js";
import { Resource } from "../../models/Resource.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import { slugify } from "../../utils/slugify.js";
import { env } from "../../config/env.js";
import * as youtube from "../../services/youtube.service.js";

export const importPlaylist = asyncHandler(async (req: Request, res: Response) => {
  if (!env.YOUTUBE_API_KEY) {
    throw new ApiError(500, "YOUTUBE_API_KEY is not configured on the server");
  }

  const {
    playlistUrl,
    category,
    color,
    difficulty,
    title: titleOverride,
    description: descriptionOverride,
  } = req.body;

  const playlistId = youtube.extractPlaylistId(playlistUrl);
  if (!playlistId) throw new ApiError(400, "Could not find a playlist ID in that URL");

  const meta = await youtube.fetchPlaylistMeta(playlistId, env.YOUTUBE_API_KEY);
  if (!meta) throw new ApiError(404, "Playlist not found, private, or unavailable");

  const items = await youtube.fetchPlaylistItems(playlistId, env.YOUTUBE_API_KEY);
  if (items.length === 0) throw new ApiError(400, "That playlist has no accessible videos");

  const durations = await youtube.fetchVideoDurations(
    items.map((i) => i.videoId),
    env.YOUTUBE_API_KEY
  );

  const title = (titleOverride as string | undefined)?.trim() || meta.title;
  const description =
    (descriptionOverride as string | undefined)?.trim() ||
    meta.description ||
    `Free course imported from the "${meta.title}" YouTube playlist.`;

  const existingSlugs = (await Roadmap.find({}, "slug")).map((r) => r.slug);
  let slug = slugify(title);
  let n = 2;
  while (existingSlugs.includes(slug)) slug = `${slugify(title)}-${n++}`;

  const totalMinutes = items.reduce((sum, item) => sum + (durations.get(item.videoId) ?? 0), 0);
  const estimatedDurationHours = Math.max(1, Math.round(totalMinutes / 60));

  const count = await Roadmap.countDocuments();
  const roadmap = await Roadmap.create({
    slug,
    title,
    description,
    category,
    color,
    difficulty,
    estimatedDurationHours,
    lineCode: `L${count + 1}`,
    prerequisites: [],
    careerOutcomes: [],
    isPublished: false,
  });

  const existingNodeSlugs: string[] = [];
  let created = 0;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    let nodeSlug = slugify(item.title).slice(0, 80) || `video-${index + 1}`;
    let n2 = 2;
    while (existingNodeSlugs.includes(nodeSlug)) nodeSlug = `${slugify(item.title).slice(0, 76)}-${n2++}`;
    existingNodeSlugs.push(nodeSlug);

    const durationMinutes = durations.get(item.videoId);
    const node = await RoadmapNode.create({
      roadmapId: roadmap._id,
      roadmapSlug: roadmap.slug,
      slug: nodeSlug,
      title: item.title,
      estimatedHours: durationMinutes ? Math.max(0.25, Math.round((durationMinutes / 60) * 4) / 4) : 0.5,
      order: index,
      isPublished: true,
      contentSource: "playlist",
    });

    await Resource.create({
      nodeId: node._id,
      roadmapSlug: roadmap.slug,
      nodeSlug: node.slug,
      type: "video",
      tag: "recommended",
      title: item.title,
      source: meta.channelTitle,
      language: "English",
      videoId: item.videoId,
      durationMinutes,
      order: 0,
      isPublished: true,
    });

    created += 1;
  }

  res.status(201).json({ roadmap, videosImported: created });
});
