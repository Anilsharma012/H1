import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminOverview {
  totalAUM: number;
  activeInvestors: number;
  todayInflows: number;
  payoutDueToday: number;
}

export default function AdminWithdrawals() {
  const [ov, setOv] = useState<AdminOverview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/overview", {
          credentials: "include",
        });
        if (!r.ok) throw new Error("Failed to load overview");
        const j = (await r.json()) as AdminOverview;
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
      <div className="text-2xl font-semibold">Withdrawals</div>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground mb-2">Overview</div>
          {err && <div className="text-destructive text-sm">{err}</div>}
          {ov && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total AUM</div>
              <div className="text-right font-medium">{inr(ov.totalAUM)}</div>
              <div>Today Inflows</div>
              <div className="text-right font-medium">
                {inr(ov.todayInflows)}
              </div>
              <div>Payouts Due (count)</div>
              <div className="text-right font-medium">{ov.payoutDueToday}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground">
            No withdrawals listing API exists in this project yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
