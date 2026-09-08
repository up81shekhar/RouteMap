import { Schema, model, InferSchemaType } from "mongoose";

const userBadgeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    badgeId: { type: String, required: true }, // e.g. "first_lesson", "streak_7"
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export type UserBadgeDoc = InferSchemaType<typeof userBadgeSchema>;
export const UserBadge = model("UserBadge", userBadgeSchema);
