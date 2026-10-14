import { useState, lazy, Suspense } from "react";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import type { StaffMember } from "@/lib/use-staff";
import { useStaffRows } from "@/lib/use-staff";
import { supabase } from "@/integrations/supabase/client";
import { ProjectConnections } from "@/components/portal/ProjectConnections";
import { StaffHeading, StaffEmpty } from "@/components/portal/StaffShell";
import { useMyProjects, useProjectScopedRows, insertRow, updateRow, deleteRow, type ProjectRow } from "./data";

// Lazy-load ChatPanel — it uses browser-only APIs (MediaRecorder, etc.)
// so it must never run on the server (SSR).
const ChatPanel = lazy(() =>
  import("@/components/chat/ChatPanel").then((m) => ({ default: m.ChatPanel }))
);

export const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

export function ProjectsSection({ staff }: { staff: StaffMember }) {
  const { projects, loading } = useMyProjects(staff.id);
  return (
    <>
      <StaffHeading title="Assigned projects" subtitle="Projects the admin has assigned to you." />
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : projects.length === 0 ? <StaffEmpty label="No projects assigned yet." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
        </div>
      )}
    </>
  );
}

function ProjectCard({ p }: { p: ProjectRow }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg font-black text-foreground">{p.title}</p>
          <p className="text-xs text-muted-foreground">{p.service ?? "—"} · due {p.due_date ?? "—"}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">{p.status}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${p.progress}%` }} /></div>
      <p className="mt-1 text-xs text-muted-foreground">{p.progress}% complete</p>
      {p.summary && <p className="mt-3 text-sm text-foreground/80">{p.summary}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {([["Repo", p.repo_url], ["Staging", p.staging_url], ["Live", p.live_url]] as const).map(([l, u]) => u && (
          <a key={l} href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted">{l} <ExternalLink className="h-3 w-3" /></a>
        ))}
      </div>
      <ProjectConnections projectId={p.id} />
    </div>
  );
}

