import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { Linkedin, Twitter } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

export const Route = createFileRoute("/team/")({
  head: () => ({
    meta: [
      { title: "Our Team — AM Enterprises" },
      { name: "description", content: "Meet the team at AM Enterprises — Moez Rehman, Ayesha Moez and the people who build your digital ecosystem." },
      { property: "og:title", content: "Our Team — AM Enterprises" },
      { property: "og:url", content: SITE_URL + "/team" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/team" }],
  }),
  component: TeamPage,
});

type Member = {
  id: string; name: string; slug: string | null; role_title: string | null; bio: string | null;
  photo_url: string | null; linkedin_url: string | null; twitter_url: string | null;
};

function TeamPage() {
  useApplyPageSeo("/team");
  const { rows, loading } = useLiveList<Member>("team_members", {
    orderBy: { column: "sort_order" },
    select: "id,name,slug,role_title,bio,photo_url,linkedin_url,twitter_url,sort_order,published",
  });

  return (
    <>
      <PageHeader
        eyebrow="Our team"
        title="The people who will build it."
        description="Senior, accountable and directly involved. You always know who is working on your project."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">Loading team…</div>
          ) : rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-foreground/50">No team members published yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rows.map((m, i) => {
                const card = (
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition duration-500 hover:-translate-y-1.5 hover:shadow-luxury">
                    <div className="relative aspect-square overflow-hidden bg-sand">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-espresso to-[#0B2D50]">
                          <span className="font-display text-4xl font-black text-cocoa">{m.name.slice(0, 1)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/10 to-transparent opacity-70 transition group-hover:opacity-90" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-copper">{m.role_title}</p>
                        <p className="truncate font-display text-lg font-bold">{m.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      {m.bio ? (
                        <p className="line-clamp-2 min-w-0 text-xs leading-relaxed text-foreground/70">{m.bio}</p>
                      ) : <span className="text-xs text-foreground/40">—</span>}
                      <div className="flex shrink-0 gap-1.5">
                        {m.linkedin_url && (
                          <span className="grid h-7 w-7 place-items-center rounded-full border border-espresso/12 text-espresso"><Linkedin className="h-3.5 w-3.5" /></span>
                        )}
                        {m.twitter_url && (
                          <span className="grid h-7 w-7 place-items-center rounded-full border border-espresso/12 text-espresso"><Twitter className="h-3.5 w-3.5" /></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
                return (
                  <Reveal key={m.id} delay={i * 60}>
                    {m.slug ? (
                      <Link to="/team/$slug" params={{ slug: m.slug }} className="block h-full">{card}</Link>
                    ) : card}
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

