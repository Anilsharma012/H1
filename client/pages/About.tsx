import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <section className="container py-12 space-y-10">
      <div className="grid gap-6 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            About Vyomkesh Industries
          </h1>
          <p className="mt-3 text-muted-foreground">
            We build mission‑led financial products with regulator‑ready
            compliance, bank‑grade security, and transparent ledgers. Our
            approach blends disciplined operations with technology to deliver
            predictable investor experiences.
          </p>
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F10403533cf314100a836b80ad6ee216d%2Faf3dbd0d2a7746368b08f99704efd8b9?format=webp&width=1600"
          alt="About us banner"
          className="w-full h-52 md:h-64 object-cover rounded-xl border"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Risk‑aware product design, maker‑checker approvals and audit trails
            ensure operational discipline.
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Encrypted PII, device binding and defense‑in‑depth keep your data
            safe.
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Transparent double‑entry ledgers with downloadable statements.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "https://cdn.builder.io/api/v1/image/assets%2F10403533cf314100a836b80ad6ee216d%2Fb926e04c235240e988e8a096fcba9e5e?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F10403533cf314100a836b80ad6ee216d%2F8b9f773ba299446a8aa397067c60806a?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F10403533cf314100a836b80ad6ee216d%2F18953e26c2974f7d8a991a41ed137bb3?format=webp&width=1600",
        ].map((src) => (
          <img
            key={src}
            src={src}
            alt="Our operations"
            className="w-full h-48 object-cover rounded-xl border"
          />
        ))}
      </div>
    </section>
  );
}
