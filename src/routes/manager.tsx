import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useManager, type ManagerProfile } from "@/lib/use-manager";
import { MANAGER_MODULES, getModuleByKey, type ManagerModuleDef } from "@/lib/manager-rbac";
import {
  getManagerAnalyticsData,
  getManagerBookingsData,
  getManagerMessagesData,
  getManagerQuotesData,
  getManagerPixelsData,
  getManagerCrmData,
  getManagerNewsletterData,
  getManagerBlogData,
  getManagerOverviewCounts,
  getManagerServicesData,
  getManagerPortfolioData,
  getManagerTestimonialsData,
  getManagerFaqsData,
} from "@/lib/manager.functions";
import {
  ShieldCheck,
  Radar,
  CalendarCheck,
  MessageSquare,
  FileSignature,
  Target,
  GitBranch,
  Mail,
  BookOpen,
  Briefcase,
  Wrench,
  Star,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Loader2,
  Menu,
  X,
  ArrowLeft,
  Search,
  Eye,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Users,
  Smartphone,
  Monitor,
  Lock,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/manager")({
  head: () => ({
    meta: [
      { title: "Manager Portal (RBAC) — AM Enterprises" },
      { name: "description", content: "Role-based manager portal for live analytics, bookings, inquiries and campaigns." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ManagerPortalPage,
});

const MODULE_ICONS: Record<string, typeof Radar> = {
  analytics: Radar,
  bookings: CalendarCheck,
  messages: MessageSquare,
  quotes: FileSignature,
  pixels: Target,
  crm: GitBranch,
  newsletter: Mail,
  blog: BookOpen,
  portfolio: Briefcase,
  services: Wrench,
  testimonials: Star,
  faqs: HelpCircle,
};

function ManagerPortalPage() {
  const { user, manager, loading, hasModule, refresh } = useManager();
  const navigate = useNavigate();

  // Login form state (if not authenticated)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active module tab
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-select first allowed tab once manager loads
  useEffect(() => {
    if (manager && activeTab !== "overview" && !hasModule(activeTab)) {
      setActiveTab("overview");
    }
  }, [manager, activeTab, hasModule]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);

    const { error: err } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword,
    });

    setLoginBusy(false);
    if (err) {
      setLoginError(err.message);
    } else {
      refresh();
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    refresh();
  }

  // 1. Loading state
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cocoa" />
          <p className="font-display text-sm font-bold text-espresso">Verifying manager credentials & permissions...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Show Manager Login Screen
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand/40 px-5 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-espresso"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </Link>

          <div className="rounded-3xl border border-espresso/15 bg-white p-8 shadow-[0_20px_60px_-25px_rgba(6,54,58,0.25)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-espresso text-white shadow-md">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-display text-xl font-black text-espresso">Manager Portal</h1>
                <p className="text-xs text-foreground/60">RBAC Role-Based Workspace</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-espresso/10 bg-sand/40 p-3.5 text-xs text-espresso/80">
              <p className="font-bold">Restricted Access Portal</p>
              <p className="mt-0.5 text-foreground/60 text-[11px]">
                Sign in with the email & password provided by your administrator. You will only see the modules assigned to your role (e.g. SMM, Live Analytics, Bookings).
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">
                  Manager Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-espresso/15 bg-sand/30 px-4 py-3 text-xs outline-none focus:border-cocoa focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-espresso/15 bg-sand/30 px-4 py-3 text-xs outline-none focus:border-cocoa focus:bg-white transition"
                />
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-5 py-3.5 text-xs font-bold text-white shadow-md hover:bg-cocoa disabled:opacity-60 transition"
              >
                {loginBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Sign in to Manager Portal
              </button>
            </form>

            <div className="mt-6 border-t border-espresso/10 pt-4 text-center">
              <p className="text-[11px] text-foreground/50">
                Are you an admin?{" "}
                <Link to="/auth" className="font-bold text-cocoa hover:text-espresso">
                  Admin Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. User logged in, but not an approved manager or admin
  if (!manager) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand/30 px-5">
        <div className="w-full max-w-md rounded-3xl border border-espresso/15 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-black text-espresso">Access Restricted</h1>
          <p className="mt-2 text-xs text-foreground/60">
            You are signed in as <span className="font-bold text-espresso">{user.email}</span>, but your account has not been assigned a Manager RBAC role yet.
          </p>
          <p className="mt-2 text-xs text-foreground/50">
            Ask your administrator to add your email under <span className="font-bold text-espresso">Admin Panel &gt; Roles & RBAC</span>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso hover:bg-sand"
            >
              Back to Home
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-espresso px-5 py-2 text-xs font-bold text-white hover:bg-cocoa"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Account deactivated
  if (!manager.active) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand/30 px-5">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-700 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-black text-red-800">Account Suspended</h1>
          <p className="mt-2 text-xs text-foreground/60">
            Your manager account ({manager.email}) is currently disabled by the administrator.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSignOut}
              className="rounded-full bg-espresso px-5 py-2 text-xs font-bold text-white hover:bg-cocoa"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Compute allowed modules for navigation
  // ONLY modules present in manager.modules will be shown!
  const allowedModules = MANAGER_MODULES.filter((m) => hasModule(m.key));

  return (
    <div className="min-h-screen bg-sand/25">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-espresso/10 bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="grid h-9 w-9 place-items-center rounded-xl border border-espresso/10"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-1.5 font-display text-sm font-black text-espresso">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Manager: {manager.roleTitle}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="grid h-9 w-9 place-items-center rounded-xl border border-espresso/10 text-espresso"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-espresso/50 lg:hidden"
        />
      )}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-espresso/10 bg-white p-5 transition-transform duration-300 lg:sticky lg:top-6 lg:z-auto lg:block lg:h-[calc(100vh-3rem)] lg:w-64 lg:translate-x-0 lg:rounded-3xl lg:border ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between lg:block">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-espresso"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-xl border border-espresso/10 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="mb-6 rounded-2xl border border-espresso/10 bg-sand/40 p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-espresso text-white font-bold text-xs">
                {manager.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-black text-espresso truncate">{manager.name}</p>
                <p className="text-[10px] text-foreground/50 truncate">{manager.email}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <span className="inline-block rounded-md bg-espresso/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-espresso">
                {manager.roleTitle}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 border border-sky-200 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">
                <Eye className="h-2.5 w-2.5" />
                {manager.accessLevel === "view" ? "View Only" : "Full Access"}
              </span>
            </div>
          </div>

          {/* RBAC Sidebar Navigation */}
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-espresso/50 px-2">
            Permitted Modules ({allowedModules.length})
          </div>

          <nav className="space-y-1">
            {/* Overview / Dashboard tab */}
            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                activeTab === "overview"
                  ? "bg-espresso text-white shadow-sm"
                  : "text-espresso/80 hover:bg-sand/60"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Workspace Overview</span>
            </button>

            {/* Render ONLY allowed modules */}
            {allowedModules.map((mod) => {
              const Icon = MODULE_ICONS[mod.key] || ShieldCheck;
              const isActive = activeTab === mod.key;

              return (
                <button
                  key={mod.key}
                  onClick={() => {
                    setActiveTab(mod.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-espresso text-white shadow-sm"
                      : "text-espresso/80 hover:bg-sand/60"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1 text-left">{mod.name}</span>
                  {mod.badge && (
                    <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-white">
                      {mod.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Controls */}
          <div className="mt-8 border-t border-espresso/10 pt-4 space-y-2">
            {manager.isAdmin && (
              <Link
                to="/admin/roles"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-espresso/20 bg-sand/50 px-3 py-2 text-xs font-bold text-espresso hover:bg-sand transition"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Manage RBAC Roles
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-espresso/15 px-3 py-2 text-xs font-bold text-espresso hover:bg-sand transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="min-w-0 flex-1 pb-16">
          {/* Top Bar for active module */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-espresso">
                {activeTab === "overview" ? (
                  <LayoutDashboard className="h-5 w-5" />
                ) : (
                  (() => {
                    const Icon = MODULE_ICONS[activeTab] || ShieldCheck;
                    return <Icon className="h-5 w-5 text-cocoa" />;
                  })()
                )}
              </div>
              <div>
                <h1 className="font-display text-lg font-black text-espresso">
                  {activeTab === "overview"
                    ? "Manager Overview"
                    : getModuleByKey(activeTab)?.name || activeTab}
                </h1>
                <p className="text-[11px] text-foreground/50">
                  {activeTab === "overview"
                    ? `Role: ${manager.roleTitle} · ${allowedModules.length} permitted modules`
                    : getModuleByKey(activeTab)?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                RBAC Active
              </span>

              <button
                onClick={refresh}
                className="grid h-8 w-8 place-items-center rounded-xl border border-espresso/10 bg-white text-espresso hover:bg-sand"
                title="Refresh Data"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Module Content Switcher */}
          {activeTab === "overview" ? (
            <ManagerOverviewView
              manager={manager}
              allowedModules={allowedModules}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === "analytics" && hasModule("analytics") ? (
            <ManagerAnalyticsView />
          ) : activeTab === "bookings" && hasModule("bookings") ? (
            <ManagerBookingsView />
          ) : activeTab === "messages" && hasModule("messages") ? (
            <ManagerMessagesView />
          ) : activeTab === "quotes" && hasModule("quotes") ? (
            <ManagerQuotesView />
          ) : activeTab === "pixels" && hasModule("pixels") ? (
            <ManagerPixelsView />
          ) : activeTab === "crm" && hasModule("crm") ? (
            <ManagerCrmView />
          ) : activeTab === "newsletter" && hasModule("newsletter") ? (
            <ManagerNewsletterView />
          ) : activeTab === "blog" && hasModule("blog") ? (
            <ManagerBlogView />
          ) : activeTab === "portfolio" && hasModule("portfolio") ? (
            <ManagerPortfolioView />
          ) : activeTab === "services" && hasModule("services") ? (
            <ManagerServicesView />
          ) : activeTab === "testimonials" && hasModule("testimonials") ? (
            <ManagerTestimonialsView />
          ) : activeTab === "faqs" && hasModule("faqs") ? (
            <ManagerFaqsView />
          ) : (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center">
              <Lock className="mx-auto h-8 w-8 text-red-500 mb-2" />
              <h2 className="font-display text-lg font-black text-red-800">Access Restricted</h2>
              <p className="mt-1 text-xs text-red-600">
                Your role ({manager.roleTitle}) does not have permission to view the module &quot;{activeTab}&quot;.
              </p>
              <button
                onClick={() => setActiveTab("overview")}
                className="mt-4 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white hover:bg-cocoa"
              >
                Return to Overview
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 1. WORKSPACE OVERVIEW VIEW
// --------------------------------------------------------------------------
function ManagerOverviewView({
  manager,
  allowedModules,
  onNavigate,
}: {
  manager: ManagerProfile;
  allowedModules: ManagerModuleDef[];
  onNavigate: (tab: string) => void;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const fetchCountsFn = useServerFn(getManagerOverviewCounts);

  useEffect(() => {
    let cancelled = false;
    async function fetchCounts() {
      setLoadingCounts(true);
      try {
        const res = await fetchCountsFn();
        if (!cancelled && res?.counts) {
          setCounts(res.counts);
        }
      } catch (e) {
        console.warn("Could not load overview counts:", e);
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    }

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [fetchCountsFn]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl border border-espresso/15 bg-espresso p-6 text-white shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            RBAC Profile: {manager.roleTitle}
          </div>
          <h2 className="mt-3 font-display text-2xl font-black sm:text-3xl">
            Welcome back, {manager.name.split(" ")[0]}!
          </h2>
          <p className="mt-1 text-xs text-white/70 max-w-xl">
            You are logged into the AM Enterprises Manager portal. Your role permissions are controlled by RBAC. Below is live access to your assigned modules.
          </p>
        </div>
      </div>

      {/* KPI Cards for ONLY allowed modules */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allowedModules.map((mod) => {
          const Icon = MODULE_ICONS[mod.key] || ShieldCheck;
          const count = counts[mod.key];

          return (
            <div
              key={mod.key}
              onClick={() => onNavigate(mod.key)}
              className="group cursor-pointer rounded-2xl border border-espresso/10 bg-white p-5 shadow-sm hover:border-espresso/30 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-sand text-espresso group-hover:bg-espresso group-hover:text-white transition">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-foreground/40 group-hover:text-espresso inline-flex items-center gap-0.5 transition">
                  Open <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-espresso/60">{mod.name}</p>
                <p className="mt-1 text-2xl font-black text-espresso">
                  {loadingCounts ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cocoa" />
                  ) : count !== undefined ? (
                    count.toLocaleString()
                  ) : (
                    "Active"
                  )}
                </p>
                <p className="mt-1 text-[11px] text-foreground/50 line-clamp-1">{mod.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 2. LIVE ANALYTICS VIEW (Specially built for SMM / Ad Runners!)
// --------------------------------------------------------------------------
function ManagerAnalyticsView() {
  const [days, setDays] = useState(7);
  const [events, setEvents] = useState<any[]>([]);
  const [live, setLive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchAnalyticsFn = useServerFn(getManagerAnalyticsData);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAnalyticsFn({ data: { days } });
      setEvents(res?.events ?? []);
      setLive(res?.live ?? []);
    } catch (e) {
      console.warn("Could not load analytics:", e);
    } finally {
      setLoading(false);
    }
  }, [days, fetchAnalyticsFn]);

  useEffect(() => {
    loadData();
    const timer = setInterval(async () => {
      try {
        const res = await fetchAnalyticsFn({ data: { days } });
        if (res?.live) setLive(res.live);
        if (res?.events) setEvents(res.events);
      } catch {}
    }, 10000);
    return () => clearInterval(timer);
  }, [loadData, fetchAnalyticsFn, days]);

  // Aggregate stats
  const liveSessions = useMemo(() => new Set(live.map((l) => l.session_id).filter(Boolean)).size, [live]);
  const totalPageviews = useMemo(() => events.filter((e) => e.event === "pageview").length, [events]);
  const totalVisitors = useMemo(() => new Set(events.map((e) => e.session_id).filter(Boolean)).size, [events]);

  // Referrers / Ad Campaigns
  const referrers = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      if (e.referrer) {
        try {
          const url = new URL(e.referrer);
          const domain = url.hostname.replace("www.", "");
          map.set(domain, (map.get(domain) ?? 0) + 1);
        } catch {
          map.set(e.referrer, (map.get(e.referrer) ?? 0) + 1);
        }
      } else {
        map.set("Direct / Ads / None", (map.get("Direct / Ads / None") ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [events]);

  // Top Pages
  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      if (e.path) {
        map.set(e.path, (map.get(e.path) ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Time filter & Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-espresso">
            Live Traffic Feed ({liveSessions} active {liveSessions === 1 ? "visitor" : "visitors"} now)
          </span>
        </div>

        <div className="inline-flex rounded-full border border-espresso/15 bg-white p-1 shadow-sm">
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                days === d ? "bg-espresso text-white" : "text-espresso/70 hover:text-espresso"
              }`}
            >
              Last {d === 1 ? "24 Hours" : `${d} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-espresso/60">Live Visitors</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{liveSessions}</p>
          <p className="mt-1 text-[11px] text-foreground/50">Browsing site in past 2 mins</p>
        </div>

        <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-espresso/60">Total Pageviews</p>
          <p className="mt-2 text-3xl font-black text-espresso">{totalPageviews.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-foreground/50">Recorded across website</p>
        </div>

        <div className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-espresso/60">Unique Sessions</p>
          <p className="mt-2 text-3xl font-black text-indigo-600">{totalVisitors.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-foreground/50">Total individual visitors</p>
        </div>
      </div>

      {/* Traffic Sources & Top Pages */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ad Traffic & Referrers */}
        <div className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso flex items-center justify-between">
            <span>Ad Sources & Referrers</span>
            <TrendingUp className="h-4 w-4 text-cocoa" />
          </h3>
          <p className="text-[11px] text-foreground/50 mb-4">Traffic origins for evaluating campaign ROI</p>

          {loading ? (
            <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
          ) : referrers.length === 0 ? (
            <p className="text-xs text-foreground/50">No referrer data in this time range.</p>
          ) : (
            <div className="space-y-2.5">
              {referrers.map(([source, count]) => {
                const pct = totalPageviews > 0 ? Math.round((count / totalPageviews) * 100) : 0;
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="truncate text-espresso">{source}</span>
                      <span className="text-foreground/60">{count} visits ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-sand">
                      <div className="h-1.5 rounded-full bg-cocoa" style={{ width: `${Math.max(pct, 4)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso flex items-center justify-between">
            <span>Top Performing Pages</span>
            <Radar className="h-4 w-4 text-cocoa" />
          </h3>
          <p className="text-[11px] text-foreground/50 mb-4">Most visited URLs and landing pages</p>

          {loading ? (
            <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
          ) : topPages.length === 0 ? (
            <p className="text-xs text-foreground/50">No pageview data in this time range.</p>
          ) : (
            <div className="space-y-2.5">
              {topPages.map(([path, count]) => (
                <div key={path} className="flex items-center justify-between border-b border-espresso/6 pb-2 text-xs">
                  <span className="font-mono text-[11px] font-bold text-espresso truncate max-w-xs">{path}</span>
                  <span className="rounded-md bg-sand px-2 py-0.5 text-[10px] font-bold text-espresso">{count} hits</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 3. BOOKINGS VIEW
// --------------------------------------------------------------------------
function ManagerBookingsView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const fetchBookingsFn = useServerFn(getManagerBookingsData);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBookingsFn();
      setRows(res?.bookings ?? []);
    } catch (e) {
      console.warn("Could not load bookings:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchBookingsFn]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.service && r.service.toLowerCase().includes(q))
    );
  });

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso/40" />
          <input
            type="text"
            placeholder="Search bookings by client name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-espresso/15 bg-sand/30 pl-9 pr-4 py-2 text-xs outline-none focus:border-cocoa focus:bg-white"
          />
        </div>
        <span className="text-xs text-foreground/50">{filtered.length} total bookings</span>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-cocoa" /></div>
      ) : filtered.length === 0 ? (
        <p className="p-8 text-center text-xs text-foreground/50">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-espresso/10 bg-sand/40 text-[10px] font-bold uppercase tracking-wider text-espresso/70">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Preferred Date & Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/6">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-sand/20 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-espresso">{r.name}</p>
                    <p className="text-[10px] text-foreground/60">{r.email} · {r.phone || "No phone"}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-espresso">{r.service || "General Consultation"}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {r.preferred_date || "Any date"} {r.preferred_time ? `at ${r.preferred_time}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {r.status || "confirmed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="rounded-lg border border-espresso/15 px-2.5 py-1 text-xs font-bold text-espresso hover:bg-sand"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-espresso/15 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-espresso/10 pb-3">
              <h3 className="font-display text-base font-black text-espresso">Booking Details</h3>
              <button onClick={() => setSelected(null)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong className="text-espresso">Client Name:</strong> {selected.name}</p>
              <p><strong className="text-espresso">Email:</strong> {selected.email}</p>
              <p><strong className="text-espresso">Phone:</strong> {selected.phone || "Not provided"}</p>
              <p><strong className="text-espresso">Service:</strong> {selected.service}</p>
              <p><strong className="text-espresso">Date/Time:</strong> {selected.preferred_date} {selected.preferred_time}</p>
              <p><strong className="text-espresso">Status:</strong> {selected.status}</p>
              {selected.notes && (
                <div className="rounded-xl bg-sand/50 p-3 mt-2">
                  <p className="font-bold text-espresso mb-1">Client Notes:</p>
                  <p className="text-foreground/70 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// 4. CONTACT MESSAGES VIEW
// --------------------------------------------------------------------------
function ManagerMessagesView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const fetchMessagesFn = useServerFn(getManagerMessagesData);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMessagesFn();
      setRows(res?.messages ?? []);
    } catch (e) {
      console.warn("Could not load messages:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchMessagesFn]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm space-y-4">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso">
        Contact Form Inquiries ({rows.length})
      </h3>

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-cocoa" /></div>
      ) : rows.length === 0 ? (
        <p className="p-8 text-center text-xs text-foreground/50">No messages found.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className="cursor-pointer rounded-2xl border border-espresso/10 bg-sand/20 p-4 hover:border-espresso/30 hover:bg-sand/40 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-espresso text-xs">{msg.name}</span>
                <span className="text-[10px] text-foreground/40">{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-[11px] font-semibold text-cocoa mt-0.5">{msg.subject || "Website Inquiry"}</p>
              <p className="text-xs text-foreground/60 line-clamp-2 mt-1">{msg.message}</p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-espresso/15 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-espresso/10 pb-3">
              <h3 className="font-display text-base font-black text-espresso">Message Inquiry</h3>
              <button onClick={() => setSelected(null)}><X className="h-4 w-4" /></button>
            </div>
            <div className="text-xs space-y-2">
              <p><strong className="text-espresso">From:</strong> {selected.name} ({selected.email})</p>
              <p><strong className="text-espresso">Subject:</strong> {selected.subject || "No Subject"}</p>
              <p><strong className="text-espresso">Date:</strong> {new Date(selected.created_at).toLocaleString()}</p>
              <div className="rounded-2xl border border-espresso/10 bg-sand/30 p-4 mt-2">
                <p className="font-semibold text-espresso mb-1">Message Content:</p>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// 5. QUOTES VIEW
// --------------------------------------------------------------------------
function ManagerQuotesView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchQuotesFn = useServerFn(getManagerQuotesData);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchQuotesFn();
      setRows(res?.quotes ?? []);
    } catch (e) {
      console.warn("Could not load quotes:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchQuotesFn]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm space-y-4">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso">
        Project Quote Requests ({rows.length})
      </h3>
      {loading ? (
        <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-cocoa" /></div>
      ) : rows.length === 0 ? (
        <p className="p-8 text-center text-xs text-foreground/50">No quote requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-espresso/10 bg-sand/40 text-[10px] font-bold uppercase tracking-wider text-espresso/70">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Timeline</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/6">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-sand/20">
                  <td className="px-4 py-3 font-bold text-espresso">{r.name} ({r.email})</td>
                  <td className="px-4 py-3 text-espresso">{r.service}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{r.budget || "Flexible"}</td>
                  <td className="px-4 py-3 text-foreground/60">{r.timeline || "Standard"}</td>
                  <td className="px-4 py-3 text-foreground/40">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// 6. TRACKING PIXELS VIEW (Crucial for SMM!)
// --------------------------------------------------------------------------
function ManagerPixelsView() {
  const [pixels, setPixels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchPixelsFn = useServerFn(getManagerPixelsData);

  const loadPixels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPixelsFn();
      setPixels(res?.pixels ?? []);
    } catch (e) {
      console.warn("Could not load tracking pixels:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchPixelsFn]);

  useEffect(() => {
    loadPixels();
  }, [loadPixels]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso">
          Tracking Pixels & Ad Tags
        </h3>
        <p className="text-xs text-foreground/50">
          Verify pixel IDs for Meta (Facebook/Instagram), Google Tag Manager & TikTok ads.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-cocoa" /></div>
      ) : pixels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-espresso/15 p-8 text-center text-xs text-foreground/50">
          No tracking pixels configured yet in the admin panel.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pixels.map((p) => (
            <div key={p.id} className="rounded-2xl border border-espresso/10 bg-sand/30 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-espresso text-xs capitalize">{p.provider || p.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${p.enabled ? "bg-emerald-100 text-emerald-800" : "bg-espresso/10 text-espresso/50"}`}>
                  {p.enabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs font-black text-espresso">{p.pixel_id || p.value || "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// 7. CRM LEADS VIEW
// --------------------------------------------------------------------------
function ManagerCrmView() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchCrmFn = useServerFn(getManagerCrmData);

  const loadCrm = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCrmFn();
      setLeads(res?.leads ?? []);
    } catch (e) {
      console.warn("Could not load leads:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchCrmFn]);

  useEffect(() => {
    loadCrm();
  }, [loadCrm]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm space-y-4">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso">
        CRM Leads & Pipeline ({leads.length})
      </h3>
      {loading ? (
        <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-cocoa" /></div>
      ) : leads.length === 0 ? (
        <p className="p-8 text-center text-xs text-foreground/50">No CRM leads recorded.</p>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-xl border border-espresso/10 bg-sand/20 p-3 text-xs">
              <div>
                <p className="font-bold text-espresso">{l.name}</p>
                <p className="text-[10px] text-foreground/60">{l.email} · {l.service || "General"}</p>
              </div>
              <span className="rounded-full bg-sand px-2.5 py-1 text-[10px] font-bold uppercase text-espresso">
                {l.stage || "Lead"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// 8. OTHER READ VIEWS (Newsletter, Blog, Services, Portfolio, etc.)
// --------------------------------------------------------------------------
function ManagerNewsletterView() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchNewsletterFn = useServerFn(getManagerNewsletterData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchNewsletterFn();
        if (!cancelled) setSubscribers(res?.subscribers ?? []);
      } catch (e) {
        console.warn("Could not load newsletter:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchNewsletterFn]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso mb-3">Newsletter Subscribers ({subscribers.length})</h3>
      {loading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
      ) : subscribers.length === 0 ? (
        <p className="p-6 text-center text-xs text-foreground/50">No subscribers yet.</p>
      ) : (
        <div className="divide-y divide-espresso/6 text-xs">
          {subscribers.map((s) => (
            <div key={s.id} className="py-2 flex items-center justify-between">
              <span className="font-semibold text-espresso">{s.email}</span>
              <span className="text-[10px] text-foreground/40">{new Date(s.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManagerBlogView() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchBlogFn = useServerFn(getManagerBlogData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchBlogFn();
        if (!cancelled) setPosts(res?.posts ?? []);
      } catch (e) {
        console.warn("Could not load blog posts:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchBlogFn]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso mb-3">Blog Posts ({posts.length})</h3>
      {loading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
      ) : posts.length === 0 ? (
        <p className="p-6 text-center text-xs text-foreground/50">No blog posts found.</p>
      ) : (
        <div className="space-y-2 text-xs">
          {posts.map((p) => (
            <div key={p.id} className="rounded-xl border border-espresso/10 p-3 bg-sand/20">
              <p className="font-bold text-espresso">{p.title}</p>
              <p className="text-[10px] text-foreground/50">Slug: /{p.slug}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManagerServicesView() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchServicesFn = useServerFn(getManagerServicesData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchServicesFn();
        if (!cancelled) setServices(res?.services ?? []);
      } catch (e) {
        console.warn("Could not load services:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchServicesFn]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso mb-3">Services Catalog ({services.length})</h3>
      {loading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
      ) : services.length === 0 ? (
        <p className="p-6 text-center text-xs text-foreground/50">No services found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          {services.map((s) => (
            <div key={s.id} className="rounded-xl border border-espresso/10 p-3 bg-sand/20">
              <p className="font-bold text-espresso">{s.title}</p>
              <p className="text-[10px] text-foreground/60 line-clamp-2 mt-1">{s.summary || s.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManagerPortfolioView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchPortfolioFn = useServerFn(getManagerPortfolioData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchPortfolioFn();
        if (!cancelled) setItems(res?.items ?? []);
      } catch (e) {
        console.warn("Could not load portfolio:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchPortfolioFn]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso mb-3">Portfolio Projects ({items.length})</h3>
      {loading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
      ) : items.length === 0 ? (
        <p className="p-6 text-center text-xs text-foreground/50">No portfolio projects found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-espresso/10 p-3 bg-sand/20">
              <p className="font-bold text-espresso">{item.title}</p>
              <p className="text-[10px] text-foreground/60">{item.client_name || "Client project"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManagerTestimonialsView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTestimonialsFn = useServerFn(getManagerTestimonialsData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchTestimonialsFn();
        if (!cancelled) setItems(res?.items ?? []);
      } catch (e) {
        console.warn("Could not load testimonials:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchTestimonialsFn]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso mb-3">Client Testimonials ({items.length})</h3>
      {loading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
      ) : items.length === 0 ? (
        <p className="p-6 text-center text-xs text-foreground/50">No testimonials found.</p>
      ) : (
        <div className="space-y-2 text-xs">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-espresso/10 p-3 bg-sand/20">
              <p className="font-bold text-espresso">{item.client_name} - {item.client_role || "Client"}</p>
              <p className="text-foreground/70 italic mt-1">&ldquo;{item.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManagerFaqsView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchFaqsFn = useServerFn(getManagerFaqsData);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchFaqsFn();
        if (!cancelled) setItems(res?.items ?? []);
      } catch (e) {
        console.warn("Could not load FAQs:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchFaqsFn]);

  return (
    <div className="rounded-3xl border border-espresso/10 bg-white p-5 shadow-sm">
      <h3 className="font-display text-sm font-black uppercase tracking-wider text-espresso mb-3">FAQs ({items.length})</h3>
      {loading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-cocoa" /></div>
      ) : items.length === 0 ? (
        <p className="p-6 text-center text-xs text-foreground/50">No FAQs found.</p>
      ) : (
        <div className="space-y-2 text-xs">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-espresso/10 p-3 bg-sand/20">
              <p className="font-bold text-espresso">Q: {item.question}</p>
              <p className="text-foreground/70 mt-1">A: {item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
