import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email || undefined,
          phone: phone || undefined,
          password,
        }),
      });
      await refresh();
      window.location.href = "/app";
    } catch (err: any) {
      setError("Invalid credentials");
    }
  };

  return (
    <section className="container py-16 max-w-md">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Login</h1>
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
          <label className="text-sm font-medium">Phone number</label>
          <input
            className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
      <p className="mt-3 text-sm">
        No account?{" "}
        <a className="text-primary" href="/signup">
          Sign up
        </a>
      </p>
    </section>
  );
}
