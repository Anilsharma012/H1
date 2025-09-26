import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function AdminSupport() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required");
      return;
    }
    const to = "support@vyomkesh.industries";
    const body = `Priority: ${priority.toUpperCase()}\nFrom: ${email || "(not provided)"}\n\n${message}`;
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold">Support Desk</div>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground mb-3">
            Create a support request. This opens your email client with the
            details prefilled.
          </div>
          <form onSubmit={submit} className="grid gap-3 max-w-2xl">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="email" className="col-span-1">
                Your Email (optional)
              </Label>
              <Input
                id="email"
                className="col-span-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="subject" className="col-span-1">
                Subject
              </Label>
              <Input
                id="subject"
                className="col-span-3"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Priority</Label>
              <div className="col-span-3">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-2">
              <Label htmlFor="message" className="col-span-1">
                Message
              </Label>
              <textarea
                id="message"
                className="col-span-3 w-full min-h-[140px] rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <div className="flex justify-end">
              <Button type="submit">Create Ticket</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          For platform issues, use the in-app Get Support button. Include steps
          to reproduce and screenshots when possible.
        </CardContent>
      </Card>
    </div>
  );
}
