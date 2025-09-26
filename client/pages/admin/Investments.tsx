import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminOverview {
  totalAUM: number;
  activeInvestors: number;
  todayInflows: number;
  payoutDueToday: number;
}

export default function AdminInvestments() {
  const [ov, setOv] = useState<AdminOverview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/overview", { credentials: "include" })
      .then(async (r) =>
        r.ok ? r.json() : Promise.reject(new Error("Failed to load overview")),
      )
      .then((j) => !cancelled && setOv(j as AdminOverview))
      .catch(
        (e) => !cancelled && setErr(e.message || "Failed to load overview"),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const inr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  return (
    <div className="grid gap-4">
      <div className="text-2xl font-semibold">Investments</div>
      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground mb-2">Overview</div>
          {err && <div className="text-destructive text-sm">{err}</div>}
          {ov && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total AUM</div>
              <div className="text-right font-medium">{inr(ov.totalAUM)}</div>
              <div>Active Investors</div>
              <div className="text-right font-medium">{ov.activeInvestors}</div>
              <div>Today Inflows</div>
              <div className="text-right font-medium">
                {inr(ov.todayInflows)}
              </div>
              <div>Payout Due Today</div>
              <div className="text-right font-medium">{ov.payoutDueToday}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
