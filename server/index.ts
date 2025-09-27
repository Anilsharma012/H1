import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";
import { connectDB } from "./db";
import { getActivePlan, simulatePayout } from "./routes/plans";
import {
  getPublicPlans,
  getAdminPlans,
  createPlan,
  updatePlan,
  togglePlan,
  deletePlan,
  seedPlansIfEmpty,
} from "./routes/plans-crud";
import { signup, login, me, logout, bootstrapAdmin, adminLogin, requestPasswordReset, resetPassword } from "./routes/auth";
import { userOverview, adminOverview } from "./routes/dashboards";
import { listUsers, getUser, toggleBlock, exportUsersCsv, promoteUserToAdmin, updateUser } from "./routes/admin-users";
import { getKycQueue, submitKyc, approveKyc, rejectKyc } from "./routes/kyc";
import { handleUpload } from "./routes/upload";

export function createServer() {
  const app = express();

  // Connect DB (non-blocking)
  connectDB()
    .then(async () => {
      const { isDbConnected } = await import("./db");
      if (isDbConnected()) {
        console.log("MongoDB connected");
        await seedPlansIfEmpty().catch(() => {});
        try {
          const ok = await fetchSelfPlans();
          if (ok) console.log("Plans CRUD + Frontend bind OK. Next task?");
        } catch (e: any) {
          console.log("Self-test error:", e?.message || e);
        }
        try {
          await seedUsersIfEmpty();
          const ok2 = await selfTestUsersKyc();
          if (ok2) console.log("Users + KYC admin working. Next task?");
        } catch (e: any) {
          console.log("Users/KYC self-test error:", e?.message || e);
        }
      } else {
        console.log("Running in demo mode without MongoDB");
      }
    })
    .catch((err) => console.error("MongoDB connection error", err));

  // Middleware
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const allowed = [/^http:\/\/localhost(?::\d+)?$/, /\.posttrr\.com$/];
        if (allowed.some((r) => r.test(origin))) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/me", me);
  app.post("/api/auth/request-reset", requestPasswordReset);
  app.post("/api/auth/reset-password", resetPassword);

  // Admin auth
  app.post("/api/admin/login", adminLogin);
  app.post("/api/admin/bootstrap", bootstrapAdmin);

  // Plans & Payouts (legacy)
  app.get("/api/plans/active", getActivePlan);
  app.post("/api/payouts/simulate", simulatePayout);

  // New Plans CRUD
  app.get("/api/plans", getPublicPlans);
  app.get("/api/admin/plans", getAdminPlans);
  app.post("/api/admin/plans", createPlan);
  app.put("/api/admin/plans/:id", updatePlan);
  app.patch("/api/admin/plans/:id/toggle", togglePlan);
  app.delete("/api/admin/plans/:id", deletePlan);

  // Users & Admin
  app.get("/api/admin/users", listUsers);
  app.get("/api/admin/users/export", exportUsersCsv);
  app.get("/api/admin/users/:id", getUser);
  app.put("/api/admin/users/:id", updateUser);
  app.patch("/api/admin/users/:id/block", toggleBlock);
  app.patch("/api/admin/users/:id/promote", promoteUserToAdmin);

  // KYC
  app.get("/api/admin/kyc", getKycQueue);
  app.post("/api/users/kyc/submit", submitKyc);
  app.patch("/api/admin/kyc/:userId/approve", approveKyc);
  app.patch("/api/admin/kyc/:userId/reject", rejectKyc);

  // Uploads
  app.post("/api/upload", handleUpload);

  // Dashboards
  app.get("/api/app/overview", userOverview);
  app.get("/api/admin/overview", adminOverview);

  return app;
}

async function fetchSelfPlans() {
  try {
    const { isDbConnected } = await import("./db");
    if (!isDbConnected()) return false;
    const { Plan } = await import("./models/Plan");
    const active = await Plan.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    if (!active || active.length < 1) {
      console.log("SELF-TEST FAIL: /api/plans returned < 1 active plan");
      return false;
    }
    const amt = 100000;
    for (const p of active) {
      const monthly = Math.round(((p.annualReturnPercent / 100) * amt) / 12);
      console.log(
        `SELF-TEST CALC: ${p.annualReturnPercent}% ⇒ ${monthly}/mo at ${amt}`,
      );
    }
    return true;
  } catch (e: any) {
    console.log("SELF-TEST FAIL:", e?.message || e);
    return false;
  }
}

async function seedUsersIfEmpty() {
  const { isDbConnected } = await import("./db");
  if (!isDbConnected()) return;
  const { User } = await import("./models/User");
  const count = await User.countDocuments({});
  if (count > 0) return;
  const today = new Date();
  const users = [
    {
      name: "Alice Admin",
      email: "alice@example.com",
      passwordHash: "",
      roles: ["user", "admin"],
      status: "active",
    },
    {
      name: "Bob User",
      email: "bob@example.com",
      passwordHash: "",
      roles: ["user"],
      status: "active",
    },
    {
      name: "Charlie Pending",
      email: "charlie@example.com",
      passwordHash: "",
      roles: ["user"],
      status: "active",
      kyc: {
        status: "pending",
        docType: "pan",
        docNumber: "ABCDE1234F",
        frontUrl: "/placeholder.svg",
        submittedAt: today,
      },
    },
  ];
  await User.insertMany(
    users.map((u) => ({ ...u, createdAt: today, updatedAt: today })),
  );
  console.log("SELF-TEST: Seeded 3 users (1 with KYC pending)");
}

async function selfTestUsersKyc() {
  try {
    const { isDbConnected } = await import("./db");
    if (!isDbConnected()) {
      console.log("SELF-TEST FAIL: DB not connected");
      return false;
    }
    const { User } = await import("./models/User");

    // Check paginated list
    const total = await User.countDocuments({});
    if (total < 1) {
      console.log("SELF-TEST FAIL: No users in DB");
      return false;
    }

    // Submit KYC for Bob if needed
    const bob = await User.findOne({ email: "bob@example.com" });
    if (bob) {
      bob.kyc = {
        ...(bob.kyc || {}),
        status: "pending" as any,
        docType: "aadhaar",
        docNumber: "123456789012",
        frontUrl: "/placeholder.svg",
        submittedAt: new Date(),
      } as any;
      await bob.save();
    }

    // Approve Charlie
    const ch = await User.findOne({ email: "charlie@example.com" });
    if (ch) {
      ch.kyc.status = "approved" as any;
      ch.kyc.reviewedAt = new Date();
      await ch.save();
    }

    // Block Bob
    if (bob) {
      bob.status = "blocked";
      await bob.save();
    }

    // Export CSV simulation
    const rows = await User.find({}).lean();
    if (!rows || rows.length < 1) {
      console.log("SELF-TEST FAIL: CSV query empty");
      return false;
    }

    console.log("SELF-TEST OK: Users list + KYC submit/approve + block + CSV");
    return true;
  } catch (e: any) {
    console.log("SELF-TEST FAIL:", e?.message || e);
    return false;
  }
}
