import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, // absent if OAuth-only
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    profile: {
      learningGoals: { type: [String], default: [] },
      preferredLanguage: { type: String, enum: ["en", "hi", "hinglish"], default: "en" },
      dailyAvailableMinutes: { type: Number, default: 30 },
      currentSkillLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
