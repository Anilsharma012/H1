import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import type { UserDoc } from "../models/User";
import { isDbConnected } from "../db";
import type { RequestHandler } from "express";

const JWT_COOKIE = "token";
const JWT_EXPIRES = 60 * 60 * 24 * 7; // 7 days

function signToken(u: UserDoc) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign({ sub: String(u._id), roles: u.roles }, secret, {
    expiresIn: JWT_EXPIRES,
  });
}

function setCookie(res: any, token: string) {
  res.cookie(JWT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: JWT_EXPIRES * 1000,
    path: "/",
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const token = (req as any).cookies?.[JWT_COOKIE];
    const secret = process.env.JWT_SECRET || "dev-secret";
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, secret) as any;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const u = (req as any).user;
  if (!u || !u.roles?.includes("admin"))
    return res.status(403).json({ message: "Forbidden" });
  next();
};

const signupSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    referralId: z.string().trim().optional(),
    admin: z.boolean().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signup: RequestHandler = async (req, res) => {
  if (!isDbConnected())
    return res.status(503).json({ message: "Database not configured" });
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body" });
  const { name, email, phone, password, admin, referralId } = parsed.data;
  if (!email && !phone)
    return res.status(400).json({ message: "Email or phone required" });
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) return res.status(409).json({ message: "User already exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    referral: {
      referredBy: referralId || undefined,
    },
    roles: admin ? ["user", "admin"] : ["user"],
  });
  if (!user.referral?.code) {
    user.referral = {
      ...(user.referral || {}),
      code: (user._id as any).toString().slice(-8),
    } as any;
    await user.save();
  }
  const token = signToken(user as any);
  setCookie(res, token);
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    referral: {
      code: user.referral?.code,
      referredBy: user.referral?.referredBy || null,
    },
  });
};

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    password: z.string().min(6),
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: "Email or phone required",
    path: ["email"],
  });

export const login: RequestHandler = async (req, res) => {
  if (!isDbConnected())
    return res.status(503).json({ message: "Database not configured" });
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body" });
  const { email, phone, password } = parsed.data;
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signToken(user as any);
  setCookie(res, token);
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
  });
};

export const me: RequestHandler = async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(null);
    const token = (req as any).cookies?.[JWT_COOKIE];
    if (!token) return res.json(null);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret",
    ) as any;
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.json(null);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      kyc: {
        status: (user as any).kyc?.status || "not_submitted",
        remarks: (user as any).kyc?.remarks || "",
      },
    });
  } catch {
    res.json(null);
  }
};

export const logout: RequestHandler = async (_req, res) => {
  res.clearCookie(JWT_COOKIE, { path: "/" });
  res.json({ ok: true });
};

const bootstrapSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    token: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: "Email or phone required",
  });

export const bootstrapAdmin: RequestHandler = async (req, res) => {
  if (!isDbConnected())
    return res.status(503).json({ message: "Database not configured" });
  const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!bootstrapToken)
    return res
      .status(503)
      .json({ message: "ADMIN_BOOTSTRAP_TOKEN not set on server" });
  const parsed = bootstrapSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body" });
  const { name, email, phone, password, token } = parsed.data;
  if (token !== bootstrapToken)
    return res.status(401).json({ message: "Invalid token" });
  const exists = await User.findOne({ roles: { $in: ["admin"] } });
  if (exists) return res.status(403).json({ message: "Already initialized" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    roles: ["user", "admin"],
  });
  const jwtToken = signToken(user as any);
  setCookie(res, jwtToken);
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
  });
};

export const adminLogin: RequestHandler = async (req, res) => {
  if (!isDbConnected())
    return res.status(503).json({ message: "Database not configured" });
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body" });
  const { email, phone, password } = parsed.data;
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  if (!user || !user.roles?.includes("admin"))
    return res.status(401).json({ message: "Unauthorized" });
  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signToken(user as any);
  setCookie(res, token);
  res.json({ ok: true });
};
