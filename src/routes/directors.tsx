import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { Linkedin, Twitter } from "lucide-react";
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

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Director = {
  id: string;
  name: string;
  slug: string | null;
  role_title: string | null;
  bio: string | null;
  long_bio: string | null;
  experience: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  is_director: boolean | null;
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

function DirectorsPage() {
  useApplyPageSeo("/directors");

  const { rows, loading } = useLiveList<Director>("team_members", {
    orderBy: { column: "sort_order" },
    select:
      "id,name,slug,role_title,bio,long_bio,experience,photo_url,linkedin_url,twitter_url,is_director,sort_order,published",
  });

  // Filter client-side: show only directors
  // (is_director may be null if migration hasn't run yet — treat null as false)
  const directors = rows.filter((m) => m.is_director === true);

  return (
    <>
      <PageHeader
        eyebrow="Leadership"
        title="The people who lead AM Enterprise."
        description="Each director's journey — from where they started to what they drive today."
      />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">
              Loading directors…
            </div>
          ) : directors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-foreground/50">
              No directors published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {directors.map((d, i) => {
                const card = (
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition duration-500 hover:-translate-y-1.5 hover:shadow-luxury">
                    {/* Photo */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                      {d.photo_url ? (
                        <img
                          src={d.photo_url}
                          alt={d.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-espresso to-[#0B2D50]">
                          <span className="font-display text-6xl font-black text-cocoa">
                            {d.name.slice(0, 1)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/20 to-transparent opacity-80 transition group-hover:opacity-95" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-copper">
                          {d.role_title ?? "Director"}
                        </p>
                        <p className="truncate font-display text-xl font-black">{d.name}</p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-3 p-5">
                      {/* Bio */}
                      {(d.bio || d.long_bio) ? (
                        <p className="line-clamp-3 text-sm leading-relaxed text-foreground/70">
                          {d.long_bio ?? d.bio}
                        </p>
                      ) : (
                        <p className="text-sm leading-relaxed text-foreground/40">
                          Director at AM Enterprise.
                        </p>
                      )}

                      {/* Experience */}
                      {d.experience && (
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa">
                          {d.experience}
                        </p>
                      )}

                      {/* Social + Profile link */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex gap-1.5">
                          {d.linkedin_url && (
                            <a
                              href={d.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${d.name} on LinkedIn`}
                              className="grid h-7 w-7 place-items-center rounded-full border border-espresso/12 text-espresso transition hover:border-cocoa/30 hover:text-cocoa"
                            >
                              <Linkedin className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {d.twitter_url && (
                            <a
                              href={d.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${d.name} on Twitter / X`}
                              className="grid h-7 w-7 place-items-center rounded-full border border-espresso/12 text-espresso transition hover:border-cocoa/30 hover:text-cocoa"
                            >
                              <Twitter className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {d.slug && (
                          <span className="text-xs font-semibold text-cocoa transition group-hover:underline">
                            View profile →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                return (
                  <Reveal key={d.id} delay={i * 80}>
                    {d.slug ? (
                      <Link
                        to="/team/$slug"
                        params={{ slug: d.slug }}
                        className="block h-full"
                      >
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
