import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!r.ok) throw new Error("Upload failed");
  const j = await r.json();
  return j.url as string;
}

export default function KYC() {
  const [docType, setDocType] = useState<string>("aadhaar");
  const [docNumber, setDocNumber] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("not_submitted");
  const [remarks, setRemarks] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const me = await fetch("/api/me", { credentials: "include" }).then((r) =>
        r.json(),
      );
      if (!cancelled && me) {
        setStatus(me.kyc?.status || "not_submitted");
        setRemarks(me.kyc?.remarks || "");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "pending") return;
    setSubmitting(true);
    try {
      const frontUrl = front ? await uploadFile(front) : "";
      const backUrl = back ? await uploadFile(back) : undefined;
      const selfieUrl = selfie ? await uploadFile(selfie) : undefined;
      const r = await fetch("/api/users/kyc/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          docNumber,
          frontUrl,
          backUrl,
          selfieUrl,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setStatus("pending");
    } catch (e) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold">KYC</div>

      <Card>
        <CardContent className="p-5 grid gap-2 text-sm">
          <div>
            Status:{" "}
            <span
              className={
                status === "approved"
                  ? "text-green-600"
                  : status === "rejected"
                    ? "text-red-600"
                    : status === "pending"
                      ? "text-yellow-600"
                      : "text-muted-foreground"
              }
            >
              {status}
            </span>
          </div>
          {remarks && (
            <div>
              Last remarks:{" "}
              <span className="text-muted-foreground">{remarks}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground mb-3">
            Submit your identity documents.
          </div>
          <form onSubmit={submit} className="grid gap-3 max-w-2xl">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhaar</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Document Number</Label>
              <Input
                className="col-span-3"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Front Image/PDF</Label>
              <Input
                className="col-span-3"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFront(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Back Image/PDF</Label>
              <Input
                className="col-span-3"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setBack(e.target.files?.[0] || null)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Selfie (optional)</Label>
              <Input
                className="col-span-3"
                type="file"
                accept="image/*"
                onChange={(e) => setSelfie(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={status === "pending" || submitting}
              >
                {status === "pending" ? "Awaiting review" : "Submit KYC"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
