import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: string;
}) {
  return (
    <section className="subpage-header relative overflow-hidden border-b border-border bg-background pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="subpage-header-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] px-8">
        <Reveal>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-espresso/35">
            <Link to="/" className="transition hover:text-cocoa">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-espresso/60">{breadcrumb ?? title}</span>
          </nav>
        </Reveal>

        {eyebrow && (
          <Reveal delay={60}>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-cocoa/20 bg-cocoa/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cocoa">
              <span className="h-1.5 w-1.5 rounded-full bg-cocoa" />
              {eyebrow}
            </span>
          </Reveal>
        )}

        <Reveal delay={120}>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-[1.04] text-espresso sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </Reveal>

        {description && (
          <Reveal delay={200}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-body-text sm:text-lg">
              {description}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
