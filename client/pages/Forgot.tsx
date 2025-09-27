import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!r.ok) {
      setError("Failed to request reset");
      return;
    }
    const j = await r.json();
    setSent(j.token || "sent");
  };
  return (
    <section className="container py-12 max-w-md">
      <h1 className="text-3xl font-bold mb-2">Reset password</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full">Send reset link</Button>
      </form>
      {sent && (
        <div className="mt-4 text-sm">
          Token (demo): <code className="px-2 py-1 rounded bg-secondary">{sent}</code>
        </div>
      )}
    </section>
  );
}
