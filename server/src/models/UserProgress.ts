import { Schema, model, InferSchemaType } from "mongoose";

const userProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    roadmapSlug: { type: String, required: true },
    nodeSlug: { type: String, required: true },
    completedLessonIndices: { type: [Number], default: [] },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userProgressSchema.index({ userId: 1, roadmapSlug: 1, nodeSlug: 1 }, { unique: true });

export type UserProgressDoc = InferSchemaType<typeof userProgressSchema>;
export const UserProgress = model("UserProgress", userProgressSchema);
