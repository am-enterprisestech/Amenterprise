import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";
import { useApplyPageSeo } from "@/lib/page-seo";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Insights — AM Enterprises" },
      { name: "description", content: "Thinking on technology, product development, digital ecosystems and business from the AM Enterprises team." },
      { property: "og:title", content: "Insights — AM Enterprises" },
      { property: "og:description", content: "Thinking on technology, product development, digital ecosystems and business from the AM Enterprises team." },
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

  const tags = useMemo(() => ["All", ...Array.from(new Set(rows.flatMap((r) => r.tags ?? [])))], [rows]);
  const visible = rows.filter(
    (p) => (tag === "All" || (p.tags ?? []).includes(tag)) && (q === "" || p.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader eyebrow="Insights" title="Notes from the team." description="Thinking on technology, digital ecosystems and how businesses build better products." />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {tags.map((c) => (
                <button
                  key={c}
                  onClick={() => setTag(c)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                    tag === c ? "bg-[#2F8FFF] text-white" : "border border-[#DCEAF5] bg-white text-[#0B1726] hover:border-[#2F8FFF]/30"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#DCEAF5] bg-[#F5FAFF] px-5 py-2.5 shadow-soft sm:w-72">
              <Search className="h-4 w-4 text-espresso/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">Loading articles…</div>
          ) : visible.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-foreground/50">No articles yet.</div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DCEAF5] bg-white transition hover:-translate-y-1 hover:border-[#2F8FFF]/25 hover:shadow-soft">
                    <div className="aspect-[16/10] overflow-hidden bg-sand">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-espresso/40">No image</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                        {(p.tags ?? []).slice(0, 1).map((t) => (
                          <span key={t} className="rounded-full bg-sand px-2.5 py-1 font-semibold uppercase tracking-widest text-espresso/80">{t}</span>
                        ))}
                        {p.published_at && (
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                        )}
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold text-espresso">{p.title}</h3>
                      {p.excerpt && <p className="mt-2 flex-1 text-sm text-foreground/70">{p.excerpt}</p>}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cocoa">
                        Read more <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
