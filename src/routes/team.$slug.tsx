import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { dbSelectOne } from "@/lib/rest";
import { Linkedin, Twitter, Mail, MapPin, BriefcaseBusiness, ArrowLeft, CheckCircle2, Award } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

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

export const Route = createFileRoute("/team/$slug")({
  loader: async ({ params }) => {
    const member = await dbSelectOne<Member>("team_members", {
      eq: { slug: params.slug, published: true },
      select:
        "id,name,slug,role_title,bio,long_bio,photo_url,location,experience,expertise,achievements,linkedin_url,twitter_url",
    });
    if (!member) throw notFound();
    return { member };
  },
  head: ({ params, loaderData }) => {
    const m = loaderData?.member;
    if (!m) {
      return { meta: [{ title: "Team member not found — AM Enterprises" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${m.name}${m.role_title ? ` — ${m.role_title}` : ""} | AM Enterprises`;
    const description = (m.bio || m.long_bio || `${m.name} at AM Enterprises.`).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `${SITE_URL}/team/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/team/${params.slug}` }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center" role="alert">
      <h1 className="font-display text-2xl font-black text-espresso">Something went wrong</h1>
      <p className="mt-2 text-sm text-foreground/60">{error.message}</p>
      <Link to="/team" className="mt-6 inline-block rounded-full bg-espresso px-6 py-3 text-sm font-bold text-white">Back to team</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-black text-espresso">Team member not found</h1>
      <Link to="/team" className="mt-6 inline-block rounded-full bg-espresso px-6 py-3 text-sm font-bold text-white">Back to team</Link>
    </div>
  ),
  component: MemberPage,
});

function MemberPage() {
  const { member: m } = Route.useLoaderData();
  const expertise = m.expertise ?? [];
  const achievements = m.achievements ?? [];

  return (
    <article className="bg-white">
      <section className="border-b border-espresso/8 bg-sand/40 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Link to="/team" className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-espresso">
            <ArrowLeft className="h-3.5 w-3.5" /> All team members
          </Link>
          <div className="mt-6 grid gap-8 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
            <div className="mx-auto aspect-square w-40 overflow-hidden rounded-3xl bg-espresso sm:mx-0 sm:w-full">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0B1726] to-[#0B2D50]">
                  <span className="font-display text-5xl font-black text-[#8DD3FF]">{m.name.slice(0, 1)}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 text-center sm:text-left">
              {m.role_title && (
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cocoa">{m.role_title}</p>
              )}
              <h1 className="mt-2 font-display text-3xl font-black text-espresso sm:text-4xl">{m.name}</h1>
              {m.bio && <p className="mt-3 text-sm leading-relaxed text-foreground/70">{m.bio}</p>}
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-semibold text-foreground/65 sm:justify-start">
                {m.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-cocoa" />{m.location}</span>}
                {m.experience && <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5 text-cocoa" />{m.experience}</span>}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link to="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white hover:bg-cocoa">
                  <Mail className="h-3.5 w-3.5" /> Get in touch
                </Link>
                {m.linkedin_url && (
                  <a href={m.linkedin_url} target="_blank" rel="noreferrer" aria-label={`${m.name} on LinkedIn`} className="grid h-9 w-9 place-items-center rounded-full border border-espresso/15 text-espresso hover:bg-white">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {m.twitter_url && (
                  <a href={m.twitter_url} target="_blank" rel="noreferrer" aria-label={`${m.name} on Twitter`} className="grid h-9 w-9 place-items-center rounded-full border border-espresso/15 text-espresso hover:bg-white">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div className="min-w-0">
            {m.long_bio ? (
              <Reveal>
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-black text-espresso">About {m.name.split(" ")[0]}</h2>
                  {m.long_bio.split(/\n{1,}/).filter(Boolean).map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-foreground/75">{p}</p>
                  ))}
                </div>
              </Reveal>
            ) : (
              <p className="text-sm text-foreground/60">Profile details coming soon.</p>
            )}

            {achievements.length > 0 && (
              <Reveal delay={80}>
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-black text-espresso">Highlights</h2>
                  <ul className="mt-4 space-y-3">
                    {achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/75">
                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-copper" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>

          <aside className="min-w-0 space-y-6">
            {expertise.length > 0 && (
              <div className="rounded-3xl border border-espresso/10 bg-sand/40 p-6">
                <p className="font-display text-lg font-black text-espresso">Expertise</p>
                <ul className="mt-4 space-y-2.5">
                  {expertise.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cocoa" /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-2xl bg-espresso p-6 text-white">
              <p className="font-display text-lg font-black">Work with our team</p>
              <p className="mt-2 text-sm text-white/65">Tell us about your project and we'll match you with the right people.</p>
              <Link to="/contact" className="mt-4 inline-flex rounded-xl bg-cocoa px-5 py-2.5 text-xs font-bold text-white transition hover:bg-copper">
                Start a project
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </article>
  );
}
