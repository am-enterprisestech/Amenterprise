import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown, ArrowRight, Sparkles, Code2, Smartphone, Building2, Bot, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { useLiveList } from "@/lib/use-live-list";
import { trackCTAClick } from "@/lib/meta-analytics";

type NavChild = { to: string; label: string; desc?: string; icon?: React.ElementType };
type NavItem  = { to: string; label: string; children?: NavChild[] };

const baseNav: NavItem[] = [
  {
    to: "/services",
    label: "Services",
    children: [
      { to: "/services", label: "All Capability Set", desc: "Browse our complete digital capabilities", icon: Sparkles },
    ],
  },
  {
    to: "/portfolio",
    label: "Work",
    children: [
      { to: "/portfolio",   label: "All Projects",    desc: "Websites, apps, ERP and custom systems" },
      { to: "/calculator",  label: "Cost Calculator", desc: "Instant interactive project estimator" },
    ],
  },
  {
    to: "/pricing",
    label: "Pricing",
  },
  {
    to: "/directors",
    label: "Our Directors",
  },
  {
    to: "/about",
    label: "Process",
    children: [
      { to: "/about",   label: "How We Work",    desc: "Our 4-stage engineering & growth process" },
      { to: "/careers", label: "Careers",         desc: "Join our senior engineering team" },
    ],
  },
  {
    to: "/about",
    label: "About",
    children: [
      { to: "/about",     label: "Our Company",      desc: "Who we are & why we build differently" },
      { to: "/directors", label: "Our Directors",    desc: "Founders & Board of Directors" },
      { to: "/team",      label: "Our Team",         desc: "Engineers, architects & creators" },
      { to: "/blog",      label: "Tech Insights",    desc: "Articles on modern software architecture" },
      { to: "/faq",       label: "FAQ",              desc: "Answers to common client questions" },
    ],
  },
  { to: "/contact", label: "Contact" },
];

type ServiceRow = { id: string; title: string; slug: string | null; description: string | null };

