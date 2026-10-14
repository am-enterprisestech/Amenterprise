import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { dbSelect } from "@/lib/rest";
import {
  ArrowLeft,
  ArrowRight,
  Linkedin,
  Twitter,
  Mail,
  Building2,
  Users,
  Quote,
  Award,
  Target,
  TrendingUp,
  Heart,
  BookOpen,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { isDirector, nameToSlug } from "./directors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Director = {
  id: string;
  name: string;
  role_title: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
};

type ValueItem = { icon: string; title: string; description: string };
type JourneyEntry = { year: string; title: string; body: string };
type DirectorExtra = {
  quote: string;
  journeyEntries: JourneyEntry[];
  responsibilities: string[];
  expertise: string[];
  values: ValueItem[];
  achievements: string[];
};

/* ─── Icon lookup map ────────────────────────────────────────────────────── */

const VALUE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Users,
  TrendingUp,
  Heart,
  BookOpen,
};

function getValueIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return VALUE_ICON_MAP[iconName] ?? Star;
}

/* ─── Static per-director data ───────────────────────────────────────────── */

const DIRECTOR_DATA: Record<string, DirectorExtra> = {
  "moez-rehman": {
    quote:
      "I started with one laptop and one belief — that quality work always finds its audience. Seven years later, that belief built AM Enterprise.",
    journeyEntries: [
      {
        year: "2018",
        title: "The Freelancer",
        body: "Started solo as a freelancer, taking on international clients with nothing but skill and determination. Every project was a lesson; every client a stepping stone.",
      },
      {
        year: "2021",
        title: "Growing the Network",
        body: "Expanded into a trusted network of collaborators. Began building long-term relationships with international clients across the US, UK, and Middle East.",
      },
      {
        year: "2023",
        title: "Building the Team",
        body: "Transitioned from freelancer to founder. Assembled AM Enterprise's first core team — hand-picked professionals united by one standard: excellence.",
      },
      {
        year: "2025",
        title: "Global Presence",
        body: "Opened offices in Islamabad and Wimbledon (UK). AM Enterprise now runs with 15–17 professionals, 4 offices, and a growing global network of partners.",
      },
    ],
    responsibilities: [
      "Setting company vision and long-term strategy",
      "Client acquisition and senior relationship management",
      "Team leadership and culture building",
      "Technology direction and innovation oversight",
      "Partner and investor relations",
    ],
    expertise: [
      "Full-Stack Software Development",
      "Digital Transformation Strategy",
      "International Business Development",
      "Product Management",
      "Team Building & Leadership",
    ],
    values: [
      {
        icon: "Target",
        title: "Results-Driven",
        description:
          "We ship what matters. Every hour our team works maps to a real outcome for the client.",
      },
      {
        icon: "Users",
        title: "People-First",
        description:
          "Our team's growth is the company's growth. When our people win, AM Enterprise wins.",
      },
      {
        icon: "TrendingUp",
        title: "The Long Game",
        description:
          "We build for the next 10 years, not the next sprint. Quality and longevity over quick wins.",
      },
    ],
    achievements: [
      "Led AM Enterprise from solo freelancer to a 15–17 person team",
      "Established AM Enterprise's UK office in Wimbledon in 2025",
      "Delivered 100+ projects for international clients across 3 continents",
      "Built a 4-office presence across Pakistan (Islamabad ×3) and UK (Wimbledon)",
    ],
  },

  "malika-jhangeer": {
    quote:
      "Partnerships and people — that's what business is really made of. The rest is just execution.",
    journeyEntries: [
      {
        year: "Early Career",
        title: "Building Expertise",
        body: "Built deep expertise in social media strategy and business development, working with brands to craft authentic digital narratives that convert.",
      },
      {
        year: "Joining AM",
        title: "Joining AM Enterprise",
        body: "Brought strategic partnerships and social media leadership to AM Enterprise, immediately elevating the company's digital presence and business network.",
      },
      {
        year: "Today",
        title: "Driving Growth",
        body: "Today drives business development and social media strategy across all AM Enterprise accounts, connecting the brand to clients, partners, and audiences globally.",
      },
    ],
    responsibilities: [
      "Business partnerships and collaborations",
      "Social media strategy and execution",
      "Brand positioning and storytelling",
      "Client relationship management",
      "Content direction and creative oversight",
    ],
    expertise: [
      "Social Media Strategy",
      "Business Development",
      "Brand Building",
      "Content Marketing",
      "Partnership Management",
    ],
    values: [
      {
        icon: "Heart",
        title: "Authentic Connections",
        description:
          "Real relationships drive real results. Every partnership AM Enterprise holds is built on trust, not transactions.",
      },
      {
        icon: "BookOpen",
        title: "Strategic Storytelling",
        description:
          "Every brand has a story worth telling. Great storytelling is the bridge between a company and its audience.",
      },
      {
        icon: "TrendingUp",
        title: "Growth Mindset",
        description:
          "We don't do small thinking. Every strategy is built to scale, evolve, and outlast the trend cycle.",
      },
    ],
    achievements: [
      "Built AM Enterprise's social media presence from zero to a recognized brand",
      "Established key business partnerships across Pakistan and the UK",
      "Drove measurable engagement growth across all AM Enterprise platforms",
      "Positioned AM Enterprise as a recognized voice in the tech industry",
    ],
  },
};

