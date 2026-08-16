import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  // Falls back to both local dev and the known production frontend so CORS
  // still works even if CLIENT_ORIGIN isn't explicitly set on the hosting
  // dashboard (a common source of "CORS error" in production). Comma-
  // separated — see app.ts, which splits and normalizes this list.
  CLIENT_ORIGIN: z.string().default("http://localhost:5173,https://routemap-free.vercel.app"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Fix your .env file — see .env.example at the project root.");
}

export const env = parsed.data;
