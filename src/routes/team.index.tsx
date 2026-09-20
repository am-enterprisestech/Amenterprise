import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { Linkedin, Twitter, Mail, Code2, Users, ArrowRight, CheckCircle2, Sparkles, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { useLiveList } from "@/lib/use-live-list";
import { useMemo } from "react";

export const Route = createFileRoute("/team/")({
  head: () => ({
    meta: [
      { title: "Our Engineering & Operational Team — AM Enterprises" },
      {
        name: "description",
        content:
          "Meet the senior full-stack developers, UI/UX designers, project managers, and growth engineers at AM Enterprises.",
      },
      { property: "og:title", content: "Our Team — AM Enterprises" },
      {
        property: "og:description",
        content:
          "Senior, accountable, and directly involved engineers, designers, and system architects building client digital ecosystems.",
      },
      { property: "og:url", content: SITE_URL + "/team" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/team" }],
  }),
  component: TeamPage,
});

type Member = {
  id: string;
  name: string;
  slug: string | null;
  role_title: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  department?: string | null;
  published?: boolean;
};

// Default engineering & operational team members fallback
const DEFAULT_TEAM_MEMBERS: Member[] = [
  {
    id: "team-1",
    name: "Ali Raza",
    slug: "ali-raza",
    role_title: "Senior Full-Stack Developer",
    department: "Engineering",
    bio: "Specializes in React, Vite, Node.js, and Supabase database integrations for scalable enterprise applications.",
    photo_url: null,
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
  },
  {
    id: "team-2",
    name: "Hamza Farooq",
    slug: "hamza-farooq",
    role_title: "UI/UX & Product Designer",
    department: "Design Studio",
    bio: "Crafts high-converting user interfaces, dark mode themes, micro-animations, and glassmorphic design systems.",
    photo_url: null,
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
  },
  {
    id: "team-3",
    name: "Zainab Malik",
    slug: "zainab-malik",
    role_title: "Lead Project & Delivery Manager",
    department: "Management",
    bio: "Ensures agile delivery, milestone tracking, client communication, and strict SLA fulfillment on all technical builds.",
    photo_url: null,
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
  },
  {
    id: "team-4",
    name: "Usman Ghani",
    slug: "usman-ghani",
    role_title: "DevOps & Cloud Infrastructure Engineer",
    department: "Infrastructure",
    bio: "Manages CI/CD pipelines, Vercel/AWS deployments, edge functions, and database performance optimizations.",
    photo_url: null,
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
  },
];

const DIRECTOR_NAMES = ["moez rehman", "ayesha moez", "malaika jahangir"];

function TeamPage() {
  useApplyPageSeo("/team");
  const { rows: dbMembers, loading } = useLiveList<Member>("team_members", {
    orderBy: { column: "sort_order" },
    select: "id,name,slug,role_title,bio,photo_url,linkedin_url,twitter_url,sort_order,published",
  });

  // Filter out Directors so /team strictly displays non-director staff members
  const nonDirectorDbMembers = useMemo(() => {
    return dbMembers.filter((m) => {
      const lowerName = m.name.toLowerCase();
      const lowerRole = (m.role_title || "").toLowerCase();
      const isDirector = DIRECTOR_NAMES.some((dn) => lowerName.includes(dn)) || lowerRole.includes("director") || lowerRole.includes("ceo") || lowerRole.includes("founder");
      return !isDirector;
    });
  }, [dbMembers]);

  const displayMembers = nonDirectorDbMembers.length > 0 ? nonDirectorDbMembers : DEFAULT_TEAM_MEMBERS;

  return (
    <>
      <PageHeader
        eyebrow="Our Team"
        title="Engineers, architects & creators."
        description="Senior, accountable, and directly involved. Meet the developers, designers, and project specialists who build your digital ecosystem."
      />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">

          {/* TEAM BANNER */}
          <div className="mb-12 rounded-3xl border border-espresso/12 bg-sand/30 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cocoa/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-cocoa">
                <Users className="h-3.5 w-3.5" /> AM Enterprises Team Directory
              </span>
              <h2 className="mt-2 font-display text-2xl font-black text-espresso">
                Engineering & Delivery Specialists
              </h2>
              <p className="mt-1 text-xs text-body-text max-w-xl leading-relaxed">
                Looking for our executive leadership? Visit our dedicated <Link to="/directors" className="font-bold text-cocoa hover:underline">Board of Directors</Link> page.
              </p>
            </div>
            <Link
              to="/directors"
              className="inline-flex items-center gap-2 rounded-2xl bg-espresso px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-cocoa transition"
            >
              <span>View Directors Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid place-items-center py-24 text-sm text-foreground/50">Loading team members…</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayMembers.map((m, i) => {
                const card = (
                  <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-espresso/12 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-luxury">
                    <div>
                      {/* Photo / Avatar */}
                      <div className="relative aspect-square overflow-hidden bg-sand">
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt={m.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0B1726] to-[#162A45]">
                            <span className="font-display text-4xl font-black text-white/90">
                              {m.name.slice(0, 1)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/10 to-transparent opacity-70 transition group-hover:opacity-90" />
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <p className="truncate text-[10px] font-extrabold uppercase tracking-widest text-copper">
                            {m.role_title || "Team Specialist"}
                          </p>
                          <p className="truncate font-display text-lg font-bold">{m.name}</p>
                        </div>
                      </div>

                      {/* Bio & Details */}
                      <div className="p-5">
                        {m.bio ? (
                          <p className="line-clamp-3 text-xs leading-relaxed text-body-text">{m.bio}</p>
                        ) : (
                          <span className="text-xs text-foreground/40">Engineering & product team member.</span>
                        )}
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="flex items-center justify-between gap-3 p-5 pt-0 border-t border-espresso/8 mt-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-cocoa">
                        {m.department || "Engineering"}
                      </span>
                      <div className="flex shrink-0 gap-1.5">
                        {m.linkedin_url && (
                          <span className="grid h-7 w-7 place-items-center rounded-full border border-espresso/12 text-espresso hover:bg-sand transition">
                            <Linkedin className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {m.twitter_url && (
                          <span className="grid h-7 w-7 place-items-center rounded-full border border-espresso/12 text-espresso hover:bg-sand transition">
                            <Twitter className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                return (
                  <Reveal key={m.id} delay={i * 60}>
                    {m.slug ? (
                      <Link to="/team/$slug" params={{ slug: m.slug }} className="block h-full">
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </Reveal>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
