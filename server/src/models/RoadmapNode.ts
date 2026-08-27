import { Schema, model, Types, InferSchemaType } from "mongoose";

const roadmapNodeSchema = new Schema(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true, index: true },
    roadmapSlug: { type: String, required: true, index: true }, // denormalized for fast slug-based lookups
    slug: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    estimatedHours: { type: Number, required: true },
    prerequisites: { type: [String], default: [] }, // sibling node slugs
    tags: { type: [String], default: [] },
    order: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    // "playlist" = auto-created by the YouTube playlist importer (one node
    // per video, title taken verbatim from YouTube — no fixed lesson steps).
    // "manual" = hand-curated the old way (may use the 4-step lesson split).
    contentSource: { type: String, enum: ["manual", "playlist"], default: "manual" },
  },
  { timestamps: true }
);

roadmapNodeSchema.index({ roadmapSlug: 1, slug: 1 }, { unique: true });
roadmapNodeSchema.index({ title: "text", tags: "text" });

export type RoadmapNodeDoc = InferSchemaType<typeof roadmapNodeSchema> & { _id: Types.ObjectId };
export const RoadmapNode = model("RoadmapNode", roadmapNodeSchema);
