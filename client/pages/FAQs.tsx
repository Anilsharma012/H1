export default function FAQs() {
  return (
    <section className="container py-12 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
        FAQs
      </h1>
      <div className="space-y-6 text-sm">
        <div>
          <p className="font-medium">Are returns guaranteed?</p>
          <p className="text-muted-foreground">
            No. We follow market‑linked strategies with target payouts; terms
            apply.
          </p>
        </div>
        <div>
          <p className="font-medium">When do I get paid?</p>
          <p className="text-muted-foreground">
            Monthly cycle dates shown in dashboard; bank holidays shift to next
            working day.
          </p>
        </div>
        <div>
          <p className="font-medium">What are charges?</p>
          <p className="text-muted-foreground">
            Admin 2.5%, optional booster 10%, TDS as per law.
          </p>
        </div>
        <div>
          <p className="font-medium">How do withdrawals work?</p>
          <p className="text-muted-foreground">
            Request in app → approval → credited within T+1–T+3 days.
          </p>
        </div>
      </div>
    </section>
  );
}
