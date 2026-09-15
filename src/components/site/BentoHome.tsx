/**
 * BentoHome — AM Enterprises
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete homepage sections:
 *
 * 01. Trust Bar
 * 02. What We Do
 * 03. Clients
 * 04. Industries
 * 05. Why AM Enterprises
 * 06. Business Outcomes
 * 07. Portfolio Preview
 * 08. How We Work
 * 09. Engagement Models
 * 10. Technology
 * 11. Testimonials
 * 12. Team
 * 13. Live Activity
 * 14. FAQ
 * 15. Final CTA
 * 16. Contact Bar
 */

import { Link } from "@tanstack/react-router";

import {
  ArrowRight,
  Bot,
  Building2,
  Cloud,
  Code2,
  ChevronDown,
  Globe,
  Heart,
  GraduationCap,
  Mail,
  Phone,
  Rocket,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { useState } from "react";

import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";

import { TrustBar } from "@/components/site/TrustBar";
import {
  LiveActivity,
} from "@/components/site/LiveActivity";

import { TeamStrip } from "@/components/site/TeamStrip";
import { PortfolioPreview } from "@/components/site/PortfolioPreview";

/* ============================================================================
   Uploaded images
   ============================================================================ */

import serviceWebDev from "@/assets/websitedevelopment.png";
import serviceAppDev from "@/assets/appdevelopment.png";
import serviceAI from "@/assets/ai automation.png";
import serviceCRM from "@/assets/crm development.png";
import serviceCustomSoftware from "@/assets/custom software development.png";
import serviceEcommerce from "@/assets/ecommerce deelopment.png";

import whyChoose from "@/assets/why-choose.png";
import bannerTech from "@/assets/banner-tech.jpg";

/* ============================================================================
   Contact constants
   ============================================================================ */

const PHONE_PK = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

const PHONE_UK = "+447717229638";
const PHONE_UK_DISP = "+44 771 722 9638";

const EMAIL = "info@amenterprise.tech";
const WEBSITE = "amenterprise.tech";

/* ============================================================================
   Icon map
   ============================================================================ */

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Smartphone,
  Sparkles,
  Cloud,
  Rocket,
  Bot,
  Users,
  TrendingUp,
  Zap,
  Building2,
  ShoppingCart,
  Heart,
  GraduationCap,
};

/* ============================================================================
   Types
   ============================================================================ */

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  tags: string[] | null;
  featured: boolean;
  sort_order: number;
  gradient: string;
};

type ClientRow = {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order?: number;
};

type TestimonialRow = {
  id: string;
  name: string;
  role_title: string | null;
  company: string | null;
  quote: string;
  stars: number | null;
  avatar_url: string | null;
  sort_order?: number;
};

type StepRow = {
  id: string;
  step_number: string;
  title: string;
  description: string;
  sort_order?: number;
};

type StatRow = {
  id: string;
  label: string;
  value: string;
  sort_order?: number;
};

/* ============================================================================
   Shared section title
   ============================================================================ */

