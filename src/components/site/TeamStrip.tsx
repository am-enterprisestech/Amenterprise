import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

type Member = {
  id: string; name: string; slug: string | null;
  role_title: string | null; bio: string | null; photo_url: string | null;
};

export function TeamStrip() {
  const { rows } = useLiveList<Member>("team_members", {
    orderBy: { column: "sort_order" },
    select: "id,name,slug,role_title,bio,photo_url,sort_order,published",
  });

  if (rows.length === 0) return null;

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-8">
        {/* Heading */}
        <Reveal>
          <div className="mb-12 flex flex-col items-center gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <span className="h-px w-10 bg-[#2F8FFF]" />
                <h2 className="font-display text-3xl font-black tracking-tight text-[#0B1726] sm:text-4xl">
                  Our Team
                </h2>
                <span className="h-px w-10 bg-[#2F8FFF]" />
              </div>
              <p className="mt-2 text-sm text-[#526273]">
                Senior, accountable and directly accessible. You always know who is working on your project.
              </p>
            </div>
            <Link
              to="/team"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-[#2F8FFF] transition hover:gap-2.5 sm:inline-flex"
            >
              Meet everyone <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.slice(0, 3).map((m, i) => {
            const card = (
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DCEAF5] bg-white shadow-soft transition duration-300 hover:-translate-y-2 hover:shadow-luxury hover:border-[#2F8FFF]/25">
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F5FAFF]">
                  {m.photo_url ? (
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#EAF6FF] to-[#F5FAFF]">
                      <span className="font-display text-6xl font-black text-[#2F8FFF]">
                        {m.name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2F8FFF]">
                    {m.role_title}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-black text-[#0B1726]">{m.name}</h3>
                  {m.bio && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#526273] line-clamp-2">{m.bio}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#2F8FFF]">
                    View profile <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
            return (
              <Reveal key={m.id} delay={i * 70}>
                {m.slug
                  ? <Link to="/team/$slug" params={{ slug: m.slug }} className="block h-full">{card}</Link>
                  : card
                }
              </Reveal>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <Reveal delay={180}>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/team" className="inline-flex items-center gap-2 text-sm font-bold text-[#2F8FFF]">
              Meet the team <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
