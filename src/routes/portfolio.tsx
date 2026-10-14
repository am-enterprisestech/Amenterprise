import { SITE_URL } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — AM Enterprises" },
      { name: "description", content: "Real projects built by AM Enterprises — websites, web apps, ERP systems, mobile products and custom software." },
      { property: "og:title", content: "Portfolio — AM Enterprises" },
      { property: "og:url", content: SITE_URL + "/portfolio" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/portfolio" }],
  }),
  component: PortfolioPage,
});

type Project = { id: string; title: string; category: string; description: string | null; image_url: string | null; link_url: string | null };

function PortfolioPage() {
  useApplyPageSeo("/portfolio");
  const { rows, loading } = useLiveList<Project>("portfolio", { orderBy: { column: "sort_order" } });
  const [filter, setFilter] = useState<string>("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.category).filter(Boolean)))], [rows]);
  const visible = filter === "All" ? rows : rows.filter((p) => p.category === filter);

  return (
    <>
      <PageHeader eyebrow="Work" title="Real projects, live in production." description="Websites, web applications, ERP systems, mobile products and custom software — built for real businesses and running in the real world." />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                  filter === c
                    ? "bg-cocoa text-white shadow-soft"
                    : "border border-border bg-white text-espresso hover:border-cocoa/30 hover:bg-sand"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">Loading portfolio…</div>
          ) : visible.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-foreground/50">No projects yet.</div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <a href={p.link_url ?? "#"} target={p.link_url ? "_blank" : undefined} rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-border bg-white transition hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-soft">
                    <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-espresso to-[#0B2D50] px-6 text-center"><span className="font-display text-xl font-black text-cocoa">{p.title}</span></div>
                      )}
                      <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-espresso opacity-0 shadow-soft transition group-hover:opacity-100">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa">{p.category}</p>
                      <h3 className="mt-1.5 font-display text-lg font-black text-espresso">{p.title}</h3>
                      {p.description && <p className="mt-1.5 text-sm leading-relaxed text-body-text line-clamp-2">{p.description}</p>}
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
