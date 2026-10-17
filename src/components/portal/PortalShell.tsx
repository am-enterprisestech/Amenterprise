import { type ReactNode, useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { usePortalClient } from "@/lib/use-portal";
import {
  LayoutDashboard, FolderKanban, ListChecks, ReceiptText, MessagesSquare, Bell,
  FileText, UserRound, LifeBuoy, LogOut, Loader2, Menu, X, ArrowLeft, MessageCircle,
  Search, Users
} from "lucide-react";

const nav = [
  { to: "/clients/dashboard", label: "Executive Overview", icon: LayoutDashboard },
  { to: "/clients/projects", label: "Projects & Sprints", icon: FolderKanban },
  { to: "/clients/tasks", label: "Sprint Tasks", icon: ListChecks },
  { to: "/clients/billing", label: "Billing & Invoices", icon: ReceiptText },
  { to: "/clients/chat", label: "Live Delivery Room", icon: MessageCircle, badge: "LIVE" },
  { to: "/clients/messages", label: "Official Inbox", icon: MessagesSquare },
  { to: "/clients/notifications", label: "Alerts & Notifications", icon: Bell },
  { to: "/clients/documents", label: "Vault & Agreements", icon: FileText },
  { to: "/clients/support", label: "Help & Escalation", icon: LifeBuoy },
  { to: "/clients/profile", label: "Portal Profile", icon: UserRound },
];

export function PortalHeading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#24262B]">{title}</h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-[#85858D]">{subtitle}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ECEBE8] bg-white p-8 text-center sm:p-12 shadow-xs">
      {Icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#E5F3FA] text-[#85BBD6]">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-heading text-base font-bold text-[#24262B]">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-xs text-[#85858D]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PortalShell({ children }: { children: (client: NonNullable<ReturnType<typeof usePortalClient>["client"]>) => ReactNode }) {
  const { client, email, loading } = usePortalClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!loading && !email) navigate({ to: "/clients", replace: true });
  }, [loading, email, navigate]);

  // Global keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/clients", replace: true });
  }

  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return nav;
    const q = searchQuery.toLowerCase();
    return nav.filter((n) => n.label.toLowerCase().includes(q) || n.to.toLowerCase().includes(q));
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-[#FAFAF8]">
        <Loader2 className="h-7 w-7 animate-spin text-[#85BBD6]" />
      </div>
    );
  }

  if (!client || !client.active) {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-[#FAFAF8] px-5">
        <div className="max-w-md rounded-2xl border border-[#ECEBE8] bg-[#FFFFFF] p-8 text-center shadow-sm">
          <h1 className="font-heading text-xl font-bold text-[#24262B]">Portal access unavailable</h1>
          <p className="mt-2 text-sm text-[#85858D]">
            {client ? "Your portal account is currently deactivated." : `Signed in as ${email ?? "unknown"}, but no client portal is linked to this account.`}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/" className="rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] px-5 py-2 text-xs font-semibold text-[#24262B] hover:bg-[#E5F3FA]">Home</Link>
            <button onClick={signOut} className="rounded-xl bg-[#85BBD6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#85BBD6]/90">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#24262B]">
      {/* ── MOBILE TOP BAR ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#ECEBE8] bg-white/90 backdrop-blur-md px-4 py-3 lg:hidden shadow-xs">
        <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#ECEBE8] bg-white text-[#24262B]">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2">
          {client.avatar_url
            ? <img src={client.avatar_url} alt={client.name} className="h-7 w-7 rounded-lg object-cover ring-1 ring-[#85BBD6]" />
            : <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#E5F3FA] text-xs font-bold text-[#85BBD6]">{client.name.slice(0, 1).toUpperCase()}</div>
          }
          <span className="font-heading font-bold text-[#24262B] text-sm">{client.name.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSearchOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#ECEBE8] bg-white text-[#85858D]">
            <Search className="h-4 w-4" />
          </button>
          <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-xl border border-[#ECEBE8] bg-white text-[#85858D]"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-[#24262B]/20 backdrop-blur-xs lg:hidden" />}

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-6 lg:px-8">
        {/* ── DESKTOP EXECUTIVE SIDEBAR ── */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-[#ECEBE8] bg-[#FFFFFF] p-5 transition-transform duration-300 lg:sticky lg:top-6 lg:z-auto lg:block lg:h-[calc(100vh-3rem)] lg:w-64 lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-xs ${open ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Top Brand & Back link */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#85858D] hover:text-[#24262B] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 text-[#85BBD6]" /> Back to website
            </Link>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-[#ECEBE8] lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Client Avatar & Account Card */}
          <div className="mb-5 rounded-2xl border border-[#ECEBE8] bg-[#FAFAF8] p-3.5">
            <div className="flex items-center gap-3">
              {client.avatar_url
                ? <img src={client.avatar_url} alt={client.name} className="h-10 w-10 shrink-0 rounded-xl object-cover border border-[#ECEBE8]" />
                : <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E5F3FA] text-sm font-bold text-[#85BBD6]">{client.name.slice(0, 1).toUpperCase()}</div>
              }
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-bold text-[#24262B]">{client.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-[#85858D]">{client.company || "Executive Workspace"}</p>
              </div>
            </div>
            {client.am_id && (
              <div className="mt-2.5 pt-2 border-t border-[#ECEBE8] flex items-center justify-between text-[11px]">
                <span className="font-mono text-[#85858D]">{client.am_id}</span>
                <span className="font-medium text-[#638D79] bg-[#E5F3FA]/70 px-2 py-0.5 rounded-full text-[10px]">
                  Verified Account
                </span>
              </div>
            )}
          </div>

          {/* Quick Search Shortcut Pill */}
          <button
            onClick={() => setSearchOpen(true)}
            className="mb-4 w-full flex items-center justify-between rounded-xl border border-[#ECEBE8] bg-[#FAFAF8] px-3.5 py-2 text-xs text-[#85858D] hover:border-[#85BBD6] hover:text-[#24262B] transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#85BBD6]" />
              <span>Search portal...</span>
            </div>
            <span className="rounded bg-white border border-[#ECEBE8] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#85858D]">
              ⌘K
            </span>
          </button>

          {/* Navigation Items (Pale ice-blue selected states) */}
          <nav className="space-y-1">
            {nav.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to as any}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-[#E5F3FA] text-[#24262B] font-semibold border border-[#85BBD6]/30 shadow-2xs"
                      : "text-[#85858D] hover:bg-[#FAFAF8] hover:text-[#24262B]"
                  }`}
                >
                  <n.icon className={`h-4 w-4 shrink-0 ${active ? "text-[#85BBD6]" : "text-[#85858D]"}`} />
                  <span className="flex-1 truncate">{n.label}</span>
                  {n.badge && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#F8E8EF] border border-[#D9A7BC]/40 px-2 py-0.2 text-[9px] font-semibold uppercase text-[#D9A7BC]">
                      ● {n.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Delivery Team Contact Card */}
          <div className="mt-5 rounded-2xl border border-[#ECEBE8] bg-[#FAFAF8] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#E5F3FA] text-[10px] font-bold text-[#85BBD6]">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#24262B]">Veloura Delivery</p>
                <p className="truncate text-[10px] text-[#85858D]">Engineering &amp; Brand Desk</p>
              </div>
            </div>
            <Link
              to="/clients/chat"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-[#ECEBE8] hover:border-[#85BBD6] px-3 py-1.5 text-xs font-medium text-[#24262B] transition-colors shadow-2xs"
            >
              <span>Open Delivery Room</span>
            </Link>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ECEBE8] bg-white px-3 py-2 text-xs font-medium text-[#85858D] hover:bg-[#FAFAF8] hover:text-[#24262B] transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </aside>

        {/* ── MAIN CONTENT VIEWPORT ── */}
        <main className="min-w-0 flex-1 pb-16">{children(client)}</main>
      </div>

      {/* ── COMMAND PALETTE MODAL (Ctrl+K) ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#24262B]/20 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#ECEBE8] bg-white p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-3 border-b border-[#ECEBE8] pb-3 px-2">
              <Search className="h-4 w-4 text-[#85BBD6]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to projects, invoices, tasks, chat..."
                className="w-full text-sm text-[#24262B] outline-none placeholder:text-[#85858D] bg-transparent font-medium"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-full p-1 text-[#85858D] hover:bg-[#FAFAF8]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#85858D]">Navigation</p>
              {filteredNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to as any}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#24262B] hover:bg-[#E5F3FA] transition-colors"
                >
                  <item.icon className="h-4 w-4 text-[#85BBD6]" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {filteredNav.length === 0 && (
                <p className="py-6 text-center text-xs text-[#85858D]">No matching sections found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
