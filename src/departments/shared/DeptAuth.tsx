import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ArrowLeft, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { DepartmentConfig } from "../types";
import { DEPARTMENTS } from "../registry";

/** Resolves which department a signed-in user belongs to (null = not staff). */
async function resolveDept(userId: string) {
  const { data } = await supabase.from("staff_members").select("department_slug, role, active").eq("user_id", userId).maybeSingle();
  if (!data) return { staff: false as const };
  const slug = data.department_slug ?? DEPARTMENTS.find((d) => d.roles.includes(data.role))?.slug ?? null;
  return { staff: true as const, active: data.active, slug };
}

export function DeptAuth({ dept }: { dept: DepartmentConfig }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function route(userId: string, signOutOnFail: boolean) {
    const r = await resolveDept(userId);
    let msg: string | null = null;
    if (!r.staff) msg = "This account is not a team account.";
    else if (!r.active) msg = "Your team account is deactivated. Contact admin.";
    else if (r.slug !== dept.slug) {
      const other = DEPARTMENTS.find((d) => d.slug === r.slug);
      msg = other ? `Your account belongs to ${other.name}. Please sign in at ${other.authPath}.` : "No department is assigned to your account yet. Contact admin.";
    }
    if (msg) {
      if (signOutOnFail) { await supabase.auth.signOut(); setError(msg); }
      return;
    }
    navigate({ to: "/portal/$dept", params: { dept: dept.slug }, replace: true });
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data?.user) route(data.user.id, false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (err || !data.user) { setError(err?.message ?? "Sign-in failed"); setBusy(false); return; }
    await route(data.user.id, true);
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Back to site</Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><IdCard className="h-5 w-5" /></div>
          <span className="mt-4 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{dept.short} portal</span>
          <h1 className="mt-2 font-display text-2xl font-black text-foreground">{dept.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dept.tagline}</p>
          <form onSubmit={signIn} className="mt-6 space-y-3">
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in</button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">Accounts are created by the admin. Forgot your password? Ask the admin to reset it.</p>
        </div>
      </div>
    </div>
  );
}
