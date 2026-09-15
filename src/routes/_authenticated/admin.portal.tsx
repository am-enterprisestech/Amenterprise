import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createClientAccount, updateClientCredentials, deleteClientAccount } from "@/lib/portal.functions";
import { Loader2, Plus, Trash2, KeyRound, X, Send, Bell, FileText, ListChecks, LifeBuoy, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/portal")({
  component: AdminPortal,
});

interface Client { id: string; name: string; email: string; company: string | null; phone: string | null; active: boolean; user_id: string | null; created_at: string }

const input = "w-full rounded-xl border border-espresso/12 bg-sand/40 px-3 py-2.5 text-sm outline-none focus:border-cocoa focus:bg-white";
const label = "text-[10px] font-semibold uppercase tracking-widest text-espresso/60";

function AdminPortal() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useServerFn(createClientAccount);
  const updateCreds = useServerFn(updateClientCredentials);
  const removeAccount = useServerFn(deleteClientAccount);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: e } = await supabase.from("portal_clients").select("*").order("created_at", { ascending: false });
    if (e) setError(e.message);
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-espresso">Client Portal</h1>
          <p className="text-sm text-foreground/60">{clients.length} portal account{clients.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2.5 text-sm font-bold text-white hover:bg-cocoa">
          <Plus className="h-4 w-4" /> New client account
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-espresso/10 bg-white">
        {loading ? (
          <div className="grid place-items-center p-12"><Loader2 className="h-5 w-5 animate-spin text-cocoa" /></div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-sm text-foreground/50">No client accounts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand/60 text-left text-xs font-bold uppercase tracking-wider text-espresso/70">
                <tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Login</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-espresso/6">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-sand/30">
                    <td className="px-4 py-3 font-semibold text-espresso">{c.name}</td>
                    <td className="px-4 py-3 text-espresso/80">{c.email}</td>
                    <td className="px-4 py-3 text-espresso/70">{c.company || "—"}</td>
                    <td className="px-4 py-3 text-espresso/70">{c.user_id ? "Active login" : "No login"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => { await supabase.from("portal_clients").update({ active: !c.active }).eq("id", c.id); load(); }}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${c.active ? "bg-green-100 text-green-700" : "bg-espresso/10 text-espresso/60"}`}>
                        {c.active ? "active" : "disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setSelected(c)} className="rounded-lg border border-espresso/15 px-3 py-1.5 text-xs font-bold text-espresso hover:bg-sand">Manage</button>
                        <button
                          onClick={async () => {
                            const pw = prompt(`New password for ${c.email} (min 8 chars)`);
                            if (!pw) return;
                            try { await updateCreds({ data: { clientId: c.id, password: pw } }); alert("Password updated."); }
                            catch (e) { alert((e as Error).message); }
                          }}
                          className="rounded-lg p-2 text-espresso hover:bg-sand" title="Reset password"><KeyRound className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete ${c.name} and all their portal data?`)) return;
                            try { await removeAccount({ data: { clientId: c.id } }); load(); }
                            catch (e) { alert((e as Error).message); }
                          }}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <CreateModal onClose={() => setCreating(false)} onDone={() => { setCreating(false); load(); }} create={create} />}
      {selected && <ManageDrawer client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CreateModal({ onClose, onDone, create }: { onClose: () => void; onDone: () => void; create: ReturnType<typeof useServerFn<typeof createClientAccount>> }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { await create({ data: form }); onDone(); }
    catch (e2) { setErr((e2 as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-espresso">New client account</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-sand"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3">
          {([["name", "Full name"], ["email", "Login email"], ["password", "Temporary password"], ["company", "Company"], ["phone", "Phone"]] as const).map(([k, l]) => (
            <div key={k}>
              <label className={label}>{l}</label>
              <input required={k === "name" || k === "email" || k === "password"} type={k === "password" ? "text" : k === "email" ? "email" : "text"}
                value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={`mt-1 ${input}`} />
            </div>
          ))}
        </div>
        {err && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-bold text-espresso">Cancel</button>
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
          </button>
        </div>
      </form>
    </div>
  );
}

const TABS = [
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "messages", label: "Messages", icon: Send },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "projects", label: "Projects", icon: Users },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ManageDrawer({ client, onClose }: { client: Client; onClose: () => void }) {
  const [tab, setTab] = useState<TabKey>("tasks");
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-espresso/50" onClick={onClose}>
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-black text-espresso">{client.name}</h2>
            <p className="text-xs text-foreground/60">{client.email}{client.company ? ` · ${client.company}` : ""}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-sand"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold ${tab === t.key ? "bg-espresso text-white" : "border border-espresso/15 text-espresso hover:bg-sand"}`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "tasks" && <TasksTab clientId={client.id} />}
        {tab === "messages" && <MessagesTab clientId={client.id} />}
        {tab === "notifications" && <NotificationsTab clientId={client.id} />}
        {tab === "documents" && <DocumentsTab clientId={client.id} />}
        {tab === "support" && <SupportTab clientId={client.id} />}
        {tab === "projects" && <ProjectsTab clientId={client.id} />}
      </div>
    </div>
  );
}

function useTable<T extends { id: string }>(table: string, clientId: string, orderBy = "created_at") {
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

async function insertRow(table: string, payload: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)(table).insert(payload);
  if (error) alert(error.message);
  return !error;
}

async function deleteRow(table: string, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from as any)(table).delete().eq("id", id);
  if (error) alert(error.message);
}

function Row({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-espresso/10 bg-sand/30 p-4">
      <div className="min-w-0 flex-1">{children}</div>
      <button onClick={onDelete} className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function TasksTab({ clientId }: { clientId: string }) {
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

function MessagesTab({ clientId }: { clientId: string }) {
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

function NotificationsTab({ clientId }: { clientId: string }) {
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

function DocumentsTab({ clientId }: { clientId: string }) {
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

function SupportTab({ clientId }: { clientId: string }) {
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

function ProjectsTab({ clientId }: { clientId: string }) {
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
