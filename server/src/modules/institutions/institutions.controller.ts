import { Request, Response } from "express";
import crypto from "node:crypto";
import { Institution } from "../../models/Institution.js";
import { User } from "../../models/User.js";
import { UserProgress } from "../../models/UserProgress.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import { issueTokens } from "../auth/auth.service.js";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateJoinCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "A1B2C3D4"
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

export const getMyInstitutionDashboard = asyncHandler(async (req: Request, res: Response) => {
  const institution = await Institution.findOne({ adminUserId: req.user!.id });
  if (!institution) throw new ApiError(404, "No institution found for this account");

  const students = await User.find({ institutionId: institution._id, role: "student" }).select(
    "name email createdAt"
  );
  const studentIds = students.map((s) => s._id);

  const progress = await UserProgress.find({ userId: { $in: studentIds } });

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const activeStudentIds = new Set(
    progress.filter((p) => p.lastActivityAt && p.lastActivityAt > fourteenDaysAgo).map((p) => String(p.userId))
  );

  // Per-student totals — we deliberately don't claim a "% complete" figure
  // here, since that requires knowing each topic's total lesson count,
  // which lives in the frontend's static content, not this database.
  const lessonsByStudent = new Map<string, number>();
  const roadmapEngagement = new Map<string, Set<string>>(); // roadmapSlug -> set of student ids who've touched it

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

  res.json({
    institution: { name: institution.name, slug: institution.slug, joinCode: institution.joinCode },
    stats: {
      totalStudents: students.length,
      activeStudents: activeStudentIds.size,
      totalLessonsCompleted: Array.from(lessonsByStudent.values()).reduce((sum, n) => sum + n, 0),
    },
    roadmapEngagement: roadmapEngagementList,
    students: studentSummaries.sort((a, b) => b.lessonsCompleted - a.lessonsCompleted),
  });
});
