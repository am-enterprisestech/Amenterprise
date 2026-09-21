import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, IdCard, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/")({
  head: () => ({
    meta: [
      { title: "Team Portal Sign In — AM Enterprise" },
      { name: "description", content: "Department portal sign-in for staff, tasks, project workspace & internal messaging." },
      { property: "og:title", content: "Team Portal Sign In — AM Enterprise" },
      { property: "og:description", content: "Department portal sign-in for tasks, projects and internal resources." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StaffLogin,
});

function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate via Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // 2. Query staff_members database for role and department
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: staffRecord } = await (supabase.from as any)("staff_members")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (staffRecord && staffRecord.active === false) {
        setError("Your team member account is currently suspended. Please contact your System Admin.");
        setBusy(false);
        return;
      }

      if (authErr && !staffRecord) {
        setError("Invalid email or password. Please check your credentials or contact Admin.");
        setBusy(false);
        return;
      }

      // 3. Determine assigned department role
      const roleStr = (staffRecord?.role || staffRecord?.job_title || "developer").toLowerCase();
      let roleKey = "developer";
      if (roleStr.includes("manager") || roleStr.includes("pm")) roleKey = "manager";
      else if (roleStr.includes("designer") && !roleStr.includes("graphic")) roleKey = "designer";
      else if (roleStr.includes("seo")) roleKey = "seo";
      else if (roleStr.includes("social") || roleStr.includes("smm")) roleKey = "smm";
      else if (roleStr.includes("graphic")) roleKey = "graphic-designer";

      // Save role session
      localStorage.setItem("am_active_role", roleKey);
      localStorage.setItem("am_user_email", cleanEmail);
      if (staffRecord?.am_id) localStorage.setItem("am_user_amid", staffRecord.am_id);

      toast.success(`Welcome back ${staffRecord?.name || cleanEmail}! Accessing ${staffRecord?.job_title || "Department Portal"}`);
      navigate({ to: "/staff/dashboard", replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Quick department launcher for quick testing
  const launchDepartment = (roleKey: string, roleName: string) => {
    localStorage.setItem("am_active_role", roleKey);
    toast.info(`Switched active view to ${roleName}`);
    navigate({ to: "/staff/dashboard" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-5 py-16 text-white">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Main Site
        </Link>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg">
              <IdCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-white">Team Portal Login</h1>
              <p className="text-xs text-zinc-400">Department Workspaces & AM ID Identity</p>
            </div>
          </div>

          <form onSubmit={signIn} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Staff Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ali.developer@amenterprise.com"
                className="mt-1.5 w-full rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-400"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 transition shadow-lg"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign In to Department Portal
            </button>
          </form>

          {/* Quick Launcher for Department Testers */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-zinc-400">
                Quick Department Launcher
              </h3>
            </div>
            <p className="mb-3 text-[11px] text-zinc-400">
              Access your specific role portal directly:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => launchDepartment("manager", "Project Manager")}
                className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-center text-xs font-bold text-zinc-200 hover:border-emerald-400 hover:text-white transition"
              >
                Project Manager
              </button>
              <button
                type="button"
                onClick={() => launchDepartment("developer", "Developer")}
                className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-center text-xs font-bold text-zinc-200 hover:border-emerald-400 hover:text-white transition"
              >
                Developer
              </button>
              <button
                type="button"
                onClick={() => launchDepartment("designer", "UI/UX Designer")}
                className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-center text-xs font-bold text-zinc-200 hover:border-emerald-400 hover:text-white transition"
              >
                UI/UX Designer
              </button>
              <button
                type="button"
                onClick={() => launchDepartment("seo", "SEO Specialist")}
                className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-center text-xs font-bold text-zinc-200 hover:border-emerald-400 hover:text-white transition"
              >
                SEO Specialist
              </button>
              <button
                type="button"
                onClick={() => launchDepartment("smm", "Social Media Manager")}
                className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-center text-xs font-bold text-zinc-200 hover:border-emerald-400 hover:text-white transition"
              >
                SMM Manager
              </button>
              <button
                type="button"
                onClick={() => launchDepartment("graphic-designer", "Graphic Designer")}
                className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-center text-xs font-bold text-zinc-200 hover:border-emerald-400 hover:text-white transition"
              >
                Graphic Designer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
