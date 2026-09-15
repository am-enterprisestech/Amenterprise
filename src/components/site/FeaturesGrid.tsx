import { Code2, Smartphone, Sparkles, Cloud, Shield } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const features = [
  {
    icon: Code2,
    title: "Web & Software Development",
    desc: "Custom websites, SaaS platforms and business software engineered with modern stacks like React, Next.js and TanStack.",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    desc: "Native iOS/Android and cross-platform apps built for performance, reliability and delightful user experiences.",
  },
  {
    icon: Sparkles,
    title: "Artificial Intelligence",
    desc: "End-to-end AI solutions — chatbots, automation, predictive models and generative tools tailored to your business.",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    desc: "Auto-scaling infrastructure, CI/CD pipelines and 99.99% uptime hosting on AWS, GCP and Azure.",
  },
  {
    icon: Shield,
    title: "Security & Support",
    desc: "Zero-trust security, compliance-ready architecture and 24/7 SLA-backed dedicated engineering support.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative overflow-hidden bg-sand/40 py-20 lg:py-28">
      <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-copper/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-cocoa/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cocoa sm:text-xs">What We Do</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-espresso sm:text-4xl md:text-5xl">
              Everything modern, nothing legacy
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 text-sm text-foreground/70 sm:text-base">
              Five core capabilities that cover the full lifecycle of building, scaling and securing world-class software.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="group h-full rounded-3xl border border-espresso/10 bg-white p-6 shadow-soft transition duration-500 hover:-translate-y-1 hover:border-copper/50 hover:shadow-luxury sm:p-7">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cocoa to-espresso text-copper transition group-hover:from-copper group-hover:to-copper group-hover:text-espresso">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-espresso sm:text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
