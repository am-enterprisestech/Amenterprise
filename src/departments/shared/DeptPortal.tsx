import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffMember } from "@/lib/use-staff";
import type { DepartmentConfig } from "../types";
import { DEPARTMENTS } from "../registry";

export function DeptPortal({ dept, section }: { dept: DepartmentConfig; section?: string }) {
  const { staff, email, loading } = useStaffMember();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!loading && !email) navigate({ to: dept.authPath as "/dev-auth", replace: true }); }, [loading, email, dept.authPath, navigate]);
  useEffect(() => { setOpen(false); }, [section]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: dept.authPath as "/dev-auth", replace: true });
  }

  if (loading || !email) return <div className="grid min-h-[80vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const staffSlug = staff ? (staff.department_slug ?? DEPARTMENTS.find((d) => d.roles.includes(staff.role))?.slug) : null;
  if (!staff || !staff.active || staffSlug !== dept.slug) {
    const other = DEPARTMENTS.find((d) => d.slug === staffSlug);
    return (
      <div className="grid min-h-[80vh] place-items-center bg-muted/30 px-5">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-black text-foreground">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {!staff ? "This account is not a team account." : !staff.active ? "Your account is deactivated." : `You don't have access to the ${dept.name} portal.`}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {other && staff?.active && <Link to="/portal/$dept" params={{ dept: other.slug }} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Open {other.name}</Link>}
            <button onClick={signOut} className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  const current = dept.sections.find((s) => s.key === section) ?? dept.sections[0];
  const Comp = current.Component;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-xl border border-border">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        <span className="font-display font-black text-foreground">{dept.short} Portal</span>
        <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-xl border border-border"><LogOut className="h-4 w-4" /></button>
      </div>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" />}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-border bg-card p-5 transition-transform lg:sticky lg:top-6 lg:z-auto lg:h-[calc(100vh-3rem)] lg:w-64 lg:translate-x-0 lg:rounded-3xl lg:border ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{dept.name}</span>
          <p className="mt-3 font-display text-lg font-black text-foreground">{staff.name}</p>
          <p className="text-xs text-muted-foreground">{staff.job_title || staff.role}{staff.am_id ? ` · ${staff.am_id}` : ""}</p>
          <nav className="mt-6 space-y-1">
            {dept.sections.map((s) => (
              <Link key={s.key} to="/portal/$dept" params={{ dept: dept.slug }} search={{ s: s.key }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${s.key === current.key ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"}`}>
                <s.icon className="h-4 w-4 shrink-0" /> <span className="truncate">{s.label}</span>
              </Link>
            ))}
          </nav>
          <button onClick={signOut} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted"><LogOut className="h-4 w-4" /> Sign out</button>
        </aside>
        <main className="min-w-0 flex-1 pb-16"><Comp staff={staff} /></main>
      </div>
    </div>
  );
}