/** Fallback for any director not listed above */
function getDirectorExtra(slug: string, name: string): DirectorExtra {
  if (DIRECTOR_DATA[slug]) return DIRECTOR_DATA[slug];
  const first = name.split(" ")[0];
  return {
    quote: `${first} brings deep expertise and a client-first mindset to everything AM Enterprise does.`,
    journeyEntries: [
      {
        year: "Early Career",
        title: "Building the Foundation",
        body: `${first} began their career honing skills that would later define their leadership style at AM Enterprise.`,
      },
      {
        year: "Joining AM",
        title: "Joining the Mission",
        body: `${first} joined AM Enterprise and quickly became a key part of the leadership driving the company's growth.`,
      },
      {
        year: "Today",
        title: "Leading the Charge",
        body: `Today ${first} plays a central role in shaping AM Enterprise's strategy, team culture, and client relationships.`,
      },
    ],
    responsibilities: [
      "Strategic planning and execution",
      "Client relationship management",
      "Team leadership and mentorship",
      "Cross-department collaboration",
    ],
    expertise: [
      "Business Strategy",
      "Project Management",
      "Client Success",
      "Team Development",
    ],
    values: [
      {
        icon: "Target",
        title: "Results-Driven",
        description:
          "Every decision maps to a real outcome. We hold ourselves accountable to the results we promise.",
      },
      {
        icon: "Users",
        title: "Team First",
        description:
          "Great teams build great companies. We invest in people before we invest in processes.",
      },
      {
        icon: "TrendingUp",
        title: "Continuous Growth",
        description:
          "Stagnation is the enemy of excellence. We are always learning, improving, and pushing further.",
      },
    ],
    achievements: [
      "Contributed to AM Enterprise's growth from a startup to a 15–17 person team",
      "Helped establish AM Enterprise's international client network",
      "Drove key initiatives that improved delivery quality across the team",
      "Built long-term client relationships that continue to generate repeat business",
    ],
  };
}

/* ─── Route ──────────────────────────────────────────────────────────────── */

