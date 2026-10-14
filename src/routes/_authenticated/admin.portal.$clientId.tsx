import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateClientCredentials, deleteClientAccount, repairClientLink } from "@/lib/portal.functions";
import {
  ArrowLeft, Loader2, Upload, UserRound, ListChecks, Send, Bell, FileText, LifeBuoy, FolderKanban,
  Users, ReceiptText, History, Save, KeyRound, Trash2, Mail, Phone, Globe, AlertTriangle, RefreshCw,
} from "lucide-react";
import { input, label, TasksTab, MessagesTab, NotificationsTab, DocumentsTab, SupportTab, ProjectsTab, InvoicesTab, ClientBillingRequestsTab } from "@/components/admin/client-tabs";

export const Route = createFileRoute("/_authenticated/admin/portal/$clientId")({
  component: ClientPage,
});

interface Client {
  id: string; user_id: string | null; name: string; email: string; company: string | null; phone: string | null;
  active: boolean; am_id: string | null; avatar_url: string | null; website: string | null; address: string | null;
  admin_notes: string | null; created_at: string;
}

const TABS = [
  { key: "profile", label: "Profile & login", icon: UserRound },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "team", label: "Assigned team", icon: Users },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "invoices", label: "Invoices", icon: ReceiptText },
  { key: "billing_requests", label: "Billing requests", icon: ReceiptText },
  { key: "messages", label: "Messages", icon: Send },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "activity", label: "Activity", icon: History },
] as const;
type TabKey = (typeof TABS)[number]["key"];

async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw new Error(error.message);
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
  if (e2 || !data) throw new Error(e2?.message ?? "Could not create link");
  return data.signedUrl;
}

function Avatar({ url, name, size = 64 }: { url: string | null; name: string; size?: number }) {
  return url
    ? <img src={url} alt={name} style={{ width: size, height: size }} className="shrink-0 rounded-2xl object-cover" />
    : <div style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-2xl bg-espresso font-display text-xl font-black text-copper">{name.slice(0, 1).toUpperCase()}</div>;
}

