import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Wrench,
  Briefcase,
  Star,
  Users,
  MessageSquare,
  ArrowRight,
  Tag,
  HelpCircle,
  FileText,
  Building2,
  GitBranch,
  BarChart3,
  BookOpen,
  FileSignature,
  CalendarCheck,
  Mail,
  Plus,
  ShieldCheck,
  Settings,
  Sparkles,
  ReceiptText,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { PortalRoleSwitcher } from "@/components/portal/PortalRoleSwitcher";
import { generateAMID } from "@/lib/am-id";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const cards = [
  { table: "portal_clients", label: "Client Accounts", icon: Building2, to: "/admin/portal", color: "from-blue-600 to-indigo-700" },
  { table: "team_members", label: "Team Directory", icon: Users, to: "/admin/team", color: "from-emerald-600 to-teal-700" },
  { table: "projects", label: "Client Projects", icon: FolderKanban, to: "/admin/portal", color: "from-amber-600 to-orange-700" },
  { table: "invoices", label: "Invoices & Billing", icon: ReceiptText, to: "/admin/portal", color: "from-purple-600 to-indigo-700" },
  { table: "quote_requests", label: "Quote Requests", icon: FileSignature, to: "/admin/quotes", color: "from-slate-700 to-zinc-900" },
  { table: "bookings", label: "Client Bookings", icon: CalendarCheck, to: "/admin/bookings", color: "from-slate-700 to-zinc-900" },
  { table: "contact_messages", label: "Messages", icon: MessageSquare, to: "/admin/messages", color: "from-slate-700 to-zinc-900" },
  { table: "services", label: "Services Catalog", icon: Wrench, to: "/admin/services", color: "from-slate-700 to-zinc-900" },
  { table: "portfolio", label: "Portfolio Items", icon: Briefcase, to: "/admin/portfolio", color: "from-slate-700 to-zinc-900" },
  { table: "testimonials", label: "Testimonials", icon: Star, to: "/admin/testimonials", color: "from-slate-700 to-zinc-900" },
  { table: "pricing_plans", label: "Pricing Plans", icon: Tag, to: "/admin/pricing", color: "from-slate-700 to-zinc-900" },
  { table: "blog_posts", label: "Blog Posts", icon: FileText, to: "/admin/blog", color: "from-slate-700 to-zinc-900" },
] as const;

function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        cards.map(async (c) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { count } = await (supabase.from as any)(c.table).select("*", { count: "exact", head: true });
          return [c.table, count ?? 0] as const;
        })
      );
      setCounts(Object.fromEntries(entries));
    })();
  }, []);

  return (
    <div className="pb-16 space-y-8">
      {/* Executive Header Banner */}
      <div className="rounded-3xl border border-espresso/15 bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 p-6 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Executive Command Center · AM Enterprise
            </span>
            <h1 className="mt-2 font-display text-3xl font-black text-white">System Admin Portal</h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-xl">
              Complete interconnected management of Clients, Department Team Portals, Projects, Invoices, Chat, PWA settings, and Audit Logs.
            </p>
          </div>

          {/* Quick Creator Bar */}
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/portal"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition"
            >
              <Plus className="h-4 w-4" /> Client Account
            </Link>
            <Link
              to="/admin/team"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition"
            >
              <Plus className="h-4 w-4" /> Team Member
            </Link>
            <Link
              to="/admin/app-settings"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <Settings className="h-4 w-4" /> PWA Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Overview Charts */}
      <DashboardOverview />

      {/* Core Operational Management Cards */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-espresso">Management & Operations</h2>
          <span className="text-xs font-bold uppercase tracking-wider text-espresso/60">Live Database Synced</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((c) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link
              key={c.table}
              to={c.to as any}
              className="group relative overflow-hidden rounded-3xl border border-espresso/10 bg-white p-5 transition hover:-translate-y-1 hover:border-cocoa/40 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-1 group-hover:text-espresso" />
              </div>
              <p className="mt-4 font-display text-3xl font-black text-espresso">{counts[c.table] ?? "0"}</p>
              <p className="mt-1 text-xs font-bold text-foreground/70">{c.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Interconnected Role Switcher */}
      <PortalRoleSwitcher activeRoleKey="admin" />
    </div>
  );
}
