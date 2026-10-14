import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import {
  Download, ReceiptText, CheckCircle2, Clock, AlertCircle,
  DollarSign, CreditCard, Calendar, PlusCircle, Upload,
  X, ImageIcon, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/clients/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Invoices — AM Enterprises Client Portal" },
      { name: "description", content: "Review invoices, payment status and outstanding balance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Billing clientId={client.id} />}</PortalShell>,
});

interface Invoice {
  id: string; number: string; currency: string; total: number; amount_paid: number; status: string;
  due_date: string | null; created_at: string; notes: string | null;
}
interface PaymentTx {
  id: string; invoice_id: string; amount: number; currency: string; gateway: string;
  payment_method: string | null; notes: string | null; proof_url: string | null; paid_at: string | null;
}
interface BillingRequest {
  id: string; title: string; description: string | null; amount: number | null; currency: string;
  attachment_url: string | null; status: string; admin_notes: string | null; created_at: string;
}

function money(currency: string, n: number) {
  return `${currency === "USD" ? "$" : currency === "PKR" ? "Rs " : currency + " "}${Number(n ?? 0).toLocaleString()}`;
}

function statusInfo(inv: Invoice) {
  const due = Number(inv.total ?? 0) - Number(inv.amount_paid ?? 0);
  if (due <= 0) return { label: "Paid", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, dot: "bg-emerald-500" };
  if (inv.status === "overdue") return { label: "Overdue", cls: "bg-red-100 text-red-700", icon: AlertCircle, dot: "bg-red-500" };
  return { label: inv.status.charAt(0).toUpperCase() + inv.status.slice(1), cls: "bg-amber-100 text-amber-700", icon: Clock, dot: "bg-amber-400" };
}

