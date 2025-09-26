import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PlanBand {
  fromMonth: number;
  toMonth: number;
  monthlyRate: number;
}

interface PlanRuleResponse {
  name: string;
  minAmount: number;
  specialMin: number;
  bands: PlanBand[];
  specialRate: number;
  adminCharge: number;
  booster: number;
  active: boolean;
  version: number;
}

interface SimulationResponse {
  principal: number;
  month: number;
  grossMonthly: number;
  adminCharge: number;
  booster: number;
  netPayout: number;
  rates: { adminCharge: number; booster: number };
}

export default function Invest() {
  const [plan, setPlan] = useState<PlanRuleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState(10000);
  const [month, setMonth] = useState(1);
  const [boosterApplied, setBoosterApplied] = useState(false);
  const [sim, setSim] = useState<SimulationResponse | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchWithRetry = async (url: string, tries = 3): Promise<any> => {
      try {
        const r = await fetch(url, { credentials: "include" });
        if (!r.ok) throw new Error("Failed to load plan");
        return await r.json();
      } catch (e) {
        if (tries > 1) {
          await new Promise((res) => setTimeout(res, 300));
          return fetchWithRetry(url, tries - 1);
        }
        throw e;
      }
    };

    setLoading(true);
    setError(null);
    fetchWithRetry("/api/plans/active")
      .then((j) => {
        if (!cancelled) setPlan(j as PlanRuleResponse);
      })
      .catch(
        (e: any) => !cancelled && setError(e?.message || "Failed to load plan"),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    [],
  );
  const percent = (v: number) => `${(v * 100).toFixed(1)}%`;

  const runSim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimError(null);
    setSim(null);
    try {
      const r = await fetch("/api/payouts/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: Number(amount),
          month: Number(month),
          boosterApplied,
        }),
      });
      if (!r.ok) throw new Error("Simulation failed");
      const j = (await r.json()) as SimulationResponse;
      setSim(j);
    } catch (e: any) {
      setSimError(e?.message || "Simulation failed");
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold">Start Investment</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Active Plan</div>
            {loading && <div className="mt-2">Loading…</div>}
            {error && <div className="mt-2 text-destructive">{error}</div>}
            {plan && (
              <div className="mt-3 space-y-2">
                <div className="text-xl font-semibold">{plan.name}</div>
                <div className="text-sm text-muted-foreground">
                  Version {plan.version}{" "}
                  {plan.active ? "(active)" : "(inactive)"}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>Minimum Investment</div>
                  <div className="text-right font-medium">
                    {currency.format(plan.minAmount)}
                  </div>
                  <div>Special Rate Minimum</div>
                  <div className="text-right font-medium">
                    {currency.format(plan.specialMin)}
                  </div>
                  <div>Special Monthly Rate</div>
                  <div className="text-right font-medium">
                    {percent(plan.specialRate)}
                  </div>
                  <div>Admin Charge</div>
                  <div className="text-right font-medium">
                    {percent(plan.adminCharge)}
                  </div>
                  <div>Booster</div>
                  <div className="text-right font-medium">
                    {percent(plan.booster)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground mb-3">
              Payout Simulator
            </div>
            <form onSubmit={runSim} className="space-y-3">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <Label htmlFor="month">Holding Month</Label>
                <Input
                  id="month"
                  type="number"
                  min={1}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                />
                <Label htmlFor="booster">Apply Booster</Label>
                <div className="flex justify-end">
                  <Switch
                    id="booster"
                    checked={boosterApplied}
                    onCheckedChange={setBoosterApplied}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={simLoading}>
                  Simulate
                </Button>
              </div>
            </form>
            {simError && (
              <div className="mt-3 text-destructive text-sm">{simError}</div>
            )}
            {sim && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>Gross Monthly</div>
                <div className="text-right font-medium">
                  {currency.format(sim.grossMonthly)}
                </div>
                <div>Admin Charge</div>
                <div className="text-right font-medium">
                  {currency.format(sim.adminCharge)}
                </div>
                <div>Booster</div>
                <div className="text-right font-medium">
                  {currency.format(sim.booster)}
                </div>
                <div>Net Payout</div>
                <div className="text-right font-semibold">
                  {currency.format(sim.netPayout)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Investment creation endpoints are not implemented in this project. Use
          the simulator above for calculations.
        </CardContent>
      </Card>
    </div>
  );
}