function ClientPage() {
  const { clientId } = Route.useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("profile");
  const [stats, setStats] = useState({ projects: 0, openTasks: 0, due: 0, tickets: 0 });

  const load = useCallback(async () => {
    const { data } = await supabase.from("portal_clients").select("*").eq("id", clientId).maybeSingle();
    setClient(data as Client | null);
    setLoading(false);
    const [p, t, i, s] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      supabase.from("client_tasks").select("id", { count: "exact", head: true }).eq("client_id", clientId).neq("status", "done"),
      supabase.from("invoices").select("total, amount_paid").eq("client_id", clientId),
      supabase.from("support_requests").select("id", { count: "exact", head: true }).eq("client_id", clientId).neq("status", "closed"),
    ]);
    setStats({
      projects: p.count ?? 0, openTasks: t.count ?? 0, tickets: s.count ?? 0,
      due: (i.data ?? []).reduce((a, r) => a + Math.max(0, Number(r.total) - Number(r.amount_paid)), 0),
    });
  }, [clientId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-cocoa" /></div>;
  if (!client) return <div className="rounded-3xl bg-white p-10 text-center">Client not found. <Link to="/admin/portal" className="font-bold underline">Back</Link></div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/portal" className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso/60 hover:text-espresso"><ArrowLeft className="h-3.5 w-3.5" /> All clients</Link>

      <div className="flex flex-wrap items-center gap-5 rounded-3xl border border-espresso/10 bg-white p-6">
        <Avatar url={client.avatar_url} name={client.name} size={80} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-black text-espresso">{client.name}</h1>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${client.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{client.active ? "Active" : "Disabled"}</span>
            {client.am_id && <span className="rounded-full bg-sand px-2.5 py-1 text-[10px] font-bold text-espresso">{client.am_id}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-espresso/60">
            {client.company && <span>{client.company}</span>}
            <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>
            {client.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
            {client.website && <a href={client.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline"><Globe className="h-3 w-3" />website</a>}
            <span>{client.user_id ? "Login active" : "No login yet"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Projects", stats.projects], ["Open tasks", stats.openTasks], ["Outstanding", `$${stats.due.toLocaleString()}`], ["Open tickets", stats.tickets]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-espresso/10 bg-white p-4"><p className="font-display text-2xl font-black text-espresso">{v}</p><p className="text-xs font-semibold text-espresso/60">{l}</p></div>
        ))}
      </div>

      <div className="rounded-3xl border border-espresso/10 bg-white p-5">
        <div className="mb-5 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold ${tab === t.key ? "bg-espresso text-white" : "border border-espresso/15 text-espresso hover:bg-sand"}`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
        {tab === "profile" && <ProfileTab client={client} onSaved={load} />}
        {tab === "projects" && <ProjectsTab clientId={client.id} />}
        {tab === "team" && <TeamTab clientId={client.id} />}
        {tab === "tasks" && <TasksTab clientId={client.id} />}
        {tab === "invoices" && <InvoicesTab clientId={client.id} clientName={client.name} />}
        {tab === "billing_requests" && <ClientBillingRequestsTab clientId={client.id} />}
        {tab === "messages" && <MessagesTab clientId={client.id} />}
        {tab === "notifications" && <NotificationsTab clientId={client.id} />}
        {tab === "documents" && <DocumentsTab clientId={client.id} />}
        {tab === "support" && <SupportTab clientId={client.id} />}
        {tab === "activity" && <ActivityTab clientId={client.id} />}
      </div>
    </div>
  );
}

function ProfileTab({ client, onSaved }: { client: Client; onSaved: () => void }) {
  const [f, setF] = useState({
    name: client.name, company: client.company ?? "", phone: client.phone ?? "", website: client.website ?? "",
    address: client.address ?? "", admin_notes: client.admin_notes ?? "", avatar_url: client.avatar_url ?? "", active: client.active,
  });
  const [email, setEmail] = useState(client.email);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const updateCreds = useServerFn(updateClientCredentials);
  const remove = useServerFn(deleteClientAccount);
  const repair = useServerFn(repairClientLink);
  const navigate = useNavigate();

  async function log(description: string) {
    await supabase.from("client_activities").insert({ client_id: client.id, action: "profile_updated", description, actor: "admin" });
  }
  async function saveProfile() {
    if (!f.name.trim()) return setMsg("Name is required.");
    setBusy("profile"); setMsg(null);
    const { error } = await supabase.from("portal_clients").update({
      name: f.name.trim(), company: f.company || null, phone: f.phone || null, website: f.website || null,
      address: f.address || null, admin_notes: f.admin_notes || null, avatar_url: f.avatar_url || null, active: f.active,
    }).eq("id", client.id);
    if (!error) await log("Profile details updated by admin");
    setMsg(error ? error.message : "Profile saved."); setBusy(null); onSaved();
  }
  async function onFile(file: File) {
    setBusy("avatar"); setMsg(null);
    try {
      const url = await uploadImage(file, `clients/${client.id}`);
      setF((x) => ({ ...x, avatar_url: url }));
      const { error } = await supabase.from("portal_clients").update({ avatar_url: url }).eq("id", client.id);
      if (error) throw new Error(error.message);
      await log("Profile picture updated");
      setMsg("Profile picture updated."); onSaved();
    } catch (e) { setMsg((e as Error).message); }
    setBusy(null);
  }
  async function saveLogin(kind: "email" | "password") {
    setBusy(kind); setMsg(null);
    try {
      if (kind === "password" && pw.length < 8) throw new Error("Password must be at least 8 characters.");
      await updateCreds({ data: kind === "email" ? { clientId: client.id, email, ...(client.user_id ? {} : { password: pw }) } : { clientId: client.id, password: pw, ...(client.user_id ? {} : { email }) } });
      setMsg(kind === "email" ? "Login email updated." : "Password updated."); setPw(""); onSaved();
    } catch (e) { setMsg((e as Error).message); }
    setBusy(null);
  }

  async function repairLink() {
    setBusy("repair"); setMsg(null);
    try {
      const result = await repair({ data: { clientId: client.id } });
      if (result.status === "already_linked") {
        setMsg("✓ Portal link is already active — this client should be able to log in.");
      } else if (result.status === "linked_existing") {
        setMsg("✓ Portal link repaired! The client can now log in with their email and password.");
      }
      onSaved();
    } catch (e) { setMsg((e as Error).message); }
    setBusy(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-espresso/12 p-4">
        <p className="text-sm font-bold text-espresso">Profile</p>
        <div className="flex items-center gap-4">
          <Avatar url={f.avatar_url || null} name={f.name || "?"} size={72} />
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const x = e.target.files?.[0]; if (x) onFile(x); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy === "avatar"} className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-3.5 py-2 text-xs font-bold text-white disabled:opacity-60">
              {busy === "avatar" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload from PC
            </button>
            {f.avatar_url && <button type="button" onClick={() => setF({ ...f, avatar_url: "" })} className="block text-xs font-semibold text-red-600">Remove picture (then Save)</button>}
          </div>
        </div>
        <div><label className={label}>Or image link</label><input value={f.avatar_url} onChange={(e) => setF({ ...f, avatar_url: e.target.value })} placeholder="https://…" className={`mt-1 ${input}`} /></div>
        <div><label className={label}>Full name</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`mt-1 ${input}`} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={label}>Company</label><input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Phone</label><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Website</label><input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} className={`mt-1 ${input}`} /></div>
          <div><label className={label}>Address</label><input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className={`mt-1 ${input}`} /></div>
        </div>
        <div><label className={label}>Internal notes (admin only)</label><textarea rows={3} value={f.admin_notes} onChange={(e) => setF({ ...f, admin_notes: e.target.value })} className={`mt-1 ${input}`} /></div>
        <label className="flex items-center gap-2 text-sm font-semibold text-espresso"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Portal access active</label>
        <button onClick={saveProfile} disabled={busy === "profile"} className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
          {busy === "profile" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save profile
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-3 rounded-2xl border border-espresso/12 p-4">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-espresso"><KeyRound className="h-4 w-4" /> Login credentials</p>
          {!client.user_id ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> No portal login linked
              </p>
              <p className="text-xs text-amber-700">
                This client cannot log in. Either fix the link automatically (if a Supabase account already exists for {client.email}), or set a password below to create a new login.
              </p>
              <button
                onClick={repairLink}
                disabled={!!busy}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-700 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                {busy === "repair" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Auto-fix portal link
              </button>
            </div>
          ) : (
            <p className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Login active — client can sign in with their email &amp; password
            </p>
          )}
          <div><label className={label}>Login email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 ${input}`} /></div>
          <button onClick={() => saveLogin("email")} disabled={!!busy} className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso hover:bg-sand">{busy === "email" ? "Saving…" : "Update email"}</button>
          <div><label className={label}>New password (min 8)</label><input type="text" value={pw} onChange={(e) => setPw(e.target.value)} className={`mt-1 ${input}`} /></div>
          <button onClick={() => saveLogin("password")} disabled={!!busy} className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso hover:bg-sand">{busy === "password" ? "Saving…" : "Set password"}</button>
        </div>
        {msg && <p className="rounded-xl bg-sand p-3 text-xs font-semibold text-espresso">{msg}</p>}
        <div className="rounded-2xl border border-red-200 p-4">
          <p className="text-sm font-bold text-red-700">Danger zone</p>
          <p className="mt-1 text-xs text-espresso/60">Deletes the client, their login and all portal data.</p>
          <button onClick={async () => { if (!confirm(`Delete ${client.name} permanently?`)) return; try { await remove({ data: { clientId: client.id } }); navigate({ to: "/admin/portal" }); } catch (e) { alert((e as Error).message); } }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white"><Trash2 className="h-3.5 w-3.5" /> Delete client</button>
        </div>
      </div>
    </div>
  );
}

function TeamTab({ clientId }: { clientId: string }) {
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; name: string; job_title: string | null; role: string; department_slug: string | null; avatar_url: string | null }[]>([]);
  const [assign, setAssign] = useState<{ id: string; project_id: string; staff_id: string }[]>([]);
  const [pick, setPick] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    const { data: p } = await supabase.from("projects").select("id, title").eq("client_id", clientId).order("created_at", { ascending: false });
    setProjects(p ?? []);
    const ids = (p ?? []).map((x) => x.id);
    const [{ data: s }, { data: a }] = await Promise.all([
      supabase.from("staff_members").select("id, name, job_title, role, department_slug, avatar_url").eq("active", true).order("name"),
      ids.length ? supabase.from("project_assignments").select("id, project_id, staff_id").in("project_id", ids) : Promise.resolve({ data: [] as { id: string; project_id: string; staff_id: string }[] }),
    ]);
    setStaff(s ?? []); setAssign(a ?? []);
  }, [clientId]);
  useEffect(() => { load(); }, [load]);

  async function add(projectId: string) {
    const sid = pick[projectId]; if (!sid) return;
    const m = staff.find((x) => x.id === sid)!; const p = projects.find((x) => x.id === projectId)!;
    const { error } = await supabase.from("project_assignments").insert({ project_id: projectId, staff_id: sid, department_slug: m.department_slug, role_on_project: m.job_title || m.role });
    if (error) return alert(error.message);
    await Promise.all([
      supabase.from("staff_notifications").insert({ staff_id: sid, title: `You were assigned to ${p.title}`, kind: "project" }),
      supabase.from("client_notifications").insert({ client_id: clientId, title: `${m.name} joined ${p.title}`, body: m.job_title ?? m.role, kind: "team" }),
      supabase.from("client_activities").insert({ client_id: clientId, action: "team_assigned", description: `${m.name} assigned to ${p.title}`, actor: "admin" }),
    ]);
    setPick({ ...pick, [projectId]: "" }); load();
  }
  async function removeA(id: string) { const { error } = await supabase.from("project_assignments").delete().eq("id", id); if (error) alert(error.message); load(); }

  if (!projects.length) return <p className="text-sm text-espresso/60">Create a project in the Projects tab first, then assign team members here.</p>;
  return (
    <div className="space-y-3">
      <p className="text-xs text-espresso/60">Assigned team members appear in this client's portal, and the client appears in each member's portal.</p>
      {projects.map((p) => {
        const rows = assign.filter((a) => a.project_id === p.id);
        return (
          <div key={p.id} className="rounded-2xl border border-espresso/12 p-4">
            <p className="font-bold text-espresso">{p.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {rows.length === 0 && <span className="text-xs text-espresso/50">No one assigned yet.</span>}
              {rows.map((a) => { const m = staff.find((x) => x.id === a.staff_id); return (
                <span key={a.id} className="inline-flex items-center gap-2 rounded-full bg-sand py-1 pl-1 pr-2 text-xs font-semibold text-espresso">
                  <Avatar url={m?.avatar_url ?? null} name={m?.name ?? "?"} size={22} /> {m?.name ?? "Member"} <span className="text-espresso/50">{m?.job_title || m?.role}</span>
                  <button onClick={() => removeA(a.id)} className="text-red-600">×</button>
                </span>
              ); })}
            </div>
            <div className="mt-3 flex gap-2">
              <select value={pick[p.id] ?? ""} onChange={(e) => setPick({ ...pick, [p.id]: e.target.value })} className={input}>
                <option value="">Add team member…</option>
                {staff.filter((s) => !rows.some((r) => r.staff_id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.name} — {s.job_title || s.role}</option>)}
              </select>
              <button onClick={() => add(p.id)} className="shrink-0 rounded-full bg-espresso px-4 text-xs font-bold text-white">Assign</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityTab({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<{ id: string; action: string; description: string | null; actor: string; created_at: string }[]>([]);
  useEffect(() => { supabase.from("client_activities").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? [])); }, [clientId]);
  return rows.length === 0 ? <p className="text-sm text-espresso/60">No activity yet.</p> : (
    <ul className="space-y-3 border-l-2 border-sand pl-4">
      {rows.map((r) => (
        <li key={r.id}><p className="text-sm font-semibold text-espresso">{r.description || r.action}</p><p className="text-xs text-espresso/50">{r.actor} · {new Date(r.created_at).toLocaleString()}</p></li>
      ))}
    </ul>
  );
}
