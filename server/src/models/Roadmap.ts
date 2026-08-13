import { Schema, model, InferSchemaType } from "mongoose";

const roadmapSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    lineCode: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["tech", "exam", "school", "skill"], required: true },
    color: { type: String, enum: ["coral", "teal", "violet", "amber"], required: true },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    estimatedDurationHours: { type: Number, required: true },
    prerequisites: { type: [String], default: [] },
    careerOutcomes: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roadmapSchema.index({ title: "text", description: "text" });

export type RoadmapDoc = InferSchemaType<typeof roadmapSchema>;
export const Roadmap = model("Roadmap", roadmapSchema);
