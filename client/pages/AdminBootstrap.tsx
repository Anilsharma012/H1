import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminBootstrap() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email: email || undefined, phone: phone || undefined, password, confirmPassword, token }),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = "/admin";
    } catch (e) {
      setError("Bootstrap failed. Check token and inputs.");
    }
  };

  return (
    <section className="container py-16 max-w-md">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Initialize Admin</h1>
      <p className="text-sm text-muted-foreground mb-4">One-time setup. Requires server token.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Confirm Password</label>
          <input type="password" className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Bootstrap Token</label>
          <input className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full">Create Admin</Button>
      </form>
    </section>
  );
}
