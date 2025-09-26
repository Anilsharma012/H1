import mongoose, { Schema, InferSchemaType, model } from "mongoose";

const BandSchema = new Schema(
  {
    fromMonth: { type: Number, required: true },
    toMonth: { type: Number, required: true },
    monthlyRate: { type: Number, required: true },
  },
  { _id: false },
);

const PlanRuleSchema = new Schema(
  {
    name: { type: String, required: true },
    minAmount: { type: Number, required: true, default: 10000 },
    specialMin: { type: Number, required: true, default: 200000 },
    bands: { type: [BandSchema], required: true },
    specialRate: { type: Number, required: true, default: 0.1 },
    adminCharge: { type: Number, required: true, default: 0.025 },
    booster: { type: Number, required: true, default: 0.1 },
    active: { type: Boolean, default: true },
    version: { type: Number, required: true, default: 1 },
    effectiveFrom: { type: Date, required: true, default: () => new Date() },
    createdBy: { type: String },
  },
  { timestamps: true },
);

export type PlanRuleDoc = InferSchemaType<typeof PlanRuleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PlanRule =
  (mongoose.models.PlanRule as ReturnType<typeof model> | undefined) ||
  model("PlanRule", PlanRuleSchema);
