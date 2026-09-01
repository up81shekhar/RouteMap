import { Request, Response } from "express";
import crypto from "node:crypto";
import { Institution } from "../../models/Institution.js";
import { User } from "../../models/User.js";
import { UserProgress } from "../../models/UserProgress.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import { issueTokens } from "../auth/auth.service.js";
import { sendInstitutionDeleteOtpEmail, sendInstitutionNoticeEmail } from "../../utils/email.js";
import { Note } from "../../models/Note.js";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateJoinCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "A1B2C3D4"
}

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// Any signed-in user can create an institution — they become its
// institution_admin. Kept this self-serve rather than platform-admin-only,
// since the realistic path is a college coordinator signing up themselves.
export const createInstitution = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.user!.id;

  const existing = await User.findById(userId);
  if (existing?.institutionId) throw new ApiError(409, "This account is already linked to an institution");

  let slug = slugify(name);
  let i = 2;
  while (await Institution.findOne({ slug })) slug = `${slugify(name)}-${i++}`;

  let joinCode = generateJoinCode();
  while (await Institution.findOne({ joinCode })) joinCode = generateJoinCode();

  const institution = await Institution.create({ name, slug, joinCode, adminUserId: userId });

  await User.findByIdAndUpdate(userId, { role: "institution_admin", institutionId: institution._id });

  // Role changed — reissue tokens so the client's session reflects
  // institution_admin immediately without a manual re-login.
  const { accessToken, refreshToken } = issueTokens(userId, "institution_admin");
  res.cookie("routemap_refresh", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({ institution, accessToken });
});

export const joinInstitution = asyncHandler(async (req: Request, res: Response) => {
  const { joinCode } = req.body;
  const institution = await Institution.findOne({ joinCode: String(joinCode).toUpperCase() });
  if (!institution) throw new ApiError(404, "No institution found for that join code");

  await User.findByIdAndUpdate(req.user!.id, { institutionId: institution._id });
  res.json({ institution: { name: institution.name, slug: institution.slug } });
});

/** Shared by the institution_admin's own dashboard and the platform-admin oversight view. */
async function buildDashboardPayload(institution: InstanceType<typeof Institution>) {
  const students = await User.find({ institutionId: institution._id, role: "student" }).select(
    "name email createdAt"
  );
  const studentIds = students.map((s) => s._id);

  const progress = await UserProgress.find({ userId: { $in: studentIds } });

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const activeStudentIds = new Set(
    progress.filter((p) => p.lastActivityAt && p.lastActivityAt > fourteenDaysAgo).map((p) => String(p.userId))
  );

  const lessonsByStudent = new Map<string, number>();
  const roadmapEngagement = new Map<string, Set<string>>();

  for (const p of progress) {
    const uid = String(p.userId);
    lessonsByStudent.set(uid, (lessonsByStudent.get(uid) ?? 0) + p.completedLessonIndices.length);
    if (!roadmapEngagement.has(p.roadmapSlug)) roadmapEngagement.set(p.roadmapSlug, new Set());
    roadmapEngagement.get(p.roadmapSlug)!.add(uid);
  }

  const studentSummaries = students.map((s) => ({
    id: s._id,
    name: s.name,
    email: s.email,
    joinedAt: s.createdAt,
    lessonsCompleted: lessonsByStudent.get(String(s._id)) ?? 0,
    isActive: activeStudentIds.has(String(s._id)),
  }));

  const roadmapEngagementList = Array.from(roadmapEngagement.entries())
    .map(([roadmapSlug, studentSet]) => ({ roadmapSlug, studentsEngaged: studentSet.size }))
    .sort((a, b) => b.studentsEngaged - a.studentsEngaged);

  return {
    institution: { name: institution.name, slug: institution.slug, joinCode: institution.joinCode },
    stats: {
      totalStudents: students.length,
      activeStudents: activeStudentIds.size,
      totalLessonsCompleted: Array.from(lessonsByStudent.values()).reduce((sum, n) => sum + n, 0),
    },
    roadmapEngagement: roadmapEngagementList,
    students: studentSummaries.sort((a, b) => b.lessonsCompleted - a.lessonsCompleted),
  };
}

export const getMyInstitutionDashboard = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");
  res.json(await buildDashboardPayload(institution));
});

/** Deletes an institution and cleans up everything tied to it — used by both the
 *  self-service (OTP-verified) flow and the platform-admin delete endpoint. */
async function deleteInstitutionCascade(institution: InstanceType<typeof Institution>) {
  await User.updateMany({ institutionId: institution._id, role: "student" }, { $unset: { institutionId: "" } });
  await User.findByIdAndUpdate(institution.adminUserId, {
    role: "student",
    $unset: { institutionId: "" },
  });
  await institution.deleteOne();
}

