import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Wrench, Briefcase, MessageSquare, Users, Star, LogOut, Loader2, Menu, X, ArrowLeft, HelpCircle, FileText, Tag, Building2, GitBranch, BarChart3, BookOpen, Search, FileSignature, CalendarCheck, Mail, Radar, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/portal", label: "Client Portal", icon: Users },
  { to: "/admin/staff", label: "Team Portal", icon: Users },
  { to: "/admin/crm", label: "CRM Pipeline", icon: GitBranch },
  { to: "/admin/app-settings", label: "App Branding & Icon", icon: Radar },
  { to: "/admin/audit", label: "Audit & Security Logs", icon: ShieldCheck },

  { to: "/admin/proposals", label: "Proposals", icon: FileSignature },
  { to: "/admin/invoices", label: "Invoices", icon: FileText },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/admin/cases", label: "Case Studies", icon: BookOpen },
  { to: "/admin/about", label: "About Page", icon: BookOpen },

  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/badges", label: "Trust Badges", icon: ShieldCheck },

  { to: "/admin/clients", label: "Clients & Logos", icon: Building2 },
  { to: "/admin/process", label: "Process Steps", icon: GitBranch },
  { to: "/admin/stats", label: "Stats Counters", icon: BarChart3 },
  { to: "/admin/pricing", label: "Pricing Plans", icon: Tag },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/seo", label: "Page SEO", icon: Search },
  { to: "/admin/quotes", label: "Quote Requests", icon: FileSignature },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/pixels", label: "Tracking Pixels", icon: Radar },
];

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (loading) return <div className="grid min-h-[80vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-cocoa" /></div>;

  if (!isAdmin) {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-sand/40 px-5">
        <div className="max-w-md rounded-3xl border border-espresso/10 bg-white p-8 text-center shadow">
          <h1 className="font-display text-2xl font-black text-espresso">Not authorized</h1>
          <p className="mt-2 text-sm text-foreground/60">Signed in as {user?.email}, but this account doesn't have admin access.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/" className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-bold text-espresso">Home</Link>
            <button onClick={signOut} className="rounded-full bg-espresso px-5 py-2.5 text-sm font-bold text-white hover:bg-cocoa">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-espresso/10 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-xl border border-espresso/10">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <span className="font-display font-black text-espresso">AM Enterprises Admin</span>
        <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-xl border border-espresso/10"><LogOut className="h-4 w-4" /></button>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-espresso/50 lg:hidden" />
      )}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-espresso/10 bg-white p-5 transition-transform duration-300 lg:sticky lg:top-6 lg:z-auto lg:block lg:h-[calc(100vh-3rem)] lg:w-64 lg:translate-x-0 lg:rounded-3xl lg:border ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-6 flex items-center justify-between lg:block">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-espresso">
              <ArrowLeft className="h-3.5 w-3.5" /> View site
            </Link>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-espresso/10 lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-6">
            <p className="font-display text-lg font-black text-espresso">AM Enterprises Admin</p>
            <p className="mt-0.5 truncate text-xs text-foreground/50">{user?.email}</p>
          </div>
          <nav className="space-y-1">
            {nav.map((n) => {
              const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
              return (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <Link key={n.to} to={n.to as any} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-espresso text-white" : "text-espresso/80 hover:bg-sand"}`}>
                  <n.icon className="h-4 w-4 shrink-0" /> <span className="truncate">{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <button onClick={signOut} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-espresso/15 px-3 py-2.5 text-sm font-bold text-espresso hover:bg-sand">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}