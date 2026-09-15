import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export const Route = createFileRoute("/clients/support")({
  head: () => ({
    meta: [
      { title: "Support â€” AM Enterprises Client Portal" },
      { name: "description", content: "Raise a support request and track replies from the AM Enterprises team." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Support clientId={client.id} />}</PortalShell>,
});

interface Ticket { id: string; subject: string; message: string; status: string; priority: string; reply: string | null; created_at: string }

function Support({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = usePortalRows<Ticket>("support_requests", clientId, { orderBy: "created_at" });
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await supabase.from("support_requests").insert({ client_id: clientId, subject: subject.trim(), message: message.trim(), priority });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setSubject(""); setMessage(""); setSent(true); reload();
  }

  return (
    <div>
      <PortalHeading title="Support" subtitle="We usually reply within one business day" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {loading ? <EmptyState label="Loading requestsâ€¦" /> : rows.length === 0 ? <EmptyState label="No support requests yet." /> : (
            <div className="space-y-3">
              {rows.map((t) => (
                <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-black text-foreground">{t.subject}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${t.status === "resolved" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.status}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{t.message}</p>
                  {t.reply && (
                    <div className="mt-3 rounded-xl border-l-4 border-primary bg-muted/50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">AM Enterprises reply</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{t.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-sm font-black uppercase tracking-widest text-foreground">New request</h2>
          <div className="space-y-3">
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" maxLength={120}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
              {["low", "normal", "high", "urgent"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" maxLength={2000}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            {error && <p className="text-xs text-destructive">{error}</p>}
            {sent && <p className="text-xs text-primary">Request submitted â€” we'll be in touch.</p>}
            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
