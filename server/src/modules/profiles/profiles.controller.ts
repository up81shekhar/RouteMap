import { Request, Response } from "express";
import { User } from "../../models/User.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import { getStats } from "../../services/gamification.service.js";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ profileSlug: req.params.slug, publicProfile: true });
  if (!user) throw new ApiError(404, "Profile not found or not public");

  const stats = await getStats(String(user._id));
  res.json({
    name: user.name,
    joinedAt: user.createdAt,
    ...stats,
  });
});

export const getMyProfileSettings = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select("publicProfile profileSlug");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ publicProfile: user.publicProfile, profileSlug: user.profileSlug ?? null });
});

export const updateMyProfileSettings = asyncHandler(async (req: Request, res: Response) => {
  const { publicProfile } = req.body;
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, "User not found");

  if (publicProfile && !user.profileSlug) {
    let slug = slugify(user.name) || "user";
    let i = 2;
    while (await User.findOne({ profileSlug: slug })) slug = `${slugify(user.name)}-${i++}`;
    user.profileSlug = slug;
  }

  user.publicProfile = Boolean(publicProfile);
  await user.save();
  res.json({ publicProfile: user.publicProfile, profileSlug: user.profileSlug ?? null });
});
