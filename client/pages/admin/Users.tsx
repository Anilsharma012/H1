import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

type UserItem = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  kycStatus: "not_submitted" | "pending" | "approved" | "rejected";
  kycDocMasked?: string;
  createdAt: string;
};

type Stats = {
  total: number;
  todaySignups: number;
  active: number;
  blocked: number;
  kycPending: number;
  kycApproved: number;
  kycRejected: number;
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [items, setItems] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [kycStatus, setKycStatus] = useState<string>("");
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "active", makeAdmin: false, removeAdmin: false });
  const limit = 10;

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (role) p.set("role", role);
    if (status) p.set("status", status);
    if (kycStatus) p.set("kycStatus", kycStatus);
    p.set("page", String(page));
    p.set("limit", String(limit));
    return p.toString();
  }, [q, role, status, kycStatus, page]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const r = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });
      if (!r.ok) return;
      const j = await r.json();
      if (!cancelled) {
        setItems(j.items);
        setTotal(j.total);
        setStats(j.stats);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const toggleBlock = async (id: string) => {
    const r = await fetch(`/api/admin/users/${id}/block`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!r.ok) return;
    const j = await r.json();
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: j.status } : it)),
    );
  };

  const exportCsv = () => {
    const url = `/api/admin/users/export?${params}`;
    window.open(url, "_blank");
  };

  const startEdit = (u: UserItem) => {
    setEditing(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      status: u.status,
      makeAdmin: u.role !== "admin" ? false : false,
      removeAdmin: u.role === "admin" ? false : false,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const r = await fetch(`/api/admin/users/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editing.id
            ? { ...it, name: form.name, email: form.email, phone: form.phone, status: form.status as any, role: form.removeAdmin ? "user" : form.makeAdmin ? "admin" : it.role }
            : it,
        ),
      );
      setEditing(null);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="text-2xl font-semibold">Users & KYC</div>

      <Card>
        <CardContent className="p-5 grid md:grid-cols-6 gap-3 items-center">
          <Label htmlFor="search" className="md:col-span-1">
            Search
          </Label>
          <Input
            id="search"
            className="md:col-span-2"
            placeholder="Name, email, phone…"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
          <Select
            value={role || undefined}
            onValueChange={(v) => {
              setPage(1);
              setRole(v === "all" ? "" : v);
            }}
          >
            <SelectTrigger className="md:col-span-1">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status || undefined}
            onValueChange={(v) => {
              setPage(1);
              setStatus(v === "all" ? "" : v);
            }}
          >
            <SelectTrigger className="md:col-span-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={kycStatus || undefined}
            onValueChange={(v) => {
              setPage(1);
              setKycStatus(v === "all" ? "" : v);
            }}
          >
            <SelectTrigger className="md:col-span-1">
              <SelectValue placeholder="KYC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All KYC</SelectItem>
              <SelectItem value="not_submitted">Not Submitted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="md:col-span-1 flex justify-end">
            <Button variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardContent className="p-5 grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
            <div>
              Total: <span className="font-medium">{stats.total}</span>
            </div>
            <div>
              Today: <span className="font-medium">{stats.todaySignups}</span>
            </div>
            <div>
              Active: <span className="font-medium">{stats.active}</span>
            </div>
            <div>
              Blocked: <span className="font-medium">{stats.blocked}</span>
            </div>
            <div>
              KYC Pending:{" "}
              <span className="font-medium">{stats.kycPending}</span>
            </div>
            <div>
              KYC Approved:{" "}
              <span className="font-medium">{stats.kycApproved}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>KYC</th>
                  <th>Doc</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span className="capitalize">{u.role}</span>
                    </td>
                    <td>
                      <span
                        className={
                          u.status === "active"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          u.kycStatus === "approved"
                            ? "text-green-600"
                            : u.kycStatus === "rejected"
                              ? "text-red-600"
                              : u.kycStatus === "pending"
                                ? "text-yellow-600"
                                : "text-muted-foreground"
                        }
                      >
                        {u.kycStatus}
                      </span>
                    </td>
                    <td>{u.kycDocMasked || ""}</td>
                    <td>{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleBlock(u.id)}
                      >
                        {u.status === "active" ? "Block" : "Unblock"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-3 text-sm">
            <div>
              Page {page} / {Math.max(1, Math.ceil(total / limit))}
            </div>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
