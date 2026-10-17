import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import {
  Download, ReceiptText, CheckCircle2, Clock, AlertCircle,
  DollarSign, CreditCard, Calendar, PlusCircle, Upload,
  X, ImageIcon, Loader2, Eye, ShieldCheck, Copy, Check,
} from "lucide-react";
import { InvoiceModal } from "@/components/portal/InvoiceModal";
import { type InvoiceData, type InvoiceItem } from "@/components/portal/InvoiceDocument";

export const Route = createFileRoute("/clients/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Invoices — AM Enterprises Client Portal" },
      { name: "description", content: "Review official invoices, payment status, bank instructions and outstanding balance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PortalShell>
      {(client) => (
        <Billing
          clientId={client.id}
          clientName={client.name}
          clientCompany={client.company}
          clientEmail={client.email}
          clientPhone={client.phone}
        />
      )}
    </PortalShell>
  ),
});

interface Invoice {
  id: string;
  number: string;
  currency: string;
  subtotal?: number;
  tax?: number;
  total: number;
  amount_paid: number;
  status: string;
  due_date: string | null;
  created_at: string;
  notes: string | null;
  items?: InvoiceItem[] | null;
  client_name?: string;
  client_email?: string;
}

interface PaymentTx {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  gateway: string;
  payment_method: string | null;
  notes: string | null;
  proof_url: string | null;
  paid_at: string | null;
}

