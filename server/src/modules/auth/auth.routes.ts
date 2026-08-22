import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./auth.controller.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

// Stricter than the general /api/auth limiter (applied in app.ts) — this
// endpoint sends an email per request and is a common enumeration/spam
// target, so it gets its own tighter budget.
const forgotPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

router.post("/signup", validateBody(signupSchema), controller.signupHandler);
router.post("/login", validateBody(loginSchema), controller.loginHandler);
router.post("/refresh", controller.refreshHandler);
router.post("/logout", controller.logoutHandler);
router.get("/me", requireAuth, controller.meHandler);
router.post("/forgot-password", forgotPasswordLimiter, validateBody(forgotPasswordSchema), controller.forgotPasswordHandler);
router.post("/reset-password", validateBody(resetPasswordSchema), controller.resetPasswordHandler);

export default router;
