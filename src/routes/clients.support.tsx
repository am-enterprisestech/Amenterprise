import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Send, LifeBuoy, ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle2, AlertCircle, PlusCircle, X } from "lucide-react";

export const Route = createFileRoute("/clients/support")({
  head: () => ({
    meta: [
      { title: "Support — AM Enterprises Client Portal" },
      { name: "description", content: "Raise a support request and track replies from the AM Enterprises team." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Support clientId={client.id} clientName={client.name} />}</PortalShell>,
});

interface Ticket { id: string; subject: string; message: string; status: string; priority: string; resolved_at: string | null; created_at: string }
interface Reply { id: string; ticket_id: string; sender_kind: string; sender_name: string; body: string; created_at: string }

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};
const STATUS_INFO: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  open: { label: "Open", cls: "bg-blue-100 text-blue-700", icon: Clock },
  in_progress: { label: "In Progress", cls: "bg-amber-100 text-amber-700", icon: Loader2 },
  resolved: { label: "Resolved", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  closed: { label: "Closed", cls: "bg-slate-100 text-slate-600", icon: X },
};

function Support({ clientId, clientName }: { clientId: string; clientName: string }) {
  const { rows, loading, reload } = usePortalRows<Ticket>("support_requests", clientId, { orderBy: "created_at" });
  const [replies, setReplies] = useState<Reply[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (rows.length === 0) return;
    const ids = rows.map((r) => r.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("support_replies")
      .select("*")
      .in("ticket_id", ids)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: Reply[] | null }) => setReplies(data ?? []));
  }, [rows]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await supabase.from("support_requests").insert({ client_id: clientId, subject: subject.trim(), message: message.trim(), priority });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setSubject(""); setMessage(""); setSent(true); setShowForm(false); reload();
  }

  async function sendReply(ticketId: string) {
    const body = replyDraft[ticketId]?.trim();
    if (!body) return;
    setReplying(ticketId);
    const { data: auth } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("support_replies").insert({
      ticket_id: ticketId, sender_kind: "client",
      sender_id: auth.user?.id, sender_name: clientName, body,
    });
    setReplyDraft((d) => ({ ...d, [ticketId]: "" }));
    setReplying(null);
    // refresh replies
    const ids = rows.map((r) => r.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)("support_replies").select("*").in("ticket_id", ids).order("created_at", { ascending: true });
    setReplies(data ?? []);
  }

  const open = rows.filter((t) => t.status !== "resolved" && t.status !== "closed").length;
  const resolved = rows.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <div>
      <PortalHeading
        title="Support"
        subtitle="We usually reply within one business day"
        right={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="h-4 w-4" />
            New Request
          </button>
        }
      />

      {/* stats */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {[
          { label: "Total Tickets", val: rows.length, icon: LifeBuoy, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
          { label: "Open", val: open, icon: AlertCircle, color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Resolved", val: resolved, icon: CheckCircle2, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className={`flex items-center gap-4 rounded-2xl border p-4 ${color}`}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/60"><Icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-black">{val}</p><p className="text-xs font-semibold">{label}</p></div>
          </div>
        ))}
      </div>

      {/* New request form slide-down */}
      {showForm && (
        <div className="mb-6 rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-black text-foreground">New Support Request</h2>
            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <input required value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject — brief description of the issue"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                {["low", "normal", "high", "urgent"].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} priority</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail…" maxLength={2000}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            {error && <p className="sm:col-span-2 text-xs text-destructive">{error}</p>}
            {sent && <p className="sm:col-span-2 text-xs text-emerald-600 font-semibold">✓ Request submitted — we'll be in touch soon.</p>}
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted"><LifeBuoy className="h-8 w-8 text-muted-foreground/50" /></div>
          <p className="font-display text-lg font-black text-foreground">No support tickets yet</p>
          <p className="text-sm text-muted-foreground">Click "New Request" to get help from our team</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => {
            const statusData = STATUS_INFO[t.status] ?? STATUS_INFO.open;
            const StatusIcon = statusData.icon;
            const ticketReplies = replies.filter((r) => r.ticket_id === t.id);
            const isExpanded = expanded === t.id;
            const hasAdminReply = ticketReplies.some((r) => r.sender_kind === "admin" || r.sender_kind === "staff");

            return (
              <div key={t.id} className={`rounded-3xl border bg-card shadow-sm overflow-hidden transition-all ${hasAdminReply ? "border-primary/30" : "border-border"}`}>
                {/* Ticket header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : t.id)}
                  className="w-full flex flex-wrap items-center gap-3 p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <LifeBuoy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-black text-foreground">{t.subject}</p>
                      {hasAdminReply && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <MessageSquare className="h-2.5 w-2.5" /> Reply received
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{new Date(t.created_at).toLocaleString()}</span>
                      <span>{ticketReplies.length} reply{ticketReplies.length !== 1 ? "ies" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase inline-flex items-center gap-1 ${PRIORITY_COLORS[t.priority] ?? "bg-muted text-muted-foreground"}`}>
                      {t.priority}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase inline-flex items-center gap-1 ${statusData.cls}`}>
                      <StatusIcon className="h-2.5 w-2.5" /> {statusData.label}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded thread */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-5 space-y-4">
                    {/* Original message */}
                    <div className="flex gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary text-xs font-black">
                        You
                      </div>
                      <div className="flex-1 rounded-2xl rounded-tl-sm border border-border bg-card p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Your Request</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{t.message}</p>
                      </div>
                    </div>

                    {/* Replies thread */}
                    {ticketReplies.map((r) => {
                      const isAdmin = r.sender_kind === "admin" || r.sender_kind === "staff";
                      return (
                        <div key={r.id} className={`flex gap-3 ${isAdmin ? "" : "flex-row-reverse"}`}>
                          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black ${isAdmin ? "bg-indigo-100 text-indigo-700" : "bg-primary/10 text-primary"}`}>
                            {isAdmin ? "AM" : "You"}
                          </div>
                          <div className={`flex-1 rounded-2xl p-4 ${isAdmin ? "rounded-tl-sm bg-indigo-50 border border-indigo-200" : "rounded-tr-sm border border-border bg-card"}`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{isAdmin ? `${r.sender_name} · AM Enterprises` : "You"}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{r.body}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Reply input (only for open tickets) */}
                    {t.status !== "closed" && (
                      <div className="flex gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary text-xs font-black">You</div>
                        <div className="flex-1 flex gap-2">
                          <textarea
                            value={replyDraft[t.id] ?? ""}
                            onChange={(e) => setReplyDraft((d) => ({ ...d, [t.id]: e.target.value }))}
                            placeholder="Type your reply…"
                            rows={2}
                            className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                          />
                          <button
                            onClick={() => sendReply(t.id)}
                            disabled={!replyDraft[t.id]?.trim() || replying === t.id}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                          >
                            {replying === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
