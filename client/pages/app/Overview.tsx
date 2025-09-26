import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Overview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/app/overview", { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((j) => setData(j))
      .catch(() => setData(null));
  }, []);

  const fmtINR = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v)
      ? `₹${v.toLocaleString("en-IN")}`
      : "₹0";
  const fmtInt = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? String(v) : "0";
  const fmtDate = (v: unknown) => (v ? new Date(v as any).toDateString() : "—");

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { k: "totalInvested", label: "Total Invested", fmt: fmtINR },
        { k: "currentEarnings", label: "Current Earnings", fmt: fmtINR },
        { k: "nextPayoutDate", label: "Next Payout Date", fmt: fmtDate },
        { k: "pendingWithdrawals", label: "Pending Withdrawals", fmt: fmtInt },
      ].map((m) => (
        <Card key={m.k}>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">{m.label}</div>
            <div className="mt-2 text-2xl font-bold">
              {data && Object.prototype.hasOwnProperty.call(data, m.k)
                ? m.fmt((data as any)[m.k])
                : "…"}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
