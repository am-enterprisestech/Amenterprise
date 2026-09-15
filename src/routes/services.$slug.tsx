import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Phone,
  Loader2,
  Sparkles,
  Code2,
  Smartphone,
  Cloud,
  Shield,
  Search,
  Megaphone,
  Users,
  Palette,
  Database,
  ShoppingCart,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { PrismaticVisual } from "@/components/site/PrismaticVisual";
import { Button } from "@/components/ui/button";
import { PHONE_PK, PHONE_PK_DISPLAY } from "@/lib/site";


const iconMap: Record<string, LucideIcon> = {
  Code2,
  Smartphone,
  Sparkles,
  Cloud,
  Shield,
  Search,
  Megaphone,
  Users,
  Palette,
  Database,
  ShoppingCart,
};

type ProcessStep = {
  step?: string;
  title?: string;
  description?: string;
};

type PricingTier = {
  name?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: string[];
  featured?: boolean;
  cta_label?: string;
  cta_url?: string;
};

type FaqItem = {
  question?: string;
  answer?: string;
};

type Service = {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  icon: string | null;
  tags: string[] | null;
  hero_image: string | null;
  banner_image: string | null;
  features: string[] | null;
  process: ProcessStep[] | null;
  pricing_tiers: PricingTier[] | null;
  faq: FaqItem[] | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
};

const SELECT =
  "id,title,slug,description,long_description,icon,tags,hero_image,banner_image,features,process,pricing_tiers,faq,meta_title,meta_description,meta_keywords,og_title,og_description,og_image";

async function fetchService(slug: string) {
  const { data, error } = await supabase
    .from("services")
    .select(SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch service:", error);
    return null;
  }

  return (data as Service | null) ?? null;
}

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const service = await fetchService(params.slug);

    if (!service) {
      throw notFound();
    }

    return { service };
  },

  head: ({ loaderData, params }) => {
    const s = loaderData?.service;

    const title =
      s?.meta_title ||
      (s ? `${s.title} — AM Enterprises` : "Service — AM Enterprises");

    const description =
      s?.meta_description ||
      s?.description ||
      `${params.slug.replace(/-/g, " ")} service by AM Enterprises.`;

    const url = `/services/${params.slug}`;

    const image =
      s?.og_image ||
      s?.hero_image ||
      s?.banner_image ||
      undefined;

    const meta: {
      title?: string;
      name?: string;
      property?: string;
      content?: string;
    }[] = [
      { title },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: s?.og_title || title,
      },
      {
        property: "og:description",
        content: s?.og_description || description,
      },
      {
        property: "og:url",
        content: SITE_URL + url,
      },
      {
        property: "og:type",
        content: "website",
      },
    ];

    if (s?.meta_keywords) {
      meta.push({
        name: "keywords",
        content: s.meta_keywords,
      });
    }

    if (image) {
      meta.push({
        property: "og:image",
        content: image,
      });

      meta.push({
        name: "twitter:image",
        content: image,
      });
    }

    const faqItems = (s?.faq ?? []).filter(
      (f) => f?.question && f?.answer,
    );

    return {
      meta,

      links: [
        {
          rel: "canonical",
          href: SITE_URL + url,
        },
      ],

      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: s?.title ?? title,
            description,
            ...(image ? { image } : {}),
            serviceType: s?.title,
            provider: {
              "@type": "Organization",
              name: "AM Enterprises",
              url: "https://www.amenterprise.tech",
            },
            url: `https://www.amenterprise.tech${url}`,
          }),
        },

        ...(faqItems.length
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqItems.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: f.answer,
                    },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },

  component: ServiceDetail,

  pendingComponent: () => (
    <div className="grid min-h-[60vh] place-items-center pt-32">
      <Loader2 className="h-6 w-6 animate-spin text-cocoa" />
    </div>
  ),

  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center px-6 pt-32 text-center">
      <div>
        <h1 className="font-display text-3xl font-black text-espresso">
          Service not found
        </h1>

        <Link
          to="/services"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-3 text-sm font-bold !text-white transition hover:bg-cocoa"
        >
          <ArrowLeft className="h-4 w-4" />
          All services
        </Link>
      </div>
    </div>
  ),

  errorComponent: ({ reset }) => (
    <div className="grid min-h-[60vh] place-items-center px-6 pt-32 text-center">
      <div>
        <h1 className="font-display text-3xl font-black text-espresso">
          Couldn't load this service
        </h1>

        <button
          onClick={reset}
          className="mt-6 rounded-full bg-espresso px-5 py-3 text-sm font-bold !text-white transition hover:bg-cocoa"
        >
          Retry
        </button>
      </div>
    </div>
  ),
});

