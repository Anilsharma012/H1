import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Plan = {
  _id: string;
  title: string;
  startMonth: number;
  endMonth: number;
  annualReturnPercent: number;
  minInvestment: number;
  isActive: boolean;
  sortOrder: number;
};

type EditState = Partial<Plan> & { force?: boolean };

export default function AdminPlans() {
  const [all, setAll] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/plans", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load plans");
      const j = (await r.json()) as Plan[];
      setAll(j);
    } catch (e: any) {
      setError(e?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const base = all || [];
    let rows = base;
    if (showActiveOnly) rows = rows.filter((p) => p.isActive);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((p) => p.title.toLowerCase().includes(s));
    }
    return rows;
  }, [all, q, showActiveOnly]);

  const openNew = () => {
    setEdit({
      title: "",
      startMonth: 1,
      endMonth: 3,
      annualReturnPercent: 36,
      minInvestment: 10000,
      isActive: true,
      sortOrder: (all?.length || 0) + 1,
    });
    setOpen(true);
  };
  const openEdit = (p: Plan) => {
    setEdit({ ...p });
    setOpen(true);
  };

  const save = async () => {
    if (!edit) return;
    const body = { ...edit } as any;
    try {
      const isNew = !edit._id;
      const r = await fetch(
        isNew ? "/api/admin/plans" : `/api/admin/plans/${edit._id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        },
      );
      if (r.status === 409) {
        const j = await r.json();
        if (j?.code === "OVERLAP") {
          if (confirm("Overlapping active range. Proceed anyway?")) {
            const rr = await fetch(
              isNew ? "/api/admin/plans" : `/api/admin/plans/${edit._id}`,
              {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...body, force: true }),
              },
            );
            if (!rr.ok) throw new Error("Save failed");
          } else {
            return;
          }
        } else {
          throw new Error(j?.message || "Save failed");
        }
      } else if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.message || "Save failed");
      }
      toast.success("Saved");
      setOpen(false);
      setEdit(null);
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  const toggle = async (p: Plan) => {
    try {
      const r = await fetch(`/api/admin/plans/${p._id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Toggle failed");
      toast.success(p.isActive ? "Deactivated" : "Activated");
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || "Toggle failed");
    }
  };

  const remove = async (p: Plan) => {
    if (!confirm(`Delete plan: ${p.title}?`)) return;
    try {
      const r = await fetch(`/api/admin/plans/${p._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const move = async (p: Plan, dir: -1 | 1) => {
    if (!all) return;
    const idx = all.findIndex((x) => x._id === p._id);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= all.length) return;
    const a = all[idx];
    const b = all[targetIdx];
    try {
      const up1 = fetch(`/api/admin/plans/${a._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...a, sortOrder: b.sortOrder }),
      });
      const up2 = fetch(`/api/admin/plans/${b._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...b, sortOrder: a.sortOrder }),
      });
      const [r1, r2] = await Promise.all([up1, up2]);
      if (!r1.ok || !r2.ok) throw new Error("Reorder failed");
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || "Reorder failed");
    }
  };

  const inr = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-2xl font-semibold">Plans & Rules</div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex items-center gap-2 text-sm">
            <span>Active only</span>
            <Switch
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
          </div>
          <Button onClick={openNew}>New Plan</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          {error && (
            <div className="text-destructive text-sm mb-2">{error}</div>
          )}
          {loading && <div>Loading…</div>}
          {all && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Range</th>
                    <th className="py-2 pr-3">Annual %</th>
                    <th className="py-2 pr-3">Min Investment</th>
                    <th className="py-2 pr-3">Active</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id} className="border-t">
                      <td className="py-2 pr-3">{p.sortOrder}</td>
                      <td className="py-2 pr-3">{p.title}</td>
                      <td className="py-2 pr-3">
                        {p.startMonth}–{p.endMonth}
                      </td>
                      <td className="py-2 pr-3">{p.annualReturnPercent}%</td>
                      <td className="py-2 pr-3">{inr(p.minInvestment)}</td>
                      <td className="py-2 pr-3">{p.isActive ? "Yes" : "No"}</td>
                      <td className="py-2 pr-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => move(p, -1)}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => move(p, +1)}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggle(p)}
                        >
                          {p.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(p)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEdit(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?._id ? "Edit Plan" : "New Plan"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Title</Label>
                <Input
                  value={edit.title ?? ""}
                  onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                />
                <Label>Start Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={edit.startMonth ?? 1}
                  onChange={(e) =>
                    setEdit({ ...edit, startMonth: Number(e.target.value) })
                  }
                />
                <Label>End Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={edit.endMonth ?? 1}
                  onChange={(e) =>
                    setEdit({ ...edit, endMonth: Number(e.target.value) })
                  }
                />
                <Label>Annual %</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={edit.annualReturnPercent ?? 0}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      annualReturnPercent: Number(e.target.value),
                    })
                  }
                />
                <Label>Min Investment</Label>
                <Input
                  type="number"
                  min={0}
                  value={edit.minInvestment ?? 0}
                  onChange={(e) =>
                    setEdit({ ...edit, minInvestment: Number(e.target.value) })
                  }
                />
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={edit.sortOrder ?? 0}
                  onChange={(e) =>
                    setEdit({ ...edit, sortOrder: Number(e.target.value) })
                  }
                />
                <Label>Active</Label>
                <div className="flex justify-end">
                  <Switch
                    checked={!!edit.isActive}
                    onCheckedChange={(v) => setEdit({ ...edit, isActive: v })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
