import { Request, Response } from "express";
import { User } from "../../models/User.js";
import { verifyRefreshToken } from "../../utils/jwt.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE = "routemap_refresh";
const isProd = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  // Frontend (Vercel) and backend (Render) live on different domains, so the
  // cookie must be sameSite:"none" to survive the cross-site request — and
  // "none" requires secure:true (the browser rejects it otherwise). In local
  // dev, both run on localhost so "lax" is fine and avoids needing HTTPS.
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const signupHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { accessToken, refreshToken } = await authService.signup(name, email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  // refreshToken is also returned in the body (not just the cookie) — the
  // frontend and API live on different domains (Vercel/Render), and browsers
  // increasingly block or restrict cross-site cookies (Safari always has;
  // Chrome is moving that way too), which was silently logging everyone out
  // on refresh whenever the cookie didn't survive. The client stores this
  // explicitly and sends it back on /refresh instead of relying on the
  // browser to attach the cookie automatically.
  res.status(201).json({ accessToken, refreshToken });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await authService.login(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  res.json({ accessToken, refreshToken });
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  // Prefer an explicitly-sent token (reliable cross-site) but still accept
  // the cookie as a fallback for same-origin/local-dev setups.
  const token = req.body?.refreshToken || req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, "No refresh token");

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, "User no longer exists");

  const { accessToken, refreshToken } = authService.issueTokens(user.id, user.role as "student" | "admin" | "institution_admin");
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  res.json({ accessToken, refreshToken });
});

export const logoutHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user });
});

export const forgotPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.requestPasswordReset(email);
  // Always the same response, whether or not the email has an account —
  // otherwise this endpoint could be used to enumerate registered emails.
  res.json({ message: "If an account exists for that email, a reset link has been sent." });
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.json({ message: "Password updated. You can now log in." });
});
