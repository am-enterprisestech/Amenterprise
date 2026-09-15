import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { dbSelect, dbInsert } from "@/lib/rest";
import { useApplyPageSeo } from "@/lib/page-seo";
import { track } from "@/lib/track";
import { Calculator, Check, Loader2, Send, Phone, Sparkles, CheckCircle2 } from "lucide-react";

const PHONE_PK      = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Instant Project Cost Calculator — AM Enterprises" },
      { name: "description", content: "Build your scope and see a transparent price in seconds. Website, web app, mobile app, AI automation and custom software pricing in USD or PKR." },
      { property: "og:title", content: "Instant Project Cost Calculator — AM Enterprises" },
      { property: "og:description", content: "Pick your service and features, get an instant estimate in USD or PKR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorPage,
});

type Option = {
  id: string;
  service: string;
  label: string;
  description: string | null;
  price_usd: number;
  price_pkr: number;
  is_base: boolean;
  sort_order: number;
};

const TIMELINES = [
  { key: "flexible", label: "Flexible", note: "Standard schedule", mult: 0.95 },
  { key: "standard", label: "Standard", note: "Typical delivery", mult: 1 },
  { key: "rush", label: "Rush", note: "Priority team, faster", mult: 1.25 },
];

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

function CalculatorPage() {
  useApplyPageSeo("/calculator");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<string>("");
  const [baseId, setBaseId] = useState<string>("");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [currency, setCurrency] = useState<"USD" | "PKR">("USD");
  const [timeline, setTimeline] = useState("standard");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dbSelect<Option>("calculator_options", {
      eq: { published: true },
      order: { column: "sort_order", ascending: true },
    }).then((rows) => {
      setOptions(rows);
      setLoading(false);
    });
  }, []);

  const services = useMemo(() => [...new Set(options.map((o) => o.service))], [options]);

  useEffect(() => {
    if (!service && services.length) setService(services[0]!);
  }, [services, service]);

  const bases = options.filter((o) => o.service === service && o.is_base);
  const extras = options.filter((o) => o.service === service && !o.is_base);

  useEffect(() => {
    setBaseId(bases[0]?.id ?? "");
    setAddOns([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, options.length]);

  const price = (o: Option) => (currency === "USD" ? Number(o.price_usd) : Number(o.price_pkr));
  const selected = [
    ...bases.filter((o) => o.id === baseId),
    ...extras.filter((o) => addOns.includes(o.id)),
  ];
  const mult = TIMELINES.find((t) => t.key === timeline)?.mult ?? 1;
  const subtotal = selected.reduce((sum, o) => sum + price(o), 0);
  const total = Math.round((subtotal * mult) / 10) * 10;

  const fmt = (n: number) =>
    currency === "USD"
      ? `$${n.toLocaleString("en-US")}`
      : `PKR ${n.toLocaleString("en-US")}`;

  function toggle(id: string) {
    setAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = leadSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    if (!selected.length) {
      setError("Pick at least one option to build your estimate.");
      return;
    }
    setSending(true);
    const summary = [
      `Service: ${service}`,
      `Scope: ${selected.map((o) => o.label).join(" + ")}`,
      `Timeline: ${TIMELINES.find((t) => t.key === timeline)?.label}`,
      `Estimated total: ${fmt(total)}`,
    ].join("\n");

    const err = await dbInsert("leads", {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      service,
      source: "calculator",
      value_usd: currency === "USD" ? total : Math.round(total / 280),
      stage: "new",
      notes: summary,
    });
    setSending(false);
    if (err) {
      setError("Could not save your estimate. Please try again or call us.");
      return;
    }
    track("calculator_lead", { service, total, currency });
    setDone(true);
  }

  return (
    <main className="min-h-screen bg-sand/30 pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-espresso/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-espresso">
            <Calculator className="h-3.5 w-3.5" /> Instant Pricing
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-espresso sm:text-5xl">
            Project Cost Calculator
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-foreground/70">
            Most agencies hide their pricing. We don't. Build your scope below and see a real
            estimate in seconds — in US Dollars or Pakistani Rupees.
          </p>
        </div>

        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-cocoa" />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Builder */}
            <div className="space-y-6">
              <Panel title="1. What do you need?">
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setService(s)}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                        service === s
                          ? "bg-espresso text-white"
                          : "border border-espresso/15 text-espresso hover:bg-sand"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="2. Pick your package">
                <div className="grid gap-3">
                  {bases.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setBaseId(o.id)}
                      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                        baseId === o.id
                          ? "border-cocoa bg-cocoa/5 ring-2 ring-cocoa/20"
                          : "border-espresso/12 bg-sand/30 hover:border-cocoa/50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-espresso">{o.label}</span>
                        {o.description && (
                          <span className="mt-0.5 block text-xs text-foreground/60">{o.description}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm font-black text-cocoa">{fmt(price(o))}</span>
                    </button>
                  ))}
                </div>
              </Panel>

              {extras.length > 0 && (
                <Panel title="3. Add what you need">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {extras.map((o) => {
                      const on = addOns.includes(o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => toggle(o.id)}
                          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                            on
                              ? "border-cocoa bg-cocoa/5 ring-2 ring-cocoa/20"
                              : "border-espresso/12 bg-sand/30 hover:border-cocoa/50"
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                              on ? "border-cocoa bg-cocoa text-white" : "border-espresso/25"
                            }`}
                          >
                            {on && <Check className="h-3 w-3" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-espresso">{o.label}</span>
                            {o.description && (
                              <span className="mt-0.5 block text-xs text-foreground/60">{o.description}</span>
                            )}
                            <span className="mt-1 block text-xs font-black text-cocoa">
                              + {fmt(price(o))}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Panel>
              )}

              <Panel title="4. How fast do you need it?">
                <div className="grid gap-3 sm:grid-cols-3">
                  {TIMELINES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTimeline(t.key)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        timeline === t.key
                          ? "border-cocoa bg-cocoa/5 ring-2 ring-cocoa/20"
                          : "border-espresso/12 bg-sand/30 hover:border-cocoa/50"
                      }`}
                    >
                      <span className="block text-sm font-bold text-espresso">{t.label}</span>
                      <span className="mt-0.5 block text-xs text-foreground/60">{t.note}</span>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-black uppercase tracking-widest text-cocoa">
                    Your estimate
                  </p>
                  <div className="inline-flex overflow-hidden rounded-full border border-espresso/15">
                    {(["USD", "PKR"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`px-3 py-1 text-[11px] font-bold ${
                          currency === c ? "bg-espresso text-white" : "text-espresso"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-4 font-display text-4xl font-black text-espresso">{fmt(total)}</p>
                <p className="mt-1 text-xs text-foreground/60">
                  Indicative range for {service || "your project"}. Final price confirmed after a
                  short scoping call.
                </p>

                <ul className="mt-4 space-y-2 border-t border-espresso/10 pt-4">
                  {selected.length === 0 && (
                    <li className="text-xs text-foreground/50">Nothing selected yet.</li>
                  )}
                  {selected.map((o) => (
                    <li key={o.id} className="flex items-start justify-between gap-3 text-xs">
                      <span className="text-espresso/80">{o.label}</span>
                      <span className="shrink-0 font-bold text-espresso">{fmt(price(o))}</span>
                    </li>
                  ))}
                </ul>

                {done ? (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-bold">Estimate saved.</p>
                      <p className="mt-0.5 text-xs">
                        We'll email you the breakdown and follow up within one business day.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="mt-5 space-y-3 border-t border-espresso/10 pt-5">
                    <p className="text-xs font-semibold text-espresso">
                      Email me this estimate + a fixed-price proposal
                    </p>
                    {error && (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900">
                        {error}
                      </p>
                    )}
                    <input
                      name="name"
                      required
                      placeholder="Your name"
                      className="w-full rounded-xl border border-espresso/15 bg-sand/40 px-3 py-2.5 text-sm focus:border-cocoa focus:outline-none"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-espresso/15 bg-sand/40 px-3 py-2.5 text-sm focus:border-cocoa focus:outline-none"
                    />
                    <input
                      name="phone"
                      placeholder="Phone / WhatsApp (optional)"
                      className="w-full rounded-xl border border-espresso/15 bg-sand/40 px-3 py-2.5 text-sm focus:border-cocoa focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-5 py-3 text-sm font-bold text-white hover:bg-cocoa disabled:opacity-60"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {sending ? "Sending…" : "Send me this estimate"}
                    </button>
                  </form>
                )}

                <a
                  href={`tel:${PHONE_PK}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 text-xs font-bold text-espresso hover:text-cocoa"
                >
                  <Phone className="h-3.5 w-3.5" /> Talk it through: {PHONE_PK_DISP}
                </a>
              </div>

              <div className="mt-4 rounded-3xl border border-espresso/10 bg-white p-5">
                <p className="inline-flex items-center gap-2 text-xs font-bold text-espresso">
                  <Sparkles className="h-3.5 w-3.5 text-cocoa" /> Not sure what you need?
                </p>
                <p className="mt-1.5 text-xs text-foreground/65">
                  Run a{" "}
                  <Link to="/audit" className="font-bold text-cocoa hover:text-espresso">
                    free website audit
                  </Link>{" "}
                  first — it tells you exactly what's holding your site back.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-soft">
      <h2 className="mb-4 font-display text-lg font-black text-espresso">{title}</h2>
      {children}
    </section>
  );
}
