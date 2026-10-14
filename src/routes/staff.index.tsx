import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, IdCard, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/staff/")({
  head: () => ({
    meta: [
      { title: "Team Portal Login — AM Enterprises" },
      { name: "description", content: "Team member sign-in for tasks, projects, internal messages and resources." },
      { property: "og:title", content: "Team Portal Login — AM Enterprises" },
      { property: "og:description", content: "Team member sign-in for tasks, projects and internal resources." },
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
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) navigate({ to: "/staff/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (err) { setError(err.message); return; }
    navigate({ to: "/staff/dashboard", replace: true });
  }

  async function forgot() {
    if (!email.trim()) { setError("Enter your email first."); return; }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/staff`,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setNotice("Password reset link sent — check your inbox.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><IdCard className="h-5 w-5" /></div>
            <div>
              <h1 className="font-display text-xl font-black text-foreground">Team Portal</h1>
              <p className="text-xs text-muted-foreground">Tasks, projects, messages & resources</p>
            </div>
          </div>

          <form onSubmit={signIn} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Work email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>

            {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
            {notice && <p className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">{notice}</p>}

            <button type="submit" disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
          </form>

          <button onClick={forgot} className="mt-4 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground">
            Forgot password?
          </button>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Team accounts are created by your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
