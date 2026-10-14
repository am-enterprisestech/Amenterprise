import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import {
  ArrowRight, Check, Sparkles, Code2, Smartphone,
  Cloud, Shield, Search, Bot, Palette, Database,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — AM Enterprises" },
      {
        name: "description",
        content:
          "AM Enterprises builds websites, web apps, mobile products, ERP systems, AI solutions, cloud infrastructure and integrations — connected as one digital ecosystem for your business.",
      },
      { property: "og:title", content: "Services — AM Enterprises" },
      { property: "og:url", content: SITE_URL + "/services" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/services" }],
  }),
  component: ServicesPage,
});

const iconMap: Record<string, LucideIcon> = {
  Code2, Smartphone, Sparkles, Cloud, Shield, Search, Bot, Palette, Database,
};

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  tags: string[] | null;
};

function ServicesPage() {
  useApplyPageSeo("/services");
  const { rows, loading } = useLiveList<ServiceRow>("services", {
    orderBy: { column: "sort_order" },
  });

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Every capability your business needs, in one place."
        description="We don't sell isolated projects. Each service is a part of the larger digital ecosystem we build around your business — designed to work together."
      />

      <section className="pb-28">
        <div className="mx-auto max-w-[1280px] px-8">
          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-body-text">
              Loading services…
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-14 text-center text-sm text-body-text">
              No services published yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((s, i) => {
                const Icon = iconMap[s.icon ?? ""] ?? Sparkles;
                return (
                  <Reveal key={s.id} delay={(i % 3) * 80}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-white p-8 transition hover:border-cocoa/30 hover:shadow-soft"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-sand text-cocoa ring-1 ring-border transition group-hover:bg-cocoa group-hover:text-white group-hover:ring-cocoa">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 font-display text-xl font-black text-espresso">
                        {s.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-body-text">
                        {s.description}
                      </p>
                      {s.tags && s.tags.length > 0 && (
                        <ul className="mt-5 space-y-2">
                          {s.tags.slice(0, 3).map((tag) => (
                            <li key={tag} className="flex items-center gap-2 text-sm text-body-text">
                              <Check className="h-4 w-4 shrink-0 text-cocoa" />
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-cocoa transition group-hover:gap-2">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border bg-sand py-16">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-black text-espresso">
                Not sure which service you need?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-body-text">
                Tell us about your business and we'll help you figure out the right combination.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cocoa px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-copper"
            >
              Discuss your project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
