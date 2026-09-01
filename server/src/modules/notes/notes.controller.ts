import { Request, Response } from "express";
import { Note } from "../../models/Note.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import { slugify } from "../../utils/slugify.js";

// -------- Public --------

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  // Public notes, plus this user's own institution's private notes if they belong to one.
  const visibility = req.user?.role === "student" || req.user?.role === "institution_admin"
    ? [{ institutionId: null }, ...(req.user ? [{ institutionId: (await getUserInstitutionId(req.user.id)) }] : [])]
    : [{ institutionId: null }];
  const notes = await Note.find({ isPublished: true, $or: visibility }).sort({ order: 1, createdAt: -1 });
  res.json({ notes });
});

export const getNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOne({ slug: req.params.slug, isPublished: true });
  if (!note) throw new ApiError(404, "Note not found");
  if (note.institutionId) {
    const myInstitutionId = req.user ? await getUserInstitutionId(req.user.id) : null;
    if (!myInstitutionId || String(myInstitutionId) !== String(note.institutionId)) {
      throw new ApiError(404, "Note not found");
    }
  }
  res.json({ note });
});

async function getUserInstitutionId(userId: string) {
  const { User } = await import("../../models/User.js");
  const user = await User.findById(userId).select("institutionId");
  return user?.institutionId ?? null;
}

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
