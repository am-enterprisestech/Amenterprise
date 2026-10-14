import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AM Enterprise — From Zero to Global" },
      {
        name: "description",
        content:
          "AM Enterprise's story — from a solo freelancer in 2018 to a 15–17 person team with offices in Pakistan and the UK. Built on hustle, grown through trust, scaled with technology.",
      },
      { property: "og:title", content: "About AM Enterprise — From Zero to Global" },
      {
        property: "og:description",
        content:
          "AM Enterprise's story — from a solo freelancer in 2018 to a 15–17 person team with offices in Pakistan and the UK.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/about" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/about" }],
  }),
  component: AboutPage,
});

/* ─── Timeline data ─────────────────────────────────────────────────────── */

const timeline = [
  {
    year: "2018",
    label: "The Beginning",
    text: "Started as a freelancer. One laptop, one dream. Took the first international project solo and proved that quality work speaks for itself.",
  },
  {
    year: "2023",
    label: "Building the Team",
    text: "Formed a proper team. Began working consistently with international clients across multiple industries — turning solo hustle into collective excellence.",
  },
  {
    year: "2025 — Early",
    label: "First Offices",
    text: "Opened the first official office in Islamabad, Pakistan. Simultaneously established a presence in Wimbledon, UK — AM Enterprise's first international office.",
  },
  {
    year: "2025 — Now",
    label: "Scaling Up",
    text: "Proper team structure built. AM Enterprise now operates with 15–17 professionals across departments, 3 offices in Pakistan, 1 in the UK, and growing networks worldwide.",
  },
];

/* ─── Stats data ────────────────────────────────────────────────────────── */

const stats = [
  { value: "15–17", label: "Team Members" },
  { value: "3",     label: "Offices in Pakistan" },
  { value: "1",     label: "Office in UK (Wimbledon)" },
  { value: "7+",    label: "Years of Experience" },
  { value: "∞",     label: "Global Networks & Collaborations" },
];

/* ─── Values data ───────────────────────────────────────────────────────── */

const values = [
  {
    title: "Quality First",
    body: "We don't ship until it's right. Every line of code, every design decision, every deliverable goes through the same standard.",
  },
  {
    title: "Client-Focused",
    body: "Your success is the only metric that matters. We listen, we ask hard questions, and we tell you honestly what's worth building.",
  },
  {
    title: "Tech-Driven",
    body: "We build with the best tools available — and we build to last. No shortcuts, no throwaway architecture.",
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

function AboutPage() {
  useApplyPageSeo("/about");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Our Story"
        title="From Zero to Global — The AM Enterprise Story"
        description="Built on hustle, grown through trust, scaled with technology."
      />

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              Journey
            </span>
            <h2 className="mt-4 font-display text-3xl font-black leading-[1.06] tracking-tight text-espresso sm:text-4xl">
              How we got here
            </h2>
          </Reveal>

          <div className="relative mt-12">
            {/* vertical line */}
            <div className="absolute left-6 top-0 h-full w-px bg-border" aria-hidden="true" />

            <ol className="space-y-10">
              {timeline.map((entry, i) => (
                <Reveal key={entry.year} delay={i * 100}>
                  <li className="relative flex gap-6 pl-16">
                    {/* year badge */}
                    <div className="absolute left-0 top-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-cocoa bg-white text-[10px] font-black uppercase tracking-widest text-cocoa">
                      <span className="leading-none">{entry.year.split("—")[0].trim().slice(2)}</span>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft transition hover:border-cocoa/25 hover:shadow-luxury">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cocoa">
                        {entry.year}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-black text-espresso">
                        {entry.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-body-text">{entry.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── By the Numbers ───────────────────────────────────────────────── */}
      <section className="border-y border-border bg-sand py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              By the Numbers
            </span>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-soft">
                  <p className="font-display text-3xl font-black text-cocoa sm:text-4xl">{s.value}</p>
                  <p className="mt-2 text-xs font-semibold leading-snug text-body-text">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values / Culture ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
                <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
                How we work
              </span>
              <h2 className="mt-4 font-display text-3xl font-black leading-[1.06] tracking-tight text-espresso sm:text-4xl">
                Quality-first. Client-focused. Tech-driven.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-body-text">
                These aren't slogans — they're the standards we hold ourselves to on every project, with every client.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 70}>
                <div className="h-full rounded-2xl border border-border bg-white p-7 transition hover:border-cocoa/25 hover:shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-black text-espresso">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-body-text">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Directors strip ──────────────────────────────────────────────── */}
      <section className="border-y border-border bg-sand py-16">
        <div className="mx-auto max-w-[1280px] px-8">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-espresso/40">
                  Leadership
                </p>
                <h2 className="mt-2 font-display text-2xl font-black text-espresso sm:text-3xl">
                  Meet the directors
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-body-text">
                  The people who set the direction, own the strategy, and make sure AM Enterprise delivers.
                </p>
              </div>
              <Link
                to="/directors"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cocoa px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-copper"
              >
                View all directors <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-[1280px] px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0B1726] p-10 sm:p-14">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2F8FFF]/15 blur-3xl" />
              <div className="relative max-w-2xl">
                <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                  Ready to build the digital system your business actually needs?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/75">
                  Let's talk. We'll listen, ask the right questions and tell you honestly what we think is worth building.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-cocoa px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-copper"
                  >
                    Start a project <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/team"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
                  >
                    Meet the team
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
