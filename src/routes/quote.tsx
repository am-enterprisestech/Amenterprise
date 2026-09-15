import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, Send, Phone } from "lucide-react";
import { useApplyPageSeo } from "@/lib/page-seo";

const PHONE_PK      = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Get a Quote — AM Enterprises" },
      { name: "description", content: "Tell us what you need to build. We'll send a clear quote within one business day." },
      { property: "og:title", content: "Get a Quote — AM Enterprises" },
      { property: "og:description", content: "Tell us about your project and get a personalised quote." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: QuotePage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  service: z.string().trim().max(100).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  timeline: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a bit more (min 10 chars)").max(4000),
});

function QuotePage() {
  useApplyPageSeo("/quote");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("quote_requests").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      service: parsed.data.service || null,
      budget: parsed.data.budget || null,
      timeline: parsed.data.timeline || null,
      message: parsed.data.message,
    });
    setSending(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <main className="pt-28 pb-20 bg-sand/30 min-h-screen">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="inline-block rounded-xl bg-espresso/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-espresso">Get a Quote</span>
          <h1 className="mt-4 font-display text-4xl font-black text-espresso sm:text-5xl">Tell us what you need to build.</h1>
          <p className="mt-3 text-base text-body-text">We'll review your project and send a clear, itemised quote within one business day.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 rounded-3xl border border-espresso/10 bg-white p-6 shadow-soft sm:p-8">
          {done && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-bold">Thanks! Your quote request is in.</p>
                <p className="mt-0.5">Our team will review it and get back to you shortly.</p>
              </div>
            </div>
          )}
          {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" name="name" required placeholder="Jane Doe" />
            <Field label="Email *" name="email" type="email" required placeholder="you@company.com" />
            <Field label="Phone" name="phone" placeholder={PHONE_PK_DISP} />
            <Field label="Company" name="company" placeholder="Acme Inc." />
            <Select label="Service needed" name="service" options={["Digital Ecosystem","Website or Web App","Mobile Application","Custom Software","ERP / CRM System","Automation & Integrations","AI Solutions","Cloud & Infrastructure","Strategy & Consulting","Other"]} />
            <Select label="Estimated budget" name="budget" options={["< $1k","$1k – $5k","$5k – $15k","$15k – $50k","$50k+"]} />
            <Select label="Timeline" name="timeline" options={["ASAP","1–4 weeks","1–3 months","3+ months","Flexible"]} />
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-espresso">Project details *</label>
            <textarea name="message" required rows={6} placeholder="What are you trying to build? Goals, features, tech stack, references…"
              className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-3 text-sm focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <a href={`tel:${PHONE_PK}`} className="inline-flex items-center gap-2 text-sm font-bold text-espresso hover:text-cocoa">
              <Phone className="h-4 w-4" /> Or call {PHONE_PK_DISP}
            </a>
            <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-full bg-espresso px-7 py-3 text-sm font-bold text-white shadow-soft hover:bg-cocoa disabled:opacity-60">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : "Send quote request"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-foreground/60">
          Prefer to just talk? <Link to="/contact" className="font-bold text-cocoa hover:text-espresso">Contact us</Link> · Ready to schedule? <Link to="/book" className="font-bold text-cocoa hover:text-espresso">Book a call</Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-espresso">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-2.5 text-sm focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20" />
    </label>
  );
}
function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-espresso">{label}</span>
      <select name={name} defaultValue="" className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-2.5 text-sm focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
