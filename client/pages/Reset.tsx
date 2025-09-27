import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Reset() {
  const [sp] = useSearchParams();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const token = sp.get("token") || "";
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (r.ok) setDone(true);
  };
  return (
    <section className="container py-12 max-w-md">
      <h1 className="text-3xl font-bold mb-2">Set new password</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">New password</label>
          <input type="password" className="mt-2 w-full rounded-md border bg-transparent px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full">Update password</Button>
        {done && <p className="text-sm text-green-600">Password updated. Please log in.</p>}
      </form>
    </section>
  );
}
