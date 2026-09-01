import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { requireInstitutionAdmin } from "../../middleware/requireInstitutionAdmin.js";
import { validateBody } from "../../middleware/validate.js";
import * as controller from "./institutions.controller.js";

const router = Router();

const createSchema = z.object({ name: z.string().min(2).max(120) });
const joinSchema = z.object({ joinCode: z.string().min(4).max(20) });

router.post("/", requireAuth, validateBody(createSchema), controller.createInstitution);
router.post("/join", requireAuth, validateBody(joinSchema), controller.joinInstitution);
router.get("/me", requireAuth, requireInstitutionAdmin, controller.getMyInstitutionDashboard);

const otpSchema = z.object({ otp: z.string().length(6) });
router.post("/me/delete/request-otp", requireAuth, requireInstitutionAdmin, controller.requestDeleteOtp);
router.post(
  "/me/delete/confirm",
  requireAuth,
  requireInstitutionAdmin,
  validateBody(otpSchema),
  controller.confirmDelete
);

// Student management
router.delete("/me/students/:studentId", requireAuth, requireInstitutionAdmin, controller.removeStudent);
router.get("/me/students/:studentId", requireAuth, requireInstitutionAdmin, controller.getStudentDetail);

const inviteSchema = z.object({ email: z.string().email() });
router.post("/me/invite", requireAuth, requireInstitutionAdmin, validateBody(inviteSchema), controller.inviteStudent);

// Notices — emailed to every current student
const noticeSchema = z.object({ subject: z.string().min(1).max(150), message: z.string().min(1).max(5000) });
router.post("/me/notices", requireAuth, requireInstitutionAdmin, validateBody(noticeSchema), controller.sendNotice);

// Private notes (visible only to this institution's own students)
const noteSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  content: z.string().default(""),
  attachmentUrl: z.string().default(""),
  attachmentType: z.enum(["pdf", "image", ""]).default(""),
  order: z.number().default(0),
});
const noteUpdateSchema = noteSchema.partial();

router.get("/me/notes", requireAuth, requireInstitutionAdmin, controller.listMyNotes);
router.post("/me/notes", requireAuth, requireInstitutionAdmin, validateBody(noteSchema), controller.createMyNote);
router.put(
  "/me/notes/:slug",
  requireAuth,
  requireInstitutionAdmin,
  validateBody(noteUpdateSchema),
  controller.updateMyNote
);
router.patch("/me/notes/:slug/publish", requireAuth, requireInstitutionAdmin, controller.toggleMyNotePublish);
router.delete("/me/notes/:slug", requireAuth, requireInstitutionAdmin, controller.deleteMyNote);

export default router;