interface BillingRequest {
  id: string;
  title: string;
  description: string | null;
  amount: number | null;
  currency: string;
  attachment_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

function money(currency: string, n: number) {
  const sym = currency === "USD" ? "$" : currency === "PKR" ? "Rs " : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  return `${sym}${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusInfo(inv: Invoice) {
  const due = Number(inv.total ?? 0) - Number(inv.amount_paid ?? 0);
  if (due <= 0 || inv.status === "paid") {
    return { label: "Paid", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-500" };
  }
  if (inv.status === "overdue") {
    return { label: "Overdue", cls: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, dot: "bg-red-500" };
  }
  return { label: inv.status.charAt(0).toUpperCase() + inv.status.slice(1), cls: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, dot: "bg-amber-400" };
}

// ─── Billing Request Form ────────────────────────────────────────────────────
function BillingRequestForm({
  clientId,
  initialTitle,
  initialAmount,
  onDone,
}: {
  clientId: string;
  initialTitle?: string;
  initialAmount?: string;
  onDone: () => void;
}) {
  const [f, setF] = useState({
    title: initialTitle || "",
    description: "",
    amount: initialAmount || "",
    currency: "USD",
    attachment_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadAttachment(file: File) {
    setUploading(true);
    const path = `billing-requests/${clientId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }
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
    if (error) {
      alert(error.message);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-black text-foreground text-base">Submit Payment Proof / Billing Request</p>
          <p className="text-xs text-muted-foreground mt-0.5">Attach your bank transfer slip, wire receipt, or request an adjustment.</p>
        </div>
        <button type="button" onClick={onDone} className="rounded-full p-1.5 hover:bg-muted text-muted-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Invoice Reference / Subject</label>
          <input
            required
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            placeholder="e.g. Paid Invoice #AM-INV-1001 via Wire Transfer"
            className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount Paid</label>
          <input
            type="number"
            step="0.01"
            value={f.amount}
            onChange={(e) => setF({ ...f, amount: e.target.value })}
            placeholder="0.00"
            className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Currency</label>
          <select
            value={f.currency}
            onChange={(e) => setF({ ...f, currency: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          >
            {["USD", "PKR", "GBP", "EUR", "AED"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment Details / Transaction ID</label>
          <textarea
            rows={2}
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
            placeholder="Transaction ID, sending bank name, or any billing notes..."
            className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Attachment upload */}
        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Attachment (Transfer Receipt / Screenshot)</label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const fl = e.target.files?.[0];
                if (fl) uploadAttachment(fl);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-60 shadow-sm"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4 text-primary" />}
              {uploading ? "Uploading receipt..." : "Upload Payment Receipt"}
            </button>
            {f.attachment_url && (
              <a
                href={f.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"
              >
                <CheckCircle2 className="h-4 w-4" /> Receipt Uploaded (Click to view)
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={busy || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          Submit Proof to Accounts
        </button>
      </div>
    </form>
  );
}

// ─── Main Billing Page ────────────────────────────────────────────────────────
function Billing({
  clientId,
  clientName,
  clientCompany,
  clientEmail,
  clientPhone,
}: {
  clientId: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
}) {
  const { rows, loading } = usePortalRows<Invoice>("invoices", clientId, { orderBy: "created_at" });
  const [payments, setPayments] = useState<PaymentTx[]>([]);
  const [requests, setRequests] = useState<BillingRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestPrefill, setRequestPrefill] = useState<{ title?: string; amount?: string }>({});
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // Load payment transactions and billing requests
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("payment_transactions")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: PaymentTx[] | null }) => setPayments(data ?? []));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("client_billing_requests")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: BillingRequest[] | null }) => setRequests(data ?? []));
  }, [clientId]);

  function reloadRequests() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("client_billing_requests")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: BillingRequest[] | null }) => setRequests(data ?? []));
  }

  const totalInvoiced = rows.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const totalPaid = rows.reduce((s, i) => s + Number(i.amount_paid ?? 0), 0);
  const totalDue = Math.max(0, totalInvoiced - totalPaid);
  const overdueCount = rows.filter((i) => i.status === "overdue" && Number(i.total) - Number(i.amount_paid) > 0).length;
  const paidPct = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  function toInvoiceData(inv: Invoice): InvoiceData {
    return {
      id: inv.id,
      number: inv.number,
      client_name: inv.client_name || clientName,
      client_company: clientCompany || undefined,
      client_email: inv.client_email || clientEmail || undefined,
      client_phone: clientPhone || undefined,
      currency: inv.currency || "USD",
      items: inv.items || undefined,
      subtotal: inv.subtotal,
      tax: inv.tax,
      total: Number(inv.total || 0),
      amount_paid: Number(inv.amount_paid || 0),
      status: inv.status,
      due_date: inv.due_date,
      created_at: inv.created_at,
      notes: inv.notes,
    };
  }

  function handlePayInvoice(invData: InvoiceData) {
    const due = Number(invData.total || 0) - Number(invData.amount_paid || 0);
    setRequestPrefill({
      title: `Payment for Invoice #${invData.number}`,
      amount: due > 0 ? String(due) : String(invData.total),
    });
    setSelectedInvoice(null);
    setShowRequestForm(true);
  }

  function copyBankDetails() {
    const text = `AM Enterprises Bank Wire:\nBank: Standard Chartered Bank\nAccount Title: AM ENTERPRISES\nIBAN / Account: PK89SCBL0000001122334455\nSWIFT / BIC: SCBLPKKA\nRef: [Your Invoice Number]`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 3000);
  }

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Billing & Official Invoices"
        subtitle="Manage your payments, official pixel-perfect tax invoices and payment proofs."
        right={
          <button
            onClick={() => {
              setRequestPrefill({});
              setShowRequestForm((v) => !v);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary/5 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
          >
            <PlusCircle className="h-4 w-4" /> Submit Payment Proof
          </button>
        }
      />

      {/* Billing request form */}
      {showRequestForm && (
        <BillingRequestForm
          clientId={clientId}
          initialTitle={requestPrefill.title}
          initialAmount={requestPrefill.amount}
          onDone={() => {
            setShowRequestForm(false);
            reloadRequests();
          }}
        />
      )}

      {/* Summary cards with brand palette */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Invoiced",
            val: money("USD", totalInvoiced),
            icon: ReceiptText,
            iconBg: "bg-[#E5F3FA]",
            iconColor: "text-[#85BBD6]",
            sub: `${rows.length} invoice${rows.length !== 1 ? "s" : ""}`,
          },
          {
            label: "Total Settled",
            val: money("USD", totalPaid),
            icon: CheckCircle2,
            iconBg: "bg-[#FAFAF8]",
            iconColor: "text-[#638D79]",
            sub: `${paidPct}% paid off`,
          },
          {
            label: "Balance Due",
            val: money("USD", totalDue),
            icon: DollarSign,
            iconBg: "bg-[#F8E8EF]",
            iconColor: "text-[#D9A7BC]",
            sub: totalDue > 0 ? "Pending wire settlement" : "All settled ✓",
          },
          {
            label: "Audit Status",
            val: overdueCount > 0 ? `${overdueCount} Pending` : "Current",
            icon: ShieldCheck,
            iconBg: "bg-[#E5F3FA]",
            iconColor: "text-[#85BBD6]",
            sub: overdueCount > 0 ? "Review payment terms" : "Verified",
          },
        ].map(({ label, val, icon: Icon, iconBg, iconColor, sub }) => (
          <div key={label} className="rounded-2xl border border-[#ECEBE8] bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold font-heading text-[#24262B]">{val}</p>
              <p className="text-xs font-medium text-[#85858D] mt-0.5">{label}</p>
              <p className="text-[11px] text-[#85858D] mt-1">{sub}</p>
            </div>
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${iconBg} ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice list (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-foreground">Official Invoices</h2>
            <span className="text-xs text-muted-foreground">{rows.length} generated</span>
          </div>

          {loading ? (
            <div className="grid place-items-center py-16 rounded-3xl border border-border bg-card">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <ReceiptText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-display text-lg font-black text-foreground">No invoices generated yet</p>
              <p className="text-sm text-muted-foreground">Invoices from the AM Accounts team will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {rows.map((inv) => {
                const { label, cls, icon: Icon, dot } = statusInfo(inv);
                const balance = Number(inv.total ?? 0) - Number(inv.amount_paid ?? 0);
                const pct = Number(inv.total) > 0 ? Math.min(100, (Number(inv.amount_paid) / Number(inv.total)) * 100) : 0;
                const invPayments = payments.filter((p) => p.invoice_id === inv.id);

                return (
                  <div key={inv.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all">
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-3 w-3 shrink-0 rounded-full mt-1.5 ${dot}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-display font-black text-foreground text-base">#{inv.number}</p>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase inline-flex items-center gap-1 border ${cls}`}>
                                <Icon className="h-3 w-3" /> {label}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Issued {new Date(inv.created_at).toLocaleDateString()}
                              </span>
                              {inv.due_date && (
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Due {new Date(inv.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-foreground text-lg">{money(inv.currency, inv.total)}</p>
                          {balance > 0 ? (
                            <p className="text-xs text-amber-600 font-bold">Due: {money(inv.currency, balance)}</p>
                          ) : (
                            <p className="text-xs text-emerald-600 font-bold">Settled in full ✓</p>
                          )}
                        </div>
                      </div>

                      {/* Payment progress bar */}
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground shrink-0">{Math.round(pct)}% paid</span>
                      </div>

                      {inv.notes && (
                        <p className="mt-3 text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/50">
                          {inv.notes}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(toInvoiceData(inv))}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Official Invoice
                          </button>
                          <button
                            onClick={() => setSelectedInvoice(toInvoiceData(inv))}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground" /> PDF / Print
                          </button>
                        </div>

                        {balance > 0 && (
                          <button
                            onClick={() => {
                              setRequestPrefill({
                                title: `Payment for Invoice #${inv.number}`,
                                amount: String(balance),
                              });
                              setShowRequestForm(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                          >
                            <CreditCard className="h-3.5 w-3.5" /> Submit Proof
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payment transaction history for this invoice */}
                    {invPayments.length > 0 && (
                      <div className="border-t border-emerald-100 bg-emerald-50/40 px-6 py-3.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-2">Verified Receipts</p>
                        <div className="space-y-2">
                          {invPayments.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-white border border-emerald-200/60 p-3 shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-foreground">{money(tx.currency, tx.amount)} confirmed</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {tx.gateway.replace("_", " ")}
                                    {tx.payment_method ? ` · ${tx.payment_method}` : ""}
                                    {tx.paid_at ? ` · ${new Date(tx.paid_at).toLocaleDateString()}` : ""}
                                  </p>
                                </div>
                              </div>
                              {tx.proof_url && (
                                <a
                                  href={tx.proof_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-200 transition-colors"
                                >
                                  <ImageIcon className="h-3.5 w-3.5" /> Receipt Slip
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

          {/* Submitted billing requests */}
          {requests.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">My Submitted Payment Requests</p>
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={`rounded-2xl border p-4 ${
                      req.status === "approved"
                        ? "border-emerald-200 bg-emerald-50"
                        : req.status === "rejected"
                        ? "border-red-200 bg-red-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground text-sm">{req.title}</p>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              req.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : req.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        {req.description && <p className="text-xs text-muted-foreground mt-1">{req.description}</p>}
                        {req.amount && <p className="text-sm font-black text-foreground mt-1">{req.currency} {Number(req.amount).toLocaleString()}</p>}
                        {req.admin_notes && <p className="text-xs text-muted-foreground mt-1 italic">AM Accounts feedback: {req.admin_notes}</p>}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(req.created_at).toLocaleString()}</p>
                      </div>
                      {req.attachment_url && (
                        <a
                          href={req.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                        >
                          <ImageIcon className="h-3.5 w-3.5 text-primary" /> View Slip
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (1 col) */}
        <div className="space-y-5">
          {/* Official Bank Transfer Details Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-display font-black text-foreground text-sm">Official Bank Wire</h3>
              </div>
              <button
                onClick={copyBankDetails}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                {copiedBank ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copiedBank ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 space-y-2 text-xs leading-relaxed font-mono">
              <div>
                <span className="text-muted-foreground text-[10px] block font-sans uppercase font-bold">Account Name</span>
                <span className="font-bold text-foreground">AM ENTERPRISES</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block font-sans uppercase font-bold">Bank Name</span>
                <span className="font-semibold text-foreground">Standard Chartered Bank</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block font-sans uppercase font-bold">IBAN / Account Number</span>
                <span className="font-bold text-foreground select-all">PK89SCBL0000001122334455</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block font-sans uppercase font-bold">SWIFT / BIC</span>
                <span className="font-semibold text-foreground select-all">SCBLPKKA</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground leading-normal">
              After transferring funds, kindly submit your receipt slip above for instant automated matching.
            </p>
          </div>

          {/* Payment gateways list */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display font-black text-foreground text-sm mb-2">Accepted Payment Channels</h3>
            <p className="text-xs text-muted-foreground mb-4">We support multi-currency international wire and digital transfers.</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                { name: "Bank Wire (USD/PKR)", tag: "Zero Fee" },
                { name: "Stripe / Credit Card", tag: "Instant" },
                { name: "PayPal International", tag: "Active" },
                { name: "USDT / Crypto (TRC20)", tag: "Available" },
              ].map((m) => (
                <div key={m.name} className="rounded-2xl border border-border p-3 bg-muted/20">
                  <p className="font-bold text-foreground text-xs leading-tight">{m.name}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-primary">{m.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official Pixel-by-Pixel Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPay={handlePayInvoice}
        />
      )}
    </div>
  );
}
