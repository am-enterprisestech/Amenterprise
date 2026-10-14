import { SITE_URL } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { useState, type FormEvent } from "react";
import {
  Mail, Phone, MapPin, Clock,
  CheckCircle2, Send, Loader2, ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

const PHONE_PK      = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";
const PHONE_UK      = "+447717229638";
const PHONE_UK_DISP = "+44 771 722 9638";
const EMAIL         = "info@amenterprise.tech";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Start a Project — AM Enterprises" },
      {
        name: "description",
        content:
          "Talk to AM Enterprises about building your digital ecosystem. Book a free 30-minute discovery call or send us a message.",
      },
      { property: "og:title", content: "Start a Project — AM Enterprises" },
      { property: "og:url", content: SITE_URL + "/contact" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/contact" }],
  }),
  component: ContactPage,
});

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Islamabad HQ",
    value: "Office, 6th Road, Techno City, Blue Area, Islamabad, Pakistan",
  },
  {
    icon: MapPin,
    label: "Technology Park",
    value: "Rawat Technology Park, Rawat, Pakistan",
  },
  {
    icon: Phone,
    label: "Pakistan",
    value: PHONE_PK_DISP,
    href: `tel:${PHONE_PK}`,
  },
  {
    icon: Phone,
    label: "United Kingdom",
    value: PHONE_UK_DISP,
    href: `tel:${PHONE_UK}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Sat · 9:00 am – 7:00 pm PKT",
  },
];

function ContactPage() {
  useApplyPageSeo("/contact");

  const [sent,  setSent]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form,  setForm]  = useState({
    name: "", email: "", subject: "Digital Ecosystem", message: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name:    form.name.trim(),
      email:   form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setSent(true);
    setForm({ name: "", email: "", subject: "Digital Ecosystem", message: "" });
    setTimeout(() => setSent(false), 10000);
  };

  return (
    <>
      <PageHeader
        eyebrow="Start a project"
        title="Let's understand your business first."
        description="Book a free 30-minute discovery call. We'll learn what you're building, tell you honestly what's worth investing in, and show you how AM Enterprises can help."
      />

      <section className="pb-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-8 lg:grid-cols-[1fr_1.3fr]">

          {/* Left — contact info */}
          <Reveal variant="left">
            <div className="rounded-2xl border border-border bg-sand p-8">
              <h2 className="font-display text-xl font-black text-espresso">Reach us directly</h2>
              <p className="mt-2 text-sm leading-relaxed text-body-text">
                Our team responds within one business day. For urgent requests, call or WhatsApp directly.
              </p>

              <ul className="mt-7 space-y-5">
                {CONTACT_INFO.map((item) => (
                  <li key={item.label} className="flex items-start gap-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cocoa/10 text-cocoa ring-1 ring-cocoa/15">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-espresso/40">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-0.5 block text-sm font-semibold text-espresso transition hover:text-cocoa"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-espresso">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Map */}
              <div className="mt-8 overflow-hidden rounded-xl border border-border">
                <iframe
                  title="AM Enterprises — Islamabad, Pakistan"
                  src="https://maps.google.com/maps?q=Blue+Area+Islamabad+Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="h-52 w-full"
                  loading="lazy"
                />
              </div>

              {/* Quick CTAs */}
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${PHONE_PK.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  WhatsApp us
                </a>
                <a
                  href={`tel:${PHONE_UK}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-espresso transition hover:bg-white"
                >
                  Call UK office
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right — form */}
          <Reveal variant="right">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-border bg-white p-8 shadow-soft"
            >
              <h2 className="font-display text-2xl font-black text-espresso">
                Tell us what you're building
              </h2>
              <p className="mt-2 text-sm text-body-text">
                We read every message. A quick description of your project is enough to get started.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/50">
                    Your name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Moez Rehman"
                    className="mt-1.5 w-full rounded-xl border border-border bg-sand/50 px-4 py-3 text-sm text-espresso placeholder:text-espresso/30 focus:border-cocoa focus:bg-white focus:outline-none focus:ring-2 focus:ring-cocoa/15"
                  />
                </label>

                {/* Email */}
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/50">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com"
                    className="mt-1.5 w-full rounded-xl border border-border bg-sand/50 px-4 py-3 text-sm text-espresso placeholder:text-espresso/30 focus:border-cocoa focus:bg-white focus:outline-none focus:ring-2 focus:ring-cocoa/15"
                  />
                </label>

                {/* Service */}
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/50">
                    What do you need?
                  </span>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-sand/50 px-4 py-3 text-sm text-espresso focus:border-cocoa focus:bg-white focus:outline-none focus:ring-2 focus:ring-cocoa/15"
                  >
                    <option>Digital Ecosystem</option>
                    <option>Website or Web App</option>
                    <option>Mobile Application</option>
                    <option>Custom Software</option>
                    <option>ERP / CRM System</option>
                    <option>Automation & Integrations</option>
                    <option>AI Solutions</option>
                    <option>Cloud & Infrastructure</option>
                    <option>Strategy & Consulting</option>
                    <option>Something else</option>
                  </select>
                </label>

                {/* Preferred date */}
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/50">
                    Preferred call date
                  </span>
                  <input
                    type="date"
                    className="mt-1.5 w-full rounded-xl border border-border bg-sand/50 px-4 py-3 text-sm text-espresso focus:border-cocoa focus:bg-white focus:outline-none focus:ring-2 focus:ring-cocoa/15"
                  />
                </label>

                {/* Message */}
                <label className="block sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/50">
                    Tell us about the project
                  </span>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe what you want to build, any existing systems, and your goals…"
                    className="mt-1.5 w-full resize-none rounded-xl border border-border bg-sand/50 px-4 py-3 text-sm text-espresso placeholder:text-espresso/30 focus:border-cocoa focus:bg-white focus:outline-none focus:ring-2 focus:ring-cocoa/15"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cocoa px-8 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-copper disabled:opacity-60 sm:w-auto"
              >
                {busy
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  : <><Send className="h-4 w-4" /> Send message</>
                }
              </button>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              {sent && (
                <div className="slide-in mt-5 flex items-start gap-3 rounded-xl border border-cocoa/20 bg-cocoa/8 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cocoa" />
                  <div>
                    <p className="text-sm font-bold text-espresso">Message received</p>
                    <p className="mt-0.5 text-sm text-body-text">
                      We'll reply within one business day. If it's urgent, call us directly at{" "}
                      <a href={`tel:${PHONE_PK}`} className="font-semibold text-cocoa">
                        {PHONE_PK_DISP}
                      </a>.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      {/* Bottom CTA strip */}
      <section className="border-t border-[#DCEAF5] bg-[#F5FAFF] py-14">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl font-black text-espresso">Prefer to talk first?</p>
              <p className="mt-1 text-sm text-body-text">
                Book a free 30-minute discovery call and we'll listen before we recommend anything.
              </p>
            </div>
            <a
              href="/book"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-white transition hover:bg-cocoa"
            >
              Book a call <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