export function Header() {
  const [open, setOpen]             = useState(false);
  const [openMenu, setOpenMenu]     = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const [scrolled, setScrolled]     = useState(false);
  const pathname                    = useRouterState({ select: (s) => s.location.pathname });
  const closeTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { rows: services }          = useLiveList<ServiceRow>("services", { orderBy: { column: "sort_order" } });

  // Populate dynamic services strictly under the "Services" parent menu
  const nav: NavItem[] = baseNav.map((item) =>
    item.label === "Services"
      ? {
          ...item,
          children: [
            { to: "/services", label: "All Services Overview", desc: "Browse full engineering capabilities", icon: Sparkles },
            ...services
              .filter((s) => s.slug)
              .slice(0, 10)
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

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
    setMobileOpen(null);
  }, [pathname]);

  // Strict Hover Handlers for Dropdown Isolation
  function handleMouseEnter(label: string) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(label);
  }

  function handleMouseLeave() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
    }, 120);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-white/90 backdrop-blur-2xl shadow-soft"
          : "bg-white/70 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3.5 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="AM Enterprises — Home">
          <Logo className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-1 xl:flex">
          {nav.map((l) => {
            const active   = pathname === l.to || (l.children ?? []).some((c) => c.to === pathname);
            const hasMenu  = (l.children?.length ?? 0) > 0;
            const menuOpen = openMenu === l.label;
            const isWide   = (l.children?.length ?? 0) > 4;

            return (
              <li
                key={l.label}
                className="relative"
                onMouseEnter={() => hasMenu && handleMouseEnter(l.label)}
                onMouseLeave={() => hasMenu && handleMouseLeave()}
              >
                <Link
                  to={l.to as "/services"}
                  onClick={() => setOpenMenu(null)}
                  className={`relative inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "text-cocoa font-bold"
                      : "text-espresso/70 hover:text-espresso"
                  }`}
                  aria-haspopup={hasMenu || undefined}
                  aria-expanded={hasMenu ? menuOpen : undefined}
                >
                  <span>{l.label}</span>
                  {hasMenu && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        menuOpen ? "rotate-180 text-cocoa" : "text-espresso/50"
                      }`}
                    />
                  )}
                  {active && (
                    <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-cocoa" />
                  )}
                </Link>

                {/* Dropdown Container: Strict Parent-Child scoping with seamless hover bridge */}
                {hasMenu && menuOpen && (
                  <div
                    className="absolute left-1/2 top-full z-50 pt-2 -translate-x-1/2"
                    onMouseEnter={() => handleMouseEnter(l.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      className={`rounded-2xl border border-espresso/10 bg-white p-2.5 shadow-luxury ${
                        isWide ? "w-[560px]" : "w-[280px]"
                      }`}
                    >
                      <div className={`grid gap-1 ${isWide ? "grid-cols-2" : "grid-cols-1"}`}>
                        {l.children?.map((c) => {
                          const IconComp = c.icon;

                          return (
                            <Link
                              key={c.to + c.label}
                              to={c.to as "/services"}
                              onClick={() => setOpenMenu(null)}
                              className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-sand/60"
                            >
                              {IconComp && (
                                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sand text-cocoa group-hover:bg-cocoa group-hover:text-white transition-colors">
                                  <IconComp className="h-3.5 w-3.5" />
                                </div>
                              )}
                              <div>
                                <span className="block text-xs font-bold text-espresso group-hover:text-cocoa transition-colors">
                                  {c.label}
                                </span>
                                {c.desc && (
                                  <span className="mt-0.5 line-clamp-1 block text-[11px] text-espresso/50">
                                    {c.desc}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Desktop Action CTAs */}
        <div className="hidden items-center gap-3 xl:flex">
          <Link
            to="/book"
            onClick={() => trackCTAClick("Book a call", "header_desktop")}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-espresso transition hover:border-cocoa/40 hover:bg-sand hover:text-cocoa"
          >
            Book a call
          </Link>
          <Link
            to="/contact"
            onClick={() => trackCTAClick("Start a project", "header_desktop")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cocoa px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-copper"
          >
            Start a project <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-border p-2 xl:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5 text-espresso" /> : <Menu className="h-5 w-5 text-espresso" />}
        </button>
      </nav>

      {/* Mobile Menu Panel */}
      <div
        className={`xl:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
          open ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mb-4 max-h-[76vh] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-luxury">
          <ul className="space-y-1">
            {nav.map((l) => {
              const active   = pathname === l.to;
              const hasMenu  = (l.children?.length ?? 0) > 0;
              const expanded = mobileOpen === l.label;

              return (
                <li key={l.label}>
                  <div
                    className={`flex items-center justify-between rounded-xl transition ${
                      active ? "bg-sand text-cocoa font-bold" : "text-espresso/80"
                    }`}
                  >
                    <Link to={l.to as "/services"} className="flex-1 px-3.5 py-2.5 text-sm font-semibold">
                      {l.label}
                    </Link>
                    {hasMenu && (
                      <button
                        onClick={() => setMobileOpen(expanded ? null : l.label)}
                        aria-label={`Toggle ${l.label}`}
                        className="px-3 py-2.5 text-espresso/60"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180 text-cocoa" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasMenu && expanded && (
                    <ul className="ml-3 mt-1 space-y-1 border-l-2 border-border pl-3">
                      {l.children?.map((c) => (
                        <li key={c.to + c.label}>
                          <Link
                            to={c.to as "/services"}
                            className="block rounded-lg px-3 py-2 text-xs font-medium text-espresso/70 transition hover:bg-sand hover:text-espresso"
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
              onClick={() => trackCTAClick("Start a project", "header_mobile")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cocoa px-5 py-3 text-sm font-semibold text-white"
            >
              Start a project <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/book"
              onClick={() => trackCTAClick("Book a call", "header_mobile")}
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
