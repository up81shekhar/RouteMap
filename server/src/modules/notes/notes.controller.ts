import { Request, Response } from "express";
import { Note } from "../../models/Note.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import { slugify } from "../../utils/slugify.js";

// -------- Public --------

export const listNotes = asyncHandler(async (_req: Request, res: Response) => {
  const notes = await Note.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
  res.json({ notes });
});

export const getNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOne({ slug: req.params.slug, isPublished: true });
  if (!note) throw new ApiError(404, "Note not found");
  res.json({ note });
});

// -------- Admin --------

export const adminListNotes = asyncHandler(async (_req: Request, res: Response) => {
  const notes = await Note.find({}).sort({ order: 1, createdAt: -1 });
  res.json({ notes });
});

export const adminGetNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOne({ slug: req.params.slug });
  if (!note) throw new ApiError(404, "Note not found");
  res.json({ note });
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const { title, ...rest } = req.body;
  const existingSlugs = (await Note.find({}, "slug")).map((n) => n.slug);
  let slug = slugify(title);
  let i = 2;
  while (existingSlugs.includes(slug)) slug = `${slugify(title)}-${i++}`;

  const note = await Note.create({ ...rest, title, slug, isPublished: false });
  res.status(201).json({ note });
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
  if (!note) throw new ApiError(404, "Note not found");
  res.json({ note });
});

export const togglePublishNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOne({ slug: req.params.slug });
  if (!note) throw new ApiError(404, "Note not found");
  note.isPublished = !note.isPublished;
  await note.save();
  res.json({ note });
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOneAndDelete({ slug: req.params.slug });
  if (!note) throw new ApiError(404, "Note not found");
  res.json({ ok: true });
});
