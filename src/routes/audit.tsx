import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { runSiteAudit, type AuditResult } from "@/lib/audit.functions";
import { dbInsert } from "@/lib/rest";
import { useApplyPageSeo } from "@/lib/page-seo";
import { track } from "@/lib/track";
import { Gauge, Loader2, Search, AlertTriangle, CheckCircle2, XCircle, Phone } from "lucide-react";

const PHONE_PK      = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Free Website Audit — Instant SEO & Speed Report | AM Enterprises" },
      { name: "description", content: "Get a free, instant technical audit of any website: SEO tags, speed, mobile readiness, security and content depth — scored out of 100 with a fix list." },
      { property: "og:title", content: "Free Instant Website Audit — AM Enterprises" },
      { property: "og:description", content: "Score your website's SEO, speed, security and content in under 15 seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditPage,
});

const schema = z.object({
  url: z.string().trim().min(4, "Enter your website address").max(400),
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(160),
});

function AuditPage() {
  useApplyPageSeo("/audit");
  const audit = useServerFn(runSiteAudit);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setRunning(true);
    try {
      const res = await audit({ data: { url: parsed.data.url } });
      setResult(res);
      if (!res.ok) setError(res.summary);
      await dbInsert("site_audits", {
        url: res.url,
        name: parsed.data.name,
        email: parsed.data.email,
        status: "pending",
        score_overall: res.score,
        scores: res.scores,
        findings: res.findings,
        summary: res.summary,
      });
      track("site_audit", { url: res.url, score: res.score });
    } catch {
      setError("The audit couldn't finish. Please try again in a moment.");
    }
    setRunning(false);
  }

  return (
    <main className="min-h-screen bg-sand/30 pb-20 pt-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-espresso/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-espresso">
            <Gauge className="h-3.5 w-3.5" /> Free Tool
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-espresso sm:text-5xl">
            Free Website Audit
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-foreground/70">
            Paste your website address and we'll score its SEO, speed, security, mobile readiness
            and content depth in about 15 seconds — then hand you the exact fix list.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 max-w-3xl rounded-3xl border border-espresso/10 bg-white p-6 shadow-soft sm:p-8"
        >
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-espresso">Website address *</span>
            <input
              name="url"
              required
              placeholder="yourcompany.com"
              className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-3 text-sm focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20"
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-espresso">Your name *</span>
              <input
                name="name"
                required
                placeholder="Jane Doe"
                className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-2.5 text-sm focus:border-cocoa focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-espresso">Email *</span>
              <input
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="mt-1.5 w-full rounded-2xl border border-espresso/15 bg-sand/40 px-4 py-2.5 text-sm focus:border-cocoa focus:outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={running}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-7 py-3.5 text-sm font-bold text-white shadow-soft hover:bg-cocoa disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {running ? "Auditing your site…" : "Run my free audit"}
          </button>
          <p className="mt-3 text-center text-[11px] text-foreground/50">
            No credit card, no sales call required. Results appear right here.
          </p>
        </form>

        {result?.ok && (
          <section className="mt-10">
            <div className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-soft sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <ScoreRing score={result.score} />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="truncate font-display text-lg font-black text-espresso">{result.url}</p>
                  <p className="mt-1 text-sm text-foreground/70">{result.summary}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Metric label="SEO" value={result.scores.seo} />
                    <Metric label="Speed" value={result.scores.performance} />
                    <Metric label="Security" value={result.scores.security} />
                    <Metric label="Content" value={result.scores.content} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {result.findings.map((x) => (
                <div
                  key={x.key}
                  className="flex items-start gap-3 rounded-2xl border border-espresso/10 bg-white p-4"
                >
                  {x.status === "pass" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : x.status === "warn" ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-espresso">
                      {x.label}
                      {x.status !== "pass" && (
                        <span className="ml-2 rounded-full bg-espresso/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-espresso/70">
                          {x.impact} impact
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/65">{x.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-espresso/10 bg-espresso p-8 text-center text-white">
              <h2 className="font-display text-2xl font-black">Want these issues fixed for you?</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/75">
                We'll turn this report into a prioritised action plan and quote a fixed price.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  to="/calculator"
                  className="rounded-full bg-white px-6 py-3 text-sm font-bold text-espresso hover:bg-sand"
                >
                  Price my project
                </Link>
                <a
                  href={`tel:${PHONE_PK}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" /> {PHONE_PK_DISP}
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ScoreRing({ score }: { score: number }) {
  const tone = score >= 85 ? "#15803d" : score >= 60 ? "#d97706" : "#be123c";
  return (
    <div
      className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${tone} ${score * 3.6}deg, rgba(0,0,0,.07) 0deg)` }}
      role="img"
      aria-label={`Overall score ${score} out of 100`}
    >
      <div className="grid h-24 w-24 place-items-center rounded-full bg-white">
        <span className="font-display text-3xl font-black text-espresso">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">/ 100</span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-espresso/10 bg-sand/40 p-3 text-center">
      <p className="font-display text-xl font-black text-espresso">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/55">{label}</p>
    </div>
  );
}
