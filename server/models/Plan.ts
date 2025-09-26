import mongoose, { Schema, InferSchemaType, model } from "mongoose";

const PlanSchema = new Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    startMonth: { type: Number, required: true, min: 1, max: 60 },
    endMonth: { type: Number, required: true, min: 1, max: 60 },
    annualReturnPercent: { type: Number, required: true, min: 0, max: 200 },
    minInvestment: { type: Number, required: true, default: 10000 },
    isActive: { type: Boolean, required: true, default: true },
    sortOrder: { type: Number, required: true, default: 0, index: true },
  },
  { timestamps: true, collection: "plans" },
);

PlanSchema.index({ startMonth: 1, endMonth: 1 }, { unique: true });

export type PlanDoc = InferSchemaType<typeof PlanSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Plan =
  (mongoose.models.Plan as ReturnType<typeof model> | undefined) ||
  model("Plan", PlanSchema);
