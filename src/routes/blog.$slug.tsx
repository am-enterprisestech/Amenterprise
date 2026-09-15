import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, User, Loader2, ArrowRight, BookOpen } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PrismaticVisual } from "@/components/site/PrismaticVisual";

type Post = {
  id: string; title: string; slug: string; excerpt: string | null; content: string | null;
  cover_url: string | null; author: string | null; tags: string[] | null; published_at: string | null;
  meta_title: string | null; meta_description: string | null; meta_keywords: string | null;
  og_title: string | null; og_description: string | null; og_image: string | null;
};

async function fetchPost(slug: string) {
  const { data } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,cover_url,author,tags,published_at,meta_title,meta_description,meta_keywords,og_title,og_description,og_image")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Post | null) ?? null;
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    const title = p?.meta_title || p?.title || "Article — AM Enterprises";
    const description = p?.meta_description || p?.excerpt || "Read this article on the AM Enterprises insights blog.";
    const url = `/blog/${params.slug}`;
    const image = p?.og_image || p?.cover_url || undefined;
    const meta: { title?: string; name?: string; property?: string; content?: string }[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: p?.og_title || title },
      { property: "og:description", content: p?.og_description || description },
      { property: "og:url", content: SITE_URL + url },
      { property: "og:type", content: "article" },
    ];
    if (p?.meta_keywords) meta.push({ name: "keywords", content: p.meta_keywords });
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: SITE_URL + url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p?.title ?? title,
            description,
            ...(image ? { image } : {}),
            ...(p?.published_at ? { datePublished: p.published_at } : {}),
            author: { "@type": p?.author ? "Person" : "Organization", name: p?.author || "AM Enterprises" },
            publisher: { "@type": "Organization", name: "AM Enterprises" },
            mainEntityOfPage: `https://www.amenterprise.tech${url}`,
          }),
        },
      ],
    };
  },
  component: BlogPost,
  pendingComponent: () => (
    <div className="grid min-h-[60vh] place-items-center pt-32"><Loader2 className="h-6 w-6 animate-spin text-cocoa" /></div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center px-6 pt-32 text-center">
      <div>
        <h1 className="font-display text-3xl font-black text-espresso">Article not found</h1>
        <p className="mt-2 text-sm text-foreground/60">The article you're looking for isn't published.</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-3 text-sm font-bold text-white hover:bg-cocoa">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="grid min-h-[60vh] place-items-center px-6 pt-32 text-center">
      <div>
        <h1 className="font-display text-3xl font-black text-espresso">Couldn't load this article</h1>
        <button onClick={reset} className="mt-6 rounded-full bg-espresso px-5 py-3 text-sm font-bold text-white">Retry</button>
      </div>
    </div>
  ),
});

function BlogPost() {
  const { post } = Route.useLoaderData() as { post: Post };
  const [related, setRelated] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,cover_url,author,tags,published_at,content,meta_title,meta_description,meta_keywords,og_title,og_description,og_image")
      .eq("published", true)
      .neq("slug", post.slug)
      .order("sort_order", { ascending: true })
      .limit(3)
      .then(({ data }) => { if (!cancelled) setRelated(((data as Post[] | null) ?? [])); });
    return () => { cancelled = true; };
  }, [post.slug]);

  const paragraphs = (post.content ?? post.excerpt ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-background pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="subpage-header-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.8fr)] lg:items-center lg:px-10">
          <div>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> All articles
          </Link>
          <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {(post.tags ?? []).slice(0, 2).map((t) => (
              <span key={t} className="rounded-full border border-primary/20 bg-background/75 px-3 py-1 font-bold uppercase tracking-[0.15em] text-primary shadow-soft backdrop-blur-md">{t}</span>
            ))}
            {post.published_at && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
            )}
            {post.author && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black leading-[1.02] text-espresso sm:text-5xl lg:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 max-w-2xl text-base leading-relaxed text-body-text sm:text-lg">{post.excerpt}</p>}
          </div>
          <Reveal delay={160}>
            <PrismaticVisual icon={BookOpen} image={post.cover_url} title={post.title} eyebrow="Editorial insight" status="Ready to explore" />
          </Reveal>
        </div>
      </section>

      <article className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-foreground/80">
            {paragraphs.map((p, i) => <p key={i} className="mb-5 leading-relaxed">{p}</p>)}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-sand/40 py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <h3 className="font-display text-2xl font-black text-espresso sm:text-3xl">Keep reading</h3>
              <Link to="/blog" className="text-sm font-bold text-cocoa hover:text-espresso">All articles →</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Reveal key={r.id}>
                  <Link to="/blog/$slug" params={{ slug: r.slug }}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-luxury">
                    {r.cover_url && (
                      <div className="aspect-[16/10] overflow-hidden bg-sand">
                        <img src={r.cover_url} alt={r.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <h4 className="font-display text-lg font-bold text-espresso">{r.title}</h4>
                      {r.excerpt && <p className="mt-2 flex-1 text-sm text-foreground/70">{r.excerpt}</p>}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cocoa">
                        Read more <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
