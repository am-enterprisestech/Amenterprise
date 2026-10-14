import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { useState } from "react";
import { ListChecks, LayoutGrid, List, Clock, User, Flag, CheckCircle2, Loader2, AlertCircle, Circle, ArrowDownUp } from "lucide-react";

export const Route = createFileRoute("/clients/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — AM Enterprises Client Portal" },
      { name: "description", content: "Track all your project tasks, priorities and due dates." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Tasks clientId={client.id} />}</PortalShell>,
});

interface Task { id: string; title: string; description: string | null; status: string; priority: string; progress: number; assignee: string | null; due_date: string | null }

const COLUMNS = [
  { key: "todo",        label: "To Do",       icon: Circle,        color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
  { key: "in_progress", label: "In Progress",  icon: Loader2,       color: "text-blue-600",  bg: "bg-blue-50 border-blue-200" },
  { key: "review",      label: "In Review",    icon: AlertCircle,   color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  { key: "done",        label: "Completed",    icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
];

const PRIORITY_META: Record<string, { cls: string; dot: string; label: string }> = {
  urgent: { cls: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Urgent" },
  high:   { cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "High" },
  medium: { cls: "bg-blue-100 text-blue-700", dot: "bg-blue-400", label: "Medium" },
  low:    { cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400", label: "Low" },
};

function isOverdue(t: Task) {
  return t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
}

function Tasks({ clientId }: { clientId: string }) {
  const { rows, loading } = usePortalRows<Task>("client_tasks", clientId, { orderBy: "created_at" });
  const [view, setView] = useState<"board" | "list">("board");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState<"due_date" | "priority" | "status">("due_date");

  const openTasks = rows.filter((t) => t.status !== "done");
  const overdue = rows.filter(isOverdue);
  const done = rows.filter((t) => t.status === "done");

  const filtered = rows
    .filter((t) => filterPriority === "all" || t.priority === filterPriority)
    .sort((a, b) => {
      if (sortBy === "due_date") return (a.due_date ?? "9999") > (b.due_date ?? "9999") ? 1 : -1;
      if (sortBy === "priority") {
        const order = ["urgent", "high", "medium", "low"];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      }
      return 0;
    });

  return (
    <div>
      <PortalHeading
        title="Tasks"
        subtitle={`${openTasks.length} open · ${done.length} completed`}
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-border p-0.5">
              {(["board", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {v === "board" ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "Open Tasks", val: openTasks.length, icon: ListChecks, bg: "bg-indigo-50 border-indigo-200 text-indigo-700" },
          { label: "Overdue", val: overdue.length, icon: Clock, bg: overdue.length > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-600" },
          { label: "In Progress", val: rows.filter((t) => t.status === "in_progress").length, icon: Loader2, bg: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Completed", val: done.length, icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map(({ label, val, icon: Icon, bg }) => (
          <div key={label} className={`flex items-center gap-3 rounded-2xl border p-4 ${bg}`}>
            <Icon className="h-6 w-6 shrink-0 opacity-70" />
            <div><p className="text-xl font-black">{val}</p><p className="text-[10px] font-semibold uppercase tracking-widest">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Priority:</span>
        {["all", "urgent", "high", "medium", "low"].map((p) => (
          <button key={p} onClick={() => setFilterPriority(p)}
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition-colors ${filterPriority === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>
            {p}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border px-3 py-1">
          <ArrowDownUp className="h-3 w-3 text-muted-foreground" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs font-semibold text-muted-foreground bg-transparent outline-none">
            <option value="due_date">Sort: Due date</option>
            <option value="priority">Sort: Priority</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted"><ListChecks className="h-8 w-8 text-muted-foreground/50" /></div>
          <p className="font-display text-lg font-black text-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground">Tasks assigned to you will appear here</p>
        </div>
      ) : view === "board" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            const items = filtered.filter((t) => (t.status || "todo") === col.key);
            return (
              <div key={col.key} className={`rounded-3xl border p-4 ${col.bg}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${col.color}`} />
                    <p className={`text-xs font-black uppercase tracking-widest ${col.color}`}>{col.label}</p>
                  </div>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/80 text-[10px] font-black text-foreground shadow-sm">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((t) => <TaskCard key={t.id} task={t} />)}
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-muted-foreground/20 py-6 text-center">
                      <p className="text-xs text-muted-foreground">Nothing here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assignee</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => {
                const pm = PRIORITY_META[t.priority] ?? PRIORITY_META.medium;
                const overdue = isOverdue(t);
                return (
                  <tr key={t.id} className={`hover:bg-muted/30 transition-colors ${overdue ? "bg-red-50/50" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-foreground">{t.title}</p>
                      {t.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${pm.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pm.dot}`} />{pm.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold text-muted-foreground capitalize">{t.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-5 py-3">
                      {t.assignee ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />{t.assignee}
                        </span>
                      ) : <span className="text-xs text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {t.due_date ? (
                        <span className={`inline-flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-bold" : "text-muted-foreground"}`}>
                          <Clock className="h-3 w-3" />{new Date(t.due_date).toLocaleDateString()}
                          {overdue && " ⚠️"}
                        </span>
                      ) : <span className="text-xs text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{t.progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const pm = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
  const overdue = isOverdue(task);
  return (
    <div className={`rounded-2xl border bg-white p-3 shadow-sm hover:shadow-md transition-all ${overdue ? "border-red-300" : "border-white"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-bold text-foreground leading-snug flex-1">{task.title}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase inline-flex items-center gap-1 ${pm.cls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${pm.dot}`} />
          {pm.label}
        </span>
      </div>
      {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${task.progress}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">{task.progress}%</span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        {task.assignee && <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{task.assignee}</span>}
        {task.due_date && (
          <span className={`flex items-center gap-1 ml-auto ${overdue ? "text-red-600 font-bold" : ""}`}>
            <Clock className="h-2.5 w-2.5" />
            {new Date(task.due_date).toLocaleDateString()}
            {overdue && " ⚠️"}
          </span>
        )}
      </div>
    </div>
  );
}
