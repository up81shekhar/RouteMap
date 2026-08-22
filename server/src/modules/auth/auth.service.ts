import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { User } from "../../models/User.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/asyncHandler.js";
import { sendPasswordResetEmail } from "../../utils/email.js";
import { env } from "../../config/env.js";

export async function signup(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: "student" });
  return issueTokens(user.id, "student");
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user?.passwordHash) throw new ApiError(401, "Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  return issueTokens(user.id, user.role as "student" | "admin");
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email });
  // Always behave the same whether or not the account exists — the caller
  // (controller) returns one generic message either way, so this function
  // simply does nothing further if there's no match. This prevents using
  // "forgot password" to check which emails have an account here.
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const clientOrigin = env.CLIENT_ORIGIN.split(",")[0].trim().replace(/\/$/, "");
  const resetUrl = `${clientOrigin}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpires");

  if (!user) throw new ApiError(400, "This reset link is invalid or has expired. Request a new one.");

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
}

function issueTokens(userId: string, role: "student" | "admin") {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });
  return { accessToken, refreshToken };
}

export { issueTokens };
