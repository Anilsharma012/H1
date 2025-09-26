import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralId, setReferralId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDevAdmin =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("admin") === "1";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          password,
          confirmPassword,
          referralId: referralId || undefined,
          admin: isDevAdmin,
        }),
      });
      await refresh();
      window.location.href = isDevAdmin ? "/admin" : "/app";
    } catch (err: any) {
      setError("Could not sign up");
    }
  };

  return (
    <section className="container py-16 max-w-md">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs text-muted-foreground">
          For demo admin, append ?admin=1 to this page URL.
        </p>
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <div>
          <label className="text-sm font-medium">Confirm password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Referral ID</label>
          <input
            className="mt-2 w-full rounded-md border bg-transparent px-3 py-2"
            value={referralId}
            onChange={(e) => setReferralId(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full">Create account</Button>
      </form>
    </section>
  );
}
