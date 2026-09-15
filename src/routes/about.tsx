import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AM Enterprises — How we think and how we work" },
      {
        name: "description",
        content:
          "AM Enterprises builds complete digital ecosystems for businesses. Learn about how we think, what we believe, and why we work differently from a typical software house.",
      },
      { property: "og:title", content: "About AM Enterprises — How we think and how we work" },
      {
        property: "og:description",
        content:
          "AM Enterprises builds complete digital ecosystems for businesses. Learn about how we think, what we believe, and why we work differently from a typical software house.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/about" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/about" }],
  }),
  component: AboutPage,
});

/* ─── Types (matches existing Supabase about_blocks table) ───────────────── */

type Block = {
  id: string;
  section_key: string;
  layout: string;
  eyebrow: string | null;
  title: string;
  body: string | null;
  items: string[] | null;
  image_url: string | null;
};

function splitItem(item: string) {
  const parts = item.split(" — ");
  return parts.length > 1
    ? { head: parts[0], rest: parts.slice(1).join(" — ") }
    : { head: item, rest: "" };
}

function Paragraphs({ body }: { body: string }) {
  return (
    <>
      {body.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="mt-4 text-base leading-relaxed text-body-text">
          {p}
        </p>
      ))}
    </>
  );
}

/* ─── Block renderers (layouts unchanged, styling updated) ───────────────── */

function TextBlock({ b }: { b: Block }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-8">
        <Reveal>
          {b.eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              {b.eyebrow}
            </span>
          )}
          <h2 className="mt-4 font-display text-3xl font-black leading-[1.06] tracking-tight text-espresso sm:text-4xl">
            {b.title}
          </h2>
          {b.body && <Paragraphs body={b.body} />}
          {b.items && b.items.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {b.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-sand p-4 text-sm text-body-text"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cocoa" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function CardsBlock({ b }: { b: Block }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-8">
        <Reveal>
          <div className="max-w-2xl">
            {b.eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
                <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
                {b.eyebrow}
              </span>
            )}
            <h2 className="mt-4 font-display text-3xl font-black leading-[1.06] tracking-tight text-espresso sm:text-4xl">
              {b.title}
            </h2>
            {b.body && <Paragraphs body={b.body} />}
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(b.items ?? []).map((item, i) => {
            const { head, rest } = splitItem(item);
            return (
              <Reveal key={item} delay={i * 70}>
                <div className="h-full rounded-2xl border border-border bg-white p-7 transition hover:border-cocoa/25 hover:shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-black text-espresso">{head}</h3>
                  {rest && (
                    <p className="mt-2 text-sm leading-relaxed text-body-text">{rest}</p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ListBlock({ b }: { b: Block }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-8">
        <Reveal>
          {b.eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              {b.eyebrow}
            </span>
          )}
          <h2 className="mt-4 font-display text-3xl font-black leading-[1.06] tracking-tight text-espresso sm:text-4xl">
            {b.title}
          </h2>
          {b.body && <Paragraphs body={b.body} />}
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {(b.items ?? []).map((item, i) => (
            <Reveal key={item} delay={Math.min(i * 30, 280)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-espresso shadow-soft transition hover:border-cocoa/25">
                <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
                {item}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplitGroup({ blocks }: { blocks: Block[] }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-8 md:grid-cols-2">
        {blocks.map((b, i) => (
          <Reveal key={b.id} delay={i * 100}>
            <div className="h-full rounded-2xl border border-border bg-white p-8 lg:p-10">
              {b.eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cocoa">
                  {b.eyebrow}
                </span>
              )}
              <h2 className="mt-3 font-display text-2xl font-black leading-tight text-espresso sm:text-3xl">
                {b.title}
              </h2>
              {b.body && <Paragraphs body={b.body} />}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

function AboutPage() {
  useApplyPageSeo("/about");
  const { rows } = useLiveList<Block>("about_blocks", {
    orderBy: { column: "sort_order", ascending: true },
  });

  // Group consecutive "split" blocks into paired two-column sections
  const groups: { kind: string; blocks: Block[] }[] = [];
  for (const b of rows) {
    const last = groups[groups.length - 1];
    if (b.layout === "split" && last?.kind === "split") last.blocks.push(b);
    else groups.push({ kind: b.layout, blocks: [b] });
  }

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="We understand the business. Then we build the technology."
        description="AM Enterprises is a digital ecosystem company. We work with founders and growing businesses to design and build the connected technology that helps them operate and scale."
      />

      {groups.map((g) => {
        if (g.kind === "split") return <SplitGroup key={g.blocks[0].id} blocks={g.blocks} />;
        const b = g.blocks[0];
        if (b.layout === "cards") return <CardsBlock key={b.id} b={b} />;
        if (b.layout === "list")  return <ListBlock  key={b.id} b={b} />;
        return <TextBlock key={b.id} b={b} />;
      })}

      {/* Founders strip */}
      <section className="border-y border-border bg-sand py-16">
        <div className="mx-auto max-w-[1280px] px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-espresso/40">
              Leadership
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                {
                  name: "Moez Rehman",
                  role: "Founder & CEO",
                  bio: "Leads the company's vision, client strategy and business growth.",
                },
                {
                  name: "Ayesha Moez",
                  role: "Co-Founder & CTO",
                  bio: "Responsible for technical direction, engineering quality and product delivery.",
                },
              ].map((f, i) => (
                <Reveal key={f.name} delay={i * 80}>
                  <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cocoa/10 text-cocoa ring-1 ring-cocoa/20">
                      <span className="font-display text-lg font-black">{f.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-display text-lg font-black text-espresso">{f.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa">{f.role}</p>
                      <p className="mt-2 text-sm leading-relaxed text-body-text">{f.bio}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bottom CTA */}
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
