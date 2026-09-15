import { SITE_URL } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useApplyPageSeo } from "@/lib/page-seo";
import { MapPin, Clock, Heart, Zap, Globe, Coffee } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — AM Enterprises" },
      { name: "description", content: "Open roles at AM Enterprises." },
      { property: "og:title", content: "Careers — AM Enterprises" },
      { property: "og:url", content: SITE_URL + "/careers" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/careers" }],
  }),
  component: CareersPage,
});

const jobs = [
  { title: "Senior Frontend Engineer", type: "Full-time", location: "London / Remote" },
  { title: "Senior Backend Engineer", type: "Full-time", location: "Remote (EU)" },
  { title: "Product Designer", type: "Full-time", location: "London" },
  { title: "AI/ML Engineer", type: "Full-time", location: "Remote" },
  { title: "DevOps Engineer", type: "Full-time", location: "Dubai" },
  { title: "Technical Project Manager", type: "Full-time", location: "London / Remote" },
];

const benefits = [
  { icon: Heart, title: "Health & wellness", desc: "Premium medical, dental and mental health." },
  { icon: Zap, title: "Growth budget", desc: "£2,000/year for conferences, courses and books." },
  { icon: Globe, title: "Remote-friendly", desc: "Work where you're happiest and most productive." },
  { icon: Coffee, title: "Slow Fridays", desc: "Half-day Fridays year-round. Real rest, real focus." },
];

function CareersPage() {
  useApplyPageSeo("/careers");
  return (
    <>
      <PageHeader eyebrow="Careers" title="Do the best work of your career." description="We hire senior, curious people and give them the room to build things properly." />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-copper/15 text-cocoa">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display font-bold text-espresso">{b.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal><h2 className="font-display text-3xl font-bold text-espresso sm:text-4xl">Open positions</h2></Reveal>
          <div className="mt-8 space-y-4">
            {jobs.map((j, i) => (
              <Reveal key={j.title} delay={i * 60}>
                <a href="#" className="group flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-copper hover:shadow-luxury sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-display text-lg font-bold text-espresso">{j.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-foreground/60">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {j.type}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {j.location}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-cocoa px-6 py-2 text-sm font-semibold text-cream transition group-hover:bg-copper group-hover:text-espresso">
                    Apply
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
