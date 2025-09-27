import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanRule } from "@shared/api";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const DEFAULT_PLAN: PlanRule = {
  _id: "local",
  name: "Vyomkesh Base Plan",
  minAmount: 10000,
  specialMin: 200000,
  bands: [
    { fromMonth: 1, toMonth: 3, monthlyRate: 0.04 },
    { fromMonth: 4, toMonth: 6, monthlyRate: 0.05 },
    { fromMonth: 7, toMonth: 9, monthlyRate: 0.06 },
    { fromMonth: 10, toMonth: 120, monthlyRate: 0.07 },
  ],
  specialRate: 0.1,
  adminCharge: 0.025,
  booster: 0.1,
  active: true,
  version: 1,
  effectiveFrom: new Date().toISOString(),
};

function formatINR(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function Index() {
  const [plan, setPlan] = useState<PlanRule>(DEFAULT_PLAN);
  const [amount, setAmount] = useState<number>(50000);
  const [month, setMonth] = useState<number>(1);
  const [booster, setBooster] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/plans/active")
      .then(async (r) => {
        if (r.ok) setPlan(await r.json());
      })
      .catch(() => {});
  }, []);

  const breakdown = useMemo(() => {
    const principal = amount || 0;
    let grossMonthly = 0;
    if (principal >= plan.specialMin) {
      grossMonthly = principal * plan.specialRate;
    } else {
      const band =
        plan.bands.find((b) => month >= b.fromMonth && month <= b.toMonth) ||
        plan.bands[plan.bands.length - 1];
      grossMonthly = principal * band.monthlyRate;
    }
    const adminCharge = +(grossMonthly * plan.adminCharge).toFixed(2);
    const boosterDed = booster ? +(grossMonthly * plan.booster).toFixed(2) : 0;
    const net = +(grossMonthly - adminCharge - boosterDed).toFixed(0);
    return { grossMonthly, adminCharge, boosterDed, net };
  }, [amount, month, booster, plan]);

  return (
    <div className="bg-gradient-to-b from-background to-accent/20">
      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground mb-4">
              Secure • Compliant • Transparent
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-black">
              Secure Your Future with High‑Return Investment Plans
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-black font-semibold max-w-prose">
              Annualized target bands 48% • 60% • 72% • 84%. Special 10% monthly
              payout for ≥₹2,00,000, subject to compliance and plan T&Cs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#calculator">Start Investing</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/plans">View Plans</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground max-w-prose">
              Important: No guaranteed/assured returns. See Risk Disclosure.
              Maker‑checker approvals and audit trails implemented.
            </p>
          </div>
          <div className="relative">
            <Carousel className="rounded-2xl border overflow-hidden">
              <CarouselContent>
                {[
                  "/attached_assets/stock_images/professional_investm_17df31a9.jpg",
                  "/attached_assets/stock_images/modern_office_buildi_35c11222.jpg",
                  "/attached_assets/stock_images/successful_businessw_28296cf9.jpg",
                  "/attached_assets/stock_images/digital_technology_c_57dea852.jpg",
                  "/attached_assets/stock_images/professional_investm_b7ac9384.jpg",
                ].map((src, i) => (
                  <CarouselItem key={i} className="h-[320px] md:h-[400px]">
                    <img
                      src={src}
                      alt="Investment and financial services"
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="container py-16">
        <div className="max-w-3xl mb-6">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black">
            Investment Calculator
          </h2>
          <p className="mt-4 text-lg md:text-xl text-black font-semibold">
            Enter investment amount and month to preview your monthly payout
            with charges. Get real-time calculations for your investment returns.
          </p>
        </div>
        <img
          src="/attached_assets/stock_images/digital_technology_c_18eb62a5.jpg"
          alt="Digital financial technology and investment charts"
          className="w-full h-56 sm:h-64 object-cover rounded-xl border mb-8"
        />
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount (₹)</label>
                <input
                  type="number"
                  min={plan.minAmount}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum ₹{formatINR(plan.minAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Month Number</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="booster"
                  type="checkbox"
                  checked={booster}
                  onChange={(e) => setBooster(e.target.checked)}
                />
                <label htmlFor="booster" className="text-sm">
                  Apply Booster ({(plan.booster * 100).toFixed(0)}%)
                </label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Gross monthly payout</span>
                <span>₹{formatINR(Math.round(breakdown.grossMonthly))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  Admin charge ({(plan.adminCharge * 100).toFixed(1)}%)
                </span>
                <span className="text-destructive">
                  – ₹{formatINR(Math.round(breakdown.adminCharge))}
                </span>
              </div>
              {booster && (
                <div className="flex justify-between text-sm">
                  <span>
                    Booster deduction ({(plan.booster * 100).toFixed(0)}%)
                  </span>
                  <span className="text-destructive">
                    – ₹{formatINR(Math.round(breakdown.boosterDed))}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold text-base">
                <span>Estimated net payout</span>
                <span>₹{formatINR(breakdown.net)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This is a preview. Actuals depend on plan terms, compliance
                checks, tax/TDS and timelines.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="container py-16">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-12">
          Investment Plans & Returns
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plan.bands.map((b) => (
            <div
              key={`${b.fromMonth}-${b.toMonth}`}
              className="rounded-xl border p-5 bg-card"
            >
              <div className="text-sm text-muted-foreground">
                Month {b.fromMonth}–{b.toMonth}
              </div>
              <div className="mt-2 text-3xl font-bold">
                {(b.monthlyRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">monthly</div>
            </div>
          ))}
          <div className="rounded-xl border p-5 bg-gradient-to-br from-primary/10 to-accent/30">
            <div className="text-sm">Special</div>
            <div className="mt-2 text-3xl font-extrabold text-primary">
              {(plan.specialRate * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">
              monthly for ≥ ₹{formatINR(plan.specialMin)}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container py-16">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-12">
          Our Services & Expertise
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { src: "/attached_assets/stock_images/modern_office_buildi_18e1b21e.jpg", alt: "Modern corporate investment facilities" },
            { src: "/attached_assets/stock_images/successful_businessw_4b9b9c61.jpg", alt: "Professional financial advisory services" },
            { src: "/attached_assets/stock_images/digital_technology_c_f0e4fcd4.jpg", alt: "Advanced fintech solutions" },
            { src: "/attached_assets/stock_images/professional_investm_528cab64.jpg", alt: "Expert investment management" },
          ].map((img) => (
            <div key={img.src} className="relative overflow-hidden rounded-xl border">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
                <p className="font-semibold text-sm">{img.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="container py-16">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-12">
          Why Choose Vyomkesh Industries
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              t: "Regulator‑ready",
              d: "Policies aligned to SEBI/RBI guidance; audit trails and maker‑checker.",
            },
            {
              t: "Bank‑grade Security",
              d: "Encrypted PII, device binding, IP throttling, and quarterly reviews.",
            },
            {
              t: "Transparent Ledger",
              d: "Double‑entry system with statements and CSV exports.",
            },
            {
              t: "Dedicated Support",
              d: "Ticket desk with SLAs, WhatsApp/email integrations.",
            },
          ].map((f) => (
            <Card key={f.t}>
              <CardHeader>
                <CardTitle className="text-xl">{f.t}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {f.d}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-12">
          Simple Investment Process
        </h2>
        <ol className="grid md:grid-cols-5 gap-4 text-sm">
          {["Sign up", "KYC", "Invest", "Monthly Payouts", "Track on App"].map(
            (s, i) => (
              <li key={s} className="rounded-xl border p-4 bg-card">
                <div className="text-2xl font-bold">{i + 1}</div>
                <div className="mt-2 font-medium">{s}</div>
              </li>
            ),
          )}
        </ol>
      </section>

      {/* Disclaimers */}
      <section className="container pb-20">
        <Card>
          <CardContent className="pt-6 text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Compliance (India):</strong> Products promising
              fixed/assured returns or &gt;3–4% per month are regulated. Obtain
              legal advice on SEBI CIS/IA, RBI payment/escrow, Companies
              Act/NBFC, KYC/AML and ITR/TDS. Do not advertise guaranteed returns
              unless licensed.
            </p>
            <p>
              Include risk disclosures, no‑guarantee disclaimers,
              refund/withdrawal policies. Implement maker‑checker approvals and
              an audit trail.
            </p>
          </CardContent>
        </Card>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="#calculator">Create your account</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">Talk to us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
