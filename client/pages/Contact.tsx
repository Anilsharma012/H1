import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${name || "Prospect"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:support@vyomkeshindustries.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="container py-12 max-w-4xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground">
          Email: support@vyomkeshindustries.com • WhatsApp: +91-XXXXXXXXXX • Mon–Sat 10am–6pm
        </p>
      </div>

      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F10403533cf314100a836b80ad6ee216d%2F4cecf75dd0ea48bb8081c5a5912f155a?format=webp&width=1600"
        alt="Contact banner"
        className="w-full h-44 md:h-56 object-cover rounded-xl border"
      />

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="text-sm font-medium">Your name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Anil Kumar" />
        </div>
        <div className="sm:col-span-1">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit">Send message</Button>
          <Button variant="outline" asChild>
            <a href="https://wa.me/910000000000" target="_blank" rel="noreferrer">WhatsApp</a>
          </Button>
        </div>
      </form>
    </section>
  );
}
