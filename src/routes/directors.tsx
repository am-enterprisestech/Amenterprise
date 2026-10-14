import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { Linkedin, Twitter, ArrowRight, Users, Globe, Building2, Award } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

export const Route = createFileRoute("/directors")({
  head: () => ({
    meta: [
      { title: "Our Directors — AM Enterprise" },
      {
        name: "description",
        content:
          "Meet the leadership team at AM Enterprise — the people who set the direction, own the strategy, and make sure every project delivers.",
      },
      { property: "og:title", content: "Our Directors — AM Enterprise" },
      {
        property: "og:description",
        content:
          "Meet the leadership team at AM Enterprise — the people who set the direction, own the strategy, and make sure every project delivers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/directors" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/directors" }],
  }),
  component: DirectorsPage,
});

/* ─── Types ──────────────────────────────────────────────────────────────── */

// Only columns that have anon SELECT grant in Supabase RLS
type Director = {
  id: string;
  name: string;
  role_title: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
};

// Role titles that qualify as leadership
const DIRECTOR_TITLES = ["director", "founder", "ceo", "chief", "partner", "co-founder"];

export function isDirector(m: Director) {
  const t = m.role_title?.toLowerCase() ?? "";
  return DIRECTOR_TITLES.some((kw) => t.includes(kw));
}

/** Convert a name to a URL-safe slug  e.g. "Moez Rehman" → "moez-rehman" */
export function nameToSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/* ─── Static leadership stats ────────────────────────────────────────────── */

const leadershipStats = [
  { icon: Users,     value: "15–17", label: "Team Members" },
  { icon: Building2, value: "4",     label: "Global Offices" },
  { icon: Globe,     value: "7+",    label: "Years in Business" },
  { icon: Award,     value: "100+",  label: "Projects Delivered" },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

function DirectorsPage() {
  useApplyPageSeo("/directors");

  const { rows, loading } = useLiveList<Director>("team_members", {
    orderBy: { column: "sort_order" },
    filterPublished: false,
    select: "id,name,role_title,bio,photo_url,linkedin_url,twitter_url,sort_order",
  });

  const directors = rows.filter(isDirector);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Leadership"
        title="The people behind AM Enterprise."
        description="Every company is a reflection of the people who lead it. Meet the directors who built AM Enterprise from the ground up."
      />

      {/* ── Leadership Stats Strip ───────────────────────────────────────── */}
      <section className="border-y border-border bg-sand py-12">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {leadershipStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="font-display text-3xl font-black text-espresso">{s.value}</p>
                  <p className="text-xs font-semibold leading-snug text-body-text">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision statement ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1726] via-[#0B2D50] to-[#122f55] p-10 sm:p-14">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cocoa/20 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-[#2F8FFF]/15 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                  Our Vision
                </span>
                <h2 className="mt-4 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
                  "To be the most trusted technology partner for businesses that want to grow."
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/65">
                  Since 2018, every decision our leadership has made has been guided by one principle — deliver real value, build real relationships, and let the work speak for itself.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Director Cards ───────────────────────────────────────────────── */}
      <section className="pb-8">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
                <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
                Meet the Directors
              </span>
              <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
                Leadership that leads by doing.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-body-text">
                Each director at AM Enterprise is hands-on, client-facing, and directly responsible for outcomes. No ivory towers here.
              </p>
            </div>
          </Reveal>

          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">
              Loading directors…
            </div>
          ) : directors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-foreground/50">
              No directors found yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {directors.map((d, i) => {
                const slug = nameToSlug(d.name);
                return (
                  <Reveal key={d.id} delay={i * 80}>
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition duration-500 hover:-translate-y-1.5 hover:shadow-luxury">

                      {/* Photo */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                        {d.photo_url ? (
                          <img
                            src={d.photo_url}
                            alt={d.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0B1726] to-[#0B2D50]">
                            <span className="font-display text-7xl font-black text-cocoa">
                              {d.name.slice(0, 1)}
                            </span>
                          </div>
                        )}
                        {/* gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1726]/95 via-[#0B1726]/30 to-transparent" />

                        {/* Name on photo */}
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-copper">
                            {d.role_title ?? "Director"}
                          </p>
                          <p className="mt-1 font-display text-2xl font-black text-white">
                            {d.name}
                          </p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col gap-4 p-6">
                        {d.bio ? (
                          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-foreground/70">
                            {d.bio}
                          </p>
                        ) : (
                          <p className="flex-1 text-sm text-foreground/40">Director at AM Enterprise.</p>
                        )}

                        {/* Social + CTA row */}
                        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                          {/* Social icons */}
                          <div className="flex gap-2">
                            {d.linkedin_url && (
                              <a
                                href={d.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${d.name} on LinkedIn`}
                                onClick={(e) => e.stopPropagation()}
                                className="grid h-8 w-8 place-items-center rounded-full border border-espresso/12 text-espresso/60 transition hover:border-cocoa/40 hover:bg-cocoa/5 hover:text-cocoa"
                              >
                                <Linkedin className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {d.twitter_url && (
                              <a
                                href={d.twitter_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${d.name} on X / Twitter`}
                                onClick={(e) => e.stopPropagation()}
                                className="grid h-8 w-8 place-items-center rounded-full border border-espresso/12 text-espresso/60 transition hover:border-cocoa/40 hover:bg-cocoa/5 hover:text-cocoa"
                              >
                                <Twitter className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>

                          {/* View Journey button */}
                          <Link
                            to="/directors/$slug"
                            params={{ slug }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-espresso px-4 py-2 text-xs font-bold text-white transition hover:bg-cocoa"
                          >
                            View Journey <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── "Work with us" CTA ───────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-border bg-sand p-8 sm:flex-row sm:items-center sm:p-12">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-black text-espresso sm:text-3xl">
                  Want to meet the team in person?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-body-text">
                  Our directors are accessible. Whether you want to discuss a project, a partnership, or just have a conversation — we're here.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-cocoa px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-copper"
                >
                  Get in touch <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/team"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-espresso transition hover:border-cocoa/30 hover:bg-sand"
                >
                  Meet the full team
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
