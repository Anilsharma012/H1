import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Overview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/overview", { credentials: "include" })
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

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { k: "totalAUM", label: "Total AUM", fmt: fmtINR },
        { k: "activeInvestors", label: "Active Investors", fmt: fmtInt },
        { k: "todayInflows", label: "Today Inflows", fmt: fmtINR },
        { k: "payoutDueToday", label: "Payout Due Today", fmt: fmtInt },
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
