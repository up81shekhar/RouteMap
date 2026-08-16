import { Schema, model, InferSchemaType } from "mongoose";

const practiceQuestionSchema = new Schema(
  {
    nodeId: { type: Schema.Types.ObjectId, ref: "RoadmapNode", required: true, index: true },
    roadmapSlug: { type: String, required: true, index: true },
    nodeSlug: { type: String, required: true, index: true },
    type: { type: String, enum: ["mcq", "coding", "concept", "interview"], required: true, default: "mcq" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true, default: "easy" },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] }, // used for type: "mcq"
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

practiceQuestionSchema.index({ roadmapSlug: 1, nodeSlug: 1 });

export type PracticeQuestionDoc = InferSchemaType<typeof practiceQuestionSchema>;
export const PracticeQuestion = model("PracticeQuestion", practiceQuestionSchema);
