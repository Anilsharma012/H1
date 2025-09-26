import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Item {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  docType?: string;
  docNumberMasked?: string;
  frontUrl?: string;
  backUrl?: string;
  selfieUrl?: string;
  submittedAt?: string;
}

export default function AdminKYC() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [remarks, setRemarks] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", tab);
    p.set("page", String(page));
    p.set("limit", String(limit));
    return p.toString();
  }, [tab, page]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const r = await fetch(`/api/admin/kyc?${params}`, {
        credentials: "include",
      });
      if (!r.ok) return;
      const j = await r.json();
      if (!cancel) {
        setItems(j.items);
        setTotal(j.total);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [params]);

  const approve = async (uid: string) => {
    const r = await fetch(`/api/admin/kyc/${uid}/approve`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!r.ok) return;
    setItems((prev) => prev.filter((x) => x.userId !== uid));
  };
  const reject = async (uid: string) => {
    if (!remarks.trim()) return;
    const r = await fetch(`/api/admin/kyc/${uid}/reject`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remarks }),
    });
    if (!r.ok) return;
    setRemarks("");
    setItems((prev) => prev.filter((x) => x.userId !== uid));
  };

  return (
    <div className="grid gap-4">
      <div className="text-2xl font-semibold">KYC Queue</div>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setPage(1);
          setTab(v as any);
        }}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <KycList
            items={items}
            onApprove={approve}
            onReject={reject}
            remarks={remarks}
            setRemarks={setRemarks}
          />
        </TabsContent>
        <TabsContent value="approved">
          <KycList
            items={items}
            disabled
            onApprove={() => {}}
            onReject={() => {}}
            remarks={remarks}
            setRemarks={setRemarks}
          />
        </TabsContent>
        <TabsContent value="rejected">
          <KycList
            items={items}
            disabled
            onApprove={() => {}}
            onReject={() => {}}
            remarks={remarks}
            setRemarks={setRemarks}
          />
        </TabsContent>
      </Tabs>
      <div className="flex justify-between items-center text-sm">
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
    </div>
  );
}

function KycList({
  items,
  onApprove,
  onReject,
  disabled,
  remarks,
  setRemarks,
}: {
  items: Item[];
  onApprove: (uid: string) => void;
  onReject: (uid: string) => void;
  disabled?: boolean;
  remarks: string;
  setRemarks: (v: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-5 grid gap-3">
        {items.map((it) => (
          <div
            key={it.userId}
            className="grid md:grid-cols-6 gap-3 border-b pb-3"
          >
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-muted-foreground">
                {it.email} {it.phone ? `· ${it.phone}` : ""}
              </div>
              <div className="text-xs">
                {it.docType} · {it.docNumberMasked}
              </div>
              <div className="text-xs text-muted-foreground">
                {it.submittedAt
                  ? new Date(it.submittedAt).toLocaleString()
                  : ""}
              </div>
            </div>
            <div className="md:col-span-3 grid grid-cols-3 gap-2">
              {it.frontUrl && (
                <img
                  src={it.frontUrl}
                  className="h-20 object-cover rounded border"
                />
              )}
              {it.backUrl && (
                <img
                  src={it.backUrl}
                  className="h-20 object-cover rounded border"
                />
              )}
              {it.selfieUrl && (
                <img
                  src={it.selfieUrl}
                  className="h-20 object-cover rounded border"
                />
              )}
            </div>
            <div className="md:col-span-2 flex items-end justify-end gap-2">
              {!disabled && (
                <>
                  <Input
                    placeholder="Remarks (for reject)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => onReject(it.userId)}
                    disabled={!remarks.trim()}
                  >
                    Reject
                  </Button>
                  <Button onClick={() => onApprove(it.userId)}>Approve</Button>
                </>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">No records</div>
        )}
      </CardContent>
    </Card>
  );
}
