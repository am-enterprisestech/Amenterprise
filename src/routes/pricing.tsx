import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AM Enterprises" },
      { name: "description", content: "Transparent engagement models and pricing from AM Enterprises." },
      { property: "og:title", content: "Pricing — AM Enterprises" },
      { property: "og:url", content: SITE_URL + "/pricing" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/pricing" }],
  }),
  component: PricingPage,
});

type Plan = {
  id: string; name: string; price: string; price_period: string | null;
  description: string | null; features: string[] | null; cta_label: string | null;
  cta_url: string | null; featured: boolean;
};

function PricingPage() {
  useApplyPageSeo("/pricing");
  const { rows, loading } = useLiveList<Plan>("pricing_plans", { orderBy: { column: "sort_order" } });

  return (
    <>
      <PageHeader eyebrow="Pricing" title="Clear pricing, no surprises." description="Choose an engagement model that fits where your business is right now. Every engagement includes senior-level talent." />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">Loading pricing…</div>
          ) : rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-foreground/50">No pricing plans yet.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {rows.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <div
                    className={`relative flex h-full flex-col rounded-3xl border p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-luxury ${
                      p.featured ? "border-copper bg-espresso text-cream" : "border-border bg-card"
                    }`}
                  >
                    {p.featured && (
                      <span className="absolute -top-3 right-6 rounded-full bg-copper px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-espresso">
                        Most popular
                      </span>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-widest text-cocoa">{p.name}</p>
                    <p className={`mt-2 text-sm ${p.featured ? "text-cream/70" : "text-foreground/60"}`}>{p.description}</p>
                    <p className="mt-6 font-display text-5xl font-extrabold">
                      {p.price}
                      {p.price_period && (
                        <span className={`ml-1 text-sm font-normal ${p.featured ? "text-cream/60" : "text-foreground/50"}`}>/{p.price_period}</span>
                      )}
                    </p>
                    <ul className="mt-8 flex-1 space-y-3 text-sm">
                      {(p.features ?? []).map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-cocoa" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={(p.cta_url as "/contact") ?? "/contact"}
                      className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                        p.featured ? "bg-[#2F8FFF] text-white hover:bg-[#1769C2]" : "bg-[#0B1726] text-white hover:bg-[#2F8FFF]"
                      }`}
                    >
                      {p.cta_label ?? "Get started"}
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
