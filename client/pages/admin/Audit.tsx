import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminOverview {
  totalAUM: number;
  activeInvestors: number;
  todayInflows: number;
  payoutDueToday: number;
}

export default function AdminAudit() {
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

  return (
    <div className="grid gap-4">
      <div className="text-2xl font-semibold">Audit Logs</div>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground mb-2">
            System Summary
          </div>
          {err && <div className="text-destructive text-sm">{err}</div>}
          {ov && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Active Investors</div>
              <div className="text-right font-medium">{ov.activeInvestors}</div>
              <div>Payouts Due (count)</div>
              <div className="text-right font-medium">{ov.payoutDueToday}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground">
            No audit log API exists in this project yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
