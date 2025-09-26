import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AppOverview {
  totalInvested: number;
  currentEarnings: number;
  pendingWithdrawals: number;
  nextPayoutDate: string | null;
  referralEarnings: number;
}

export default function Referrals() {
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

  return (
    <div className="grid gap-4">
      <div className="text-2xl font-semibold">Referrals</div>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground mb-2">Summary</div>
          {err && <div className="text-destructive text-sm">{err}</div>}
          {ov && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Referral Earnings</div>
              <div className="text-right font-medium">
                {inr(ov.referralEarnings)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Referral listing and invite features are not implemented in this
          project yet.
        </CardContent>
      </Card>
    </div>
  );
}
