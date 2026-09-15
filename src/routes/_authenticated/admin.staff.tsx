import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createStaffAccount, updateStaffCredentials, deleteStaffAccount } from "@/lib/staff.functions";
import { STAFF_MODULES, STAFF_ROLES, defaultModules, roleLabel, type StaffModuleKey } from "@/lib/staff-roles";
import { Loader2, Plus, Trash2, KeyRound, X, Send, Bell, FileText, ListChecks } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: AdminStaff,
});

interface Staff {
  id: string; name: string; email: string; job_title: string | null; role: string;
  department: string | null; phone: string | null; modules: string[]; active: boolean;
  user_id: string | null; created_at: string;
}

const input = "w-full rounded-xl border border-espresso/12 bg-sand/40 px-3 py-2.5 text-sm outline-none focus:border-cocoa focus:bg-white";
const label = "text-[10px] font-semibold uppercase tracking-widest text-espresso/60";

function AdminStaff() {
  const [rows, setRows] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useServerFn(createStaffAccount);
  const updateCreds = useServerFn(updateStaffCredentials);
  const removeAccount = useServerFn(deleteStaffAccount);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: e } = await supabase.from("staff_members").select("*").order("created_at", { ascending: false });
    if (e) setError(e.message);
    setRows((data as Staff[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-espresso">Team Portal</h1>
          <p className="text-sm text-foreground/60">{rows.length} team account{rows.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2.5 text-sm font-bold text-white hover:bg-cocoa">
          <Plus className="h-4 w-4" /> New team member
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-espresso/10 bg-white">
        {loading ? (
          <div className="grid place-items-center p-12"><Loader2 className="h-5 w-5 animate-spin text-cocoa" /></div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-foreground/50">No team accounts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand/60 text-left text-xs font-bold uppercase tracking-wider text-espresso/70">
                <tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Modules</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-espresso/6">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-sand/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-espresso">{s.name}</p>
                      <p className="text-xs text-foreground/50">{s.job_title || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-espresso/80">{s.email}</td>
                    <td className="px-4 py-3 text-espresso/70">{roleLabel(s.role)}</td>
                    <td className="px-4 py-3 text-xs text-espresso/60">{(s.modules ?? []).length} enabled</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => { await supabase.from("staff_members").update({ active: !s.active }).eq("id", s.id); load(); }}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.active ? "bg-green-100 text-green-700" : "bg-espresso/10 text-espresso/60"}`}>
                        {s.active ? "active" : "disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setSelected(s)} className="rounded-lg border border-espresso/15 px-3 py-1.5 text-xs font-bold text-espresso hover:bg-sand">Manage</button>
                        <button
                          onClick={async () => {
                            const pw = prompt(`New password for ${s.email} (min 8 chars)`);
                            if (!pw) return;
                            try { await updateCreds({ data: { staffId: s.id, password: pw } }); alert("Password updated."); }
                            catch (e) { alert((e as Error).message); }
                          }}
                          className="rounded-lg p-2 text-espresso hover:bg-sand" title="Reset password"><KeyRound className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete ${s.name} and all their portal data?`)) return;
                            try { await removeAccount({ data: { staffId: s.id } }); load(); }
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
      {selected && <ManageDrawer staff={selected} onClose={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function ModulePicker({ value, onChange }: { value: StaffModuleKey[]; onChange: (v: StaffModuleKey[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STAFF_MODULES.map((m) => {
        const on = value.includes(m.key);
        return (
          <button key={m.key} type="button"
            onClick={() => onChange(on ? value.filter((k) => k !== m.key) : [...value, m.key])}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${on ? "bg-espresso text-white" : "border border-espresso/15 text-espresso hover:bg-sand"}`}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function CreateModal({ onClose, onDone, create }: { onClose: () => void; onDone: () => void; create: ReturnType<typeof useServerFn<typeof createStaffAccount>> }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", job_title: "", department: "", phone: "", role: "developer" });
  const [modules, setModules] = useState<StaffModuleKey[]>(defaultModules("developer"));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { await create({ data: { ...form, modules } }); onDone(); }
    catch (e2) { setErr((e2 as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-espresso/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-espresso">New team member</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-sand"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className={label}>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Login email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Temporary password</label><input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div>
            <label className={label}>Role</label>
            <select value={form.role} onChange={(e) => { setForm({ ...form, role: e.target.value }); setModules(defaultModules(e.target.value)); }} className={`mt-1 ${input}`}>
              {STAFF_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <div><label className={label}>Job title</label><input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div className="sm:col-span-2"><label className={label}>Portal modules</label><div className="mt-2"><ModulePicker value={modules} onChange={setModules} /></div></div>
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
  { key: "access", label: "Role & access", icon: KeyRound },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "messages", label: "Messages", icon: Send },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "documents", label: "Resources", icon: FileText },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ManageDrawer({ staff, onClose }: { staff: Staff; onClose: () => void }) {
  const [tab, setTab] = useState<TabKey>("access");
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-espresso/50" onClick={onClose}>
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-black text-espresso">{staff.name}</h2>
            <p className="text-xs text-foreground/60">{staff.email} · {roleLabel(staff.role)}</p>
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

        {tab === "access" && <AccessTab staff={staff} />}
        {tab === "tasks" && <TasksTab staffId={staff.id} />}
        {tab === "messages" && <MessagesTab staffId={staff.id} />}
        {tab === "notifications" && <NotificationsTab staffId={staff.id} />}
        {tab === "documents" && <DocumentsTab staffId={staff.id} />}
      </div>
    </div>
  );
}

function AccessTab({ staff }: { staff: Staff }) {
  const [role, setRole] = useState(staff.role);
  const [modules, setModules] = useState<StaffModuleKey[]>((staff.modules ?? []) as StaffModuleKey[]);
  const [jobTitle, setJobTitle] = useState(staff.job_title ?? "");
  const [department, setDepartment] = useState(staff.department ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const updateCreds = useServerFn(updateStaffCredentials);
  const [newEmail, setNewEmail] = useState(staff.email);

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("staff_members").update({
      role, modules, job_title: jobTitle || null, department: department || null,
    }).eq("id", staff.id);
    setMsg(error ? error.message : "Saved.");
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-espresso/12 p-4 sm:grid-cols-2">
        <div>
          <label className={label}>Role</label>
          <select value={role} onChange={(e) => { setRole(e.target.value); setModules(defaultModules(e.target.value)); }} className={`mt-1 ${input}`}>
            {STAFF_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
        <div><label className={label}>Job title</label><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Department</label><input value={department} onChange={(e) => setDepartment(e.target.value)} className={`mt-1 ${input}`} /></div>
        <div className="sm:col-span-2">
          <label className={label}>Portal modules</label>
          <div className="mt-2"><ModulePicker value={modules} onChange={setModules} /></div>
        </div>
        <div className="sm:col-span-2">
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save access
          </button>
          {msg && <span className="ml-3 text-xs font-semibold text-espresso/70">{msg}</span>}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-espresso/12 p-4">
        <p className="text-sm font-bold text-espresso">Login credentials</p>
        <div><label className={label}>Login email</label><input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={`mt-1 ${input}`} /></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={async () => { try { await updateCreds({ data: { staffId: staff.id, email: newEmail } }); alert("Login email updated."); } catch (e) { alert((e as Error).message); } }}
            className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso hover:bg-sand">Update email</button>
          <button onClick={async () => { const pw = prompt("New password (min 8 chars)"); if (!pw) return; try { await updateCreds({ data: { staffId: staff.id, password: pw } }); alert("Password updated."); } catch (e) { alert((e as Error).message); } }}
            className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso hover:bg-sand">Reset password</button>
        </div>
      </div>
    </div>
  );
}

function useStaffTable<T extends { id: string }>(table: string, staffId: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from as any)(table).select("*").eq("staff_id", staffId).order("created_at", { ascending: false });
    setRows((data as T[]) ?? []);
    setLoading(false);
  }, [table, staffId]);
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

function TasksTab({ staffId }: { staffId: string }) {
  const { rows, loading, reload } = useStaffTable<{ id: string; title: string; status: string; priority: string; due_date: string | null }>("staff_tasks", staffId);
  const [f, setF] = useState({ title: "", description: "", status: "todo", priority: "medium", due_date: "", progress: 0 });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await insertRow("staff_tasks", { staff_id: staffId, ...f, due_date: f.due_date || null });
          if (ok) {
            await insertRow("staff_notifications", { staff_id: staffId, title: "New task assigned", body: f.title, kind: "info", link: "/staff/tasks" });
            setF({ ...f, title: "", description: "" }); reload();
          }
        }}>
        <div className="sm:col-span-2"><label className={label}>Task title</label><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div className="sm:col-span-2"><label className={label}>Description</label><textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Status</label><select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={`mt-1 ${input}`}>{["todo", "in_progress", "review", "done"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className={label}>Priority</label><select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} className={`mt-1 ${input}`}>{["low", "medium", "high", "urgent"].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className={label}>Due date</label><input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div className="sm:col-span-2"><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Assign task</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((t) => (
        <Row key={t.id} onDelete={async () => { await deleteRow("staff_tasks", t.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{t.title}</p>
          <p className="text-xs text-foreground/60">{t.status} · {t.priority}{t.due_date ? ` · due ${t.due_date}` : ""}</p>
        </Row>
      ))}
    </div>
  );
}

function MessagesTab({ staffId }: { staffId: string }) {
  const { rows, loading, reload } = useStaffTable<{ id: string; subject: string; body: string; is_read: boolean }>("staff_messages", staffId);
  const [f, setF] = useState({ subject: "", body: "", important: false });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await insertRow("staff_messages", { staff_id: staffId, ...f });
          if (ok) {
            await insertRow("staff_notifications", { staff_id: staffId, title: "New message", body: f.subject, kind: "info", link: "/staff/messages" });
            setF({ subject: "", body: "", important: false }); reload();
          }
        }}>
        <div><label className={label}>Subject</label><input required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Message</label><textarea required rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={`mt-1 ${input}`} /></div>
        <label className="flex items-center gap-2 text-xs font-semibold text-espresso/80"><input type="checkbox" checked={f.important} onChange={(e) => setF({ ...f, important: e.target.checked })} /> Mark important</label>
        <div><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Send className="h-3.5 w-3.5" /> Send message</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((m) => (
        <Row key={m.id} onDelete={async () => { await deleteRow("staff_messages", m.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{m.subject} {!m.is_read && <span className="ml-1 rounded-full bg-espresso px-2 py-0.5 text-[9px] uppercase text-white">unread</span>}</p>
          <p className="whitespace-pre-wrap text-xs text-foreground/60">{m.body}</p>
        </Row>
      ))}
    </div>
  );
}

function NotificationsTab({ staffId }: { staffId: string }) {
  const { rows, loading, reload } = useStaffTable<{ id: string; title: string; body: string | null; kind: string; is_read: boolean }>("staff_notifications", staffId);
  const [f, setF] = useState({ title: "", body: "", kind: "info" });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-2xl border border-espresso/12 p-4"
        onSubmit={async (e) => { e.preventDefault(); const ok = await insertRow("staff_notifications", { staff_id: staffId, ...f }); if (ok) { setF({ title: "", body: "", kind: "info" }); reload(); } }}>
        <div><label className={label}>Title</label><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Body</label><input value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Type</label><select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={`mt-1 ${input}`}>{["info", "success", "warning"].map((k) => <option key={k}>{k}</option>)}</select></div>
        <div><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Bell className="h-3.5 w-3.5" /> Send notification</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((n) => (
        <Row key={n.id} onDelete={async () => { await deleteRow("staff_notifications", n.id); reload(); }}>
          <p className="text-sm font-bold text-espresso">{n.title}</p>
          <p className="text-xs text-foreground/60">{n.body} · {n.kind} · {n.is_read ? "read" : "unread"}</p>
        </Row>
      ))}
    </div>
  );
}

function DocumentsTab({ staffId }: { staffId: string }) {
  const { rows, loading, reload } = useStaffTable<{ id: string; name: string; url: string; file_type: string | null }>("staff_documents", staffId);
  const [f, setF] = useState({ name: "", description: "", url: "", file_type: "" });
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `staff-docs/${staffId}/${crypto.randomUUID()}.${ext}`;
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
        onSubmit={async (e) => { e.preventDefault(); if (!f.url) { alert("Upload a file or paste a URL first."); return; } const ok = await insertRow("staff_documents", { staff_id: staffId, ...f, description: f.description || null }); if (ok) { setF({ name: "", description: "", url: "", file_type: "" }); reload(); } }}>
        <div><label className={label}>File</label>
          <input type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); }} className={`mt-1 ${input}`} />
          {uploading && <p className="mt-1 text-xs text-foreground/60">Uploading…</p>}
        </div>
        <div><label className={label}>Display name</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Description</label><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div><label className={label}>URL</label><input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="uploaded or external link" className={`mt-1 ${input}`} /></div>
        <div><button className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Share resource</button></div>
      </form>

      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-cocoa" /> : rows.map((d) => (
        <Row key={d.id} onDelete={async () => { await deleteRow("staff_documents", d.id); reload(); }}>
          <a href={d.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-espresso underline">{d.name}</a>
          <p className="text-xs text-foreground/60">{d.file_type}</p>
        </Row>
      ))}
    </div>
  );
}
