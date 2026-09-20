import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Calendar, ArrowRight, SlidersHorizontal, X, Filter, RotateCcw, Sparkles, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";
import { useApplyPageSeo } from "@/lib/page-seo";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Insights & Technical Blog — AM Enterprises" },
      { name: "description", content: "Engineering insights, architecture notes, AI automation pipelines, and growth strategies from AM Enterprises." },
      { property: "og:title", content: "Insights — AM Enterprises" },
      { property: "og:description", content: "Engineering insights, architecture notes, AI automation pipelines, and growth strategies from AM Enterprises." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/blog" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/blog" }],
  }),
  component: BlogPage,
});

type Post = {
  id: string; title: string; slug: string; excerpt: string | null; content: string | null;
  cover_url: string | null; author: string | null; tags: string[] | null; published_at: string | null;
};

function BlogPage() {
  useApplyPageSeo("/blog");
  const { rows, loading } = useLiveList<Post>("blog_posts", { orderBy: { column: "sort_order" } });
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const tags = useMemo(() => ["All", ...Array.from(new Set(rows.flatMap((r) => r.tags ?? [])))], [rows]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { All: rows.length };
    rows.forEach((p) => {
      (p.tags ?? []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [rows]);

  const visible = rows.filter(
    (p) => (tag === "All" || (p.tags ?? []).includes(tag)) && (q === "" || p.title.toLowerCase().includes(q.toLowerCase()) || (p.excerpt && p.excerpt.toLowerCase().includes(q.toLowerCase()))),
  );

  const activeFiltersCount = (tag !== "All" ? 1 : 0) + (q.trim() !== "" ? 1 : 0);

  const handleReset = () => {
    setTag("All");
    setQ("");
  };

  return (
    <>
      <PageHeader
        eyebrow="Insights & Tech Notes"
        title="Engineering thoughts & business growth."
        description="Deep dives into digital ecosystem architecture, full-stack engineering, AI automation pipelines, and Meta Ads attribution."
      />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">

          {/* TOP FILTER BAR */}
          <div className="rounded-3xl border border-espresso/12 bg-white p-4 sm:p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Quick Search */}
              <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-espresso/15 bg-sand/30 px-4 py-2.5 min-w-[240px] focus-within:border-cocoa focus-within:bg-white transition">
                <Search className="h-4 w-4 text-espresso/50 shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search insights by topic or keyword..."
                  className="w-full bg-transparent text-xs sm:text-sm text-espresso placeholder:text-espresso/40 focus:outline-none"
                />
                {q && (
                  <button onClick={() => setQ("")} className="text-espresso/40 hover:text-espresso">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                )}

                {/* Filter Drawer Trigger Button */}
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-espresso px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-cocoa transition"
                >
                  <SlidersHorizontal className="h-4 w-4 text-copper" />
                  <span>Filter Articles</span>
                  {activeFiltersCount > 0 && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-cocoa text-[10px] font-black text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* HORIZONTAL SWIPE CAT TABS */}
            <div className="mt-4 pt-3 border-t border-espresso/8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-espresso/50 shrink-0 mr-1">
                Topics:
              </span>
              {tags.map((category) => (
                <button
                  key={category}
                  onClick={() => setTag(category)}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                    tag === category
                      ? "bg-cocoa text-white shadow-soft"
                      : "bg-sand/60 text-espresso/80 hover:bg-sand hover:text-espresso"
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[10px] rounded-md px-1.5 py-0.2 font-mono ${tag === category ? "bg-white/20 text-white" : "bg-espresso/10 text-espresso/70"}`}>
                    {tagCounts[category] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE FILTER SUMMARY PIPES */}
          {(tag !== "All" || q) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 px-2">
              <span className="text-xs text-espresso/60 font-semibold">Filtered by:</span>
              {tag !== "All" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-cocoa/10 px-3 py-1 text-xs font-bold text-cocoa border border-cocoa/20">
                  Topic: {tag}
                  <button onClick={() => setTag("All")} className="hover:text-espresso"><X className="h-3 w-3" /></button>
                </span>
              )}
              {q && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-cocoa/10 px-3 py-1 text-xs font-bold text-cocoa border border-cocoa/20">
                  Query: "{q}"
                  <button onClick={() => setQ("")} className="hover:text-espresso"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* POSTS GRID */}
          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">Loading articles…</div>
          ) : visible.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-foreground/50">
              <BookOpen className="mx-auto h-8 w-8 text-espresso/40 mb-3" />
              No articles found matching your criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-espresso/12 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-cocoa/30 hover:shadow-luxury"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-sand relative">
                      {p.cover_url ? (
                        <img
                          src={p.cover_url}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0B1726] to-[#162A45] text-white">
                          <Sparkles className="h-8 w-8 text-copper/60" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                        {(p.tags ?? []).slice(0, 1).map((t) => (
                          <span key={t} className="rounded-full bg-sand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cocoa">
                            {t}
                          </span>
                        ))}
                        {p.published_at && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-espresso/60">
                            <Calendar className="h-3 w-3" /> {new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-display text-lg font-black text-espresso group-hover:text-cocoa transition">
                        {p.title}
                      </h3>

                      {p.excerpt && (
                        <p className="mt-2 flex-1 text-xs leading-relaxed text-body-text line-clamp-3">
                          {p.excerpt}
                        </p>
                      )}

                      <div className="mt-5 pt-4 border-t border-espresso/8 flex items-center justify-between text-xs font-bold text-cocoa group-hover:text-espresso transition">
                        <span>Read Article</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SLIDE-OVER FILTER DRAWER / SIDEBAR
      ========================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between border-b border-espresso/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-cocoa" />
                    <h2 className="font-display text-xl font-black text-espresso">Filter Insights</h2>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-full p-2 text-espresso/60 hover:bg-sand hover:text-espresso transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Drawer Body - Search & Categories */}
                <div className="mt-6 space-y-6">
                  
                  {/* Search inside Drawer */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-espresso/60 mb-1.5 block">
                      Keyword Search
                    </label>
                    <div className="flex items-center gap-2.5 rounded-2xl border border-espresso/15 bg-sand/30 px-4 py-3">
                      <Search className="h-4 w-4 text-espresso/50 shrink-0" />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Type keywords..."
                        className="w-full bg-transparent text-xs font-semibold text-espresso focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Categories / Topics List */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-espresso/60 mb-2 block">
                      Filter By Category
                    </label>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      {tags.map((category) => {
                        const count = tagCounts[category] || 0;
                        const isSelected = tag === category;
                        return (
                          <button
                            key={category}
                            onClick={() => setTag(category)}
                            className={`flex w-full items-center justify-between rounded-2xl p-3.5 text-xs font-bold transition border ${
                              isSelected
                                ? "bg-espresso text-white border-espresso shadow-soft"
                                : "bg-sand/30 border-espresso/8 text-espresso hover:bg-sand hover:border-espresso/20"
                            }`}
                          >
                            <span>{category}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono ${
                                isSelected ? "bg-cocoa text-white" : "bg-sand text-espresso/70"
                              }`}
                            >
                              {count} articles
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-espresso/10 space-y-3">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
                  </button>
                )}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full rounded-2xl bg-cocoa py-3.5 text-xs font-bold text-white shadow-soft hover:bg-copper transition"
                >
                  Apply Filters ({visible.length} Results)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
