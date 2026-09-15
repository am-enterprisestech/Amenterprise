import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useStaffMember, type StaffMember } from "@/lib/use-staff";
import { STAFF_MODULES, roleLabel } from "@/lib/staff-roles";
import {
  LayoutDashboard, ListChecks, FolderKanban, MessagesSquare, Bell, FileText, UserRound,
  LogOut, Loader2, Menu, X, ArrowLeft,
} from "lucide-react";

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  tasks: ListChecks,
  projects: FolderKanban,
  messages: MessagesSquare,
  notifications: Bell,
  documents: FileText,
  profile: UserRound,
};

export function StaffShell({
  module,
  children,
}: {
  module?: string;
  children: (staff: StaffMember) => ReactNode;
}) {
  const { staff, email, loading } = useStaffMember();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!loading && !email) navigate({ to: "/staff", replace: true });
  }, [loading, email, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/staff", replace: true });
  }

  if (loading) {
    return <div className="grid min-h-[80vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!staff || !staff.active) {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-muted/30 px-5">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-black text-foreground">Team portal unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {staff ? "Your team account is currently deactivated." : `Signed in as ${email ?? "unknown"}, but no team profile is linked to this account.`}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground">Home</Link>
            <button onClick={signOut} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  const allowed = STAFF_MODULES.filter((m) => staff.modules?.includes(m.key));
  const denied = module ? !staff.modules?.includes(module) : false;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-xl border border-border">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <span className="font-display font-black text-foreground">Team Portal</span>
        <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-xl border border-border"><LogOut className="h-4 w-4" /></button>
      </div>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" />}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-border bg-card p-5 transition-transform duration-300 lg:sticky lg:top-6 lg:z-auto lg:block lg:h-[calc(100vh-3rem)] lg:w-64 lg:translate-x-0 lg:rounded-3xl lg:border ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-6 flex items-center justify-between lg:block">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-border lg:hidden"><X className="h-4 w-4" /></button>
          </div>
          <div className="mb-6">
            <p className="font-display text-lg font-black text-foreground">{staff.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{staff.job_title || roleLabel(staff.role)}</p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {roleLabel(staff.role)}
            </span>
          </div>
          <nav className="space-y-1">
            {allowed.map((m) => {
              const Icon = ICONS[m.key] ?? LayoutDashboard;
              const active = location.pathname === m.path;
              return (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <Link key={m.key} to={m.path as any} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"}`}>
                  <Icon className="h-4 w-4 shrink-0" /> <span className="truncate">{m.label}</span>
                </Link>
              );
            })}
          </nav>
          <button onClick={signOut} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 pb-16">
          {denied ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <h1 className="font-display text-xl font-black text-foreground">Module not enabled</h1>
              <p className="mt-2 text-sm text-muted-foreground">Your role ({roleLabel(staff.role)}) doesn’t have access to this section.</p>
            </div>
          ) : (
            children(staff)
          )}
        </main>
      </div>
    </div>
  );
}

export function StaffHeading({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-black text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function StaffEmpty({ label }: { label: string }) {
  return <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">{label}</div>;
}
