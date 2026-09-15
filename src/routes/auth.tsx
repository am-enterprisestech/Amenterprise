import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogIn, UserPlus, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AM Enterprises Admin" },
      { name: "description", content: "Sign in to the AM Enterprises admin panel." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[80vh] place-items-center bg-sand/40 px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-espresso/10 bg-white p-8 shadow-[0_20px_60px_-25px_rgba(6,54,58,0.25)]">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-espresso">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
        <h1 className="font-display text-3xl font-black text-espresso">
          {mode === "signin" ? "Admin sign in" : "Create admin account"}
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          {mode === "signin" ? "Sign in to manage services, portfolio, team & messages." : "The first account to sign up becomes the admin."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-espresso/70">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-espresso/12 bg-sand/40 px-4 py-3 text-sm outline-none transition focus:border-cocoa focus:bg-white"
              placeholder="you@company.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-espresso/70">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-espresso/12 bg-sand/40 px-4 py-3 text-sm outline-none transition focus:border-cocoa focus:bg-white"
              placeholder="Minimum 8 characters"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-sm font-bold text-white transition hover:bg-cocoa disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          className="mt-4 w-full text-center text-xs font-semibold text-cocoa hover:text-espresso"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}