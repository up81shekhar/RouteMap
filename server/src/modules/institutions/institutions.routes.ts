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

export default router;
