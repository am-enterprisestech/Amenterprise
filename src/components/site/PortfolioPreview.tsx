import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

type Project = {
  id: string; title: string; category: string | null;
  description: string | null; image_url: string | null;
  link_url: string | null; featured: boolean;
};

export function PortfolioPreview() {
  const { rows } = useLiveList<Project>("portfolio", { orderBy: { column: "sort_order" } });
  if (rows.length === 0) return null;

  const shown = (rows.filter(r => r.featured).length >= 6
    ? rows.filter(r => r.featured)
    : rows
  ).slice(0, 6);

  return (
    <section id="work" className="bg-[#F5FAFF] py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-8">
        {/* Section heading */}
        <Reveal>
          <div className="mb-12 flex flex-col items-center gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <span className="h-px w-10 bg-[#2F8FFF]" />
                <h2 className="font-display text-3xl font-black tracking-tight text-[#0B1726] sm:text-4xl">
                  Selected Work
                </h2>
                <span className="h-px w-10 bg-[#2F8FFF]" />
              </div>
              <p className="mt-2 text-sm text-[#526273]">
                Real projects. Real businesses. Live in production.
              </p>
            </div>
            <Link
              to="/portfolio"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-[#2F8FFF] transition hover:gap-2.5 sm:inline-flex"
            >
              View all {rows.length} projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 65}>
              <a
                href={p.link_url ?? "#"}
                target={p.link_url ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DCEAF5] bg-white shadow-soft transition duration-300 hover:-translate-y-2 hover:shadow-luxury hover:border-[#2F8FFF]/25"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F5FAFF]">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-600 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0B1726] to-[#0B2D50] px-6 text-center">
                      <span className="font-display text-lg font-black text-[#8DD3FF]">{p.title}</span>
                    </div>
                  )}
                  <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#0B1726] opacity-0 shadow-soft transition group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {p.category && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2F8FFF]">
                      {p.category}
                    </p>
                  )}
                  <h3 className="mt-1.5 font-display text-base font-black text-[#0B1726] transition group-hover:text-[#2F8FFF]">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#526273] line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-10 text-center">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-xl border border-[#DCEAF5] bg-white px-7 py-3 text-sm font-bold text-[#0B1726] shadow-soft transition hover:border-[#2F8FFF]/40 hover:bg-[#EAF6FF] hover:text-[#2F8FFF]"
            >
              View All Projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
