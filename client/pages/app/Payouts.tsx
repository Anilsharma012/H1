import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AppOverview {
  totalInvested: number;
  currentEarnings: number;
  pendingWithdrawals: number;
  nextPayoutDate: string | null;
  referralEarnings: number;
}

export default function Payouts() {
  const [ov, setOv] = useState<AppOverview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/app/overview", { credentials: "include" });
        if (!r.ok) throw new Error("Failed to load overview");
        const j = (await r.json()) as AppOverview;
        if (!cancelled) setOv(j);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load overview");
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
      <div className="text-2xl font-semibold">Payouts</div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground mb-2">Summary</div>
            {err && <div className="text-destructive text-sm">{err}</div>}
            {ov && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Current Earnings</div>
                <div className="text-right font-medium">
                  {inr(ov.currentEarnings)}
                </div>
                <div>Next Payout</div>
                <div className="text-right font-medium">
                  {fmtDate(ov.nextPayoutDate)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Payout listing endpoints are not implemented in this project.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
