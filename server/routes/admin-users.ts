import { RequestHandler } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "./auth";
import type { RequestHandler } from "express";
import { User } from "../models/User";
import mongoose from "mongoose";
import { isDbConnected } from "../db";

const listQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["active", "blocked"]).optional(),
  kycStatus: z
    .enum(["not_submitted", "pending", "approved", "rejected"])
    .optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  from: z.string().optional(),
  to: z.string().optional(),
});

function maskDoc(num?: string | null) {
  if (!num) return "";
  const s = String(num);
  const last4 = s.slice(-4);
  return `${"*".repeat(Math.max(0, s.length - 4))}${last4}`;
}

export const listUsers: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected()) return res.json({ items: [], total: 0, stats: {} });
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid query" });
    const { search, role, status, kycStatus, page, limit, from, to } =
      parsed.data;

    const filter: any = {};
    if (search) {
      const s = String(search).trim();
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
      ];
    }
    if (role === "admin") filter.roles = { $in: ["admin"] };
    if (role === "user") filter.roles = { $nin: ["admin"] };
    if (status) filter.status = status;
    if (kycStatus) filter["kyc.status"] = kycStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;
    const [itemsRaw, total, stats] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
      computeStats(),
    ]);

    const items = itemsRaw.map((u: any) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.roles?.includes("admin") ? "admin" : "user",
      status: u.status,
      kycStatus: u.kyc?.status || "not_submitted",
      kycDocMasked: maskDoc(u.kyc?.docNumber),
      createdAt: u.createdAt,
    }));

    res.json({ items, total, page, limit, stats });
  },
];

async function computeStats() {
  const total = await User.countDocuments({});
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tmr = new Date(today);
  tmr.setDate(today.getDate() + 1);
  const todaySignups = await User.countDocuments({
    createdAt: { $gte: today, $lt: tmr },
  });
  const active = await User.countDocuments({ status: "active" });
  const blocked = await User.countDocuments({ status: "blocked" });
  const kycPending = await User.countDocuments({ "kyc.status": "pending" });
  const kycApproved = await User.countDocuments({ "kyc.status": "approved" });
  const kycRejected = await User.countDocuments({ "kyc.status": "rejected" });
  return {
    total,
    todaySignups,
    active,
    blocked,
    kycPending,
    kycApproved,
    kycRejected,
  };
}

export const getUser: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "DB not configured" });
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });
    const u = await User.findById(id).lean();
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      roles: u.roles,
      status: u.status,
      createdAt: u.createdAt,
      kyc: u.kyc || { status: "not_submitted" },
    });
  },
];

export const toggleBlock: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "DB not configured" });
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ message: "Not found" });
    u.status = u.status === "active" ? "blocked" : "active";
    await u.save();
    res.json({ ok: true, status: u.status });
  },
];

export const exportUsersCsv: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "DB not configured" });
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid query" });
    const { search, role, status, kycStatus, from, to } = parsed.data;
    const filter: any = {};
    if (search) {
      const s = String(search).trim();
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
      ];
    }
    if (role === "admin") filter.roles = { $in: ["admin"] };
    if (role === "user") filter.roles = { $nin: ["admin"] };
    if (status) filter.status = status;
    if (kycStatus) filter["kyc.status"] = kycStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const rows = await User.find(filter).sort({ createdAt: -1 }).lean();
    const header = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Status",
      "KYC Status",
      "KYC Doc (masked)",
      "Created",
    ];
    const lines = [header.join(",")];
    for (const u of rows) {
      lines.push(
        [
          quote(u.name),
          quote(u.email || ""),
          quote(u.phone || ""),
          quote(u.roles?.includes("admin") ? "admin" : "user"),
          quote(u.status),
          quote(u.kyc?.status || "not_submitted"),
          quote(maskDoc(u.kyc?.docNumber)),
          quote(new Date(u.createdAt).toISOString()),
        ].join(","),
      );
    }
    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.status(200).send(csv);
  },
];

function quote(v: any) {
  const s = (v ?? "").toString();
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export const promoteUserToAdmin: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    if (!isDbConnected())
      return res.status(503).json({ message: "DB not configured" });
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ message: "Not found" });
    u.roles = Array.from(new Set([...(u.roles || []), "admin"]));
    await u.save();
    res.json({ ok: true, roles: u.roles });
  },
];
