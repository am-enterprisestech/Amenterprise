import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Send, Bell, Edit2, Save, X, Upload, DollarSign, CheckCircle2, Clock, AlertCircle, Receipt, ImageIcon } from "lucide-react";

export const input = "w-full rounded-xl border border-espresso/12 bg-sand/40 px-3 py-2.5 text-sm outline-none focus:border-cocoa focus:bg-white";
export const label = "text-[10px] font-semibold uppercase tracking-widest text-espresso/60";
export function useTable<T extends { id: string }>(table: string, clientId: string, orderBy = "created_at") {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)(table).select("*").eq("client_id", clientId).order(orderBy, { ascending: false });
    setRows((data as T[]) ?? []);
    setLoading(false);
  }, [table, clientId, orderBy]);
  useEffect(() => { load(); }, [load]);
  return { rows, loading, reload: load };
}

export async function insertRow(table: string, payload: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)(table).insert(payload);
  if (error) alert(error.message);
  return !error;
}

export async function deleteRow(table: string, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)(table).delete().eq("id", id);
  if (error) alert(error.message);
}

export function Row({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-espresso/10 bg-sand/30 p-4">
      <div className="min-w-0 flex-1">{children}</div>
      <button onClick={onDelete} className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export function TasksTab({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = useTable<{ id: string; title: string; status: string; priority: string; assignee: string | null; due_date: string | null }>("client_tasks", clientId);
  const [f, setF] = useState({ title: "", description: "", status: "todo", priority: "medium", assignee: "", due_date: "", progress: 0 });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4 sm:grid-cols-2"
        onSubmit={async (e) => { e.preventDefault(); const ok = await insertRow("client_tasks", { client_id: clientId, ...f, due_date: f.due_date || null, assignee: f.assignee || null }); if (ok) { setF({ ...f, title: "", description: "" }); reload(); } }}>
        <div className="sm:col-span-2"><label className={label}>Task title</label><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div className="sm:col-span-2"><label className={label}>Description</label><textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Status</label><select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={`mt-1 ${input}`}>{["todo", "in_progress", "review", "done"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className={label}>Priority</label><select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} className={`mt-1 ${input}`}>{["low", "medium", "high", "urgent"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className={label}>Assignee</label><input value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Due date</label><input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div className="sm:col-span-2"><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Add task</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((t) => (
        <Row key={t.id} onDelete={async () => { await deleteRow("client_tasks", t.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{t.title}</p>
          <p className="text-xs text-foreground/60">{t.status} · {t.priority}{t.assignee ? ` · ${t.assignee}` : ""}{t.due_date ? ` · due ${t.due_date}` : ""}</p>
        </Row>
      ))}
    </div>
  );
}

export function MessagesTab({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = useTable<{ id: string; subject: string; body: string; is_read: boolean; created_at: string }>("client_messages", clientId);
  const [f, setF] = useState({ subject: "", body: "", important: false });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4"
        onSubmit={async (e) => { e.preventDefault(); const ok = await insertRow("client_messages", { client_id: clientId, ...f }); if (ok) { setF({ subject: "", body: "", important: false }); reload(); await insertRow("client_notifications", { client_id: clientId, title: "New message", body: f.subject, kind: "info", link: "/clients/messages" }); } }}>
        <div><label className={label}>Subject</label><input required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Message</label><textarea required rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={`mt-1 ${input}`} /></div>
        <label className="flex items-center gap-2 text-xs font-semibold text-espresso/80"><input type="checkbox" checked={f.important} onChange={(e) => setF({ ...f, important: e.target.checked })} /> Mark important</label>
        <div><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Send className="h-3.5 w-3.5" /> Send message</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((m) => (
        <Row key={m.id} onDelete={async () => { await deleteRow("client_messages", m.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{m.subject} {!m.is_read && <span className="ml-1 rounded-full bg-espresso px-2 py-0.5 text-[9px] uppercase text-white">unread</span>}</p>
          <p className="whitespace-pre-wrap text-xs text-foreground/60">{m.body}</p>
        </Row>
      ))}
    </div>
  );
}

export function NotificationsTab({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = useTable<{ id: string; title: string; body: string | null; kind: string; is_read: boolean }>("client_notifications", clientId);
  const [f, setF] = useState({ title: "", body: "", kind: "info" });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4"
        onSubmit={async (e) => { e.preventDefault(); const ok = await insertRow("client_notifications", { client_id: clientId, ...f }); if (ok) { setF({ title: "", body: "", kind: "info" }); reload(); } }}>
        <div><label className={label}>Title</label><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Body</label><input value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Type</label><select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={`mt-1 ${input}`}>{["info", "success", "warning"].map((k) => <option key={k}>{k}</option>)}</select></div>
        <div><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Bell className="h-3.5 w-3.5" /> Send notification</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((n) => (
        <Row key={n.id} onDelete={async () => { await deleteRow("client_notifications", n.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{n.title}</p>
          <p className="text-xs text-foreground/60">{n.body} · {n.kind} · {n.is_read ? "read" : "unread"}</p>
        </Row>
      ))}
    </div>
  );
}

export function DocumentsTab({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = useTable<{ id: string; name: string; url: string; file_type: string | null }>("client_documents", clientId);
  const [f, setF] = useState({ name: "", description: "", url: "", file_type: "" });
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `client-docs/${clientId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const { data, error: signErr } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
      if (signErr || !data?.signedUrl) throw signErr ?? new Error("Could not sign URL");
      setF((p) => ({ ...p, name: p.name || file.name, url: data.signedUrl, file_type: ext.toUpperCase() }));
    } catch (e) { alert((e as Error).message); }
    finally { setUploading(false); }
  }

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4"
        onSubmit={async (e) => { e.preventDefault(); if (!f.url) { alert("Upload a file or paste a URL first."); return; } const ok = await insertRow("client_documents", { client_id: clientId, ...f, description: f.description || null }); if (ok) { setF({ name: "", description: "", url: "", file_type: "" }); reload(); } }}>
        <div><label className={label}>File</label>
          <input type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); }} className={`mt-1 ${input}`} />
          {uploading && <p className="mt-1 text-xs text-foreground/60">Uploading…</p>}
        </div>
        <div><label className={label}>Display name</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Description</label><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>URL</label><input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="uploaded or external link" className={`mt-1 ${input}`} /></div>
        <div><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Share document</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((d) => (
        <Row key={d.id} onDelete={async () => { await deleteRow("client_documents", d.id); reload(); }}>
          <a href={d.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-espresso underline">{d.name}</a>
          <p className="text-xs text-foreground/60">{d.file_type}</p>
        </Row>
      ))}
    </div>
  );
}

export function SupportTab({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = useTable<{ id: string; subject: string; message: string; status: string; priority: string; reply: string | null }>("support_requests", clientId);

  return (
    <div className="space-y-4">
      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.length === 0 ? (
        <p className="rounded-2xl border border-espresso/10 p-8 text-center text-sm text-foreground/50">No support requests.</p>
      ) : rows.map((t) => (
        <Row key={t.id} onDelete={async () => { await deleteRow("support_requests", t.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{t.subject} <span className="ml-1 text-[10px] uppercase text-foreground/50">{t.status} · {t.priority}</span></p>
          <p className="whitespace-pre-wrap text-xs text-foreground/60">{t.message}</p>
          <div className="mt-2 flex gap-2">
            <input defaultValue={t.reply ?? ""} placeholder="Write a reply…" className={input}
              onBlur={async (e) => { if (e.target.value !== (t.reply ?? "")) { await supabase.from("support_requests").update({ reply: e.target.value }).eq("id", t.id); reload(); } }} />
            <button onClick={async () => { await supabase.from("support_requests").update({ status: t.status === "resolved" ? "open" : "resolved" }).eq("id", t.id); reload(); }}
              className="shrink-0 rounded-full border border-espresso/15 px-3 py-2 text-xs font-bold text-espresso hover:bg-white">
              {t.status === "resolved" ? "Reopen" : "Resolve"}
            </button>
          </div>
        </Row>
      ))}
    </div>
  );
}

export function ProjectsTab({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = useTable<{ id: string; title: string; status: string; progress: number; due_date: string | null }>("projects", clientId);
  const [f, setF] = useState({ title: "", service: "", status: "active", progress: 0, due_date: "", budget_usd: 0, summary: "" });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4 sm:grid-cols-2"
        onSubmit={async (e) => { e.preventDefault(); const ok = await insertRow("projects", { client_id: clientId, ...f, due_date: f.due_date || null }); if (ok) { setF({ ...f, title: "", summary: "" }); reload(); } }}>
        <div className="sm:col-span-2"><label className={label}>Project title</label><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Service</label><input value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Status</label><select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={`mt-1 ${input}`}>{["planning", "active", "on_hold", "completed"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className={label}>Progress %</label><input type="number" min={0} max={100} value={f.progress} onChange={(e) => setF({ ...f, progress: Number(e.target.value) })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Due date</label><input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div className="sm:col-span-2"><label className={label}>Summary</label><textarea rows={2} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div className="sm:col-span-2"><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Add project</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((p) => (
        <Row key={p.id} onDelete={async () => { await deleteRow("projects", p.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{p.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <input type="range" min={0} max={100} defaultValue={p.progress}
              onMouseUp={async (e) => { await supabase.from("projects").update({ progress: Number((e.target as HTMLInputElement).value) }).eq("id", p.id); reload(); }}
              className="w-40" />
            <span className="text-xs text-foreground/60">{p.progress}% · {p.status}</span>
          </div>
        </Row>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICES TAB — Full CRUD with line items, payment recording, payment proof
// ─────────────────────────────────────────────────────────────────────────────

interface InvoiceRow {
  id: string; number: string; currency: string; total: number; amount_paid: number;
  status: string; due_date: string | null; notes: string | null; created_at: string;
}
interface PaymentTx {
  id: string; invoice_id: string; amount: number; currency: string; gateway: string;
  payment_method: string | null; notes: string | null; proof_url: string | null; paid_at: string | null; created_at: string;
}

const CURRENCIES = ["USD", "PKR", "GBP", "EUR", "AED", "SAR"];

function money(cur: string, n: number) {
  return `${cur === "USD" ? "$" : cur === "PKR" ? "Rs " : cur + " "}${Number(n ?? 0).toLocaleString()}`;
}

function invStatusMeta(inv: InvoiceRow) {
  const due = Number(inv.total) - Number(inv.amount_paid);
  if (due <= 0) return { label: "Paid", cls: "bg-emerald-100 text-emerald-700" };
  if (inv.status === "overdue") return { label: "Overdue", cls: "bg-red-100 text-red-700" };
  if (Number(inv.amount_paid) > 0) return { label: "Partial", cls: "bg-amber-100 text-amber-700" };
  return { label: "Pending", cls: "bg-slate-100 text-slate-600" };
}

export function InvoicesTab({ clientId, clientName }: { clientId: string; clientName?: string }) {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [payments, setPayments] = useState<PaymentTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);     // invoice id being edited
  const [payingFor, setPayingFor] = useState<string | null>(null); // invoice id for new payment
  const [showForm, setShowForm] = useState(false);
  const [proofUploading, setProofUploading] = useState(false);
  const proofRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    number: "", currency: "USD", total: "", due_date: "", notes: "", status: "pending",
  });
  const [payForm, setPayForm] = useState({
    amount: "", gateway: "manual", payment_method: "", notes: "", proof_url: "", paid_at: new Date().toISOString().slice(0, 10),
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: inv }, { data: tx }] = await Promise.all([
      supabase.from("invoices").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from as any)("payment_transactions").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    ]);
    setRows((inv as InvoiceRow[]) ?? []);
    setPayments((tx as PaymentTx[]) ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!form.number.trim() || !form.total) return;
    const { error } = await supabase.from("invoices").insert({
      client_id: clientId,
      client_name: clientName || "Client",
      number: form.number.trim(),
      currency: form.currency,
      total: parseFloat(form.total),
      amount_paid: 0,
      status: form.status,
      due_date: form.due_date || null,
      notes: form.notes || null,
      share_token: crypto.randomUUID(),
    });
    if (error) { alert(error.message); return; }
    // Notify client
    await insertRow("client_notifications", {
      client_id: clientId,
      title: `New invoice #${form.number.trim()}`,
      body: `Amount: ${money(form.currency, parseFloat(form.total))}${form.due_date ? ` · Due ${form.due_date}` : ""}`,
      kind: "invoice",
      link: "/clients/billing",
    });
    setForm({ number: "", currency: "USD", total: "", due_date: "", notes: "", status: "pending" });
    setShowForm(false);
    load();
  }

  async function saveEdit(inv: InvoiceRow, patch: Partial<InvoiceRow>) {
    await supabase.from("invoices").update(patch).eq("id", inv.id);
    setEditing(null);
    load();
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice and all its payments?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("payment_transactions").delete().eq("invoice_id", id);
    await supabase.from("invoices").delete().eq("id", id);
    load();
  }

  async function uploadProof(file: File) {
    setProofUploading(true);
    const path = `payment-proofs/${clientId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { alert(error.message); setProofUploading(false); return; }
    const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
    if (data?.signedUrl) setPayForm((p) => ({ ...p, proof_url: data.signedUrl }));
    setProofUploading(false);
  }

  async function recordPayment(inv: InvoiceRow, e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("payment_transactions").insert({
      invoice_id: inv.id,
      client_id: clientId,
      amount: amt,
      currency: inv.currency,
      gateway: payForm.gateway,
      payment_method: payForm.payment_method || null,
      notes: payForm.notes || null,
      proof_url: payForm.proof_url || null,
      status: "completed",
      paid_at: payForm.paid_at ? new Date(payForm.paid_at).toISOString() : new Date().toISOString(),
    });
    const newPaid = Number(inv.amount_paid) + amt;
    const newStatus = newPaid >= Number(inv.total) ? "paid" : "partial";
    await supabase.from("invoices").update({ amount_paid: newPaid, status: newStatus }).eq("id", inv.id);
    // Notify client
    await insertRow("client_notifications", {
      client_id: clientId,
      title: `Payment received: ${money(inv.currency, amt)}`,
      body: `Invoice #${inv.number} · ${payForm.payment_method || payForm.gateway}`,
      kind: "success",
      link: "/clients/billing",
    });
    setPayingFor(null);
    setPayForm({ amount: "", gateway: "manual", payment_method: "", notes: "", proof_url: "", paid_at: new Date().toISOString().slice(0, 10) });
    load();
  }

  const totalInvoiced = rows.reduce((s, r) => s + Number(r.total ?? 0), 0);
  const totalPaid = rows.reduce((s, r) => s + Number(r.amount_paid ?? 0), 0);
  const totalDue = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Invoiced", val: money("USD", totalInvoiced), cls: "bg-indigo-50 border-indigo-200 text-indigo-700", icon: Receipt },
          { label: "Collected",      val: money("USD", totalPaid),     cls: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: CheckCircle2 },
          { label: "Outstanding",    val: money("USD", totalDue),      cls: totalDue > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700", icon: DollarSign },
        ].map(({ label, val, cls, icon: Icon }) => (
          <div key={label} className={`flex items-center gap-3 rounded-2xl border p-3 ${cls}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <div><p className="text-base font-black">{val}</p><p className="text-[10px] font-semibold uppercase">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Add invoice button */}
      <div className="flex justify-between items-center">
        <p className="text-xs font-black uppercase tracking-widest text-espresso/60">{rows.length} invoice{rows.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white hover:bg-cocoa">
          <Plus className="h-3.5 w-3.5" /> {showForm ? "Cancel" : "New Invoice"}
        </button>
      </div>

      {/* Create invoice form */}
      {showForm && (
        <form onSubmit={createInvoice} className="grid gap-3 rounded-2xl border border-espresso/15 bg-sand/30 p-5 sm:grid-cols-2">
          <p className="sm:col-span-2 text-sm font-black text-espresso">New Invoice</p>
          <div><label className={label}>Invoice number</label><input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="AM-1001" className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Currency</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={`mt-1 ${input}`}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className={label}>Total amount</label><input required type="number" min="0" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={`mt-1 ${input}`}>
              {["pending", "partial", "paid", "overdue", "cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={label}>Due date</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Notes</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-espresso/20 px-4 py-2 text-xs font-bold text-espresso">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Create Invoice</button>
          </div>
        </form>
      )}

      {/* Invoice list */}
      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-espresso/20 p-8 text-center">
          <Receipt className="mx-auto h-8 w-8 text-espresso/20 mb-2" />
          <p className="text-sm text-espresso/50">No invoices yet. Create the first one above.</p>
        </div>
      ) : rows.map((inv) => {
        const { label: statusLabel, cls: statusCls } = invStatusMeta(inv);
        const invPayments = payments.filter((p) => p.invoice_id === inv.id);
        const balance = Number(inv.total) - Number(inv.amount_paid);
        const pct = Number(inv.total) > 0 ? Math.min(100, (Number(inv.amount_paid) / Number(inv.total)) * 100) : 0;
        const isEditing = editing === inv.id;
        const isPaying = payingFor === inv.id;

        return (
          <div key={inv.id} className="rounded-2xl border border-espresso/10 bg-white overflow-hidden shadow-sm">
            {/* Invoice header */}
            <div className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-black text-espresso">#{inv.number}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusCls}`}>{statusLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-espresso/60">
                    {inv.due_date && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Due {inv.due_date}</span>}
                    {inv.notes && <span>{inv.notes}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-espresso text-lg">{money(inv.currency, inv.total)}</p>
                  <p className="text-xs text-emerald-600 font-semibold">Paid: {money(inv.currency, inv.amount_paid)}</p>
                  {balance > 0 && <p className="text-xs text-amber-600 font-semibold">Due: {money(inv.currency, balance)}</p>}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-espresso/60 shrink-0">{Math.round(pct)}%</span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => { setEditing(isEditing ? null : inv.id); setPayingFor(null); }}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${isEditing ? "bg-espresso text-white border-espresso" : "border-espresso/20 text-espresso hover:bg-sand"}`}>
                  <Edit2 className="h-3 w-3" /> {isEditing ? "Cancel edit" : "Edit"}
                </button>
                <button onClick={() => { setPayingFor(isPaying ? null : inv.id); setEditing(null); }}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${isPaying ? "bg-emerald-600 text-white border-emerald-600" : "border-emerald-600/30 text-emerald-700 hover:bg-emerald-50"}`}>
                  <DollarSign className="h-3 w-3" /> {isPaying ? "Cancel" : "Record Payment"}
                </button>
                <button onClick={() => deleteInvoice(inv.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>

            {/* Edit inline form */}
            {isEditing && (
              <div className="border-t border-espresso/10 bg-sand/30 p-4">
                <EditInvoiceForm inv={inv} onSave={(patch) => saveEdit(inv, patch)} onCancel={() => setEditing(null)} />
              </div>
            )}

            {/* Record payment form */}
            {isPaying && (
              <div className="border-t border-espresso/10 bg-emerald-50/50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-800 mb-3">Record Payment</p>
                <form onSubmit={(e) => recordPayment(inv, e)} className="grid gap-3 sm:grid-cols-2">
                  <div><label className={label}>Amount ({inv.currency})</label>
                    <input required type="number" step="0.01" min="0.01" max={String(balance)} value={payForm.amount}
                      onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                      placeholder={String(balance)} className={`mt-1 ${input}`} />
                  </div>
                  <div><label className={label}>Payment date</label>
                    <input type="date" value={payForm.paid_at} onChange={(e) => setPayForm({ ...payForm, paid_at: e.target.value })} className={`mt-1 ${input}`} />
                  </div>
                  <div><label className={label}>Method</label>
                    <select value={payForm.gateway} onChange={(e) => setPayForm({ ...payForm, gateway: e.target.value })} className={`mt-1 ${input}`}>
                      {["manual", "bank_transfer", "credit_card", "paypal", "stripe", "crypto", "cash"].map((g) => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <div><label className={label}>Reference / account</label>
                    <input value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
                      placeholder="e.g. last 4 digits / TXN ID" className={`mt-1 ${input}`} />
                  </div>
                  <div className="sm:col-span-2"><label className={label}>Notes</label>
                    <input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} className={`mt-1 ${input}`} />
                  </div>
                  {/* Payment proof upload */}
                  <div className="sm:col-span-2">
                    <label className={label}>Payment proof (screenshot/receipt)</label>
                    <div className="mt-1 flex items-center gap-3">
                      <input ref={proofRef} type="file" accept="image/*,application/pdf"
                        className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProof(f); e.target.value = ""; }} />
                      <button type="button" onClick={() => proofRef.current?.click()}
                        disabled={proofUploading}
                        className="inline-flex items-center gap-1.5 rounded-full border border-espresso/20 px-3 py-2 text-xs font-bold text-espresso hover:bg-sand disabled:opacity-60">
                        {proofUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        Upload proof
                      </button>
                      {payForm.proof_url && (
                        <a href={payForm.proof_url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline">
                          <ImageIcon className="h-3.5 w-3.5" /> View uploaded proof
                        </a>
                      )}
                    </div>
                    {payForm.proof_url && (
                      <input value={payForm.proof_url} onChange={(e) => setPayForm({ ...payForm, proof_url: e.target.value })}
                        placeholder="or paste URL" className={`mt-2 ${input}`} />
                    )}
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setPayingFor(null)} className="rounded-full border border-espresso/20 px-4 py-2 text-xs font-bold text-espresso">Cancel</button>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment history */}
            {invPayments.length > 0 && (
              <div className="border-t border-espresso/10 px-4 py-3 bg-emerald-50/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-espresso/50 mb-2">Payment History ({invPayments.length})</p>
                <div className="space-y-2">
                  {invPayments.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-white px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-espresso">{money(tx.currency, tx.amount)}</p>
                          <p className="text-[10px] text-espresso/50">{tx.gateway.replace("_", " ")} {tx.payment_method ? `· ${tx.payment_method}` : ""} {tx.paid_at ? `· ${new Date(tx.paid_at).toLocaleDateString()}` : ""}</p>
                          {tx.notes && <p className="text-[10px] text-espresso/50 italic">{tx.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tx.proof_url && (
                          <a href={tx.proof_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-200">
                            <ImageIcon className="h-3 w-3" /> Proof
                          </a>
                        )}
                        <button onClick={async () => {
                          if (!confirm("Delete this payment record?")) return;
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          await (supabase.from as any)("payment_transactions").delete().eq("id", tx.id);
                          const newPaid = Math.max(0, Number(inv.amount_paid) - Number(tx.amount));
                          await supabase.from("invoices").update({ amount_paid: newPaid, status: newPaid <= 0 ? "pending" : newPaid >= Number(inv.total) ? "paid" : "partial" }).eq("id", inv.id);
                          load();
                        }} className="rounded-lg p-1 text-red-500 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Inline edit form for an invoice
function EditInvoiceForm({ inv, onSave, onCancel }: { inv: InvoiceRow; onSave: (patch: Partial<InvoiceRow>) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    number: inv.number, currency: inv.currency, total: String(inv.total),
    amount_paid: String(inv.amount_paid), status: inv.status,
    due_date: inv.due_date ?? "", notes: inv.notes ?? "",
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ number: f.number, currency: f.currency, total: parseFloat(f.total), amount_paid: parseFloat(f.amount_paid || "0"), status: f.status, due_date: f.due_date || null, notes: f.notes || null }); }}
      className="grid gap-3 sm:grid-cols-3">
      <div><label className={label}>Number</label><input value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} className={`mt-1 ${input}`} /></div>
      <div><label className={label}>Currency</label>
        <select value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} className={`mt-1 ${input}`}>
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div><label className={label}>Status</label>
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={`mt-1 ${input}`}>
          {["pending", "partial", "paid", "overdue", "cancelled"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div><label className={label}>Total</label><input type="number" step="0.01" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} className={`mt-1 ${input}`} /></div>
      <div><label className={label}>Amount paid</label><input type="number" step="0.01" value={f.amount_paid} onChange={(e) => setF({ ...f, amount_paid: e.target.value })} className={`mt-1 ${input}`} /></div>
      <div><label className={label}>Due date</label><input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className={`mt-1 ${input}`} /></div>
      <div className="sm:col-span-3"><label className={label}>Notes</label><input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className={`mt-1 ${input}`} /></div>
      <div className="sm:col-span-3 flex gap-2">
        <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" /> Save changes</button>
        <button type="button" onClick={onCancel} className="rounded-full border border-espresso/20 px-4 py-2 text-xs font-bold text-espresso">Cancel</button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT BILLING REQUESTS TAB — admin approves/rejects what client submitted
// ─────────────────────────────────────────────────────────────────────────────

interface BillingRequest {
  id: string; title: string; description: string | null; amount: number | null; currency: string;
  attachment_url: string | null; status: string; admin_notes: string | null; created_at: string;
}

export function ClientBillingRequestsTab({ clientId }: { clientId: string }) {
  const { rows, loading, reload } = useTable<BillingRequest>("client_billing_requests", clientId);

  async function updateStatus(id: string, status: string, notes: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("client_billing_requests").update({ status, admin_notes: notes || null }).eq("id", id);
    reload();
  }

  if (loading) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" />;
  if (rows.length === 0) return <p className="rounded-2xl border border-dashed border-espresso/20 p-8 text-center text-sm text-espresso/50">No billing requests from this client yet.</p>;

  return (
    <div className="space-y-3">
      {rows.map((req) => {
        const [notes, setNotes] = useState(req.admin_notes ?? "");
        return (
          <div key={req.id} className={`rounded-2xl border p-4 ${req.status === "approved" ? "border-emerald-200 bg-emerald-50/30" : req.status === "rejected" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-espresso">{req.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${req.status === "approved" ? "bg-emerald-100 text-emerald-700" : req.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{req.status}</span>
                </div>
                {req.description && <p className="text-xs text-espresso/60 mt-0.5">{req.description}</p>}
                {req.amount && <p className="text-sm font-black text-espresso mt-1">{req.currency} {Number(req.amount).toLocaleString()}</p>}
                <p className="text-[10px] text-espresso/40 mt-0.5">{new Date(req.created_at).toLocaleString()}</p>
              </div>
              {req.attachment_url && (
                <a href={req.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-espresso/20 px-3 py-1 text-[10px] font-bold text-espresso hover:bg-sand">
                  <ImageIcon className="h-3 w-3" /> Attachment
                </a>
              )}
            </div>
            {req.status === "pending" && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Admin notes (optional)" className={`flex-1 ${input}`} />
                <button onClick={() => updateStatus(req.id, "approved", notes)} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Approve</button>
                <button onClick={() => updateStatus(req.id, "rejected", notes)} className="rounded-full bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700">Reject</button>
              </div>
            )}
            {req.admin_notes && req.status !== "pending" && <p className="mt-2 text-xs text-espresso/60 italic">Admin note: {req.admin_notes}</p>}
          </div>
        );
      })}
    </div>
  );
}
