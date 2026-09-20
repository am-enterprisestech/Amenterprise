import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { dbSelectOne } from "@/lib/rest";
import { Linkedin, Twitter, Mail, MapPin, BriefcaseBusiness, ArrowLeft, CheckCircle2, Award, ShieldCheck, Sparkles, PhoneCall } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { DIRECTORS, DirectorProfile } from "./directors.index";
import { trackCTAClick } from "@/lib/meta-analytics";

type Member = {
  id: string;
  name: string;
  slug: string | null;
  role_title: string | null;
  bio: string | null;
  long_bio: string | null;
  photo_url: string | null;
  location: string | null;
  experience: string | null;
  expertise: string[] | null;
  achievements: string[] | null;
  linkedin_url: string | null;
  twitter_url: string | null;
};

export const Route = createFileRoute("/directors/$slug")({
  loader: async ({ params }) => {
    // 1. Try fetching from Supabase DB
    const dbMember = await dbSelectOne<Member>("team_members", {
      eq: { slug: params.slug, published: true },
      select:
        "id,name,slug,role_title,bio,long_bio,photo_url,location,experience,expertise,achievements,linkedin_url,twitter_url",
    });

    // 2. Check static Directors data fallback
    const staticDirector = DIRECTORS.find(
      (d) => d.slug.toLowerCase() === params.slug.toLowerCase(),
    );

    if (!dbMember && !staticDirector) {
      throw notFound();
    }

    // Combine static director data with DB record if available
    const profile: DirectorProfile = {
      id: dbMember?.id || staticDirector?.id || params.slug,
      name: dbMember?.name || staticDirector?.name || params.slug,
      slug: dbMember?.slug || staticDirector?.slug || params.slug,
      role_title: dbMember?.role_title || staticDirector?.role_title || "Director",
      short_role: staticDirector?.short_role || "Director",
      tagline: staticDirector?.tagline || dbMember?.role_title || "Executive Leadership",
      experience: dbMember?.experience || staticDirector?.experience || "3+ Years Experience",
      years: staticDirector?.years || 3,
      location: dbMember?.location || staticDirector?.location || "Islamabad / Remote",
      badge: staticDirector?.badge || "Board Member",
      bio: dbMember?.bio || staticDirector?.bio || "",
      long_bio: dbMember?.long_bio || staticDirector?.long_bio || "",
      expertise: dbMember?.expertise || staticDirector?.expertise || [],
      achievements: dbMember?.achievements || staticDirector?.achievements || [],
      photo_url: dbMember?.photo_url || staticDirector?.photo_url || null,
      linkedin_url: dbMember?.linkedin_url || staticDirector?.linkedin_url || null,
      twitter_url: dbMember?.twitter_url || staticDirector?.twitter_url || null,
      email: staticDirector?.email || "contact@aymoxi.com",
    };

    return { member: profile };
  },

  head: ({ params, loaderData }) => {
    const m = loaderData?.member;
    if (!m) {
      return { meta: [{ title: "Director profile not found — AM Enterprises" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${m.name} — ${m.role_title} | AM Enterprises Board of Directors`;
    const description = (m.bio || m.long_bio || `${m.name} at AM Enterprises.`).slice(0, 155);
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

  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center" role="alert">
      <h1 className="font-display text-2xl font-black text-espresso">Profile not found</h1>
      <p className="mt-2 text-sm text-foreground/60">{error.message}</p>
      <Link to="/directors" className="mt-6 inline-block rounded-full bg-espresso px-6 py-3 text-sm font-bold text-white">
        Back to Board of Directors
      </Link>
    </div>
  ),

  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-black text-espresso">Director Profile Not Found</h1>
      <Link to="/directors" className="mt-6 inline-block rounded-full bg-espresso px-6 py-3 text-sm font-bold text-white">
        Back to Board of Directors
      </Link>
    </div>
  ),

  component: DirectorProfilePage,
});

function DirectorProfilePage() {
  const { member: m } = Route.useLoaderData();
  const expertise = m.expertise ?? [];
  const achievements = m.achievements ?? [];

  return (
    <article className="bg-white">
      {/* PROFILE HERO HEADER */}
      <section className="border-b border-espresso/10 bg-sand/30 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Link
            to="/directors"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-espresso/60 hover:text-cocoa transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Board of Directors
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-[240px_minmax(0,1fr)] sm:items-center">
            {/* Photo / Initial Avatar */}
            <div className="mx-auto aspect-square w-48 overflow-hidden rounded-3xl bg-espresso shadow-luxury sm:mx-0 sm:w-full">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0B1726] via-[#162A45] to-[#2F8FFF] text-white">
                  <div className="text-center p-6">
                    <span className="font-display text-6xl font-black text-white/90">
                      {m.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-copper">{m.short_role}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Meta */}
            <div className="min-w-0 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-cocoa">
                <ShieldCheck className="h-3.5 w-3.5" /> {m.badge || "Executive Director"}
              </div>

              <h1 className="mt-3 font-display text-3xl font-black text-espresso sm:text-4xl">{m.name}</h1>
              <p className="mt-1 text-sm font-bold text-cocoa">{m.role_title}</p>
              <p className="mt-0.5 text-xs font-semibold text-espresso/60">{m.tagline}</p>

              {m.bio && <p className="mt-4 text-xs leading-relaxed text-body-text max-w-2xl">{m.bio}</p>}

              {/* Badges */}
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-semibold text-espresso/70 sm:justify-start">
                {m.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 border border-espresso/10">
                    <MapPin className="h-3.5 w-3.5 text-cocoa" /> {m.location}
                  </span>
                )}
                {m.experience && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 border border-espresso/10">
                    <BriefcaseBusiness className="h-3.5 w-3.5 text-cocoa" /> {m.experience}
                  </span>
                )}
              </div>

              {/* Social CTAs */}
              <div className="mt-6 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                <Link
                  to="/contact"
                  onClick={() => trackCTAClick(`Contact Director: ${m.name}`, "director_profile")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cocoa px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-copper transition"
                >
                  <Mail className="h-3.5 w-3.5" /> Book Consultation
                </Link>
                {m.linkedin_url && (
                  <a
                    href={m.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${m.name} on LinkedIn`}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-espresso/15 text-espresso hover:bg-white transition"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {m.twitter_url && (
                  <a
                    href={m.twitter_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${m.name} on Twitter`}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-espresso/15 text-espresso hover:bg-white transition"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED BIO & EXPERTISE SECTION */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          
          {/* Main Content Column */}
          <div className="min-w-0 space-y-10">
            {m.long_bio && (
              <Reveal>
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cocoa">Executive Biography</span>
                  <h2 className="font-display text-2xl font-black text-espresso">About {m.name}</h2>
                  {m.long_bio.split(/\n{2,}/).map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed text-body-text">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}

            {achievements.length > 0 && (
              <Reveal delay={80}>
                <div className="rounded-3xl border border-espresso/10 bg-sand/30 p-7">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cocoa">Track Record</span>
                  <h3 className="font-display text-xl font-black text-espresso mt-1 mb-4">
                    Key Milestones & Achievements
                  </h3>
                  <ul className="space-y-3">
                    {achievements.map((achieve, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs leading-relaxed text-espresso/85 font-medium">
                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                        <span>{achieve}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="min-w-0 space-y-6">
            {expertise.length > 0 && (
              <div className="rounded-3xl border border-espresso/12 bg-white p-6 shadow-soft">
                <p className="font-display text-base font-black text-espresso">Technical Competencies</p>
                <div className="my-3 h-px bg-espresso/10" />
                <ul className="space-y-2.5">
                  {expertise.map((exp, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-semibold text-espresso/80">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cocoa" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-3xl bg-espresso p-7 text-cream shadow-luxury">
              <Sparkles className="h-6 w-6 text-copper mb-2" />
              <h4 className="font-display text-lg font-black text-white">Direct Executive SLA</h4>
              <p className="mt-2 text-xs text-cream/75 leading-relaxed">
                Work directly with {m.name.split(" ")[0]} and our senior engineering leadership on your custom project.
              </p>
              <Link
                to="/contact"
                onClick={() => trackCTAClick(`Start Project with ${m.name}`, "director_sidebar")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cocoa py-3 text-xs font-bold text-white transition hover:bg-copper shadow-soft"
              >
                <span>Schedule Call</span>
                <PhoneCall className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

        </div>
      </section>
    </article>
  );
}
