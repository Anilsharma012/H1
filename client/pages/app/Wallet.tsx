import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AppOverview {
  totalInvested: number;
  currentEarnings: number;
  pendingWithdrawals: number;
  nextPayoutDate: string | null;
  referralEarnings: number;
}

export default function Wallet() {
  const [ov, setOv] = useState<AppOverview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/app/overview", { credentials: "include" });
        if (!r.ok) throw new Error("Failed to load wallet");
        const j = (await r.json()) as AppOverview;
        if (!cancelled) setOv(j);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load wallet");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const inr = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const fmtDate = (v: string | null) => (v ? new Date(v).toDateString() : "—");

  return (
    <div className="grid gap-4">
      <div className="text-2xl font-semibold">Wallet</div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground mb-2">Balances</div>
            {err && <div className="text-destructive text-sm">{err}</div>}
            {ov && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Invested</div>
                <div className="text-right font-medium">
                  {inr(ov.totalInvested)}
                </div>
                <div>Current Earnings</div>
                <div className="text-right font-medium">
                  {inr(ov.currentEarnings)}
                </div>
                <div>Referral Earnings</div>
                <div className="text-right font-medium">
                  {inr(ov.referralEarnings)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground mb-2">Status</div>
            {ov && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Pending Withdrawals</div>
                <div className="text-right font-medium">
                  {ov.pendingWithdrawals}
                </div>
                <div>Next Payout</div>
                <div className="text-right font-medium">
                  {fmtDate(ov.nextPayoutDate)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
