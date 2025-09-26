import { RequestHandler } from "express";
import { z } from "zod";
import { Plan } from "../models/Plan";
import { requireAdmin, requireAuth } from "./auth";
import { isDbConnected } from "../db";

const planSchema = z.object({
  title: z.string().trim().optional(),
  startMonth: z.number().int().min(1).max(60),
  endMonth: z.number().int().min(1).max(60),
  annualReturnPercent: z.number().min(0).max(200),
  minInvestment: z.number().min(0).default(10000),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  force: z.boolean().optional(),
});

function autoTitle(start: number, end: number, title?: string) {
  const t = title?.trim();
  return t && t.length > 0 ? t : `${start} to ${end} months`;
}

async function hasOverlap(start: number, end: number, excludeId?: string) {
  const { isDbConnected } = await import("../db");
  if (!isDbConnected()) return false;
  const q: any = { isActive: true };
  if (excludeId) q._id = { $ne: excludeId } as any;
  const plans = await Plan.find(q).lean();
  return plans.some((p) => !(end < p.startMonth || start > p.endMonth));
}

const demoPlans = [
  {
    _id: "d1",
    title: "1 to 3 months",
    startMonth: 1,
    endMonth: 3,
    annualReturnPercent: 36,
    minInvestment: 100000,
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: "d2",
    title: "3 to 6 months",
    startMonth: 3,
    endMonth: 6,
    annualReturnPercent: 48,
    minInvestment: 100000,
    isActive: true,
    sortOrder: 2,
  },
  {
    _id: "d3",
    title: "6 to 9 months",
    startMonth: 6,
    endMonth: 9,
    annualReturnPercent: 60,
    minInvestment: 100000,
    isActive: true,
    sortOrder: 3,
  },
];

export const getPublicPlans: RequestHandler = async (_req, res) => {
  if (!isDbConnected()) return res.json(demoPlans);
  const plans = await Plan.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  res.json(plans);
};

export const getAdminPlans: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (_req, res) => {
    if (!isDbConnected()) return res.json(demoPlans);
    const plans = await Plan.find({})
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    res.json(plans);
  },
];

export const createPlan: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "Database not configured" });
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body" });
    const {
      startMonth,
      endMonth,
      annualReturnPercent,
      minInvestment,
      isActive = true,
      sortOrder = 0,
      force,
      title,
    } = parsed.data;
    if (startMonth > endMonth)
      return res
        .status(400)
        .json({ message: "startMonth must be <= endMonth" });
    if (!force && (await hasOverlap(startMonth, endMonth))) {
      return res.status(409).json({
        message: "Overlaps with existing active plan",
        code: "OVERLAP",
      });
    }
    try {
      const doc = await Plan.create({
        title: autoTitle(startMonth, endMonth, title),
        startMonth,
        endMonth,
        annualReturnPercent,
        minInvestment,
        isActive,
        sortOrder,
      });
      res.status(201).json(doc);
    } catch (e: any) {
      if (e?.code === 11000)
        return res
          .status(409)
          .json({ message: "Duplicate title or range", code: "DUPLICATE" });
      res.status(500).json({ message: "Failed to create" });
    }
  },
];

export const updatePlan: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "Database not configured" });
    const { id } = req.params;
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body" });
    const {
      startMonth,
      endMonth,
      annualReturnPercent,
      minInvestment,
      isActive,
      sortOrder,
      title,
      force,
    } = parsed.data;
    if (startMonth > endMonth)
      return res
        .status(400)
        .json({ message: "startMonth must be <= endMonth" });
    if (!force && (await hasOverlap(startMonth, endMonth, id))) {
      return res.status(409).json({
        message: "Overlaps with existing active plan",
        code: "OVERLAP",
      });
    }
    try {
      const updated = await Plan.findByIdAndUpdate(
        id,
        {
          $set: {
            title: autoTitle(startMonth, endMonth, title),
            startMonth,
            endMonth,
            annualReturnPercent,
            minInvestment,
            ...(typeof isActive === "boolean" ? { isActive } : {}),
            ...(typeof sortOrder === "number" ? { sortOrder } : {}),
          },
        },
        { new: true, runValidators: true },
      );
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e: any) {
      if (e?.code === 11000)
        return res
          .status(409)
          .json({ message: "Duplicate title or range", code: "DUPLICATE" });
      res.status(500).json({ message: "Failed to update" });
    }
  },
];

export const togglePlan: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "Database not configured" });
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) return res.status(404).json({ message: "Not found" });
    plan.isActive = !plan.isActive;
    await plan.save();
    res.json(plan);
  },
];

export const deletePlan: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "Database not configured" });
    const { id } = req.params;
    await Plan.findByIdAndDelete(id);
    res.json({ ok: true });
  },
];

export async function seedPlansIfEmpty() {
  if (!isDbConnected()) return;
  const count = await Plan.countDocuments();
  if (count > 0) return;
  const seed = [
    { startMonth: 1, endMonth: 3, annualReturnPercent: 36, sortOrder: 1 },
    { startMonth: 3, endMonth: 6, annualReturnPercent: 48, sortOrder: 2 },
    { startMonth: 6, endMonth: 9, annualReturnPercent: 60, sortOrder: 3 },
    { startMonth: 9, endMonth: 12, annualReturnPercent: 72, sortOrder: 4 },
    { startMonth: 12, endMonth: 15, annualReturnPercent: 84, sortOrder: 5 },
  ];
  await Plan.insertMany(
    seed.map((s) => ({
      title: `${s.startMonth} to ${s.endMonth} months`,
      minInvestment: 100000,
      isActive: true,
      ...s,
    })),
  );
}
