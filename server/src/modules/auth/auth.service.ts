import bcrypt from "bcryptjs";
import { User } from "../../models/User.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/asyncHandler.js";

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

function issueTokens(userId: string, role: "student" | "admin") {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });
  return { accessToken, refreshToken };
}

export { issueTokens };
