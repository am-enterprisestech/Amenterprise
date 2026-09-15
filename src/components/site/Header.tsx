import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { useLiveList } from "@/lib/use-live-list";

type NavChild = { to: string; label: string; desc?: string };
type NavItem  = { to: string; label: string; children?: NavChild[] };

const baseNav: NavItem[] = [
  {
    to: "/services",
    label: "Services",
    children: [], // populated dynamically from Supabase
  },
  {
    to: "/portfolio",
    label: "Work",
    children: [
      { to: "/portfolio",   label: "All Projects",    desc: "Websites, apps, ERP and custom systems" },
      { to: "/pricing",     label: "Pricing",         desc: "Packages and engagement models" },
      { to: "/calculator",  label: "Cost Calculator", desc: "Estimate your project in minutes" },
    ],
  },
  {
    to: "/about",
    label: "Process",
    children: [
      { to: "/about",   label: "How We Work",    desc: "Our approach from discovery to growth" },
      { to: "/team",    label: "Our Team",        desc: "The people building your ecosystem" },
      { to: "/careers", label: "Careers",         desc: "Join AM Enterprises" },
    ],
  },
  {
    to: "/about",
    label: "About",
    children: [
      { to: "/about",   label: "Our Company",    desc: "Who we are and why we work differently" },
      { to: "/team",    label: "Team",            desc: "Founders, engineers, designers" },
      { to: "/blog",    label: "Insights",        desc: "Thinking on technology and business" },
      { to: "/faq",     label: "FAQ",             desc: "Common questions answered" },
    ],
  },
  { to: "/contact", label: "Contact" },
];

type ServiceRow = { id: string; title: string; slug: string | null; description: string | null };

export function Header() {
  const [open, setOpen]           = useState(false);
  const [openMenu, setOpenMenu]   = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const [scrolled, setScrolled]   = useState(false);
  const pathname  = useRouterState({ select: (s) => s.location.pathname });
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { rows: services } = useLiveList<ServiceRow>("services", { orderBy: { column: "sort_order" } });

  // Inject live services into the Services dropdown
  const nav: NavItem[] = baseNav.map((item) =>
    item.label === "Services"
      ? {
          ...item,
          children: [
            { to: "/services", label: "All Services", desc: "Browse the full capability set" },
            ...services
              .filter((s) => s.slug)
              .slice(0, 12)
              .map((s) => ({
                to: `/services/${s.slug}`,
                label: s.title,
                desc: s.description ?? undefined,
              })),
          ],
        }
      : item,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
    setMobileOpen(null);
  }, [pathname]);

  function enter(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  }
  function leave() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-white/90 backdrop-blur-2xl shadow-soft"
          : "bg-white/70 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-3.5 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="AM Enterprises — Home">
          <Logo className="h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 xl:flex">
          {nav.map((l) => {
            const active     = pathname === l.to || (l.children ?? []).some((c) => c.to === pathname);
            const hasMenu    = (l.children?.length ?? 0) > 0;
            const menuOpen   = openMenu === l.label;
            const isWide     = (l.children?.length ?? 0) > 6;

            return (
              <li
                key={l.label}
                className="relative"
                onMouseEnter={() => hasMenu && enter(l.label)}
                onMouseLeave={() => hasMenu && leave()}
              >
                <Link
                  to={l.to}
                  onClick={() => setOpenMenu(null)}
                  className={`relative inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "text-cocoa"
                      : "text-espresso/65 hover:text-espresso"
                  }`}
                  aria-haspopup={hasMenu || undefined}
                  aria-expanded={hasMenu ? menuOpen : undefined}
                >
                  {l.label}
                  {hasMenu && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180 text-cocoa" : ""}`}
                    />
                  )}
                  {active && (
                    <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 rounded-full bg-cocoa" />
                  )}
                </Link>

                {/* Dropdown */}
                {hasMenu && menuOpen && (
                  <div
                    className={`absolute left-1/2 top-full z-50 mt-2.5 -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-luxury ${
                      isWide ? "w-[580px]" : "w-[280px]"
                    }`}
                  >
                    <div className={`grid gap-0.5 ${isWide ? "grid-cols-2" : "grid-cols-1"}`}>
                      {l.children?.map((c) => (
                        <Link
                          key={c.to + c.label}
                          to={c.to}
                          onClick={() => setOpenMenu(null)}
                          className="group rounded-xl px-3.5 py-2.5 transition-colors hover:bg-sand"
                        >
                          <span className="block text-sm font-semibold text-espresso group-hover:text-cocoa">
                            {c.label}
                          </span>
                          {c.desc && (
                            <span className="mt-0.5 line-clamp-1 block text-xs text-espresso/45">
                              {c.desc}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 xl:flex">
          <Link
            to="/book"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-espresso transition hover:border-cocoa/40 hover:bg-sand hover:text-cocoa"
          >
            Book a call
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 rounded-xl bg-cocoa px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-copper"
          >
            Start a project <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-border p-2 xl:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open
            ? <X    className="h-5 w-5 text-espresso" />
            : <Menu className="h-5 w-5 text-espresso" />
          }
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`xl:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
          open ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mb-4 max-h-[76vh] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-luxury">
          <ul className="space-y-0.5">
            {nav.map((l) => {
              const active   = pathname === l.to;
              const hasMenu  = (l.children?.length ?? 0) > 0;
              const expanded = mobileOpen === l.label;

              return (
                <li key={l.label}>
                  <div
                    className={`flex items-center justify-between rounded-xl transition ${
                      active ? "bg-sand text-cocoa" : "text-espresso/75"
                    }`}
                  >
                    <Link to={l.to} className="flex-1 px-3.5 py-2.5 text-sm font-semibold">
                      {l.label}
                    </Link>
                    {hasMenu && (
                      <button
                        onClick={() => setMobileOpen(expanded ? null : l.label)}
                        aria-label={`Toggle ${l.label}`}
                        className="px-3 py-2.5"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasMenu && expanded && (
                    <ul className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-border pl-3">
                      {l.children?.map((c) => (
                        <li key={c.to + c.label}>
                          <Link
                            to={c.to}
                            className="block rounded-lg px-3 py-2 text-sm text-espresso/65 transition hover:bg-sand hover:text-espresso"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-4 grid gap-2 border-t border-border pt-4">
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cocoa px-5 py-3 text-sm font-semibold text-white"
            >
              Start a project <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/book"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-espresso"
            >
              Book a call
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
