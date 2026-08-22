import { Schema, model, InferSchemaType } from "mongoose";

const resourceSchema = new Schema(
  {
    nodeId: { type: Schema.Types.ObjectId, ref: "RoadmapNode", required: true, index: true },
    roadmapSlug: { type: String, required: true, index: true },
    nodeSlug: { type: String, required: true, index: true },
    type: { type: String, enum: ["video", "article", "practice"], required: true },
    tag: { type: String, enum: ["recommended", "alternative", "quick", "deep_dive", "hindi"], required: true },
    title: { type: String, required: true },
    source: { type: String, required: true }, // creator/channel — always credited, never hidden
    language: { type: String, enum: ["English", "Hindi", "Hinglish"], required: true },
    url: { type: String }, // for article/practice resources
    // Video-specific — metadata only. No video bytes are ever stored; playback
    // is via the official YouTube IFrame Player API using this ID.
    videoId: { type: String },
    durationMinutes: { type: Number },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    // Optional: ties this resource to one specific lesson step (0-based index
    // into that topic's lesson list, e.g. 0 = "Introduction", 1 = "Core concept").
    // Undefined/omitted = applies to the whole topic (old behaviour, used as
    // the fallback video for any lesson step that has none of its own).
    lessonIndex: { type: Number, min: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ roadmapSlug: 1, nodeSlug: 1 });

export type ResourceDoc = InferSchemaType<typeof resourceSchema>;
export const Resource = model("Resource", resourceSchema);
