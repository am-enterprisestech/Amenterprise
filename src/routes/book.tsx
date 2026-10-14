import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, CalendarCheck, Phone } from "lucide-react";
import { useApplyPageSeo } from "@/lib/page-seo";

const PHONE_PK      = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Discovery Call — AM Enterprises" },
      { name: "description", content: "Schedule a free 30-minute discovery call with AM Enterprises. Pick your preferred date, time and meeting type." },
      { property: "og:title", content: "Book a Discovery Call — AM Enterprises" },
      { property: "og:description", content: "Schedule a discovery call with our team." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: BookPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  service: z.string().trim().max(100).optional().or(z.literal("")),
  preferred_date: z.string().trim().min(1, "Pick a date"),
  preferred_time: z.string().trim().min(1, "Pick a time"),
  meeting_type: z.string().trim().min(1),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

function BookPage() {
  useApplyPageSeo("/book");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the form."); return; }
    setSending(true);
    const { error } = await supabase.from("bookings").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      service: parsed.data.service || null,
      preferred_date: parsed.data.preferred_date,
      preferred_time: parsed.data.preferred_time,
      meeting_type: parsed.data.meeting_type,
      notes: parsed.data.notes || null,
    });
    setSending(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    (e.target as HTMLFormElement).reset();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="pt-28 pb-20 bg-sand/30 min-h-screen">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-espresso/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-espresso">Book a Meeting</span>
          <h1 className="mt-4 font-display text-4xl font-black text-espresso sm:text-5xl">Book a free discovery call</h1>
          <p className="mt-3 text-body-text">Pick a slot that works. We'll confirm by email and come prepared.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 rounded-3xl border border-espresso/10 bg-white p-6 shadow-soft sm:p-8">
          {done && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <div><p className="font-bold">Booking request received!</p><p className="mt-0.5">We'll confirm your slot by email shortly.</p></div>
            </div>
          )}
          {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Full name *" name="name" required />
            <F label="Email *" name="email" type="email" required />
            <F label="Phone" name="phone" />
            <F label="Company" name="company" />
            <F label="Preferred date *" name="preferred_date" type="date" min={today} required />
            <F label="Preferred time *" name="preferred_time" type="time" required />
            <S label="Meeting type *" name="meeting_type" required options={["Zoom / Video call","Google Meet","Phone call","WhatsApp","On-site (Islamabad)"]} />
            <S label="Service" name="service" options={["Web Development","Mobile App","AI / Automation","Cloud & DevOps","UI / UX Design","Digital Marketing","Other"]} />
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-espresso">Notes / agenda</label>
            <textarea name="notes" rows={5} placeholder="What would you like to discuss?"
              className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-3 text-sm focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <a href={`tel:${PHONE_PK}`} className="inline-flex items-center gap-2 text-sm font-bold text-espresso hover:text-cocoa">
              <Phone className="h-4 w-4" /> Or call {PHONE_PK_DISP}
            </a>
            <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-full bg-espresso px-7 py-3 text-sm font-bold text-white shadow-soft hover:bg-cocoa disabled:opacity-60">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
              {sending ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-foreground/60">
          Need pricing first? <Link to="/quote" className="font-bold text-cocoa hover:text-espresso">Request a quote</Link>
        </p>
      </div>
    </main>
  );
}

function F({ label, name, type = "text", required, min }: { label: string; name: string; type?: string; required?: boolean; min?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-espresso">{label}</span>
      <input name={name} type={type} required={required} min={min}
        className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-2.5 text-sm focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20" />
    </label>
  );
}
function S({ label, name, options, required }: { label: string; name: string; options: string[]; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-espresso">{label}</span>
      <select name={name} required={required} defaultValue="" className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-2.5 text-sm focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