// -------- Self-service delete (institution_admin, own institution, OTP-verified) --------

export const requestDeleteOtp = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");

  const otp = String(crypto.randomInt(100000, 999999));
  institution.deleteOtpHash = hashOtp(otp);
  institution.deleteOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await institution.save();

  const user = await User.findById(req.user!.id).select("email");
  if (user) await sendInstitutionDeleteOtpEmail(user.email, institution.name, otp);

  res.json({ ok: true });
});

export const confirmDelete = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");

  if (
    !institution.deleteOtpHash ||
    !institution.deleteOtpExpiresAt ||
    institution.deleteOtpExpiresAt < new Date() ||
    institution.deleteOtpHash !== hashOtp(String(otp))
  ) {
    throw new ApiError(400, "That code is invalid or has expired — request a new one");
  }

  await deleteInstitutionCascade(institution);

  // Role reverted to "student" server-side — reissue tokens so the client's
  // session reflects that immediately.
  const { accessToken, refreshToken } = issueTokens(req.user!.id, "student");
  res.cookie("routemap_refresh", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true, accessToken });
});

// -------- Student management --------

export const removeStudent = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");

  const student = await User.findOne({ _id: req.params.studentId, institutionId: institution._id });
  if (!student) throw new ApiError(404, "Student not found in this institution");

  await User.findByIdAndUpdate(student._id, { $unset: { institutionId: "" } });
  res.json({ ok: true });
});

// -------- Notices (emailed to every current student) --------

export const sendNotice = asyncHandler(async (req: Request, res: Response) => {
  const { subject, message } = req.body;
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");

  const students = await User.find({ institutionId: institution._id, role: "student" }).select("email");
  await Promise.all(
    students.map((s) => sendInstitutionNoticeEmail(s.email, institution.name, subject, message))
  );

  res.json({ ok: true, sentTo: students.length });
});

// -------- Private notes (visible only to this institution's students) --------

export const listMyNotes = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");
  const notes = await Note.find({ institutionId: institution._id }).sort({ order: 1, createdAt: -1 });
  res.json({ notes });
});

function slugifyNote(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const createMyNote = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");

  const { title, ...rest } = req.body;
  const existingSlugs = (await Note.find({}, "slug")).map((n) => n.slug);
  let slug = slugifyNote(title);
  let i = 2;
  while (existingSlugs.includes(slug)) slug = `${slugifyNote(title)}-${i++}`;

  const note = await Note.create({ ...rest, title, slug, institutionId: institution._id, isPublished: false });
  res.status(201).json({ note });
});

export const updateMyNote = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");
  const note = await Note.findOneAndUpdate(
    { slug: req.params.slug, institutionId: institution._id },
    req.body,
    { new: true }
  );
  if (!note) throw new ApiError(404, "Note not found");
  res.json({ note });
});

export const toggleMyNotePublish = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");
  const note = await Note.findOne({ slug: req.params.slug, institutionId: institution._id });
  if (!note) throw new ApiError(404, "Note not found");
  note.isPublished = !note.isPublished;
  await note.save();
  res.json({ note });
});

export const deleteMyNote = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");
  const note = await Note.findOneAndDelete({ slug: req.params.slug, institutionId: institution._id });
  if (!note) throw new ApiError(404, "Note not found");
  res.json({ ok: true });
});

// -------- Platform-admin oversight (mounted under /admin, requireAdmin) --------

export const adminListInstitutions = asyncHandler(async (_req: Request, res: Response) => {
  const institutions = await Institution.find({}).sort({ createdAt: -1 });
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const withStats = await Promise.all(
    institutions.map(async (inst) => {
      const studentIds = await User.find({ institutionId: inst._id, role: "student" }).distinct("_id");
      const activeCount = await UserProgress.countDocuments({
        userId: { $in: studentIds },
        lastActivityAt: { $gt: fourteenDaysAgo },
      });
      return {
        id: String(inst._id),
        name: inst.name,
        slug: inst.slug,
        joinCode: inst.joinCode,
        studentCount: studentIds.length,
        activeStudentCount: activeCount,
        isActive: activeCount > 0,
        createdAt: inst.createdAt,
      };
    })
  );

  res.json({ institutions: withStats });
});

export const adminGetInstitutionDashboard = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ slug: req.params.slug });
  if (!institution) throw new ApiError(404, "Institution not found");
  res.json(await buildDashboardPayload(institution));
});

export const adminDeleteInstitution = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ slug: req.params.slug });
  if (!institution) throw new ApiError(404, "Institution not found");
  await deleteInstitutionCascade(institution);
  res.json({ ok: true });
});
