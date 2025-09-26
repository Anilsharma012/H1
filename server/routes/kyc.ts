import { RequestHandler } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "./auth";
import { User } from "../models/User";
import mongoose from "mongoose";
import { isDbConnected } from "../db";

const queueQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

function maskDoc(num?: string | null) {
  if (!num) return "";
  const s = String(num);
  const last4 = s.slice(-4);
  return `${"*".repeat(Math.max(0, s.length - 4))}${last4}`;
}

export const getKycQueue: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.json({ items: [], total: 0, page: 1, limit: 20 });
    const parsed = queueQuerySchema.safeParse(req.query);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid query" });
    const { status, page, limit } = parsed.data;
    const filter: any = { "kyc.status": status };
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      User.find(filter)
        .sort({ "kyc.submittedAt": status === "pending" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    const items = rows.map((u: any) => ({
      userId: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      docType: u.kyc?.docType,
      docNumberMasked: maskDoc(u.kyc?.docNumber),
      frontUrl: u.kyc?.frontUrl,
      backUrl: u.kyc?.backUrl,
      selfieUrl: u.kyc?.selfieUrl,
      submittedAt: u.kyc?.submittedAt,
    }));
    res.json({ items, total, page, limit });
  },
];

const docRegex: Record<string, RegExp> = {
  aadhaar: /^[0-9]{12}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
  passport: /^[A-Z][0-9]{7}$/i,
  other: /^[A-Z0-9\-]{4,}$/i,
};

const submitSchema = z.object({
  docType: z.enum(["aadhaar", "pan", "passport", "other"]),
  docNumber: z.string().trim().min(4).max(32),
  frontUrl: z.string().url(),
  backUrl: z.string().url().optional(),
  selfieUrl: z.string().url().optional(),
});

const rateMap = new Map<string, number>();

export const submitKyc: RequestHandler = [
  requireAuth,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "DB not configured" });
    const userId = (req as any).user.sub as string;
    const now = Date.now();
    const last = rateMap.get(userId) || 0;
    if (now - last < 60_000)
      return res.status(429).json({ message: "Too many requests" });

    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body" });
    const { docType, docNumber, frontUrl, backUrl, selfieUrl } = parsed.data;
    const re = docRegex[docType];
    if (!re.test(docNumber))
      return res.status(400).json({ message: "Invalid document number" });

    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ message: "User not found" });
    if (u.kyc?.status === "pending")
      return res.status(409).json({ message: "KYC already pending" });

    u.kyc = {
      ...(u.kyc || {}),
      status: "pending",
      docType,
      docNumber: docNumber.trim(),
      frontUrl,
      backUrl,
      selfieUrl,
      remarks: "",
      submittedAt: new Date(),
      reviewedAt: undefined,
      reviewerId: undefined,
    } as any;
    await u.save();
    rateMap.set(userId, now);
    res.json({ ok: true, status: u.kyc.status });
  },
];

export const approveKyc: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "DB not configured" });
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).json({ message: "Invalid id" });
    const adminId = (req as any).user.sub as string;
    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ message: "Not found" });
    if (!u.kyc?.docNumber || !u.kyc?.frontUrl)
      return res.status(400).json({ message: "Missing required KYC fields" });
    u.kyc.status = "approved" as any;
    u.kyc.reviewedAt = new Date();
    u.kyc.reviewerId = new (mongoose as any).Types.ObjectId(adminId);
    await u.save();
    res.json({ ok: true });
  },
];

const rejectSchema = z.object({ remarks: z.string().trim().min(1).max(500) });

export const rejectKyc: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "DB not configured" });
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).json({ message: "Invalid id" });
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body" });
    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ message: "Not found" });
    u.kyc.status = "rejected" as any;
    u.kyc.remarks = parsed.data.remarks;
    u.kyc.reviewedAt = new Date();
    u.kyc.reviewerId = new (mongoose as any).Types.ObjectId(
      (req as any).user.sub,
    );
    await u.save();
    res.json({ ok: true });
  },
];