// ─── Billing Request Form ────────────────────────────────────────────────────
function BillingRequestForm({ clientId, onDone }: { clientId: string; onDone: () => void }) {
  const [f, setF] = useState({ title: "", description: "", amount: "", currency: "USD", attachment_url: "" });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadAttachment(file: File) {
    setUploading(true);
    const path = `billing-requests/${clientId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { alert(error.message); setUploading(false); return; }
    const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
    if (data?.signedUrl) setF((p) => ({ ...p, attachment_url: data.signedUrl }));
    setUploading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) return;
    setBusy(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from as any)("client_billing_requests").insert({
      client_id: clientId,
      title: f.title.trim(),
      description: f.description || null,
      amount: f.amount ? parseFloat(f.amount) : null,
      currency: f.currency,
      attachment_url: f.attachment_url || null,
      status: "pending",
    });
    setBusy(false);
    if (error) { alert(error.message); return; }
    onDone();
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-primary/30 bg-primary/5 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display font-black text-foreground">Submit Billing Request</p>
        <button type="button" onClick={onDone}><X className="h-5 w-5 text-muted-foreground" /></button>
      </div>
      <p className="text-xs text-muted-foreground">Submit a billing request or dispute — our team will review and respond.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Subject</label>
          <input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })}
            placeholder="e.g. Payment made — please update status"
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Amount (optional)</label>
          <input type="number" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Currency</label>
          <select value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
            {["USD", "PKR", "GBP", "EUR", "AED"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
          <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })}
            placeholder="Describe your request in detail…"
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
        </div>
        {/* Attachment upload */}
        <div className="sm:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Attachment (payment proof / screenshot)</label>
          <div className="mt-1 flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => { const fl = e.target.files?.[0]; if (fl) uploadAttachment(fl); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-60">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload file
            </button>
            {f.attachment_url && (
              <a href={f.attachment_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline">
                <ImageIcon className="h-3.5 w-3.5" /> Uploaded ✓
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          Submit Request
        </button>
      </div>
    </form>
  );
}

// ─── Main Billing Page ────────────────────────────────────────────────────────
function Billing({ clientId }: { clientId: string }) {
  const { rows, loading } = usePortalRows<Invoice>("invoices", clientId, { orderBy: "created_at" });
  const [payments, setPayments] = useState<PaymentTx[]>([]);
  const [requests, setRequests] = useState<BillingRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Load payment transactions and billing requests
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("payment_transactions")
      .select("*").eq("client_id", clientId).order("created_at", { ascending: false })
      .then(({ data }: { data: PaymentTx[] | null }) => setPayments(data ?? []));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("client_billing_requests")
      .select("*").eq("client_id", clientId).order("created_at", { ascending: false })
      .then(({ data }: { data: BillingRequest[] | null }) => setRequests(data ?? []));
  }, [clientId]);

  function reloadRequests() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("client_billing_requests")
      .select("*").eq("client_id", clientId).order("created_at", { ascending: false })
      .then(({ data }: { data: BillingRequest[] | null }) => setRequests(data ?? []));
  }

  const totalInvoiced = rows.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const totalPaid = rows.reduce((s, i) => s + Number(i.amount_paid ?? 0), 0);
  const totalDue = Math.max(0, totalInvoiced - totalPaid);
  const overdueCount = rows.filter((i) => i.status === "overdue" && Number(i.total) - Number(i.amount_paid) > 0).length;
  const paidPct = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  const months: Record<string, { invoiced: number; paid: number }> = {};
  rows.forEach((inv) => {
    const m = new Date(inv.created_at).toLocaleDateString("en", { month: "short", year: "2-digit" });
    if (!months[m]) months[m] = { invoiced: 0, paid: 0 };
    months[m].invoiced += Number(inv.total ?? 0);
    months[m].paid += Number(inv.amount_paid ?? 0);
  });
  const monthKeys = Object.keys(months).slice(-6);
  const maxVal = Math.max(...monthKeys.map((k) => months[k].invoiced), 1);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Billing & Invoices"
        subtitle="Your complete payment history"
        right={
          <button onClick={() => setShowRequestForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 transition-colors">
            <PlusCircle className="h-4 w-4" /> Submit Billing Request
          </button>
        }
      />

      {/* Billing request form */}
      {showRequestForm && (
        <BillingRequestForm clientId={clientId} onDone={() => {
          setShowRequestForm(false);
          reloadRequests();
        }} />
      )}

      {/* My billing requests */}
      {requests.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">My Billing Requests</p>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className={`rounded-2xl border p-4 ${req.status === "approved" ? "border-emerald-200 bg-emerald-50" : req.status === "rejected" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{req.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${req.status === "approved" ? "bg-emerald-100 text-emerald-700" : req.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{req.status}</span>
                    </div>
                    {req.description && <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>}
                    {req.amount && <p className="text-sm font-black text-foreground mt-1">{req.currency} {Number(req.amount).toLocaleString()}</p>}
                    {req.admin_notes && <p className="text-xs text-muted-foreground mt-1 italic">Team note: {req.admin_notes}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(req.created_at).toLocaleString()}</p>
                  </div>
                  {req.attachment_url && (
                    <a href={req.attachment_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] font-bold text-foreground hover:bg-muted">
                      <ImageIcon className="h-3 w-3" /> Attachment
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Invoiced", val: money("USD", totalInvoiced), icon: ReceiptText, color: "bg-gradient-to-br from-indigo-500 to-indigo-700", sub: `${rows.length} invoice${rows.length !== 1 ? "s" : ""}` },
          { label: "Amount Paid", val: money("USD", totalPaid), icon: CheckCircle2, color: "bg-gradient-to-br from-emerald-500 to-teal-600", sub: `${paidPct}% of total` },
          { label: "Outstanding", val: money("USD", totalDue), icon: DollarSign, color: totalDue > 0 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-emerald-500 to-teal-600", sub: totalDue > 0 ? "Due now" : "All clear ✓" },
          { label: "Overdue", val: String(overdueCount), icon: AlertCircle, color: overdueCount > 0 ? "bg-gradient-to-br from-red-500 to-rose-700" : "bg-gradient-to-br from-slate-500 to-slate-700", sub: overdueCount > 0 ? "Needs attention" : "None overdue" },
        ].map(({ label, val, icon: Icon, color, sub }) => (
          <div key={label} className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-lg ${color}`}>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="relative">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/20"><Icon className="h-5 w-5" /></div>
              <p className="text-2xl font-black">{val}</p>
              <p className="text-xs font-semibold text-white/80 mt-0.5">{label}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice list */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted"><ReceiptText className="h-8 w-8 text-muted-foreground/50" /></div>
              <p className="font-display text-lg font-black text-foreground">No invoices yet</p>
              <p className="text-sm text-muted-foreground">Invoices from AM Enterprises will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((inv) => {
                const { label, cls, icon: Icon, dot } = statusInfo(inv);
                const balance = Number(inv.total ?? 0) - Number(inv.amount_paid ?? 0);
                const pct = Number(inv.total) > 0 ? Math.min(100, (Number(inv.amount_paid) / Number(inv.total)) * 100) : 0;
                const invPayments = payments.filter((p) => p.invoice_id === inv.id);
                return (
                  <div key={inv.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                    <div className="px-5 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 shrink-0 rounded-full mt-1 ${dot}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-display font-black text-foreground">#{inv.number}</p>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase inline-flex items-center gap-1 ${cls}`}>
                                <Icon className="h-2.5 w-2.5" /> {label}
                              </span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Issued {new Date(inv.created_at).toLocaleDateString()}</span>
                              {inv.due_date && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Due {new Date(inv.due_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-foreground text-base">{money(inv.currency, inv.total)}</p>
                          {balance > 0 && <p className="text-xs text-amber-600 font-semibold">Remaining: {money(inv.currency, balance)}</p>}
                          {balance <= 0 && <p className="text-xs text-emerald-600 font-semibold">Fully paid ✓</p>}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">{Math.round(pct)}% paid</span>
                        <button onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] font-bold text-foreground hover:bg-muted">
                          <Download className="h-3 w-3" /> PDF
                        </button>
                      </div>
                      {inv.notes && <p className="mt-2 text-xs text-muted-foreground italic">{inv.notes}</p>}
                    </div>

                    {/* Payment proofs */}
                    {invPayments.length > 0 && (
                      <div className="border-t border-emerald-100 bg-emerald-50/40 px-5 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-2">Payments Received</p>
                        <div className="space-y-1.5">
                          {invPayments.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white border border-emerald-200/60 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-foreground">{money(tx.currency, tx.amount)} received</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {tx.gateway.replace("_", " ")}
                                    {tx.payment_method ? ` · ${tx.payment_method}` : ""}
                                    {tx.paid_at ? ` · ${new Date(tx.paid_at).toLocaleDateString()}` : ""}
                                  </p>
                                  {tx.notes && <p className="text-[10px] text-muted-foreground italic">{tx.notes}</p>}
                                </div>
                              </div>
                              {tx.proof_url && (
                                <a href={tx.proof_url} target="_blank" rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-200">
                                  <ImageIcon className="h-3 w-3" /> Proof
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Payment progress ring */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Payment Progress</p>
            <div className="flex items-center justify-center my-2">
              <div className="relative">
                <svg width={120} height={120} className="-rotate-90">
                  <circle cx={60} cy={60} r={50} strokeWidth={10} stroke="#e5e7eb" fill="none" />
                  <circle cx={60} cy={60} r={50} strokeWidth={10}
                    stroke={paidPct >= 100 ? "#10b981" : "#6366f1"} fill="none"
                    strokeDasharray={`${(paidPct / 100) * 314} 314`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">{paidPct}%</span>
                  <span className="text-[10px] text-muted-foreground">paid</span>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-sm font-black text-emerald-700">${totalPaid.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Paid</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <p className="text-sm font-black text-amber-700">${totalDue.toLocaleString()}</p>
                <p className="text-[10px] text-amber-600 font-semibold">Pending</p>
              </div>
            </div>
          </div>

          {/* Monthly bar chart */}
          {monthKeys.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Monthly Invoicing</p>
              <div className="flex items-end gap-2 h-16">
                {monthKeys.map((k) => (
                  <div key={k} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm bg-indigo-400 mt-auto" style={{ height: `${Math.max(4, (months[k].invoiced / maxVal) * 56)}px` }} />
                    <span className="text-[9px] text-muted-foreground font-semibold">{k}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment methods */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Need to Pay?</p>
            <p className="text-xs text-muted-foreground mb-3">Submit a billing request above or contact our team directly.</p>
            <div className="flex flex-wrap gap-2">
              {["Bank Transfer", "Credit Card", "PayPal", "Crypto"].map((m) => (
                <span key={m} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground">
                  <CreditCard className="h-3 w-3" /> {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