function SectionTitle({
  title,
  subtitle,
  align = "center",
  light = false,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <Reveal>
      <div
        className={`mb-12 ${
          align === "center" ? "text-center" : "text-left"
        }`}
      >
        <div
          className={`flex items-center gap-4 ${
            align === "center"
              ? "justify-center"
              : "justify-start"
          }`}
        >
          <span className="h-px w-10 shrink-0 bg-[#2F8FFF]" />

          <h2
            className={`font-display text-3xl font-black tracking-tight sm:text-4xl ${
              light ? "text-white" : "text-[#0B1726]"
            }`}
          >
            {title}
          </h2>

          <span className="h-px w-10 shrink-0 bg-[#2F8FFF]" />
        </div>

        {subtitle && (
          <p
            className={`mx-auto mt-4 max-w-xl text-base leading-relaxed ${
              align === "center"
                ? "text-center"
                : "text-left max-w-2xl"
            } ${
              light
                ? "text-white/70"
                : "text-[#526273]"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}

/* ============================================================================
   02 — What We Do
   ============================================================================ */

const getImageForService = (
  slug: string,
  title: string
) => {
  const norm = `${slug} ${title}`.toLowerCase();

  if (
    norm.includes("web") ||
    norm.includes("website")
  ) {
    return serviceWebDev;
  }

  if (
    norm.includes("app") ||
    norm.includes("mobile")
  ) {
    return serviceAppDev;
  }

  if (norm.includes("crm")) {
    return serviceCRM;
  }

  if (
    norm.includes("e-com") ||
    norm.includes("ecommerce") ||
    norm.includes("e commerce")
  ) {
    return serviceEcommerce;
  }

  if (
    norm.includes("ai ") ||
    norm.includes("ai/") ||
    norm.includes("automation")
  ) {
    return serviceAI;
  }

  return serviceCustomSoftware;
};

/* ============================================================================
   Service card accents
   ============================================================================ */

const CARD_ACCENTS = [
  {
    bg: "#EAF6FF",
    iconBg: "#DBEAFE",
    iconColor: "#2F8FFF",
    arrowBg: "#2F8FFF",
  },
  {
    bg: "#EEF2FF",
    iconBg: "#E0E7FF",
    iconColor: "#6366F1",
    arrowBg: "#6366F1",
  },
  {
    bg: "#FFF7ED",
    iconBg: "#FFEDD5",
    iconColor: "#F97316",
    arrowBg: "#F97316",
  },
  {
    bg: "#F0FDF4",
    iconBg: "#DCFCE7",
    iconColor: "#22C55E",
    arrowBg: "#22C55E",
  },
  {
    bg: "#FDF4FF",
    iconBg: "#FAE8FF",
    iconColor: "#A855F7",
    arrowBg: "#A855F7",
  },
  {
    bg: "#FFF1F2",
    iconBg: "#FFE4E6",
    iconColor: "#F43F5E",
    arrowBg: "#F43F5E",
  },
  {
    bg: "#F0FDFA",
    iconBg: "#CCFBF1",
    iconColor: "#14B8A6",
    arrowBg: "#14B8A6",
  },
  {
    bg: "#FFFBEB",
    iconBg: "#FEF3C7",
    iconColor: "#F59E0B",
    arrowBg: "#F59E0B",
  },
];

/* ============================================================================
   Service card
   ============================================================================ */

function ServiceCard({
  s,
  idx,
}: {
  s: ServiceRow;
  idx: number;
}) {
  const accent =
    CARD_ACCENTS[idx % CARD_ACCENTS.length];

  const imgSrc = getImageForService(
    s.slug,
    s.title
  );

  return (
    <Reveal delay={idx * 70}>
      <Link
        to="/services/$slug"
        params={{
          slug: s.slug,
        }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DCEAF5] bg-white shadow-soft transition duration-500 hover:-translate-y-2 hover:shadow-luxury"
      >
        <div className="relative h-56 w-full overflow-hidden bg-[#F5FAFF]">
          <img
            src={imgSrc}
            alt={s.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: accent.iconBg,
            }}
          >
            {(() => {
              const Icon =
                iconMap[s.icon] ?? Code2;

              return (
                <Icon
                  className="h-5 w-5"
                  style={{
                    color: accent.iconColor,
                  }}
                />
              );
            })()}
          </div>

          <h3 className="font-display text-lg font-black text-[#0B1726]">
            {s.title}
          </h3>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-[#526273]">
            {s.description}
          </p>

          {s.tags &&
            s.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {s.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F5FAFF] px-2.5 py-1 text-[10px] font-semibold text-[#526273]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

          <div className="mt-5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-300 group-hover:w-full group-hover:justify-between group-hover:px-4"
              style={{
                background: accent.arrowBg,
              }}
            >
              <span className="hidden whitespace-nowrap text-xs font-bold opacity-0 transition-opacity delay-100 group-hover:block group-hover:opacity-100">
                Explore Service
              </span>

              <ArrowRight className="h-4 w-4 shrink-0" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/* ============================================================================
   Services grid
   ============================================================================ */

function ServicesGrid({
  services,
}: {
  services: ServiceRow[];
}) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section
      id="services"
      className="bg-[#F5FAFF] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-8">
        <SectionTitle
          title="What We Do"
          subtitle="Powerful, scalable solutions tailored to your business goals — from idea to impact."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services
            .slice(0, 8)
            .map((service, index) => (
              <ServiceCard
                key={service.id}
                s={service}
                idx={index}
              />
            ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   03 — Clients marquee
   ============================================================================ */

function ClientsStrip({
  clients,
}: {
  clients: ClientRow[];
}) {
  if (clients.length === 0) {
    return null;
  }

  const loop = [
    ...clients,
    ...clients,
    ...clients,
  ];

  return (
    <section className="border-y border-[#DCEAF5] bg-white py-8">
      <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.32em] text-[#526273]">
        Trusted by businesses across Pakistan, UK and beyond
      </p>

      <div className="overflow-hidden">
        <div className="flex animate-[scroll_30s_linear_infinite] gap-16 whitespace-nowrap px-4">
          {loop.map((client, index) =>
            client.logo_url ? (
              <img
                key={`${client.id}-${index}`}
                src={client.logo_url}
                alt={client.name}
                className="inline-block h-8 w-auto object-contain opacity-40 grayscale transition hover:opacity-80 hover:grayscale-0"
              />
            ) : (
              <span
                key={`${client.id}-${index}`}
                className="inline-block font-display text-sm font-black tracking-widest text-[#0B1726]/25 transition hover:text-[#0B1726]/60"
              >
                {client.name}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   04 — Industries
   ============================================================================ */

const INDUSTRIES = [
  {
    name: "FinTech & Finance",
    icon: TrendingUp,
  },
  {
    name: "Healthcare & MedTech",
    icon: Heart,
  },
  {
    name: "E-Commerce & Retail",
    icon: ShoppingCart,
  },
  {
    name: "SaaS & Enterprise",
    icon: Building2,
  },
  {
    name: "Real Estate",
    icon: Building2,
  },
  {
    name: "Logistics",
    icon: Rocket,
  },
  {
    name: "EdTech",
    icon: GraduationCap,
  },
];

/* ============================================================================
   Industries section
   ============================================================================ */

function IndustriesSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-8">
        <SectionTitle
          title="Industries We Empower"
          subtitle="Digital solutions designed around the challenges and opportunities of your industry."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map(
            (industry, index) => {
              const Icon = industry.icon;

              return (
                <Reveal
                  key={industry.name}
                  delay={index * 60}
                >
                  <div className="group flex h-full items-center gap-4 rounded-2xl border border-[#DCEAF5] bg-[#F5FAFF] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#2F8FFF]/40 hover:bg-white hover:shadow-luxury">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#2F8FFF] shadow-sm transition group-hover:bg-[#2F8FFF] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="font-display text-sm font-black text-[#0B1726]">
                      {industry.name}
                    </span>
                  </div>
                </Reveal>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   05 — Why Choose Us
   ============================================================================ */

const WHY_CARDS = [
  {
    icon: "🎯",
    title: "Business Understanding",
    desc: "We focus on solving your business problems, not just writing code.",
  },
  {
    icon: "🗣️",
    title: "Clear Communication",
    desc: "No jargon. Transparent updates and proactive reporting at every step.",
  },
  {
    icon: "🛡️",
    title: "Full Ownership",
    desc: "We take end-to-end responsibility for the success of your digital product.",
  },
  {
    icon: "✨",
    title: "Uncompromising Quality",
    desc: "Premium architecture, clean code, and exhaustive testing.",
  },
  {
    icon: "⚡",
    title: "Speed to Market",
    desc: "We prioritize rapid launches using agile methodologies to capture value fast.",
  },
  {
    icon: "🔍",
    title: "Radical Transparency",
    desc: "Open roadmaps, clear billing, and honest feedback on the best path forward.",
  },
  {
    icon: "🚀",
    title: "Built for Scalability",
    desc: "Future-proof systems designed to grow seamlessly with your user base.",
  },
  {
    icon: "📈",
    title: "Measurable Outcomes",
    desc: "We track success by your revenue growth, conversions, and operational efficiency.",
  },
];

/* ============================================================================
   Why section
   ============================================================================ */

function WhySection({
  stats,
}: {
  stats: StatRow[];
}) {
  return (
    <section
      id="why"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-8">
        <SectionTitle
          title="Why AM Enterprises"
          subtitle="We don't just build software. We build what grows businesses."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <Reveal>
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-[#DCEAF5] bg-[#0B1726]">
              <img
                src={whyChoose}
                alt="Why choose AM Enterprises"
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1726] via-[#0B1726]/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="font-display text-2xl font-black text-white">
                  Built Around Your Growth
                </p>

                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                  Strategy, design, engineering and support working together as one team.
                </p>

                {stats.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {stats.slice(0, 4).map((stat) => (
                      <div
                        key={stat.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                      >
                        <p className="font-display text-xl font-black text-white">
                          {stat.value}
                        </p>

                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {WHY_CARDS.map((card, index) => (
              <Reveal
                key={card.title}
                delay={index * 60}
              >
                <div className="flex h-full flex-col items-start gap-3 rounded-2xl border border-[#DCEAF5] bg-[#F5FAFF] p-6 transition hover:border-[#2F8FFF]/30 hover:bg-white">
                  <span className="text-3xl">
                    {card.icon}
                  </span>

                  <p className="font-display text-sm font-black text-[#0B1726]">
                    {card.title}
                  </p>

                  <p className="text-xs leading-relaxed text-[#526273]">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   06 — Business Outcomes
   ============================================================================ */

function BusinessOutcomes() {
  const outcomes = [
    {
      title: "Increase Conversions",
      desc: "Optimized user journeys that turn visitors into paying customers.",
      icon: TrendingUp,
    },
    {
      title: "Automate Operations",
      desc: "Custom software that removes manual data entry and saves hundreds of hours.",
      icon: Bot,
    },
    {
      title: "Improve Experience",
      desc: "Beautiful digital ecosystems that make your brand feel premium.",
      icon: Sparkles,
    },
    {
      title: "Scale Efficiently",
      desc: "Cloud-native architectures that handle massive traffic without breaking.",
      icon: Cloud,
    },
  ];

  return (
    <section className="border-y border-[#DCEAF5] bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <SectionTitle
          title="Real Business Outcomes"
          subtitle="We build software that pays for itself by directly impacting your bottom line."
        />

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.map(
            (outcome, index) => {
              const Icon = outcome.icon;

              return (
                <Reveal
                  key={outcome.title}
                  delay={index * 100}
                >
                  <div className="flex h-full flex-col items-center rounded-2xl border border-[#DCEAF5] bg-[#F5FAFF] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#DCEAF5] bg-white shadow-sm">
                      <Icon className="h-6 w-6 text-[#2F8FFF]" />
                    </div>

                    <h3 className="font-display text-lg font-black text-[#0B1726]">
                      {outcome.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#526273]">
                      {outcome.desc}
                    </p>
                  </div>
                </Reveal>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   08 — How We Work
   ============================================================================ */

const FALLBACK_STEPS: StepRow[] = [
  {
    id: "s1",
    step_number: "01",
    title: "Discovery",
    description:
      "We learn your business, users and goals — before touching any technology.",
  },
  {
    id: "s2",
    step_number: "02",
    title: "Strategy",
    description:
      "We define what to build, what to connect and the fastest path to your goal.",
  },
  {
    id: "s3",
    step_number: "03",
    title: "Design",
    description:
      "Wireframes, prototypes and UI — all reviewed and approved before development begins.",
  },
  {
    id: "s4",
    step_number: "04",
    title: "Development",
    description:
      "Agile sprints, weekly builds, and daily communication. No black boxes.",
  },
  {
    id: "s5",
    step_number: "05",
    title: "Launch",
    description:
      "Thorough testing, smooth deployment, and zero-drama go-live.",
  },
  {
    id: "s6",
    step_number: "06",
    title: "Growth & Support",
    description:
      "Post-launch monitoring, iterative improvements and long-term partnership.",
  },
];

/* ============================================================================
   Process section
   ============================================================================ */

function ProcessSection({
  steps,
}: {
  steps: StepRow[];
}) {
  const data =
    steps.length > 0
      ? steps
      : FALLBACK_STEPS;

  return (
    <section
      id="process"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-8">
        <SectionTitle
          title="How We Work"
          subtitle="A transparent, low-risk process — so you always know what is happening and what comes next."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((step, index) => (
            <Reveal
              key={step.id}
              delay={index * 60}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[#DCEAF5] bg-white p-7 shadow-soft transition hover:-translate-y-1.5 hover:border-[#2F8FFF]/30 hover:shadow-luxury">
                <span className="absolute -right-3 -top-3 select-none font-display text-7xl font-black text-[#0B1726]/[0.04] transition group-hover:text-[#2F8FFF]/[0.08]">
                  {step.step_number}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF6FF]">
                  <span className="font-display text-lg font-black text-[#2F8FFF]">
                    {step.step_number}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-lg font-black text-[#0B1726]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[#526273]">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   09 — Engagement Models
   ============================================================================ */

function EngagementModels() {
  const models = [
    {
      name: "Fixed Project",
      desc: "Best for clearly defined requirements. We agree on scope, timeline, and cost upfront.",
      highlight: false,
    },
    {
      name: "Dedicated Team",
      desc: "Scale your capacity instantly with our embedded engineers and designers.",
      highlight: true,
    },
    {
      name: "Long-Term Partnership",
      desc: "Continuous improvement, maintenance, and strategic growth for your product ecosystem.",
      highlight: false,
    },
  ];

  return (
    <section className="border-y border-[#DCEAF5] bg-[#F5FAFF] py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <SectionTitle
          title="Engagement Models"
          subtitle="Flexible ways to collaborate based on your product life cycle."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {models.map((model, index) => (
            <Reveal
              key={model.name}
              delay={index * 100}
            >
              <div
                className={`flex h-full flex-col rounded-3xl p-8 ${
                  model.highlight
                    ? "z-10 scale-[1.03] bg-[#0B1726] text-white shadow-luxury"
                    : "border border-[#DCEAF5] bg-white text-[#0B1726]"
                }`}
              >
                <h3
                  className={`font-display text-xl font-black ${
                    model.highlight
                      ? "text-white"
                      : "text-[#0B1726]"
                  }`}
                >
                  {model.name}
                </h3>

                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    model.highlight
                      ? "text-white/80"
                      : "text-[#526273]"
                  }`}
                >
                  {model.desc}
                </p>

                <div className="mt-8 flex flex-1 items-end">
                  <Link
                    to="/contact"
                    className={`flex items-center gap-2 text-sm font-bold ${
                      model.highlight
                        ? "text-[#2F8FFF] hover:text-white"
                        : "text-[#2F8FFF] hover:text-[#1769C2]"
                    }`}
                  >
                    Discuss this model
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   10 — Technology
   ============================================================================ */

function TechStack() {
  const technologies = [
    "React & Next.js",
    "TypeScript",
    "Node.js",
    "Python & AI",
    "AWS & Cloud",
    "React Native",
    "PostgreSQL",
  ];

  return (
    <section className="relative overflow-hidden border-t border-[#DCEAF5] bg-white py-20">
      <div className="absolute inset-0 opacity-[0.04]">
        <img
          src={bannerTech}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-8 text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#0B1726]/40">
          Core Expertise & Technologies
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-[#526273]">
          {technologies.map(
            (technology) => (
              <span key={technology}>
                {technology}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   11 — Testimonials
   ============================================================================ */

function TestimonialCard({
  testimonial,
}: {
  testimonial: TestimonialRow;
}) {
  const starCount = Math.max(
    0,
    Math.min(
      testimonial.stars ?? 5,
      5
    )
  );

  return (
    <div className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-[#DCEAF5] bg-white p-6 shadow-soft sm:w-[360px]">
      <div className="flex gap-0.5">
        {Array.from({
          length: starCount,
        }).map((_, index) => (
          <Star
            key={index}
            className="h-3.5 w-3.5 fill-[#2F8FFF] stroke-none"
          />
        ))}
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-[#0B1726]/80">
        &ldquo;
        {testimonial.quote}
        &rdquo;
      </p>

      <div className="mt-5 flex items-center gap-3 border-t border-[#DCEAF5] pt-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#EAF6FF] text-[#2F8FFF] ring-1 ring-[#DCEAF5]">
          {testimonial.avatar_url ? (
            <img
              src={testimonial.avatar_url}
              alt={testimonial.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-black">
              {testimonial.name.slice(0, 1)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#0B1726]">
            {testimonial.name}
          </p>

          <p className="truncate text-xs text-[#526273]">
            {testimonial.role_title}

            {testimonial.company
              ? `, ${testimonial.company}`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Testimonials section
   ============================================================================ */

function TestimonialsSection({
  items,
}: {
  items: TestimonialRow[];
}) {
  if (items.length === 0) {
    return null;
  }

  const middle = Math.ceil(
    items.length / 2
  );

  const rowA = items.slice(
    0,
    middle
  );

  const rowB =
    items.slice(middle).length > 0
      ? items.slice(middle)
      : rowA;

  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <SectionTitle
          title="What Clients Say"
          subtitle="Real feedback from founders and businesses we have built for."
        />
      </div>

      <div className="marquee-mask marquee-pause space-y-4">
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max gap-4 px-4">
            {[...rowA, ...rowA].map(
              (testimonial, index) => (
                <TestimonialCard
                  key={`a-${testimonial.id}-${index}`}
                  testimonial={testimonial}
                />
              )
            )}
          </div>
        </div>

        {rowB.length > 0 && (
          <div className="overflow-hidden">
            <div className="marquee-track-reverse flex w-max gap-4 px-4">
              {[...rowB, ...rowB].map(
                (testimonial, index) => (
                  <TestimonialCard
                    key={`b-${testimonial.id}-${index}`}
                    testimonial={testimonial}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   14 — FAQ
   ============================================================================ */

function FAQSection() {
  const faqs = [
    {
      q: "How much does a project cost?",
      a: "Project costs vary based on complexity, timeline, and features. We provide a transparent scope and fixed pricing structure upfront after our discovery call. No hidden fees.",
    },
    {
      q: "How long does development take?",
      a: "An MVP typically takes 4-8 weeks, while full enterprise solutions can take 3-6 months. We break development into actionable sprints to ensure you see progress continuously.",
    },
    {
      q: "Can you work with an existing codebase?",
      a: "Yes. Our team frequently inherits existing projects to refactor, scale, or rescue them. We start with a comprehensive code audit to determine viability.",
    },
    {
      q: "Do you sign NDAs?",
      a: "Absolutely. We are happy to sign a Non-Disclosure Agreement before discussing any proprietary ideas to ensure your intellectual property is safe.",
    },
    {
      q: "Do you provide post-launch support?",
      a: "Yes, we offer ongoing maintenance, scaling support, and optimization retainers after the product goes live. We view ourselves as long-term partners.",
    },
    {
      q: "How does communication work?",
      a: "We maintain dedicated communication channels, weekly progress meetings, and provide access to our project management tools so you always have full visibility.",
    },
  ];

  const [openIndex, setOpenIndex] =
    useState<number | null>(0);

  return (
    <section className="bg-[#F5FAFF] py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-8">
        <SectionTitle
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about partnering with us."
        />

        <div className="mt-12 flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen =
              openIndex === index;

            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-xl border border-[#DCEAF5] bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(
                      isOpen
                        ? null
                        : index
                    )
                  }
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#F5FAFF]"
                  aria-expanded={isOpen}
                >
                  <span className="pr-6 font-display font-bold text-[#0B1726]">
                    {faq.q}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#2F8FFF] transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "max-h-60 border-t border-[#DCEAF5]"
                      : "max-h-0"
                  }`}
                >
                  <div className="px-6 py-5 text-sm leading-relaxed text-[#526273]">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   15 — Final CTA
   ============================================================================ */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0B1726] py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#2F8FFF]/12 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#1769C2]/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-8 text-center">
        <Reveal>
          <p className="font-display text-lg font-black text-white sm:text-2xl">
            Have an Idea? Let's Turn It Into
          </p>

          <p className="font-display text-lg font-black text-[#2F8FFF] sm:text-2xl">
            Something That Grows Your Business.
          </p>

          <p className="mt-2 text-sm text-white/70">
            Skip the generic solutions. Book a free consultation and let's craft a roadmap to success.
          </p>
        </Reveal>

        <Reveal delay={210}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-xl bg-[#2F8FFF] px-7 py-3.5 text-sm font-bold text-white shadow-luxury transition duration-300 hover:scale-105 hover:bg-white hover:text-[#0B1726]"
            >
              Start Your Project

              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-9 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Book a Free Consultation
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================================
   16 — Contact bar
   ============================================================================ */

function ContactBar() {
  const contacts = [
    {
      href: `tel:${PHONE_PK}`,
      icon: Phone,
      label: PHONE_PK_DISP,
    },
    {
      href: `tel:${PHONE_UK}`,
      icon: Phone,
      label: PHONE_UK_DISP,
    },
    {
      href: `mailto:${EMAIL}`,
      icon: Mail,
      label: EMAIL,
    },
    {
      href: `https://www.amenterprise.tech`,
      icon: Globe,
      label: WEBSITE,
    },
  ];

  return (
    <section className="border-t border-[#DCEAF5] bg-white py-6">
      <div className="mx-auto max-w-[1280px] px-8">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {contacts.map((contact) => {
            const Icon = contact.icon;

            return (
              <a
                key={contact.label}
                href={contact.href}
                target={
                  contact.href.startsWith("http")
                    ? "_blank"
                    : undefined
                }
                rel={
                  contact.href.startsWith("http")
                    ? "noreferrer"
                    : undefined
                }
                className="flex items-center gap-2.5 rounded-full border border-[#DCEAF5] bg-[#F5FAFF] px-5 py-2.5 text-sm font-semibold text-[#0B1726] shadow-soft transition hover:border-[#2F8FFF]/40 hover:bg-[#EAF6FF]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F8FFF] text-white">
                  <Icon className="h-3.5 w-3.5" />
                </span>

                {contact.label}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   Main export
   ============================================================================ */

export function BentoHome() {
  const {
    rows: services,
  } = useLiveList<ServiceRow>(
    "services",
    {
      orderBy: {
        column: "sort_order",
      },
    }
  );

  const {
    rows: clients,
  } = useLiveList<ClientRow>(
    "clients",
    {
      orderBy: {
        column: "sort_order",
      },
    }
  );

  const {
    rows: testimonials,
  } =
    useLiveList<TestimonialRow>(
      "testimonials",
      {
        orderBy: {
          column: "sort_order",
        },
      }
    );

  const {
    rows: steps,
  } = useLiveList<StepRow>(
    "process_steps",
    {
      orderBy: {
        column: "sort_order",
      },
    }
  );

  const {
    rows: stats,
  } = useLiveList<StatRow>(
    "stats",
    {
      orderBy: {
        column: "sort_order",
      },
    }
  );

  return (
    <>
      {/* 01 */}
      <TrustBar />

      {/* 02 */}
      <ServicesGrid
        services={services}
      />

      {/* 03 */}
      <ClientsStrip
        clients={clients}
      />

      {/* 04 */}
      <IndustriesSection />

      {/* 05 */}
      <WhySection
        stats={stats}
      />

      {/* 06 */}
      <BusinessOutcomes />

      {/* 07 */}
      <PortfolioPreview />

      {/* 08 */}
      <ProcessSection
        steps={steps}
      />

      {/* 09 */}
      <EngagementModels />

      {/* 10 */}
      <TechStack />

      {/* 11 */}
      <TestimonialsSection
        items={testimonials}
      />

      {/* 12 */}
      <TeamStrip />

      {/* 13 */}
      <LiveActivity />

      {/* 14 */}
      <FAQSection />

      {/* 15 */}
      <FinalCTA />

      {/* 16 */}
      <ContactBar />
    </>
  );
}
