import { RequestHandler } from "express";
import { PlanRule } from "../models/PlanRule";
import { isDbConnected } from "../db";

const defaultPlan = {
  name: "Vyomkesh Base Plan",
  minAmount: 10000,
  specialMin: 200000,
  bands: [
    { fromMonth: 1, toMonth: 3, monthlyRate: 0.04 },
    { fromMonth: 4, toMonth: 6, monthlyRate: 0.05 },
    { fromMonth: 7, toMonth: 9, monthlyRate: 0.06 },
    { fromMonth: 10, toMonth: 120, monthlyRate: 0.07 },
  ],
  specialRate: 0.1,
  adminCharge: 0.025,
  booster: 0.1,
  active: true,
  version: 1,
};

export const getActivePlan: RequestHandler = async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        ...defaultPlan,
        _id: "demo",
        effectiveFrom: new Date().toISOString(),
      });
    }
    let plan = await PlanRule.findOne({ active: true }).sort({
      effectiveFrom: -1,
    });
    if (!plan) {
      plan = await PlanRule.create(defaultPlan as any);
    }
    res.json(plan);
  } catch (err) {
    console.error("/plans/active error", err);
    res.status(500).json({ message: "Failed to load plan" });
  }
};

export const simulatePayout: RequestHandler = async (req, res) => {
  try {
    const { amount, month, boosterApplied } = req.body as {
      amount: number;
      month: number;
      boosterApplied?: boolean;
    };

    if (typeof amount !== "number" || typeof month !== "number") {
      return res
        .status(400)
        .json({ message: "amount and month are required numbers" });
    }

    let plan: any;
    if (!isDbConnected()) {
      plan = { ...defaultPlan } as any;
    } else {
      plan = await PlanRule.findOne({ active: true }).sort({
        effectiveFrom: -1,
      });
      if (!plan) plan = await PlanRule.create(defaultPlan as any);
    }

    const principal = amount;
    let grossMonthly = 0;

    if (principal >= plan.specialMin) {
      grossMonthly = principal * plan.specialRate;
    } else {
      const band = plan.bands.find(
        (b) => month >= b.fromMonth && month <= b.toMonth,
      );
      const rate = band
        ? band.monthlyRate
        : plan.bands[plan.bands.length - 1].monthlyRate;
      grossMonthly = principal * rate;
    }

    const adminCharge = +(grossMonthly * plan.adminCharge).toFixed(2);
    const booster = boosterApplied
      ? +(grossMonthly * plan.booster).toFixed(2)
      : 0;
    const netPayout = +(grossMonthly - adminCharge - booster).toFixed(2);

    res.json({
      principal,
      month,
      grossMonthly,
      adminCharge,
      booster,
      netPayout,
      rates: {
        adminCharge: plan.adminCharge,
        booster: plan.booster,
      },
    });
  } catch (err) {
    console.error("/payouts/simulate error", err);
    res.status(500).json({ message: "Failed to simulate payout" });
  }
};
