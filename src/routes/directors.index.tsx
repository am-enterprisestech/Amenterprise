import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { Linkedin, Twitter, Mail, ArrowRight, ShieldCheck, Briefcase, Award, CheckCircle2, Sparkles, UserCheck, Compass, Target, Cpu } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";
import { useMemo } from "react";

export const Route = createFileRoute("/directors/")({
  head: () => ({
    meta: [
      { title: "Board of Directors & Founding Story — AM Enterprises" },
      {
        name: "description",
        content:
          "The Founding Story and Board of Directors of AM Enterprises — Moez Rehman (Founder & CEO), Ayesha Moez (Co-Founder & Director of Automation), and Malaika Jahangir (Director of Growth & Meta Engineering).",
      },
      { property: "og:title", content: "Board of Directors — AM Enterprises" },
      {
        property: "og:description",
        content:
          "Discover the founding story and vision of AM Enterprises. Directed by senior founders leading full-stack engineering, AI automation, and Meta Ads attribution.",
      },
      { property: "og:url", content: SITE_URL + "/directors" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/directors" }],
  }),
  component: DirectorsPage,
});

export interface DirectorProfile {
  id: string;
  name: string;
  slug: string;
  role_title: string;
  short_role: string;
  tagline: string;
  experience: string;
  years: number;
  bio: string;
  long_bio: string;
  expertise: string[];
  achievements: string[];
  photo_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  email?: string | null;
  location?: string;
  badge?: string;
}

export const DIRECTORS: DirectorProfile[] = [
  {
    id: "moez-rehman",
    name: "Moez Rehman",
    slug: "moez-rehman",
    role_title: "Founder & Chief Executive Officer",
    short_role: "Founder & CEO",
    tagline: "Full-Stack Developer & Ecosystem Architect",
    experience: "3+ Years Experience",
    years: 5,
    location: "Islamabad / Remote",
    badge: "Executive Leadership",
    bio: "Founder & CEO of AM Enterprises with 3+ years of experience engineering high-performance web platforms, enterprise ERP systems, and AI-driven business workflows.",
    long_bio: `Moez Rehman is the Founder and Chief Executive Officer of AM Enterprises. With over 5 years of hands-on engineering leadership in full-stack web development, backend infrastructure, and enterprise product architecture, Moez spearheads the company's strategic vision and technology execution.

Under his leadership, AM Enterprises has transitioned from traditional web development into building integrated digital ecosystems—combining high-speed React frontends, robust Supabase databases, custom microservices, and server-side Meta Ads attribution systems.

Moez works directly with business founders and enterprise decision-makers to transform complex business challenges into seamless, scalable digital solutions.`,
    expertise: [
      "Full-Stack Web Engineering (React, Vite, Node.js)",
      "Enterprise System Architecture & API Design",
      "Database Modeling (Supabase & PostgreSQL)",
      "AI Workflow Integration & Automation Engines",
      "Technical Product Strategy & Client SLA Execution",
    ],
    achievements: [
      "Founded AM Enterprises and scaled agency engineering capabilities",
      "Architected 50+ enterprise-grade web applications and business portals",
      "Pioneered first-party attribution tracking engines for high-volume client ad funnels",
    ],
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
    email: "moez@amenterprise.tech",
  },
  {
    id: "ayesha-moez",
    name: "Ayesha Moez",
    slug: "ayesha-moez",
    role_title: "Co-Founder & Director of Automation",
    short_role: "Co-Founder & Director",
    tagline: "YouTube Automation Specialist & AI Workflow Strategist",
    experience: "3+ Years Experience",
    years: 3,
    location: "Islamabad / Remote",
    badge: "Automation Division",
    bio: "Co-Founder & Director of Automation with 3+ years of experience leading YouTube channel automation engines, AI workflow pipelines, and automated lead nurturing systems.",
    long_bio: `Ayesha Moez is the Co-Founder and Director of Automation at AM Enterprises. She brings 3+ years of specialized experience in artificial intelligence workflows, automated video production pipelines, and digital channel growth engines.

Ayesha leads the agency's Automation & AI division, helping companies replace manual, repetitive business tasks with intelligent server-side automations. Her expertise spans autonomous AI chatbot agents, YouTube automated channel engines, lead nurturing workflows, and multi-channel webhook integrations.

Her systems enable clients to operate 24/7 with zero operational friction, significantly lowering overhead costs while accelerating revenue growth.`,
    expertise: [
      "YouTube Automation & Video Pipeline Scaling",
      "AI Autonomous Agent Workflows (GPT-4, Claude)",
      "Multi-Channel Lead Nurturing & Email Automation",
      "Zapier / Make / Webhook Integration Engines",
      "Digital Content Strategy & Impression Scaling",
    ],
    achievements: [
      "Built content automation engines driving millions of organic digital impressions",
      "Engineered automated lead qualification bots integrated into client CRMs",
      "Co-founded AM Enterprises Automation practice serving international clients",
    ],
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
    email: "ayesha@amenterprise.tech",
  },
  {
    id: "malaika-jahangir",
    name: "Malaika Jahangir",
    slug: "malaika-jahangir",
    role_title: "Director of Growth & Meta Engineering",
    short_role: "Director & CTO",
    tagline: "Meta Ads Specialist, CAPI Architect & CSR Lead",
    experience: "3+ Years Experience",
    years: 3,
    location: "Islamabad / Remote",
    badge: "Growth & Attribution",
    bio: "Director of Growth & Meta Engineering with 3+ years of experience optimizing Meta ad campaigns, Conversions API (CAPI) server tracking, and Customer Success & Retention (CSR).",
    long_bio: `Malaika Jahangir serves as Director of Growth & Meta Engineering at AM Enterprises. With 3+ years of specialized experience in performance marketing, server-side event tracking, and customer relationship management (CSR), Malaika ensures that client technology directly translates into measurable business growth.

She leads campaign architecture across Meta (Facebook & Instagram), Google Ads, and TikTok, backed by first-party cookie tracking and Meta Conversions API (CAPI) deduplication.

Malaika also oversees Customer Success & Retention (CSR), maintaining high satisfaction standards, account SLA compliance, and long-term client partnerships.`,
    expertise: [
      "Meta Ads Campaign Management (Facebook & IG)",
      "Meta Conversions API (CAPI) & Server Event Tracking",
      "First-Party UTM & Click Attribution Setup",
      "Customer Success & Client Account Retention (CSR)",
      "Full-Funnel A/B Testing & ROAS Optimization",
    ],
    achievements: [
      "Managed performance campaigns scaling client ROAS across global ad funnels",
      "Implemented zero-loss CAPI server deduplication systems for web apps",
      "Leads Client Success (CSR) and Growth Engineering at AM Enterprises",
    ],
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
    email: "malaika@amenterprise.tech",
  },
];

type DbMember = {
  id: string;
  name: string;
  slug: string | null;
  role_title: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
};

function DirectorsPage() {
  useApplyPageSeo("/directors");
  const { rows: dbMembers } = useLiveList<DbMember>("team_members", {
    orderBy: { column: "sort_order" },
    select: "id,name,slug,role_title,bio,photo_url,linkedin_url,twitter_url,sort_order,published",
  });

  // Dynamically fetch and merge images & profile data from Supabase database for Directors ONLY
  const directorsList = useMemo(() => {
    return DIRECTORS.map((d) => {
      const dbMatch = dbMembers.find(
        (m) =>
          (m.slug && m.slug.toLowerCase() === d.slug.toLowerCase()) ||
          m.name.toLowerCase().includes(d.name.toLowerCase().split(" ")[0]),
      );
      if (dbMatch) {
        return {
          ...d,
          photo_url: dbMatch.photo_url || d.photo_url,
          bio: dbMatch.bio || d.bio,
          linkedin_url: dbMatch.linkedin_url || d.linkedin_url,
          twitter_url: dbMatch.twitter_url || d.twitter_url,
        };
      }
      return d;
    });
  }, [dbMembers]);

  return (
    <>
      <PageHeader
        eyebrow="Board of Directors"
        title="Leadership engineered by founders."
        description="Meet the Board of Directors steering AM Enterprises. Senior executive leadership directly involved in full-stack architecture, AI automation engines, and Meta growth tracking."
      />

      {/* THE FOUNDING STORY SECTION */}
      <section className="bg-white py-16 border-b border-espresso/10">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Reveal>
            <div className="rounded-3xl border border-espresso/12 bg-sand/30 p-8 lg:p-12 shadow-soft">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cocoa">
                  <Compass className="h-4 w-4" /> The Founding Story
                </span>
                <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
                  From Visionary Engineering to Full Digital Ecosystems.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-body-text">
                  AM Enterprises was founded with a singular mission: to eliminate disjointed tech stacks and replace them with unified digital ecosystems. We realized that modern businesses don't just need a static website—they need connected systems where web apps, CRM databases, AI automations, and ad attribution communicate seamlessly.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-body-text">
                  Under the direction of <strong className="text-espresso font-bold">Moez Rehman</strong>, <strong className="text-espresso font-bold">Ayesha Moez</strong>, and <strong className="text-espresso font-bold">Malaika Jahangir</strong>, AM Enterprises brings together senior-level full-stack engineering, 24/7 AI workflow automation, and server-side Meta Ads attribution under one roof.
                </p>
              </div>

              {/* STORY PILLARS */}
              <div className="mt-10 grid gap-6 md:grid-cols-3 pt-8 border-t border-espresso/10">
                <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-black text-espresso">Ecosystem Architecture</h3>
                  <p className="mt-1 text-xs leading-relaxed text-body-text">
                    Led by Moez Rehman (3+ Yrs Exp). Engineering robust full-stack platforms, Vite/React apps, and Supabase database engines.
                  </p>
                </div>

                <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-black text-espresso">AI & Automation</h3>
                  <p className="mt-1 text-xs leading-relaxed text-body-text">
                    Led by Ayesha Moez (3+ Yrs Exp). Building YouTube channel automation engines, AI chatbots, and multi-channel workflows.
                  </p>
                </div>

                <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-black text-espresso">Growth & Meta CAPI</h3>
                  <p className="mt-1 text-xs leading-relaxed text-body-text">
                    Led by Malaika Jahangir (3+ Yrs Exp). Optimizing Meta Ads, Conversions API (CAPI) deduplication, and Customer Success (CSR).
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BOARD OF DIRECTORS SHOWCASE */}
      <section className="bg-sand/20 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cocoa">
              <ShieldCheck className="h-4 w-4" /> Executive Board
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-espresso sm:text-4xl">
              Meet Our Board of Directors
            </h2>
            <p className="mt-2 text-sm text-body-text max-w-2xl mx-auto leading-relaxed">
              Every client project is directed by our founding leaders. Profiles and images are dynamically synced from our live database.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {directorsList.map((director, idx) => (
              <Reveal key={director.id} delay={idx * 120}>
                <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-espresso/12 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-luxury">

                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-sand px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-cocoa">
                        {director.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <Briefcase className="h-3 w-3" /> {director.experience}
                      </span>
                    </div>

                    {/* Photo / Avatar (Fetched dynamically from Database) */}
                    <div className="relative mt-6 aspect-square overflow-hidden rounded-2xl bg-espresso">
                      {director.photo_url ? (
                        <img
                          src={director.photo_url}
                          alt={director.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0B1726] via-[#162A45] to-[#2F8FFF]">
                          <div className="text-center p-6">
                            <span className="font-display text-6xl font-black text-white/90">
                              {director.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                            <p className="mt-2 text-xs font-semibold text-white/70">{director.short_role}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/20 to-transparent opacity-80 transition duration-300 group-hover:opacity-90" />

                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-copper">
                          {director.role_title}
                        </p>
                        <h3 className="font-display text-2xl font-black text-white">
                          {director.name}
                        </h3>
                      </div>
                    </div>

                    {/* Tagline & Bio */}
                    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-cocoa">
                      {director.tagline}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-body-text">
                      {director.bio}
                    </p>

                    {/* Key Expertise List */}
                    <div className="mt-5 pt-4 border-t border-espresso/10">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-espresso/60 mb-2">
                        Core Competencies:
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {director.expertise.slice(0, 3).map((exp, eIdx) => (
                          <li key={eIdx} className="flex items-start gap-2 text-espresso/80 font-medium">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cocoa" />
                            <span className="line-clamp-1">{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions & Profile Link */}
                  <div className="mt-8 pt-4 border-t border-espresso/10 flex items-center justify-between gap-3">
                    <Link
                      to="/directors/$slug"
                      params={{ slug: director.slug }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-cocoa"
                    >
                      <span>View Director Profile</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {director.linkedin_url && (
                        <a
                          href={director.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-espresso/12 text-espresso hover:bg-sand transition"
                          aria-label={`${director.name} LinkedIn`}
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {director.twitter_url && (
                        <a
                          href={director.twitter_url}
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-espresso/12 text-espresso hover:bg-sand transition"
                          aria-label={`${director.name} Twitter`}
                        >
                          <Twitter className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