function ServiceDetail() {
  const { service } = Route.useLoaderData() as {
    service: Service;
  };

  const [related, setRelated] = useState<Service[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("services")
      .select(SELECT)
      .eq("published", true)
      .neq("slug", service.slug)
      .order("sort_order", {
        ascending: true,
      })
      .limit(6)
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          console.error(
            "Failed to load related services:",
            error,
          );
          return;
        }

        setRelated(
          ((data as Service[] | null) ?? []).filter(Boolean),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [service.slug]);

  const Icon =
    iconMap[service.icon ?? ""] ?? Sparkles;

  const features = service.features ?? [];
  const processSteps = service.process ?? [];
  const pricing = service.pricing_tiers ?? [];
  const faq = service.faq ?? [];

  const impactLabel =
    service.slug === "digital-marketing"
      ? "Qualified reach"
      : service.slug === "ai-automation"
        ? "Tasks automated"
        : "Growth potential";

  return (
    <>
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="service-detail-hero relative overflow-hidden border-b border-border bg-background pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="subpage-header-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <Reveal>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Services
            </Link>
          </Reveal>

          <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:items-center lg:gap-16">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-3.5 py-1.5 shadow-soft backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Specialist service</span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-5 max-w-3xl font-display text-5xl font-black leading-[0.98] text-espresso sm:text-6xl lg:text-7xl">
                  {service.title}
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-body-text sm:text-lg">
                  {service.description}
                </p>
              </Reveal>

              <Reveal delay={220}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="h-12 rounded-xl px-6 font-bold shadow-luxury">
                    <Link to="/contact">Start a project <ArrowRight /></Link>
                  </Button>

                  <Button asChild variant="outline" size="lg" className="h-12 rounded-xl bg-background/75 px-6 font-semibold backdrop-blur-md">
                    <a href={`tel:${PHONE_PK}`}><Phone />{PHONE_PK_DISPLAY}</a>
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={200}>
              <PrismaticVisual icon={Icon} image={service.hero_image} title={service.title} eyebrow={impactLabel} status="Built to scale" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          OVERVIEW
      ========================================================= */}

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
          <Reveal>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] !text-cocoa">
                Overview
              </span>

              <h2 className="mt-2 font-display text-3xl font-black !text-espresso sm:text-4xl">
                What you get
              </h2>

              <div className="prose prose-espresso mt-5 max-w-none text-base leading-relaxed !text-foreground/75">
                {(service.long_description ??
                  service.description)
                  .replace(/\\n/g, "\n")
                  .split(/\n{2,}/)
                  .map((p, i) => (
                    <p
                      key={i}
                      className="mb-4 !text-foreground/75"
                    >
                      {p}
                    </p>
                  ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-3xl border border-espresso/10 !bg-sand/40 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] !text-cocoa">
                Includes
              </p>

              <ul className="mt-4 space-y-3 text-sm">
                {(service.tags ?? []).map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-2 !text-espresso/85"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 !text-cocoa" />
                    {t}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-espresso px-5 py-3 text-sm font-bold !text-white transition hover:bg-cocoa"
              >
                Request a quote
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={`tel:${PHONE_PK}`}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold !text-espresso transition hover:bg-sand"
              >
                <Phone className="h-4 w-4" />
                {PHONE_PK_DISPLAY}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          BANNER
      ========================================================= */}

      {service.banner_image && (
        <section
          className="relative min-h-[280px] bg-cover bg-center py-20 !text-white sm:min-h-[360px]"
          style={{
            backgroundImage: `linear-gradient(rgba(4,25,27,0.65), rgba(4,25,27,0.75)), url(${service.banner_image})`,
          }}
        >
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
            <Reveal>
              <h2 className="font-display text-3xl font-black leading-tight !text-white sm:text-4xl">
                Ready to launch{" "}
                {service.title.toLowerCase()}?
              </h2>

              <p className="mt-3 !text-white/80">
                Book a free 30-minute consultation with our
                team.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-cocoa px-6 py-3 text-sm font-bold !text-white transition hover:bg-copper"
                >
                  Book a call
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={`tel:${PHONE_PK}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-white/15"
                >
                  <Phone className="h-4 w-4" />
                  {PHONE_PK_DISPLAY}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* =========================================================
          FEATURES
      ========================================================= */}

      {features.length > 0 && (
        <section className="!bg-sand/40 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] !text-cocoa">
                Features
              </span>

              <h2 className="mt-2 font-display text-3xl font-black !text-espresso sm:text-4xl">
                What's included
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <Reveal
                  key={`${f}-${i}`}
                  delay={(i % 3) * 60}
                >
                  <div className="scene-3d h-full">
                    <div className="card-3d flex h-full items-start gap-3 rounded-2xl border border-espresso/10 !bg-white p-5 !text-espresso shadow-sm">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-copper/20 !text-cocoa">
                        <Check className="h-4 w-4" />
                      </div>

                      <p className="text-sm font-semibold !text-espresso">
                        {f}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          PROCESS
      ========================================================= */}

      {processSteps.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] !text-cocoa">
                Process
              </span>

              <h2 className="mt-2 font-display text-3xl font-black !text-espresso sm:text-4xl">
                How we work
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((p, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="scene-3d h-full">
                    <div className="card-3d h-full rounded-3xl border border-espresso/10 !bg-white p-6 !text-espresso shadow-sm">
                      <span className="font-display text-3xl font-black !text-copper">
                        {p.step ??
                          String(i + 1).padStart(2, "0")}
                      </span>

                      <p className="mt-2 font-display text-lg font-bold !text-espresso">
                        {p.title}
                      </p>

                      {p.description && (
                        <p className="mt-2 text-sm !text-foreground/70">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          PRICING
      ========================================================= */}

      {pricing.length > 0 && (
        <section className="!bg-sand/40 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] !text-cocoa">
                Pricing
              </span>

              <h2 className="mt-2 font-display text-3xl font-black !text-espresso sm:text-4xl">
                Simple, transparent pricing
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pricing.map((tier, i) => {
                const featured = Boolean(
                  tier.featured,
                );

                return (
                  <Reveal key={i} delay={i * 80}>
                    <div className="scene-3d h-full">
                      <div
                        className={`card-3d flex h-full flex-col rounded-3xl border p-7 shadow-sm ${
                          featured
                            ? "border-copper !bg-espresso !text-white"
                            : "border-espresso/10 !bg-white !text-espresso"
                        }`}
                      >
                        <p
                          className={`font-display text-lg font-black ${
                            featured
                              ? "!text-copper"
                              : "!text-espresso"
                          }`}
                        >
                          {tier.name}
                        </p>

                        {tier.description && (
                          <p
                            className={`mt-1 text-sm ${
                              featured
                                ? "!text-white/70"
                                : "!text-foreground/70"
                            }`}
                          >
                            {tier.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-baseline gap-1">
                          <span
                            className={`font-display text-4xl font-black ${
                              featured
                                ? "!text-white"
                                : "!text-espresso"
                            }`}
                          >
                            {tier.price}
                          </span>

                          {tier.period && (
                            <span
                              className={`text-sm ${
                                featured
                                  ? "!text-white/60"
                                  : "!text-foreground/60"
                              }`}
                            >
                              / {tier.period}
                            </span>
                          )}
                        </div>

                        <ul className="mt-5 flex-1 space-y-2 text-sm">
                          {(tier.features ?? []).map(
                            (f, fi) => (
                              <li
                                key={fi}
                                className={`flex items-start gap-2 ${
                                  featured
                                    ? "!text-white/85"
                                    : "!text-espresso/85"
                                }`}
                              >
                                <Check
                                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                                    featured
                                      ? "!text-copper"
                                      : "!text-cocoa"
                                  }`}
                                />

                                <span>{f}</span>
                              </li>
                            ),
                          )}
                        </ul>

                        <a
                          href={
                            tier.cta_url ||
                            "/contact"
                          }
                          className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold !text-white transition ${
                            featured
                              ? "bg-[#2F8FFF] hover:bg-[#1769C2]"
                              : "bg-[#0B1726] hover:bg-[#2F8FFF]"
                          }`}
                        >
                          {tier.cta_label ||
                            "Get started"}

                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          FAQ
      ========================================================= */}

      {faq.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] !text-cocoa">
                FAQ
              </span>

              <h2 className="mt-2 font-display text-3xl font-black !text-espresso sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {faq.map((item, i) => {
                const isOpen = openFaq === i;

                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-espresso/10 !bg-sand/30"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(
                          isOpen ? null : i,
                        )
                      }
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-semibold !text-espresso">
                        {item.question}
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 shrink-0 !text-cocoa transition ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {isOpen && item.answer && (
                      <div className="border-t border-espresso/10 !bg-white px-5 py-4 text-sm leading-relaxed !text-foreground/75">
                        {item.answer
                          .replace(/\\n/g, "\n")
                          .split(/\n{2,}/)
                          .map((p, pi) => (
                            <p
                              key={pi}
                              className="mb-2 !text-foreground/75"
                            >
                              {p}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          RELATED SERVICES
      ========================================================= */}

      {related.length > 0 && (
        <section className="!bg-sand/40 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-display text-2xl font-black !text-espresso sm:text-3xl">
                Related Services
              </h3>

              <Link
                to="/services"
                className="text-sm font-bold !text-cocoa transition hover:!text-espresso"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const RIcon =
                  iconMap[r.icon ?? ""] ??
                  Sparkles;

                return (
                  <Link
                    key={r.id}
                    to="/services/$slug"
                    params={{
                      slug: r.slug,
                    }}
                    className="scene-3d group block h-full"
                  >
                    <span className="card-3d flex h-full flex-col rounded-3xl border border-espresso/10 !bg-white p-6 !text-espresso shadow-sm">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-espresso !text-copper">
                        <RIcon className="h-5 w-5" />
                      </span>

                      <span className="mt-4 block font-display text-lg font-black !text-espresso">
                        {r.title}
                      </span>

                      <span className="mt-1 block line-clamp-2 text-sm !text-foreground/65">
                        {r.description}
                      </span>

                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold !text-cocoa">
                        Explore

                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
