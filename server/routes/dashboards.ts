import { RequestHandler } from "express";
import { Investment, Payout, Withdrawal } from "../models/Finance";
import { requireAuth, requireAdmin } from "./auth";
import { isDbConnected } from "../db";

export const userOverview: RequestHandler = [
  requireAuth,
  async (req, res) => {
    if (!isDbConnected()) {
      return res.json({
        totalInvested: 0,
        currentEarnings: 0,
        pendingWithdrawals: 0,
        nextPayoutDate: null,
        referralEarnings: 0,
      });
    }
    const userId = (req as any).user.sub;
    const [investedAgg] = await Investment.aggregate([
      {
        $match: {
          userId: (
            await import("mongoose")
          ).default.Types.ObjectId.createFromHexString(userId),
        },
      },
      { $group: { _id: null, total: { $sum: "$principal" } } },
    ]);
    const totalInvested = investedAgg?.total || 0;
    const currentEarnings = await Payout.aggregate([
      {
        $match: {
          userId: (
            await import("mongoose")
          ).default.Types.ObjectId.createFromHexString(userId),
          status: "paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$netPayout" } } },
    ]).then((r) => r[0]?.total || 0);
    const pendingWithdrawals = await Withdrawal.countDocuments({
      userId,
      status: { $in: ["requested", "approved", "processing"] },
    });
    const nextPayoutDate = await Payout.findOne({
      userId,
      status: { $in: ["scheduled", "processing"] },
    })
      .sort({ createdAt: 1 })
      .then((p) => p?.createdAt ?? null);
    res.json({
      totalInvested,
      currentEarnings,
      pendingWithdrawals,
      nextPayoutDate,
      referralEarnings: 0,
    });
  },
];

export const adminOverview: RequestHandler = [
  requireAuth,
  requireAdmin,
  async (_req, res) => {
    if (!isDbConnected()) {
      return res.json({
        totalAUM: 0,
        activeInvestors: 0,
        todayInflows: 0,
        todayOutflows: 0,
        pendingKYCs: 0,
        pendingWithdrawals: 0,
        payoutDueToday: 0,
        referralCosts: 0,
        chargeIncome: 0,
      });
    }
    const [aumAgg] = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: "$principal" } } },
    ]);
    const totalAUM = aumAgg?.total || 0;
    const activeInvestors = await Investment.distinct("userId").then(
      (ids) => ids.length,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tmr = new Date(today);
    tmr.setDate(today.getDate() + 1);
    const todayInflows = await Investment.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tmr } } },
      { $group: { _id: null, total: { $sum: "$principal" } } },
    ]).then((r) => r[0]?.total || 0);
    const todayOutflows = await Withdrawal.aggregate([
      { $match: { status: "paid", paidAt: { $gte: today, $lt: tmr } } },
      { $group: { _id: null, total: { $sum: "$netAmount" } } },
    ]).then((r) => r[0]?.total || 0);
    const pendingKYCs = await (await import("../models/User")).User.countDocuments({ "kyc.status": "pending" });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: { $in: ["requested", "approved", "processing", "compliance_check"] } });
    const payoutDueToday = await Payout.countDocuments({ status: { $in: ["scheduled", "processing"] } });
    // Optional ledger based metrics
    const referralCosts = await (await import("../models/Finance")).Ledger.aggregate([
      { $match: { type: "referral_payout" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((r) => r[0]?.total || 0);
    const chargeIncome = await (await import("../models/Finance")).Ledger.aggregate([
      { $match: { type: "admin_charge" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((r) => r[0]?.total || 0);

    res.json({ totalAUM, activeInvestors, todayInflows, todayOutflows, pendingKYCs, pendingWithdrawals, payoutDueToday, referralCosts, chargeIncome });
  },
];