export const Route = createFileRoute("/directors/$slug")({
  loader: async ({ params }) => {
    const all = await dbSelect<Director>("team_members", {
      select: "id,name,role_title,bio,photo_url,linkedin_url,twitter_url,sort_order",
      order: { column: "sort_order" },
    });

    const directors = all.filter(isDirector);
    const director = directors.find((d) => nameToSlug(d.name) === params.slug);
    if (!director) throw notFound();

    const others = directors.filter((d) => d.id !== director.id).slice(0, 3);

    return { director, others };
  },

  head: ({ params, loaderData }) => {
    const d = loaderData?.director;
    if (!d) {
      return {
        meta: [
          { title: "Director not found — AM Enterprise" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${d.name}${d.role_title ? ` — ${d.role_title}` : ""} | AM Enterprise`;
    const description = (d.bio ?? `${d.name} is a director at AM Enterprise.`).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `${SITE_URL}/directors/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/directors/${params.slug}` }],
    };
  },

  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl font-black text-espresso">Director not found</h1>
      <p className="mt-3 text-sm text-foreground/60">
        This profile doesn't exist or may have moved.
      </p>
      <Link
        to="/directors"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-white hover:bg-cocoa"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Directors
      </Link>
    </div>
  ),

  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center" role="alert">
      <h1 className="font-display text-2xl font-black text-espresso">Something went wrong</h1>
      <p className="mt-2 text-sm text-foreground/60">
        {error instanceof Error ? error.message : String(error)}
      </p>
      <Link
        to="/directors"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-white hover:bg-cocoa"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Directors
      </Link>
    </div>
  ),

  component: DirectorProfilePage,
});

/* ─── Page Component ─────────────────────────────────────────────────────── */

function DirectorProfilePage() {
  const { director: d, others } = Route.useLoaderData();
  const slug = nameToSlug(d.name);
  const extra = getDirectorExtra(slug, d.name);
  const firstName = d.name.split(" ")[0];

  return (
    <article className="bg-white">

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1726] via-[#0B2D50] to-[#0f3460]">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cocoa/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-20 h-64 w-64 rounded-full bg-[#2F8FFF]/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[1280px] px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-10">
          {/* Back breadcrumb */}
          <Link
            to="/directors"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Directors
          </Link>

          <div className="mt-10 grid gap-10 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-end lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* Photo */}
            <Reveal variant="zoom">
              <div className="relative mx-auto aspect-[3/4] w-64 overflow-hidden rounded-3xl sm:mx-0 sm:w-full">
                {d.photo_url ? (
                  <img
                    src={d.photo_url}
                    alt={d.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-espresso to-[#0B2D50]">
                    <span className="font-display text-8xl font-black text-cocoa">
                      {d.name.slice(0, 1)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1726]/60 via-transparent to-transparent" />
              </div>
            </Reveal>

            {/* Info */}
            <Reveal delay={80}>
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-copper">
                  {d.role_title ?? "Director"}
                </p>
                <h1 className="mt-3 font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                  {d.name}
                </h1>
                {d.bio && (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
                    {d.bio}
                  </p>
                )}

                {/* Social + CTA */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-cocoa px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-copper"
                  >
                    <Mail className="h-4 w-4" /> Work with {firstName}
                  </Link>
                  {d.linkedin_url && (
                    <a
                      href={d.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${d.name} on LinkedIn`}
                      className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {d.twitter_url && (
                    <a
                      href={d.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${d.name} on X / Twitter`}
                      className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — Quote / Motto
      ════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-sand py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <blockquote className="relative text-center">
              <Quote
                className="mx-auto mb-4 h-10 w-10 text-cocoa/30"
                aria-hidden="true"
              />
              <p className="font-display text-2xl font-black leading-snug text-espresso sm:text-3xl lg:text-4xl">
                "{extra.quote}"
              </p>
              <footer className="mt-6 text-sm font-semibold text-foreground/50">
                — {d.name}
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — About / Story
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            {/* Left: bio */}
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
                <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
                About {firstName}
              </span>
              <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
                About {firstName}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-body-text">
                {d.bio ??
                  `${d.name} is a key leader at AM Enterprise, driving strategy, client relationships, and team excellence from day one.`}
              </p>
            </Reveal>

            {/* Right: quick fact cards */}
            <Reveal delay={80}>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-sand p-5 shadow-soft">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-body-text">Company</p>
                    <p className="mt-0.5 font-display text-base font-black text-espresso">AM Enterprise</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-sand p-5 shadow-soft">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-body-text">Founded</p>
                    <p className="mt-0.5 font-display text-base font-black text-espresso">Since 2018</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-sand p-5 shadow-soft">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cocoa/10 text-cocoa">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-body-text">Offices</p>
                    <p className="mt-0.5 font-display text-base font-black text-espresso">4 Offices</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Journey Timeline
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-sand/40 py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              The Journey
            </span>
            <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
              The Journey
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-body-text">
              Every great outcome starts with a story. Here's how {firstName} got here.
            </p>
          </Reveal>

          <div className="relative mt-12">
            {/* Vertical connector */}
            <div
              className="absolute left-6 top-0 h-full w-px bg-border"
              aria-hidden="true"
            />
            <ol className="space-y-8">
              {extra.journeyEntries.map((entry, i) => (
                <Reveal key={entry.year + i} delay={i * 100}>
                  <li className="relative flex gap-6 pl-16">
                    {/* Year badge */}
                    <div className="absolute left-0 top-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-cocoa bg-white shadow-soft">
                      <span className="px-0.5 text-center text-[9px] font-black uppercase leading-none tracking-widest text-cocoa">
                        {entry.year.length <= 4 ? entry.year : entry.year.slice(0, 4)}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft transition hover:border-cocoa/25 hover:shadow-luxury">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cocoa">
                        {entry.year}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-black text-espresso">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-body-text">
                        {entry.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — Current Role
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              Role & Responsibilities
            </span>
            <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
              What {firstName} Does Today
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* Role card */}
            <Reveal delay={60}>
              <div className="h-full rounded-3xl border border-border bg-sand p-8 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cocoa/10 text-cocoa">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-body-text">
                      Current Position
                    </p>
                    <p className="mt-0.5 font-display text-lg font-black text-espresso">
                      {d.role_title ?? "Director"}
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-body-text">
                    <Building2 className="h-4 w-4 text-cocoa" />
                    AM Enterprise
                  </div>
                  <div className="flex items-center gap-2 text-sm text-body-text">
                    <MapPin className="h-4 w-4 text-cocoa" />
                    Islamabad, Pakistan · Wimbledon, UK
                  </div>
                  <div className="flex items-center gap-2 text-sm text-body-text">
                    <Users className="h-4 w-4 text-cocoa" />
                    15–17 team members across 4 offices
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Responsibilities */}
            <Reveal delay={120}>
              <div className="h-full rounded-3xl border border-border bg-white p-8 shadow-soft">
                <h3 className="font-display text-lg font-black text-espresso">
                  Key Responsibilities
                </h3>
                <ul className="mt-5 space-y-3">
                  {extra.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-body-text">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cocoa" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — Expertise & Skills
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-sand py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
                <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
                Expertise
              </span>
              <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
                Areas of Expertise
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-body-text">
                The skills and domains {firstName} has mastered across years of hands-on work.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {extra.expertise.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-espresso/10 bg-white px-5 py-2.5 text-sm font-semibold text-espresso shadow-soft transition hover:border-cocoa/30 hover:shadow-luxury"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 6 — Values / Leadership Philosophy
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
                <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
                Leadership Philosophy
              </span>
              <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
                Leadership Philosophy
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-body-text">
                The beliefs that drive how {firstName} leads and builds.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {extra.values.map((v, i) => {
              const Icon = getValueIcon(v.icon);
              return (
                <Reveal key={v.title} delay={i * 80}>
                  <div className="rounded-3xl border border-border bg-sand p-8">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cocoa/10 text-cocoa">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-black text-espresso">
                      {v.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-body-text">
                      {v.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 7 — Achievements / Highlights
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-sand/40 py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              Key Achievements
            </span>
            <h2 className="mt-4 font-display text-3xl font-black leading-tight text-espresso sm:text-4xl">
              Key Achievements
            </h2>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {extra.achievements.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft"
                >
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
                  <p className="text-sm leading-relaxed text-body-text">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 8 — Connect / CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1726] to-[#0B2D50] p-10 sm:p-14">
              {/* Decorative blobs */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cocoa/20 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-[#2F8FFF]/15 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                  Get in Touch
                </span>
                <h2 className="mt-4 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
                  Work with {firstName}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/65">
                  {firstName} is directly involved in every major project at AM Enterprise. If you have a vision, let's make it real.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-cocoa px-7 py-3.5 text-sm font-bold text-white transition hover:bg-copper"
                  >
                    Start a conversation <ArrowRight className="h-4 w-4" />
                  </Link>

                  {d.linkedin_url && (
                    <a
                      href={d.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${d.name} on LinkedIn`}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/8"
                    >
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}

                  {d.twitter_url && (
                    <a
                      href={d.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${d.name} on X / Twitter`}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/8"
                    >
                      <Twitter className="h-4 w-4" /> Twitter
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 9 — Other Directors strip (conditional)
      ════════════════════════════════════════════════════════════════════ */}
      {others.length > 0 && (
        <section className="border-t border-border bg-sand py-16">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="font-display text-2xl font-black text-espresso">
                  More from leadership
                </h2>
                <Link
                  to="/directors"
                  className="text-sm font-bold text-cocoa transition hover:underline"
                >
                  View all directors →
                </Link>
              </div>
            </Reveal>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o, i) => {
                const oSlug = nameToSlug(o.name);
                return (
                  <Reveal key={o.id} delay={i * 70}>
                    <Link
                      to="/directors/$slug"
                      params={{ slug: oSlug }}
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-luxury"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-sand">
                        {o.photo_url ? (
                          <img
                            src={o.photo_url}
                            alt={o.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-espresso to-[#0B2D50]">
                            <span className="font-display text-2xl font-black text-cocoa">
                              {o.name.slice(0, 1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold uppercase tracking-widest text-copper">
                          {o.role_title ?? "Director"}
                        </p>
                        <p className="truncate font-display text-base font-black text-espresso">
                          {o.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-cocoa group-hover:underline">
                          View Journey →
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
