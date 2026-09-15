import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LockKeyhole, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/clients/")({
  head: () => ({
    meta: [
      { title: "Client Portal Login â€” AM Enterprises" },
      { name: "description", content: "Sign in to the AM Enterprises client portal to track projects, tasks, invoices, documents and messages in one place." },
      { property: "og:title", content: "Client Portal Login â€” AM Enterprises" },
      { property: "og:description", content: "Track your projects, invoices and documents in the AM Enterprises client portal." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: ClientLogin,
});

function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) navigate({ to: "/clients/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (err) { setError(err.message); return; }
    navigate({ to: "/clients/dashboard", replace: true });
  }

  async function forgot() {
    if (!email.trim()) { setError("Enter your email first."); return; }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/clients`,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setNotice("Password reset link sent â€” check your inbox.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="h-5 w-5" /></div>
            <div>
              <h1 className="font-display text-xl font-black text-foreground">Client Portal</h1>
              <p className="text-xs text-muted-foreground">Projects, invoices, documents & messages</p>
            </div>
          </div>

          <form onSubmit={signIn} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
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
          
          <div className="mt-6 border-t border-border pt-6 text-center">
            <Link
              to="/clients/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Direct Access to Client Portal
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Need an account? Contact us at <a href="tel:+923173712950" className="font-bold text-foreground">+92 317 371 2950</a>
          </p>
        </div>
      </div>
    </div>
  );
}
