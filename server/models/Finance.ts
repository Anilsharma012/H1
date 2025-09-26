import mongoose, { Schema, InferSchemaType, model } from "mongoose";

const InvestmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    principal: { type: Number, required: true },
    method: { type: String, enum: ["upi", "bank", "pg"], default: "upi" },
    proofUrl: String,
    utr: String,
    status: {
      type: String,
      enum: [
        "initiated",
        "under_review",
        "approved",
        "active",
        "completed",
        "cancelled",
      ],
      default: "initiated",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    planVersion: { type: Number, default: 1 },
    referredBy: String,
    notes: String,
  },
  { timestamps: true },
);

const LedgerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    investmentId: { type: Schema.Types.ObjectId, ref: "Investment" },
    type: String,
    amount: Number,
    direction: { type: String, enum: ["credit", "debit"], required: true },
    balanceAfter: Number,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true },
);

const PayoutSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    investmentId: { type: Schema.Types.ObjectId, ref: "Investment" },
    monthNo: Number,
    grossPayout: Number,
    adminCharge: Number,
    booster: Number,
    tds: Number,
    netPayout: Number,
    status: {
      type: String,
      enum: ["scheduled", "processing", "paid", "failed", "reprocessing"],
      default: "scheduled",
    },
    paidAt: Date,
    rrn: String,
    gateway: String,
  },
  { timestamps: true },
);

const WithdrawalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    amount: Number,
    source: {
      type: String,
      enum: ["earnings", "referral"],
      default: "earnings",
    },
    charges: Number,
    tds: Number,
    netAmount: Number,
    status: {
      type: String,
      enum: [
        "requested",
        "compliance_check",
        "approved",
        "processing",
        "paid",
        "rejected",
      ],
      default: "requested",
    },
    reason: String,
    paidAt: Date,
    rrn: String,
  },
  { timestamps: true },
);

export type InvestmentDoc = InferSchemaType<typeof InvestmentSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type LedgerDoc = InferSchemaType<typeof LedgerSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type PayoutDoc = InferSchemaType<typeof PayoutSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type WithdrawalDoc = InferSchemaType<typeof WithdrawalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Investment =
  (mongoose.models.Investment as ReturnType<typeof model> | undefined) ||
  model("Investment", InvestmentSchema);
export const Ledger =
  (mongoose.models.Ledger as ReturnType<typeof model> | undefined) ||
  model("Ledger", LedgerSchema);
export const Payout =
  (mongoose.models.Payout as ReturnType<typeof model> | undefined) ||
  model("Payout", PayoutSchema);
export const Withdrawal =
  (mongoose.models.Withdrawal as ReturnType<typeof model> | undefined) ||
  model("Withdrawal", WithdrawalSchema);
