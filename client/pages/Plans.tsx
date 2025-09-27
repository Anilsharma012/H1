import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Plan = {
  _id: string;
  title: string;
  startMonth: number;
  endMonth: number;
  annualReturnPercent: number;
  minInvestment: number;
  isActive: boolean;
  sortOrder: number;
};

export default function Plans() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(100000);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/plans");
        if (!r.ok) throw new Error("Failed to load plans");
        const j = (await r.json()) as Plan[];
        if (!cancelled) setPlans(j);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load plans");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthly = useMemo(
    () => (p: Plan) => {
      return Math.round(((p.annualReturnPercent / 100) * amount) / 12);
    },
    [amount],
  );

  const inr = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return (
    <section className="container py-12 grid gap-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Investment Plans
        </h1>
        <p className="mt-3 text-muted-foreground">
          Returns are annualized. Monthly receive is computed as (Annual % ×
          Investment ÷ 12).
        </p>
      </div>
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F10403533cf314100a836b80ad6ee216d%2F18953e26c2974f7d8a991a41ed137bb3?format=webp&width=1600"
        alt="High returns banner"
        className="w-full h-44 md:h-56 object-cover rounded-xl border"
      />

      <Card>
        <CardContent className="p-5 grid md:grid-cols-[240px_1fr] gap-3 items-center">
          <div className="text-sm text-muted-foreground">Investment amount</div>
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          {error && (
            <div className="text-destructive text-sm mb-2">{error}</div>
          )}
          {!plans && !error && <div>Loading…</div>}
          {plans && plans.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No active plans.
            </div>
          )}
          {plans && plans.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Month Range</th>
                    <th className="py-2 pr-4">Returns (Annual %)</th>
                    <th className="py-2 pr-4">Monthly Receive</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="py-3 pr-4">{p.title}</td>
                      <td className="py-3 pr-4">{p.annualReturnPercent}%</td>
                      <td className="py-3 pr-4">{inr(monthly(p))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