export function TasksSection({ staff }: { staff: StaffMember }) {
  const { rows, loading, reload } = useStaffRows<{ id: string; title: string; status: string; priority: string; due_date: string | null; description: string | null }>("staff_tasks", staff.id, { orderBy: "created_at" });
  async function setStatus(id: string, status: string) {
    await supabase.from("staff_tasks").update({ status }).eq("id", id);
    reload();
  }
  return (
    <>
      <StaffHeading title="My tasks" subtitle="Tasks assigned by admin or your project manager." />
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : rows.length === 0 ? <StaffEmpty label="No tasks assigned." /> : (
        <div className="space-y-2">
          {rows.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="font-bold text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.priority} priority · due {t.due_date ?? "—"}</p>
              </div>
              <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} className="rounded-xl border border-border bg-background px-2 py-1.5 text-xs font-semibold">
                {["todo", "in_progress", "review", "done"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function ChatSection() {
  return (
    <>
      <StaffHeading title="Team chat" subtitle="1-to-1 and group conversations — search by name, email or AM ID." />
      <div className="h-[calc(100vh-12rem)] min-h-[500px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Suspense fallback={<div className="grid h-full place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
          <ChatPanel />
        </Suspense>
      </div>
    </>
  );
}

export interface Col {
  key: string;
  label: string;
  type?: "text" | "number" | "url" | "date" | "datetime" | "textarea" | "select" | "bool";
  options?: string[];
  required?: boolean;
  /** show inline editor in the list */
  inline?: boolean;
}

/** Project-scoped CRUD table used by every department's own work modules. */
export function RecordsSection({
  staff, table, title, subtitle, cols, withStaff = true, titleKey,
}: {
  staff: StaffMember; table: string; title: string; subtitle?: string; cols: Col[]; withStaff?: boolean; titleKey: string;
}) {
  const { projects, projectIds } = useMyProjects(staff.id);
  const { rows, loading, reload } = useProjectScopedRows<Record<string, unknown> & { id: string }>(table, projectIds);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const projName = (id: unknown) => projects.find((p) => p.id === id)?.title ?? "—";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_id) { setErr("Select a project."); return; }
    setBusy(true); setErr(null);
    try {
      const values: Record<string, unknown> = {};
      for (const c of cols) {
        const v = form[c.key];
        if (v === undefined || v === "") continue;
        values[c.key] = c.type === "number" ? Number(v) : v;
      }
      values.project_id = form.project_id;
      if (withStaff) values.staff_id = staff.id;
      await insertRow(table, values);
      setForm({}); setOpen(false); reload();
    } catch (e2) { setErr((e2 as Error).message); }
    setBusy(false);
  }

  async function inlineUpdate(id: string, key: string, value: unknown) {
    try { await updateRow(table, id, { [key]: value }); reload(); } catch (e2) { alert((e2 as Error).message); }
  }

  return (
    <>
      <StaffHeading title={title} subtitle={subtitle} right={
        projects.length > 0 && <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Add</button>
      } />
      {projects.length === 0 && <StaffEmpty label="You need an assigned project before adding records here." />}
      {open && (
        <form onSubmit={save} className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Project *</label>
            <select value={String(form.project_id ?? "")} onChange={(e) => setForm({ ...form, project_id: e.target.value })} className={inputCls}>
              <option value="">Select…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {cols.map((c) => (
            <div key={c.key} className={c.type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="text-xs font-semibold text-muted-foreground">{c.label}{c.required && " *"}</label>
              <Field col={c} value={form[c.key]} onChange={(v) => setForm({ ...form, [c.key]: v })} />
            </div>
          ))}
          {err && <p className="text-xs font-semibold text-destructive sm:col-span-2">{err}</p>}
          <div className="sm:col-span-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">{busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save</button></div>
        </form>
      )}
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : rows.length === 0 ? (projects.length > 0 && <StaffEmpty label="No records yet." />) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{String(r[titleKey] ?? "Untitled")}</p>
                  <p className="text-xs text-muted-foreground">{projName(r.project_id)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {cols.filter((c) => c.inline).map((c) => c.type === "bool" ? (
                    <label key={c.key} className="inline-flex items-center gap-1 text-xs font-semibold"><input type="checkbox" checked={!!r[c.key]} onChange={(e) => inlineUpdate(r.id, c.key, e.target.checked)} /> {c.label}</label>
                  ) : c.type === "number" ? (
                    <input key={c.key} type="number" defaultValue={String(r[c.key] ?? "")} title={c.label} placeholder={c.label}
                      onBlur={(e) => e.target.value !== String(r[c.key] ?? "") && inlineUpdate(r.id, c.key, e.target.value === "" ? null : Number(e.target.value))}
                      className="w-24 rounded-xl border border-border bg-background px-2 py-1.5 text-xs" />
                  ) : (
                    <select key={c.key} value={String(r[c.key] ?? "")} title={c.label} onChange={(e) => inlineUpdate(r.id, c.key, e.target.value)} className="rounded-xl border border-border bg-background px-2 py-1.5 text-xs font-semibold">
                      {(c.options ?? []).map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                    </select>
                  ))}
                  <button onClick={async () => { if (confirm("Delete this record?")) { try { await deleteRow(table, r.id); reload(); } catch (e2) { alert((e2 as Error).message); } } }} className="grid h-8 w-8 place-items-center rounded-xl border border-border text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {cols.filter((c) => !c.inline && c.key !== titleKey && r[c.key] != null && r[c.key] !== "").map((c) => (
                  <span key={c.key}><b className="text-foreground/70">{c.label}:</b>{" "}
                    {c.type === "url" ? <a href={String(r[c.key])} target="_blank" rel="noreferrer" className="text-primary underline">open</a> : String(r[c.key])}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Field({ col, value, onChange }: { col: Col; value: unknown; onChange: (v: unknown) => void }) {
  const v = value === undefined || value === null ? "" : String(value);
  if (col.type === "textarea") return <textarea rows={3} value={v} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
  if (col.type === "select") return (
    <select value={v} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">Default</option>
      {(col.options ?? []).map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
    </select>
  );
  if (col.type === "bool") return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
  const type = col.type === "number" ? "number" : col.type === "url" ? "url" : col.type === "date" ? "date" : col.type === "datetime" ? "datetime-local" : "text";
  return <input type={type} required={col.required} value={v} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}

/** Department dashboard: real counts from the database. */
export function OverviewSection({ staff, deptName, counters }: { staff: StaffMember; deptName: string; counters: { table: string; label: string; filter?: [string, string] }[] }) {
  const { projects, projectIds } = useMyProjects(staff.id);
  const tasks = useStaffRows<{ id: string; status: string }>("staff_tasks", staff.id);
  return (
    <>
      <StaffHeading title={`${deptName} dashboard`} subtitle={`Welcome, ${staff.name}${staff.am_id ? ` · ${staff.am_id}` : ""}`} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Assigned projects" value={projects.length} />
        <Stat label="Open tasks" value={tasks.rows.filter((t) => t.status !== "done").length} />
        {counters.map((c) => <Counter key={c.table + c.label} {...c} projectIds={projectIds} />)}
      </div>
      <h2 className="mt-8 mb-3 font-display text-lg font-black text-foreground">Projects</h2>
      {projects.length === 0 ? <StaffEmpty label="No projects assigned yet." /> : (
        <div className="grid gap-4 md:grid-cols-2">{projects.slice(0, 4).map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      )}
    </>
  );
}

function Counter({ table, label, filter, projectIds }: { table: string; label: string; filter?: [string, string]; projectIds: string[] }) {
  const { rows } = useProjectScopedRows<Record<string, unknown>>(table, projectIds);
  const n = filter ? rows.filter((r) => String(r[filter[0]]) === filter[1]).length : rows.length;
  return <Stat label={label} value={n} />;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-3xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
