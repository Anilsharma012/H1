import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <section className="container py-16 max-w-md">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full">Continue</Button>
      </form>
    </section>
  );
}
