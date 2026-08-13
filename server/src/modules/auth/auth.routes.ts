import { Router } from "express";
import { z } from "zod";
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

router.post("/signup", validateBody(signupSchema), controller.signupHandler);
router.post("/login", validateBody(loginSchema), controller.loginHandler);
router.post("/refresh", controller.refreshHandler);
router.post("/logout", controller.logoutHandler);
router.get("/me", requireAuth, controller.meHandler);

export default router;
