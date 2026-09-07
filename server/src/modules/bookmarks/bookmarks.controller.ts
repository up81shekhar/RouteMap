import { Request, Response } from "express";
import { Bookmark } from "../../models/Bookmark.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";

export const listBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const bookmarks = await Bookmark.find({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ bookmarks });
});

export const addBookmark = asyncHandler(async (req: Request, res: Response) => {
  const { key, type, title, path } = req.body;
  const bookmark = await Bookmark.findOneAndUpdate(
    { userId: req.user!.id, key },
    { userId: req.user!.id, key, type, title, path },
    { upsert: true, new: true }
  );
  res.status(201).json({ bookmark });
});

export const removeBookmark = asyncHandler(async (req: Request, res: Response) => {
  const result = await Bookmark.findOneAndDelete({ userId: req.user!.id, key: req.params.key });
  if (!result) throw new ApiError(404, "Bookmark not found");
  res.json({ ok: true });
});
